import type { AssumptionStatus } from '../types/index.js';
import type { ConfidenceStrategy } from './types.js';
import type { Assumption } from '../types/index.js';

const STATUS_WEIGHTS: Record<AssumptionStatus, number> = {
  holding: 75,
  pressure: 40,
  failing: 5,
  unknown: 30,
};

/**
 * Simple status-weighted confidence algorithm.
 * Calculates bet confidence as the average of assumption status weights.
 * This is the legacy algorithm from the Apophenic prototype.
 */
export const statusWeightedStrategy: ConfidenceStrategy = {
  calculateBetConfidence(assumptions: Assumption[]): number {
    if (assumptions.length === 0) return 50;
    const total = assumptions.reduce((sum, a) => sum + STATUS_WEIGHTS[a.status], 0);
    return Math.round(total / assumptions.length);
  },
};
