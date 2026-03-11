import type { Portfolio } from '../types/index.js';

export interface PortfolioChange {
  type:
    | 'bet_added'
    | 'bet_removed'
    | 'bet_status_changed'
    | 'assumption_added'
    | 'assumption_removed'
    | 'connection_added'
    | 'connection_removed';
  entityId: string;
  description: string;
  from?: string;
  to?: string;
}

export interface PortfolioDiff {
  fromVersion: number;
  toVersion: number;
  changes: PortfolioChange[];
}

export function diffPortfolios(from: Portfolio, to: Portfolio): PortfolioDiff {
  const changes: PortfolioChange[] = [];

  const fromBetIds = new Set(from.bets.map((b) => b.id));
  const toBetIds = new Set(to.bets.map((b) => b.id));

  // Added bets
  for (const bet of to.bets) {
    if (!fromBetIds.has(bet.id)) {
      changes.push({
        type: 'bet_added',
        entityId: bet.id,
        description: bet.thesis,
      });
    }
  }

  // Removed bets
  for (const bet of from.bets) {
    if (!toBetIds.has(bet.id)) {
      changes.push({
        type: 'bet_removed',
        entityId: bet.id,
        description: bet.thesis,
      });
    }
  }

  // Status changes
  for (const toBet of to.bets) {
    const fromBet = from.bets.find((b) => b.id === toBet.id);
    if (fromBet && fromBet.status !== toBet.status) {
      changes.push({
        type: 'bet_status_changed',
        entityId: toBet.id,
        description: toBet.thesis,
        from: fromBet.status,
        to: toBet.status,
      });
    }
  }

  // Assumption changes
  const fromAssumptionIds = new Set<string>();
  const toAssumptionIds = new Set<string>();
  for (const bet of from.bets) {
    for (const asm of bet.assumptions) fromAssumptionIds.add(asm.id);
  }
  for (const bet of to.bets) {
    for (const asm of bet.assumptions) toAssumptionIds.add(asm.id);
  }

  for (const id of toAssumptionIds) {
    if (!fromAssumptionIds.has(id)) {
      changes.push({ type: 'assumption_added', entityId: id, description: '' });
    }
  }
  for (const id of fromAssumptionIds) {
    if (!toAssumptionIds.has(id)) {
      changes.push({ type: 'assumption_removed', entityId: id, description: '' });
    }
  }

  // Connection changes
  const fromConnIds = new Set(from.connections.map((c) => c.id));
  const toConnIds = new Set(to.connections.map((c) => c.id));

  for (const conn of to.connections) {
    if (!fromConnIds.has(conn.id)) {
      changes.push({
        type: 'connection_added',
        entityId: conn.id,
        description: conn.description,
      });
    }
  }
  for (const conn of from.connections) {
    if (!toConnIds.has(conn.id)) {
      changes.push({
        type: 'connection_removed',
        entityId: conn.id,
        description: conn.description,
      });
    }
  }

  return {
    fromVersion: from.version,
    toVersion: to.version,
    changes,
  };
}
