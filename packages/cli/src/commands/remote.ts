import { Command } from 'commander';
import pc from 'picocolors';
import { addRemote, removeRemote, readTellConfig } from '../sync/config.js';
import { ensurePortfolio, formatSuccess, formatError, CliError } from '../output/format.js';
import { symbols } from '../output/symbols.js';
import { nextSteps } from '../output/hints.js';

const addCommand = new Command('add')
  .description('Add a remote to this portfolio')
  .argument('<name>', 'Remote name (e.g., "origin")')
  .argument('<url>', 'Platform URL (e.g., "https://app.apophenic.com")')
  .action(async (name: string, url: string) => {
    const tellDir = await ensurePortfolio();
    try {
      await addRemote(tellDir, name, url);
      console.log(formatSuccess(`Remote "${name}" added: ${url}`));
    } catch (err) {
      console.error(formatError((err as Error).message));
      throw new CliError('');
    }
  });

const removeCmd = new Command('remove')
  .description('Remove a remote')
  .argument('<name>', 'Remote name')
  .action(async (name: string) => {
    const tellDir = await ensurePortfolio();
    try {
      await removeRemote(tellDir, name);
      console.log(formatSuccess(`Remote "${name}" removed`));
    } catch (err) {
      console.error(formatError((err as Error).message));
      throw new CliError('');
    }
  });

const listCommand = new Command('list')
  .description('List configured remotes')
  .action(async () => {
    const tellDir = await ensurePortfolio();
    const config = await readTellConfig(tellDir);

    if (config.remotes.length === 0) {
      console.log(pc.dim('No remotes configured.'));
      console.log();
      console.log(nextSteps(['tell remote add <name> <url>']));
      console.log();
      return;
    }

    console.log();
    for (const remote of config.remotes) {
      const linked = remote.portfolio_id ? pc.dim(` [${remote.portfolio_id}]`) : '';
      console.log(`  ${symbols.bullet} ${pc.bold(remote.name)}  ${remote.url}${linked}`);
    }
    console.log();
  });

export const remoteCommand = new Command('remote')
  .description('Manage remote platform connections')
  .addCommand(addCommand)
  .addCommand(removeCmd)
  .addCommand(listCommand);
