import type { Portfolio, BetStatus, AssumptionStatus } from '../types/index.js';
import { findStaleAssumptions, DEFAULT_STALENESS_THRESHOLD_DAYS } from './staleness.js';

export interface PortfolioHealth {
  totalBets: number;
  betsByStatus: Record<BetStatus, number>;
  totalAssumptions: number;
  assumptionsByStatus: Record<AssumptionStatus, number>;
  staleAssumptionCount: number;
  totalEvidence: number;
  totalConnections: number;
  averageConfidence: number | null;
}

export function portfolioHealth(
  portfolio: Portfolio,
  stalenessThresholdDays: number = DEFAULT_STALENESS_THRESHOLD_DAYS,
): PortfolioHealth {
  const betsByStatus: Record<BetStatus, number> = {
    active: 0,
    paused: 0,
    killed: 0,
    succeeded: 0,
  };

  const assumptionsByStatus: Record<AssumptionStatus, number> = {
    holding: 0,
    pressure: 0,
    failing: 0,
    unknown: 0,
  };

  let totalAssumptions = 0;
  let totalEvidence = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const bet of portfolio.bets) {
    betsByStatus[bet.status]++;

    if (bet.confidence !== undefined && bet.status === 'active') {
      confidenceSum += bet.confidence;
      confidenceCount++;
    }

    for (const assumption of bet.assumptions) {
      totalAssumptions++;
      assumptionsByStatus[assumption.status]++;
      totalEvidence += assumption.evidence.length;
    }
  }

  const staleAssumptions = findStaleAssumptions(portfolio, stalenessThresholdDays);

  return {
    totalBets: portfolio.bets.length,
    betsByStatus,
    totalAssumptions,
    assumptionsByStatus,
    staleAssumptionCount: staleAssumptions.length,
    totalEvidence,
    totalConnections: portfolio.connections.length,
    averageConfidence: confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : null,
  };
}
