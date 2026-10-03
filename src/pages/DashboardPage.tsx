import React from 'react';
import {
  Briefcase,
  AlertTriangle,
  FileCheck2,
  Clock,
  ShieldCheck,
  Plus,
  ArrowRight,
  ArrowUpRight,
  FilePlus2,
} from 'lucide-react';
import { BidCase } from '../models/types';
import { TrustNoticeBanner } from '../components/TrustNoticeBanner';

interface DashboardPageProps {
  bidCases: BidCase[];
  onSelectCase: (caseId: string) => void;
  onNavigate: (page: any) => void;
  onSelectScenario: (scenario: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  bidCases,
  onSelectCase,
  onNavigate,
}) => {
  const activeCasesCount = bidCases.length;

  const totalFindings = bidCases.flatMap((c) => c.findings);
  const totalVerified = totalFindings.filter(
    (f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION'
  ).length;
  const totalFindingsCount = totalFindings.length || 1;
  const verifiedPercentage = Math.round((totalVerified / totalFindingsCount) * 100);

  const totalPendingReviews = totalFindings.filter(
    (f) => f.status === 'NEEDS_REVIEW' || f.status === 'NEEDS_MANUAL_REVIEW' || f.status === 'MISSING'
  ).length;

  const totalCriticalExceptions = totalFindings.filter(
    (f) => f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'ACTION_REQUIRED'
  ).length;

  const pendingCasesCount = bidCases.filter(
    (c) =>
      c.status === 'NEEDS_OFFICER_REVIEW' ||
      c.overallComplianceStatus === 'NEEDS_REVIEW' ||
      c.overallComplianceStatus === 'INCONSISTENT'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <TrustNoticeBanner />

      {/* Hero Header & Primary CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            BidSure Decision Support Platform
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Bid Compliance Verification
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            BidSure assists procurement officers by cross-referencing tender requirements against bidder submissions to extract evidence, highlight compliance discrepancies, and generate statutory verification reports.
          </p>
        </div>

        {/* DOMINANT PRIMARY CTA */}
        <button
          onClick={() => onNavigate('new-verification')}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>+ Start New Verification</span>
        </button>
      </div>

      {/* Summary Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tender Analysis</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalFindingsCount} Requirements</div>
          <p className="text-[11px] text-slate-400 mt-1">{totalFindingsCount} Evidence Requirements Identified</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bidder Verification</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalVerified} Verified</div>
          <p className="text-[11px] text-slate-400 mt-1">{totalPendingReviews} Pending Evidence • {totalCriticalExceptions} Confirmed Non-Compliant</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Officer Attention</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{totalPendingReviews} Pending Reviews</div>
          <p className="text-[11px] text-amber-400/90 mt-1">{totalPendingReviews} requirement(s) pending human-in-the-loop review</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Exceptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{totalCriticalExceptions} Critical</div>
          <p className="text-[11px] text-slate-400 mt-1">{totalCriticalExceptions > 0 ? `${totalCriticalExceptions} Document Discrepancies` : '0 Confirmed Non-Compliant'}</p>
        </div>
      </div>

      {/* Semantic Pipeline Breakdown: Tender Analysis vs Bidder Verification vs Officer Attention */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="border-b border-slate-800 pb-2 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Procurement Audit & Verification State Breakdown
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Distinguishing GeM tender requirements extraction from submitted bidder evidence verification
            </p>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold">
            {totalVerified}/{totalFindingsCount} Verified from submitted bidder evidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Tender Analysis</span>
              <span className="text-[10px] font-mono text-slate-400">Tender Ingestion</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Requirements Extracted:</span>
                <span className="font-bold text-slate-100">{totalFindingsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Evidence Requirements Identified:</span>
                <span className="font-bold text-slate-100">{totalFindingsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tender Documents:</span>
                <span className="font-bold text-slate-100">{bidCases.reduce((acc, c) => acc + c.documents.length, 0)}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Bidder Verification</span>
              <span className="text-[10px] font-mono text-slate-400">Evidence Matching</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Verified:</span>
                <span className="font-bold text-emerald-400">{totalVerified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pending Evidence:</span>
                <span className="font-bold text-amber-400">{totalPendingReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confirmed Non-Compliant:</span>
                <span className="font-bold text-rose-400">{totalCriticalExceptions}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Officer Attention</span>
              <span className="text-[10px] font-mono text-slate-400">Human-in-the-Loop</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Manual Reviews:</span>
                <span className="font-bold text-amber-400">{totalPendingReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Exceptions:</span>
                <span className="font-bold text-rose-400">{totalCriticalExceptions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="font-semibold text-amber-300">{totalVerified > 0 ? `${totalVerified}/${totalFindingsCount} Verified` : `${totalPendingReviews} Pending Evidence`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Verification Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Active Procurement Verifications</h3>
            <p className="text-xs text-slate-400">Current GeM tender submissions with automated compliance findings</p>
          </div>
          <button
            onClick={() => onNavigate('bid-cases')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            View All Verifications <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Tender ID</th>
                <th className="p-3">Bidder Legal Name</th>
                <th className="p-3">Verified Checks</th>
                <th className="p-3">Exceptions</th>
                <th className="p-3">Verification Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {bidCases.map((c) => {
                const passed = c.findings.filter((f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION').length;
                const exceptions = c.findings.filter((f) => f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'MISSING').length;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-blue-400 font-semibold">{c.tenderId}</td>
                    <td className="p-3 font-semibold text-slate-200">{(!c.bidder.legalName || c.bidder.legalName.includes('Not extracted')) ? 'Not extracted from submitted documents' : c.bidder.legalName}</td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {passed} of {c.findings.length}
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      {exceptions > 0 ? (
                        <span className="text-rose-400">{exceptions} Flags</span>
                      ) : (
                        <span className="text-slate-500">0 Flags</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.overallComplianceStatus === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.overallComplianceStatus === 'INCONSISTENT'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {c.overallComplianceStatus === 'VERIFIED'
                          ? 'VERIFIED'
                          : c.overallComplianceStatus === 'INCONSISTENT'
                          ? 'ACTION REQUIRED'
                          : 'NEEDS REVIEW'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-xs inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
