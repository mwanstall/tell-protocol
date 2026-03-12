import pc from 'picocolors';
import type { FileStore } from '../store/file-store.js';
import type { InvestmentStage, SignalDirection, SignalConfidence } from '@tell-protocol/core';
import { box, section } from '../output/box.js';
import { symbols, signalSymbol } from '../output/symbols.js';
import { truncate, formatSuccess } from '../output/format.js';
import { nextSteps } from '../output/hints.js';
import { parseHorizon } from '../utils/parse-horizon.js';

interface WizardAssumption {
  id: string;
  statement: string;
  evidenceCount: number;
}

interface WizardResult {
  bet: { id: string; thesis: string } | null;
  assumptions: WizardAssumption[];
}

/**
 * Interactive onboarding wizard that guides new users through creating
 * their first bet, assumptions, and evidence after `tell init`.
 */
export async function runOnboardingWizard(store: FileStore): Promise<void> {
  // Dynamic import to keep CLI startup fast
  const { input, select, confirm } = await import('@inquirer/prompts');

  const result: WizardResult = { bet: null, assumptions: [] };

  try {
    // ── Gate ──────────────────────────────────────────────────────
    console.log();
    console.log(section('Getting Started'));
    console.log();

    const wantsBet = await confirm({
      message: 'Would you like to create your first bet?',
      default: true,
    });

    if (!wantsBet) {
      console.log();
      console.log(pc.dim('  No problem. You can create a bet anytime with:'));
      console.log(nextSteps(['tell bet add "Your thesis here"']));
      console.log();
      return;
    }

    // ── Bet Creation ─────────────────────────────────────────────
    console.log();
    console.log(`  ${pc.bold('A bet is a strategic thesis you want to track.')}`);
    console.log(`  ${pc.dim('It should be falsifiable — something that can be proven right or wrong.')}`);
    console.log();

    const thesis = await input({
      message: 'What is your thesis?',
      validate: (v) => v.trim().length > 0 || 'Thesis is required',
    });

    const stage = await select<InvestmentStage | 'skip'>({
      message: 'Investment stage',
      choices: [
        { name: 'Exploring  — early research, low commitment', value: 'exploring' as const },
        { name: 'Validating — actively testing the thesis', value: 'validating' as const },
        { name: 'Committed  — resources allocated, executing', value: 'committed' as const },
        { name: 'Scaling    — proven, now growing', value: 'scaling' as const },
        { name: 'Skip', value: 'skip' as const },
      ],
    });

    const horizonInput = await input({
      message: 'Time horizon (e.g. 6m, 12m, 2y — or leave empty to skip)',
      default: '',
    });

    const owner = await input({
      message: 'Owner (or leave empty to skip)',
      default: '',
    });

    const time_horizon = parseHorizon(horizonInput || undefined);

    const bet = await store.addBet({
      thesis,
      status: 'active',
      stage: stage === 'skip' ? undefined : stage,
      assumptions: [],
      owner: owner || undefined,
      time_horizon,
    });

    result.bet = { id: bet.id, thesis };

    console.log();
    const betLines = [
      `${pc.green(symbols.success)} ${pc.bold('Bet created')}`,
      '',
      `  ${pc.dim('ID')}     ${pc.bold(bet.id)}`,
      `  ${pc.dim('Thesis')} ${truncate(thesis, 60)}`,
    ];
    if (time_horizon) betLines.push(`  ${pc.dim('Target')} ${new Date(time_horizon.target).toLocaleDateString()}`);
    console.log(box(betLines, { borderColor: pc.green }));

    // ── Assumption Loop ──────────────────────────────────────────
    console.log();
    console.log(`  ${pc.bold('Assumptions are the beliefs that underpin your bet.')}`);
    console.log(`  ${pc.dim('If an assumption fails, the bet is at risk.')}`);
    console.log();

    let addMoreAssumptions = await confirm({
      message: 'Add an assumption to this bet?',
      default: true,
    });

    while (addMoreAssumptions) {
      console.log();

      const statement = await input({
        message: 'What is the assumption?',
        validate: (v) => v.trim().length > 0 || 'Assumption is required',
      });

      const threshold = await input({
        message: 'Evidence threshold — what would change your mind? (or leave empty)',
        default: '',
      });

      const assumption = await store.addAssumption(bet.id, {
        statement,
        status: 'unknown',
        evidence_threshold: threshold || undefined,
      });

      const asmTracker: WizardAssumption = { id: assumption.id, statement, evidenceCount: 0 };

      console.log();
      console.log(box([
        `${pc.green(symbols.success)} ${pc.bold('Assumption added')}`,
        '',
        `  ${pc.dim('ID')}        ${pc.bold(assumption.id)}`,
        `  ${pc.dim('Statement')} ${truncate(statement, 55)}`,
      ], { borderColor: pc.green }));

      // ── Evidence Sub-loop ────────────────────────────────────
      console.log();
      console.log(`  ${pc.dim('Evidence supports or weakens your assumptions over time.')}`);
      console.log();

      let addMoreEvidence = await confirm({
        message: 'Add evidence for this assumption?',
        default: true,
      });

      while (addMoreEvidence) {
        console.log();

        const summary = await input({
          message: 'Evidence summary',
          validate: (v) => v.trim().length > 0 || 'Summary is required',
        });

        const signal = await select<SignalDirection>({
          message: 'Signal direction',
          choices: [
            { name: `${pc.green('Supports')}  — strengthens the assumption`, value: 'supports' as const },
            { name: `${pc.red('Weakens')}   — challenges the assumption`, value: 'weakens' as const },
            { name: `${pc.dim('Neutral')}   — relevant but inconclusive`, value: 'neutral' as const },
          ],
        });

        const confidence = await select<SignalConfidence>({
          message: 'Confidence level',
          choices: [
            { name: 'High   — strong, reliable source', value: 'high' as const },
            { name: 'Medium — reasonable but not definitive', value: 'medium' as const },
            { name: 'Low    — anecdotal or uncertain', value: 'low' as const },
          ],
          default: 'medium',
        });

        const evidence = await store.appendEvidence({
          assumption_ids: [assumption.id],
          source_type: 'human',
          contributor_id: 'cli_user',
          signal,
          confidence,
          summary,
          timestamp: new Date().toISOString(),
        });

        asmTracker.evidenceCount++;

        const signalColor = signal === 'supports' ? pc.green : signal === 'weakens' ? pc.red : pc.dim;

        console.log();
        console.log(box([
          `${pc.green(symbols.success)} ${pc.bold('Evidence recorded')}`,
          '',
          `  ${pc.dim('ID')}     ${pc.bold(evidence.id)}`,
          `  ${pc.dim('Signal')} ${signalSymbol(signal)} ${signalColor(signal)}`,
        ], { borderColor: pc.green }));

        console.log();
        addMoreEvidence = await confirm({
          message: 'Add another piece of evidence?',
          default: false,
        });
      }

      result.assumptions.push(asmTracker);

      console.log();
      addMoreAssumptions = await confirm({
        message: 'Add another assumption?',
        default: false,
      });
    }

    // ── Final Summary ────────────────────────────────────────────
    showWizardSummary(result);

  } catch (err: unknown) {
    // @inquirer/prompts throws ExitPromptError on Ctrl+C
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ExitPromptError') {
      console.log();
      console.log(pc.dim('  Wizard cancelled. Your portfolio is ready — any data created has been saved.'));
      console.log();
      return;
    }
    throw err;
  }
}

function showWizardSummary(result: WizardResult): void {
  if (!result.bet) return;

  const totalEvidence = result.assumptions.reduce((sum, a) => sum + a.evidenceCount, 0);

  const lines = [
    `${pc.green(symbols.success)} ${pc.bold('Onboarding complete')}`,
    '',
    `  ${pc.dim('Bet')}          ${pc.bold(result.bet.id)}`,
    `  ${pc.dim('Thesis')}       ${truncate(result.bet.thesis, 50)}`,
    `  ${pc.dim('Assumptions')}  ${result.assumptions.length}`,
    `  ${pc.dim('Evidence')}     ${totalEvidence}`,
  ];

  if (result.assumptions.length > 0) {
    lines.push('');
    for (const asm of result.assumptions) {
      const evLabel = asm.evidenceCount > 0
        ? pc.dim(` (${asm.evidenceCount} evidence)`)
        : '';
      lines.push(`  ${symbols.bullet} ${asm.id}${evLabel}`);
      lines.push(`    ${pc.dim(truncate(asm.statement, 55))}`);
    }
  }

  console.log();
  console.log(box(lines, { borderColor: pc.cyan }));
  console.log();
  console.log(nextSteps([
    'tell status',
    'tell bet list',
    'tell risk',
  ]));
  console.log();
}
