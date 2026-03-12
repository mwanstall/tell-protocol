import pc from 'picocolors';
import { symbols } from './symbols.js';

export function nextSteps(lines: string[]): string {
  const border = pc.dim;
  const parts: string[] = [];

  parts.push(border(`  ${symbols.topLeft} ${pc.dim('Next')}`));
  for (const line of lines) {
    parts.push(border(`  ${symbols.vertical}`) + ` ${pc.dim(line)}`);
  }
  parts.push(border(`  ${symbols.bottomLeft}`));

  return parts.join('\n');
}
