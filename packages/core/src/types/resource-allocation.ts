import type { ResourceType, ResourcePeriod } from './enums.js';

export interface ResourceAllocation {
  id: string;
  bet_id: string;
  resource_type: ResourceType;
  label: string;
  amount: number;
  unit: string;
  period?: ResourcePeriod;
  notes?: string;
  created_at: string;
  updated_at?: string;
}
