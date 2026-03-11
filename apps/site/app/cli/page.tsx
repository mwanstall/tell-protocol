import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CLI Reference',
  description: 'Complete command reference for the Tell Protocol CLI.',
}

const commands = [
  {
    name: 'tell init',
    usage: 'tell init [--name <name>] [--org <org>]',
    description: 'Initialise a new Tell portfolio in the current directory. Creates a .tell/ directory with the portfolio file, evidence store, and version history.',
  },
  {
    name: 'tell bet add',
    usage: 'tell bet add "<thesis>" [--horizon <horizon>] [--stage <stage>]',
    description: 'Add a new bet to the portfolio. The thesis should be a falsifiable hypothesis. Horizon accepts values like 6m, 12m, 2y. Stage can be exploring, validating, committed, or scaling.',
  },
  {
    name: 'tell bet list',
    usage: 'tell bet list',
    description: 'List all bets with their status, confidence, and assumption count.',
  },
  {
    name: 'tell bet kill',
    usage: 'tell bet kill <bet-id>',
    description: 'Kill a bet, setting its status to killed. This is irreversible — the bet remains in the portfolio for audit purposes.',
  },
  {
    name: 'tell bet succeed',
    usage: 'tell bet succeed <bet-id>',
    description: 'Mark a bet as succeeded.',
  },
  {
    name: 'tell bet stage',
    usage: 'tell bet stage <bet-id> <stage>',
    description: 'Set the investment stage of a bet. Stage must be exploring, validating, committed, or scaling. Stage is orthogonal to status — it tracks where a bet is in its investment lifecycle.',
  },
  {
    name: 'tell assume add',
    usage: 'tell assume add <bet-id> "<statement>"',
    description: 'Add an assumption to a bet. The statement should describe a condition that must be true for the bet to hold.',
  },
  {
    name: 'tell assume list',
    usage: 'tell assume list <bet-id>',
    description: 'List all assumptions for a given bet.',
  },
  {
    name: 'tell assume link',
    usage: 'tell assume link <assumption-id> <bet-id>',
    description: 'Link an existing assumption to another bet, creating a many-to-many relationship for shared assumptions across bets.',
  },
  {
    name: 'tell evidence add',
    usage: 'tell evidence add <assumption-id> "<summary>" --signal <signal> [--confidence <level>] [--source <type>]',
    description: 'Append evidence to an assumption. Signal must be supports, weakens, or neutral. Confidence is high, medium, or low. Evidence is immutable once recorded.',
  },
  {
    name: 'tell evidence list',
    usage: 'tell evidence list <assumption-id>',
    description: 'List all evidence for a given assumption.',
  },
  {
    name: 'tell status',
    usage: 'tell status',
    description: 'Show a portfolio health overview including bet counts by status, assumption counts by status, evidence totals, and connection counts.',
  },
  {
    name: 'tell stale',
    usage: 'tell stale [--days <threshold>]',
    description: 'Find assumptions that lack recent evidence. Default threshold is 14 days. Stale assumptions indicate potential blind spots in your strategic model.',
  },
  {
    name: 'tell risk',
    usage: 'tell risk',
    description: 'Portfolio risk assessment. Shows shared assumptions (single points of failure), failing assumptions, resource conflicts, and escalated connections.',
  },
  {
    name: 'tell export',
    usage: 'tell export [-o <file>]',
    description: 'Export the complete portfolio as a .tell.json file. Defaults to portfolio.tell.json. The exported file conforms to the Tell v0.2 specification.',
  },
  {
    name: 'tell validate',
    usage: 'tell validate <file>',
    description: 'Validate a .tell.json file against the Tell Protocol schema. Reports any validation errors with paths to the invalid fields.',
  },
  {
    name: 'tell connect add',
    usage: 'tell connect add <bet-a> <bet-b> --type <type> "<description>"',
    description: 'Add a connection between two bets. Type must be tension, synergy, dependency, or resource_conflict.',
  },
  {
    name: 'tell connect list',
    usage: 'tell connect list',
    description: 'List all connections between bets.',
  },
  {
    name: 'tell experiment add',
    usage: 'tell experiment add <bet-id> "<hypothesis>" --method "<method>" --success "<criteria>" [--cost <ceiling>] [--timebox <duration>]',
    description: 'Add a new experiment to validate a bet. Requires a hypothesis, method, and success criteria. Optionally set a cost ceiling and time box.',
  },
  {
    name: 'tell experiment list',
    usage: 'tell experiment list [--bet <bet-id>]',
    description: 'List all experiments, optionally filtered by bet ID.',
  },
  {
    name: 'tell experiment start',
    usage: 'tell experiment start <experiment-id>',
    description: 'Start a planned experiment, setting its status to running.',
  },
  {
    name: 'tell experiment conclude',
    usage: 'tell experiment conclude <experiment-id> --signal <signal> --summary "<summary>"',
    description: 'Conclude an experiment with an outcome. Signal must be supports, weakens, or neutral.',
  },
  {
    name: 'tell experiment abandon',
    usage: 'tell experiment abandon <experiment-id>',
    description: 'Abandon an experiment without an outcome.',
  },
]

export default function CLIPage() {
  return (
    <>
      <section className="border-b border-navy-200 bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            CLI Reference
          </h1>
          <p className="mt-4 text-lg text-navy-300">
            Complete command reference for the{' '}
            <code className="rounded bg-navy-800 px-1.5 py-0.5 text-amber-400">tell</code>{' '}
            command-line tool.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-navy-700 bg-navy-900 px-4 py-3">
            <code className="text-sm text-navy-300">
              <span className="text-navy-500">$</span>{' '}
              npm install -g @tell-protocol/cli
            </code>
          </div>
        </div>
      </section>

      {/* Directory Structure */}
      <section className="border-b border-navy-200 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-navy-900">
            Portfolio Directory
          </h2>
          <p className="mt-2 text-navy-500">
            Running <code className="rounded bg-navy-100 px-1 py-0.5 text-sm text-navy-700">tell init</code> creates
            a <code className="rounded bg-navy-100 px-1 py-0.5 text-sm text-navy-700">.tell/</code> directory
            designed for git-friendly version control.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-navy-200 bg-navy-950 p-5">
            <pre className="text-sm leading-relaxed text-navy-300">
{`.tell/
  portfolio.tell.json        # Portfolio state
  evidence/
    asm_xxx.jsonl             # Append-only evidence (one file per assumption)
  history/
    v001.tell.json            # Portfolio snapshots per version
  audit.jsonl                 # Append-only audit log`}
            </pre>
          </div>
          <p className="mt-4 text-sm text-navy-400">
            Evidence uses JSONL format (one JSON object per line) so that appends produce
            clean single-line git diffs.
          </p>
        </div>
      </section>

      {/* Commands */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-navy-900">Commands</h2>

          <div className="mt-8 space-y-8">
            {commands.map((cmd) => (
              <div
                key={cmd.name}
                id={cmd.name.replace(/\s+/g, '-')}
                className="rounded-xl border border-navy-200 p-6"
              >
                <h3 className="text-lg font-semibold text-navy-900">
                  {cmd.name}
                </h3>
                <div className="mt-3 overflow-x-auto rounded-lg bg-navy-950 px-4 py-3">
                  <code className="text-sm text-amber-400">{cmd.usage}</code>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  {cmd.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
