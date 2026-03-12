import pc from 'picocolors';
import gradientString from 'gradient-string';

const ART = [
  '  ████████╗ ███████╗ ██╗      ██╗     ',
  '  ╚══██╔══╝ ██╔════╝ ██║      ██║     ',
  '     ██║    █████╗   ██║      ██║     ',
  '     ██║    ██╔══╝   ██║      ██║     ',
  '     ██║    ███████╗ ███████╗ ███████╗',
  '     ╚═╝    ╚══════╝ ╚══════╝ ╚══════╝',
];

const SHADOW = [
  '     ░░     ░░░░░░░░ ░░░░░░░░ ░░░░░░░░',
];

const VERSION = 'protocol v0.2.0';
const TAGLINE = 'Encode strategic intent. Track what you believe and why.';

const tellGradient = gradientString(['#06b6d4', '#8b5cf6', '#ec4899']);

export function showBanner(): void {
  console.log();

  if (process.stdout.isTTY) {
    console.log(tellGradient.multiline(ART.join('\n')));
    console.log(pc.dim(SHADOW.join('\n')));
  } else {
    console.log(pc.cyan(ART.join('\n')));
  }

  console.log();
  console.log(`  ${pc.dim(VERSION)}`);
  console.log(`  ${pc.dim(TAGLINE)}`);
  console.log();
}
