import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore } from '../store/file-store.js';
import { connectionTypeLabel, ensurePortfolio, formatSuccess } from '../output/format.js';
import { box } from '../output/box.js';
import { symbols } from '../output/symbols.js';
import type { ConnectionType } from '@tell-protocol/core';

async function getStore(): Promise<FileStore> {
  const tellDir = await ensurePortfolio();
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Add a connection between two bets')
  .argument('<bet-a>', 'First bet ID')
  .argument('<bet-b>', 'Second bet ID')
  .requiredOption('--type <type>', 'Connection type: tension, synergy, dependency, resource_conflict')
  .argument('<description>', 'Description of the relationship')
  .action(async (betA, betB, description, opts) => {
    const store = await getStore();
    const conn = await store.addConnection({
      type: opts.type as ConnectionType,
      bet_ids: [betA, betB],
      description,
    });

    console.log();
    console.log(box([
      `${pc.green(symbols.success)} ${pc.bold('Connection added')}`,
      '',
      `  ${pc.dim('ID')}   ${pc.bold(conn.id)}`,
      `  ${pc.dim('Type')} ${connectionTypeLabel(conn.type)}`,
      `  ${pc.dim('Bets')} ${betA} ${symbols.arrow} ${betB}`,
    ], { borderColor: pc.green }));
    console.log();
  });

const listCmd = new Command('list')
  .description('List all connections')
  .action(async () => {
    const store = await getStore();
    const connections = await store.getConnections();

    if (connections.length === 0) {
      console.log(pc.dim('No connections.'));
      return;
    }

    console.log();
    for (const c of connections) {
      console.log(`  ${symbols.bullet} ${pc.bold(c.id)}  ${connectionTypeLabel(c.type)}  ${c.bet_ids.join(` ${symbols.arrow} `)}`);
      console.log(`    ${c.description}`);
      console.log();
    }
  });

export const connectCommand = new Command('connect')
  .description('Manage connections between bets')
  .addCommand(addCmd)
  .addCommand(listCmd);
