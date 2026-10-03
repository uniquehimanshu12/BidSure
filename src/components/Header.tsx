import React from 'react';
import { Search, Bell, Shield, UserCheck, ChevronDown, Building2 } from 'lucide-react';
import { UserRole } from '../models/types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 no-print print:hidden">
      {/* Top Banner Notice */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
            <Shield className="w-3 h-3" />
            PROTOTYPE / DEMONSTRATION ENVIRONMENT
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            GeM Procurement Intelligence & Compliance Verification Platform
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          SIH2026 Problem Statement: <span className="text-blue-400 font-semibold">SIH26100</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Org branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-wide text-slate-100 uppercase">
                Controller General of Patents Designs and Trade Marks (CGPDTM)
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                GeM Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ministry of Commerce and Industry • DPIIT • Government of India
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Tender ID, Bidder Name, GSTIN, PAN..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-400">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="PROCUREMENT_OFFICER" className="bg-slate-900 text-slate-200">
                Procurement Officer
              </option>
              <option value="REVIEWER_SUPERVISOR" className="bg-slate-900 text-slate-200">
                Reviewer / Supervisor
              </option>
              <option value="SYSTEM_ADMIN" className="bg-slate-900 text-slate-200">
                System Admin
              </option>
            </select>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900"></span>
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
              PO
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-medium text-slate-200">Procurement Officer [Demo]</p>
              <p className="text-[10px] text-slate-400">Sr. Manager (Procurement)</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
