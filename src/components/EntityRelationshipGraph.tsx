import React, { useState } from 'react';
import {
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BidCase, Document, DocCategory } from '../models/types';

interface EntityRelationshipGraphProps {
  bidCase: BidCase;
  onSelectDocument?: (doc: Document) => void;
}

export const EntityRelationshipGraph: React.FC<EntityRelationshipGraphProps> = ({
  bidCase,
  onSelectDocument,
}) => {
  const [selectedNodeCategory, setSelectedNodeCategory] = useState<DocCategory | 'BIDDER'>('GST_CERTIFICATE');

  const nodes: { category: DocCategory; label: string; codeName: string }[] = [
    { category: 'GST_CERTIFICATE', label: 'GST Registration', codeName: 'GSTIN' },
    { category: 'PAN_CARD', label: 'Income Tax Permanent A/c', codeName: 'PAN' },
    { category: 'UDYAM_MSME', label: 'Udyam MSME Registry', codeName: 'UDYAM' },
    { category: 'MAKE_IN_INDIA_DECLARATION', label: 'Make in India Local Content', codeName: 'MII' },
    { category: 'OEM_AUTHORIZATION', label: 'OEM Authorization (MAF)', codeName: 'OEM' },
    { category: 'EPFO_ESIC', label: 'EPFO/ESIC Labor Clearance', codeName: 'EPFO' },
  ];

  const selectedDoc = bidCase.documents.find((d) => d.category === selectedNodeCategory);

  // Check for entity name mismatch finding
  const nameFinding = bidCase.findings.find((f) => f.requirementId === 'REQ-NAME-04');
  const isNameMismatch = nameFinding?.status === 'INCONSISTENT' || nameFinding?.status === 'NEEDS_REVIEW';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Cross-Document Statutory Entity Relationship Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive identity alignment graph mapping the bidder entity across statutory registries and bid declarations
          </p>
        </div>

        {isNameMismatch ? (
          <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" /> POTENTIAL ENTITY MISMATCH DETECTED
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Entity Name Uniformity Verified
          </span>
        )}
      </div>

      {/* GRAPH CANVAS SIMULATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* GRAPH NODES GRID (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-lg border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* CENTRAL NODE: BIDDER */}
          <div
            onClick={() => setSelectedNodeCategory('BIDDER')}
            className="z-10 p-4 rounded-xl bg-blue-600 text-white border-2 border-blue-400 shadow-xl cursor-pointer hover:scale-105 transition-all text-center max-w-xs mb-8"
          >
            <Building2 className="w-6 h-6 mx-auto mb-1 text-blue-200" />
            <div className="font-bold text-xs">{(!bidCase.bidder.legalName || bidCase.bidder.legalName.includes('Not extracted')) ? 'Not extracted from submitted documents' : bidCase.bidder.legalName}</div>
            <div className="text-[10px] text-blue-200 font-mono mt-0.5">
              GSTIN: {bidCase.bidder.gstin || 'Not extracted'}
            </div>
          </div>

          {/* CONNECTED NODES */}
          <div className="z-10 grid grid-cols-3 gap-3 w-full max-w-lg">
            {nodes.map((node) => {
              const doc = bidCase.documents.find((d) => d.category === node.category);
              const isSelected = selectedNodeCategory === node.category;
              const isMissing = !doc;

              let nodeStatusClass = 'bg-slate-900 border-slate-700 text-slate-300';
              if (isMissing) {
                nodeStatusClass = 'bg-rose-950/40 border-rose-500/50 text-rose-300';
              } else if (isSelected) {
                nodeStatusClass = 'bg-blue-950 border-blue-400 text-blue-200 ring-2 ring-blue-500/50';
              }

              return (
                <div
                  key={node.category}
                  onClick={() => setSelectedNodeCategory(node.category)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer text-center relative ${nodeStatusClass} hover:border-blue-400`}
                >
                  <div className="font-mono text-[10px] font-bold text-blue-400 uppercase">
                    {node.codeName}
                  </div>
                  <div className="font-medium text-[11px] truncate mt-0.5">{node.label}</div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    {isMissing ? (
                      <span className="text-rose-400 font-bold">Unsubmitted</span>
                    ) : (
                      <span>Confidence {((doc.confidenceScore || 0.95) * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NODE INSPECTION SIDE PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-xs text-blue-400 uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Entity Details: {selectedNodeCategory.replace(/_/g, ' ')}
              </h4>
              {selectedDoc && (
                <span className="text-[10px] font-mono text-emerald-400">
                  OCR Score: {((selectedDoc.confidenceScore || 0.95) * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {selectedNodeCategory === 'BIDDER' ? (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-100">{(!bidCase.bidder.legalName || bidCase.bidder.legalName.includes('Not extracted')) ? 'Not extracted from submitted documents' : bidCase.bidder.legalName}</div>
                <div className="text-[11px] text-slate-400">Category: {bidCase.bidder.category ? `${bidCase.bidder.category} Enterprise` : 'Not evaluated'}</div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 space-y-1">
                  <div>GSTIN: {bidCase.bidder.gstin || 'Not extracted'}</div>
                  <div>PAN: {bidCase.bidder.panNumber || 'Not extracted'}</div>
                  <div>Udyam: {bidCase.bidder.udyamNumber || 'Not submitted'}</div>
                </div>
              </div>
            ) : selectedDoc ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{selectedDoc.fileName}</div>
                  <div className="text-[10px] text-slate-400">{selectedDoc.fileSize} • Uploaded {selectedDoc.uploadDate}</div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                  <div>
                    Extracted Legal Entity: <strong className="text-slate-100">{selectedDoc.extractedFields?.legalName || selectedDoc.extractedFields?.entityName || selectedDoc.extractedFields?.signatoryName || 'Not extracted'}</strong>
                  </div>
                  {selectedDoc.extractedFields.gstin && <div>Extracted GSTIN: {selectedDoc.extractedFields.gstin}</div>}
                  {selectedDoc.extractedFields.panNumber && <div>Extracted PAN: {selectedDoc.extractedFields.panNumber}</div>}
                  {selectedDoc.extractedFields.localContentPercentage && (
                    <div>Extracted Local Content: {selectedDoc.extractedFields.localContentPercentage}%</div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] italic text-amber-200/90 font-mono">
                  "{selectedDoc.ocrExtractedText || 'No verbatim text snippet available.'}"
                </div>

                {onSelectDocument && (
                  <button
                    onClick={() => onSelectDocument(selectedDoc)}
                    className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    View Document Evidence <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-900 rounded text-center text-slate-500 text-xs">
                No submitted document found for {selectedNodeCategory.replace(/_/g, ' ')}. Requirement flagged as missing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
