import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncClient, SyncApiError } from '../client.js';

// Mock the config module
vi.mock('../config.js', () => ({
  getHostToken: vi.fn().mockResolvedValue('tell_pat_testtoken123'),
  extractHost: vi.fn().mockReturnValue('app.apophenic.com'),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('SyncClient', () => {
  let client: SyncClient;

  beforeEach(() => {
    client = new SyncClient('https://app.apophenic.com');
    mockFetch.mockReset();
  });

  describe('push', () => {
    it('sends portfolio, evidence, audit_events, and force flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ portfolio_id: 'uuid-123', version: 1, created: true }),
      });

      const payload = {
        portfolio: { id: 'pf_1', name: 'Test', organisation: 'Co', version: 1, bets: [], connections: [], contributors: [] },
        evidence: {},
        audit_events: [{ id: 'ae_1', entity_type: 'bet', entity_id: 'bet_1', action: 'create', created_at: '2026-01-01' }],
      };

      const result = await client.push(payload as any, 'remote-uuid', true);

      expect(result.portfolio_id).toBe('uuid-123');
      expect(result.created).toBe(true);

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe('https://app.apophenic.com/api/sync/push');
      const body = JSON.parse(fetchCall[1].body);
      expect(body.audit_events).toHaveLength(1);
      expect(body.force).toBe(true);
      expect(body.remote_portfolio_id).toBe('remote-uuid');
    });
  });

  describe('structured error parsing', () => {
    it('throws SyncApiError with code on structured error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: () => Promise.resolve(JSON.stringify({
          error: 'Remote is ahead',
          code: 'version_conflict',
          details: { remote_version: 5, local_version: 3 },
        })),
      });

      await expect(client.push({ portfolio: {} as any, evidence: {} }))
        .rejects.toThrow(SyncApiError);

      try {
        await client.push({ portfolio: {} as any, evidence: {} });
      } catch (e) {
        // Reset mock for second call
      }

      // Fresh mock for the actual assertion
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: () => Promise.resolve(JSON.stringify({
          error: 'Remote is ahead',
          code: 'version_conflict',
          details: { remote_version: 5, local_version: 3 },
        })),
      });

      try {
        await client.push({ portfolio: {} as any, evidence: {} });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SyncApiError);
        const syncErr = err as SyncApiError;
        expect(syncErr.code).toBe('version_conflict');
        expect(syncErr.status).toBe(409);
        expect(syncErr.details).toEqual({ remote_version: 5, local_version: 3 });
      }
    });

    it('throws SyncApiError with unknown code for non-structured errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      try {
        await client.push({ portfolio: {} as any, evidence: {} });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SyncApiError);
        expect((err as SyncApiError).code).toBe('unknown');
      }
    });
  });

  describe('pull', () => {
    it('returns portfolio, evidence, and audit_events', async () => {
      const pullResponse = {
        portfolio: { id: 'pf_1', name: 'Test', version: 2 },
        evidence: { 'asm_1': [{ id: 'ev_1' }] },
        audit_events: [{ id: 'ae_1' }],
        version: 2,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(pullResponse),
      });

      const result = await client.pull('uuid-123');
      expect(result.version).toBe(2);
      expect(result.audit_events).toHaveLength(1);
    });
  });

  describe('status', () => {
    it('returns version info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'uuid-123', version: 3, updated_at: '2026-03-01' }),
      });

      const info = await client.status('uuid-123');
      expect(info.version).toBe(3);
    });
  });

  describe('token management', () => {
    it('lists tokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { id: 't1', name: 'My token', last_used_at: null, created_at: '2026-01-01', expires_at: null },
        ]),
      });

      const tokens = await client.listTokens();
      expect(tokens).toHaveLength(1);
      expect(tokens[0].name).toBe('My token');
    });

    it('revokes a token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      await expect(client.revokeToken('t1')).resolves.toBeUndefined();
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe('https://app.apophenic.com/api/auth/tokens/t1');
      expect(fetchCall[1].method).toBe('DELETE');
    });
  });
});
