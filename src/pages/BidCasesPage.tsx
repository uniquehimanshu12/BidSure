import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { BidCase, ComplianceStatus } from '../models/types';

interface BidCasesPageProps {
  bidCases: BidCase[];
  onSelectCase: (caseId: string) => void;
  onSelectScenario: (scenario: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C') => void;
  searchQuery: string;
}

export const BidCasesPage: React.FC<BidCasesPageProps> = ({
  bidCases,
  onSelectCase,
  onSelectScenario,
  searchQuery: externalSearch,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'submissionDate' | 'complianceScore'>('submissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const effectiveSearch = externalSearch || internalSearch;

  const filteredCases = bidCases
    .filter((c) => {
      const matchSearch =
        c.tenderId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        c.bidder.legalName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        c.tenderTitle.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        c.bidder.gstin.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && c.overallComplianceStatus === 'VERIFIED') ||
        (statusFilter === 'EXCEPTIONS' && (c.overallComplianceStatus === 'INCONSISTENT' || c.overallComplianceStatus === 'MISSING')) ||
        (statusFilter === 'REVIEW' && c.overallComplianceStatus === 'NEEDS_REVIEW');

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === 'submissionDate') {
        return sortOrder === 'desc'
          ? b.submissionDate.localeCompare(a.submissionDate)
          : a.submissionDate.localeCompare(b.submissionDate);
      } else {
        return sortOrder === 'desc' ? b.complianceScore - a.complianceScore : a.complianceScore - b.complianceScore;
      }
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">GeM Bid Verification Cases</h2>
          <p className="text-xs text-slate-400 mt-1">
            Active GeM tender submissions undergoing statutory and technical compliance verification
          </p>
        </div>

        {/* Scenario Quick Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Load Scenario Preset:
          </span>
          <button
            onClick={() => onSelectScenario('SCENARIO_A')}
            className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium transition-colors"
          >
            A: Compliant
          </button>
          <button
            onClick={() => onSelectScenario('SCENARIO_B')}
            className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-medium transition-colors"
          >
            B: Exceptions
          </button>
          <button
            onClick={() => onSelectScenario('SCENARIO_C')}
            className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-medium transition-colors"
          >
            C: Needs Review
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Tender ID, Bidder Legal Name, GSTIN..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Cases</option>
              <option value="VERIFIED" className="bg-slate-900">Verified Compliant</option>
              <option value="EXCEPTIONS" className="bg-slate-900">Exceptions / Inconsistent</option>
              <option value="REVIEW" className="bg-slate-900 font-semibold text-amber-400">Needs Review</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>Sort By:</span>
          <button
            onClick={() => {
              if (sortField === 'submissionDate') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              else {
                setSortField('submissionDate');
                setSortOrder('desc');
              }
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-1 ${
              sortField === 'submissionDate'
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Submission Date <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (sortField === 'complianceScore') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              else {
                setSortField('complianceScore');
                setSortOrder('desc');
              }
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-1 ${
              sortField === 'complianceScore'
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'border-slate-800 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Verification Rate <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Procurement Case Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Tender ID</th>
                <th className="p-3">Tender Title</th>
                <th className="p-3">Bidder Organization</th>
                <th className="p-3">Submission Date</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Compliance Status</th>
                <th className="p-3">Exceptions Flagged</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No matching bid verification cases found. Try adjusting filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const exceptionCount = c.findings.filter(
                    (f) => f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'MISSING'
                  ).length;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-3 font-mono text-blue-400 font-semibold">{c.tenderId}</td>
                      <td className="p-3 font-medium text-slate-200 max-w-xs truncate" title={c.tenderTitle}>
                        {c.tenderTitle}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{(!c.bidder.legalName || c.bidder.legalName.includes('Not extracted')) ? 'Not extracted from submitted documents' : c.bidder.legalName}</div>
                        <div className="text-[10px] font-mono text-slate-400">GSTIN: {c.bidder.gstin || 'Not extracted'}</div>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {c.submissionDate}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {c.documents.length} Files
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold ${
                            c.overallComplianceStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : c.overallComplianceStatus === 'INCONSISTENT'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {c.overallComplianceStatus === 'VERIFIED' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {c.overallComplianceStatus}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">
                        {exceptionCount > 0 ? (
                          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                            {exceptionCount} Exception{exceptionCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">0 Exceptions</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(c.lastUpdated).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-1 text-[11px] ml-auto"
                        >
                          Verify Workspace <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
