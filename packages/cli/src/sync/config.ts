import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// ── Per-portfolio remote config (stored in .tell/config.json) ──

export interface RemoteConfig {
  name: string;
  url: string;
  portfolio_id?: string; // Remote portfolio UUID, set after first push
}

export interface TellConfig {
  remotes: RemoteConfig[];
}

function defaultConfig(): TellConfig {
  return { remotes: [] };
}

export async function readTellConfig(tellDir: string): Promise<TellConfig> {
  const configPath = join(tellDir, 'config.json');
  if (!existsSync(configPath)) return defaultConfig();
  const data = await readFile(configPath, 'utf-8');
  return JSON.parse(data);
}

export async function writeTellConfig(tellDir: string, config: TellConfig): Promise<void> {
  const configPath = join(tellDir, 'config.json');
  await writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function addRemote(tellDir: string, name: string, url: string): Promise<void> {
  const config = await readTellConfig(tellDir);
  if (config.remotes.find((r) => r.name === name)) {
    throw new Error(`Remote "${name}" already exists`);
  }
  // Normalize URL: strip trailing slash
  const normalizedUrl = url.replace(/\/+$/, '');
  config.remotes.push({ name, url: normalizedUrl });
  await writeTellConfig(tellDir, config);
}

export async function removeRemote(tellDir: string, name: string): Promise<void> {
  const config = await readTellConfig(tellDir);
  const idx = config.remotes.findIndex((r) => r.name === name);
  if (idx === -1) throw new Error(`Remote "${name}" not found`);
  config.remotes.splice(idx, 1);
  await writeTellConfig(tellDir, config);
}

export async function getRemote(tellDir: string, name: string): Promise<RemoteConfig> {
  const config = await readTellConfig(tellDir);
  const remote = config.remotes.find((r) => r.name === name);
  if (!remote) throw new Error(`Remote "${name}" not found`);
  return remote;
}

export async function setRemotePortfolioId(tellDir: string, name: string, portfolioId: string): Promise<void> {
  const config = await readTellConfig(tellDir);
  const remote = config.remotes.find((r) => r.name === name);
  if (!remote) throw new Error(`Remote "${name}" not found`);
  remote.portfolio_id = portfolioId;
  await writeTellConfig(tellDir, config);
}

// ── Global auth credentials (stored in ~/.config/tell/) ──

export interface AuthCredentials {
  hosts: Record<string, HostCredentials>;
}

export interface HostCredentials {
  token: string;
  user_email?: string;
  created_at: string;
}

function globalConfigDir(): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME;
  if (xdgConfig) return join(xdgConfig, 'tell');
  return join(homedir(), '.config', 'tell');
}

async function ensureGlobalConfigDir(): Promise<string> {
  const dir = globalConfigDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function readAuthCredentials(): Promise<AuthCredentials> {
  const dir = globalConfigDir();
  const credPath = join(dir, 'credentials.json');
  if (!existsSync(credPath)) return { hosts: {} };
  const data = await readFile(credPath, 'utf-8');
  return JSON.parse(data);
}

export async function writeAuthCredentials(creds: AuthCredentials): Promise<void> {
  const dir = await ensureGlobalConfigDir();
  const credPath = join(dir, 'credentials.json');
  await writeFile(credPath, JSON.stringify(creds, null, 2));
}

export async function saveHostToken(host: string, token: string, email?: string): Promise<void> {
  const creds = await readAuthCredentials();
  creds.hosts[host] = {
    token,
    user_email: email,
    created_at: new Date().toISOString(),
  };
  await writeAuthCredentials(creds);
}

export async function getHostToken(host: string): Promise<string | null> {
  const creds = await readAuthCredentials();
  return creds.hosts[host]?.token ?? null;
}

export async function removeHostToken(host: string): Promise<void> {
  const creds = await readAuthCredentials();
  delete creds.hosts[host];
  await writeAuthCredentials(creds);
}

/** Extract host from a remote URL */
export function extractHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
