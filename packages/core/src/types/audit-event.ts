import type { AuditEntityType, AuditAction } from './enums.js';

export interface AuditEvent {
  id: string;
  portfolio_id: string;
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditAction;
  previous_value?: string;
  new_value?: string;
  performed_by?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
