import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { FileStore, resolveTellDir } from '../src/index.js';

describe('FileStore', () => {
  let tempDir: string;
  let store: FileStore;
  const portfolioSlug = 'test-portfolio';

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tell-test-'));
    store = await FileStore.init(tempDir, 'Test Portfolio', 'TestCo');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('creates multi-portfolio directory structure on init', () => {
    const portfolioDir = join(tempDir, '.tell', 'portfolios', portfolioSlug);
    expect(existsSync(join(portfolioDir, 'portfolio.tell.json'))).toBe(true);
    expect(existsSync(join(portfolioDir, 'evidence'))).toBe(true);
    expect(existsSync(join(portfolioDir, 'history'))).toBe(true);
    expect(existsSync(join(portfolioDir, 'history', 'v001.tell.json'))).toBe(true);
    // Active file should be set
    expect(existsSync(join(tempDir, '.tell', 'active'))).toBe(true);
  });

  it('reads portfolio with correct initial state', async () => {
    const portfolio = await store.getPortfolio();
    expect(portfolio.name).toBe('Test Portfolio');
    expect(portfolio.organisation).toBe('TestCo');
    expect(portfolio.version).toBe(1);
    expect(portfolio.bets).toHaveLength(0);
    expect(portfolio.connections).toHaveLength(0);
    expect(portfolio.contributors).toHaveLength(1);
    expect(portfolio.contributors[0].name).toBe('CLI User');
  });

  it('adds a bet and increments version', async () => {
    const bet = await store.addBet({
      thesis: 'Users prefer AI summaries',
      status: 'active',
      assumptions: [],
    });
    expect(bet.id).toMatch(/^bet_/);
    expect(bet.thesis).toBe('Users prefer AI summaries');

    const portfolio = await store.getPortfolio();
    expect(portfolio.version).toBe(2);
    expect(portfolio.bets).toHaveLength(1);
  });

  it('adds assumption to a bet', async () => {
    const bet = await store.addBet({
      thesis: 'Test bet',
      status: 'active',
      assumptions: [],
    });

    const assumption = await store.addAssumption(bet.id, {
      statement: 'Users read summaries more than full text',
    });

    expect(assumption.id).toMatch(/^asm_/);
    expect(assumption.statement).toBe('Users read summaries more than full text');
    expect(assumption.bet_ids).toContain(bet.id);
  });

  it('appends evidence without incrementing version', async () => {
    const bet = await store.addBet({
      thesis: 'Test bet',
      status: 'active',
      assumptions: [],
    });
    const asm = await store.addAssumption(bet.id, { statement: 'Test assumption' });
    const versionBefore = (await store.getPortfolio()).version;

    const evidence = await store.appendEvidence({
      assumption_ids: [asm.id],
      source_type: 'human',
      contributor_id: 'ctr_test',
      signal: 'supports',
      summary: 'A/B test shows 3x engagement',
      timestamp: new Date().toISOString(),
    });

    expect(evidence.id).toMatch(/^ev_/);
    const versionAfter = (await store.getPortfolio()).version;
    expect(versionAfter).toBe(versionBefore);

    // Evidence stored in JSONL file
    const evidenceList = await store.getEvidence(asm.id);
    expect(evidenceList).toHaveLength(1);
    expect(evidenceList[0].summary).toBe('A/B test shows 3x engagement');
  });

  it('updates bet status (kill)', async () => {
    const bet = await store.addBet({
      thesis: 'Test bet',
      status: 'active',
      assumptions: [],
    });

    const updated = await store.updateBet(bet.id, { status: 'killed' });
    expect(updated.status).toBe('killed');
  });

  it('adds connections between bets', async () => {
    const bet1 = await store.addBet({ thesis: 'Bet A', status: 'active', assumptions: [] });
    const bet2 = await store.addBet({ thesis: 'Bet B', status: 'active', assumptions: [] });

    const conn = await store.addConnection({
      bet_ids: [bet1.id, bet2.id],
      type: 'tension',
      description: 'Competing for resources',
      status: 'active',
      severity: 'medium',
    });

    expect(conn.id).toMatch(/^conn_/);
    const connections = await store.getConnections();
    expect(connections).toHaveLength(1);
  });

  it('records audit events', async () => {
    await store.addBet({ thesis: 'Auditable bet', status: 'active', assumptions: [] });
    const auditLog = await store.getAuditLog();
    expect(auditLog.length).toBeGreaterThan(0);
    expect(auditLog.some((e) => e.action === 'creation')).toBe(true);
  });

  it('saves version history snapshots', async () => {
    await store.addBet({ thesis: 'Version test', status: 'active', assumptions: [] });
    const portfolioDir = join(tempDir, '.tell', 'portfolios', portfolioSlug);
    expect(existsSync(join(portfolioDir, 'history', 'v002.tell.json'))).toBe(true);
  });
});

describe('resolveTellDir', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tell-resolve-'));
    await FileStore.init(tempDir, 'Resolve Test', 'TestCo');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('finds active portfolio dir via resolveTellDir', () => {
    const result = resolveTellDir(tempDir);
    expect(result).toBe(join(tempDir, '.tell', 'portfolios', 'resolve-test'));
  });

  it('returns null when no .tell dir exists', async () => {
    // Create a temp dir and verify no .tell anywhere in its ancestry
    // by starting from the filesystem root
    const root = process.platform === 'win32' ? 'C:\\' : '/';
    const result = resolveTellDir(root);
    expect(result).toBeNull();
  });
});
