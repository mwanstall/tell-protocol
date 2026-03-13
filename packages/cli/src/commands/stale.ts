import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { findStaleAssumptions } from '@tell-protocol/core';
import { truncate, timeAgo, ensurePortfolio, formatSuccess, formatWarning } from '../output/format.js';
import { symbols } from '../output/symbols.js';
import { section } from '../output/box.js';

export const staleCommand = new Command('stale')
  .description('Find stale assumptions lacking recent evidence')
  .option('-d, --days <days>', 'Staleness threshold in days', '14')
  .action(async (opts) => {
    const tellDir = await ensurePortfolio();
    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const threshold = parseInt(opts.days);
    const stale = findStaleAssumptions(portfolio, threshold);

    console.log();

    if (stale.length === 0) {
      console.log(formatSuccess(`No stale assumptions (threshold: ${threshold} days).`));
      console.log();
      return;
    }

    console.log(section(`${symbols.warning} ${stale.length} stale assumption${stale.length !== 1 ? 's' : ''} (>${threshold} days without evidence)`));

    for (const s of stale) {
      console.log(`  ${symbols.bullet} ${pc.bold(s.assumption.id)}  ${timeAgo(s.assumption.last_signal_at)}`);
      console.log(`    ${truncate(s.assumption.statement, 76)}`);
      console.log(`    ${pc.dim(`Bet: ${truncate(s.betThesis, 60)}`)}`);
      console.log();
    }
  });
