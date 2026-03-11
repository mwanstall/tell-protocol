import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { colorStatus, confidenceBar, truncate, timeAgo, header } from '../output/format.js';
import type { BetStatus, InvestmentStage } from '@tell-protocol/core';

function getStore(): FileStore {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Add a new bet')
  .argument('<thesis>', 'The falsifiable thesis for this bet')
  .option('--horizon <duration>', 'Time horizon (e.g., 6m, 12m, 2y)')
  .option('--stage <stage>', 'Investment stage: exploring, validating, committed, scaling')
  .option('--owner <owner>', 'Bet owner')
  .action(async (thesis, opts) => {
    const store = getStore();

    // Parse time horizon
    let time_horizon;
    if (opts.horizon) {
      const now = new Date();
      const match = opts.horizon.match(/^(\d+)(d|w|m|y)$/);
      if (match) {
        const [, num, unit] = match;
        const target = new Date(now);
        const n = parseInt(num);
        if (unit === 'd') target.setDate(target.getDate() + n);
        else if (unit === 'w') target.setDate(target.getDate() + n * 7);
        else if (unit === 'm') target.setMonth(target.getMonth() + n);
        else if (unit === 'y') target.setFullYear(target.getFullYear() + n);
        time_horizon = { start: now.toISOString(), target: target.toISOString() };
      }
    }

    const bet = await store.addBet({
      thesis,
      status: 'active',
      stage: opts.stage as InvestmentStage | undefined,
      assumptions: [],
      owner: opts.owner,
      time_horizon,
    });

    console.log(pc.green('Bet created:'));
    console.log(`  ID:     ${pc.bold(bet.id)}`);
    console.log(`  Thesis: ${thesis}`);
    if (time_horizon) console.log(`  Target: ${new Date(time_horizon.target).toLocaleDateString()}`);
    console.log();
    console.log(pc.dim(`Next: tell assume add ${bet.id} "Your assumption here"`));
  });

const listCmd = new Command('list')
  .description('List all bets')
  .action(async () => {
    const store = getStore();
    const bets = await store.getBets();

    if (bets.length === 0) {
      console.log(pc.dim('No bets yet. Run "tell bet add" to create one.'));
      return;
    }

    console.log(header('Bets'));
    console.log();

    for (const bet of bets) {
      const asmCount = bet.assumptions.length;
      const stageLabel = bet.stage ? pc.magenta(bet.stage) + '  ' : '';
      console.log(`  ${pc.bold(bet.id)}  ${colorStatus(bet.status)}  ${stageLabel}${confidenceBar(bet.confidence)}`);
      console.log(`  ${truncate(bet.thesis, 80)}`);
      console.log(`  ${pc.dim(`${asmCount} assumption${asmCount !== 1 ? 's' : ''}`)}`);
      console.log();
    }
  });

const killCmd = new Command('kill')
  .description('Kill a bet')
  .argument('<id>', 'Bet ID')
  .action(async (id) => {
    const store = getStore();
    const bet = await store.updateBet(id, { status: 'killed' as BetStatus });
    console.log(pc.red(`Bet killed: ${bet.id}`));
  });

const succeedCmd = new Command('succeed')
  .description('Mark a bet as succeeded')
  .argument('<id>', 'Bet ID')
  .action(async (id) => {
    const store = getStore();
    const bet = await store.updateBet(id, { status: 'succeeded' as BetStatus });
    console.log(pc.cyan(`Bet succeeded: ${bet.id}`));
  });

const stageCmd = new Command('stage')
  .description('Set the investment stage of a bet')
  .argument('<id>', 'Bet ID')
  .argument('<stage>', 'Investment stage: exploring, validating, committed, scaling')
  .action(async (id, stage) => {
    const validStages = ['exploring', 'validating', 'committed', 'scaling'];
    if (!validStages.includes(stage)) {
      console.error(pc.red(`Invalid stage: ${stage}. Must be one of: ${validStages.join(', ')}`));
      process.exit(1);
    }
    const store = getStore();
    const bet = await store.updateBet(id, { stage: stage as InvestmentStage });
    console.log(`Bet ${pc.bold(bet.id)} stage set to ${pc.magenta(stage)}`);
  });

export const betCommand = new Command('bet')
  .description('Manage bets')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(killCmd)
  .addCommand(succeedCmd)
  .addCommand(stageCmd);
