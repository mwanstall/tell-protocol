import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { assessRisk } from '@tell-protocol/core';
import { truncate, connectionTypeLabel, colorStatus } from '../output/format.js';

export const riskCommand = new Command('risk')
  .description('Portfolio risk assessment')
  .action(async () => {
    const tellDir = resolveTellDir();
    if (!tellDir) {
      console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
      process.exit(1);
    }

    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const risk = assessRisk(portfolio);

    if (risk.sharedAssumptions.length === 0 && risk.resourceConflicts.length === 0 && risk.escalatedConnections.length === 0 && risk.failingAssumptions.length === 0) {
      console.log(pc.green('No significant risks detected.'));
      return;
    }

    if (risk.sharedAssumptions.length > 0) {
      console.log(pc.bold(pc.yellow(`Shared Assumptions (${risk.sharedAssumptions.length}):`)));
      for (const sa of risk.sharedAssumptions) {
        console.log(`  ${pc.bold(sa.assumption.id)} — ${colorStatus(sa.assumption.status)}`);
        console.log(`  ${truncate(sa.assumption.statement, 80)}`);
        console.log(`  ${pc.dim(`Affects ${sa.betIds.length} bets: ${sa.betIds.join(', ')}`)}`);
        console.log();
      }
    }

    if (risk.failingAssumptions.length > 0) {
      console.log(pc.bold(pc.red(`Failing Assumptions (${risk.failingAssumptions.length}):`)));
      for (const fa of risk.failingAssumptions) {
        console.log(`  ${pc.bold(fa.id)} — ${truncate(fa.statement, 70)}`);
      }
      console.log();
    }

    if (risk.resourceConflicts.length > 0) {
      console.log(pc.bold(pc.yellow(`Resource Conflicts (${risk.resourceConflicts.length}):`)));
      for (const rc of risk.resourceConflicts) {
        console.log(`  ${connectionTypeLabel(rc.type)} — ${truncate(rc.description, 70)}`);
      }
      console.log();
    }

    if (risk.escalatedConnections.length > 0) {
      console.log(pc.bold(pc.red(`Escalated Connections (${risk.escalatedConnections.length}):`)));
      for (const ec of risk.escalatedConnections) {
        console.log(`  ${connectionTypeLabel(ec.type)} — ${truncate(ec.description, 70)}`);
      }
      console.log();
    }
  });
