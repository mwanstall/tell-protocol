import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { colorStatus, timeAgo, truncate, ensurePortfolio, formatSuccess } from '../output/format.js';
import { box } from '../output/box.js';
import { symbols } from '../output/symbols.js';
import { nextSteps } from '../output/hints.js';

function getStore(): FileStore {
  const tellDir = ensurePortfolio();
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Add an assumption to a bet')
  .argument('<bet-id>', 'Bet ID')
  .argument('<statement>', 'Testable assumption statement')
  .option('--threshold <threshold>', 'Evidence threshold description')
  .action(async (betId, statement, opts) => {
    const store = getStore();
    const assumption = await store.addAssumption(betId, {
      statement,
      evidence_threshold: opts.threshold,
    });

    console.log();
    console.log(box([
      `${pc.green(symbols.success)} ${pc.bold('Assumption added')}`,
      '',
      `  ${pc.dim('ID')}        ${pc.bold(assumption.id)}`,
      `  ${pc.dim('Statement')} ${statement}`,
      `  ${pc.dim('Bet')}       ${betId}`,
    ], { borderColor: pc.green }));
    console.log();
    console.log(nextSteps([
      `tell evidence add ${assumption.id} --signal supports "Your evidence"`,
    ]));
    console.log();
  });

const listCmd = new Command('list')
  .description('List assumptions for a bet')
  .argument('<bet-id>', 'Bet ID')
  .action(async (betId) => {
    const store = getStore();
    const assumptions = await store.getAssumptionsForBet(betId);

    if (assumptions.length === 0) {
      console.log(pc.dim('No assumptions for this bet.'));
      return;
    }

    console.log();
    for (const a of assumptions) {
      const evCount = a.evidence.length;
      console.log(`  ${symbols.bullet} ${pc.bold(a.id)}  ${colorStatus(a.status)}  ${timeAgo(a.last_signal_at)}`);
      console.log(`    ${truncate(a.statement, 76)}`);
      console.log(`    ${pc.dim(`${evCount} evidence record${evCount !== 1 ? 's' : ''}`)}`);
      console.log();
    }
  });

const linkCmd = new Command('link')
  .description('Share an assumption across bets')
  .argument('<assumption-id>', 'Assumption ID')
  .argument('<bet-id>', 'Target bet ID')
  .action(async (assumptionId, betId) => {
    const store = getStore();
    await store.linkAssumptionToBet(assumptionId, betId);
    console.log(formatSuccess(`Assumption ${pc.bold(assumptionId)} ${symbols.arrow} bet ${pc.bold(betId)}`));
  });

export const assumeCommand = new Command('assume')
  .description('Manage assumptions')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(linkCmd);
