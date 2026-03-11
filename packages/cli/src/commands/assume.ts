import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { colorStatus, timeAgo, truncate } from '../output/format.js';

function getStore(): FileStore {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
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

    console.log(pc.green('Assumption added:'));
    console.log(`  ID:        ${pc.bold(assumption.id)}`);
    console.log(`  Statement: ${statement}`);
    console.log(`  Bet:       ${betId}`);
    console.log();
    console.log(pc.dim(`Next: tell evidence add ${assumption.id} --signal supports "Your evidence"`));
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

    for (const a of assumptions) {
      const evCount = a.evidence.length;
      console.log(`  ${pc.bold(a.id)}  ${colorStatus(a.status)}  ${timeAgo(a.last_signal_at)}`);
      console.log(`  ${truncate(a.statement, 80)}`);
      console.log(`  ${pc.dim(`${evCount} evidence record${evCount !== 1 ? 's' : ''}`)}`);
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
    console.log(pc.green(`Assumption ${assumptionId} linked to bet ${betId}`));
  });

export const assumeCommand = new Command('assume')
  .description('Manage assumptions')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(linkCmd);
