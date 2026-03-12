import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Getting Started',
  description:
    'A practical guide to understanding and implementing the Tell Protocol for strategic intent.',
}

export default function GuidePage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-navy-200 bg-navy-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Getting Started
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-400">
            Everything you need to understand Tell and start building with it.
            From core concepts to your first model.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Step 1: The Core Idea */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              1
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Understand the Core Idea
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              Most organisations encode their strategy in slide decks —
              unstructured documents that can&apos;t be queried, versioned, or read
              by machines. When an AI agent processes thousands of transactions,
              it has no way to know which ones matter to the strategic bets the
              company is making.
            </p>
            <p>
              Tell solves this by giving strategy a format. A Tell model encodes
              what an organisation is betting on, what assumptions underpin those
              bets, and what evidence says about whether those assumptions are
              holding.
            </p>
            <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
              <p className="text-sm font-medium text-navy-700">
                GAAP standardised how companies report finances. OpenAPI
                standardised how services describe their interfaces. Tell
                standardises how organisations encode strategic intent.
              </p>
            </div>
          </div>
        </section>

        {/* Step 2: The Key Entities */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              2
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Learn the Key Entities
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11">
            <p className="text-navy-600">
              Tell has seven core entities. The three most important ones to
              understand first:
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-amber-500 bg-navy-50 p-4">
                <h3 className="font-semibold text-navy-900">
                  Bets — What you&apos;re investing in
                </h3>
                <p className="mt-1 text-sm text-navy-500">
                  A bet is a falsifiable hypothesis your organisation is testing
                  with real resources. Not a plan, not a goal — a bet. It has a
                  thesis (&quot;if we do X, then Y will happen&quot;), a confidence
                  level, and a lifecycle status.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-amber-500 bg-navy-50 p-4">
                <h3 className="font-semibold text-navy-900">
                  Assumptions — What must be true
                </h3>
                <p className="mt-1 text-sm text-navy-500">
                  Every bet rests on assumptions — conditions that must hold for
                  the thesis to work. The critical insight: assumptions can be
                  shared across bets. When a shared assumption breaks, multiple
                  bets are affected simultaneously.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-amber-500 bg-navy-50 p-4">
                <h3 className="font-semibold text-navy-900">
                  Evidence — What the data says
                </h3>
                <p className="mt-1 text-sm text-navy-500">
                  Evidence is a discrete signal — from a human, an AI agent, or
                  an integration — that supports, weakens, or has neutral bearing
                  on an assumption. Evidence is append-only and immutable.
                </p>
              </div>
            </div>

            <p className="text-sm text-navy-500">
              The remaining entities — Connections, Scenarios, Contributors, and
              Portfolio — are covered in the{' '}
              <Link
                href="/spec#entities"
                className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
              >
                full specification
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Step 3: Your First Tell Model */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              3
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Write Your First Tell Model
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              A Tell model is a JSON file with the{' '}
              <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                .tell.json
              </code>{' '}
              extension. Here&apos;s the simplest valid model — a portfolio with
              one bet and one assumption:
            </p>

            <div className="overflow-hidden rounded-xl border border-navy-200 bg-navy-950">
              <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="ml-3 text-xs text-navy-500">my-strategy.tell.json</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-navy-300">
{`{
  "tell_version": "0.2",
  "portfolio": {
    "id": "portfolio_acme",
    "name": "Acme Corp — Strategic Portfolio",
    "organisation": "Acme Corp",
    "version": 1,
    "bets": [
      {
        "id": "bet_expansion",
        "title": "European Market Expansion",
        "thesis": "Entering the EU market via Germany
                   will generate €2M ARR within 12 months",
        "status": "active",
        "confidence": 65,
        "time_horizon": "12 months",
        "owner": "ceo",
        "assumptions": [
          {
            "id": "asm_regulatory",
            "text": "EU regulatory approval for our
                     product category by Q2",
            "status": "unknown",
            "bet_ids": ["bet_expansion"],
            "evidence": []
          },
          {
            "id": "asm_demand",
            "text": "Sufficient demand in the DACH
                     region for our pricing tier",
            "status": "holding",
            "bet_ids": ["bet_expansion"],
            "evidence": [
              {
                "id": "ev_001",
                "assumption_id": "asm_demand",
                "signal": "supports",
                "content": "Market research shows 340
                            qualified prospects in DACH",
                "confidence": "medium",
                "source": "human",
                "timestamp": "2026-03-01T09:00:00Z"
              }
            ]
          }
        ]
      }
    ],
    "connections": [],
    "scenarios": [],
    "contributors": [
      {
        "id": "ceo",
        "name": "Jane Smith",
        "type": "human",
        "role": "owner"
      }
    ]
  }
}`}
              </pre>
            </div>

            <p>
              That&apos;s it. This model is a valid Tell document that any
              Tell-compatible system can parse, display, and reason about.
            </p>
          </div>
        </section>

        {/* Step 4: Add Evidence */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              4
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Add Evidence Over Time
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              The power of Tell becomes clear over time. As evidence accumulates,
              the model becomes a living record of what your organisation is
              learning about its bets.
            </p>

            <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
              <h4 className="text-sm font-semibold text-navy-900">
                How evidence flows:
              </h4>
              <ol className="mt-3 space-y-2 text-sm text-navy-500">
                <li className="flex gap-2">
                  <span className="font-semibold text-amber-600">1.</span>
                  A human contributor or AI agent observes something relevant.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-amber-600">2.</span>
                  They append an evidence record with a signal (supports/weakens/neutral),
                  confidence level, and description.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-amber-600">3.</span>
                  The assumption&apos;s status may change based on accumulated evidence.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-amber-600">4.</span>
                  The bet&apos;s confidence updates automatically based on its
                  assumptions&apos; evidence.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-amber-600">5.</span>
                  If the assumption is shared across bets, all linked bets are
                  affected.
                </li>
              </ol>
            </div>

            <p>
              This is what makes Tell different from a spreadsheet or a slide
              deck. The model is alive — it changes as evidence arrives, and it
              propagates those changes across the portfolio graph.
            </p>
          </div>
        </section>

        {/* Step 5: Connect to Agents */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              5
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Connect AI Agents via MCP
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              Tell operations can be exposed as MCP tools, giving AI agents the
              ability to read strategic context and write evidence. A
              Tell-compatible agent doesn&apos;t just do things — it does the{' '}
              <em>right</em> things.
            </p>

            <div className="overflow-hidden rounded-xl border border-navy-200 bg-navy-950 p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-navy-500">
                Example: Agent discovers relevant market signal
              </p>
              <pre className="text-[13px] leading-relaxed text-navy-300">
{`// Agent reads the strategic model
const portfolio = await tell_read_portfolio({
  portfolio_id: "portfolio_acme"
});

// Agent finds a relevant assumption
const assumption = portfolio.bets[0].assumptions
  .find(a => a.id === "asm_demand");

// Agent submits evidence
await tell_write_evidence({
  assumption_id: "asm_demand",
  signal: "supports",
  content: "LinkedIn campaign generated 47 demo
            requests from DACH region in 2 weeks",
  confidence: "high",
  source: "agent"
});`}
              </pre>
            </div>

            <p>
              The agent doesn&apos;t need to understand the full strategic
              context. It just needs to know which assumptions to monitor and how
              to submit evidence when it finds something relevant.
            </p>
          </div>
        </section>

        {/* Step 6: Sync to the Cloud */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              6
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Sync to the Cloud
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              Your portfolio lives locally in{' '}
              <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                .tell/
              </code>{' '}
              — but you can push it to an Apophenic platform instance to share
              it with your team, view it on a visual canvas, and keep it synced
              across devices.
            </p>

            <div className="overflow-hidden rounded-xl border border-navy-200 bg-navy-950 p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-navy-500">
                Push your portfolio to the cloud
              </p>
              <pre className="text-[13px] leading-relaxed text-navy-300">
{`# Authenticate with the platform
$ tell auth login

# Add a remote
$ tell remote add origin https://app.apophenic.com

# Push your portfolio
$ tell push

# Later, pull updates from the platform
$ tell pull`}
              </pre>
            </div>

            <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
              <p className="text-sm font-medium text-navy-700">
                Your portfolio lives locally, the platform is your remote.
                Push and pull keeps them in sync — so your team always has
                the latest strategic state.
              </p>
            </div>
          </div>
        </section>

        {/* Step 7: Choose Your Level */}
        <section className="mb-16">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-navy-950">
              7
            </span>
            <h2 className="text-2xl font-bold text-navy-900">
              Choose Your Conformance Level
            </h2>
          </div>
          <div className="mt-6 space-y-4 pl-11 text-navy-600">
            <p>
              Tell scales with your needs. Start with what you need today and
              grow into more capability over time.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-navy-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-600">
                    Level 1
                  </span>
                  <h4 className="font-semibold text-navy-900">Reader</h4>
                </div>
                <p className="mt-2 text-sm text-navy-500">
                  You can parse and display Tell models. Good for dashboards,
                  governance views, and reporting tools that consume strategic
                  data without modifying it.
                </p>
              </div>

              <div className="rounded-lg border-2 border-navy-300 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-navy-200 px-2 py-0.5 text-xs font-semibold text-navy-700">
                    Level 2
                  </span>
                  <h4 className="font-semibold text-navy-900">Writer</h4>
                </div>
                <p className="mt-2 text-sm text-navy-500">
                  You can read and write. Append evidence, update statuses,
                  increment versions. This is the level most agent integrations
                  and collaboration tools should target.
                </p>
              </div>

              <div className="rounded-lg border-2 border-amber-500 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Level 3
                  </span>
                  <h4 className="font-semibold text-navy-900">Platform</h4>
                </div>
                <p className="mt-2 text-sm text-navy-500">
                  The full experience — real-time events, version history,
                  scenario modelling, and confidence scoring.{' '}
                  <a
                    href="https://apophenic.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
                  >
                    Apophenic
                  </a>{' '}
                  is the canonical Level 3 implementation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="rounded-xl border border-navy-200 bg-navy-50 p-6">
          <h3 className="text-lg font-semibold text-navy-900">Next steps</h3>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/spec"
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Read the full specification
              </Link>
            </li>
            <li>
              <Link
                href="/install"
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Install the CLI and start building
              </Link>
            </li>
            <li>
              <a
                href="https://apophenic.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Try Apophenic — the canonical Tell Platform
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  )
}
