import type { Bet } from './bet.js';
import type { Connection } from './connection.js';
import type { Contributor } from './contributor.js';
import type { Scenario } from './scenario.js';
import type { Experiment } from './experiment.js';

export interface Portfolio {
  id: string;
  name: string;
  organisation: string;
  description?: string;
  version: number;
  created_at: string;
  updated_at: string;
  bets: Bet[];
  connections: Connection[];
  contributors: Contributor[];
  scenarios?: Scenario[];
  experiments?: Experiment[];
  extensions?: Record<string, unknown>;
}

export interface TellDocument {
  tell_version: string;
  exported_at?: string;
  portfolio: Portfolio;
}
