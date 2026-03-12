import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { portfolioHealth } from '@tell-protocol/core';
import { confidenceBar, ensurePortfolio } from '../output/format.js';
import { box, section } from '../output/box.js';
import { symbols } from '../output/symbols.js';

export const statusCommand = new Command('status')
  .description('Show portfolio health overview')
  .action(async () => {
    const tellDir = await ensurePortfolio();
    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const health = portfolioHealth(portfolio);

    console.log();
    console.log(box([
      pc.bold(pc.white(`${portfolio.name} — v${portfolio.version}`)),
      pc.dim(portfolio.organisation),
    ], { title: 'Portfolio', borderColor: pc.cyan }));
    console.log();

    console.log(section('Bets'));
    console.log(`  ${pc.green(symbols.active)} ${pc.green(`${health.betsByStatus.active} active`)}  ${pc.yellow(symbols.pending)} ${pc.yellow(`${health.betsByStatus.paused} paused`)}  ${pc.red(symbols.error)} ${pc.red(`${health.betsByStatus.killed} killed`)}  ${pc.cyan(symbols.success)} ${pc.cyan(`${health.betsByStatus.succeeded} succeeded`)}`);
    if (health.averageConfidence !== null) {
      console.log(`  Avg confidence: ${confidenceBar(health.averageConfidence)}`);
    }
    console.log();

    console.log(section('Assumptions'));
    console.log(`  ${pc.green(symbols.active)} ${pc.green(`${health.assumptionsByStatus.holding} holding`)}  ${pc.yellow(symbols.pending)} ${pc.yellow(`${health.assumptionsByStatus.pressure} pressure`)}  ${pc.red(symbols.error)} ${pc.red(`${health.assumptionsByStatus.failing} failing`)}  ${pc.dim(`${health.assumptionsByStatus.unknown} unknown`)}`);
    if (health.staleAssumptionCount > 0) {
      console.log(`  ${pc.red(symbols.warning)} ${pc.red(`${health.staleAssumptionCount} stale`)} ${pc.dim('(no evidence in 14+ days)')}`);
    }
    console.log();

    console.log(section('Evidence'));
    console.log(`  ${health.totalEvidence} total records`);
    console.log();

    console.log(section('Connections'));
    console.log(`  ${health.totalConnections} total`);
    console.log();
  });
