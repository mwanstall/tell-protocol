import type { SignalDirection, SignalConfidence, SourceType } from './enums.js';

export interface Evidence {
  id: string;
  assumption_ids: string[];
  source_type: SourceType;
  contributor_id: string;
  signal: SignalDirection;
  confidence?: SignalConfidence;
  summary: string;
  data_ref?: string;
  timestamp: string;
  recorded_at: string;
  supersedes?: string;
  is_retracted?: boolean;
  extensions?: Record<string, unknown>;
}
