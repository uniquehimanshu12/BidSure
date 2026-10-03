/**
 * SIH26100 GeM Bid Compliance Verification Platform
 * Structured Data Models (Phase 4 Tender-Aware Compliance Intelligence Schema)
 */

export type ComplianceStatus =
  | 'VERIFIED'
  | 'VERIFIED_AFTER_NORMALIZATION'
  | 'ACTION_REQUIRED'
  | 'INCONSISTENT'
  | 'EXPIRED_INVALID'
  | 'MISSING'
  | 'NEEDS_REVIEW'
  | 'NEEDS_MANUAL_REVIEW'
  | 'NOT_APPLICABLE';

export type VerificationMethod =
  | 'FORMAT_VALIDATED'
  | 'REGISTRY_VERIFIED'
  | 'OFFICER_VERIFIED'
  | 'RULES_ENGINE';

export type ExceptionPriorityGroup = 'ACTION_REQUIRED' | 'MANUAL_REVIEW' | 'INFORMATIONAL';

export type CaseOverallStatus =
  | 'DRAFT'
  | 'UNDER_VERIFICATION'
  | 'NEEDS_OFFICER_REVIEW'
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'REJECTED';

export type DocCategory =
  | 'TENDER_DOCUMENT'
  | 'GST_CERTIFICATE'
  | 'PAN_CARD'
  | 'UDYAM_MSME'
  | 'INCOME_TAX_ITR'
  | 'EPFO_ESIC'
  | 'MAKE_IN_INDIA_DECLARATION'
  | 'OEM_AUTHORIZATION'
  | 'STARTUP_INDIA'
  | 'NSIC_CERTIFICATE'
  | 'COMPANY_INCORPORATION'
  | 'DIGILOCKER_DOC'
  | 'OTHER_TENDER_DOC';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole = 'PROCUREMENT_OFFICER' | 'REVIEWER_SUPERVISOR' | 'SYSTEM_ADMIN';

export type EntityNormalizationStatus =
  | 'CONSISTENT'
  | 'CONSISTENT_AFTER_NORMALIZATION'
  | 'POTENTIAL_MISMATCH'
  | 'NEEDS_MANUAL_REVIEW';

export interface StructuredExtractionResult {
  documentType: DocCategory;
  extractionMode?: 'GEMINI_SUCCESS' | 'GEMINI_UNAVAILABLE' | 'EXTRACTION_FAILED';
  entityName?: string;
  gstin?: string;
  pan?: string;
  udyamNumber?: string;
  registrationNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  localContentPercentage?: number;
  signatoryName?: string;
  manufacturerName?: string;
  address?: string;
  certificateNumber?: string;
  authorizationDetails?: string;
  sourceDocument?: string;
  pageNumber?: number;
  evidenceText?: string;
  confidence?: number;
  [key: string]: any;
}

export interface Bidder {
  id: string;
  legalName: string;
  tradeName?: string;
  panNumber: string;
  gstin: string;
  udyamNumber?: string;
  category: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'STARTUP';
  registeredAddress: string;
  contactEmail: string;
  contactPhone: string;
}

export interface TenderRequirementConfig {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  required: boolean;
  ruleType: string;
  threshold?: number;
  evidenceRequirements?: string;
}

export interface TenderConfig {
  tenderId: string;
  tenderTitle: string;
  procuringOrganization: string;
  department: string;
  requiredLocalContentPercentage: number;
  isOemAuthRequired: boolean;
  requiredDocuments: DocCategory[];
  optionalDocuments: DocCategory[];
  validityDaysRequired: number;
  requirements: TenderRequirementConfig[];
}

export interface VerificationSource {
  id: string;
  name: string;
  type: 'SIMULATED_GOVT_API' | 'LOCAL_OCR_RULE' | 'GEMINI_AI' | 'MANUAL_OFFICER';
  status: 'ONLINE_SIMULATED' | 'OFFLINE' | 'VERIFIED_RECORD';
  lastCheckedAt: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  category: DocCategory;
  confidenceScore: number;
  pageCount?: number;
  fileUrl?: string;
  ocrExtractedText?: string;
  extractedFields: Partial<StructuredExtractionResult>;
}

export interface Evidence {
  documentId: string;
  documentName: string;
  docCategory?: DocCategory;
  pageNumber?: number;
  extractedSnippet: string;
  matchedFieldValue: string;
  confidenceScore?: number;
}

export interface ReasoningChain {
  requirement: string;
  document: string;
  extractedEvidence: string;
  rule: string;
  comparison: string;
  result: ComplianceStatus;
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  requirementTitle: string;
  status: ComplianceStatus;
  priorityGroup?: ExceptionPriorityGroup;
  verificationMethod?: VerificationMethod;
  severity: RiskLevel;
  ruleApplied: string;
  confidence: number;
  extractedValue?: string;
  comparedValuesBreakdown?: {
    sourceA: string;
    valueA: string;
    sourceB: string;
    valueB: string;
    normalizationStatus: EntityNormalizationStatus;
  };
  reasoningChain?: ReasoningChain;
  whatWasChecked?: string;
  whatWasFound?: string;
  whyItMatters?: string;
  reason: string;
  recommendedAction: string;
  evidenceList: Evidence[];
  source: VerificationSource;
  officerOverride?: {
    overriddenBy: string;
    overriddenAt: string;
    previousStatus: ComplianceStatus;
    newStatus: ComplianceStatus;
    remarks: string;
  };
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  isMandatory: boolean;
  ruleType:
    | 'REGEX_PATTERN'
    | 'DATE_VALIDITY'
    | 'CROSS_DOC_MATCH'
    | 'NUMERIC_THRESHOLD'
    | 'AI_CLAUSE_CHECK'
    | 'EXPERIENCE_THRESHOLD'
    | 'EXPERIENCE_YEARS'
    | 'NUMERIC_HEADCOUNT'
    | 'CERTIFICATION_CHECK'
    | 'AUTHORIZATION_CHECK'
    | 'FINANCIAL_HEALTH_CHECK'
    | 'DECLARATION_CHECK'
    | 'EMD_CHECK'
    | 'MANDATORY_DOC_PRESENCE'
    | string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  previousState?: string;
  newState?: string;
}

export interface BidCase {
  id: string;
  tenderId: string;
  tenderTitle: string;
  organization: string;
  requiredLocalContentPercentage?: number;
  bidder: Bidder;
  submissionDate: string;
  status: CaseOverallStatus;
  overallComplianceStatus: ComplianceStatus;
  complianceScore: number;
  requirements: ComplianceRequirement[];
  documents: Document[];
  findings: ComplianceFinding[];
  auditTrail: AuditEntry[];
  scenarioLabel?: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'CUSTOM';
  lastUpdated: string;
  assignedOfficer: string;
  officerNotes?: string;
}
