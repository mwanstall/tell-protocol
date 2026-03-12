import { Command } from 'commander';
import pc from 'picocolors';
import type { Evidence } from '@tell-protocol/core';
import { FileStore } from '../store/file-store.js';
import { getRemote, setRemotePortfolioId, extractHost } from '../sync/config.js';
import { SyncClient } from '../sync/client.js';
import type { SyncPayload } from '../sync/client.js';
import { ensurePortfolio, formatSuccess, formatError } from '../output/format.js';
import { createSpinner } from '../output/spinner.js';
import { symbols } from '../output/symbols.js';

export const pushCommand = new Command('push')
  .description('Push this portfolio to a remote platform')
  .argument('[remote]', 'Remote name', 'origin')
  .action(async (remoteName: string) => {
    const tellDir = await ensurePortfolio();

    // Resolve remote
    let remote;
    try {
      remote = await getRemote(tellDir, remoteName);
    } catch {
      console.error(formatError(`Remote "${remoteName}" not found. Run "tell remote add ${remoteName} <url>" first.`));
      process.exit(1);
    }

    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();

    // Collect all evidence keyed by assumption ID
    const evidence: Record<string, Evidence[]> = {};
    for (const bet of portfolio.bets) {
      for (const assumption of bet.assumptions) {
        const records = await store.getEvidence(assumption.id);
        if (records.length > 0) {
          evidence[assumption.id] = records;
        }
      }
    }

    const payload: SyncPayload = { portfolio, evidence };
    const client = new SyncClient(remote.url);
    const hostName = extractHost(remote.url);

    const spinner = createSpinner(`Pushing to ${hostName}...`);
    spinner.start();

    try {
      const result = await client.push(payload, remote.portfolio_id);

      // Store remote portfolio ID for future pushes
      if (!remote.portfolio_id || remote.portfolio_id !== result.portfolio_id) {
        await setRemotePortfolioId(tellDir, remoteName, result.portfolio_id);
      }

      const betCount = portfolio.bets.length;
      const evidenceCount = Object.values(evidence).reduce((sum, e) => sum + e.length, 0);

      if (result.created) {
        spinner.succeed(`Portfolio created on remote (${result.portfolio_id})`);
      } else {
        spinner.succeed(`Portfolio synced to version ${result.version}`);
      }
      console.log(pc.dim(`  ${betCount} bets, ${evidenceCount} evidence records pushed`));
    } catch (err) {
      spinner.fail('Push failed');
      console.error(formatError((err as Error).message));
      process.exit(1);
    }
  });
