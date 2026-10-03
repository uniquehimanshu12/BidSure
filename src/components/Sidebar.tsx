import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FilePlus2,
  ListCheck,
  ShieldCheck,
  History,
  FileBarChart2,
  ChevronRight,
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'bid-cases'
  | 'new-verification'
  | 'review-queue'
  | 'compliance-rules'
  | 'audit-trail'
  | 'reports';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  pendingReviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  pendingReviewCount = 2,
}) => {
  const menuItems: { id: NavPage; label: string; icon: React.FC<{ className?: string }>; badge?: number; isPrimaryCta?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-verification', label: '+ Start New Verification', icon: FilePlus2, isPrimaryCta: true },
    { id: 'bid-cases', label: 'Active Verifications', icon: Briefcase },
    { id: 'review-queue', label: 'Officer Review', icon: ListCheck, badge: pendingReviewCount },
    { id: 'compliance-rules', label: 'Compliance Rules', icon: ShieldCheck },
    { id: 'audit-trail', label: 'Verification History', icon: History },
    { id: 'reports', label: 'Compliance Reports', icon: FileBarChart2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] text-slate-300 no-print print:hidden">
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Verification Workflow
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  item.isPrimaryCta
                    ? 'bg-blue-600 hover:bg-blue-500 text-white font-bold my-2 shadow-sm'
                    : isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.isPrimaryCta ? 'text-white' : isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    {item.badge}
                  </span>
                ) : isActive && !item.isPrimaryCta ? (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Decision Support Engine</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </span>
        </div>
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <p>Rule Engine: v2.4 (Statutory 2026)</p>
          <p>AI Extraction: Gemini 3.8 Flash</p>
        </div>
      </div>
    </aside>
  );
};
