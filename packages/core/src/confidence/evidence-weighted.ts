import type { Assumption, Evidence, AssumptionStatus, SignalDirection, SignalConfidence } from '../types/index.js';
import type { ConfidenceStrategy } from './types.js';
import { daysBetween } from '../utils/timestamp.js';

const SIGNAL_WEIGHTS: Record<SignalDirection, number> = {
  supports: 1,
  weakens: -1,
  neutral: 0,
};

const CONFIDENCE_MULTIPLIERS: Record<SignalConfidence, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.3,
};

const STATUS_WEIGHTS: Record<AssumptionStatus, number> = {
  holding: 75,
  pressure: 40,
  failing: 5,
  unknown: 30,
};

function recencyDecay(evidence: Evidence, now: Date): number {
  const age = daysBetween(evidence.timestamp, now);
  if (age > 90) return 0.25;
  if (age > 30) return 0.5;
  return 1.0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreAssumption(assumption: Assumption, now: Date): number {
  const activeEvidence = assumption.evidence.filter((e) => !e.is_retracted);

  if (activeEvidence.length === 0) {
    return STATUS_WEIGHTS[assumption.status];
  }

  // Calculate evidence-weighted score
  const weightedSum = activeEvidence.reduce((sum, ev) => {
    const signal = SIGNAL_WEIGHTS[ev.signal];
    const confidence = CONFIDENCE_MULTIPLIERS[ev.confidence || 'medium'];
    const decay = recencyDecay(ev, now);
    return sum + signal * confidence * decay;
  }, 0);

  const evidenceScore = clamp(50 + weightedSum * 10, 0, 100);

  // Blend: 30% status weight + 70% evidence score
  return 0.3 * STATUS_WEIGHTS[assumption.status] + 0.7 * evidenceScore;
}

/**
 * Evidence-weighted confidence algorithm from TELL spec v0.3 Section 2.4.
 *
 * Per-assumption scoring:
 * 1. Signal weight: supports=+1, weakens=-1, neutral=0
 * 2. Confidence multiplier: high=1.0, medium=0.6, low=0.3
 * 3. Recency decay: >30d=0.5x, >90d=0.25x
 * 4. Score = clamp(50 + sum_of_weighted * 10, 0, 100)
 * 5. Blend: 0.3 * status_weight + 0.7 * evidence_score
 *
 * Bet confidence = average of all assumption scores, rounded.
 */
export const evidenceWeightedStrategy: ConfidenceStrategy = {
  calculateBetConfidence(assumptions: Assumption[]): number {
    if (assumptions.length === 0) return 50;

    const now = new Date();
    const total = assumptions.reduce((sum, a) => sum + scoreAssumption(a, now), 0);
    return Math.round(total / assumptions.length);
  },
};
