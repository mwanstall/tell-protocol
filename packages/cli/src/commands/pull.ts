import { Command } from 'commander';
import pc from 'picocolors';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { FileStore } from '../store/file-store.js';
import { getRemote, extractHost } from '../sync/config.js';
import { SyncClient } from '../sync/client.js';
import { ensurePortfolio, formatSuccess, formatError, formatWarning } from '../output/format.js';
import { createSpinner } from '../output/spinner.js';

export const pullCommand = new Command('pull')
  .description('Pull portfolio updates from a remote platform')
  .argument('[remote]', 'Remote name', 'origin')
  .option('-f, --force', 'Overwrite local changes without confirmation')
  .action(async (remoteName: string, opts) => {
    const tellDir = await ensurePortfolio();

    // Resolve remote
    let remote;
    try {
      remote = await getRemote(tellDir, remoteName);
    } catch {
      console.error(formatError(`Remote "${remoteName}" not found. Run "tell remote add ${remoteName} <url>" first.`));
      process.exit(1);
    }

    if (!remote.portfolio_id) {
      console.error(formatError('No remote portfolio linked. Push first with "tell push" to establish the link.'));
      process.exit(1);
    }

    const client = new SyncClient(remote.url);
    const store = new FileStore(tellDir);
    const hostName = extractHost(remote.url);

    const spinner = createSpinner(`Pulling from ${hostName}...`);
    spinner.start();

    try {
      // Check remote version first
      const remoteInfo = await client.status(remote.portfolio_id);
      const localVersion = await store.getPortfolioVersion();

      if (remoteInfo.version === localVersion && !opts.force) {
        spinner.succeed('Already up to date.');
        return;
      }

      if (remoteInfo.version < localVersion && !opts.force) {
        spinner.info(`Local version (${localVersion}) is ahead of remote (${remoteInfo.version}).`);
        console.log(pc.dim('  Use "tell push" to update the remote, or "tell pull --force" to overwrite local.'));
        return;
      }

      // Pull the full portfolio
      const result = await client.pull(remote.portfolio_id);

      // Write portfolio (strip evidence from assumptions before writing — evidence lives in JSONL)
      const portfolioForDisk = structuredClone(result.portfolio);
      for (const bet of portfolioForDisk.bets) {
        for (const assumption of bet.assumptions) {
          assumption.evidence = [];
        }
      }
      await writeFile(
        join(tellDir, 'portfolio.tell.json'),
        JSON.stringify(portfolioForDisk, null, 2),
      );

      // Write evidence JSONL files
      await mkdir(join(tellDir, 'evidence'), { recursive: true });
      for (const [assumptionId, records] of Object.entries(result.evidence)) {
        const lines = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
        await writeFile(join(tellDir, 'evidence', `${assumptionId}.jsonl`), lines);
      }

      // Save version snapshot
      await mkdir(join(tellDir, 'history'), { recursive: true });
      await writeFile(
        join(tellDir, 'history', `v${String(result.version).padStart(3, '0')}.tell.json`),
        JSON.stringify(portfolioForDisk, null, 2),
      );

      const betCount = result.portfolio.bets.length;
      const evidenceCount = Object.values(result.evidence).reduce((sum, e) => sum + e.length, 0);
      spinner.succeed(`Pulled version ${result.version}`);
      console.log(pc.dim(`  ${betCount} bets, ${evidenceCount} evidence records`));
    } catch (err) {
      spinner.fail('Pull failed');
      console.error(formatError((err as Error).message));
      process.exit(1);
    }
  });
