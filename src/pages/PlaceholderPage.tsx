import React from 'react';
import {
  ListCheck,
  FileText,
  ShieldCheck,
  History,
  FileBarChart2,
  Printer,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { NavPage } from '../components/Sidebar';
import { BidCase } from '../models/types';
import { STANDARD_COMPLIANCE_REQUIREMENTS } from '../rules/complianceRules';

interface PlaceholderPageProps {
  page: NavPage;
  bidCases: BidCase[];
  onSelectCase: (caseId: string, openReport?: boolean) => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ page, bidCases, onSelectCase }) => {
  if (page === 'review-queue') {
    const reviewCases = bidCases.filter(
      (c) => c.status === 'NEEDS_OFFICER_REVIEW' || c.overallComplianceStatus === 'NEEDS_REVIEW' || c.overallComplianceStatus === 'INCONSISTENT'
    );

    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ListCheck className="w-5 h-5 text-amber-400" />
            Officer Action Required
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submissions flagged for human-in-the-loop inspection due to OCR confidence thresholds, name discrepancies, or expired statutory certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-lg cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-semibold">{c.tenderId}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  {c.overallComplianceStatus === 'INCONSISTENT' ? 'ACTION REQUIRED' : 'NEEDS REVIEW'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">{c.bidder.legalName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.tenderTitle}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded text-xs text-amber-200/90 font-mono border border-slate-800">
                Action Reason: {c.officerNotes || 'Discrepancy detected in statutory requirements.'}
              </div>
              <button className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1">
                <span>Open Verification Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === 'compliance-rules') {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            GeM Statutory Compliance Rules Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configurable statutory, regulatory, and local content verification parameters driving the decision support engine.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Rule Code</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Evaluation Method</th>
                <th className="p-3">Mandatory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {STANDARD_COMPLIANCE_REQUIREMENTS.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-blue-400 font-semibold">{r.code}</td>
                  <td className="p-3 font-medium text-slate-200">{r.title}</td>
                  <td className="p-3 text-slate-400">{r.category}</td>
                  <td className="p-3 font-mono text-[11px] text-amber-300">{r.ruleType}</td>
                  <td className="p-3">
                    {r.isMandatory ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">OPTIONAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (page === 'audit-trail') {
    const allAuditEntries = bidCases.flatMap((c) => c.auditTrail);

    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Verification Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical log of document ingestions, rule engine evaluations, and procurement officer remarks across GeM tenders.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
          {allAuditEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <span className="text-blue-400 font-mono">{entry.action}</span>
                  <span className="text-slate-600">•</span>
                  <span>{entry.userName} ({entry.userRole})</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{entry.details}</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                {new Date(entry.timestamp).toLocaleString('en-GB')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === 'reports') {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-blue-400" />
            Compliance Reports Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generated statutory compliance verification reports for active GeM tenders.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Report Ref</th>
                <th className="p-3">Tender ID</th>
                <th className="p-3">Bidder Legal Name</th>
                <th className="p-3">Verification Rate</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {bidCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-blue-400 font-semibold">GEM-VERIF-{c.id}</td>
                  <td className="p-3 font-mono text-slate-200">{c.tenderId}</td>
                  <td className="p-3 font-semibold text-slate-100">{c.bidder.legalName}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{c.complianceScore}% Verified</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[10px]">
                      {c.overallComplianceStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectCase(c.id, true)}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback for documents or settings
  const allDocs = bidCases.flatMap((c) => c.documents.map((d) => ({ ...d, caseTenderId: c.tenderId, bidderName: c.bidder.legalName })));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Ingested Bid Documents Repository
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of all statutory PDF and image documents uploaded and analyzed by Gemini 3.8 Flash across active tender submissions.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Document Name</th>
              <th className="p-3">Tender ID</th>
              <th className="p-3">Bidder Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">OCR Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {allDocs.map((d, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{d.fileName}</span>
                </td>
                <td className="p-3 font-mono text-blue-400">{d.caseTenderId}</td>
                <td className="p-3 font-medium text-slate-200">{d.bidderName}</td>
                <td className="p-3 text-emerald-400 font-semibold">{d.category.replace(/_/g, ' ')}</td>
                <td className="p-3 font-mono text-slate-300">{(d.confidenceScore * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
