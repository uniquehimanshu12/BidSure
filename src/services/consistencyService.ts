/**
 * SIH26100 Cross-Document Entity Name Consistency Service
 * Normalizes legal suffixes, punctuation, and whitespace to prevent false mismatches
 */

import { EntityNormalizationStatus } from '../models/types';

export interface EntityComparisonResult {
  status: EntityNormalizationStatus;
  rawNameA: string;
  rawNameB: string;
  normalizedNameA: string;
  normalizedNameB: string;
  matchScore: number; // 0 to 1
  explanation: string;
}

export class ConsistencyService {
  /**
   * Clean and normalize legal entity names for robust government document matching
   */
  public normalizeEntityName(rawName: string): string {
    if (!rawName) return '';

    let cleaned = rawName.trim().toUpperCase();

    // Remove punctuation (commas, dots, dashes, slashes)
    cleaned = cleaned.replace(/[.,\-\/\(\)]/g, ' ');

    // Normalize common Indian & global legal corporate suffixes
    const suffixMap: Array<[RegExp, string]> = [
      [/\bPRIVATE LIMITED\b/g, 'PVT LTD'],
      [/\bPVT LIMITED\b/g, 'PVT LTD'],
      [/\bPVT LTD\b/g, 'PVT LTD'],
      [/\bLIMITED\b/g, 'LTD'],
      [/\bLTD\b/g, 'LTD'],
      [/\bCORPORATION\b/g, 'CORP'],
      [/\bINCORPORATED\b/g, 'INC'],
      [/\bCOMPANY\b/g, 'CO'],
      [/\bENTERPRISES\b/g, 'ENT'],
    ];

    for (const [regex, replacement] of suffixMap) {
      cleaned = cleaned.replace(regex, replacement);
    }

    // Collapse multiple whitespaces
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  /**
   * Compare two entity names extracted from different statutory documents
   */
  public compareEntityNames(
    sourceA: string,
    nameA: string,
    sourceB: string,
    nameB: string
  ): EntityComparisonResult {
    if (!nameA || !nameB) {
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        rawNameA: nameA || 'N/A',
        rawNameB: nameB || 'N/A',
        normalizedNameA: '',
        normalizedNameB: '',
        matchScore: 0,
        explanation: 'One or both document entity names are missing or unreadable.',
      };
    }

    const exactMatch = nameA.trim().toUpperCase() === nameB.trim().toUpperCase();
    if (exactMatch) {
      return {
        status: 'CONSISTENT',
        rawNameA: nameA,
        rawNameB: nameB,
        normalizedNameA: this.normalizeEntityName(nameA),
        normalizedNameB: this.normalizeEntityName(nameB),
        matchScore: 1.0,
        explanation: `100% exact string match between ${sourceA} and ${sourceB}.`,
      };
    }

    const normA = this.normalizeEntityName(nameA);
    const normB = this.normalizeEntityName(nameB);

    if (normA === normB) {
      return {
        status: 'CONSISTENT_AFTER_NORMALIZATION',
        rawNameA: nameA,
        rawNameB: nameB,
        normalizedNameA: normA,
        normalizedNameB: normB,
        matchScore: 0.98,
        explanation: `Entity match confirmed after normalizing legal suffixes ("${nameA}" vs "${nameB}").`,
      };
    }

    // Levenshtein / Token similarity check
    const similarity = this.calculateTokenSimilarity(normA, normB);

    if (similarity >= 0.85) {
      return {
        status: 'CONSISTENT_AFTER_NORMALIZATION',
        rawNameA: nameA,
        rawNameB: nameB,
        normalizedNameA: normA,
        normalizedNameB: normB,
        matchScore: similarity,
        explanation: `Minor spelling or abbreviation variation (${(similarity * 100).toFixed(0)}% similarity).`,
      };
    } else if (similarity >= 0.6) {
      return {
        status: 'NEEDS_MANUAL_REVIEW',
        rawNameA: nameA,
        rawNameB: nameB,
        normalizedNameA: normA,
        normalizedNameB: normB,
        matchScore: similarity,
        explanation: `Partial name match (${(similarity * 100).toFixed(0)}%). Officer verification required.`,
      };
    } else {
      return {
        status: 'POTENTIAL_MISMATCH',
        rawNameA: nameA,
        rawNameB: nameB,
        normalizedNameA: normA,
        normalizedNameB: normB,
        matchScore: similarity,
        explanation: `Potential Legal Entity Discrepancy: ${sourceA} ("${nameA}") vs ${sourceB} ("${nameB}").`,
      };
    }
  }

  private calculateTokenSimilarity(strA: string, strB: string): number {
    const tokensA = new Set(strA.split(' '));
    const tokensB = new Set(strB.split(' '));

    let intersectionCount = 0;
    tokensA.forEach((token) => {
      if (tokensB.has(token)) intersectionCount++;
    });

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    return unionCount > 0 ? intersectionCount / unionCount : 0;
  }
}

export const consistencyService = new ConsistencyService();
