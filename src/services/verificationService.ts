/**
 * SIH26100 GeM Verification Service Abstraction Interface
 * Decouples frontend UI from rule engine, Gemini API, and future Govt APIs
 * Includes localStorage state persistence for seamless judge demo reliability
 */

import { BidCase, ComplianceFinding, Document, ComplianceStatus } from '../models/types';
import { MOCK_BID_CASES, SIMULATED_VERIFICATION_SOURCES } from '../data/mockCases';
import { ruleEngine } from '../rules/ruleEngine';
import { extractionService } from './extractionService';

const STORAGE_KEY = 'BIDSURE_GEM_BID_CASES_V7';

const LEGACY_STORAGE_KEYS = [
  'BIDSURE_GEM_BID_CASES_V1',
  'BIDSURE_GEM_BID_CASES_V2',
  'BIDSURE_GEM_BID_CASES_V3',
  'BIDSURE_GEM_BID_CASES_V4',
  'BIDSURE_GEM_BID_CASES_V5',
  'BIDSURE_GEM_BID_CASES_V6',
  'CPCL_GEM_BID_CASES_V1',
  'CPCL_GEM_BID_CASES_V2',
];

export interface IVerificationService {
  getBidCases(): Promise<BidCase[]>;
  getBidCaseById(id: string): Promise<BidCase | null>;
  createBidCase(newCase: Omit<BidCase, 'id' | 'auditTrail' | 'lastUpdated' | 'findings' | 'complianceScore' | 'overallComplianceStatus'>): Promise<BidCase>;
  runVerification(caseId: string): Promise<BidCase>;
  updateTenderConfig(caseId: string, requiredLocalContentPercentage: number): Promise<BidCase>;
  overrideFinding(
    caseId: string,
    findingId: string,
    newStatus: ComplianceStatus,
    officerRemarks: string,
    officerName: string
  ): Promise<BidCase>;
  classifyUploadedDocument(fileName: string, fileContentSnippet?: string): Promise<{ category: any; confidence: number }>;
  resetToDefaultScenarios(): Promise<BidCase[]>;
}

class MockVerificationService implements IVerificationService {
  private cases: BidCase[] = [];

  constructor() {
    this.cleanupLegacyStorage();
    this.loadFromStorage();
  }

  private cleanupLegacyStorage(): void {
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch {
      // ignore
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BidCase[];
        // Check if stored data contains stale legacy bidder names
        const hasStaleBidder = JSON.stringify(parsed).includes('Southern Piping');
        if (hasStaleBidder) {
          this.cases = [...MOCK_BID_CASES];
          this.saveToStorage();
          return;
        }

        const customCases = parsed.filter((c) => c.scenarioLabel === 'CUSTOM');
        const mergedDefaults = MOCK_BID_CASES.map((defCase) => {
          const stored = parsed.find((c) => c.id === defCase.id);
          if (stored) {
            return {
              ...defCase,
              requiredLocalContentPercentage: defCase.requiredLocalContentPercentage ?? 20,
              status: stored.status || defCase.status,
              assignedOfficer: defCase.assignedOfficer,
              findings: defCase.findings.map((f) => {
                const storedF = stored.findings?.find((sf) => sf.id === f.id);
                if (storedF && storedF.officerOverride) {
                  return { ...f, status: storedF.status, officerOverride: storedF.officerOverride };
                }
                return f;
              }),
              auditTrail: (stored.auditTrail && stored.auditTrail.length > defCase.auditTrail.length)
                ? stored.auditTrail
                : defCase.auditTrail,
            };
          }
          return defCase;
        });
        this.cases = [...customCases, ...mergedDefaults];
        this.saveToStorage();
      } else {
        this.cases = [...MOCK_BID_CASES];
        this.saveToStorage();
      }
    } catch {
      this.cases = [...MOCK_BID_CASES];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cases));
    } catch (err) {
      console.warn('localStorage save warning:', err);
    }
  }

  async resetToDefaultScenarios(): Promise<BidCase[]> {
    this.cases = [...MOCK_BID_CASES];
    this.saveToStorage();
    return Promise.resolve([...this.cases]);
  }

  async getBidCases(): Promise<BidCase[]> {
    return Promise.resolve([...this.cases]);
  }

  async getBidCaseById(id: string): Promise<BidCase | null> {
    const found = this.cases.find((c) => c.id === id);
    return Promise.resolve(found ? { ...found } : null);
  }

  async createBidCase(
    newCaseData: Omit<BidCase, 'id' | 'auditTrail' | 'lastUpdated' | 'findings' | 'complianceScore' | 'overallComplianceStatus'>
  ): Promise<BidCase> {
    const newId = `CASE-2026-00${this.cases.length + 1}`;
    const timestamp = new Date().toISOString();

    const createdCase: BidCase = {
      ...newCaseData,
      id: newId,
      status: 'UNDER_VERIFICATION',
      overallComplianceStatus: 'NEEDS_REVIEW',
      complianceScore: 50,
      findings: [],
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp,
          userId: 'OFFICER-CURRENT',
          userName: 'Procurement Officer',
          userRole: 'PROCUREMENT_OFFICER',
          action: 'BID_CASE_CREATED',
          details: `Created new verification case for Tender ${newCaseData.tenderId} - Bidder ${newCaseData.bidder.legalName}`,
        },
      ],
      lastUpdated: timestamp,
      scenarioLabel: 'CUSTOM',
    };

    // Auto run deterministic check
    const verified = await this.executeRuleEngine(createdCase);
    this.cases.unshift(verified);
    this.saveToStorage();
    return verified;
  }

  async runVerification(caseId: string): Promise<BidCase> {
    const index = this.cases.findIndex((c) => c.id === caseId);
    if (index === -1) throw new Error('Case not found');

    const updated = await this.executeRuleEngine(this.cases[index]);
    this.cases[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async updateTenderConfig(caseId: string, requiredLocalContentPercentage: number): Promise<BidCase> {
    const index = this.cases.findIndex((c) => c.id === caseId);
    if (index === -1) throw new Error('Case not found');

    this.cases[index].requiredLocalContentPercentage = requiredLocalContentPercentage;
    const updated = await this.executeRuleEngine(this.cases[index]);
    this.cases[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async overrideFinding(
    caseId: string,
    findingId: string,
    newStatus: ComplianceStatus,
    officerRemarks: string,
    officerName: string
  ): Promise<BidCase> {
    const targetCase = this.cases.find((c) => c.id === caseId);
    if (!targetCase) throw new Error('Case not found');

    const finding = targetCase.findings.find((f) => f.id === findingId);
    if (!finding) throw new Error('Finding not found');

    const previousStatus = finding.status;
    finding.status = newStatus;
    finding.officerOverride = {
      overriddenBy: officerName,
      overriddenAt: new Date().toISOString(),
      previousStatus,
      newStatus,
      remarks: officerRemarks,
    };

    // Add audit entry
    targetCase.auditTrail.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'OFFICER-CURRENT',
      userName: officerName,
      userRole: 'PROCUREMENT_OFFICER',
      action: 'OFFICER_OVERRIDE',
      details: `Changed requirement "${finding.requirementTitle}" from ${previousStatus} to ${newStatus}. Officer Remarks: ${officerRemarks}`,
      previousState: previousStatus,
      newState: newStatus,
    });

    targetCase.lastUpdated = new Date().toISOString();
    this.saveToStorage();
    return { ...targetCase };
  }

  async classifyUploadedDocument(fileName: string, fileContentSnippet?: string): Promise<{ category: any; confidence: number }> {
    const category = extractionService.classifyDocumentType(fileName, fileContentSnippet);
    return { category, confidence: 0.95 };
  }

  private async executeRuleEngine(bidCase: BidCase): Promise<BidCase> {
    const evaluatedFindings = ruleEngine.evaluateBidCompliance({
      tenderId: bidCase.tenderId,
      submissionDate: bidCase.submissionDate,
      requiredLocalContentPercentage: bidCase.requiredLocalContentPercentage ?? 20,
      bidderLegalName: bidCase.bidder.legalName,
      bidderGstin: bidCase.bidder.gstin,
      bidderPan: bidCase.bidder.panNumber,
      documents: bidCase.documents,
      requirements: bidCase.requirements,
    });

    const passedCount = evaluatedFindings.filter(
      (f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION'
    ).length;
    const total = evaluatedFindings.length || 1;
    const score = Math.round((passedCount / total) * 100);

    let overallStatus: ComplianceStatus = 'VERIFIED';
    if (
      evaluatedFindings.some(
        (f) =>
          f.status === 'INCONSISTENT' ||
          f.status === 'EXPIRED_INVALID' ||
          f.status === 'ACTION_REQUIRED'
      )
    ) {
      overallStatus = 'INCONSISTENT';
    } else if (evaluatedFindings.some((f) => f.status === 'MISSING')) {
      overallStatus = 'MISSING';
    } else if (
      evaluatedFindings.some(
        (f) => f.status === 'NEEDS_REVIEW' || f.status === 'NEEDS_MANUAL_REVIEW'
      )
    ) {
      overallStatus = 'NEEDS_REVIEW';
    }

    return {
      ...bidCase,
      findings: evaluatedFindings,
      complianceScore: score,
      overallComplianceStatus: overallStatus,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const verificationService = new MockVerificationService();
