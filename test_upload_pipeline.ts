import { MOCK_BID_CASES } from './src/data/mockCases';
import { ruleEngine } from './src/rules/ruleEngine';
import { STANDARD_COMPLIANCE_REQUIREMENTS } from './src/rules/complianceRules';

console.log('====================================================');
console.log('RUNNING SIH UPLOADED-DOCUMENT PIPELINE TEST SUITE');
console.log('====================================================\n');

const asterNovaCase = MOCK_BID_CASES[0];
const allAsterNovaDocs = asterNovaCase.documents;

// TEST A: Full synthetic packet upload (14 documents)
const testA_findings = ruleEngine.evaluateBidCompliance({
  tenderId: 'GEM/2026/B/7878577',
  submissionDate: '2026-08-20',
  requiredLocalContentPercentage: 20,
  bidderLegalName: 'AsterNova Digital Solutions Pvt. Ltd.',
  bidderGstin: '27AABCA9012E1Z8',
  bidderPan: 'AABCA9012E',
  documents: allAsterNovaDocs,
  requirements: STANDARD_COMPLIANCE_REQUIREMENTS,
});

const verifiedA = testA_findings.filter((f) => f.status === 'VERIFIED' || f.status === 'VERIFIED_AFTER_NORMALIZATION').length;
const needsReviewA = testA_findings.filter((f) => f.status === 'NEEDS_REVIEW' || f.status === 'NEEDS_MANUAL_REVIEW' || f.status === 'MISSING').length;
const mismatchA = testA_findings.filter((f) => f.status === 'INCONSISTENT' || f.status === 'EXPIRED_INVALID' || f.status === 'ACTION_REQUIRED').length;

console.log(`TEST A Result (Full Packet - 14 Docs):`);
console.log(`  VERIFIED: ${verifiedA}`);
console.log(`  NEEDS REVIEW: ${needsReviewA}`);
console.log(`  MISMATCH: ${mismatchA}`);
console.log(`  Total Evaluated: ${testA_findings.length}\n`);

// TEST B: Temporarily remove MII PDF
const docsWithoutMii = allAsterNovaDocs.filter((d) => d.id !== 'DOC-AST-MII' && !d.fileName.includes('Make_In_India'));
const testB_findings = ruleEngine.evaluateBidCompliance({
  tenderId: 'GEM/2026/B/7878577',
  submissionDate: '2026-08-20',
  requiredLocalContentPercentage: 20,
  bidderLegalName: 'AsterNova Digital Solutions Pvt. Ltd.',
  bidderGstin: '27AABCA9012E1Z8',
  bidderPan: 'AABCA9012E',
  documents: docsWithoutMii,
  requirements: STANDARD_COMPLIANCE_REQUIREMENTS,
});

const miiFindingB = testB_findings.find((f) => f.requirementId === 'REQ-MII-12');
console.log(`TEST B Result (MII PDF Removed):`);
console.log(`  REQ-MII-12 Status: ${miiFindingB?.status}`);
console.log(`  Extracted Value: ${miiFindingB?.extractedValue}`);
console.log(`  Reason: ${miiFindingB?.reason}\n`);

// TEST C: Temporarily remove EMD PDF
const docsWithoutEmd = allAsterNovaDocs.filter((d) => d.id !== 'DOC-AST-EMD' && !d.fileName.includes('EMD'));
const testC_findings = ruleEngine.evaluateBidCompliance({
  tenderId: 'GEM/2026/B/7878577',
  submissionDate: '2026-08-20',
  requiredLocalContentPercentage: 20,
  bidderLegalName: 'AsterNova Digital Solutions Pvt. Ltd.',
  bidderGstin: '27AABCA9012E1Z8',
  bidderPan: 'AABCA9012E',
  documents: docsWithoutEmd,
  requirements: STANDARD_COMPLIANCE_REQUIREMENTS,
});

const emdFindingC = testC_findings.find((f) => f.requirementId === 'REQ-EMD-11');
console.log(`TEST C Result (EMD PDF Removed):`);
console.log(`  REQ-EMD-11 Status: ${emdFindingC?.status}`);
console.log(`  Extracted Value: ${emdFindingC?.extractedValue}`);
console.log(`  Reason: ${emdFindingC?.reason}\n`);

// TEST D: Change MII percentage in uploaded document to 15%
const modifiedMiiDoc = {
  ...allAsterNovaDocs.find((d) => d.id === 'DOC-AST-MII')!,
  extractedFields: {
    localContentPercentage: 15.0,
    signatoryName: 'AsterNova Digital Solutions Pvt. Ltd.',
  },
  ocrExtractedText: 'Declared Local Content: 15.0% (Below required 20% minimum).',
};
const docsWith15Mii = allAsterNovaDocs.map((d) => (d.id === 'DOC-AST-MII' ? modifiedMiiDoc : d));

const testD_findings = ruleEngine.evaluateBidCompliance({
  tenderId: 'GEM/2026/B/7878577',
  submissionDate: '2026-08-20',
  requiredLocalContentPercentage: 20,
  bidderLegalName: 'AsterNova Digital Solutions Pvt. Ltd.',
  bidderGstin: '27AABCA9012E1Z8',
  bidderPan: 'AABCA9012E',
  documents: docsWith15Mii,
  requirements: STANDARD_COMPLIANCE_REQUIREMENTS,
});

const miiFindingD = testD_findings.find((f) => f.requirementId === 'REQ-MII-12');
console.log(`TEST D Result (MII Changed to 15%):`);
console.log(`  REQ-MII-12 Status: ${miiFindingD?.status}`);
console.log(`  Extracted Value: ${miiFindingD?.extractedValue}`);
console.log(`  Reason: ${miiFindingD?.reason}\n`);

console.log('====================================================');
console.log('ALL TESTS EXECUTED SUCCESSFULLY!');
console.log('====================================================');
