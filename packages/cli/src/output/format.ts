import pc from 'picocolors';
import type { BetStatus, AssumptionStatus, ConnectionType } from '@tell-protocol/core';
import { symbols, statusSymbol } from './symbols.js';
import { resolveTellDir } from '../store/file-store.js';

export function colorStatus(status: BetStatus | AssumptionStatus): string {
  const sym = statusSymbol(status);
  switch (status) {
    case 'active':
    case 'holding':
      return `${sym} ${pc.green(status)}`;
    case 'paused':
    case 'pressure':
      return `${sym} ${pc.yellow(status)}`;
    case 'killed':
    case 'failing':
      return `${sym} ${pc.red(status)}`;
    case 'succeeded':
      return `${sym} ${pc.cyan(status)}`;
    case 'unknown':
      return `${sym} ${pc.dim(status)}`;
    default:
      return status;
  }
}

export function colorExpStatus(status: string): string {
  switch (status) {
    case 'running':
      return pc.blue(status);
    case 'completed':
      return pc.cyan(status);
    case 'abandoned':
      return pc.dim(status);
    case 'planned':
      return pc.dim(status);
    default:
      return status;
  }
}

export function confidenceBar(confidence: number | undefined): string {
  if (confidence === undefined) return pc.dim('--');
  const width = 10;
  const filled = Math.round((confidence / 100) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const color = confidence >= 70 ? pc.green : confidence >= 40 ? pc.yellow : pc.red;
  return `${color(bar)} ${confidence}%`;
}

export function connectionTypeLabel(type: ConnectionType): string {
  switch (type) {
    case 'tension':
      return pc.red('tension');
    case 'synergy':
      return pc.green('synergy');
    case 'dependency':
      return pc.blue('dependency');
    case 'resource_conflict':
      return pc.yellow('resource_conflict');
  }
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

export function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return pc.dim('never');
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return pc.green('today');
  if (days === 1) return pc.green('1d ago');
  if (days <= 14) return pc.green(`${days}d ago`);
  if (days <= 30) return pc.yellow(`${days}d ago`);
  return pc.red(`${days}d ago`);
}

export function padRight(text: string, len: number): string {
  // Strip ANSI codes for length calculation
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const padding = Math.max(0, len - stripped.length);
  return text + ' '.repeat(padding);
}

export function header(text: string): string {
  return pc.bold(pc.white(text));
}

export function formatSuccess(msg: string): string {
  return `${pc.green(symbols.success)} ${msg}`;
}

export function formatError(msg: string): string {
  return `${pc.red(symbols.error)} ${msg}`;
}

export function formatWarning(msg: string): string {
  return `${pc.yellow(symbols.warning)} ${msg}`;
}

export function ensurePortfolio(): string {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(formatError('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
  return tellDir;
}
