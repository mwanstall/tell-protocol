import type { Portfolio, Evidence, AuditEvent } from '@tell-protocol/core';
import { getHostToken, extractHost } from './config.js';

export interface SyncPayload {
  portfolio: Portfolio;
  evidence: Record<string, Evidence[]>; // keyed by assumption ID
  audit_events?: AuditEvent[];
}

export interface RemotePortfolioInfo {
  id: string;
  version: number;
  updated_at: string;
}

export interface PushResult {
  portfolio_id: string;
  version: number;
  created: boolean; // true if this was a first push (new portfolio on remote)
  warnings?: string[];
}

export interface PullResult {
  portfolio: Portfolio;
  evidence: Record<string, Evidence[]>;
  audit_events?: AuditEvent[];
  version: number;
}

export interface DeviceAuthInitResult {
  device_code: string;
  verification_url: string;
  expires_at: string;
}

export interface DeviceAuthPollResult {
  status: 'pending' | 'complete' | 'expired';
  token?: string;
  user_email?: string;
}

export interface TokenInfo {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

/** Structured error from sync API */
export class SyncApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'SyncApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class SyncClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async resolveToken(): Promise<string> {
    if (this.token) return this.token;
    const host = extractHost(this.baseUrl);
    const token = await getHostToken(host);
    if (!token) {
      throw new Error(`Not authenticated with ${host}. Run "tell auth login" first.`);
    }
    this.token = token;
    return token;
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.resolveToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      // Try to parse structured error response
      const body = await res.text();
      try {
        const parsed = JSON.parse(body);
        if (parsed.code) {
          throw new SyncApiError(parsed.code, parsed.error || body, res.status, parsed.details);
        }
      } catch (e) {
        if (e instanceof SyncApiError) throw e;
      }
      throw new SyncApiError('unknown', `API error ${res.status}: ${body}`, res.status);
    }
    return res;
  }

  /** Push local portfolio + evidence to the remote */
  async push(payload: SyncPayload, remotePortfolioId?: string, force?: boolean): Promise<PushResult> {
    const res = await this.fetch('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({
        portfolio: payload.portfolio,
        evidence: payload.evidence,
        audit_events: payload.audit_events,
        remote_portfolio_id: remotePortfolioId,
        force: force || undefined,
      }),
    });
    return res.json() as Promise<PushResult>;
  }

  /** Pull portfolio + evidence from the remote */
  async pull(portfolioId: string): Promise<PullResult> {
    const res = await this.fetch(`/api/sync/pull/${portfolioId}`);
    return res.json() as Promise<PullResult>;
  }

  /** Get remote portfolio version info */
  async status(portfolioId: string): Promise<RemotePortfolioInfo> {
    const res = await this.fetch(`/api/sync/status/${portfolioId}`);
    return res.json() as Promise<RemotePortfolioInfo>;
  }

  // ── Token Management ──

  /** List all CLI tokens for the authenticated user */
  async listTokens(): Promise<TokenInfo[]> {
    const res = await this.fetch('/api/auth/tokens');
    return res.json() as Promise<TokenInfo[]>;
  }

  /** Revoke a CLI token by ID */
  async revokeToken(tokenId: string): Promise<void> {
    await this.fetch(`/api/auth/tokens/${tokenId}`, { method: 'DELETE' });
  }

  // ── Device Auth Flow ──

  /** Start device auth - returns a code the user enters in the browser */
  async deviceAuthInit(): Promise<DeviceAuthInitResult> {
    const url = `${this.baseUrl}/api/auth/device`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Auth error ${res.status}: ${body}`);
    }
    return res.json() as Promise<DeviceAuthInitResult>;
  }

  /** Poll for device auth completion */
  async deviceAuthPoll(deviceCode: string): Promise<DeviceAuthPollResult> {
    const url = `${this.baseUrl}/api/auth/device/poll`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_code: deviceCode }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Auth error ${res.status}: ${body}`);
    }
    return res.json() as Promise<DeviceAuthPollResult>;
  }
}
