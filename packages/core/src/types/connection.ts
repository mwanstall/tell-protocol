import type {
  ConnectionType,
  ConnectionStatus,
  ConnectionSeverity,
  IdentifiedBy,
} from './enums.js';

export interface Connection {
  id: string;
  type: ConnectionType;
  bet_ids: [string, string];
  description: string;
  severity?: ConnectionSeverity;
  status?: ConnectionStatus;
  identified_by?: IdentifiedBy;
  created_at: string;
  updated_at?: string;
  extensions?: Record<string, unknown>;
}
