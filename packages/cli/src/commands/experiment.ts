import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { truncate, ensurePortfolio, formatSuccess, formatError, colorExpStatus, CliError } from '../output/format.js';
import { box, section } from '../output/box.js';
import { symbols, experimentStatusSymbol, signalSymbol } from '../output/symbols.js';
import { nextSteps } from '../output/hints.js';
import type { ExperimentStatus } from '@tell-protocol/core';

async function getStore(): Promise<FileStore> {
  const tellDir = await ensurePortfolio();
  return new FileStore(tellDir);
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
    const store = await getStore();
    const bet = await store.getBet(betId);
    if (!bet) {
      throw new CliError(`Bet not found: ${betId}`);
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

    const lines = [
      `${pc.green(symbols.success)} ${pc.bold('Experiment created')}`,
      '',
      `  ${pc.dim('ID')}         ${pc.bold(experiment.id)}`,
      `  ${pc.dim('Bet')}        ${betId}`,
      `  ${pc.dim('Hypothesis')} ${hypothesis}`,
      `  ${pc.dim('Method')}     ${opts.method}`,
      `  ${pc.dim('Success')}    ${opts.success}`,
    ];
    if (opts.cost) lines.push(`  ${pc.dim('Cost cap')}   ${opts.cost}`);
    if (opts.timebox) lines.push(`  ${pc.dim('Time box')}   ${opts.timebox}`);

    console.log();
    console.log(box(lines, { borderColor: pc.green }));
    console.log();
    console.log(nextSteps([`tell experiment start ${experiment.id}`]));
    console.log();
  });

const listCmd = new Command('list')
  .description('List experiments')
  .option('--bet <id>', 'Filter by bet ID')
  .action(async (opts) => {
    const store = await getStore();
    const experiments = opts.bet
      ? await store.getExperimentsForBet(opts.bet)
      : await store.getExperiments();

    if (experiments.length === 0) {
      console.log(pc.dim('No experiments yet.'));
      console.log();
      console.log(nextSteps(['tell experiment add <bet-id> "Your hypothesis"']));
      console.log();
      return;
    }

    console.log();
    console.log(section('Experiments'));

    for (const exp of experiments) {
      console.log(`  ${experimentStatusSymbol(exp.status)} ${pc.bold(exp.id)}  ${colorExpStatus(exp.status)}  ${pc.dim(exp.bet_id)}`);
      console.log(`    ${truncate(exp.hypothesis, 76)}`);
      if (exp.outcome) {
        const signalColor = exp.outcome.signal === 'supports' ? pc.green : exp.outcome.signal === 'weakens' ? pc.red : pc.yellow;
        console.log(`    ${signalSymbol(exp.outcome.signal)} Outcome: ${signalColor(exp.outcome.signal)} ${symbols.dash} ${truncate(exp.outcome.summary, 56)}`);
      }
      console.log();
    }
  });

const startCmd = new Command('start')
  .description('Start a planned experiment')
  .argument('<id>', 'Experiment ID')
  .action(async (id) => {
    const store = await getStore();
    const experiment = await store.updateExperiment(id, { status: 'running' as ExperimentStatus });
    console.log(`${pc.blue(symbols.active)} Experiment started: ${pc.bold(experiment.id)}`);
  });

const concludeCmd = new Command('conclude')
  .description('Conclude an experiment with an outcome')
  .argument('<id>', 'Experiment ID')
  .requiredOption('--signal <signal>', 'Outcome signal: supports, weakens, or neutral')
  .requiredOption('--summary <summary>', 'Summary of the outcome')
  .action(async (id, opts) => {
    const store = await getStore();
    const experiment = await store.updateExperiment(id, {
      status: 'concluded' as ExperimentStatus,
      outcome: {
        signal: opts.signal,
        summary: opts.summary,
        concluded_at: new Date().toISOString(),
      },
    });
    const signalColor = opts.signal === 'supports' ? pc.green : opts.signal === 'weakens' ? pc.red : pc.yellow;

    console.log();
    console.log(box([
      `${pc.cyan(symbols.success)} ${pc.bold('Experiment concluded')}`,
      '',
      `  ${pc.dim('ID')}     ${pc.bold(experiment.id)}`,
      `  ${pc.dim('Signal')} ${signalSymbol(opts.signal)} ${signalColor(opts.signal)}`,
      `  ${pc.dim('Result')} ${opts.summary}`,
    ], { borderColor: pc.cyan }));
    console.log();
  });

const abandonCmd = new Command('abandon')
  .description('Abandon an experiment')
  .argument('<id>', 'Experiment ID')
  .action(async (id) => {
    const store = await getStore();
    const experiment = await store.updateExperiment(id, { status: 'abandoned' as ExperimentStatus });
    console.log(formatError(`Experiment abandoned: ${pc.bold(experiment.id)}`));
  });

export const experimentCommand = new Command('experiment')
  .description('Manage experiments')
  .addCommand(addCmd)
  .addCommand(listCmd)
  .addCommand(startCmd)
  .addCommand(concludeCmd)
  .addCommand(abandonCmd);
