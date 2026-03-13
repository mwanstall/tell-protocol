import { readFile, writeFile, mkdir, readdir, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { slugify } from '../utils/slugify.js';
import type { TellStore } from '@tell-protocol/core';
import type {
  Portfolio,
  Bet,
  Assumption,
  Evidence,
  Connection,
  Scenario,
  Experiment,
  Contributor,
  AuditEvent,
  AssumptionStatus,
  ConfidenceSource,
} from '@tell-protocol/core';
import { generateId, nowISO } from '@tell-protocol/core';

export class FileStore implements TellStore {
  private tellDir: string;

  constructor(tellDir: string) {
    this.tellDir = tellDir;
  }

  private get portfolioPath(): string {
    return join(this.tellDir, 'portfolio.tell.json');
  }

  private get auditPath(): string {
    return join(this.tellDir, 'audit.jsonl');
  }

  private evidencePath(assumptionId: string): string {
    return join(this.tellDir, 'evidence', `${assumptionId}.jsonl`);
  }

  private historyPath(version: number): string {
    return join(this.tellDir, 'history', `v${String(version).padStart(3, '0')}.tell.json`);
  }

  private async readPortfolio(): Promise<Portfolio> {
    const data = await readFile(this.portfolioPath, 'utf-8');
    return JSON.parse(data);
  }

  private async writePortfolio(portfolio: Portfolio): Promise<void> {
    await writeFile(this.portfolioPath, JSON.stringify(portfolio, null, 2));
  }

  private async incrementVersion(portfolio: Portfolio): Promise<void> {
    portfolio.version++;
    portfolio.updated_at = nowISO();
    await this.writePortfolio(portfolio);
    // Save snapshot
    await mkdir(join(this.tellDir, 'history'), { recursive: true });
    await writeFile(this.historyPath(portfolio.version), JSON.stringify(portfolio, null, 2));
  }

  private async recordAudit(event: Omit<AuditEvent, 'id' | 'portfolio_id' | 'created_at'>): Promise<void> {
    const portfolio = await this.readPortfolio();
    const auditEvent: AuditEvent = {
      id: generateId('audit_event'),
      portfolio_id: portfolio.id,
      created_at: nowISO(),
      ...event,
    };
    const line = JSON.stringify(auditEvent) + '\n';
    await writeFile(this.auditPath, line, { flag: 'a' });
  }

  private findBet(portfolio: Portfolio, id: string): Bet | undefined {
    return portfolio.bets.find((b) => b.id === id);
  }

  private findAssumption(portfolio: Portfolio, id: string): { assumption: Assumption; bet: Bet } | undefined {
    for (const bet of portfolio.bets) {
      const assumption = bet.assumptions.find((a) => a.id === id);
      if (assumption) return { assumption, bet };
    }
    return undefined;
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio> {
    const portfolio = await this.readPortfolio();
    // Merge evidence from JSONL files
    for (const bet of portfolio.bets) {
      for (const assumption of bet.assumptions) {
        assumption.evidence = await this.loadEvidence(assumption.id);
      }
    }
    return portfolio;
  }

  async updatePortfolio(updates: Partial<Pick<Portfolio, 'name' | 'description' | 'organisation'>>): Promise<Portfolio> {
    const portfolio = await this.readPortfolio();
    Object.assign(portfolio, updates);
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'portfolio', entity_id: portfolio.id, action: 'modification', new_value: JSON.stringify(updates) });
    return portfolio;
  }

  // Bets
  async getBets(): Promise<Bet[]> {
    const portfolio = await this.readPortfolio();
    return portfolio.bets;
  }

  async getBet(id: string): Promise<Bet | null> {
    const portfolio = await this.readPortfolio();
    const bet = this.findBet(portfolio, id);
    if (!bet) return null;
    for (const asm of bet.assumptions) {
      asm.evidence = await this.loadEvidence(asm.id);
    }
    return bet;
  }

  async addBet(input: Omit<Bet, 'id' | 'created_at' | 'updated_at' | 'confidence' | 'confidence_source'>): Promise<Bet> {
    const portfolio = await this.readPortfolio();
    const now = nowISO();
    const bet: Bet = { id: generateId('bet'), created_at: now, updated_at: now, ...input };
    portfolio.bets.push(bet);
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'bet', entity_id: bet.id, action: 'creation', new_value: bet.thesis });
    return bet;
  }

  async updateBet(id: string, updates: Partial<Pick<Bet, 'thesis' | 'status' | 'stage' | 'confidence' | 'confidence_source' | 'owner' | 'time_horizon' | 'tags'>>): Promise<Bet> {
    const portfolio = await this.readPortfolio();
    const bet = this.findBet(portfolio, id);
    if (!bet) throw new Error(`Bet not found: ${id}`);
    const prev = bet.status;
    Object.assign(bet, updates, { updated_at: nowISO() });
    await this.incrementVersion(portfolio);
    if (updates.status && updates.status !== prev) {
      await this.recordAudit({ entity_type: 'bet', entity_id: id, action: 'status_change', previous_value: prev, new_value: updates.status });
    }
    return bet;
  }

  // Assumptions
  async getAssumption(id: string): Promise<Assumption | null> {
    const portfolio = await this.readPortfolio();
    const found = this.findAssumption(portfolio, id);
    if (!found) return null;
    found.assumption.evidence = await this.loadEvidence(id);
    return found.assumption;
  }

  async getAssumptionsForBet(betId: string): Promise<Assumption[]> {
    const portfolio = await this.readPortfolio();
    const bet = this.findBet(portfolio, betId);
    return bet ? bet.assumptions : [];
  }

  async addAssumption(betId: string, input: Pick<Assumption, 'statement'> & Partial<Pick<Assumption, 'status' | 'evidence_threshold' | 'owner'>>): Promise<Assumption> {
    const portfolio = await this.readPortfolio();
    const bet = this.findBet(portfolio, betId);
    if (!bet) throw new Error(`Bet not found: ${betId}`);
    const assumption: Assumption = {
      id: generateId('assumption'),
      statement: input.statement,
      status: input.status || 'unknown',
      evidence_threshold: input.evidence_threshold,
      bet_ids: [betId],
      owner: input.owner,
      evidence: [],
      created_at: nowISO(),
    };
    bet.assumptions.push(assumption);
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'assumption', entity_id: assumption.id, action: 'creation', new_value: assumption.statement });
    return assumption;
  }

  async updateAssumptionStatus(id: string, status: AssumptionStatus, source?: ConfidenceSource): Promise<Assumption> {
    const portfolio = await this.readPortfolio();
    const found = this.findAssumption(portfolio, id);
    if (!found) throw new Error(`Assumption not found: ${id}`);
    const prev = found.assumption.status;
    found.assumption.status = status;
    if (source) found.assumption.status_source = source;
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'assumption', entity_id: id, action: 'status_change', previous_value: prev, new_value: status });
    return found.assumption;
  }

  async linkAssumptionToBet(assumptionId: string, betId: string): Promise<void> {
    const portfolio = await this.readPortfolio();
    const found = this.findAssumption(portfolio, assumptionId);
    if (!found) throw new Error(`Assumption not found: ${assumptionId}`);
    const bet = this.findBet(portfolio, betId);
    if (!bet) throw new Error(`Bet not found: ${betId}`);
    if (!found.assumption.bet_ids.includes(betId)) found.assumption.bet_ids.push(betId);
    if (!bet.assumptions.find((a) => a.id === assumptionId)) bet.assumptions.push(found.assumption);
    await this.incrementVersion(portfolio);
  }

  // Evidence
  private async loadEvidence(assumptionId: string): Promise<Evidence[]> {
    const path = this.evidencePath(assumptionId);
    if (!existsSync(path)) return [];
    const data = await readFile(path, 'utf-8');
    return data.trim().split('\n').filter(Boolean).map((line: string) => JSON.parse(line));
  }

  async getEvidence(assumptionId: string): Promise<Evidence[]> {
    return this.loadEvidence(assumptionId);
  }

  async appendEvidence(input: Omit<Evidence, 'id' | 'recorded_at'>): Promise<Evidence> {
    const evidence: Evidence = { id: generateId('evidence'), recorded_at: nowISO(), ...input };
    await mkdir(join(this.tellDir, 'evidence'), { recursive: true });

    for (const asmId of input.assumption_ids) {
      const line = JSON.stringify(evidence) + '\n';
      await writeFile(this.evidencePath(asmId), line, { flag: 'a' });

      // Update last_signal_at in portfolio
      const portfolio = await this.readPortfolio();
      const found = this.findAssumption(portfolio, asmId);
      if (found) {
        found.assumption.last_signal_at = evidence.timestamp;
        await this.writePortfolio(portfolio);
      }
    }

    return evidence;
  }

  // Connections
  async getConnections(): Promise<Connection[]> {
    const portfolio = await this.readPortfolio();
    return portfolio.connections;
  }

  async addConnection(input: Omit<Connection, 'id' | 'created_at'>): Promise<Connection> {
    const portfolio = await this.readPortfolio();
    const connection: Connection = { id: generateId('connection'), created_at: nowISO(), ...input };
    portfolio.connections.push(connection);
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'connection', entity_id: connection.id, action: 'creation', new_value: `${input.type}: ${input.description}` });
    return connection;
  }

  async updateConnection(id: string, updates: Partial<Pick<Connection, 'status' | 'severity'>>): Promise<Connection> {
    const portfolio = await this.readPortfolio();
    const conn = portfolio.connections.find((c) => c.id === id);
    if (!conn) throw new Error(`Connection not found: ${id}`);
    Object.assign(conn, updates, { updated_at: nowISO() });
    await this.incrementVersion(portfolio);
    return conn;
  }

  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    const portfolio = await this.readPortfolio();
    return portfolio.scenarios || [];
  }

  async addScenario(input: Omit<Scenario, 'id' | 'created_at'>): Promise<Scenario> {
    const portfolio = await this.readPortfolio();
    const scenario: Scenario = { id: generateId('scenario'), created_at: nowISO(), ...input };
    if (!portfolio.scenarios) portfolio.scenarios = [];
    portfolio.scenarios.push(scenario);
    await this.writePortfolio(portfolio);
    return scenario;
  }

  async enactScenario(id: string): Promise<Portfolio> {
    const portfolio = await this.readPortfolio();
    const scenario = portfolio.scenarios?.find((s) => s.id === id);
    if (!scenario) throw new Error(`Scenario not found: ${id}`);
    for (const mod of scenario.modifications) {
      const bet = this.findBet(portfolio, mod.bet_id);
      if (!bet) continue;
      if (mod.inclusion === 'excluded') bet.status = 'killed';
      else if (mod.inclusion === 'modified') {
        if (mod.status_override) bet.status = mod.status_override;
        if (mod.confidence_override !== undefined) {
          bet.confidence = mod.confidence_override;
          bet.confidence_source = 'override';
        }
      }
      bet.updated_at = nowISO();
    }
    scenario.status = 'enacted';
    await this.incrementVersion(portfolio);
    return portfolio;
  }

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    const portfolio = await this.readPortfolio();
    return portfolio.experiments || [];
  }

  async getExperimentsForBet(betId: string): Promise<Experiment[]> {
    const portfolio = await this.readPortfolio();
    return (portfolio.experiments || []).filter((e) => e.bet_id === betId);
  }

  async addExperiment(input: Omit<Experiment, 'id' | 'created_at' | 'updated_at'>): Promise<Experiment> {
    const portfolio = await this.readPortfolio();
    const now = nowISO();
    const experiment: Experiment = { id: generateId('experiment'), created_at: now, updated_at: now, ...input };
    if (!portfolio.experiments) portfolio.experiments = [];
    portfolio.experiments.push(experiment);
    await this.incrementVersion(portfolio);
    await this.recordAudit({ entity_type: 'experiment', entity_id: experiment.id, action: 'creation', new_value: experiment.hypothesis });
    return experiment;
  }

  async updateExperiment(id: string, updates: Partial<Pick<Experiment, 'status' | 'outcome'>>): Promise<Experiment> {
    const portfolio = await this.readPortfolio();
    const experiments = portfolio.experiments || [];
    const experiment = experiments.find((e) => e.id === id);
    if (!experiment) throw new Error(`Experiment not found: ${id}`);
    const prev = experiment.status;
    Object.assign(experiment, updates, { updated_at: nowISO() });
    await this.incrementVersion(portfolio);
    if (updates.status && updates.status !== prev) {
      await this.recordAudit({ entity_type: 'experiment', entity_id: id, action: 'status_change', previous_value: prev, new_value: updates.status });
    }
    return experiment;
  }

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    const portfolio = await this.readPortfolio();
    return portfolio.contributors;
  }

  async addContributor(input: Omit<Contributor, 'id' | 'created_at'>): Promise<Contributor> {
    const portfolio = await this.readPortfolio();
    const contributor: Contributor = { id: generateId('contributor'), created_at: nowISO(), ...input };
    portfolio.contributors.push(contributor);
    await this.writePortfolio(portfolio);
    return contributor;
  }

  // Audit
  async getAuditLog(options?: { limit?: number; entityId?: string }): Promise<AuditEvent[]> {
    if (!existsSync(this.auditPath)) return [];
    const data = await readFile(this.auditPath, 'utf-8');
    let events: AuditEvent[] = data.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
    if (options?.entityId) events = events.filter((e) => e.entity_id === options.entityId);
    events.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (options?.limit) events = events.slice(0, options.limit);
    return events;
  }

  // Versioning
  async getPortfolioVersion(): Promise<number> {
    const portfolio = await this.readPortfolio();
    return portfolio.version;
  }

  // Initialization — creates a named portfolio under .tell/portfolios/<slug>/
  static async init(dir: string, name: string, organisation: string): Promise<FileStore> {
    const rootTellDir = join(dir, '.tell');
    const slug = slugify(name);

    if (!slug) throw new Error('Portfolio name must contain at least one alphanumeric character.');

    const portfolioDir = join(rootTellDir, 'portfolios', slug);

    // Check for slug collision
    if (existsSync(join(portfolioDir, 'portfolio.tell.json'))) {
      throw new Error(`A portfolio named "${slug}" already exists.`);
    }

    await mkdir(portfolioDir, { recursive: true });
    await mkdir(join(portfolioDir, 'evidence'), { recursive: true });
    await mkdir(join(portfolioDir, 'history'), { recursive: true });

    const now = nowISO();
    const portfolio: Portfolio = {
      id: generateId('portfolio'),
      name,
      organisation,
      version: 1,
      created_at: now,
      updated_at: now,
      bets: [],
      connections: [],
      contributors: [
        {
          id: generateId('contributor'),
          type: 'human',
          name: 'CLI User',
          role: 'owner',
          created_at: now,
        },
      ],
    };

    const store = new FileStore(portfolioDir);
    await store.writePortfolio(portfolio);
    await writeFile(join(portfolioDir, 'history', 'v001.tell.json'), JSON.stringify(portfolio, null, 2));

    // Set as active portfolio
    await setActivePortfolio(rootTellDir, slug);

    return store;
  }
}

// ── Multi-portfolio resolution ──────────────────────────────────

/**
 * Find the root `.tell/` directory by walking up from startDir.
 * Accepts both legacy layout (portfolio.tell.json at root) and
 * multi-portfolio layout (portfolios/ subfolder).
 */
export function resolveRootTellDir(startDir: string = process.cwd()): string | null {
  let dir = startDir;
  while (true) {
    const tellDir = join(dir, '.tell');
    // Multi-portfolio layout
    if (existsSync(join(tellDir, 'portfolios'))) return tellDir;
    // Legacy layout
    if (existsSync(join(tellDir, 'portfolio.tell.json'))) return tellDir;
    const parent = join(dir, '..');
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Check if a root .tell/ directory uses the legacy single-portfolio layout.
 */
export function isLegacyLayout(rootTellDir: string): boolean {
  return existsSync(join(rootTellDir, 'portfolio.tell.json'))
    && !existsSync(join(rootTellDir, 'portfolios'));
}

/**
 * Migrate a legacy .tell/ to multi-portfolio layout.
 * Moves all files into .tell/portfolios/default/.
 */
export async function migrateLegacyLayout(rootTellDir: string): Promise<void> {
  const defaultDir = join(rootTellDir, 'portfolios', 'default');
  await mkdir(defaultDir, { recursive: true });

  // Move known files/dirs into the default portfolio
  const items = ['portfolio.tell.json', 'config.json', 'audit.jsonl', 'evidence', 'history'];
  for (const item of items) {
    const src = join(rootTellDir, item);
    if (existsSync(src)) {
      await rename(src, join(defaultDir, item));
    }
  }

  // Write active file
  await setActivePortfolio(rootTellDir, 'default');
}

/**
 * Read the name of the currently active portfolio.
 */
export async function getActivePortfolioName(rootTellDir: string): Promise<string | null> {
  const activePath = join(rootTellDir, 'active');
  if (!existsSync(activePath)) return null;
  const name = (await readFile(activePath, 'utf-8')).trim();
  return name || null;
}

/**
 * Set the active portfolio by writing the slug to .tell/active.
 */
export async function setActivePortfolio(rootTellDir: string, slug: string): Promise<void> {
  await writeFile(join(rootTellDir, 'active'), slug);
}

/**
 * List all portfolio slugs under .tell/portfolios/.
 */
export async function listPortfolios(rootTellDir: string): Promise<string[]> {
  const portfoliosDir = join(rootTellDir, 'portfolios');
  if (!existsSync(portfoliosDir)) return [];
  const entries = await readdir(portfoliosDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && existsSync(join(portfoliosDir, e.name, 'portfolio.tell.json')))
    .map((e) => e.name);
}

/**
 * Remove a portfolio by slug.
 */
export async function removePortfolio(rootTellDir: string, slug: string): Promise<void> {
  const portfolioDir = join(rootTellDir, 'portfolios', slug);
  if (!existsSync(join(portfolioDir, 'portfolio.tell.json'))) {
    throw new Error(`Portfolio "${slug}" not found.`);
  }
  await rm(portfolioDir, { recursive: true, force: true });

  // If the removed portfolio was active, switch to another or clear
  const active = await getActivePortfolioName(rootTellDir);
  if (active === slug) {
    const remaining = await listPortfolios(rootTellDir);
    if (remaining.length > 0) {
      await setActivePortfolio(rootTellDir, remaining[0]);
    } else {
      await writeFile(join(rootTellDir, 'active'), '');
    }
  }
}

/**
 * Resolve the active portfolio's directory path.
 * Handles legacy migration automatically.
 * Returns the path to the active portfolio dir (equivalent to the old .tell/ path).
 */
export async function resolveActivePortfolioDir(startDir: string = process.cwd()): Promise<string | null> {
  const rootTellDir = resolveRootTellDir(startDir);
  if (!rootTellDir) return null;

  // Legacy layout — auto-migrate
  if (isLegacyLayout(rootTellDir)) {
    await migrateLegacyLayout(rootTellDir);
    console.error('  Migrated portfolio to .tell/portfolios/default/');
  }

  const activeName = await getActivePortfolioName(rootTellDir);
  if (!activeName) return null;

  const portfolioDir = join(rootTellDir, 'portfolios', activeName);
  if (!existsSync(join(portfolioDir, 'portfolio.tell.json'))) return null;

  return portfolioDir;
}

/**
 * Backward-compatible alias for resolveActivePortfolioDir.
 * Used by MCP server's import of resolveTellDir.
 *
 * Note: This is now async (returns Promise<string | null>).
 * For synchronous callers that need the old behavior, use resolveRootTellDir.
 */
export function resolveTellDir(startDir: string = process.cwd()): string | null {
  // Synchronous fallback for backward compat (MCP server, etc.)
  // Checks multi-portfolio first, then legacy
  const rootTellDir = resolveRootTellDir(startDir);
  if (!rootTellDir) return null;

  // Multi-portfolio: read active file synchronously
  const activePath = join(rootTellDir, 'active');
  if (existsSync(activePath)) {
    const { readFileSync } = require('node:fs');
    const activeName = (readFileSync(activePath, 'utf-8') as string).trim();
    if (activeName) {
      const portfolioDir = join(rootTellDir, 'portfolios', activeName);
      if (existsSync(join(portfolioDir, 'portfolio.tell.json'))) return portfolioDir;
    }
  }

  // Legacy layout (not yet migrated)
  if (existsSync(join(rootTellDir, 'portfolio.tell.json'))) return rootTellDir;

  return null;
}
