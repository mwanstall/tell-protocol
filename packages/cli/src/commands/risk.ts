import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { assessRisk } from '@tell-protocol/core';
import { truncate, connectionTypeLabel, colorStatus, ensurePortfolio, formatSuccess } from '../output/format.js';
import { section } from '../output/box.js';
import { symbols } from '../output/symbols.js';

export const riskCommand = new Command('risk')
  .description('Portfolio risk assessment')
  .action(async () => {
    const tellDir = await ensurePortfolio();
    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const risk = assessRisk(portfolio);

    console.log();

    if (risk.sharedAssumptions.length === 0 && risk.resourceConflicts.length === 0 && risk.escalatedConnections.length === 0 && risk.failingAssumptions.length === 0) {
      console.log(formatSuccess('No significant risks detected.'));
      console.log();
      return;
    }

    if (risk.sharedAssumptions.length > 0) {
      console.log(section(`${symbols.warning} Shared Assumptions (${risk.sharedAssumptions.length})`));
      for (const sa of risk.sharedAssumptions) {
        console.log(`  ${symbols.bullet} ${pc.bold(sa.assumption.id)}  ${colorStatus(sa.assumption.status)}`);
        console.log(`    ${truncate(sa.assumption.statement, 76)}`);
        console.log(`    ${pc.dim(`Affects ${sa.betIds.length} bets: ${sa.betIds.join(', ')}`)}`);
      }
      console.log();
    }

    if (risk.failingAssumptions.length > 0) {
      console.log(section(`${symbols.error} Failing Assumptions (${risk.failingAssumptions.length})`));
      for (const fa of risk.failingAssumptions) {
        console.log(`  ${symbols.bullet} ${pc.bold(fa.id)} ${symbols.dash} ${truncate(fa.statement, 70)}`);
      }
      console.log();
    }

    if (risk.resourceConflicts.length > 0) {
      console.log(section(`${symbols.warning} Resource Conflicts (${risk.resourceConflicts.length})`));
      for (const rc of risk.resourceConflicts) {
        console.log(`  ${symbols.bullet} ${connectionTypeLabel(rc.type)} ${symbols.dash} ${truncate(rc.description, 66)}`);
      }
      console.log();
    }

    if (risk.escalatedConnections.length > 0) {
      console.log(section(`${symbols.error} Escalated Connections (${risk.escalatedConnections.length})`));
      for (const ec of risk.escalatedConnections) {
        console.log(`  ${symbols.bullet} ${connectionTypeLabel(ec.type)} ${symbols.dash} ${truncate(ec.description, 66)}`);
      }
      console.log();
    }
  });
