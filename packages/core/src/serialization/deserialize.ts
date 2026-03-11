import type { Portfolio, TellDocument } from '../types/index.js';
import { validateTellDocument, type ValidationResult } from '@tell-protocol/schema';

export interface DeserializeResult {
  portfolio: Portfolio | null;
  validation: ValidationResult;
}

export function deserialize(json: string): DeserializeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      portfolio: null,
      validation: {
        valid: false,
        errors: [{ path: '/', message: 'Invalid JSON' }],
      },
    };
  }

  const validation = validateTellDocument(parsed);
  if (!validation.valid) {
    return { portfolio: null, validation };
  }

  const doc = parsed as TellDocument;
  return { portfolio: doc.portfolio, validation };
}
