import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { portfolioHealth } from '@tell-protocol/core';
import { confidenceBar, header } from '../output/format.js';

export const statusCommand = new Command('status')
  .description('Show portfolio health overview')
  .action(async () => {
    const tellDir = resolveTellDir();
    if (!tellDir) {
      console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
      process.exit(1);
    }

    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const health = portfolioHealth(portfolio);

    console.log(header(`${portfolio.name} — v${portfolio.version}`));
    console.log(pc.dim(portfolio.organisation));
    console.log();

    console.log(header('Bets'));
    console.log(`  ${pc.green(`${health.betsByStatus.active} active`)}  ${pc.yellow(`${health.betsByStatus.paused} paused`)}  ${pc.red(`${health.betsByStatus.killed} killed`)}  ${pc.cyan(`${health.betsByStatus.succeeded} succeeded`)}`);
    if (health.averageConfidence !== null) {
      console.log(`  Avg confidence: ${confidenceBar(health.averageConfidence)}`);
    }
    console.log();

    console.log(header('Assumptions'));
    console.log(`  ${pc.green(`${health.assumptionsByStatus.holding} holding`)}  ${pc.yellow(`${health.assumptionsByStatus.pressure} pressure`)}  ${pc.red(`${health.assumptionsByStatus.failing} failing`)}  ${pc.dim(`${health.assumptionsByStatus.unknown} unknown`)}`);
    if (health.staleAssumptionCount > 0) {
      console.log(`  ${pc.red(`${health.staleAssumptionCount} stale`)} (no evidence in 14+ days)`);
    }
    console.log();

    console.log(header('Evidence'));
    console.log(`  ${health.totalEvidence} total records`);
    console.log();

    console.log(header('Connections'));
    console.log(`  ${health.totalConnections} total`);
  });
