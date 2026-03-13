import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { colorStatus, confidenceBar, truncate, ensurePortfolio, formatSuccess, formatError, CliError } from '../output/format.js';
import { box } from '../output/box.js';
import { symbols } from '../output/symbols.js';
import { nextSteps } from '../output/hints.js';
import { section } from '../output/box.js';
import type { BetStatus, InvestmentStage } from '@tell-protocol/core';
import { parseHorizon } from '../utils/parse-horizon.js';

async function getStore(): Promise<FileStore> {
  const tellDir = await ensurePortfolio();
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Add a new bet')
  .argument('<thesis>', 'The falsifiable thesis for this bet')
  .option('--horizon <duration>', 'Time horizon (e.g., 6m, 12m, 2y)')
  .option('--stage <stage>', 'Investment stage: exploring, validating, committed, scaling')
  .option('--owner <owner>', 'Bet owner')
  .action(async (thesis, opts) => {
    const store = await getStore();

    const time_horizon = parseHorizon(opts.horizon);
    if (opts.horizon) {
      console.log(pc.yellow(`\n  ${symbols.warning || '⚠'} --horizon is deprecated. Express timelines as assumptions instead.`));
      console.log(pc.dim(`    e.g. tell assume add <bet-id> "Revenue reaches \$1M by Q3 2027"\n`));
    }

    const bet = await store.addBet({
      thesis,
      status: 'active',
      stage: opts.stage as InvestmentStage | undefined,
      assumptions: [],
      owner: opts.owner,
      time_horizon,
    });

    const lines = [
      `${pc.green(symbols.success)} ${pc.bold('Bet created')}`,
      '',
      `  ${pc.dim('ID')}     ${pc.bold(bet.id)}`,
      `  ${pc.dim('Thesis')} ${thesis}`,
    ];
    if (time_horizon) lines.push(`  ${pc.dim('Target')} ${new Date(time_horizon.target).toLocaleDateString()}`);

    console.log();
    console.log(box(lines, { borderColor: pc.green }));
    console.log();
    console.log(nextSteps([
      `tell assume add ${bet.id} "Your assumption here"`,
    ]));
    console.log();
  });

const listCmd = new Command('list')
  .description('List all bets')
  .action(async () => {
    const store = await getStore();
    const bets = await store.getBets();

    if (bets.length === 0) {
      console.log(pc.dim('No bets yet.'));
      console.log();
      console.log(nextSteps(['tell bet add "Your thesis here"']));
      console.log();
      return;
    }

    console.log();
    console.log(section('Bets'));

    for (const bet of bets) {
      const asmCount = bet.assumptions.length;
      const stageLabel = bet.stage ? pc.magenta(bet.stage) + '  ' : '';
      console.log(`  ${symbols.bullet} ${pc.bold(bet.id)}  ${colorStatus(bet.status)}  ${stageLabel}${confidenceBar(bet.confidence)}`);
      console.log(`    ${truncate(bet.thesis, 76)}`);
      console.log(`    ${pc.dim(`${asmCount} assumption${asmCount !== 1 ? 's' : ''}`)}`);
      console.log();
    }
  });

const killCmd = new Command('kill')
  .description('Kill a bet')
  .argument('<id>', 'Bet ID')
  .action(async (id) => {
    const store = await getStore();
    const bet = await store.updateBet(id, { status: 'killed' as BetStatus });
    console.log(formatError(`Bet killed: ${pc.bold(bet.id)}`));
  });

const succeedCmd = new Command('succeed')
  .description('Mark a bet as succeeded')
  .argument('<id>', 'Bet ID')
  .action(async (id) => {
    const store = await getStore();
    const bet = await store.updateBet(id, { status: 'succeeded' as BetStatus });
    console.log(formatSuccess(`Bet succeeded: ${pc.bold(bet.id)}`));
  });

const stageCmd = new Command('stage')
  .description('Set the investment stage of a bet')
  .argument('<id>', 'Bet ID')
  .argument('<stage>', 'Investment stage: exploring, validating, committed, scaling')
  .action(async (id, stage) => {
    const validStages = ['exploring', 'validating', 'committed', 'scaling'];
    if (!validStages.includes(stage)) {
      throw new CliError(`Invalid stage: ${stage}. Must be one of: ${validStages.join(', ')}`);
    }
    const store = await getStore();
    const bet = await store.updateBet(id, { stage: stage as InvestmentStage });
    console.log(formatSuccess(`Bet ${pc.bold(bet.id)} stage set to ${pc.magenta(stage)}`));
  });

export const betCommand = new Command('bet')
  .description('Manage bets')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(killCmd)
  .addCommand(succeedCmd)
  .addCommand(stageCmd);
