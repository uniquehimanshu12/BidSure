import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { BidCase, ComplianceFinding, ExceptionPriorityGroup } from '../models/types';

interface ExceptionPrioritizationPanelProps {
  bidCase: BidCase;
  onSelectFinding: (findingId: string) => void;
}

export const ExceptionPrioritizationPanel: React.FC<ExceptionPrioritizationPanelProps> = ({
  bidCase,
  onSelectFinding,
}) => {
  // Categorize findings into objective priority groups
  const actionRequiredFindings = bidCase.findings.filter(
    (f) =>
      f.status === 'INCONSISTENT' ||
      f.status === 'EXPIRED_INVALID' ||
      f.status === 'ACTION_REQUIRED'
  );

  const manualReviewFindings = bidCase.findings.filter(
    (f) =>
      f.status === 'NEEDS_REVIEW' ||
      f.status === 'NEEDS_MANUAL_REVIEW' ||
      f.status === 'MISSING' ||
      (f.confidence < 0.8 && f.status !== 'VERIFIED' && f.status !== 'VERIFIED_AFTER_NORMALIZATION')
  );

  const informationalFindings = bidCase.findings.filter(
    (f) =>
      f.status === 'VERIFIED' ||
      f.status === 'VERIFIED_AFTER_NORMALIZATION' ||
      f.status === 'NOT_APPLICABLE'
  );

  const totalRequirements = bidCase.findings.length;
  const verifiedCount = informationalFindings.length;
  const actionCount = actionRequiredFindings.length;
  const reviewCount = manualReviewFindings.length;

  const [activeTab, setActiveTab] = useState<ExceptionPriorityGroup>(
    actionCount > 0 ? 'ACTION_REQUIRED' : 'MANUAL_REVIEW'
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5 text-xs text-slate-200">
      {/* 1. COMPLIANCE INTELLIGENCE SUMMARY PANEL */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              Procurement Officer Intelligence Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated audit breakdown answering: <strong>"What requires the officer's attention?"</strong>
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Tender Threshold: Local Content ≥ {bidCase.requiredLocalContentPercentage ?? 20}%
          </span>
        </div>

        {/* 6 Metric Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tender Analysis</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{totalRequirements} Requirements</div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-emerald-400 uppercase">Bidder Verification</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{verifiedCount} Verified</div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-amber-500/30 text-center">
            <div className="text-[10px] font-bold text-amber-400 uppercase">Officer Attention</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{reviewCount} Pending</div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-amber-400 uppercase">Manual Reviews</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{reviewCount} Pending</div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-rose-500/30 text-center">
            <div className="text-[10px] font-bold text-rose-400 uppercase">Critical Exceptions</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">{actionCount} Critical</div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-300 uppercase">Entity Consistency</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">
              {actionRequiredFindings.some((f) => f.requirementId === 'REQ-NAME-04') ? 'MISMATCH' : 'MATCH'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICER EXCEPTION PRIORITIZATION QUEUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
            Prioritized Officer Exception Queue
          </h4>

          {/* Priority Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab('ACTION_REQUIRED')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'ACTION_REQUIRED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Exceptions ({actionCount})
            </button>

            <button
              onClick={() => setActiveTab('MANUAL_REVIEW')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'MANUAL_REVIEW'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Manual Review ({reviewCount})
            </button>

            <button
              onClick={() => setActiveTab('INFORMATIONAL')}
              className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'INFORMATIONAL'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified ({verifiedCount})
            </button>
          </div>
        </div>

        {/* Tab Content List */}
        <div className="space-y-2">
          {activeTab === 'ACTION_REQUIRED' && actionRequiredFindings.length === 0 && (
            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-center text-emerald-400 font-semibold">
              No critical exceptions requiring officer action.
            </div>
          )}

          {activeTab === 'MANUAL_REVIEW' && manualReviewFindings.length === 0 && (
            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-center text-slate-400">
              No pending manual reviews for this bid.
            </div>
          )}

          {(activeTab === 'ACTION_REQUIRED'
            ? actionRequiredFindings
            : activeTab === 'MANUAL_REVIEW'
            ? manualReviewFindings
            : informationalFindings
          ).map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding.id)}
              className="p-3.5 bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-lg cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <span>{finding.requirementTitle}</span>
                  <span className="font-mono text-[10px] text-blue-400">({finding.ruleApplied})</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    finding.status === 'VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : finding.status === 'INCONSISTENT' || finding.status === 'EXPIRED_INVALID' || finding.status === 'MISSING'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {finding.status}
                </span>
              </div>

              {/* Detailed Exception Explanation Breakdown */}
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800/80 text-[11px] space-y-1 text-slate-300">
                <p>{finding.reason}</p>
                <p className="text-amber-300 font-semibold mt-1">
                  <strong>Recommended Action:</strong> {finding.recommendedAction}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>
                  Verification Source: <strong className="text-slate-400">{finding.source?.name || 'Synthetic bidder document'}</strong>
                </span>
                <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5">
                  Inspect Requirement Evidence <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
