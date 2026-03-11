import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { findStaleAssumptions } from '@tell-protocol/core';
import { truncate, timeAgo } from '../output/format.js';

export const staleCommand = new Command('stale')
  .description('Find stale assumptions lacking recent evidence')
  .option('-d, --days <days>', 'Staleness threshold in days', '14')
  .action(async (opts) => {
    const tellDir = resolveTellDir();
    if (!tellDir) {
      console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
      process.exit(1);
    }

    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const threshold = parseInt(opts.days);
    const stale = findStaleAssumptions(portfolio, threshold);

    if (stale.length === 0) {
      console.log(pc.green(`No stale assumptions (threshold: ${threshold} days).`));
      return;
    }

    console.log(pc.yellow(`${stale.length} stale assumption${stale.length !== 1 ? 's' : ''} (>${threshold} days without evidence):`));
    console.log();

    for (const s of stale) {
      console.log(`  ${pc.bold(s.assumption.id)}  ${timeAgo(s.assumption.last_signal_at)}`);
      console.log(`  ${truncate(s.assumption.statement, 80)}`);
      console.log(`  ${pc.dim(`Bet: ${truncate(s.betThesis, 60)}`)}`);
      console.log();
    }
  });
