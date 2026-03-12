import pc from 'picocolors';
import type { BetStatus, AssumptionStatus } from '@tell-protocol/core';

const supportsUnicode = (): boolean => {
  // Modern Windows Terminal, VS Code terminal, etc.
  if (process.env.WT_SESSION || process.env.TERM_PROGRAM) return true;
  if (process.platform !== 'win32') return true;
  // Legacy Windows cmd.exe — no Unicode
  return false;
};

const unicode = supportsUnicode();

export const symbols = {
  success: unicode ? '✓' : 'v',
  error: unicode ? '✗' : 'x',
  active: unicode ? '●' : '*',
  pending: unicode ? '◌' : 'o',
  bullet: unicode ? '▸' : '-',
  arrow: unicode ? '→' : '->',
  warning: unicode ? '⚠' : '!',
  star: unicode ? '✦' : '*',
  dash: unicode ? '─' : '-',
  dot: unicode ? '·' : '.',
  info: unicode ? 'ℹ' : 'i',
  ellipsis: unicode ? '…' : '...',

  // Box-drawing characters
  topLeft: unicode ? '┌' : '+',
  topRight: unicode ? '┐' : '+',
  bottomLeft: unicode ? '└' : '+',
  bottomRight: unicode ? '┘' : '+',
  horizontal: unicode ? '─' : '-',
  vertical: unicode ? '│' : '|',
} as const;

export function statusSymbol(status: BetStatus | AssumptionStatus): string {
  switch (status) {
    case 'active':
    case 'holding':
      return pc.green(symbols.active);
    case 'paused':
    case 'pressure':
      return pc.yellow(symbols.pending);
    case 'killed':
    case 'failing':
      return pc.red(symbols.error);
    case 'succeeded':
      return pc.cyan(symbols.success);
    case 'unknown':
      return pc.dim(symbols.pending);
    default:
      return pc.dim(symbols.dot);
  }
}

export function signalSymbol(signal: string): string {
  switch (signal) {
    case 'supports':
      return pc.green(symbols.success);
    case 'weakens':
      return pc.red(symbols.error);
    case 'neutral':
      return pc.dim(symbols.dot);
    default:
      return pc.dim(symbols.dot);
  }
}

export function experimentStatusSymbol(status: string): string {
  switch (status) {
    case 'running':
      return pc.blue(symbols.active);
    case 'completed':
      return pc.cyan(symbols.success);
    case 'abandoned':
      return pc.dim(symbols.error);
    case 'planned':
      return pc.dim(symbols.pending);
    default:
      return pc.dim(symbols.dot);
  }
}
