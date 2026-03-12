import { Command } from 'commander';
import pc from 'picocolors';
import { SyncClient } from '../sync/client.js';
import {
  saveHostToken,
  removeHostToken,
  readAuthCredentials,
  extractHost,
} from '../sync/config.js';
import { box } from '../output/box.js';
import { symbols } from '../output/symbols.js';
import { createSpinner } from '../output/spinner.js';
import { formatSuccess, formatError, CliError } from '../output/format.js';
import { nextSteps } from '../output/hints.js';

const DEFAULT_HOST = 'https://app.apophenic.com';

const loginCommand = new Command('login')
  .description('Authenticate with an Apophenic platform instance')
  .option('-h, --host <url>', 'Platform URL', DEFAULT_HOST)
  .action(async (opts) => {
    const host = opts.host.replace(/\/+$/, '');
    const hostName = extractHost(host);

    const client = new SyncClient(host);

    try {
      // Step 1: Initiate device auth flow
      const { device_code, verification_url } = await client.deviceAuthInit();

      console.log();
      console.log(box([
        pc.bold('Open this URL in your browser:'),
        pc.cyan(verification_url),
        '',
        `Enter code: ${pc.bold(pc.yellow(device_code))}`,
      ], { title: `Login ${symbols.arrow} ${hostName}`, borderColor: pc.cyan }));
      console.log();

      // Step 2: Poll for completion with spinner
      const spinner = createSpinner('Waiting for authentication...');
      spinner.start();

      const maxAttempts = 60; // 5 minutes at 5s intervals
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const result = await client.deviceAuthPoll(device_code);

        if (result.status === 'complete' && result.token) {
          await saveHostToken(hostName, result.token, result.user_email);
          spinner.succeed(`Authenticated as ${result.user_email || 'user'}`);
          console.log(pc.dim(`  Credentials saved for ${hostName}`));
          return;
        }

        if (result.status === 'expired') {
          spinner.fail('Authentication expired');
          throw new CliError('');
        }
      }

      spinner.fail('Authentication timed out');
      throw new CliError('');
    } catch (err) {
      console.error(formatError(`Authentication failed: ${(err as Error).message}`));
      throw new CliError('');
    }
  });

const logoutCommand = new Command('logout')
  .description('Remove stored credentials for a platform host')
  .option('-h, --host <url>', 'Platform URL', DEFAULT_HOST)
  .action(async (opts) => {
    const hostName = extractHost(opts.host);
    await removeHostToken(hostName);
    console.log(formatSuccess(`Logged out from ${hostName}`));
  });

const statusCommand = new Command('status')
  .description('Show current authentication status')
  .action(async () => {
    const creds = await readAuthCredentials();
    const hosts = Object.entries(creds.hosts);

    if (hosts.length === 0) {
      console.log(pc.dim('Not authenticated with any hosts.'));
      console.log();
      console.log(nextSteps(['tell auth login']));
      console.log();
      return;
    }

    console.log();
    console.log(pc.bold('Authenticated hosts:'));
    for (const [host, info] of hosts) {
      const email = info.user_email ? ` (${info.user_email})` : '';
      const date = new Date(info.created_at).toLocaleDateString();
      console.log(`  ${pc.green(symbols.active)} ${pc.green(host)}${email} ${pc.dim(`${symbols.dash} since ${date}`)}`);
    }
    console.log();
  });

export const authCommand = new Command('auth')
  .description('Manage authentication with Apophenic platform')
  .addCommand(loginCommand)
  .addCommand(logoutCommand)
  .addCommand(statusCommand);
