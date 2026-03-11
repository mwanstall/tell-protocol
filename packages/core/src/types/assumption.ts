import type { AssumptionStatus, ConfidenceSource } from './enums.js';
import type { Evidence } from './evidence.js';

export interface Assumption {
  id: string;
  statement: string;
  status: AssumptionStatus;
  status_source?: ConfidenceSource;
  evidence_threshold?: string;
  bet_ids: string[];
  owner?: string;
  last_signal_at?: string;
  evidence: Evidence[];
  created_at: string;
  extensions?: Record<string, unknown>;
}
