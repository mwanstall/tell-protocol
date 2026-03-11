import { Command } from 'commander';
import pc from 'picocolors';
import { readFile } from 'node:fs/promises';
import { validateTellDocument } from '@tell-protocol/schema';

export const validateCommand = new Command('validate')
  .description('Validate a .tell.json file against the schema')
  .argument('<file>', 'Path to .tell.json file')
  .action(async (file) => {
    let data: string;
    try {
      data = await readFile(file, 'utf-8');
    } catch {
      console.error(pc.red(`Could not read file: ${file}`));
      process.exit(1);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      console.error(pc.red('Invalid JSON'));
      process.exit(1);
    }

    const result = validateTellDocument(parsed);

    if (result.valid) {
      console.log(pc.green(`${file} is valid Tell v0.3`));
    } else {
      console.log(pc.red(`${file} has ${result.errors.length} error(s):`));
      for (const err of result.errors) {
        console.log(`  ${pc.dim(err.path)} ${err.message}`);
      }
      process.exit(1);
    }
  });
