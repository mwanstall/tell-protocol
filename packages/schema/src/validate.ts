import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import tellDocumentSchema from './schemas/tell-document.schema.json';
import portfolioSchema from './schemas/portfolio.schema.json';
import betSchema from './schemas/bet.schema.json';
import assumptionSchema from './schemas/assumption.schema.json';
import evidenceSchema from './schemas/evidence.schema.json';
import connectionSchema from './schemas/connection.schema.json';
import scenarioSchema from './schemas/scenario.schema.json';
import experimentSchema from './schemas/experiment.schema.json';
import contributorSchema from './schemas/contributor.schema.json';
import resourceAllocationSchema from './schemas/resource-allocation.schema.json';
import auditEventSchema from './schemas/audit-event.schema.json';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Register all schemas so $ref resolution works
ajv.addSchema(evidenceSchema);
ajv.addSchema(assumptionSchema);
ajv.addSchema(resourceAllocationSchema);
ajv.addSchema(betSchema);
ajv.addSchema(connectionSchema);
ajv.addSchema(scenarioSchema);
ajv.addSchema(experimentSchema);
ajv.addSchema(contributorSchema);
ajv.addSchema(auditEventSchema);
ajv.addSchema(portfolioSchema);
ajv.addSchema(tellDocumentSchema);

function toValidationResult(valid: boolean, errors: typeof ajv.errors): ValidationResult {
  if (valid || !errors) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: errors.map((e) => ({
      path: e.instancePath || '/',
      message: e.message || 'Unknown validation error',
    })),
  };
}

export function validateTellDocument(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/tell-document.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validatePortfolio(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/portfolio.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateBet(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/bet.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateAssumption(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/assumption.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateEvidence(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/evidence.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateConnection(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/connection.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateScenario(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/scenario.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateExperiment(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/experiment.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}

export function validateContributor(data: unknown): ValidationResult {
  const valid = ajv.validate(
    'https://tell-protocol.org/schemas/v0.2/contributor.schema.json',
    data,
  );
  return toValidationResult(valid, ajv.errors);
}
