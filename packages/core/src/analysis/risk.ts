import type { Portfolio, Assumption, Connection } from '../types/index.js';

export interface SharedAssumption {
  assumption: Assumption;
  betIds: string[];
}

export interface RiskAssessment {
  sharedAssumptions: SharedAssumption[];
  resourceConflicts: Connection[];
  escalatedConnections: Connection[];
  failingAssumptions: Assumption[];
}

export function findSharedAssumptions(portfolio: Portfolio): SharedAssumption[] {
  const assumptionMap = new Map<string, { assumption: Assumption; betIds: Set<string> }>();

  for (const bet of portfolio.bets) {
    for (const assumption of bet.assumptions) {
      const existing = assumptionMap.get(assumption.id);
      if (existing) {
        existing.betIds.add(bet.id);
      } else {
        assumptionMap.set(assumption.id, {
          assumption,
          betIds: new Set(assumption.bet_ids),
        });
      }
    }
  }

  return Array.from(assumptionMap.values())
    .filter((entry) => entry.betIds.size > 1)
    .map((entry) => ({
      assumption: entry.assumption,
      betIds: Array.from(entry.betIds),
    }));
}

export function assessRisk(portfolio: Portfolio): RiskAssessment {
  const sharedAssumptions = findSharedAssumptions(portfolio);

  const resourceConflicts = portfolio.connections.filter(
    (c) => c.type === 'resource_conflict' && c.status !== 'resolved',
  );

  const escalatedConnections = portfolio.connections.filter(
    (c) => c.status === 'escalated',
  );

  const failingAssumptions: Assumption[] = [];
  for (const bet of portfolio.bets) {
    if (bet.status !== 'active') continue;
    for (const assumption of bet.assumptions) {
      if (assumption.status === 'failing') {
        failingAssumptions.push(assumption);
      }
    }
  }

  return {
    sharedAssumptions,
    resourceConflicts,
    escalatedConnections,
    failingAssumptions,
  };
}
