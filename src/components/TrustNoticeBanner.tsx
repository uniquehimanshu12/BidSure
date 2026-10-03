import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const TrustNoticeBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 mb-6 text-xs flex items-start gap-3 shadow-sm">
      <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 text-slate-300 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <span>STATUTORY DECISION SUPPORT NOTICE</span>
          <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            GeM Procurement Context
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          AI-assisted verification is a decision support tool designed to streamline document analysis, highlight compliance discrepancies, and automate cross-matching. <strong className="text-slate-200">Final procurement decisions remain solely with the competent procurement authority (CGPDTM / GeM Officers).</strong>
        </p>
      </div>
    </div>
  );
};
