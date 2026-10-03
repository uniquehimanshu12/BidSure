import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  Building,
  FileText,
  CheckCircle2,
  AlertTriangle,
  History,
  Loader2,
  Check,
} from 'lucide-react';
import { BidCase } from '../models/types';
import { generateComplianceReportPdf } from '../services/pdfReportService';

interface ReportPageProps {
  bidCase: BidCase;
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ bidCase, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Dynamic computation of verification findings breakdown
  const totalFindings = bidCase.findings.length;
  const verifiedCount = bidCase.findings.filter(
    (f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION'
  ).length;
  const missingCount = bidCase.findings.filter((f) => f.status === 'MISSING').length;
  const inconsistentCount = bidCase.findings.filter(
    (f) => f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'ACTION_REQUIRED'
  ).length;
  const needsReviewCount = bidCase.findings.filter(
    (f) => f.status === 'NEEDS_REVIEW' || f.status === 'NEEDS_MANUAL_REVIEW'
  ).length;

  const summaryParts: string[] = [
    `${verifiedCount} Verified`,
    ...(missingCount > 0 ? [`${missingCount} Missing`] : []),
    ...(inconsistentCount > 0 ? [`${inconsistentCount} Action Required`] : []),
    ...(needsReviewCount > 0 ? [`${needsReviewCount} Needs Review`] : []),
  ];
  const dynamicBreakdownText = summaryParts.join(' • ');

  // Clean Bidder Identity Display
  const cleanBidderName =
    !bidCase.bidder.legalName || bidCase.bidder.legalName.includes('Not extracted')
      ? 'Not extracted from submitted documents'
      : bidCase.bidder.legalName;

  const cleanGstin =
    !bidCase.bidder.gstin || bidCase.bidder.gstin.includes('Not extracted')
      ? 'Not extracted from submitted documents'
      : bidCase.bidder.gstin;

  const cleanPan =
    !bidCase.bidder.panNumber || bidCase.bidder.panNumber.includes('Not extracted')
      ? 'Not extracted from submitted documents'
      : bidCase.bidder.panNumber;

  // Generate clean downloadable official PDF document
  const handleDownloadPdf = async (): Promise<boolean> => {
    setIsExporting(true);
    setStatusMessage('Generating official PDF document...');

    try {
      const result = generateComplianceReportPdf(bidCase);
      if (result.success) {
        setStatusMessage(`PDF generated successfully (${result.filename})!`);
        setTimeout(() => setStatusMessage(null), 4000);
        return true;
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      setStatusMessage('Direct download encountered an issue. Please use the Print option.');
      setTimeout(() => setStatusMessage(null), 4500);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // Main Print Action: Invokes native browser print dialog
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Native window.print() call error:', err);
      // Fallback: download PDF directly if print API fails
      handleDownloadPdf();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Top Print & Navigation Actions (Hidden during print) */}
      <div className="no-print print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs flex items-center gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Verification Workspace
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {statusMessage && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
              <Check className="w-3.5 h-3.5" /> {statusMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-400" />}
            Save as PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isExporting}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" /> Print GeM Bid Compliance Report
          </button>
        </div>
      </div>

      {/* REPORT PRINTABLE CONTAINER (Official Clean White Document Styling) */}
      <div
        ref={reportRef}
        id="printable-compliance-report"
        className="printable-report bg-white text-gray-900 border border-gray-300 p-8 rounded-lg space-y-6 shadow-xl text-xs print:border-none print:shadow-none print:p-0"
      >
        {/* Official Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 space-y-1 print-keep-together">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-600">
            Government of India • Ministry of Commerce & Industry • DPIIT
          </div>
          <h1 className="text-lg font-bold uppercase tracking-wider text-gray-900">
            Controller General of Patents Designs and Trade Marks (CGPDTM)
          </h1>
          <h2 className="text-sm font-bold text-blue-900">
            GeM Bid Compliance Verification Report
          </h2>
          <div className="text-[11px] font-semibold text-gray-600">
            AI-Assisted Procurement Compliance Decision Support — BidSure Prototype
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            Report Ref: GEM-VERIF-{bidCase.id} • Generated On: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-3 bg-amber-50/70 border border-amber-300/80 rounded text-[11px] text-amber-950 space-y-1 print-keep-together">
          <div className="font-bold flex items-center gap-1 text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            Statutory Decision Support Disclaimer
          </div>
          <p className="leading-relaxed">
            AI-assisted verification is decision support. All rule evaluations, extracted field citations, and cross-document matches are provided for officer reference. <strong>Final procurement determinations remain solely with the authorized Procurement Authority / Tender Committee.</strong>
          </p>
        </div>

        {/* Grid 1: Tender & Bidder Overview */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 border border-gray-200 rounded text-gray-800 print-keep-together">
          <div className="space-y-1.5">
            <h3 className="font-bold uppercase text-gray-900 text-[11px] border-b border-gray-200 pb-1">
              GeM Tender Details
            </h3>
            <p><strong>Tender ID:</strong> <span className="font-mono font-bold text-blue-900">{bidCase.tenderId}</span></p>
            <p><strong>Title:</strong> {bidCase.tenderTitle}</p>
            <p><strong>Procuring Entity:</strong> {bidCase.organization}</p>
            <p><strong>Submission Date:</strong> {bidCase.submissionDate}</p>
            <p><strong>Required Local Content:</strong> ≥ {bidCase.requiredLocalContentPercentage ?? 20}%</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold uppercase text-gray-900 text-[11px] border-b border-gray-200 pb-1">
              Bidder Credentials
            </h3>
            <p><strong>Legal Name:</strong> {cleanBidderName}</p>
            <p><strong>GSTIN:</strong> <span className="font-mono font-semibold">{cleanGstin}</span></p>
            <p><strong>PAN:</strong> <span className="font-mono font-semibold">{cleanPan}</span></p>
            <p><strong>Enterprise Category:</strong> {bidCase.bidder.category ? `${bidCase.bidder.category} Enterprise` : 'Not evaluated'}</p>
          </div>
        </div>

        {/* Section 2: Overall Verdict & Dynamic Breakdown */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-gray-900 print-keep-together">
          <div>
            <div className="text-[10px] text-gray-600 uppercase font-bold">
              Compliance Verification Summary
            </div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {dynamicBreakdownText}
            </div>
            <div className="text-[11px] text-gray-600 font-mono mt-0.5">
              Verification Rate: {verifiedCount}/{totalFindings} Verified ({bidCase.complianceScore}% of requirements verified from submitted bidder evidence)
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-[10px] text-gray-600 uppercase font-bold">
              AI Decision Support Assessment
            </div>
            <div className="text-sm font-bold uppercase tracking-wider text-blue-900 mt-0.5">
              {bidCase.overallComplianceStatus === 'INCONSISTENT'
                ? 'ACTION REQUIRED — EXCEPTIONS FLAGGED'
                : bidCase.overallComplianceStatus.replace(/_/g, ' ')}
            </div>
            <div className="text-[10px] text-gray-500 italic mt-0.5">
              Subject to designated procurement officer sign-off
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Compliance Table */}
        <div className="space-y-2">
          <h3 className="font-bold uppercase text-gray-900 text-xs">
            Detailed Statutory Requirement Verification Matrix
          </h3>

          <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
            <thead className="bg-gray-100 text-gray-800 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-2 border border-gray-300">Requirement</th>
                <th className="p-2 border border-gray-300">Rule Applied</th>
                <th className="p-2 border border-gray-300">Extracted Value</th>
                <th className="p-2 border border-gray-300">Conf.</th>
                <th className="p-2 border border-gray-300">Status</th>
                <th className="p-2 border border-gray-300">Evidence Citation & Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bidCase.findings.map((f) => (
                <tr key={f.id} className="print-keep-together hover:bg-gray-50">
                  <td className="p-2 border border-gray-300 font-semibold text-gray-900">
                    {f.requirementTitle}
                  </td>
                  <td className="p-2 border border-gray-300 font-mono text-gray-700">
                    {f.ruleApplied}
                  </td>
                  <td className="p-2 border border-gray-300 font-mono font-bold text-blue-900">
                    {f.extractedValue || (f.status === 'MISSING' ? 'Not available (Unsubmitted)' : 'Not extracted')}
                  </td>
                  <td className="p-2 border border-gray-300 font-mono text-gray-700">
                    {f.status === 'MISSING' || !f.confidence ? 'N/A' : `${(f.confidence * 100).toFixed(0)}%`}
                  </td>
                  <td className="p-2 border border-gray-300 font-bold uppercase">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        f.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'MISSING'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-2 border border-gray-300 text-gray-800 space-y-1">
                    <div>{f.reason}</div>
                    <div className="text-[10px] text-amber-900 italic font-semibold">Action: {f.recommendedAction}</div>
                    {f.officerOverride && (
                      <div className="p-1 bg-blue-50 border border-blue-200 rounded font-semibold text-blue-900">
                        Officer Remark ({f.officerOverride.overriddenBy}): {f.officerOverride.remarks}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Audit History Summary */}
        <div className="space-y-2 print-keep-together">
          <h3 className="font-bold uppercase text-gray-900 text-xs flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-900" />
            Audit History & Chain of Custody
          </h3>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5 text-gray-800">
            {bidCase.auditTrail.map((entry) => (
              <div key={entry.id} className="flex justify-between text-[10px] font-mono border-b border-gray-200 pb-1">
                <span><strong>{entry.action}</strong> by {entry.userName} ({entry.userRole}) - {entry.details}</span>
                <span className="text-gray-600">{new Date(entry.timestamp).toLocaleString('en-GB')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Officer Signature & Decision Block */}
        <div className="pt-8 grid grid-cols-2 gap-8 border-t-2 border-gray-300 text-xs text-gray-900 print-keep-together">
          <div className="space-y-8">
            <div>
              <div className="text-gray-600 font-bold uppercase text-[10px] mb-1">
                Assigned Procurement Officer (Demo Simulation)
              </div>
              <div className="font-semibold text-gray-900">
                {bidCase.assignedOfficer?.includes('[Demo') || bidCase.assignedOfficer?.includes('Demo')
                  ? bidCase.assignedOfficer
                  : `${bidCase.assignedOfficer} [Demo Officer Profile]`}
              </div>
              <div className="text-[11px] text-gray-600">CGPDTM Procurement Division (Prototype Evaluation Role)</div>
            </div>
            <div className="pt-4 border-t border-gray-400 w-48 text-[11px] text-gray-600">
              Officer Signature & Stamp
            </div>
          </div>

          <div className="space-y-8 text-right">
            <div>
              <div className="text-gray-600 font-bold uppercase text-[10px] mb-1">
                Competent Procurement Authority (Designated Role)
              </div>
              <div className="font-semibold text-gray-900">Senior Procurement Authority [Demo Evaluation Role]</div>
              <div className="text-[11px] text-gray-600">GeM Tender Evaluation Committee (Demo Sign-Off)</div>
            </div>
            <div className="pt-4 border-t border-gray-400 w-48 ml-auto text-[11px] text-gray-600">
              Date & Official Seal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
