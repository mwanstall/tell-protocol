import { Command } from 'commander';
import pc from 'picocolors';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { connectionTypeLabel } from '../output/format.js';
import type { ConnectionType } from '@tell-protocol/core';

function getStore(): FileStore {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
  return new FileStore(tellDir);
}

const addCmd = new Command('add')
  .description('Add a connection between two bets')
  .argument('<bet-a>', 'First bet ID')
  .argument('<bet-b>', 'Second bet ID')
  .requiredOption('--type <type>', 'Connection type: tension, synergy, dependency, resource_conflict')
  .argument('<description>', 'Description of the relationship')
  .action(async (betA, betB, description, opts) => {
    const store = getStore();
    const conn = await store.addConnection({
      type: opts.type as ConnectionType,
      bet_ids: [betA, betB],
      description,
    });

    console.log(pc.green('Connection added:'));
    console.log(`  ID:   ${pc.bold(conn.id)}`);
    console.log(`  Type: ${connectionTypeLabel(conn.type)}`);
    console.log(`  Bets: ${betA} <-> ${betB}`);
  });

const listCmd = new Command('list')
  .description('List all connections')
  .action(async () => {
    const store = getStore();
    const connections = await store.getConnections();

    if (connections.length === 0) {
      console.log(pc.dim('No connections.'));
      return;
    }

    for (const c of connections) {
      console.log(`  ${pc.bold(c.id)}  ${connectionTypeLabel(c.type)}  ${c.bet_ids.join(' <-> ')}`);
      console.log(`  ${c.description}`);
      console.log();
    }
  });

export const connectCommand = new Command('connect')
  .description('Manage connections between bets')
  .addCommand(addCmd)
  .addCommand(listCmd);
