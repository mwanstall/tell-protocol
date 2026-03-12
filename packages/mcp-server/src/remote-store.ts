/**
 * RemoteStore — a TellStore implementation that reads/writes via the Apophenic platform API.
 *
 * Used by the MCP server when APOPHENIC_TOKEN + APOPHENIC_PORTFOLIO env vars are set,
 * allowing AI agents to connect to a cloud-hosted portfolio instead of a local .tell/ folder.
 *
 * Only the methods used by the MCP server are fully implemented.
 * All other TellStore methods throw an "unsupported" error.
 */
import type {
  TellStore,
  Portfolio,
  Bet,
  Assumption,
  Evidence,
  Connection,
  Scenario,
  Experiment,
  Contributor,
  AuditEvent,
  AssumptionStatus,
  ConfidenceSource,
  ConnectionStatus,
  ConnectionSeverity,
} from '@tell-protocol/core';

export class RemoteStore implements TellStore {
  private baseUrl: string;
  private token: string;
  private portfolioId: string;

  /** Cached portfolio to avoid repeated API calls within a short window */
  private cachedPortfolio: Portfolio | null = null;
  private cacheTimestamp = 0;
  private readonly cacheTtlMs = 30_000; // 30 seconds

  constructor(baseUrl: string, token: string, portfolioId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
    this.portfolioId = portfolioId;
  }

  // ── HTTP Helper ────────────────────────────────────────────────

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Apophenic API error ${res.status}: ${body}`);
    }
    return res;
  }

  // ── Portfolio (used by MCP: read_portfolio, read_stale, read_risk) ──

  async getPortfolio(): Promise<Portfolio> {
    const now = Date.now();
    if (this.cachedPortfolio && now - this.cacheTimestamp < this.cacheTtlMs) {
      return this.cachedPortfolio;
    }

    const res = await this.fetch(`/api/sync/pull/${this.portfolioId}`);
    const data = await res.json() as { portfolio: Portfolio; evidence: Record<string, Evidence[]> };

    // Merge evidence back into assumptions (the pull endpoint returns them separately)
    const portfolio = data.portfolio;
    for (const bet of portfolio.bets) {
      for (const assumption of bet.assumptions) {
        assumption.evidence = data.evidence[assumption.id] || [];
      }
    }

    this.cachedPortfolio = portfolio;
    this.cacheTimestamp = now;
    return portfolio;
  }

  async updatePortfolio(): Promise<Portfolio> {
    throw new Error('RemoteStore: updatePortfolio is not supported via MCP');
  }

  // ── Bets ──

  async getBets(): Promise<Bet[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.bets;
  }

  async getBet(id: string): Promise<Bet | null> {
    const portfolio = await this.getPortfolio();
    return portfolio.bets.find((b) => b.id === id) || null;
  }

  async addBet(): Promise<Bet> {
    throw new Error('RemoteStore: addBet is not supported via MCP');
  }

  async updateBet(): Promise<Bet> {
    throw new Error('RemoteStore: updateBet is not supported via MCP');
  }

  // ── Assumptions (used by MCP: read_assumption) ──

  async getAssumption(id: string): Promise<Assumption | null> {
    const portfolio = await this.getPortfolio();
    for (const bet of portfolio.bets) {
      const found = bet.assumptions.find((a) => a.id === id);
      if (found) return found;
    }
    return null;
  }

  async getAssumptionsForBet(betId: string): Promise<Assumption[]> {
    const portfolio = await this.getPortfolio();
    const bet = portfolio.bets.find((b) => b.id === betId);
    return bet?.assumptions || [];
  }

  async addAssumption(): Promise<Assumption> {
    throw new Error('RemoteStore: addAssumption is not supported via MCP');
  }

  async updateAssumptionStatus(): Promise<Assumption> {
    throw new Error('RemoteStore: updateAssumptionStatus is not supported via MCP');
  }

  async linkAssumptionToBet(): Promise<void> {
    throw new Error('RemoteStore: linkAssumptionToBet is not supported via MCP');
  }

  // ── Evidence (used by MCP: read_assumption, write_evidence) ──

  async getEvidence(assumptionId: string): Promise<Evidence[]> {
    const assumption = await this.getAssumption(assumptionId);
    return assumption?.evidence || [];
  }

  async appendEvidence(evidence: Omit<Evidence, 'id' | 'recorded_at'>): Promise<Evidence> {
    // Push evidence to the platform via the push endpoint
    // We send a minimal payload with just this evidence
    const res = await this.fetch('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({
        portfolio: { id: this.portfolioId },
        evidence: {
          [evidence.assumption_ids[0]]: [
            {
              ...evidence,
              id: `ev_${Date.now().toString(36)}`,
              recorded_at: new Date().toISOString(),
            },
          ],
        },
        remote_portfolio_id: this.portfolioId,
        evidence_only: true,
      }),
    });

    // Invalidate cache since we just wrote
    this.cachedPortfolio = null;

    const result = await res.json() as { portfolio_id: string };

    // Return a synthetic evidence record
    return {
      ...evidence,
      id: `ev_${Date.now().toString(36)}`,
      recorded_at: new Date().toISOString(),
    } as Evidence;
  }

  // ── Connections ──

  async getConnections(): Promise<Connection[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.connections;
  }

  async addConnection(): Promise<Connection> {
    throw new Error('RemoteStore: addConnection is not supported via MCP');
  }

  async updateConnection(): Promise<Connection> {
    throw new Error('RemoteStore: updateConnection is not supported via MCP');
  }

  // ── Scenarios ──

  async getScenarios(): Promise<Scenario[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.scenarios || [];
  }

  async addScenario(): Promise<Scenario> {
    throw new Error('RemoteStore: addScenario is not supported via MCP');
  }

  async enactScenario(): Promise<Portfolio> {
    throw new Error('RemoteStore: enactScenario is not supported via MCP');
  }

  // ── Experiments ──

  async getExperiments(): Promise<Experiment[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.experiments || [];
  }

  async getExperimentsForBet(betId: string): Promise<Experiment[]> {
    const experiments = await this.getExperiments();
    return experiments.filter((e) => e.bet_id === betId);
  }

  async addExperiment(): Promise<Experiment> {
    throw new Error('RemoteStore: addExperiment is not supported via MCP');
  }

  async updateExperiment(): Promise<Experiment> {
    throw new Error('RemoteStore: updateExperiment is not supported via MCP');
  }

  // ── Contributors ──

  async getContributors(): Promise<Contributor[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.contributors;
  }

  async addContributor(): Promise<Contributor> {
    throw new Error('RemoteStore: addContributor is not supported via MCP');
  }

  // ── Audit & Versioning ──

  async getAuditLog(): Promise<AuditEvent[]> {
    return []; // Audit log not available via remote API
  }

  async getPortfolioVersion(): Promise<number> {
    const res = await this.fetch(`/api/sync/status/${this.portfolioId}`);
    const data = await res.json() as { version: number };
    return data.version;
  }
}
