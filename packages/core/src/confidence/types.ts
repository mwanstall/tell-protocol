import type { Assumption } from '../types/index.js';

export interface ConfidenceStrategy {
  calculateBetConfidence(assumptions: Assumption[]): number;
}
