import { Command } from 'commander';
import pc from 'picocolors';
import { SyncClient } from '../sync/client.js';
import {
  saveHostToken,
  removeHostToken,
  readAuthCredentials,
  extractHost,
} from '../sync/config.js';

const DEFAULT_HOST = 'https://app.apophenic.com';

const loginCommand = new Command('login')
  .description('Authenticate with an Apophenic platform instance')
  .option('-h, --host <url>', 'Platform URL', DEFAULT_HOST)
  .action(async (opts) => {
    const host = opts.host.replace(/\/+$/, '');
    const hostName = extractHost(host);
    console.log(pc.dim(`Authenticating with ${hostName}...`));

    const client = new SyncClient(host);

    try {
      // Step 1: Initiate device auth flow
      const { device_code, verification_url } = await client.deviceAuthInit();

      console.log();
      console.log(pc.bold('Open this URL in your browser:'));
      console.log(pc.cyan(verification_url));
      console.log();
      console.log(`Enter code: ${pc.bold(pc.yellow(device_code))}`);
      console.log();
      console.log(pc.dim('Waiting for authentication...'));

      // Step 2: Poll for completion
      const maxAttempts = 60; // 5 minutes at 5s intervals
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const result = await client.deviceAuthPoll(device_code);

        if (result.status === 'complete' && result.token) {
          await saveHostToken(hostName, result.token, result.user_email);
          console.log(pc.green(`Authenticated as ${result.user_email || 'user'}`));
          console.log(pc.dim(`Credentials saved for ${hostName}`));
          return;
        }

        if (result.status === 'expired') {
          console.error(pc.red('Authentication expired. Please try again.'));
          process.exit(1);
        }
      }

      console.error(pc.red('Authentication timed out. Please try again.'));
      process.exit(1);
    } catch (err) {
      console.error(pc.red(`Authentication failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

const logoutCommand = new Command('logout')
  .description('Remove stored credentials for a platform host')
  .option('-h, --host <url>', 'Platform URL', DEFAULT_HOST)
  .action(async (opts) => {
    const hostName = extractHost(opts.host);
    await removeHostToken(hostName);
    console.log(pc.green(`Logged out from ${hostName}`));
  });

const statusCommand = new Command('status')
  .description('Show current authentication status')
  .action(async () => {
    const creds = await readAuthCredentials();
    const hosts = Object.entries(creds.hosts);

    if (hosts.length === 0) {
      console.log(pc.dim('Not authenticated with any hosts.'));
      console.log(pc.dim('Run "tell auth login" to authenticate.'));
      return;
    }

    console.log(pc.bold('Authenticated hosts:'));
    for (const [host, info] of hosts) {
      const email = info.user_email ? ` (${info.user_email})` : '';
      const date = new Date(info.created_at).toLocaleDateString();
      console.log(`  ${pc.green(host)}${email} — since ${date}`);
    }
  });

export const authCommand = new Command('auth')
  .description('Manage authentication with Apophenic platform')
  .addCommand(loginCommand)
  .addCommand(logoutCommand)
  .addCommand(statusCommand);
