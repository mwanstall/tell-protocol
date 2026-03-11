import { Command } from 'commander';
import pc from 'picocolors';
import { writeFile } from 'node:fs/promises';
import { FileStore, resolveTellDir } from '../store/file-store.js';
import { serialize } from '@tell-protocol/core';

export const exportCommand = new Command('export')
  .description('Export the portfolio as a .tell.json file')
  .option('-o, --output <file>', 'Output file path', 'portfolio.tell.json')
  .action(async (opts) => {
    const tellDir = resolveTellDir();
    if (!tellDir) {
      console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
      process.exit(1);
    }

    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const json = serialize(portfolio);
    await writeFile(opts.output, json);
    console.log(pc.green(`Exported to ${opts.output}`));
  });
