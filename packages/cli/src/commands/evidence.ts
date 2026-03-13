import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { ensurePortfolio } from '../output/format.js';
import { box } from '../output/box.js';
import { symbols, signalSymbol } from '../output/symbols.js';
import type { SignalDirection, SignalConfidence } from '@tell-protocol/core';

async function getStore(): Promise<FileStore> {
  const tellDir = await ensurePortfolio();
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Append evidence to an assumption')
  .argument('<assumption-id>', 'Assumption ID')
  .argument('<summary>', 'Evidence summary')
  .requiredOption('--signal <signal>', 'Signal direction: supports, weakens, neutral')
  .option('--confidence <level>', 'Confidence: high, medium, low', 'medium')
  .option('--source <type>', 'Source type: human, ai_curated, agent', 'human')
  .option('--ref <uri>', 'Data reference URI')
  .action(async (assumptionId, summary, opts) => {
    const store = await getStore();

    const evidence = await store.appendEvidence({
      assumption_ids: [assumptionId],
      source_type: opts.source,
      contributor_id: 'cli_user',
      signal: opts.signal as SignalDirection,
      confidence: opts.confidence as SignalConfidence,
      summary,
      data_ref: opts.ref,
      timestamp: new Date().toISOString(),
    });

    const signalColor = opts.signal === 'supports' ? pc.green : opts.signal === 'weakens' ? pc.red : pc.dim;

    console.log();
    console.log(box([
      `${pc.green(symbols.success)} ${pc.bold('Evidence recorded')}`,
      '',
      `  ${pc.dim('ID')}         ${pc.bold(evidence.id)}`,
      `  ${pc.dim('Signal')}     ${signalSymbol(opts.signal)} ${signalColor(opts.signal)}`,
      `  ${pc.dim('Confidence')} ${opts.confidence}`,
      `  ${pc.dim('Summary')}    ${summary}`,
    ], { borderColor: pc.green }));
    console.log();
  });

const listCmd = new Command('list')
  .description('List evidence for an assumption')
  .argument('<assumption-id>', 'Assumption ID')
  .action(async (assumptionId) => {
    const store = await getStore();
    const evidence = await store.getEvidence(assumptionId);

    if (evidence.length === 0) {
      console.log(pc.dim('No evidence for this assumption.'));
      return;
    }

    console.log();
    for (const ev of evidence) {
      const retracted = ev.is_retracted ? pc.strikethrough(pc.dim(' [retracted]')) : '';
      console.log(`  ${signalSymbol(ev.signal)} ${pc.dim(ev.id)}  ${ev.signal}  ${pc.dim(ev.confidence || 'medium')}${retracted}`);
      console.log(`    ${ev.summary}`);
      console.log(`    ${pc.dim(new Date(ev.timestamp).toLocaleDateString())}  ${pc.dim(ev.source_type)}`);
      console.log();
    }
  });

export const evidenceCommand = new Command('evidence')
  .description('Manage evidence')
  .addCommand(addCmd)
  .addCommand(listCmd);
