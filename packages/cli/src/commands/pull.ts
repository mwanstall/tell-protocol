import { Command } from 'commander';
import pc from 'picocolors';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { getRemote, extractHost } from '../sync/config.js';
import { SyncClient } from '../sync/client.js';

export const pullCommand = new Command('pull')
  .description('Pull portfolio updates from a remote platform')
  .argument('[remote]', 'Remote name', 'origin')
  .option('-f, --force', 'Overwrite local changes without confirmation')
  .action(async (remoteName: string, opts) => {
    const tellDir = resolveTellDir();
    if (!tellDir) {
      console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
      process.exit(1);
    }

    // Resolve remote
    let remote;
    try {
      remote = await getRemote(tellDir, remoteName);
    } catch {
      console.error(pc.red(`Remote "${remoteName}" not found. Run "tell remote add ${remoteName} <url>" first.`));
      process.exit(1);
    }

    if (!remote.portfolio_id) {
      console.error(pc.red('No remote portfolio linked. Push first with "tell push" to establish the link.'));
      process.exit(1);
    }

    const client = new SyncClient(remote.url);
    const store = new FileStore(tellDir);

    console.log(pc.dim(`Pulling from ${extractHost(remote.url)}...`));

    try {
      // Check remote version first
      const remoteInfo = await client.status(remote.portfolio_id);
      const localVersion = await store.getPortfolioVersion();

      if (remoteInfo.version === localVersion && !opts.force) {
        console.log(pc.green('Already up to date.'));
        return;
      }

      if (remoteInfo.version < localVersion && !opts.force) {
        console.log(pc.yellow(`Local version (${localVersion}) is ahead of remote (${remoteInfo.version}).`));
        console.log(pc.dim('Use "tell push" to update the remote, or "tell pull --force" to overwrite local.'));
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
      console.log(pc.green(`Pulled version ${result.version}`));
      console.log(pc.dim(`  ${betCount} bets, ${evidenceCount} evidence records`));
    } catch (err) {
      console.error(pc.red(`Pull failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });
