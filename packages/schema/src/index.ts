export { TELL_VERSION } from './version.js';
export {
  validateTellDocument,
  validatePortfolio,
  validateBet,
  validateAssumption,
  validateEvidence,
  validateConnection,
  validateScenario,
  validateExperiment,
  validateContributor,
  type ValidationResult,
  type ValidationError,
} from './validate.js';

// Re-export schemas for direct access
export { default as tellDocumentSchema } from './schemas/tell-document.schema.json';
export { default as portfolioSchema } from './schemas/portfolio.schema.json';
export { default as betSchema } from './schemas/bet.schema.json';
export { default as assumptionSchema } from './schemas/assumption.schema.json';
export { default as evidenceSchema } from './schemas/evidence.schema.json';
export { default as connectionSchema } from './schemas/connection.schema.json';
export { default as scenarioSchema } from './schemas/scenario.schema.json';
export { default as experimentSchema } from './schemas/experiment.schema.json';
export { default as contributorSchema } from './schemas/contributor.schema.json';
export { default as resourceAllocationSchema } from './schemas/resource-allocation.schema.json';
export { default as auditEventSchema } from './schemas/audit-event.schema.json';
