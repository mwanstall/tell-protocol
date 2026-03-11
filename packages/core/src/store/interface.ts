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
  BetStatus,
  AssumptionStatus,
  ExperimentStatus,
  ConfidenceSource,
  ConnectionStatus,
  ConnectionSeverity,
} from '../types/index.js';

export interface TellStore {
  // Portfolio
  getPortfolio(): Promise<Portfolio>;
  updatePortfolio(
    updates: Partial<Pick<Portfolio, 'name' | 'description' | 'organisation'>>,
  ): Promise<Portfolio>;

  // Bets
  getBets(): Promise<Bet[]>;
  getBet(id: string): Promise<Bet | null>;
  addBet(
    bet: Omit<Bet, 'id' | 'created_at' | 'updated_at' | 'confidence' | 'confidence_source'>,
  ): Promise<Bet>;
  updateBet(
    id: string,
    updates: Partial<
      Pick<Bet, 'thesis' | 'status' | 'stage' | 'confidence' | 'confidence_source' | 'owner' | 'time_horizon' | 'tags'>
    >,
  ): Promise<Bet>;

  // Assumptions
  getAssumption(id: string): Promise<Assumption | null>;
  getAssumptionsForBet(betId: string): Promise<Assumption[]>;
  addAssumption(
    betId: string,
    assumption: Pick<Assumption, 'statement'> &
      Partial<Pick<Assumption, 'status' | 'evidence_threshold' | 'owner'>>,
  ): Promise<Assumption>;
  updateAssumptionStatus(
    id: string,
    status: AssumptionStatus,
    source?: ConfidenceSource,
  ): Promise<Assumption>;
  linkAssumptionToBet(assumptionId: string, betId: string): Promise<void>;

  // Evidence (append-only)
  getEvidence(assumptionId: string): Promise<Evidence[]>;
  appendEvidence(
    evidence: Omit<Evidence, 'id' | 'recorded_at'>,
  ): Promise<Evidence>;

  // Connections
  getConnections(): Promise<Connection[]>;
  addConnection(
    connection: Omit<Connection, 'id' | 'created_at'>,
  ): Promise<Connection>;
  updateConnection(
    id: string,
    updates: Partial<Pick<Connection, 'status' | 'severity'>>,
  ): Promise<Connection>;

  // Scenarios
  getScenarios(): Promise<Scenario[]>;
  addScenario(scenario: Omit<Scenario, 'id' | 'created_at'>): Promise<Scenario>;
  enactScenario(id: string): Promise<Portfolio>;

  // Experiments
  getExperiments(): Promise<Experiment[]>;
  getExperimentsForBet(betId: string): Promise<Experiment[]>;
  addExperiment(
    experiment: Omit<Experiment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Experiment>;
  updateExperiment(
    id: string,
    updates: Partial<Pick<Experiment, 'status' | 'outcome'>>,
  ): Promise<Experiment>;

  // Contributors
  getContributors(): Promise<Contributor[]>;
  addContributor(contributor: Omit<Contributor, 'id' | 'created_at'>): Promise<Contributor>;

  // Audit
  getAuditLog(options?: { limit?: number; entityId?: string }): Promise<AuditEvent[]>;

  // Versioning
  getPortfolioVersion(): Promise<number>;
}
