import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStore } from '../../src/store/in-memory.js';

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore({
      name: 'Test Portfolio',
      organisation: 'Test Corp',
    });
  });

  describe('portfolio', () => {
    it('initializes with default values', async () => {
      const portfolio = await store.getPortfolio();
      expect(portfolio.name).toBe('Test Portfolio');
      expect(portfolio.organisation).toBe('Test Corp');
      expect(portfolio.version).toBe(1);
      expect(portfolio.bets).toEqual([]);
      expect(portfolio.connections).toEqual([]);
    });

    it('updates portfolio and increments version', async () => {
      await store.updatePortfolio({ name: 'Updated Name' });
      const portfolio = await store.getPortfolio();
      expect(portfolio.name).toBe('Updated Name');
      expect(portfolio.version).toBe(2);
    });
  });

  describe('bets', () => {
    it('adds a bet and increments version', async () => {
      const bet = await store.addBet({
        thesis: 'Test thesis',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Test assumption',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      expect(bet.id).toMatch(/^bet_/);
      expect(bet.thesis).toBe('Test thesis');
      expect(bet.status).toBe('active');

      const version = await store.getPortfolioVersion();
      expect(version).toBe(2);
    });

    it('retrieves a bet by id', async () => {
      const created = await store.addBet({
        thesis: 'Retrievable bet',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Test',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const retrieved = await store.getBet(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.thesis).toBe('Retrievable bet');
    });

    it('updates bet status', async () => {
      const bet = await store.addBet({
        thesis: 'Kill me',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Test',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const updated = await store.updateBet(bet.id, { status: 'killed' });
      expect(updated.status).toBe('killed');
    });
  });

  describe('assumptions', () => {
    it('adds an assumption to a bet', async () => {
      const bet = await store.addBet({
        thesis: 'Test',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Initial',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const assumption = await store.addAssumption(bet.id, {
        statement: 'New assumption',
      });

      expect(assumption.id).toMatch(/^asm_/);
      expect(assumption.status).toBe('unknown');
      expect(assumption.bet_ids).toContain(bet.id);
    });

    it('updates assumption status', async () => {
      const bet = await store.addBet({
        thesis: 'Test',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Testable',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const assumption = bet.assumptions[0];
      const updated = await store.updateAssumptionStatus(assumption.id, 'holding');
      expect(updated.status).toBe('holding');
    });
  });

  describe('evidence', () => {
    it('appends evidence without incrementing version', async () => {
      const bet = await store.addBet({
        thesis: 'Test',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Evidence target',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const versionBefore = await store.getPortfolioVersion();

      const evidence = await store.appendEvidence({
        assumption_ids: [bet.assumptions[0].id],
        source_type: 'human',
        contributor_id: 'ctr_1',
        signal: 'supports',
        confidence: 'high',
        summary: 'Positive data',
        timestamp: new Date().toISOString(),
      });

      expect(evidence.id).toMatch(/^ev_/);
      expect(evidence.recorded_at).toBeDefined();

      const versionAfter = await store.getPortfolioVersion();
      expect(versionAfter).toBe(versionBefore);
    });

    it('updates last_signal_at on assumption', async () => {
      const bet = await store.addBet({
        thesis: 'Test',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Signal tracking',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const ts = new Date().toISOString();
      await store.appendEvidence({
        assumption_ids: [bet.assumptions[0].id],
        source_type: 'agent',
        contributor_id: 'agent_1',
        signal: 'weakens',
        summary: 'Negative signal',
        timestamp: ts,
      });

      const assumption = await store.getAssumption(bet.assumptions[0].id);
      expect(assumption!.last_signal_at).toBe(ts);
    });
  });

  describe('connections', () => {
    it('adds a connection and increments version', async () => {
      const bet1 = await store.addBet({
        thesis: 'Bet 1',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'A1',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });
      const bet2 = await store.addBet({
        thesis: 'Bet 2',
        status: 'active',
        assumptions: [
          {
            id: 'asm_2',
            statement: 'A2',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const versionBefore = await store.getPortfolioVersion();
      const conn = await store.addConnection({
        type: 'tension',
        bet_ids: [bet1.id, bet2.id],
        description: 'These bets compete',
      });

      expect(conn.id).toMatch(/^conn_/);
      expect(await store.getPortfolioVersion()).toBe(versionBefore + 1);
    });
  });

  describe('audit log', () => {
    it('records audit events for structural changes', async () => {
      await store.addBet({
        thesis: 'Audited bet',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Test',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const events = await store.getAuditLog();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].action).toBe('creation');
      expect(events[0].entity_type).toBe('bet');
    });
  });

  describe('scenarios', () => {
    it('enacts a scenario and changes bet status', async () => {
      const bet = await store.addBet({
        thesis: 'Scenario target',
        status: 'active',
        assumptions: [
          {
            id: 'asm_1',
            statement: 'Test',
            status: 'unknown',
            bet_ids: ['placeholder'],
            evidence: [],
            created_at: new Date().toISOString(),
          },
        ],
      });

      const scenario = await store.addScenario({
        name: 'Kill the bet',
        description: 'What if we kill this bet?',
        status: 'explored',
        modifications: [{ bet_id: bet.id, inclusion: 'excluded' }],
        created_by: 'ctr_1',
      });

      const portfolio = await store.enactScenario(scenario.id);
      const updatedBet = portfolio.bets.find((b) => b.id === bet.id);
      expect(updatedBet!.status).toBe('killed');
    });
  });
});
