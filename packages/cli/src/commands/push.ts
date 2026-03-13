import { Command } from 'commander';
import pc from 'picocolors';
import type { Evidence } from '@tell-protocol/core';
import { FileStore } from '../store/file-store.js';
import { getRemote, setRemotePortfolioId, extractHost } from '../sync/config.js';
import { SyncClient, SyncApiError } from '../sync/client.js';
import type { SyncPayload } from '../sync/client.js';
import { ensurePortfolio, formatSuccess, formatError, formatWarning, CliError } from '../output/format.js';
import { createSpinner } from '../output/spinner.js';
import { symbols } from '../output/symbols.js';

export const pushCommand = new Command('push')
  .description('Push this portfolio to a remote platform')
  .argument('[remote]', 'Remote name', 'origin')
  .option('-f, --force', 'Push even if remote is ahead (overwrites remote)')
  .option('--dry-run', 'Show what would be pushed without pushing')
  .action(async (remoteName: string, opts: { force?: boolean; dryRun?: boolean }) => {
    const tellDir = await ensurePortfolio();

    // Resolve remote
    let remote;
    try {
      remote = await getRemote(tellDir, remoteName);
    } catch {
      console.error(formatError(`Remote "${remoteName}" not found. Run "tell remote add ${remoteName} <url>" first.`));
      throw new CliError('');
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

    // Collect audit events
    const auditEvents = await store.getAuditLog();

    const payload: SyncPayload = { portfolio, evidence, audit_events: auditEvents };
    const client = new SyncClient(remote.url);
    const hostName = extractHost(remote.url);

    const betCount = portfolio.bets.length;
    const evidenceCount = Object.values(evidence).reduce((sum, e) => sum + e.length, 0);
    const auditCount = auditEvents.length;
    const raCount = portfolio.bets.reduce((sum, b) => sum + (b.resource_allocations?.length || 0), 0);

    // Pre-push version check (if we have a remote portfolio ID)
    if (remote.portfolio_id && !opts.force) {
      try {
        const remoteInfo = await client.status(remote.portfolio_id);
        const localVersion = await store.getPortfolioVersion();
        if (remoteInfo.version > localVersion) {
          console.error(formatError(
            `Remote version ${remoteInfo.version} is ahead of local version ${localVersion}.`
          ));
          console.log(pc.dim('  Run "tell pull" first, or "tell push --force" to overwrite.'));
          throw new CliError('');
        }
      } catch (err) {
        if (err instanceof CliError) throw err;
        // If status check fails (e.g. network), continue with the push
      }
    }

    // Dry run — just show summary
    if (opts.dryRun) {
      console.log(formatSuccess(`${symbols.info} Dry run — nothing will be pushed`));
      console.log(pc.dim(`  Remote:    ${hostName}`));
      console.log(pc.dim(`  Portfolio: ${portfolio.name} (v${portfolio.version})`));
      console.log(pc.dim(`  Bets:      ${betCount}`));
      console.log(pc.dim(`  Evidence:  ${evidenceCount} records`));
      if (raCount > 0) console.log(pc.dim(`  Resources: ${raCount} allocations`));
      if (auditCount > 0) console.log(pc.dim(`  Audit:     ${auditCount} events`));
      if (remote.portfolio_id) {
        console.log(pc.dim(`  Linked to: ${remote.portfolio_id}`));
      } else {
        console.log(pc.dim(`  First push — will create new remote portfolio`));
      }
      return;
    }

    const spinner = createSpinner(`Pushing to ${hostName}...`);
    spinner.start();

    try {
      const result = await client.push(payload, remote.portfolio_id, opts.force);

      // Store remote portfolio ID for future pushes
      if (!remote.portfolio_id || remote.portfolio_id !== result.portfolio_id) {
        await setRemotePortfolioId(tellDir, remoteName, result.portfolio_id);
      }

      if (result.created) {
        spinner.succeed(`Portfolio created on remote (${result.portfolio_id})`);
      } else {
        spinner.succeed(`Portfolio synced to version ${result.version}`);
      }

      const parts = [`${betCount} bets`, `${evidenceCount} evidence`];
      if (raCount > 0) parts.push(`${raCount} allocations`);
      if (auditCount > 0) parts.push(`${auditCount} audit events`);
      console.log(pc.dim(`  ${parts.join(', ')} pushed`));

      if (result.warnings && result.warnings.length > 0) {
        for (const w of result.warnings) {
          console.log(formatWarning(w));
        }
      }
    } catch (err) {
      spinner.fail('Push failed');

      if (err instanceof SyncApiError) {
        switch (err.code) {
          case 'version_conflict':
            console.error(formatError('Remote is ahead of local. Run "tell pull" first, or "tell push --force" to overwrite.'));
            break;
          case 'auth_expired':
            console.error(formatError('Authentication expired. Run "tell auth login" to re-authenticate.'));
            break;
          case 'insufficient_access':
            console.error(formatError('Insufficient access. You need contributor or higher role on this portfolio.'));
            break;
          case 'validation_error':
            console.error(formatError('Payload validation failed:'));
            if (Array.isArray(err.details)) {
              for (const d of err.details) {
                console.error(pc.dim(`  ${d.path}: ${d.message}`));
              }
            }
            break;
          default:
            console.error(formatError(err.message));
        }
      } else {
        console.error(formatError((err as Error).message));
      }
      throw new CliError('');
    }
  });
