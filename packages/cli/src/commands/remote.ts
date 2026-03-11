import { Command } from 'commander';
import pc from 'picocolors';
import { resolveTellDir } from '../store/file-store.js';
import { addRemote, removeRemote, readTellConfig } from '../sync/config.js';

function getDir(): string {
  const tellDir = resolveTellDir();
  if (!tellDir) {
    console.error(pc.red('No Tell portfolio found. Run "tell init" first.'));
    process.exit(1);
  }
  return tellDir;
}

const addCommand = new Command('add')
  .description('Add a remote to this portfolio')
  .argument('<name>', 'Remote name (e.g., "origin")')
  .argument('<url>', 'Platform URL (e.g., "https://app.apophenic.com")')
  .action(async (name: string, url: string) => {
    const tellDir = getDir();
    try {
      await addRemote(tellDir, name, url);
      console.log(pc.green(`Remote "${name}" added: ${url}`));
    } catch (err) {
      console.error(pc.red((err as Error).message));
      process.exit(1);
    }
  });

const removeCmd = new Command('remove')
  .description('Remove a remote')
  .argument('<name>', 'Remote name')
  .action(async (name: string) => {
    const tellDir = getDir();
    try {
      await removeRemote(tellDir, name);
      console.log(pc.green(`Remote "${name}" removed`));
    } catch (err) {
      console.error(pc.red((err as Error).message));
      process.exit(1);
    }
  });

const listCommand = new Command('list')
  .description('List configured remotes')
  .action(async () => {
    const tellDir = getDir();
    const config = await readTellConfig(tellDir);

    if (config.remotes.length === 0) {
      console.log(pc.dim('No remotes configured.'));
      console.log(pc.dim('Run "tell remote add <name> <url>" to add one.'));
      return;
    }

    for (const remote of config.remotes) {
      const linked = remote.portfolio_id ? pc.dim(` [${remote.portfolio_id}]`) : '';
      console.log(`  ${pc.bold(remote.name)}\t${remote.url}${linked}`);
    }
  });

export const remoteCommand = new Command('remote')
  .description('Manage remote platform connections')
  .addCommand(addCommand)
  .addCommand(removeCmd)
  .addCommand(listCommand);
