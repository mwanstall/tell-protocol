import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import {
  resolveRootTellDir,
  listPortfolios,
  getActivePortfolioName,
  setActivePortfolio,
  removePortfolio,
} from '../store/file-store.js';
import { ensureRootTellDir, formatSuccess, formatError } from '../output/format.js';
import { symbols } from '../output/symbols.js';
import { box } from '../output/box.js';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const listCmd = new Command('list')
  .description('List all portfolios')
  .action(async () => {
    const rootDir = ensureRootTellDir();
    const portfolios = await listPortfolios(rootDir);
    const active = await getActivePortfolioName(rootDir);

    if (portfolios.length === 0) {
      console.log(pc.dim('No portfolios found. Run "tell init" to create one.'));
      return;
    }

    console.log();
    for (const slug of portfolios) {
      const isActive = slug === active;
      const portfolioDir = join(rootDir, 'portfolios', slug);
      let name = slug;

      // Try to read the portfolio name
      try {
        const store = new FileStore(portfolioDir);
        const portfolio = await store.getPortfolio();
        name = portfolio.name;
      } catch {
        // Fall back to slug
      }

      if (isActive) {
        console.log(`  ${pc.green(symbols.active)} ${pc.bold(pc.green(slug))}  ${pc.dim(name !== slug ? name : '')}`);
      } else {
        console.log(`  ${pc.dim(symbols.bullet)} ${slug}  ${pc.dim(name !== slug ? name : '')}`);
      }
    }
    console.log();
  });

const switchCmd = new Command('switch')
  .description('Switch to a different portfolio')
  .argument('<name>', 'Portfolio slug')
  .action(async (slug: string) => {
    const rootDir = ensureRootTellDir();
    const portfolioDir = join(rootDir, 'portfolios', slug);

    if (!existsSync(join(portfolioDir, 'portfolio.tell.json'))) {
      const available = await listPortfolios(rootDir);
      console.error(formatError(`Portfolio "${slug}" not found.`));
      if (available.length > 0) {
        console.log(pc.dim(`  Available: ${available.join(', ')}`));
      }
      return;
    }

    await setActivePortfolio(rootDir, slug);
    console.log(formatSuccess(`Switched to portfolio "${slug}"`));
  });

const currentCmd = new Command('current')
  .description('Show the active portfolio')
  .action(async () => {
    const rootDir = resolveRootTellDir();
    if (!rootDir) {
      console.log(pc.dim('No Tell portfolio found. Run "tell init" first.'));
      return;
    }

    const active = await getActivePortfolioName(rootDir);
    if (!active) {
      console.log(pc.dim('No active portfolio set.'));
      return;
    }

    const portfolioDir = join(rootDir, 'portfolios', active);
    try {
      const store = new FileStore(portfolioDir);
      const portfolio = await store.getPortfolio();

      console.log();
      console.log(box([
        `${pc.green(symbols.active)} ${pc.bold('Active portfolio')}`,
        '',
        `  ${pc.dim('Slug')}         ${pc.bold(active)}`,
        `  ${pc.dim('Name')}         ${portfolio.name}`,
        `  ${pc.dim('Organisation')} ${portfolio.organisation}`,
        `  ${pc.dim('Version')}      ${portfolio.version}`,
        `  ${pc.dim('Bets')}         ${portfolio.bets.length}`,
      ], { borderColor: pc.cyan }));
      console.log();
    } catch {
      console.log(`  Active: ${pc.bold(active)} ${pc.dim('(unable to read portfolio)')}`);
    }
  });

const removeCmd = new Command('remove')
  .description('Remove a portfolio')
  .argument('<name>', 'Portfolio slug')
  .action(async (slug: string) => {
    const rootDir = ensureRootTellDir();

    try {
      await removePortfolio(rootDir, slug);
      console.log(formatSuccess(`Portfolio "${slug}" removed.`));

      const remaining = await listPortfolios(rootDir);
      if (remaining.length > 0) {
        const active = await getActivePortfolioName(rootDir);
        console.log(pc.dim(`  Active portfolio is now "${active}"`));
      }
    } catch (err) {
      console.error(formatError((err as Error).message));
    }
  });

export const portfolioCommand = new Command('portfolio')
  .description('Manage portfolios')
  .addCommand(listCmd)
  .addCommand(switchCmd)
  .addCommand(currentCmd)
  .addCommand(removeCmd);
