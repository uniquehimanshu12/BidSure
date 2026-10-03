import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  History,
  Printer,
  ChevronRight,
  Sparkles,
  Layers,
  FlaskConical,
  Cpu,
  Sliders,
  Share2,
} from 'lucide-react';
import { BidCase, ComplianceFinding, ComplianceStatus, TenderConfig } from '../models/types';
import { DETERMINISTIC_TEST_CASES } from '../data/testCases';
import { EntityRelationshipGraph } from '../components/EntityRelationshipGraph';
import { ExceptionPrioritizationPanel } from '../components/ExceptionPrioritizationPanel';
import { TenderRequirementsBuilder } from '../components/TenderRequirementsBuilder';

interface VerificationWorkspacePageProps {
  bidCase: BidCase;
  onBack: () => void;
  onOverrideFinding: (findingId: string, newStatus: ComplianceStatus, remarks: string) => void;
  onOpenReport: () => void;
  onUpdateTenderConfig?: (updatedConfig: TenderConfig) => void;
}

export const VerificationWorkspacePage: React.FC<VerificationWorkspacePageProps> = ({
  bidCase,
  onBack,
  onOverrideFinding,
  onOpenReport,
  onUpdateTenderConfig,
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    bidCase.findings[0]?.id || ''
  );
  const [overrideModalFinding, setOverrideModalFinding] = useState<ComplianceFinding | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('VERIFIED');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'GRAPH' | 'TENDER_CONFIG'>('WORKSPACE');

  const activeFinding = bidCase.findings.find((f) => f.id === selectedFindingId) || bidCase.findings[0];
  const verifiedCount = bidCase.findings.filter(
    (f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION'
  ).length;

  const handleOpenOverride = (finding: ComplianceFinding) => {
    setOverrideModalFinding(finding);
    setOverrideStatus('VERIFIED');
    setOverrideRemarks('');
  };

  const handleSaveOverride = () => {
    if (overrideModalFinding && overrideRemarks.trim()) {
      onOverrideFinding(overrideModalFinding.id, overrideStatus, overrideRemarks);
      setOverrideModalFinding(null);
    }
  };

  // Build tender config object for TenderRequirementsBuilder
  const currentTenderConfig: TenderConfig = {
    tenderId: bidCase.tenderId,
    tenderTitle: bidCase.tenderTitle,
    procuringOrganization: bidCase.organization,
    department: 'Procurement Division',
    requiredLocalContentPercentage: bidCase.requiredLocalContentPercentage ?? 20,
    isOemAuthRequired: true,
    requiredDocuments: ['GST_CERTIFICATE', 'PAN_CARD', 'UDYAM_MSME', 'MAKE_IN_INDIA_DECLARATION', 'OEM_AUTHORIZATION', 'EPFO_ESIC'],
    optionalDocuments: ['INCOME_TAX_ITR', 'STARTUP_INDIA', 'NSIC_CERTIFICATE'],
    validityDaysRequired: 365,
    requirements: bidCase.requirements.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.title,
      category: r.category,
      description: r.description,
      required: r.isMandatory,
      ruleType: r.ruleType,
      threshold: bidCase.requiredLocalContentPercentage ?? 20,
    })),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Back to Active Verifications"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-blue-400 font-semibold">
              <span>{bidCase.tenderId}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{bidCase.organization}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">Tender Local Content Req: ≥ {bidCase.requiredLocalContentPercentage ?? 20}%</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">{bidCase.tenderTitle}</h2>
          </div>
        </div>

        {/* Action Controls & Mode Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Workspace Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800">
            <button
              onClick={() => setActiveTab('WORKSPACE')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'WORKSPACE'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Compliance Matrix
            </button>

            <button
              onClick={() => setActiveTab('GRAPH')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'GRAPH'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Entity Relationship Map
            </button>

            <button
              onClick={() => setActiveTab('TENDER_CONFIG')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'TENDER_CONFIG'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Tender Rules Config
            </button>
          </div>

          <button
            onClick={() => setShowTestCaseModal(true)}
            className="px-3 py-1.5 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FlaskConical className="w-4 h-4 text-purple-400" />
            Test Bench Cases
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Generate Official Report
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: TENDER CONFIGURATION BUILDER */}
      {activeTab === 'TENDER_CONFIG' && (
        <TenderRequirementsBuilder
          tenderConfig={currentTenderConfig}
          onSaveConfig={(updated) => {
            if (onUpdateTenderConfig) onUpdateTenderConfig(updated);
            setActiveTab('WORKSPACE');
          }}
        />
      )}

      {/* VIEW TAB 2: ENTITY RELATIONSHIP GRAPH */}
      {activeTab === 'GRAPH' && <EntityRelationshipGraph bidCase={bidCase} />}

      {/* VIEW TAB 3: 3-COLUMN COMPLIANCE INTELLIGENCE WORKSPACE */}
      {activeTab === 'WORKSPACE' && (
        <div className="space-y-6">
          {/* COMPLIANCE INTELLIGENCE & EXCEPTION PRIORITIZATION PANEL */}
          <ExceptionPrioritizationPanel
            bidCase={bidCase}
            onSelectFinding={(id) => setSelectedFindingId(id)}
          />

          {/* 3-COLUMN WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: CASE & BIDDER SUMMARY (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Bidder Profile
                </h3>

                <div>
                  <div className="text-xs font-bold text-slate-100">{(!bidCase.bidder.legalName || bidCase.bidder.legalName.includes('Not extracted')) ? 'Not extracted from submitted documents' : bidCase.bidder.legalName}</div>
                  <div className="text-[11px] text-slate-400">Trade: {bidCase.bidder.tradeName || 'Not declared'}</div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">GSTIN:</span>
                    <span className="font-semibold text-slate-200">{bidCase.bidder.gstin || 'Not extracted'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">PAN:</span>
                    <span className="font-semibold text-slate-200">{bidCase.bidder.panNumber || 'Not extracted'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Udyam:</span>
                    <span className="font-semibold text-slate-200">{bidCase.bidder.udyamNumber || 'Not submitted'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-emerald-400 font-bold">{bidCase.bidder.category ? `${bidCase.bidder.category} Enterprise` : 'Not evaluated'}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <p><strong>Address:</strong> {bidCase.bidder.registeredAddress || 'Not submitted'}</p>
                  <p><strong>Contact:</strong> {bidCase.bidder.contactEmail || 'Not submitted'}</p>
                </div>
              </div>

              {/* Documents Submitted */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  Submitted Documents ({bidCase.documents.length})
                </h3>
                <div className="space-y-2">
                  {bidCase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-slate-950/80 border border-slate-800 rounded hover:border-slate-700 transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-slate-200 truncate">{doc.fileName}</div>
                          <div className="text-[10px] text-slate-400">{doc.fileSize} • Confidence {(doc.confidenceScore * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Officer */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                  Assigned Procurement Officer (Demo Simulation)
                </div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  {bidCase.assignedOfficer?.includes('[Demo') || bidCase.assignedOfficer?.includes('Demo')
                    ? bidCase.assignedOfficer
                    : `${bidCase.assignedOfficer} [Demo Profile]`}
                </div>
              </div>
            </div>

            {/* COLUMN 2: COMPLIANCE REQUIREMENTS MATRIX (5 cols - Compact & Highly Scannable) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Statutory Compliance Matrix ({bidCase.findings.length} Checks)
                  </h3>
                  <span className="text-xs font-bold text-blue-400">{verifiedCount}/{bidCase.findings.length} Verified</span>
                </div>

                {/* Scannable Compact Requirement Matrix */}
                <div className="space-y-2">
                  {bidCase.findings.map((finding) => {
                    const isSelected = finding.id === selectedFindingId;
                    return (
                      <div
                        key={finding.id}
                        onClick={() => setSelectedFindingId(finding.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-slate-100">
                            {finding.requirementTitle}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase shrink-0 ${
                              finding.status === 'VERIFIED' || finding.status === 'VERIFIED_AFTER_NORMALIZATION'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : finding.status === 'INCONSISTENT' || finding.status === 'EXPIRED_INVALID' || finding.status === 'MISSING' || finding.status === 'ACTION_REQUIRED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {finding.status === 'INCONSISTENT' ? 'ACTION REQUIRED' : finding.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 font-mono truncate">
                          Evidence: <span className="text-amber-200 font-semibold">{finding.extractedValue || (finding.status === 'MISSING' ? 'Not available (Unsubmitted)' : 'Not extracted')}</span>
                          <span className="text-slate-500 ml-2">• Rule: {finding.ruleApplied}</span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[240px]">{finding.reason}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenOverride(finding);
                            }}
                            className="text-blue-400 hover:text-blue-300 font-semibold underline shrink-0 ml-2"
                          >
                            Officer Action / Remark
                          </button>
                        </div>

                        {finding.officerOverride && (
                          <div className="mt-2 p-1.5 bg-blue-950/40 border border-blue-500/30 rounded text-[10px] text-blue-300">
                            <strong>Officer Remark:</strong> {finding.officerOverride.remarks} ({finding.officerOverride.overriddenBy})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 3: REASONING CHAIN & EVIDENCE CONTEXT VIEWER (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {activeFinding ? (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 sticky top-20">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-400" />
                      Evidence & Reasoning Chain
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeFinding.status === 'MISSING' || !activeFinding.confidence
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : activeFinding.confidence >= 0.85
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : activeFinding.confidence >= 0.6
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {activeFinding.status === 'MISSING' || !activeFinding.confidence
                        ? 'Confidence: Not applicable'
                        : `Confidence: ${(activeFinding.confidence * 100).toFixed(0)}%`}
                    </span>
                  </div>

                  {/* REASONING CHAIN FLOW */}
                  <div className="p-3 bg-slate-950 rounded border border-blue-500/40 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase text-blue-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Verification Logic Chain:
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">1. REQUIREMENT:</span> <strong className="text-slate-200">{activeFinding.requirementTitle}</strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">2. RULE APPLIED:</span> <span className="text-blue-300">{activeFinding.ruleApplied}</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">3. EXTRACTED VALUE:</span>{' '}
                        <span className="text-amber-200 font-bold">
                          {activeFinding.extractedValue || (activeFinding.status === 'MISSING' ? 'Not available (Unsubmitted document)' : 'Not extracted')}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">4. SOURCE DOCUMENT:</span>{' '}
                        <span className="text-slate-200 font-semibold">
                          {activeFinding.evidenceList?.[0]?.documentName ||
                            (activeFinding.status === 'MISSING'
                              ? 'No submitted document'
                              : 'Not attached')}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">5. PAGE / LOCATION:</span>{' '}
                        <span className="text-slate-300">
                          {activeFinding.evidenceList?.[0]?.pageNumber
                            ? `Page ${activeFinding.evidenceList[0].pageNumber}`
                            : activeFinding.status === 'MISSING'
                            ? 'Not applicable'
                            : 'Page/coordinate: Not available'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">6. VERIFICATION RESULT:</span>{' '}
                        <span
                          className={`font-bold ${
                            activeFinding.status === 'VERIFIED' || activeFinding.status === 'VERIFIED_AFTER_NORMALIZATION'
                              ? 'text-emerald-400'
                              : activeFinding.status === 'MISSING' || activeFinding.status === 'INCONSISTENT' || activeFinding.status === 'EXPIRED_INVALID'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {activeFinding.status === 'INCONSISTENT' ? 'ACTION REQUIRED' : activeFinding.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">7. AUDIT FINDING:</span> <span className="text-slate-200">{activeFinding.reason}</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded font-mono">
                        <span className="text-slate-400">8. OFFICER ACTION:</span> <span className="text-amber-200">{activeFinding.recommendedAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Normalized Entity Comparison Breakdown */}
                  {activeFinding.comparedValuesBreakdown && (
                    <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded text-xs space-y-1.5">
                      <div className="text-[10px] font-bold uppercase text-blue-400 flex items-center justify-between">
                        <span>Cross-Document Entity Comparison</span>
                        <span className="font-mono text-[9px] text-emerald-400">{activeFinding.comparedValuesBreakdown.normalizationStatus}</span>
                      </div>
                      <div className="space-y-1 text-[11px] font-mono text-slate-300">
                        <div>Source 1 ({activeFinding.comparedValuesBreakdown.sourceA}): <strong className="text-slate-100">{activeFinding.comparedValuesBreakdown.valueA}</strong></div>
                        <div>Source 2 ({activeFinding.comparedValuesBreakdown.sourceB}): <strong className="text-slate-100">{activeFinding.comparedValuesBreakdown.valueB}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded text-xs space-y-1">
                    <div className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Recommended Officer Action:
                    </div>
                    <p className="text-amber-200/90 text-[11px]">{activeFinding.recommendedAction}</p>
                  </div>

                  {/* Evidence Snippets */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-2">
                      Document Evidence Citations ({activeFinding.evidenceList.length})
                    </h4>

                    {activeFinding.evidenceList.length === 0 ? (
                      <div className="p-4 bg-slate-950 rounded border border-slate-800 text-slate-400 text-xs text-center space-y-1">
                        <p className="font-semibold text-slate-300">
                          {activeFinding.status === 'MISSING'
                            ? 'No physical document submitted for this requirement.'
                            : 'No document-level citations established.'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {activeFinding.status === 'MISSING'
                            ? 'Requirement marked missing based on statutory document presence check.'
                            : 'Requires manual verification by authorized procurement officer.'}
                        </p>
                      </div>
                    ) : (
                      activeFinding.evidenceList.map((ev, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-950/90 border border-blue-500/40 rounded-md space-y-2 text-xs mb-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-blue-400">{ev.documentName}</span>
                            <span className="text-slate-400 font-mono">
                              {ev.pageNumber ? `Page ${ev.pageNumber}` : 'Page-level evidence unavailable'}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-amber-200/90 leading-relaxed italic">
                            "{ev.extractedSnippet}"
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Extracted Field Match: <span className="text-slate-200 font-bold">{ev.matchedFieldValue}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Verification Source Citation */}
                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Source: <strong>{activeFinding.source.name}</strong></span>
                    <span className="text-emerald-400 uppercase font-semibold">
                      {activeFinding.source.type === 'SIMULATED_GOVT_API'
                        ? 'Synthetic Dataset Evidence'
                        : activeFinding.source.type === 'GEMINI_AI'
                        ? 'Document evidence extracted from synthetic demonstration dataset'
                        : activeFinding.source.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg text-center text-slate-500 text-xs">
                  Select a requirement check to view evidence citations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Verification Audit Trail & Officer Remarks
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {bidCase.auditTrail.map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <span className="text-blue-400 font-bold">{entry.action}</span>
                  <span className="text-slate-500">•</span>
                  <span>{entry.userName} ({entry.userRole})</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{entry.details}</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 shrink-0">
                {new Date(entry.timestamp).toLocaleString('en-GB')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICER OVERRIDE MODAL */}
      {overrideModalFinding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Officer Status Override & Remarks
            </h3>

            <p className="text-xs text-slate-400">
              Requirement: <strong>{overrideModalFinding.requirementTitle}</strong>
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">New Compliance Status:</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="VERIFIED">VERIFIED (Accepted with Officer Justification)</option>
                <option value="NEEDS_REVIEW">NEEDS REVIEW (Refer to Higher Committee)</option>
                <option value="INCONSISTENT">INCONSISTENT (Reject / Issue Clarification)</option>
                <option value="NOT_APPLICABLE">NOT APPLICABLE (Exempt under Tender Terms)</option>
              </select>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">Officer Remarks & Justification * (Mandatory):</label>
              <textarea
                rows={3}
                placeholder="Enter mandatory officer remarks for statutory audit record..."
                value={overrideRemarks}
                onChange={(e) => setOverrideRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOverrideModalFinding(null)}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                disabled={!overrideRemarks.trim()}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Save Override to Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST BENCH MODAL */}
      {showTestCaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                Statutory Rule Test Bench Scenarios
              </h3>
              <button
                type="button"
                onClick={() => setShowTestCaseModal(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close Bench
              </button>
            </div>

            <div className="space-y-3">
              {DETERMINISTIC_TEST_CASES.map((tc) => (
                <div key={tc.id} className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-400 font-bold">{tc.id}: {tc.testTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tc.expectedStatus === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tc.expectedStatus === 'INCONSISTENT' || tc.expectedStatus === 'EXPIRED_INVALID' || tc.expectedStatus === 'MISSING'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      Expected: {tc.expectedStatus}
                    </span>
                  </div>
                  <p className="text-slate-300">{tc.inputSummary}</p>
                  <p className="text-[11px] text-slate-400 italic font-mono bg-slate-900 p-2 rounded">
                    Rule Tested: {tc.ruleTested}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
