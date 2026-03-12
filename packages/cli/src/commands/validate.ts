import { Command } from 'commander';
import pc from 'picocolors';
import { readFile } from 'node:fs/promises';
import { validateTellDocument } from '@tell-protocol/schema';
import { formatSuccess, formatError } from '../output/format.js';
import { symbols } from '../output/symbols.js';

export const validateCommand = new Command('validate')
  .description('Validate a .tell.json file against the schema')
  .argument('<file>', 'Path to .tell.json file')
  .action(async (file) => {
    let data: string;
    try {
      data = await readFile(file, 'utf-8');
    } catch {
      console.error(formatError(`Could not read file: ${file}`));
      process.exit(1);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      console.error(formatError('Invalid JSON'));
      process.exit(1);
    }

    const result = validateTellDocument(parsed);

    if (result.valid) {
      console.log(formatSuccess(`${file} is valid Tell v0.2`));
    } else {
      console.log(formatError(`${file} has ${result.errors.length} error(s):`));
      for (const err of result.errors) {
        console.log(`  ${symbols.bullet} ${pc.dim(err.path)} ${err.message}`);
      }
      process.exit(1);
    }
  });
