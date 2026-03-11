import { nanoid } from 'nanoid';

const PREFIXES = {
  portfolio: 'pf',
  bet: 'bet',
  assumption: 'asm',
  evidence: 'ev',
  connection: 'conn',
  scenario: 'sc',
  experiment: 'exp',
  contributor: 'ctr',
  resource_allocation: 'ra',
  audit_event: 'ae',
} as const;

export type EntityType = keyof typeof PREFIXES;

export function generateId(entityType: EntityType): string {
  return `${PREFIXES[entityType]}_${nanoid(12)}`;
}
