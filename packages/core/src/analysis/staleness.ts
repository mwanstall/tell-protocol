import type { Portfolio, Assumption } from '../types/index.js';
import { isStale } from '../utils/timestamp.js';

export const DEFAULT_STALENESS_THRESHOLD_DAYS = 14;

export interface StaleAssumption {
  assumption: Assumption;
  betId: string;
  betThesis: string;
  daysSinceLastSignal: number | null;
}

export function findStaleAssumptions(
  portfolio: Portfolio,
  thresholdDays: number = DEFAULT_STALENESS_THRESHOLD_DAYS,
): StaleAssumption[] {
  const results: StaleAssumption[] = [];

  for (const bet of portfolio.bets) {
    if (bet.status !== 'active') continue;

    for (const assumption of bet.assumptions) {
      if (isStale(assumption.last_signal_at, thresholdDays)) {
        let daysSince: number | null = null;
        if (assumption.last_signal_at) {
          const diff = Date.now() - new Date(assumption.last_signal_at).getTime();
          daysSince = Math.floor(diff / (1000 * 60 * 60 * 24));
        }
        results.push({
          assumption,
          betId: bet.id,
          betThesis: bet.thesis,
          daysSinceLastSignal: daysSince,
        });
      }
    }
  }

  return results;
}
