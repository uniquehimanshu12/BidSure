/**
 * BidSure Official GeM Compliance Report PDF Generator
 * High-fidelity vector PDF generation using jsPDF & autoTable
 * Complies with GeM official procurement documentation standards
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BidCase } from '../models/types';

export interface GeneratePdfResult {
  success: boolean;
  filename: string;
  blob?: Blob;
  error?: string;
}

export function generateComplianceReportPdf(bidCase: BidCase): GeneratePdfResult {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Helper counts & stats
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

    let yPos = 16;

    // ==========================================
    // 1. OFFICIAL HEADER
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('GOVERNMENT OF INDIA • MINISTRY OF COMMERCE & INDUSTRY • DPIIT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5.5;

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(bidCase.organization || 'Controller General of Patents Designs and Trade Marks (CGPDTM)', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5.5;

    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('GeM Bid Compliance Verification Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('AI-Assisted Procurement Compliance Decision Support — BidSure Prototype', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;

    doc.setFontSize(7.5);
    doc.text(
      `Report Ref: GEM-VERIF-${bidCase.id}   •   Generated On: ${new Date().toLocaleDateString('en-GB')}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 4;

    // Header divider line
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4.5;

    // ==========================================
    // 2. STATUTORY DISCLAIMER BOX
    // ==========================================
    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(251, 191, 36); // amber-400
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 13, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('Statutory Decision Support Disclaimer:', margin + 3, yPos + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15); // amber-900
    const disclaimerText =
      'AI-assisted verification is decision support. All rule evaluations, extracted field citations, and cross-document matches are provided for officer reference. Final procurement determinations remain solely with the authorized Procurement Authority / Tender Committee.';
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 6);
    doc.text(splitDisclaimer, margin + 3, yPos + 8);
    yPos += 16;

    // ==========================================
    // 3. TENDER & BIDDER DETAILS (Two-Column Box)
    // ==========================================
    const boxHeight = 27;
    const colWidth = (contentWidth - 4) / 2;

    // Left Column: Tender Details Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, yPos, colWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('GeM Tender Details', margin + 3, yPos + 4.5);

    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont('helvetica', 'bold');
    doc.text('Tender ID:', margin + 3, yPos + 9);
    doc.setFont('helvetica', 'normal');
    doc.text(bidCase.tenderId, margin + 22, yPos + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('Title:', margin + 3, yPos + 13.5);
    doc.setFont('helvetica', 'normal');
    const splitTitle = doc.splitTextToSize(bidCase.tenderTitle, colWidth - 18);
    doc.text(splitTitle.slice(0, 2), margin + 14, yPos + 13.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Procuring Entity:', margin + 3, yPos + 19);
    doc.setFont('helvetica', 'normal');
    const splitOrg = doc.splitTextToSize(bidCase.organization || 'CGPDTM, Mumbai', colWidth - 28);
    doc.text(splitOrg.slice(0, 1), margin + 27, yPos + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Local Content Req:', margin + 3, yPos + 23.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`>= ${bidCase.requiredLocalContentPercentage ?? 20}%`, margin + 31, yPos + 23.5);

    // Right Column: Bidder Credentials Box
    const rightColX = margin + colWidth + 4;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightColX, yPos, colWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text('Bidder Credentials', rightColX + 3, yPos + 4.5);

    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('Legal Name:', rightColX + 3, yPos + 9);
    doc.setFont('helvetica', 'normal');
    const splitBidder = doc.splitTextToSize(cleanBidderName, colWidth - 24);
    doc.text(splitBidder.slice(0, 1), rightColX + 22, yPos + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN:', rightColX + 3, yPos + 13.5);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanGstin, rightColX + 16, yPos + 13.5);

    doc.setFont('helvetica', 'bold');
    doc.text('PAN:', rightColX + 3, yPos + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanPan, rightColX + 13, yPos + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Enterprise:', rightColX + 3, yPos + 22.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      bidCase.bidder.category ? `${bidCase.bidder.category} Enterprise` : 'Not evaluated',
      rightColX + 21,
      yPos + 22.5
    );

    yPos += boxHeight + 4;

    // ==========================================
    // 4. VERIFICATION SUMMARY BAR
    // ==========================================
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.roundedRect(margin, yPos, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('COMPLIANCE VERIFICATION SUMMARY', margin + 3, yPos + 4.5);

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(dynamicBreakdownText, margin + 3, yPos + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('DECISION SUPPORT STATUS', pageWidth - margin - 50, yPos + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    const statusLabel =
      bidCase.overallComplianceStatus === 'INCONSISTENT'
        ? 'EXCEPTIONS FLAGGED'
        : bidCase.overallComplianceStatus.replace(/_/g, ' ');
    doc.text(statusLabel, pageWidth - margin - 50, yPos + 9);

    yPos += 15;

    // ==========================================
    // 5. REQUIREMENT VERIFICATION MATRIX TABLE
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Detailed Statutory Requirement Verification Matrix', margin, yPos);
    yPos += 2.5;

    const tableRows = bidCase.findings.map((f) => {
      const confStr = f.status === 'MISSING' || !f.confidence ? 'N/A' : `${(f.confidence * 100).toFixed(0)}%`;
      const valStr = f.extractedValue || (f.status === 'MISSING' ? 'Not available (Unsubmitted)' : 'Not extracted');
      const actionText = `${f.reason}\n• Action: ${f.recommendedAction}${
        f.officerOverride ? `\n• Officer Remark (${f.officerOverride.overriddenBy}): ${f.officerOverride.remarks}` : ''
      }`;
      return [f.requirementTitle, f.ruleApplied, valStr, confStr, f.status.replace(/_/g, ' '), actionText];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Requirement', 'Rule Applied', 'Extracted Value', 'Conf.', 'Status', 'Audit Finding & Recommended Officer Action']],
      body: tableRows,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 6.8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 28, fontStyle: 'italic' },
        2: { cellWidth: 25, fontStyle: 'bold', textColor: [30, 58, 138] },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
        5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const statusVal = String(data.cell.raw);
          if (statusVal.includes('VERIFIED')) {
            data.cell.styles.textColor = [16, 122, 68]; // green
          } else if (statusVal.includes('MISSING') || statusVal.includes('INCONSISTENT') || statusVal.includes('INVALID')) {
            data.cell.styles.textColor = [185, 28, 28]; // red
          } else {
            data.cell.styles.textColor = [180, 83, 9]; // amber
          }
        }
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 60;

    // Check if remaining page space fits audit history & signature block; if not, add page
    let currentY = finalY + 5;
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 16;
    }

    // ==========================================
    // 6. AUDIT HISTORY & CHAIN OF CUSTODY
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Audit History & Chain of Custody', margin, currentY);
    currentY += 2.5;

    const auditRows = bidCase.auditTrail.map((entry) => [
      new Date(entry.timestamp).toLocaleString('en-GB'),
      entry.action,
      `${entry.userName} (${entry.userRole})`,
      entry.details,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Timestamp (UTC)', 'Action', 'Actor & Role', 'System Audit Details']],
      body: auditRows,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 6.5,
        cellPadding: 1.5,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        fontStyle: 'bold',
        fontSize: 6.8,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 32, fontStyle: 'bold' },
        2: { cellWidth: 34 },
        3: { cellWidth: 'auto' },
      },
    });

    const afterAuditY = (doc as any).lastAutoTable?.finalY || currentY + 25;
    let sigY = afterAuditY + 8;
    if (sigY > pageHeight - 35) {
      doc.addPage();
      sigY = 16;
    }

    // ==========================================
    // 7. SIGNATURE & DECISION BLOCK
    // ==========================================
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, sigY, pageWidth - margin, sigY);
    sigY += 5;

    // Left Signature: Assigned Procurement Officer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('ASSIGNED PROCUREMENT OFFICER (DEMO SIMULATION)', margin, sigY);
    sigY += 4.5;

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const officerName =
      bidCase.assignedOfficer?.includes('[Demo') || bidCase.assignedOfficer?.includes('Demo')
        ? bidCase.assignedOfficer
        : `${bidCase.assignedOfficer} [Demo Officer Profile]`;
    doc.text(officerName, margin, sigY);
    sigY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('CGPDTM Procurement Division (Prototype Evaluation Role)', margin, sigY);
    sigY += 7;

    doc.setDrawColor(148, 163, 184);
    doc.line(margin, sigY, margin + 45, sigY);
    doc.text('Officer Signature & Stamp', margin, sigY + 3.5);

    // Right Signature: Competent Authority Approval
    const rightSigX = pageWidth - margin - 65;
    let rightSigY = sigY - 15.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('COMPETENT PROCUREMENT AUTHORITY', rightSigX, rightSigY);
    rightSigY += 4.5;

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Senior Procurement Authority [Demo Role]', rightSigX, rightSigY);
    rightSigY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('GeM Tender Evaluation Committee (Demo Sign-Off)', rightSigX, rightSigY);
    rightSigY += 7;

    doc.setDrawColor(148, 163, 184);
    doc.line(rightSigX, rightSigY, rightSigX + 45, rightSigY);
    doc.text('Date & Official Seal', rightSigX, rightSigY + 3.5);

    // ==========================================
    // 8. PAGE FOOTER (Page X of Y)
    // ==========================================
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `BidSure SIH 2026 Prototype • GeM Bid Compliance Verification Report • Case Ref: ${bidCase.id}`,
        margin,
        pageHeight - 6
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }

    const filename = `BidSure_GeM_Compliance_Report_${bidCase.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    // Trigger save / blob generation
    const blob = doc.output('blob');

    // Trigger automatic download via Anchor element with Blob URL in browser
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    }

    return {
      success: true,
      filename,
      blob,
    };
  } catch (err: any) {
    console.error('PDF Generation Error:', err);
    return {
      success: false,
      filename: `BidSure_GeM_Compliance_Report_${bidCase.id}.pdf`,
      error: err?.message || 'Failed to generate PDF',
    };
  }
}
