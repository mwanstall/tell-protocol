export type BetStatus = 'active' | 'paused' | 'killed' | 'succeeded';

export type InvestmentStage = 'exploring' | 'validating' | 'committed' | 'scaling';

export type ExperimentStatus = 'planned' | 'running' | 'concluded' | 'abandoned';

export type AssumptionStatus = 'holding' | 'pressure' | 'failing' | 'unknown';

export type SignalDirection = 'supports' | 'weakens' | 'neutral';

export type SignalConfidence = 'high' | 'medium' | 'low';

export type ConnectionType = 'tension' | 'synergy' | 'dependency' | 'resource_conflict';

export type ConnectionStatus = 'active' | 'monitoring' | 'resolved' | 'escalated';

export type ConnectionSeverity = 'critical' | 'moderate' | 'low';

export type SourceType = 'human' | 'ai_curated' | 'agent';

export type ContributorType = 'human' | 'agent';

export type ConfidenceSource = 'computed' | 'manual' | 'override';

export type ScenarioStatus = 'draft' | 'explored' | 'enacted' | 'rejected';

export type ScenarioInclusion = 'included' | 'excluded' | 'modified';

export type ResourceType = 'budget' | 'headcount' | 'time' | 'other';

export type ResourcePeriod = 'one_time' | 'monthly' | 'quarterly' | 'annual';

export type AuditEntityType =
  | 'bet'
  | 'assumption'
  | 'connection'
  | 'evidence'
  | 'scenario'
  | 'experiment'
  | 'portfolio';

export type AuditAction =
  | 'status_change'
  | 'confidence_override'
  | 'retraction'
  | 'creation'
  | 'deletion'
  | 'modification';

export type IdentifiedBy = 'human' | 'ai';
