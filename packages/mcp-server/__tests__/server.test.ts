import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStore, generateId, nowISO } from '@tell-protocol/core';
import type { Portfolio } from '@tell-protocol/core';
import { createTellServer } from '../src/server.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

describe('Tell MCP Server', () => {
  let store: InMemoryStore;
  let client: Client;

  beforeEach(async () => {
    store = new InMemoryStore();
    // Seed with a portfolio
    const now = nowISO();
    const portfolio: Portfolio = {
      id: generateId('portfolio'),
      name: 'Test Portfolio',
      organisation: 'TestCo',
      version: 1,
      created_at: now,
      updated_at: now,
      bets: [],
      connections: [],
      contributors: [
        { id: generateId('contributor'), type: 'human', name: 'Test User', role: 'owner', created_at: now },
      ],
    };
    await store.updatePortfolio({ name: portfolio.name, organisation: portfolio.organisation });

    const server = createTellServer(store);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  it('lists 5 tools', async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(5);
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      'tell_read_assumption',
      'tell_read_portfolio',
      'tell_read_risk',
      'tell_read_stale',
      'tell_write_evidence',
    ]);
  });

  it('reads portfolio via tell_read_portfolio', async () => {
    const result = await client.callTool({ name: 'tell_read_portfolio', arguments: {} });
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content).toHaveLength(1);
    const data = JSON.parse(content[0].text);
    expect(data.name).toBe('Test Portfolio');
  });

  it('adds bet + assumption then reads assumption', async () => {
    const bet = await store.addBet({
      thesis: 'Test thesis',
      status: 'active',
      assumptions: [],
    });
    const asm = await store.addAssumption(bet.id, { statement: 'Users want X' });

    const result = await client.callTool({
      name: 'tell_read_assumption',
      arguments: { assumption_id: asm.id },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);
    expect(data.statement).toBe('Users want X');
  });

  it('writes evidence via tell_write_evidence', async () => {
    const bet = await store.addBet({ thesis: 'Test', status: 'active', assumptions: [] });
    const asm = await store.addAssumption(bet.id, { statement: 'Test assumption' });

    const result = await client.callTool({
      name: 'tell_write_evidence',
      arguments: {
        assumption_ids: [asm.id],
        signal: 'supports',
        summary: 'Positive user feedback',
        confidence: 'high',
        source_type: 'agent',
      },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);
    expect(data.status).toBe('recorded');
    expect(data.evidence_id).toMatch(/^ev_/);

    // Verify evidence was stored
    const evidence = await store.getEvidence(asm.id);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].summary).toBe('Positive user feedback');
  });

  it('reads stale assumptions via tell_read_stale', async () => {
    const result = await client.callTool({
      name: 'tell_read_stale',
      arguments: { days: 14 },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);
    expect(data.threshold_days).toBe(14);
    expect(data.stale_assumptions).toBeInstanceOf(Array);
  });

  it('reads risk via tell_read_risk', async () => {
    const result = await client.callTool({
      name: 'tell_read_risk',
      arguments: {},
    });
    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);
    expect(data.shared_assumptions).toBeInstanceOf(Array);
    expect(data.failing_assumptions).toBeInstanceOf(Array);
    expect(data.resource_conflicts).toBeInstanceOf(Array);
    expect(data.escalated_connections).toBeInstanceOf(Array);
  });

  it('returns error for non-existent assumption', async () => {
    const result = await client.callTool({
      name: 'tell_read_assumption',
      arguments: { assumption_id: 'asm_nonexistent' },
    });
    expect(result.isError).toBe(true);
  });
});
