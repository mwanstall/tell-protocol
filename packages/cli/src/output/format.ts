import pc from 'picocolors';
import type { BetStatus, AssumptionStatus, ConnectionType } from '@tell-protocol/core';

export function colorStatus(status: BetStatus | AssumptionStatus): string {
  switch (status) {
    case 'active':
    case 'holding':
      return pc.green(status);
    case 'paused':
    case 'pressure':
      return pc.yellow(status);
    case 'killed':
    case 'failing':
      return pc.red(status);
    case 'succeeded':
      return pc.cyan(status);
    case 'unknown':
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
