import { Command } from 'commander';
import { showBanner } from '../output/banner.js';
import { initCommand } from '../commands/init.js';
import { betCommand } from '../commands/bet.js';
import { assumeCommand } from '../commands/assume.js';
import { evidenceCommand } from '../commands/evidence.js';
import { statusCommand } from '../commands/status.js';
import { staleCommand } from '../commands/stale.js';
import { riskCommand } from '../commands/risk.js';
import { exportCommand } from '../commands/export.js';
import { validateCommand } from '../commands/validate.js';
import { connectCommand } from '../commands/connect.js';
import { experimentCommand } from '../commands/experiment.js';
import { authCommand } from '../commands/auth.js';
import { remoteCommand } from '../commands/remote.js';
import { pushCommand } from '../commands/push.js';
import { pullCommand } from '../commands/pull.js';

const program = new Command()
  .name('tell')
  .description('The Tell Protocol CLI — encode strategic intent')
  .version('0.2.0')
  .action(() => {
    showBanner();
    program.outputHelp();
  });

program.addCommand(initCommand);
program.addCommand(betCommand);
program.addCommand(assumeCommand);
program.addCommand(evidenceCommand);
program.addCommand(statusCommand);
program.addCommand(staleCommand);
program.addCommand(riskCommand);
program.addCommand(exportCommand);
program.addCommand(validateCommand);
program.addCommand(connectCommand);
program.addCommand(experimentCommand);

// Sync commands
program.addCommand(authCommand);
program.addCommand(remoteCommand);
program.addCommand(pushCommand);
program.addCommand(pullCommand);

program.parse();
