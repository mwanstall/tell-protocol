import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { colorStatus, truncate, header } from '../output/format.js';
import type { ExperimentStatus } from '@tell-protocol/core';

function getStore(): FileStore {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
  return new FileStore(tellDir);
}

function colorExpStatus(status: ExperimentStatus): string {
  switch (status) {
    case 'planned':
      return pc.dim(status);
    case 'running':
      return pc.blue(status);
    case 'concluded':
      return pc.green(status);
    case 'abandoned':
      return pc.red(status);
    default:
      return status;
  }
}

const addCmd = new Command('add')
  .description('Add a new experiment to a bet')
  .argument('<bet-id>', 'The bet ID this experiment tests')
  .argument('<hypothesis>', 'What the experiment will test')
  .requiredOption('--method <method>', 'How the experiment will be conducted')
  .requiredOption('--success <criteria>', 'What constitutes success')
  .option('--failure <criteria>', 'What constitutes failure')
  .option('--assumptions <ids>', 'Comma-separated assumption IDs to test')
  .option('--cost <ceiling>', 'Maximum cost (e.g., "$5,000")')
  .option('--timebox <duration>', 'Time box (e.g., "2 weeks")')
  .option('--owner <owner>', 'Experiment owner')
  .action(async (betId, hypothesis, opts) => {
    const store = getStore();
    const bet = await store.getBet(betId);
    if (!bet) {
      console.error(pc.red(`Bet not found: ${betId}`));
      process.exit(1);
    }

    const assumptionIds = opts.assumptions
      ? opts.assumptions.split(',').map((id: string) => id.trim())
      : bet.assumptions.map((a) => a.id);

    const experiment = await store.addExperiment({
      bet_id: betId,
      assumption_ids: assumptionIds,
      hypothesis,
      method: opts.method,
      success_criteria: opts.success,
      failure_criteria: opts.failure,
      status: 'planned',
      cost_ceiling: opts.cost,
      time_box: opts.timebox,
      owner: opts.owner,
    });

    console.log(pc.green('Experiment created:'));
    console.log(`  ID:         ${pc.bold(experiment.id)}`);
    console.log(`  Bet:        ${betId}`);
    console.log(`  Hypothesis: ${hypothesis}`);
    console.log(`  Method:     ${opts.method}`);
    console.log(`  Success:    ${opts.success}`);
    if (opts.cost) console.log(`  Cost cap:   ${opts.cost}`);
    if (opts.timebox) console.log(`  Time box:   ${opts.timebox}`);
    console.log();
    console.log(pc.dim(`Next: tell experiment start ${experiment.id}`));
  });

const listCmd = new Command('list')
  .description('List experiments')
  .option('--bet <id>', 'Filter by bet ID')
  .action(async (opts) => {
    const store = getStore();
    const experiments = opts.bet
      ? await store.getExperimentsForBet(opts.bet)
      : await store.getExperiments();

    if (experiments.length === 0) {
      console.log(pc.dim('No experiments yet. Run "tell experiment add" to create one.'));
      return;
    }

    console.log(header('Experiments'));
    console.log();

    for (const exp of experiments) {
      console.log(`  ${pc.bold(exp.id)}  ${colorExpStatus(exp.status)}  ${pc.dim(exp.bet_id)}`);
      console.log(`  ${truncate(exp.hypothesis, 80)}`);
      if (exp.outcome) {
        const signalColor = exp.outcome.signal === 'supports' ? pc.green : exp.outcome.signal === 'weakens' ? pc.red : pc.yellow;
        console.log(`  Outcome: ${signalColor(exp.outcome.signal)} — ${truncate(exp.outcome.summary, 60)}`);
      }
      console.log();
    }
  });

const startCmd = new Command('start')
  .description('Start a planned experiment')
  .argument('<id>', 'Experiment ID')
  .action(async (id) => {
    const store = getStore();
    const experiment = await store.updateExperiment(id, { status: 'running' as ExperimentStatus });
    console.log(pc.blue(`Experiment started: ${experiment.id}`));
  });

const concludeCmd = new Command('conclude')
  .description('Conclude an experiment with an outcome')
  .argument('<id>', 'Experiment ID')
  .requiredOption('--signal <signal>', 'Outcome signal: supports, weakens, or neutral')
  .requiredOption('--summary <summary>', 'Summary of the outcome')
  .action(async (id, opts) => {
    const store = getStore();
    const experiment = await store.updateExperiment(id, {
      status: 'concluded' as ExperimentStatus,
      outcome: {
        signal: opts.signal,
        summary: opts.summary,
        concluded_at: new Date().toISOString(),
      },
    });
    const signalColor = opts.signal === 'supports' ? pc.green : opts.signal === 'weakens' ? pc.red : pc.yellow;
    console.log(`Experiment concluded: ${experiment.id}`);
    console.log(`  Signal: ${signalColor(opts.signal)}`);
    console.log(`  ${opts.summary}`);
  });

const abandonCmd = new Command('abandon')
  .description('Abandon an experiment')
  .argument('<id>', 'Experiment ID')
  .action(async (id) => {
    const store = getStore();
    const experiment = await store.updateExperiment(id, { status: 'abandoned' as ExperimentStatus });
    console.log(pc.red(`Experiment abandoned: ${experiment.id}`));
  });

export const experimentCommand = new Command('experiment')
  .description('Manage experiments')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(startCmd)
  .addCommand(concludeCmd)
  .addCommand(abandonCmd);
