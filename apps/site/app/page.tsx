import Link from 'next/link'

const tellExample = `{
  "tell_version": "0.3",
  "portfolio": {
    "name": "Chilli Finance — Strategic Portfolio",
    "organisation": "Chilli Finance",
    "version": 4,
    "bets": [
      {
        "id": "bet_lending_platform",
        "title": "Digital Lending Platform",
        "thesis": "A direct-to-SME digital lending platform will
                   capture 3% market share within 18 months",
        "status": "active",
        "stage": "committed",
        "confidence": 72,
        "assumptions": [
          {
            "id": "asm_regulatory",
            "text": "APRA regulatory approval by Q3",
            "status": "holding",
            "evidence": [
              {
                "signal": "supports",
                "content": "Pre-submission meeting positive",
                "confidence": "high",
                "source": "human",
                "timestamp": "2026-02-15T10:30:00Z"
              }
            ]
          }
        ]
      }
    ]
  }
}`

const protocolStack = [
  { name: 'Authentication', protocol: 'OAuth', color: 'bg-navy-200 text-navy-700' },
  { name: 'APIs', protocol: 'OpenAPI', color: 'bg-navy-200 text-navy-700' },
  { name: 'Agent Tools', protocol: 'MCP', color: 'bg-navy-200 text-navy-700' },
  { name: 'Code', protocol: 'Git', color: 'bg-navy-200 text-navy-700' },
  { name: 'Strategy', protocol: 'Tell', color: 'bg-amber-500 text-white' },
]

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy-950">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-navy-300">
                Open Protocol &middot; v0.3
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              The open standard for{' '}
              <span className="text-amber-400">strategic intent</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-300 sm:text-xl">
              Tell is a protocol for encoding strategy as structured, machine-readable
              models. Define bets. Track assumptions. Surface evidence. Give your
              teams and AI agents a shared language for what your organisation is
              betting on.
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-navy-700 bg-navy-900 p-4">
              <code className="text-sm text-navy-300">
                <span className="text-navy-500">$</span>{' '}
                <span className="text-amber-400">npm install -g @tell-protocol/cli</span>
              </code>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/install"
                className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-amber-400"
              >
                Install
              </Link>
              <Link
                href="/spec"
                className="rounded-lg border border-navy-600 bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-800"
              >
                Read the Spec
              </Link>
              <Link
                href="/guide"
                className="rounded-lg border border-navy-600 bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Missing Layer ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Every layer has a protocol.
              <br />
              <span className="text-navy-400">Except the one that matters most.</span>
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              The modern stack is built on open standards. Authentication, APIs, code,
              even agent tooling — all have protocols. Strategy has nothing.
              Tell fills the missing layer.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-md">
            <div className="space-y-3">
              {protocolStack.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-28 text-right text-sm font-medium text-navy-400">
                    {item.name}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${item.color}`}
                    >
                      {item.protocol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Code Example ─── */}
      <section className="border-b border-navy-200 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900">
                Strategy as code.
              </h2>
              <p className="mt-4 text-lg text-navy-500">
                A Tell model encodes your entire strategic portfolio — bets,
                assumptions, evidence, and the connections between them — in a
                single structured format that any system can read.
              </p>

              <dl className="mt-8 space-y-6">
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-navy-950">
                      B
                    </span>
                    Bets
                  </dt>
                  <dd className="mt-1 pl-8 text-sm text-navy-500">
                    Falsifiable hypotheses your organisation is investing resources to test.
                    Not plans — bets. Each carries a thesis, confidence, and lifecycle status.
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-navy-950">
                      A
                    </span>
                    Assumptions
                  </dt>
                  <dd className="mt-1 pl-8 text-sm text-navy-500">
                    The conditions that must be true for a bet to hold. Shared across
                    bets — so when one breaks, you see the cascade.
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-navy-950">
                      E
                    </span>
                    Evidence
                  </dt>
                  <dd className="mt-1 pl-8 text-sm text-navy-500">
                    Discrete signals — from humans or AI agents — that support or
                    weaken assumptions. Append-only and immutable.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-xl border border-navy-200 bg-navy-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="ml-3 text-xs text-navy-500">portfolio.tell.json</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
                <code className="text-navy-300">{tellExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLI Quickstart ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Strategy from your terminal.
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              The <code className="rounded bg-navy-100 px-1.5 py-0.5 text-sm font-medium text-navy-700">tell</code> CLI
              lets you manage your strategic portfolio the way you manage code.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-navy-200 bg-navy-950 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-navy-700" />
              <span className="h-3 w-3 rounded-full bg-navy-700" />
              <span className="h-3 w-3 rounded-full bg-navy-700" />
              <span className="ml-3 text-xs text-navy-500">terminal</span>
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-[1.8]">
              <code className="text-navy-300">
{`$ tell init --name "Acme Corp" --org "Acme"
  Initialized Tell portfolio
  Directory: .tell/

$ tell bet add "AI search replaces 30% of support tickets" --horizon 6m
  Bet created: bet_V1StGXR8_Z5jdHi6B

$ tell assume add bet_V1St... "Users prefer AI answers to waiting"
  Assumption added: asm_mOP2n_P6AZFX

$ tell evidence add asm_mOP2... --signal supports --confidence high \\
    "CSAT scores 4.2/5 for AI responses vs 3.8 for human"
  Evidence recorded: ev_kxUMeNosT9Dx

$ tell status
  Acme Corp — v4
  Bets:  1 active
  Assumptions:  1 unknown
  Evidence:  1 total records`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ─── Three Narratives ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Git for Strategy */}
            <div className="rounded-2xl border border-navy-200 p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <svg className="h-5 w-5 text-navy-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Git for Strategy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Git defined how code changes are tracked. Tell defines how strategic
                intent is structured. GitHub built the platform on Git. Apophenic
                builds the platform on Tell. The protocol is open — anyone can
                implement it.
              </p>
            </div>

            {/* Agents Need Direction */}
            <div className="rounded-2xl border border-navy-200 p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <svg className="h-5 w-5 text-navy-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Agents Need Direction
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                MCP is how agents talk to tools. Tell is how agents talk to strategy.
                An agent with MCP can do things. An agent with both MCP and Tell
                can do the <em>right</em> things.
              </p>
            </div>

            {/* Reading the Tells */}
            <div className="rounded-2xl border border-navy-200 p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <svg className="h-5 w-5 text-navy-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Reading the Tells
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                In poker, a tell reveals the truth behind the bluff. Every
                strategy has tells too — evidence signals that reveal whether
                assumptions are holding or breaking. Tell makes them readable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Conformance Levels ─── */}
      <section className="border-b border-navy-200 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              Three levels. One standard.
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              Implement what you need. From read-only dashboards to full strategic
              intelligence platforms, Tell scales with your ambition.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Reader */}
            <div className="relative rounded-2xl border border-navy-200 bg-white p-8">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy-400">
                Level 1
              </div>
              <h3 className="text-xl font-bold text-navy-900">Reader</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-500">
                Parse and display Tell models. Preserve extensions on round-trip.
                Handle the many-to-many relationship between bets and assumptions.
              </p>
              <p className="mt-4 text-xs font-medium text-navy-400">
                BI tools &middot; Dashboards &middot; Governance
              </p>
            </div>

            {/* Writer */}
            <div className="relative rounded-2xl border-2 border-navy-300 bg-white p-8 shadow-sm">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy-400">
                Level 2
              </div>
              <h3 className="text-xl font-bold text-navy-900">Writer</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-500">
                Everything in Reader, plus: append evidence, increment portfolio
                versions, record audit events. Write-side operations for agents and
                integrations.
              </p>
              <p className="mt-4 text-xs font-medium text-navy-400">
                Agent frameworks &middot; AI curation &middot; Collaboration
              </p>
            </div>

            {/* Platform */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-white p-8 shadow-md">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-100 opacity-50" />
              <div className="relative">
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-600">
                  Level 3
                </div>
                <h3 className="text-xl font-bold text-navy-900">Platform</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  The complete experience. Real-time events, version history, portfolio
                  diffing, scenario modelling, and confidence scoring. The full
                  strategic intelligence stack.
                </p>
                <p className="mt-4 text-xs font-medium text-amber-600">
                  Strategic intelligence platforms
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MCP Integration ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900">
                Works with MCP.
              </h2>
              <p className="mt-4 text-lg text-navy-500">
                Tell operations are exposed as MCP tools. Install the server with{' '}
                <code className="rounded bg-navy-100 px-1.5 py-0.5 text-sm font-medium text-navy-700">
                  npm install -g @tell-protocol/mcp-server
                </code>{' '}
                and any agent framework that supports MCP can read strategic context
                and write evidence.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { tool: 'tell_read_portfolio', desc: 'Read the full strategic model' },
                  { tool: 'tell_read_assumption', desc: 'Check assumption status and evidence' },
                  { tool: 'tell_write_evidence', desc: 'Submit a new evidence signal' },
                  { tool: 'tell_read_stale', desc: 'Find assumptions needing attention' },
                  { tool: 'tell_read_risk', desc: 'Identify cross-bet risk concentrations' },
                ].map((item) => (
                  <div
                    key={item.tool}
                    className="flex items-start gap-3 rounded-lg border border-navy-200 bg-navy-50 px-4 py-3"
                  >
                    <code className="mt-0.5 whitespace-nowrap text-xs font-medium text-amber-600">
                      {item.tool}
                    </code>
                    <span className="text-sm text-navy-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-navy-200 bg-navy-950 p-6">
              <p className="mb-4 text-xs font-medium tracking-widest text-navy-500">
                AGENT &rarr; MCP &rarr; Tell
              </p>
              <div className="space-y-3 font-mono text-sm">
                <div className="rounded-lg bg-navy-900 px-4 py-3 text-navy-400">
                  <span className="text-navy-500">// Agent reads strategic context</span>
                  <br />
                  <span className="text-amber-400">tell_read_portfolio</span>
                  <span className="text-navy-500">()</span>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="h-4 w-4 text-navy-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="rounded-lg bg-navy-900 px-4 py-3 text-navy-400">
                  <span className="text-navy-500">// Agent discovers relevant signal</span>
                  <br />
                  <span className="text-navy-500">// and writes evidence back</span>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="h-4 w-4 text-navy-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="rounded-lg bg-navy-900 px-4 py-3 text-navy-400">
                  <span className="text-amber-400">tell_write_evidence</span>
                  <span className="text-navy-500">{'({'}</span>
                  <br />
                  {'  '}<span className="text-navy-300">assumption_id</span>
                  <span className="text-navy-500">:</span>{' '}
                  <span className="text-green-400">&quot;asm_regulatory&quot;</span>
                  <span className="text-navy-500">,</span>
                  <br />
                  {'  '}<span className="text-navy-300">signal</span>
                  <span className="text-navy-500">:</span>{' '}
                  <span className="text-green-400">&quot;supports&quot;</span>
                  <span className="text-navy-500">,</span>
                  <br />
                  {'  '}<span className="text-navy-300">content</span>
                  <span className="text-navy-500">:</span>{' '}
                  <span className="text-green-400">&quot;APRA pre-review passed&quot;</span>
                  <br />
                  <span className="text-navy-500">{'})'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start building with Tell.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-navy-400">
            Read the specification. Build a Tell-compatible integration.
            Or explore Apophenic — the canonical platform implementation.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/install"
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-amber-400"
            >
              Install the CLI
            </Link>
            <Link
              href="/spec"
              className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-900"
            >
              Read the Spec
            </Link>
            <Link
              href="/guide"
              className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-900"
            >
              Getting Started Guide
            </Link>
            <a
              href="https://apophenic.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-navy-700 px-6 py-3 text-sm font-semibold text-navy-400 transition-colors hover:border-navy-600 hover:text-white"
            >
              Explore Apophenic &rarr;
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
