import type { ContributorType } from './enums.js';

export interface Contributor {
  id: string;
  type: ContributorType;
  name: string;
  role?: string;
  permissions?: Record<string, unknown>;
  last_active_at?: string;
  created_at: string;
  extensions?: Record<string, unknown>;
}
