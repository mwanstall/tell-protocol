import { Command, CommanderError } from 'commander';
import { createInterface } from 'node:readline';
import pc from 'picocolors';
import { showBanner } from '../output/banner.js';
import { initCommand } from '../commands/init.js';
import { betCommand } from '../commands/bet.js';
import { assumeCommand } from '../commands/assume.js';
import { evidenceCommand } from '../commands/evidence.js';
import { statusCommand } from '../commands/status.js';
import { staleCommand } from '../commands/stale.js';
import { riskCommand } from '../commands/risk.js';
import { exportCommand } from '../commands/export.js';
import { validateCommand } from '../commands/validate.js';
import { connectCommand } from '../commands/connect.js';
import { experimentCommand } from '../commands/experiment.js';
import { authCommand } from '../commands/auth.js';
import { remoteCommand } from '../commands/remote.js';
import { pushCommand } from '../commands/push.js';
import { pullCommand } from '../commands/pull.js';

const program = new Command()
  .name('tell')
  .description('The Tell Protocol CLI — encode strategic intent')
  .version('0.3.0')
  .exitOverride() // throw instead of process.exit so the REPL survives
  .action(() => {
    // When invoked with no args, start interactive mode (TTY) or show help (non-TTY)
    if (process.stdout.isTTY) {
      startRepl();
    } else {
      showBanner();
      program.outputHelp();
    }
  });

program.addCommand(initCommand);
program.addCommand(betCommand);
program.addCommand(assumeCommand);
program.addCommand(evidenceCommand);
program.addCommand(statusCommand);
program.addCommand(staleCommand);
program.addCommand(riskCommand);
program.addCommand(exportCommand);
program.addCommand(validateCommand);
program.addCommand(connectCommand);
program.addCommand(experimentCommand);

// Sync commands
program.addCommand(authCommand);
program.addCommand(remoteCommand);
program.addCommand(pushCommand);
program.addCommand(pullCommand);

// ── Tokenizer ────────────────────────────────────────────────────
// Splits input respecting quoted strings: bet add "My thesis here"
// → ['bet', 'add', 'My thesis here']
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

// ── REPL ─────────────────────────────────────────────────────────
function startRepl(): void {
  showBanner();
  console.log(`  ${pc.dim('Type a command, or')} ${pc.bold('help')} ${pc.dim('for available commands.')} ${pc.bold('exit')} ${pc.dim('to quit.')}`);
  console.log();

  const PROMPT = `${pc.cyan('tell')} ${pc.dim('>')} `;

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    terminal: true,
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    const input = line.trim();

    // Empty line
    if (!input) {
      rl.prompt();
      return;
    }

    // Exit commands
    if (['exit', 'quit', '.exit', '.quit'].includes(input.toLowerCase())) {
      console.log(pc.dim('  Goodbye.'));
      rl.close();
      return;
    }

    // Help shortcut
    if (input.toLowerCase() === 'help') {
      program.outputHelp();
      console.log();
      rl.prompt();
      return;
    }

    // Parse and execute command
    const tokens = tokenize(input);
    try {
      await program.parseAsync(['node', 'tell', ...tokens]);
    } catch (err) {
      // Commander throws CommanderError for --help, unknown commands, etc.
      // These are expected in REPL mode — just continue
      if (err instanceof CommanderError) {
        // exitCode 0 means --help or --version was triggered (output already printed)
        // non-zero means unknown command or validation error (also already printed)
      } else if (err instanceof Error) {
        console.error(pc.red(`  Error: ${err.message}`));
      }
    }

    console.log();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log();
    console.log(pc.dim('  Goodbye.'));
    process.exit(0);
  });
}

// ── Entry Point ──────────────────────────────────────────────────
// If args were passed (e.g. `tell status`), run as one-shot command
// If no args, the default action above will handle it (REPL or help)
try {
  await program.parseAsync();
} catch (err) {
  // In one-shot mode, CommanderError from exitOverride is expected for --help/--version
  if (err instanceof CommanderError) {
    process.exit(err.exitCode);
  }
  throw err;
}
