import type { BetStatus, InvestmentStage, ConfidenceSource } from './enums.js';
import type { Assumption } from './assumption.js';
import type { ResourceAllocation } from './resource-allocation.js';

/**
 * @deprecated Since v0.3. Express timelines as assumptions instead
 * (e.g. "Revenue reaches $1M by Q3 2027"). The platform layer extracts
 * temporal metadata from assumption text automatically.
 */
export interface TimeHorizon {
  start?: string;
  target?: string;
}

export interface Bet {
  id: string;
  thesis: string;
  status: BetStatus;
  stage?: InvestmentStage;
  confidence?: number;
  confidence_source?: ConfidenceSource;
  version?: number;
  /** @deprecated Since v0.3. Express timelines as assumptions instead. */
  time_horizon?: TimeHorizon;
  owner?: string;
  resource_allocations?: ResourceAllocation[];
  assumptions: Assumption[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  extensions?: Record<string, unknown>;
}
