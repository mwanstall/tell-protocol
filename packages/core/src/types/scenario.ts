import type { BetStatus, ScenarioStatus, ScenarioInclusion } from './enums.js';

export interface ScenarioBet {
  bet_id: string;
  inclusion: ScenarioInclusion;
  confidence_override?: number;
  status_override?: BetStatus;
  notes?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  modifications: ScenarioBet[];
  implications?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  extensions?: Record<string, unknown>;
}
