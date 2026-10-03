import React, { useState } from 'react';
import {
  Settings,
  Shield,
  FileCheck2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sliders,
  Building,
  Info,
} from 'lucide-react';
import { TenderConfig, DocCategory } from '../models/types';

interface TenderRequirementsBuilderProps {
  tenderConfig: TenderConfig;
  onSaveConfig: (updatedConfig: TenderConfig) => void;
  onClose?: () => void;
}

export const TenderRequirementsBuilder: React.FC<TenderRequirementsBuilderProps> = ({
  tenderConfig,
  onSaveConfig,
  onClose,
}) => {
  const [config, setConfig] = useState<TenderConfig>({ ...tenderConfig });
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleDoc = (docCategory: DocCategory, isRequired: boolean) => {
    if (isRequired) {
      const exists = config.requiredDocuments.includes(docCategory);
      const updatedRequired = exists
        ? config.requiredDocuments.filter((d) => d !== docCategory)
        : [...config.requiredDocuments, docCategory];
      setConfig({ ...config, requiredDocuments: updatedRequired });
    } else {
      const exists = config.optionalDocuments.includes(docCategory);
      const updatedOptional = exists
        ? config.optionalDocuments.filter((d) => d !== docCategory)
        : [...config.optionalDocuments, docCategory];
      setConfig({ ...config, optionalDocuments: updatedOptional });
    }
  };

  const handleAddCustomClause = () => {
    const newClause = {
      id: `REQ-CUSTOM-${Date.now()}`,
      code: `CLAUSE-${config.requirements.length + 1}`,
      name: 'Custom Tender Verification Requirement',
      category: 'Technical Eligibility',
      description: 'Specific technical requirement defined for CGPDTM IT Project tender.',
      required: true,
      ruleType: 'AI_CLAUSE_CHECK',
      threshold: 50,
      evidenceRequirements: 'Submission of valid certificate or self-declaration',
    };

    setConfig({
      ...config,
      requirements: [...config.requirements, newClause],
    });
  };

  const handleRemoveClause = (id: string) => {
    setConfig({
      ...config,
      requirements: config.requirements.filter((r) => r.id !== id),
    });
  };

  const handleSave = () => {
    onSaveConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const allDocCategories: { cat: DocCategory; label: string }[] = [
    { cat: 'GST_CERTIFICATE', label: 'GST Registration (REG-06)' },
    { cat: 'PAN_CARD', label: 'Permanent Account Number (PAN)' },
    { cat: 'UDYAM_MSME', label: 'Udyam / MSME Certificate' },
    { cat: 'MAKE_IN_INDIA_DECLARATION', label: 'Make in India Local Content Declaration' },
    { cat: 'OEM_AUTHORIZATION', label: 'OEM Authorization Letter (MAF)' },
    { cat: 'EPFO_ESIC', label: 'EPFO & ESIC Compliance Certificate' },
    { cat: 'INCOME_TAX_ITR', label: '3-Year Audited ITR Receipts' },
    { cat: 'STARTUP_INDIA', label: 'DIPP Startup India Certificate' },
    { cat: 'NSIC_CERTIFICATE', label: 'NSIC Registration Certificate' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-[11px] font-semibold">
            <Sliders className="w-4 h-4" />
            <span>TENDER CONFIGURATION BUILDER</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1">
            Configuring Rules for Tender #{config.tenderId}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define tender-specific local content thresholds, mandatory document checklists, and statutory parameters driving the verification engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Config Applied Live!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" /> Apply Tender Config to Engine
          </button>
        </div>
      </div>

      {/* Grid 1: Thresholds & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Required Local Content Threshold (%) *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={config.requiredLocalContentPercentage}
              onChange={(e) =>
                setConfig({ ...config, requiredLocalContentPercentage: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-400 font-bold">%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Class-I / Class-II Preference minimum required under MII (≥20%).</p>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            OEM Authorization Requirement *
          </label>
          <select
            value={config.isOemAuthRequired ? 'REQUIRED' : 'OPTIONAL'}
            onChange={(e) => setConfig({ ...config, isOemAuthRequired: e.target.value === 'REQUIRED' })}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-semibold focus:border-blue-500 focus:outline-none"
          >
            <option value="REQUIRED">Mandatory (OEM MAF Letter Required)</option>
            <option value="OPTIONAL">Optional / Non-Mandatory</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-1">Controls technical eligibility validation.</p>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Statutory Certificate Validity Days *
          </label>
          <input
            type="number"
            value={config.validityDaysRequired}
            onChange={(e) => setConfig({ ...config, validityDaysRequired: parseInt(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500 mt-1">EPFO/ESIC must be valid on submission date.</p>
        </div>
      </div>

      {/* Grid 2: Mandatory Documents Checklist */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider border-b border-slate-800 pb-2">
          Mandatory & Optional Statutory Document Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allDocCategories.map((item) => {
            const isMandatory = config.requiredDocuments.includes(item.cat);
            return (
              <div
                key={item.cat}
                onClick={() => handleToggleDoc(item.cat, true)}
                className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                  isMandatory
                    ? 'bg-blue-950/40 border-blue-500/70 text-slate-100'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isMandatory ? 'Mandatory for Tender' : 'Optional / Not Required'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={() => {}}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid 3: Configured Compliance Clauses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
            Active Verification Rules ({config.requirements.length} Clauses)
          </h3>
          <button
            onClick={handleAddCustomClause}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Custom Clause
          </button>
        </div>

        <div className="space-y-2">
          {config.requirements.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400 font-bold">{req.code}</span>
                  <span className="font-semibold text-slate-200">{req.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                    {req.ruleType}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{req.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRemoveClause(req.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  title="Remove clause"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
