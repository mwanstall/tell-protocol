import { describe, it, expect } from 'vitest';
import { evidenceWeightedStrategy } from '../../src/confidence/index.js';
import type { Assumption } from '../../src/types/index.js';

const now = new Date().toISOString();
const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
const ninetyOneDaysAgo = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();

function makeAssumption(overrides?: Partial<Assumption>): Assumption {
  return {
    id: 'asm_test',
    statement: 'Test assumption',
    status: 'unknown',
    bet_ids: ['bet_1'],
    evidence: [],
    created_at: now,
    ...overrides,
  };
}

describe('evidenceWeightedStrategy', () => {
  it('returns 50 for no assumptions', () => {
    expect(evidenceWeightedStrategy.calculateBetConfidence([])).toBe(50);
  });

  it('returns status weight when no evidence', () => {
    const holding = makeAssumption({ status: 'holding' });
    const result = evidenceWeightedStrategy.calculateBetConfidence([holding]);
    // With no evidence, should return status weight (holding = 75)
    expect(result).toBe(75);
  });

  it('increases confidence with supporting evidence', () => {
    const assumption = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_1',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'supports',
          confidence: 'high',
          summary: 'Positive signal',
          timestamp: now,
          recorded_at: now,
        },
      ],
    });
    const result = evidenceWeightedStrategy.calculateBetConfidence([assumption]);
    // Blended: 0.3 * 30 (unknown) + 0.7 * clamp(50 + 1*1*1*10, 0, 100)
    // = 9 + 0.7 * 60 = 9 + 42 = 51
    expect(result).toBe(51);
  });

  it('decreases confidence with weakening evidence', () => {
    const assumption = makeAssumption({
      status: 'holding',
      evidence: [
        {
          id: 'ev_1',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'weakens',
          confidence: 'high',
          summary: 'Negative signal',
          timestamp: now,
          recorded_at: now,
        },
      ],
    });
    const result = evidenceWeightedStrategy.calculateBetConfidence([assumption]);
    // Blended: 0.3 * 75 (holding) + 0.7 * clamp(50 + (-1)*1*1*10, 0, 100)
    // = 22.5 + 0.7 * 40 = 22.5 + 28 = 50.5 -> 51
    expect(result).toBe(51);
  });

  it('applies recency decay for old evidence (>30 days)', () => {
    const recent = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_1',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'supports',
          confidence: 'high',
          summary: 'Recent',
          timestamp: now,
          recorded_at: now,
        },
      ],
    });
    const old = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_2',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'supports',
          confidence: 'high',
          summary: 'Old',
          timestamp: thirtyOneDaysAgo,
          recorded_at: thirtyOneDaysAgo,
        },
      ],
    });

    const recentScore = evidenceWeightedStrategy.calculateBetConfidence([recent]);
    const oldScore = evidenceWeightedStrategy.calculateBetConfidence([old]);
    expect(recentScore).toBeGreaterThan(oldScore);
  });

  it('applies stronger decay for very old evidence (>90 days)', () => {
    const thirtyDays = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_1',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'supports',
          confidence: 'high',
          summary: '31 days old',
          timestamp: thirtyOneDaysAgo,
          recorded_at: thirtyOneDaysAgo,
        },
      ],
    });
    const ninetyDays = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_2',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'supports',
          confidence: 'high',
          summary: '91 days old',
          timestamp: ninetyOneDaysAgo,
          recorded_at: ninetyOneDaysAgo,
        },
      ],
    });

    const thirtyScore = evidenceWeightedStrategy.calculateBetConfidence([thirtyDays]);
    const ninetyScore = evidenceWeightedStrategy.calculateBetConfidence([ninetyDays]);
    expect(thirtyScore).toBeGreaterThan(ninetyScore);
  });

  it('excludes retracted evidence', () => {
    const withRetracted = makeAssumption({
      status: 'unknown',
      evidence: [
        {
          id: 'ev_1',
          assumption_ids: ['asm_test'],
          source_type: 'human',
          contributor_id: 'ctr_1',
          signal: 'weakens',
          confidence: 'high',
          summary: 'This was retracted',
          timestamp: now,
          recorded_at: now,
          is_retracted: true,
        },
      ],
    });
    const noEvidence = makeAssumption({ status: 'unknown' });

    const withRetractedScore = evidenceWeightedStrategy.calculateBetConfidence([withRetracted]);
    const noEvidenceScore = evidenceWeightedStrategy.calculateBetConfidence([noEvidence]);
    // Retracted evidence should be ignored, so scores should match
    expect(withRetractedScore).toBe(noEvidenceScore);
  });

  it('averages across multiple assumptions', () => {
    const a1 = makeAssumption({
      id: 'asm_1',
      status: 'holding',
      evidence: [],
    });
    const a2 = makeAssumption({
      id: 'asm_2',
      status: 'failing',
      evidence: [],
    });
    const result = evidenceWeightedStrategy.calculateBetConfidence([a1, a2]);
    // (75 + 5) / 2 = 40
    expect(result).toBe(40);
  });
});
