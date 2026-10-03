/**
 * SIH26100 Phase 2 Deterministic Test Cases
 * 10 Test Bench Scenarios for Rule Engine & Cross-Document Verification
 */

export interface RuleTestCase {
  id: string;
  testTitle: string;
  category: string;
  expectedStatus: 'VERIFIED' | 'INCONSISTENT' | 'EXPIRED_INVALID' | 'MISSING' | 'NEEDS_REVIEW';
  inputSummary: string;
  ruleTested: string;
  testData: any;
}

export const DETERMINISTIC_TEST_CASES: RuleTestCase[] = [
  {
    id: 'TC-01',
    testTitle: '1. Valid GSTIN Format Check',
    category: 'GSTIN Validation',
    expectedStatus: 'VERIFIED',
    inputSummary: 'GSTIN: 33AAACA1234F1Z8 (Valid Tamil Nadu code 33 + 10-char PAN AAACA1234F)',
    ruleTested: 'REGEX_PATTERN_VALIDATION',
    testData: { gstin: '33AAACA1234F1Z8' },
  },
  {
    id: 'TC-02',
    testTitle: '2. Invalid GSTIN Format Structure',
    category: 'GSTIN Validation',
    expectedStatus: 'INCONSISTENT',
    inputSummary: 'GSTIN: 33AAACA1234F999 (Invalid check-digit / structure)',
    ruleTested: 'REGEX_PATTERN_VALIDATION',
    testData: { gstin: '33AAACA1234F999' },
  },
  {
    id: 'TC-03',
    testTitle: '3. Valid PAN Format Check',
    category: 'PAN Validation',
    expectedStatus: 'VERIFIED',
    inputSummary: 'PAN: AAACA1234F (Valid 5 letters, 4 digits, 1 letter)',
    ruleTested: 'REGEX_PATTERN_VALIDATION',
    testData: { pan: 'AAACA1234F' },
  },
  {
    id: 'TC-04',
    testTitle: '4. Missing Required OEM Authorization Document',
    category: 'Mandatory Document Presence',
    expectedStatus: 'MISSING',
    inputSummary: 'Mandatory OEM Authorization Form absent from submitted package',
    ruleTested: 'MANDATORY_DOC_PRESENCE',
    testData: { docCategory: 'OEM_AUTHORIZATION', isPresent: false },
  },
  {
    id: 'TC-05',
    testTitle: '5. Expired EPFO Compliance Certificate',
    category: 'Date Validity Check',
    expectedStatus: 'EXPIRED_INVALID',
    inputSummary: 'EPFO Expiry: 2025-12-31 vs Bid Submission Date: 2026-09-29',
    ruleTested: 'DATE_VALIDITY_CHECK (< Submission Date)',
    testData: { expiryDate: '2025-12-31', submissionDate: '2026-09-29' },
  },
  {
    id: 'TC-06',
    testTitle: '6. Consistent Entity Names After Normalization',
    category: 'Cross-Document Matching',
    expectedStatus: 'VERIFIED',
    inputSummary: 'GST: "Apex Valve Systems India Private Limited" vs MII: "Apex Valve Systems India Pvt Ltd"',
    ruleTested: 'CROSS_DOC_ENTITY_NAME_MATCH (Suffix Normalization)',
    testData: {
      nameA: 'Apex Valve Systems India Private Limited',
      nameB: 'Apex Valve Systems India Pvt Ltd',
    },
  },
  {
    id: 'TC-07',
    testTitle: '7. Potential Entity Name Mismatch',
    category: 'Cross-Document Matching',
    expectedStatus: 'INCONSISTENT',
    inputSummary: 'GST: "Apex Valve Systems India Pvt Ltd" vs MII: "Apex Industrial Controls Ltd"',
    ruleTested: 'CROSS_DOC_ENTITY_NAME_MATCH',
    testData: {
      nameA: 'Apex Valve Systems India Pvt Ltd',
      nameB: 'Apex Industrial Controls Ltd',
    },
  },
  {
    id: 'TC-08',
    testTitle: '8. Low Confidence OCR Scan (< 60%)',
    category: 'Confidence Thresholding',
    expectedStatus: 'NEEDS_REVIEW',
    inputSummary: 'Blurry scanned OEM Authorization letter with 58% OCR confidence score',
    ruleTested: 'AI_CLAUSE_CONFIDENCE_THRESHOLD (< 65%)',
    testData: { confidence: 0.58 },
  },
  {
    id: 'TC-09',
    testTitle: '9. Local Content Threshold Satisfied',
    category: 'Tender Threshold Check',
    expectedStatus: 'VERIFIED',
    inputSummary: 'Declared Local Content: 68.0% vs Tender Required Threshold: 20.0%',
    ruleTested: 'NUMERIC_THRESHOLD (>= Required %)',
    testData: { declared: 68.0, required: 20.0 },
  },
  {
    id: 'TC-10',
    testTitle: '10. Local Content Threshold Not Satisfied',
    category: 'Tender Threshold Check',
    expectedStatus: 'INCONSISTENT',
    inputSummary: 'Declared Local Content: 14.0% vs Tender Required Threshold: 20.0%',
    ruleTested: 'NUMERIC_THRESHOLD (>= Required %)',
    testData: { declared: 14.0, required: 20.0 },
  },
];
