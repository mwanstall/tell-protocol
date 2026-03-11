import type { Portfolio, TellDocument } from '../types/index.js';
import { TELL_VERSION } from '@tell-protocol/schema';

export function serialize(portfolio: Portfolio): string {
  const doc: TellDocument = {
    tell_version: TELL_VERSION,
    exported_at: new Date().toISOString(),
    portfolio,
  };
  return JSON.stringify(doc, null, 2);
}
