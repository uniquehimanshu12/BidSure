import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavPage } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { BidCasesPage } from './pages/BidCasesPage';
import { VerificationWorkspacePage } from './pages/VerificationWorkspacePage';
import { NewVerificationPage } from './pages/NewVerificationPage';
import { ReportPage } from './pages/ReportPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { BidCase, UserRole, ComplianceStatus, TenderConfig } from './models/types';
import { verificationService } from './services/verificationService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('PROCUREMENT_OFFICER');
  const [globalSearch, setGlobalSearch] = useState('');
  const [bidCases, setBidCases] = useState<BidCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    const data = await verificationService.getBidCases();
    setBidCases(data);
    setIsLoading(false);
  };

  const handleSelectCase = (caseId: string, openReport = false) => {
    setSelectedCaseId(caseId);
    setViewingReport(openReport);
  };

  const handleSelectScenario = (scenario: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C') => {
    const targetMap = {
      SCENARIO_A: 'CASE-2026-7878577-COMPLIANT',
      SCENARIO_B: 'CASE-2026-7878577-EXCEPTIONS',
      SCENARIO_C: 'CASE-2026-7878577',
    };
    const targetId = targetMap[scenario];
    const found = bidCases.find((c) => c.id === targetId);
    if (found) {
      setSelectedCaseId(targetId);
      setViewingReport(false);
    } else if (bidCases.length > 0) {
      setSelectedCaseId(bidCases[0].id);
      setViewingReport(false);
    }
  };

  const handleCaseCreated = (newCase: BidCase) => {
    setBidCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCurrentPage('bid-cases');
  };

  const handleOverrideFinding = async (
    findingId: string,
    newStatus: ComplianceStatus,
    remarks: string
  ) => {
    if (!selectedCaseId) return;
    const updated = await verificationService.overrideFinding(
      selectedCaseId,
      findingId,
      newStatus,
      remarks,
      'Procurement Officer [Demo Profile]'
    );

    setBidCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleUpdateTenderConfig = async (updatedConfig: TenderConfig) => {
    if (!selectedCaseId) return;

    const reEvaluated = await verificationService.updateTenderConfig(
      selectedCaseId,
      updatedConfig.requiredLocalContentPercentage
    );

    setBidCases((prev) => prev.map((c) => (c.id === reEvaluated.id ? reEvaluated : c)));
  };

  const selectedCase = bidCases.find((c) => c.id === selectedCaseId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedCaseId(null);
            setViewingReport(false);
          }}
          pendingReviewCount={bidCases.filter((c) => c.status === 'NEEDS_OFFICER_REVIEW').length}
        />

        {/* Center Main Content Page View */}
        <main className="flex-1 overflow-y-auto bg-slate-950 text-slate-100">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading BidSure GeM Verification Engine...
            </div>
          ) : viewingReport && selectedCase ? (
            <ReportPage
              bidCase={selectedCase}
              onBack={() => setViewingReport(false)}
            />
          ) : selectedCaseId && selectedCase ? (
            <VerificationWorkspacePage
              bidCase={selectedCase}
              onBack={() => setSelectedCaseId(null)}
              onOverrideFinding={handleOverrideFinding}
              onOpenReport={() => setViewingReport(true)}
              onUpdateTenderConfig={handleUpdateTenderConfig}
            />
          ) : currentPage === 'dashboard' ? (
            <DashboardPage
              bidCases={bidCases}
              onSelectCase={handleSelectCase}
              onNavigate={setCurrentPage}
              onSelectScenario={handleSelectScenario}
            />
          ) : currentPage === 'bid-cases' ? (
            <BidCasesPage
              bidCases={bidCases}
              onSelectCase={handleSelectCase}
              onSelectScenario={handleSelectScenario}
              searchQuery={globalSearch}
            />
          ) : currentPage === 'new-verification' ? (
            <NewVerificationPage
              onCaseCreated={handleCaseCreated}
              onCancel={() => setCurrentPage('bid-cases')}
            />
          ) : (
            <PlaceholderPage
              page={currentPage}
              bidCases={bidCases}
              onSelectCase={handleSelectCase}
            />
          )}
        </main>
      </div>
    </div>
  );
};
