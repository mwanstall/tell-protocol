import { describe, it, expect } from 'vitest';
import {
  validateTellDocument,
  validatePortfolio,
  validateBet,
  validateAssumption,
  validateEvidence,
  validateConnection,
  validateContributor,
  validateScenario,
  TELL_VERSION,
} from '../src/index.js';

const now = new Date().toISOString();

const minimalEvidence = {
  id: 'ev_001',
  assumption_ids: ['asm_001'],
  source_type: 'human' as const,
  contributor_id: 'ctr_001',
  signal: 'supports' as const,
  summary: 'Q1 data looks good',
  timestamp: now,
  recorded_at: now,
};

const minimalAssumption = {
  id: 'asm_001',
  statement: 'Market conditions remain stable',
  status: 'holding' as const,
  bet_ids: ['bet_001'],
  evidence: [],
  created_at: now,
};

const minimalBet = {
  id: 'bet_001',
  thesis: 'Investing in X will yield 30% growth within 12 months',
  status: 'active' as const,
  assumptions: [minimalAssumption],
  created_at: now,
  updated_at: now,
};

const minimalContributor = {
  id: 'ctr_001',
  type: 'human' as const,
  name: 'Jane Smith',
  created_at: now,
};

const minimalPortfolio = {
  id: 'pf_001',
  name: 'Test Portfolio',
  organisation: 'Test Corp',
  version: 1,
  created_at: now,
  updated_at: now,
  bets: [minimalBet],
  connections: [],
  contributors: [minimalContributor],
};

const minimalDocument = {
  tell_version: TELL_VERSION,
  portfolio: minimalPortfolio,
};

describe('TELL_VERSION', () => {
  it('should be 0.3', () => {
    expect(TELL_VERSION).toBe('0.3');
  });
});

describe('validateTellDocument', () => {
  it('validates a minimal valid document', () => {
    const result = validateTellDocument(minimalDocument);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects document with wrong version', () => {
    const result = validateTellDocument({ ...minimalDocument, tell_version: '0.1' });
    expect(result.valid).toBe(false);
  });

  it('rejects document without portfolio', () => {
    const result = validateTellDocument({ tell_version: '0.3' });
    expect(result.valid).toBe(false);
  });

  it('accepts document with exported_at', () => {
    const result = validateTellDocument({ ...minimalDocument, exported_at: now });
    expect(result.valid).toBe(true);
  });

  it('rejects additional properties', () => {
    const result = validateTellDocument({ ...minimalDocument, extra: 'field' });
    expect(result.valid).toBe(false);
  });
});

describe('validatePortfolio', () => {
  it('validates a minimal portfolio', () => {
    const result = validatePortfolio(minimalPortfolio);
    expect(result.valid).toBe(true);
  });

  it('requires at least one contributor', () => {
    const result = validatePortfolio({ ...minimalPortfolio, contributors: [] });
    expect(result.valid).toBe(false);
  });

  it('requires name, organisation, version', () => {
    const { name, ...missing } = minimalPortfolio;
    const result = validatePortfolio(missing);
    expect(result.valid).toBe(false);
  });

  it('accepts scenarios array', () => {
    const result = validatePortfolio({ ...minimalPortfolio, scenarios: [] });
    expect(result.valid).toBe(true);
  });

  it('accepts extensions object', () => {
    const result = validatePortfolio({
      ...minimalPortfolio,
      extensions: { 'apophenic.custom': { key: 'value' } },
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateBet', () => {
  it('validates a minimal bet', () => {
    const result = validateBet(minimalBet);
    expect(result.valid).toBe(true);
  });

  it('requires at least one assumption', () => {
    const result = validateBet({ ...minimalBet, assumptions: [] });
    expect(result.valid).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = validateBet({
      ...minimalBet,
      confidence: 75,
      confidence_source: 'computed',
      time_horizon: { start: now, target: now },
      owner: 'ctr_001',
      tags: ['growth', 'market'],
      resource_allocations: [],
    });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = validateBet({ ...minimalBet, status: 'invalid' });
    expect(result.valid).toBe(false);
  });

  it('rejects confidence > 100', () => {
    const result = validateBet({ ...minimalBet, confidence: 101 });
    expect(result.valid).toBe(false);
  });

  it('rejects confidence < 0', () => {
    const result = validateBet({ ...minimalBet, confidence: -1 });
    expect(result.valid).toBe(false);
  });
});

describe('validateAssumption', () => {
  it('validates a minimal assumption', () => {
    const result = validateAssumption(minimalAssumption);
    expect(result.valid).toBe(true);
  });

  it('requires at least one bet_id', () => {
    const result = validateAssumption({ ...minimalAssumption, bet_ids: [] });
    expect(result.valid).toBe(false);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['holding', 'pressure', 'failing', 'unknown']) {
      const result = validateAssumption({ ...minimalAssumption, status });
      expect(result.valid).toBe(true);
    }
  });

  it('rejects "strong" status (not in protocol)', () => {
    const result = validateAssumption({ ...minimalAssumption, status: 'strong' });
    expect(result.valid).toBe(false);
  });

  it('supports many-to-many via multiple bet_ids', () => {
    const result = validateAssumption({
      ...minimalAssumption,
      bet_ids: ['bet_001', 'bet_002', 'bet_003'],
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateEvidence', () => {
  it('validates minimal evidence', () => {
    const result = validateEvidence(minimalEvidence);
    expect(result.valid).toBe(true);
  });

  it('accepts all signal types', () => {
    for (const signal of ['supports', 'weakens', 'neutral']) {
      const result = validateEvidence({ ...minimalEvidence, signal });
      expect(result.valid).toBe(true);
    }
  });

  it('accepts confidence levels', () => {
    for (const confidence of ['high', 'medium', 'low']) {
      const result = validateEvidence({ ...minimalEvidence, confidence });
      expect(result.valid).toBe(true);
    }
  });

  it('accepts supersedes and is_retracted', () => {
    const result = validateEvidence({
      ...minimalEvidence,
      supersedes: 'ev_000',
      is_retracted: false,
    });
    expect(result.valid).toBe(true);
  });

  it('supports many-to-many via multiple assumption_ids', () => {
    const result = validateEvidence({
      ...minimalEvidence,
      assumption_ids: ['asm_001', 'asm_002'],
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateConnection', () => {
  it('validates a minimal connection', () => {
    const result = validateConnection({
      id: 'conn_001',
      type: 'tension',
      bet_ids: ['bet_001', 'bet_002'],
      description: 'These bets compete for resources',
      created_at: now,
    });
    expect(result.valid).toBe(true);
  });

  it('requires exactly 2 bet_ids', () => {
    const result = validateConnection({
      id: 'conn_001',
      type: 'tension',
      bet_ids: ['bet_001'],
      description: 'Too few bets',
      created_at: now,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects more than 2 bet_ids', () => {
    const result = validateConnection({
      id: 'conn_001',
      type: 'tension',
      bet_ids: ['bet_001', 'bet_002', 'bet_003'],
      description: 'Too many bets',
      created_at: now,
    });
    expect(result.valid).toBe(false);
  });

  it('accepts all connection types', () => {
    for (const type of ['tension', 'synergy', 'dependency', 'resource_conflict']) {
      const result = validateConnection({
        id: 'conn_001',
        type,
        bet_ids: ['bet_001', 'bet_002'],
        description: 'A connection',
        created_at: now,
      });
      expect(result.valid).toBe(true);
    }
  });
});

describe('validateContributor', () => {
  it('validates a human contributor', () => {
    const result = validateContributor(minimalContributor);
    expect(result.valid).toBe(true);
  });

  it('validates an agent contributor', () => {
    const result = validateContributor({
      ...minimalContributor,
      type: 'agent',
      name: 'Usage Monitor Agent',
    });
    expect(result.valid).toBe(true);
  });

  it('accepts optional role and permissions', () => {
    const result = validateContributor({
      ...minimalContributor,
      role: 'CTO',
      permissions: { read: true, write: true },
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateScenario', () => {
  it('validates a minimal scenario', () => {
    const result = validateScenario({
      id: 'sc_001',
      name: 'What if we kill the legacy bet?',
      description: 'Explores the impact of killing the legacy migration bet',
      status: 'draft',
      modifications: [{ bet_id: 'bet_001', inclusion: 'excluded' }],
      created_by: 'ctr_001',
      created_at: now,
    });
    expect(result.valid).toBe(true);
  });

  it('accepts modification overrides', () => {
    const result = validateScenario({
      id: 'sc_001',
      name: 'Optimistic scenario',
      description: 'What if confidence is higher?',
      status: 'explored',
      modifications: [
        {
          bet_id: 'bet_001',
          inclusion: 'modified',
          confidence_override: 85,
          status_override: 'active',
          notes: 'Assuming market recovery',
        },
      ],
      created_by: 'ctr_001',
      created_at: now,
    });
    expect(result.valid).toBe(true);
  });
});

describe('round-trip preservation', () => {
  it('preserves extensions through validation', () => {
    const docWithExtensions = {
      ...minimalDocument,
      portfolio: {
        ...minimalPortfolio,
        extensions: {
          'apophenic.custom_field': { key: 'value' },
          'client_custom.priority': 'high',
        },
        bets: [
          {
            ...minimalBet,
            extensions: { 'tell.experimental': true },
          },
        ],
      },
    };
    const result = validateTellDocument(docWithExtensions);
    expect(result.valid).toBe(true);
  });
});
