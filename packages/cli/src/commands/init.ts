import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FileStore } from '../store/file-store.js';

export const initCommand = new Command('init')
  .description('Initialize a new Tell portfolio in the current directory')
  .option('-n, --name <name>', 'Portfolio name', 'My Portfolio')
  .option('-o, --org <organisation>', 'Organisation name', 'My Organisation')
  .action(async (opts) => {
    const cwd = process.cwd();
    const tellDir = join(cwd, '.tell');

    if (existsSync(join(tellDir, 'portfolio.tell.json'))) {
      console.log(pc.yellow('A Tell portfolio already exists in this directory.'));
      return;
    }

    const store = await FileStore.init(cwd, opts.name, opts.org);
    const portfolio = await store.getPortfolio();

    console.log(pc.green('Initialized Tell portfolio:'));
    console.log(`  Name:         ${pc.bold(portfolio.name)}`);
    console.log(`  Organisation: ${portfolio.organisation}`);
    console.log(`  Version:      ${portfolio.version}`);
    console.log(`  Directory:    ${pc.dim('.tell/')}`);
    console.log();
    console.log(pc.dim('Next: tell bet add "Your thesis here"'));
  });
