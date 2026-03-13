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
import { portfolioCommand } from '../commands/portfolio.js';
import { resolveRootTellDir, getActivePortfolioName } from '../store/file-store.js';
import { CliError } from '../output/format.js';

const program = new Command()
  .name('tell')
  .description('The Tell Protocol CLI — encode strategic intent')
  .version('0.4.1')
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
program.addCommand(portfolioCommand);

// Propagate exitOverride to all nested subcommands so no command
// can call process.exit() and kill the REPL.
function applyExitOverride(cmd: Command): void {
  for (const sub of cmd.commands) {
    sub.exitOverride();
    applyExitOverride(sub);
  }
}
applyExitOverride(program);

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

  async function getPrompt(): Promise<string> {
    const rootDir = resolveRootTellDir();
    if (rootDir) {
      const active = await getActivePortfolioName(rootDir);
      if (active) {
        return `${pc.cyan('tell')} ${pc.dim('(')}${pc.yellow(active)}${pc.dim(')')} ${pc.dim('>')} `;
      }
    }
    return `${pc.cyan('tell')} ${pc.dim('>')} `;
  }

  // Create a fresh readline for each prompt cycle.
  // This ensures interactive sub-commands (inquirer prompts) get exclusive
  // control of stdin — a paused readline still intercepts keystrokes.
  async function nextPrompt(): Promise<void> {
    const PROMPT = await getPrompt();
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: PROMPT,
      terminal: true,
    });

    let closedForCommand = false;

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
        process.exit(0);
      }

      // Help shortcut
      if (input.toLowerCase() === 'help') {
        program.outputHelp();
        console.log();
        rl.prompt();
        return;
      }

      // Close this readline entirely so interactive sub-commands
      // (inquirer prompts, select menus, etc.) get exclusive stdin access.
      closedForCommand = true;
      rl.close();

      // Parse and execute command
      let tokens = tokenize(input);
      // Strip leading 'tell' — users often type "tell status" inside the REPL
      if (tokens[0] === 'tell') {
        tokens = tokens.slice(1);
      }
      if (tokens.length === 0) {
        nextPrompt();
        return;
      }
      try {
        await program.parseAsync(['node', 'tell', ...tokens]);
      } catch (err) {
        // Commander throws CommanderError for --help, unknown commands, etc.
        // These are expected in REPL mode — just continue
        if (err instanceof CommanderError) {
          // exitCode 0 means --help or --version was triggered (output already printed)
          // non-zero means unknown command or validation error (also already printed)
        } else if (err instanceof CliError) {
          // CliError = command already printed its error, just continue the REPL
          if (err.message) console.error(pc.red(`  Error: ${err.message}`));
        } else if (err instanceof Error) {
          console.error(pc.red(`  Error: ${err.message}`));
        }
      }

      console.log();
      // Command done — create a fresh readline for the next prompt
      nextPrompt();
    });

    rl.on('close', () => {
      if (!closedForCommand) {
        // Ctrl+C or Ctrl+D — user wants to exit
        console.log();
        console.log(pc.dim('  Goodbye.'));
        process.exit(0);
      }
    });
  }

  nextPrompt();
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
  // CliError = command already printed its error message
  if (err instanceof CliError) {
    if (err.message) console.error(pc.red(`  Error: ${err.message}`));
    process.exit(1);
  }
  throw err;
}
