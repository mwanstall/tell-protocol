// Types
export type {
  BetStatus,
  InvestmentStage,
  ExperimentStatus,
  AssumptionStatus,
  SignalDirection,
  SignalConfidence,
  ConnectionType,
  ConnectionStatus,
  ConnectionSeverity,
  SourceType,
  ContributorType,
  ConfidenceSource,
  ScenarioStatus,
  ScenarioInclusion,
  ResourceType,
  ResourcePeriod,
  AuditEntityType,
  AuditAction,
  IdentifiedBy,
  Evidence,
  Assumption,
  Bet,
  TimeHorizon,
  Connection,
  Scenario,
  ScenarioBet,
  Contributor,
  ResourceAllocation,
  AuditEvent,
  Experiment,
  ExperimentOutcome,
  Portfolio,
  TellDocument,
} from './types/index.js';

// Confidence
export {
  evidenceWeightedStrategy,
  statusWeightedStrategy,
  type ConfidenceStrategy,
} from './confidence/index.js';

// Store
export { type TellStore, InMemoryStore } from './store/index.js';

// Analysis
export { findStaleAssumptions, DEFAULT_STALENESS_THRESHOLD_DAYS } from './analysis/staleness.js';
export { findSharedAssumptions, assessRisk } from './analysis/risk.js';
export { diffPortfolios } from './analysis/diff.js';
export { portfolioHealth } from './analysis/health.js';
export type { StaleAssumption } from './analysis/staleness.js';
export type { SharedAssumption, RiskAssessment } from './analysis/risk.js';
export type { PortfolioDiff, PortfolioChange } from './analysis/diff.js';
export type { PortfolioHealth } from './analysis/health.js';

// Serialization
export { serialize } from './serialization/serialize.js';
export { deserialize } from './serialization/deserialize.js';
export type { DeserializeResult } from './serialization/deserialize.js';

// Utilities
export { generateId } from './utils/id.js';
export type { EntityType } from './utils/id.js';
export { nowISO, daysBetween, isStale } from './utils/timestamp.js';
