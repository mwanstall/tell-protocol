import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import { FileStore } from '../store/file-store.js';
import { serialize } from '@tell-protocol/core';
import { ensurePortfolio, formatSuccess } from '../output/format.js';

export const exportCommand = new Command('export')
  .description('Export the portfolio as a .tell.json file')
  .option('-o, --output <file>', 'Output file path', 'portfolio.tell.json')
  .action(async (opts) => {
    const tellDir = ensurePortfolio();
    const store = new FileStore(tellDir);
    const portfolio = await store.getPortfolio();
    const json = serialize(portfolio);
    await writeFile(opts.output, json);
    console.log(formatSuccess(`Exported to ${opts.output}`));
  });
