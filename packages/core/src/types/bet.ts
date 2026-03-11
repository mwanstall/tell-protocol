import type { BetStatus, InvestmentStage, ConfidenceSource } from './enums.js';
import type { Assumption } from './assumption.js';
import type { ResourceAllocation } from './resource-allocation.js';

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
  time_horizon?: TimeHorizon;
  owner?: string;
  resource_allocations?: ResourceAllocation[];
  assumptions: Assumption[];
  tags?: string[];
  created_at: string;
  updated_at: string;
  extensions?: Record<string, unknown>;
}
