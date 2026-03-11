import type { ExperimentStatus, SignalDirection } from './enums.js';

export interface ExperimentOutcome {
  signal: SignalDirection;
  summary: string;
  concluded_at: string;
}

export interface Experiment {
  id: string;
  bet_id: string;
  assumption_ids: string[];
  hypothesis: string;
  method: string;
  success_criteria: string;
  failure_criteria?: string;
  status: ExperimentStatus;
  cost_ceiling?: string;
  time_box?: string;
  owner?: string;
  outcome?: ExperimentOutcome;
  created_at: string;
  updated_at: string;
  extensions?: Record<string, unknown>;
}
