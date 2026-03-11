import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TellStore, Portfolio, Assumption } from '@tell-protocol/core';
import { findStaleAssumptions, assessRisk } from '@tell-protocol/core';

export function createTellServer(store: TellStore): McpServer {
  const server = new McpServer({
    name: 'tell-protocol',
    version: '0.2.0',
  });

  // Tool 1: tell_read_portfolio
  server.registerTool('tell_read_portfolio', {
    description:
      'Read the current strategic portfolio — all active bets, their assumptions, confidence levels, and connections.',
    annotations: {
      readOnlyHint: true,
    },
  }, async () => {
    const portfolio = await store.getPortfolio();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(formatPortfolio(portfolio), null, 2),
        },
      ],
    };
  });

  // Tool 2: tell_read_assumption
  server.registerTool('tell_read_assumption', {
    description: 'Read a specific assumption and its evidence history.',
    inputSchema: {
      assumption_id: z.string().describe('The assumption ID (e.g., asm_xxx)'),
    },
    annotations: {
      readOnlyHint: true,
    },
  }, async ({ assumption_id }) => {
    const assumption = await store.getAssumption(assumption_id);
    if (!assumption) {
      return {
        content: [{ type: 'text' as const, text: `Assumption not found: ${assumption_id}` }],
        isError: true,
      };
    }
    const evidence = await store.getEvidence(assumption_id);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              ...assumption,
              evidence,
              evidence_count: evidence.length,
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Tool 3: tell_write_evidence
  server.registerTool('tell_write_evidence', {
    description:
      'Submit evidence against one or more assumptions. Evidence is append-only and immutable.',
    inputSchema: {
      assumption_ids: z
        .array(z.string())
        .min(1)
        .describe('One or more assumption IDs to attach evidence to'),
      signal: z.enum(['supports', 'weakens', 'neutral']).describe('Signal direction'),
      summary: z.string().describe('Brief description of the evidence'),
      confidence: z
        .enum(['high', 'medium', 'low'])
        .default('medium')
        .describe('Confidence in this evidence'),
      source_type: z
        .enum(['human', 'ai_curated', 'agent'])
        .default('agent')
        .describe('Source of evidence'),
      contributor_id: z.string().optional().describe('Contributor ID (optional)'),
      data_ref: z.string().optional().describe('URL or reference for the evidence source'),
    },
    annotations: {
      readOnlyHint: false,
    },
  }, async ({ assumption_ids, signal, summary, confidence, source_type, contributor_id, data_ref }) => {
    const evidence = await store.appendEvidence({
      assumption_ids,
      signal,
      summary,
      confidence,
      source_type,
      contributor_id: contributor_id || 'ctr_agent',
      timestamp: new Date().toISOString(),
      data_ref,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              status: 'recorded',
              evidence_id: evidence.id,
              assumption_ids,
              signal,
              summary,
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Tool 4: tell_read_stale
  server.registerTool('tell_read_stale', {
    description:
      'Find assumptions that lack recent evidence, indicating potential blind spots.',
    inputSchema: {
      days: z
        .number()
        .default(14)
        .describe('Staleness threshold in days (default: 14)'),
    },
    annotations: {
      readOnlyHint: true,
    },
  }, async ({ days }) => {
    const portfolio = await store.getPortfolio();
    const stale = findStaleAssumptions(portfolio, days);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              threshold_days: days,
              stale_count: stale.length,
              stale_assumptions: stale.map((s) => ({
                id: s.assumption.id,
                statement: s.assumption.statement,
                status: s.assumption.status,
                last_signal_at: s.assumption.last_signal_at,
                bet_thesis: s.betThesis,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  // Tool 5: tell_read_risk
  server.registerTool('tell_read_risk', {
    description:
      'Read portfolio-level risk: shared assumptions, resource conflicts, escalated connections.',
    annotations: {
      readOnlyHint: true,
    },
  }, async () => {
    const portfolio = await store.getPortfolio();
    const risk = assessRisk(portfolio);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              shared_assumptions: risk.sharedAssumptions.map((sa) => ({
                assumption_id: sa.assumption.id,
                statement: sa.assumption.statement,
                status: sa.assumption.status,
                affected_bet_count: sa.betIds.length,
                affected_bet_ids: sa.betIds,
              })),
              failing_assumptions: risk.failingAssumptions.map((fa) => ({
                id: fa.id,
                statement: fa.statement,
              })),
              resource_conflicts: risk.resourceConflicts.map((rc) => ({
                type: rc.type,
                description: rc.description,
                bet_ids: rc.bet_ids,
              })),
              escalated_connections: risk.escalatedConnections.map((ec) => ({
                type: ec.type,
                description: ec.description,
                severity: ec.severity,
                bet_ids: ec.bet_ids,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  });

  return server;
}

function formatPortfolio(portfolio: Portfolio) {
  return {
    id: portfolio.id,
    name: portfolio.name,
    organisation: portfolio.organisation,
    version: portfolio.version,
    created_at: portfolio.created_at,
    updated_at: portfolio.updated_at,
    bets: portfolio.bets.map((b) => ({
      id: b.id,
      thesis: b.thesis,
      status: b.status,
      stage: b.stage,
      confidence: b.confidence,
      confidence_source: b.confidence_source,
      time_horizon: b.time_horizon,
      assumptions: b.assumptions.map((a) => ({
        id: a.id,
        statement: a.statement,
        status: a.status,
        evidence_count: a.evidence?.length || 0,
        last_signal_at: a.last_signal_at,
      })),
    })),
    connections: portfolio.connections.map((c) => ({
      id: c.id,
      type: c.type,
      description: c.description,
      bet_ids: c.bet_ids,
      status: c.status,
      severity: c.severity,
    })),
    experiments: (portfolio.experiments || []).map((e) => ({
      id: e.id,
      bet_id: e.bet_id,
      hypothesis: e.hypothesis,
      status: e.status,
      outcome: e.outcome,
    })),
    contributor_count: portfolio.contributors.length,
  };
}
