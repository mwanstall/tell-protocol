import Link from 'next/link'

const tellExample = `{
  "tell_version": "0.2",
  "portfolio": {
    "name": "Acme Corp — Strategic Portfolio",
    "organisation": "Acme Corp",
    "version": 7,
    "bets": [
      {
        "id": "bet_ai_support",
        "thesis": "AI-powered support replaces 30%
                   of tier-1 tickets within 6 months",
        "status": "active",
        "stage": "validating",
        "confidence": 68,
        "assumptions": [
          {
            "id": "asm_csat_parity",
            "text": "AI responses match human CSAT",
            "status": "holding"
          }
        ]
      }
    ]
  }
}`

const cliExample = `$ tell
  The Tell Protocol CLI — encode strategic intent

tell (acme-corp) > bet add "AI replaces 30% of tickets"
  ✓ Bet created
    ID     bet_ai_support
    Thesis AI replaces 30% of tickets

tell (acme-corp) > assume add bet_ai_support \\
    "AI responses match human CSAT"
  ✓ Assumption added: asm_csat_parity

tell (acme-corp) > evidence add asm_csat_parity \\
    --signal supports --confidence high \\
    "CSAT 4.2/5 for AI vs 3.8 for human"
  ✓ Evidence recorded: ev_kxUMeNosT9Dx

tell (acme-corp) > status
  Acme Corp — v7
  Bets:        1 active
  Assumptions: 1 holding
  Evidence:    1 total records`

const protocolStack = [
  { name: 'Authentication', protocol: 'OAuth', highlight: false },
  { name: 'APIs', protocol: 'OpenAPI', highlight: false },
  { name: 'Agent Tools', protocol: 'MCP', highlight: false },
  { name: 'Version Control', protocol: 'Git', highlight: false },
  { name: 'Strategy', protocol: 'Tell', highlight: true },
]

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy-950">
        {/* Radial amber glow */}
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '800px',
            height: '600px',
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 sm:pb-32 sm:pt-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900/80 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
              <span className="text-xs font-medium text-navy-300">
                Open Protocol &middot; v0.2
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white lg:text-4xl xl:text-5xl 2xl:text-6xl">
              Strategy breaks in the gap between{' '}
              <span className="text-amber-400">the deck</span> and{' '}
              <span className="text-amber-400">the data.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-300 sm:text-xl">
              Tell is an open protocol that turns strategic intent into structured,
              evidence-driven models that your teams and AI agents can actually read.
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-navy-700 bg-navy-900/80 p-4">
              <code className="text-sm text-navy-300">
                <span className="text-navy-500">$</span>{' '}
                <span className="text-amber-400">npm install -g @tell-protocol/cli</span>
              </code>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/install"
                className="glow-amber-sm rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-amber-400"
              >
                Install the CLI
              </Link>
              <Link
                href="/spec"
                className="rounded-lg border border-navy-600 bg-navy-900/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-800"
              >
                Read the Spec
              </Link>
              <Link
                href="/guide"
                className="rounded-lg border border-navy-600 bg-navy-900/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-navy-500 hover:bg-navy-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Problem ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Strategy deserves better than a slide deck.
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              Every layer of the modern stack has an open standard. Strategy has nothing.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="card-hover rounded-2xl border border-navy-200 bg-white p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Strategy lives in slide decks
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Strategic intent is trapped in presentations, board packs, and the
                heads of senior leaders. It can&apos;t be queried, versioned, or read
                by any system.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-navy-200 bg-white p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Assumptions go unchecked
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Every bet rests on assumptions that nobody tracks. Teams discover
                they were wrong after the money is spent and the opportunity has
                passed.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-navy-200 bg-white p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                AI agents have no strategic context
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Your AI agents can execute at machine speed, but they have no way
                of knowing whether what they&apos;re doing aligns with what the
                organisation actually cares about.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-b border-navy-200 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              How Tell works
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              Three concepts. One living model.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-xl font-bold text-navy-950 glow-amber-sm">
                B
              </div>
              <h3 className="text-lg font-semibold text-navy-900">Define Bets</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Encode what your organisation is investing in as falsifiable
                hypotheses — not plans, but bets. Each carries a thesis, confidence
                score, and lifecycle status.
              </p>
              <div className="absolute right-0 top-7 hidden translate-x-1/2 md:block">
                <svg className="h-5 w-5 text-navy-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-xl font-bold text-navy-950 glow-amber-sm">
                A
              </div>
              <h3 className="text-lg font-semibold text-navy-900">Track Assumptions</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Map the conditions that must hold for each bet to work. Assumptions
                are shared across bets — so when one breaks, you see the cascade
                instantly.
              </p>
              <div className="absolute right-0 top-7 hidden translate-x-1/2 md:block">
                <svg className="h-5 w-5 text-navy-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-xl font-bold text-navy-950 glow-amber-sm">
                E
              </div>
              <h3 className="text-lg font-semibold text-navy-900">Surface Evidence</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Humans and AI agents contribute evidence signals that support or
                weaken assumptions. Append-only and immutable — a living record of
                what the data says.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Strategy as Code ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Strategy as code.
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              A Tell model encodes your strategic portfolio in a single structured
              format. Manage it from the terminal or build integrations on top.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
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

            <div className="overflow-hidden rounded-xl border border-navy-200 bg-navy-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="ml-3 text-xs text-navy-500">terminal — tell REPL</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-[1.8]">
                <code className="text-navy-300">{cliExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Who It's For ─── */}
      <section className="border-b border-navy-200 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Built for the people who shape strategy.
            </h2>
            <p className="mt-4 text-lg text-navy-500">
              Whether you set the direction, build the systems, or deploy the agents —
              Tell gives you a shared language for strategic intent.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'CEOs & CxOs',
                desc: 'See your entire strategic portfolio in one living model — not scattered decks. Track confidence and evidence across every bet.',
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                ),
              },
              {
                title: 'Heads of Strategy',
                desc: 'Replace the board pack with evidence-driven, versionable strategy. Know which assumptions are holding and which are breaking.',
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                ),
              },
              {
                title: 'CTOs & Engineering',
                desc: 'Give your teams strategic context, not just tickets. Connect technical decisions back to the bets they serve.',
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
              },
              {
                title: 'AI Leaders',
                desc: 'Ground your agents in what the organisation is actually betting on. An agent with Tell can do the right things, not just things.',
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                title: 'Product Leaders',
                desc: 'Connect product bets to evidence, not just intuition. Track whether the assumptions behind your roadmap are holding.',
                icon: (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                ),
              },
            ].map((persona) => (
              <div key={persona.title} className="card-hover rounded-2xl border border-navy-200 bg-white p-7">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  {persona.icon}
                </div>
                <h3 className="text-base font-semibold text-navy-900">{persona.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI-Native (MCP) ─── */}
      <section className="border-b border-navy-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                AI-native by design.
              </h2>
              <p className="mt-4 text-lg text-navy-500">
                Tell operations are exposed as MCP tools. Any agent framework that
                supports MCP can read strategic context and write evidence — no
                custom integration required.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { tool: 'tell_read_portfolio', desc: 'Read the full strategic model' },
                  { tool: 'tell_write_evidence', desc: 'Submit a new evidence signal' },
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

              <p className="mt-6 text-sm text-navy-400">
                Install the MCP server:{' '}
                <code className="rounded bg-navy-100 px-1.5 py-0.5 text-xs font-medium text-navy-700">
                  npm install -g @tell-protocol/mcp-server
                </code>
              </p>
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
                  <span className="text-navy-500">// Agent discovers a relevant signal</span>
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
                  <span className="text-green-400">&quot;asm_csat_parity&quot;</span>
                  <span className="text-navy-500">,</span>
                  <br />
                  {'  '}<span className="text-navy-300">signal</span>
                  <span className="text-navy-500">:</span>{' '}
                  <span className="text-green-400">&quot;supports&quot;</span>
                  <span className="text-navy-500">,</span>
                  <br />
                  {'  '}<span className="text-navy-300">content</span>
                  <span className="text-navy-500">:</span>{' '}
                  <span className="text-green-400">&quot;CSAT 4.2/5 for AI responses&quot;</span>
                  <br />
                  <span className="text-navy-500">{'})'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Open Standard ─── */}
      <section className="border-b border-navy-200 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Every layer has a protocol.
                <br />
                <span className="text-navy-400">Now strategy does too.</span>
              </h2>
              <p className="mt-4 text-lg text-navy-500">
                Tell is an open standard — Apache-2.0 licensed, community-governed,
                free to implement. Build Tell-compatible tools, dashboards, and integrations.
              </p>
              <p className="mt-4 text-sm text-navy-400">
                The canonical Level 3 platform implementation is{' '}
                <a
                  href="https://apophenic.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
                >
                  Apophenic
                </a>
                .
              </p>
            </div>

            <div>
              <div className="space-y-3">
                {protocolStack.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <span className="w-28 text-right text-sm font-medium text-navy-400">
                      {item.name}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                          item.highlight
                            ? 'bg-amber-500 text-white glow-amber-sm'
                            : 'bg-navy-200 text-navy-700'
                        }`}
                      >
                        {item.protocol}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { level: '1', name: 'Reader', desc: 'Parse & display' },
                  { level: '2', name: 'Writer', desc: 'Append evidence' },
                  { level: '3', name: 'Platform', desc: 'Full intelligence' },
                ].map((conf) => (
                  <div
                    key={conf.level}
                    className={`rounded-lg border p-3 text-center ${
                      conf.level === '3'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-navy-200 bg-white'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-navy-400">
                      Level {conf.level}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-navy-900">{conf.name}</div>
                    <div className="mt-0.5 text-xs text-navy-500">{conf.desc}</div>
                  </div>
                ))}
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
            Read the specification. Install the CLI.
            Or explore the getting started guide.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/install"
              className="glow-amber-sm rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-amber-400"
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
          </div>
        </div>
      </section>
    </>
  )
}
