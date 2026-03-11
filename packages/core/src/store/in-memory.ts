import type { TellStore } from './interface.js';
import type {
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
} from '../types/index.js';
import { generateId } from '../utils/id.js';
import { nowISO } from '../utils/timestamp.js';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export class InMemoryStore implements TellStore {
  private portfolio: Portfolio;
  private auditLog: AuditEvent[] = [];

  constructor(portfolio?: Partial<Portfolio>) {
    const now = nowISO();
    this.portfolio = {
      id: portfolio?.id || generateId('portfolio'),
      name: portfolio?.name || 'Untitled Portfolio',
      organisation: portfolio?.organisation || 'Unknown',
      description: portfolio?.description,
      version: portfolio?.version || 1,
      created_at: portfolio?.created_at || now,
      updated_at: portfolio?.updated_at || now,
      bets: portfolio?.bets || [],
      connections: portfolio?.connections || [],
      contributors: portfolio?.contributors || [],
      scenarios: portfolio?.scenarios || [],
      experiments: portfolio?.experiments || [],
      extensions: portfolio?.extensions,
    };
  }

  private incrementVersion(): void {
    this.portfolio.version++;
    this.portfolio.updated_at = nowISO();
  }

  private recordAudit(
    event: Omit<AuditEvent, 'id' | 'portfolio_id' | 'created_at'>,
  ): void {
    this.auditLog.push({
      id: generateId('audit_event'),
      portfolio_id: this.portfolio.id,
      created_at: nowISO(),
      ...event,
    });
  }

  private findBet(id: string): Bet | undefined {
    return this.portfolio.bets.find((b) => b.id === id);
  }

  private findAssumption(id: string): { assumption: Assumption; bet: Bet } | undefined {
    for (const bet of this.portfolio.bets) {
      const assumption = bet.assumptions.find((a) => a.id === id);
      if (assumption) return { assumption, bet };
    }
    return undefined;
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio> {
    return deepClone(this.portfolio);
  }

  async updatePortfolio(
    updates: Partial<Pick<Portfolio, 'name' | 'description' | 'organisation'>>,
  ): Promise<Portfolio> {
    Object.assign(this.portfolio, updates);
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'portfolio',
      entity_id: this.portfolio.id,
      action: 'modification',
      new_value: JSON.stringify(updates),
    });
    return deepClone(this.portfolio);
  }

  // Bets
  async getBets(): Promise<Bet[]> {
    return deepClone(this.portfolio.bets);
  }

  async getBet(id: string): Promise<Bet | null> {
    const bet = this.findBet(id);
    return bet ? deepClone(bet) : null;
  }

  async addBet(
    input: Omit<Bet, 'id' | 'created_at' | 'updated_at' | 'confidence' | 'confidence_source'>,
  ): Promise<Bet> {
    const now = nowISO();
    const bet: Bet = {
      id: generateId('bet'),
      created_at: now,
      updated_at: now,
      ...input,
    };
    this.portfolio.bets.push(bet);
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'bet',
      entity_id: bet.id,
      action: 'creation',
      new_value: bet.thesis,
    });
    return deepClone(bet);
  }

  async updateBet(
    id: string,
    updates: Partial<Pick<Bet, 'thesis' | 'status' | 'stage' | 'confidence' | 'confidence_source' | 'owner' | 'time_horizon' | 'tags'>>,
  ): Promise<Bet> {
    const bet = this.findBet(id);
    if (!bet) throw new Error(`Bet not found: ${id}`);

    const previousStatus = bet.status;
    Object.assign(bet, updates, { updated_at: nowISO() });
    this.incrementVersion();

    if (updates.status && updates.status !== previousStatus) {
      this.recordAudit({
        entity_type: 'bet',
        entity_id: id,
        action: 'status_change',
        previous_value: previousStatus,
        new_value: updates.status,
      });
    } else {
      this.recordAudit({
        entity_type: 'bet',
        entity_id: id,
        action: 'modification',
        new_value: JSON.stringify(updates),
      });
    }
    return deepClone(bet);
  }

  // Assumptions
  async getAssumption(id: string): Promise<Assumption | null> {
    const found = this.findAssumption(id);
    return found ? deepClone(found.assumption) : null;
  }

  async getAssumptionsForBet(betId: string): Promise<Assumption[]> {
    const bet = this.findBet(betId);
    if (!bet) return [];
    return deepClone(bet.assumptions);
  }

  async addAssumption(
    betId: string,
    input: Pick<Assumption, 'statement'> &
      Partial<Pick<Assumption, 'status' | 'evidence_threshold' | 'owner'>>,
  ): Promise<Assumption> {
    const bet = this.findBet(betId);
    if (!bet) throw new Error(`Bet not found: ${betId}`);

    const assumption: Assumption = {
      id: generateId('assumption'),
      statement: input.statement,
      status: input.status || 'unknown',
      evidence_threshold: input.evidence_threshold,
      bet_ids: [betId],
      owner: input.owner,
      evidence: [],
      created_at: nowISO(),
    };
    bet.assumptions.push(assumption);
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'assumption',
      entity_id: assumption.id,
      action: 'creation',
      new_value: assumption.statement,
    });
    return deepClone(assumption);
  }

  async updateAssumptionStatus(
    id: string,
    status: AssumptionStatus,
    source?: ConfidenceSource,
  ): Promise<Assumption> {
    const found = this.findAssumption(id);
    if (!found) throw new Error(`Assumption not found: ${id}`);

    const prev = found.assumption.status;
    found.assumption.status = status;
    if (source) found.assumption.status_source = source;
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'assumption',
      entity_id: id,
      action: 'status_change',
      previous_value: prev,
      new_value: status,
    });
    return deepClone(found.assumption);
  }

  async linkAssumptionToBet(assumptionId: string, betId: string): Promise<void> {
    const found = this.findAssumption(assumptionId);
    if (!found) throw new Error(`Assumption not found: ${assumptionId}`);
    const bet = this.findBet(betId);
    if (!bet) throw new Error(`Bet not found: ${betId}`);

    if (!found.assumption.bet_ids.includes(betId)) {
      found.assumption.bet_ids.push(betId);
    }
    // Add a reference to the assumption in the target bet if not already there
    if (!bet.assumptions.find((a) => a.id === assumptionId)) {
      bet.assumptions.push(found.assumption);
    }
    this.incrementVersion();
  }

  // Evidence (append-only, does NOT increment version)
  async getEvidence(assumptionId: string): Promise<Evidence[]> {
    const found = this.findAssumption(assumptionId);
    if (!found) return [];
    return deepClone(found.assumption.evidence);
  }

  async appendEvidence(
    input: Omit<Evidence, 'id' | 'recorded_at'>,
  ): Promise<Evidence> {
    const evidence: Evidence = {
      id: generateId('evidence'),
      recorded_at: nowISO(),
      ...input,
    };

    for (const asmId of input.assumption_ids) {
      const found = this.findAssumption(asmId);
      if (found) {
        found.assumption.evidence.push(evidence);
        found.assumption.last_signal_at = evidence.timestamp;
      }
    }

    // Evidence writes do NOT increment portfolio version
    return deepClone(evidence);
  }

  // Connections
  async getConnections(): Promise<Connection[]> {
    return deepClone(this.portfolio.connections);
  }

  async addConnection(
    input: Omit<Connection, 'id' | 'created_at'>,
  ): Promise<Connection> {
    const connection: Connection = {
      id: generateId('connection'),
      created_at: nowISO(),
      ...input,
    };
    this.portfolio.connections.push(connection);
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'connection',
      entity_id: connection.id,
      action: 'creation',
      new_value: `${input.type}: ${input.description}`,
    });
    return deepClone(connection);
  }

  async updateConnection(
    id: string,
    updates: Partial<Pick<Connection, 'status' | 'severity'>>,
  ): Promise<Connection> {
    const conn = this.portfolio.connections.find((c) => c.id === id);
    if (!conn) throw new Error(`Connection not found: ${id}`);

    Object.assign(conn, updates, { updated_at: nowISO() });
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'connection',
      entity_id: id,
      action: 'modification',
      new_value: JSON.stringify(updates),
    });
    return deepClone(conn);
  }

  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    return deepClone(this.portfolio.scenarios || []);
  }

  async addScenario(input: Omit<Scenario, 'id' | 'created_at'>): Promise<Scenario> {
    const scenario: Scenario = {
      id: generateId('scenario'),
      created_at: nowISO(),
      ...input,
    };
    if (!this.portfolio.scenarios) this.portfolio.scenarios = [];
    this.portfolio.scenarios.push(scenario);
    return deepClone(scenario);
  }

  async enactScenario(id: string): Promise<Portfolio> {
    const scenario = this.portfolio.scenarios?.find((s) => s.id === id);
    if (!scenario) throw new Error(`Scenario not found: ${id}`);

    for (const mod of scenario.modifications) {
      const bet = this.findBet(mod.bet_id);
      if (!bet) continue;

      if (mod.inclusion === 'excluded') {
        bet.status = 'killed';
      } else if (mod.inclusion === 'modified') {
        if (mod.status_override) bet.status = mod.status_override;
        if (mod.confidence_override !== undefined) {
          bet.confidence = mod.confidence_override;
          bet.confidence_source = 'override';
        }
      }
      bet.updated_at = nowISO();
    }

    scenario.status = 'enacted';
    scenario.updated_at = nowISO();
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'scenario',
      entity_id: id,
      action: 'modification',
      new_value: 'enacted',
    });
    return deepClone(this.portfolio);
  }

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    return deepClone(this.portfolio.experiments || []);
  }

  async getExperimentsForBet(betId: string): Promise<Experiment[]> {
    const experiments = this.portfolio.experiments || [];
    return deepClone(experiments.filter((e) => e.bet_id === betId));
  }

  async addExperiment(
    input: Omit<Experiment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Experiment> {
    const now = nowISO();
    const experiment: Experiment = {
      id: generateId('experiment'),
      created_at: now,
      updated_at: now,
      ...input,
    };
    if (!this.portfolio.experiments) this.portfolio.experiments = [];
    this.portfolio.experiments.push(experiment);
    this.incrementVersion();
    this.recordAudit({
      entity_type: 'experiment',
      entity_id: experiment.id,
      action: 'creation',
      new_value: experiment.hypothesis,
    });
    return deepClone(experiment);
  }

  async updateExperiment(
    id: string,
    updates: Partial<Pick<Experiment, 'status' | 'outcome'>>,
  ): Promise<Experiment> {
    const experiments = this.portfolio.experiments || [];
    const experiment = experiments.find((e) => e.id === id);
    if (!experiment) throw new Error(`Experiment not found: ${id}`);

    const previousStatus = experiment.status;
    Object.assign(experiment, updates, { updated_at: nowISO() });
    this.incrementVersion();

    if (updates.status && updates.status !== previousStatus) {
      this.recordAudit({
        entity_type: 'experiment',
        entity_id: id,
        action: 'status_change',
        previous_value: previousStatus,
        new_value: updates.status,
      });
    }
    return deepClone(experiment);
  }

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    return deepClone(this.portfolio.contributors);
  }

  async addContributor(
    input: Omit<Contributor, 'id' | 'created_at'>,
  ): Promise<Contributor> {
    const contributor: Contributor = {
      id: generateId('contributor'),
      created_at: nowISO(),
      ...input,
    };
    this.portfolio.contributors.push(contributor);
    return deepClone(contributor);
  }

  // Audit
  async getAuditLog(
    options?: { limit?: number; entityId?: string },
  ): Promise<AuditEvent[]> {
    let events = [...this.auditLog];
    if (options?.entityId) {
      events = events.filter((e) => e.entity_id === options.entityId);
    }
    events.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (options?.limit) {
      events = events.slice(0, options.limit);
    }
    return deepClone(events);
  }

  // Versioning
  async getPortfolioVersion(): Promise<number> {
    return this.portfolio.version;
  }
}
