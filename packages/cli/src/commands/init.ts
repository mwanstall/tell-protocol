import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FileStore } from '../store/file-store.js';
import { box } from '../output/box.js';
import { symbols } from '../output/symbols.js';
import { nextSteps } from '../output/hints.js';
import { formatWarning } from '../output/format.js';

export const initCommand = new Command('init')
  .description('Initialize a new Tell portfolio in the current directory')
  .option('-n, --name <name>', 'Portfolio name', 'My Portfolio')
  .option('-o, --org <organisation>', 'Organisation name', 'My Organisation')
  .action(async (opts) => {
    const cwd = process.cwd();
    const tellDir = join(cwd, '.tell');

    if (existsSync(join(tellDir, 'portfolio.tell.json'))) {
      console.log(formatWarning('A Tell portfolio already exists in this directory.'));
      return;
    }

    const store = await FileStore.init(cwd, opts.name, opts.org);
    const portfolio = await store.getPortfolio();

    console.log();
    console.log(box([
      `${pc.green(symbols.success)} ${pc.bold('Portfolio initialized')}`,
      '',
      `  ${pc.dim('Name')}         ${pc.bold(portfolio.name)}`,
      `  ${pc.dim('Organisation')} ${portfolio.organisation}`,
      `  ${pc.dim('Version')}      ${portfolio.version}`,
      `  ${pc.dim('Directory')}    ${pc.dim('.tell/')}`,
    ], { borderColor: pc.green }));
    // Launch interactive onboarding wizard in TTY environments
    if (process.stdout.isTTY) {
      const { runOnboardingWizard } = await import('../onboarding/wizard.js');
      await runOnboardingWizard(store);
    } else {
      console.log();
      console.log(nextSteps([
        'tell bet add "Your thesis here"',
        'tell status',
      ]));
      console.log();
    }
  });
