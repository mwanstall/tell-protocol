import pc from 'picocolors';
import { symbols } from './symbols.js';

const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

export interface BoxOptions {
  title?: string;
  padding?: number;
  borderColor?: (s: string) => string;
  width?: number;
}

export function box(lines: string[], options: BoxOptions = {}): string {
  const { title, padding = 1, borderColor = pc.dim, width: fixedWidth } = options;
  const pad = ' '.repeat(padding);

  // Calculate content width
  const contentWidths = lines.map((l) => visibleLength(l));
  const titleWidth = title ? visibleLength(title) + 2 : 0; // +2 for spaces around title
  const maxContent = Math.max(...contentWidths, titleWidth);
  const innerWidth = fixedWidth ? fixedWidth - 2 - padding * 2 : maxContent;
  const totalWidth = innerWidth + padding * 2;

  // Top border
  let top: string;
  if (title) {
    const titleStr = ` ${title} `;
    const remainingWidth = totalWidth - visibleLength(titleStr);
    top = borderColor(
      symbols.topLeft + symbols.horizontal + titleStr + symbols.horizontal.repeat(Math.max(0, remainingWidth - 1)) + symbols.topRight,
    );
  } else {
    top = borderColor(symbols.topLeft + symbols.horizontal.repeat(totalWidth) + symbols.topRight);
  }

  // Content lines
  const contentLines = lines.map((line) => {
    const lineLen = visibleLength(line);
    const rightPad = ' '.repeat(Math.max(0, innerWidth - lineLen));
    return borderColor(symbols.vertical) + pad + line + rightPad + pad + borderColor(symbols.vertical);
  });

  // Bottom border
  const bottom = borderColor(symbols.bottomLeft + symbols.horizontal.repeat(totalWidth) + symbols.bottomRight);

  return [top, ...contentLines, bottom].join('\n');
}

export function divider(width: number = 40): string {
  return pc.dim(symbols.horizontal.repeat(width));
}

export function section(title: string): string {
  const titleStr = pc.bold(pc.white(title));
  const underline = pc.dim(symbols.horizontal.repeat(visibleLength(title)));
  return `${titleStr}\n${underline}`;
}
