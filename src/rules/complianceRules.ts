/**
 * SIH26100 GeM Procurement Compliance Rules Definition
 * Pre-Qualification & Technical Evaluation Criteria for GeM Bid GEM/2026/B/7878577
 * Organisation: Controller General of Patents Designs and Trade Marks (CGPDTM), Mumbai
 * Service: Hiring of Agency for IT Projects — Milestone Basis (₹99,12,000)
 */

import { ComplianceRequirement } from '../models/types';

export const STANDARD_COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  {
    id: 'REQ-ENTITY-01',
    code: 'GEM-ENTITY-01',
    title: 'Indian Entity Registration & Active GST / PAN',
    description: 'Bidder must be an Indian origin / registered Indian entity under applicable laws and registered with GST authorities with a valid PAN (Annexure-II).',
    category: 'Entity Eligibility',
    isMandatory: true,
    ruleType: 'REGEX_PATTERN',
  },
  {
    id: 'REQ-TURNOVER-02',
    code: 'GEM-TURNOVER-02',
    title: 'Minimum Average Annual Turnover (₹25 Lakh for 3 Years)',
    description: 'Bidder must have average annual turnover of at least ₹25 Lakh across the last 3 financial years (FY 2022-23, FY 2023-24, FY 2024-25) certified by CA.',
    category: 'Financial Capability',
    isMandatory: true,
    ruleType: 'NUMERIC_THRESHOLD',
  },
  {
    id: 'REQ-DEBARMENT-03',
    code: 'GEM-DEBARMENT-03',
    title: 'Non-Blacklisting & Debarment Self-Declaration',
    description: 'Bidder must submit signed self-declaration certifying non-blacklisting/non-debarment by Central/State Govt/PSU in last 5 financial years as of bid submission date.',
    category: 'Statutory Compliance',
    isMandatory: true,
    ruleType: 'DECLARATION_CHECK',
  },
  {
    id: 'REQ-SIMILAR-EXP-04',
    code: 'GEM-SIMILAR-EXP-04',
    title: 'Similar Govt / PSU Project Experience (1≥80%, 2≥50%, or 3≥40%)',
    description: 'Past experience in supply/development & maintenance of Finance Management Module (FMM) or similar work for Govt/PSU in last 3 FYs.',
    category: 'Technical Experience',
    isMandatory: true,
    ruleType: 'EXPERIENCE_THRESHOLD',
  },
  {
    id: 'REQ-FIVE-YEARS-05',
    code: 'GEM-FIVE-YEARS-05',
    title: 'Minimum 5 Years Sector Experience & 5 Completed Projects',
    description: 'Bidder must have minimum 5 years domain experience in FMM / similar projects for Govt/PSU with details of at least five similar projects.',
    category: 'Technical Experience',
    isMandatory: true,
    ruleType: 'EXPERIENCE_YEARS',
  },
  {
    id: 'REQ-IT-PROF-06',
    code: 'GEM-IT-PROF-06',
    title: 'Minimum 30 Qualified IT Professionals & Proposed CVs',
    description: 'Bidder must possess and deploy at least 30 qualified IT professionals with expertise in Application Dev, Cloud, Cyber Security, API integration, and UI/UX.',
    category: 'Resource Capability',
    isMandatory: true,
    ruleType: 'NUMERIC_HEADCOUNT',
  },
  {
    id: 'REQ-CERT-07',
    code: 'GEM-CERT-07',
    title: 'Quality Certifications: CMMI Level 3+, ISO 9001:2015 & ISO 27001:2022',
    description: 'Bidder must possess valid CMMI Level 3 or above, ISO 9001:2015 (Quality), and ISO 27001:2022 (Information Security) certificates.',
    category: 'Quality Standards',
    isMandatory: true,
    ruleType: 'CERTIFICATION_CHECK',
  },
  {
    id: 'REQ-CSP-AUTH-08',
    code: 'GEM-CSP-AUTH-08',
    title: 'MeitY-Empanelled Cloud Service Provider (CSP) Authorization',
    description: 'Bidder must have valid authorization from a MeitY-empanelled Cloud Service Provider OR be a MeitY-empanelled CSP itself.',
    category: 'Cloud Infrastructure',
    isMandatory: true,
    ruleType: 'AUTHORIZATION_CHECK',
  },
  {
    id: 'REQ-FIN-HEALTH-09',
    code: 'GEM-FIN-HEALTH-09',
    title: 'Financial Health: Profit After Tax (PAT) in 3 of Last 5 Audited FYs',
    description: 'Bidder must not have incurred losses in more than two years (positive PAT required in at least 3 years) during FY 2020-21 to FY 2024-25.',
    category: 'Financial Capability',
    isMandatory: true,
    ruleType: 'FINANCIAL_HEALTH_CHECK',
  },
  {
    id: 'REQ-TERMS-10',
    code: 'GEM-TERMS-10',
    title: 'Acceptance of Tender Terms, ATC & Scope of Work',
    description: 'Properly filled, signed, and stamped acceptance of complete GeM bid terms, Scope of Work, Payment Terms, and Additional Terms & Conditions (ATC).',
    category: 'Commercial Compliance',
    isMandatory: true,
    ruleType: 'DECLARATION_CHECK',
  },
  {
    id: 'REQ-EMD-11',
    code: 'GEM-EMD-11',
    title: 'Earnest Money Deposit (EMD) ₹3,50,000 / Valid Exemption',
    description: 'Submission of mandatory EMD of ₹3,50,000 via Bank Guarantee/Advisory Bank or valid statutory MSME / Startup exemption documentation.',
    category: 'Earnest Money Deposit',
    isMandatory: true,
    ruleType: 'EMD_CHECK',
  },
  {
    id: 'REQ-MII-12',
    code: 'GEM-MII-12',
    title: 'Make in India (MII) Local Content Declaration (≥ 20%)',
    description: 'Self-declaration certifying local content percentage meets or exceeds tender minimum threshold (≥ 20% Local Content under MII policy).',
    category: 'Local Content Preference',
    isMandatory: true,
    ruleType: 'NUMERIC_THRESHOLD',
  },
  {
    id: 'REQ-ANNEX-13',
    code: 'GEM-ANNEX-13',
    title: 'Duly Executed Annexure-IV & Annexure-V Submissions',
    description: 'Submission of duly filled, signed, and stamped Annexure-IV (Financial Breakup Format) and Annexure-V (Technical Compliance Undertaking).',
    category: 'Tender Annexures',
    isMandatory: true,
    ruleType: 'MANDATORY_DOC_PRESENCE',
  },
];

export const REGEX_PATTERNS = {
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  UDYAM: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/,
};
