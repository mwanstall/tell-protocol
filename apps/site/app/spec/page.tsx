import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Specification',
  description:
    'The Tell Protocol specification v0.2 — entities, schemas, conformance levels, and MCP integration for encoding strategic intent.',
}

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-20" />
}

function EntityCard({
  name,
  letter,
  description,
  fields,
}: {
  name: string
  letter: string
  description: string
  fields: { name: string; type: string; note?: string }[]
}) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-navy-950">
          {letter}
        </span>
        <h3 className="text-lg font-bold text-navy-900">{name}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy-500">{description}</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-navy-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-200 bg-navy-50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-navy-500">
                Field
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-navy-500">
                Type
              </th>
              <th className="hidden px-3 py-2 text-left text-xs font-semibold text-navy-500 sm:table-cell">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name} className="border-b border-navy-100 last:border-0">
                <td className="px-3 py-2 font-mono text-xs text-amber-600">
                  {field.name}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-navy-400">
                  {field.type}
                </td>
                <td className="hidden px-3 py-2 text-xs text-navy-400 sm:table-cell">
                  {field.note || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tocItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'principles', label: 'Design Principles' },
  { id: 'entities', label: 'Core Entities' },
  { id: 'evidence-model', label: 'Evidence Model' },
  { id: 'confidence', label: 'Confidence Algorithm' },
  { id: 'conformance', label: 'Conformance Levels' },
  { id: 'mcp', label: 'MCP Integration' },
  { id: 'versioning', label: 'Versioning' },
  { id: 'serialisation', label: 'Serialisation' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'security', label: 'Security' },
]

export default function SpecPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-navy-200 bg-navy-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              v0.2 Draft
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Tell Protocol Specification
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-400">
            A complete reference for the Tell data model, entities, conformance
            levels, and integration patterns.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          {/* Table of Contents sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy-400">
                On this page
              </h4>
              <ul className="space-y-1.5">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-navy-500 transition-colors hover:text-navy-900"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {/* Overview */}
            <SectionAnchor id="overview" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Overview</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Tell is an open protocol for encoding strategic intent in a
                  machine-readable format. It defines a standard data model for
                  representing an organisation&apos;s strategic portfolio — its bets,
                  assumptions, evidence, connections, scenarios, and contributors —
                  in a way that any system can read from and write to.
                </p>
                <p>
                  The protocol serves a single purpose: to give strategy a format.
                  Just as Git gave code a standard for tracking changes and OpenAPI
                  gave APIs a standard for describing interfaces, Tell gives
                  strategic intent a standard for encoding what an organisation is
                  betting on and what evidence says about whether those bets are
                  working.
                </p>
                <p>
                  Tell is designed to be useful across a range of implementations —
                  from a simple JSON file on disk to a full real-time strategic
                  intelligence platform. The protocol scales through three conformance
                  levels, each adding capability without breaking compatibility with
                  the level below.
                </p>
              </div>
            </section>

            {/* Design Principles */}
            <SectionAnchor id="principles" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Design Principles</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: 'Strategy as Bets Under Uncertainty',
                    desc: 'Every strategic commitment is modelled as a falsifiable hypothesis, not a plan to execute. Bets carry confidence, lifecycle status, and evidence.',
                  },
                  {
                    title: 'Minimal Core, Extensible Surface',
                    desc: 'Seven core entities plus a typed extension mechanism. The core is stable; extensions allow domain-specific adaptation.',
                  },
                  {
                    title: 'Evidence is Append-Only',
                    desc: 'Evidence records are never modified or deleted. Retractions are new records pointing to originals. This preserves the complete evidential history.',
                  },
                  {
                    title: 'Read-Optimised, Write-Append',
                    desc: 'Agents and dashboards read frequently. Evidence writes are appends. Structural changes (new bets, status changes) are infrequent and version-bumped.',
                  },
                  {
                    title: 'Source-Agnostic Evidence',
                    desc: 'Human and AI-curated evidence are treated identically at the structural level. Source is recorded for provenance, not for privilege.',
                  },
                  {
                    title: 'Graph Structure',
                    desc: 'Connections between bets and shared assumptions create a directed graph, not a hierarchy. This enables systemic portfolio reasoning.',
                  },
                ].map((principle) => (
                  <div
                    key={principle.title}
                    className="rounded-lg border border-navy-200 bg-navy-50 p-5"
                  >
                    <h3 className="text-sm font-semibold text-navy-900">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm text-navy-500">{principle.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Core Entities */}
            <SectionAnchor id="entities" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Core Entities</h2>
              <p className="mt-4 text-navy-600">
                Tell defines eight core entities. Together they form a directed graph
                representing the complete strategic state of an organisation.
              </p>

              <div className="mt-8 space-y-6">
                <EntityCard
                  name="Portfolio"
                  letter="P"
                  description="The top-level container. A portfolio represents the complete strategic model for an organisation, division, or team."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'name', type: 'string', note: 'Human-readable name' },
                    { name: 'organisation', type: 'string', note: 'Owning organisation' },
                    { name: 'version', type: 'integer', note: 'Incremented on structural changes' },
                    { name: 'tell_version', type: 'string', note: 'Protocol version (e.g. "0.2")' },
                    { name: 'bets', type: 'Bet[]', note: 'Strategic bets in the portfolio' },
                    { name: 'connections', type: 'Connection[]', note: 'Cross-bet relationships' },
                    { name: 'scenarios', type: 'Scenario[]', note: 'What-if portfolio branches' },
                    { name: 'contributors', type: 'Contributor[]', note: 'People and agents' },
                  ]}
                />

                <EntityCard
                  name="Bet"
                  letter="B"
                  description="A falsifiable hypothesis that the organisation is investing resources to test. Every bet carries a thesis, assumptions, and a lifecycle status."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'title', type: 'string', note: 'Short descriptive title' },
                    { name: 'thesis', type: 'string', note: 'The falsifiable hypothesis' },
                    { name: 'status', type: 'enum', note: 'active | paused | killed | succeeded' },
                    { name: 'stage', type: 'enum', note: 'exploring | validating | committed | scaling' },
                    { name: 'confidence', type: 'integer', note: '0-100, derived or overridden' },
                    { name: 'time_horizon', type: 'string', note: 'Expected resolution timeframe' },
                    { name: 'owner', type: 'string', note: 'Accountable contributor' },
                    { name: 'assumptions', type: 'Assumption[]', note: 'Must have at least 1' },
                    { name: 'created_at', type: 'datetime' },
                    { name: 'updated_at', type: 'datetime' },
                  ]}
                />

                <EntityCard
                  name="Assumption"
                  letter="A"
                  description="A condition that must be true for a bet's thesis to hold. The many-to-many relationship between assumptions and bets is structurally critical — shared assumptions create cross-bet risk visibility."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'text', type: 'string', note: 'The assumption statement' },
                    { name: 'status', type: 'enum', note: 'holding | pressure | failing | unknown' },
                    { name: 'bet_ids', type: 'string[]', note: 'Bets this assumption supports' },
                    { name: 'evidence', type: 'Evidence[]', note: 'Signals for/against' },
                    { name: 'created_at', type: 'datetime' },
                  ]}
                />

                <EntityCard
                  name="Evidence"
                  letter="E"
                  description="A discrete signal that informs whether an assumption is holding or breaking. Evidence is immutable once written — retractions are new evidence records pointing to the original."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'assumption_id', type: 'string', note: 'The assumption this informs' },
                    { name: 'signal', type: 'enum', note: 'supports | weakens | neutral' },
                    { name: 'content', type: 'string', note: 'Description of the signal' },
                    { name: 'confidence', type: 'enum', note: 'high | medium | low' },
                    { name: 'source', type: 'enum', note: 'human | agent | integration' },
                    { name: 'contributor_id', type: 'string', note: 'Who/what submitted' },
                    { name: 'is_retracted', type: 'boolean', note: 'Default false' },
                    { name: 'superseded_by', type: 'string?', note: 'ID of retraction record' },
                    { name: 'timestamp', type: 'datetime', note: 'When the evidence was recorded' },
                  ]}
                />

                <EntityCard
                  name="Connection"
                  letter="C"
                  description="A directed relationship between two bets. Connections make the portfolio a system, not a list — revealing tensions, synergies, and dependencies."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'from_bet_id', type: 'string', note: 'Source bet' },
                    { name: 'to_bet_id', type: 'string', note: 'Target bet' },
                    { name: 'type', type: 'enum', note: 'tension | synergy | dependency | resource_conflict' },
                    { name: 'status', type: 'enum', note: 'active | monitoring | resolved | escalated' },
                    { name: 'description', type: 'string', note: 'Why this connection exists' },
                  ]}
                />

                <EntityCard
                  name="Scenario"
                  letter="S"
                  description='A hypothetical modification to the portfolio — the strategic equivalent of a Git branch. Scenarios allow "what if" reasoning without altering the live model.'
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'name', type: 'string', note: 'Descriptive name' },
                    { name: 'description', type: 'string', note: 'What this scenario explores' },
                    { name: 'status', type: 'enum', note: 'draft | explored | enacted | rejected' },
                    { name: 'bet_modifications', type: 'ScenarioBet[]', note: 'Overrides per bet' },
                    { name: 'created_by', type: 'string', note: 'Contributor who created it' },
                  ]}
                />

                <EntityCard
                  name="Experiment"
                  letter="X"
                  description="A time-boxed, cost-capped test designed to validate or falsify a bet's thesis through targeted assumption testing. Experiments link a bet to specific assumptions with clear success/failure criteria."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'bet_id', type: 'string', note: 'The bet being tested' },
                    { name: 'assumption_ids', type: 'string[]', note: 'Assumptions under test' },
                    { name: 'hypothesis', type: 'string', note: 'What the experiment tests' },
                    { name: 'method', type: 'string', note: 'How it will be conducted' },
                    { name: 'success_criteria', type: 'string', note: 'What constitutes success' },
                    { name: 'failure_criteria', type: 'string', note: 'What constitutes failure' },
                    { name: 'status', type: 'enum', note: 'planned | running | concluded | abandoned' },
                    { name: 'cost_ceiling', type: 'string', note: 'Maximum cost allowed' },
                    { name: 'time_box', type: 'string', note: 'Maximum duration allowed' },
                    { name: 'outcome', type: 'object', note: 'signal + summary + concluded_at' },
                  ]}
                />

                <EntityCard
                  name="Contributor"
                  letter="+"
                  description="An entity that reads from or writes to the model. Contributors can be human or agent — the protocol makes no structural distinction."
                  fields={[
                    { name: 'id', type: 'string', note: 'Unique identifier' },
                    { name: 'name', type: 'string', note: 'Display name' },
                    { name: 'type', type: 'enum', note: 'human | agent' },
                    { name: 'role', type: 'enum', note: 'owner | facilitator | contributor | observer' },
                    { name: 'last_active_at', type: 'datetime', note: 'Most recent interaction' },
                  ]}
                />
              </div>
            </section>

            {/* Evidence Model */}
            <SectionAnchor id="evidence-model" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Evidence Model</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Evidence is the lifeblood of the Tell protocol. Every evidence
                  record carries three dimensions:
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
                    <h4 className="text-sm font-semibold text-navy-900">Signal</h4>
                    <p className="mt-1 text-sm text-navy-500">
                      Does this evidence support, weaken, or have neutral bearing on the
                      assumption?
                    </p>
                    <code className="mt-2 block text-xs text-amber-600">
                      supports | weakens | neutral
                    </code>
                  </div>
                  <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
                    <h4 className="text-sm font-semibold text-navy-900">Confidence</h4>
                    <p className="mt-1 text-sm text-navy-500">
                      How much weight should this evidence carry? Self-assessed by the
                      contributor.
                    </p>
                    <code className="mt-2 block text-xs text-amber-600">
                      high | medium | low
                    </code>
                  </div>
                  <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
                    <h4 className="text-sm font-semibold text-navy-900">Source</h4>
                    <p className="mt-1 text-sm text-navy-500">
                      Who or what produced this evidence? Recorded for provenance, not
                      privilege.
                    </p>
                    <code className="mt-2 block text-xs text-amber-600">
                      human | agent | integration
                    </code>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">
                    <strong>Immutability constraint:</strong> Evidence records are never
                    modified or deleted. If evidence is found to be incorrect, a new
                    retraction record is created that references the original via{' '}
                    <code className="text-xs">superseded_by</code>. This preserves the
                    complete evidential history and audit trail.
                  </p>
                </div>
              </div>
            </section>

            {/* Confidence Algorithm */}
            <SectionAnchor id="confidence" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Confidence Algorithm</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Bet confidence in Tell is derived from evidence, not declared by
                  fiat. The algorithm operates in three steps:
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg border border-navy-200 p-5">
                    <h4 className="text-sm font-semibold text-navy-900">
                      Step 1: Per-Assumption Evidence Score
                    </h4>
                    <p className="mt-2 text-sm text-navy-500">
                      Each piece of evidence contributes a weighted score based on
                      signal direction, self-assessed confidence, and recency.
                    </p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-navy-200 bg-navy-950 p-4 font-mono text-xs text-navy-300">
                      <div>signal_weight: supports = +1, weakens = -1, neutral = 0</div>
                      <div>confidence_mult: high = 1.0, medium = 0.6, low = 0.3</div>
                      <div>recency_decay: &gt;30d = 0.5x, &gt;90d = 0.25x</div>
                      <br />
                      <div className="text-amber-400">
                        score = clamp(50 + (sum_of_contributions × 10), 0, 100)
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-navy-200 p-5">
                    <h4 className="text-sm font-semibold text-navy-900">
                      Step 2: Blend with Status Weight
                    </h4>
                    <p className="mt-2 text-sm text-navy-500">
                      Evidence score is blended with the assumption&apos;s categorical status
                      to produce a final assumption confidence.
                    </p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-navy-200 bg-navy-950 p-4 font-mono text-xs text-navy-300">
                      <div>with evidence: <span className="text-amber-400">0.3 × status_weight + 0.7 × evidence_score</span></div>
                      <div>without evidence: <span className="text-amber-400">status_weight</span> (backwards compatible)</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-navy-200 p-5">
                    <h4 className="text-sm font-semibold text-navy-900">
                      Step 3: Bet Confidence
                    </h4>
                    <p className="mt-2 text-sm text-navy-500">
                      The bet&apos;s confidence is the average of all its assumption
                      blended scores, rounded to the nearest integer. Default: 50 if
                      no assumptions exist.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Conformance Levels */}
            <SectionAnchor id="conformance" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Conformance Levels</h2>
              <p className="mt-4 text-navy-600">
                Tell defines three conformance levels. Each builds on the one below.
                An implementation at any level can interoperate with implementations
                at other levels.
              </p>

              <div className="mt-8 overflow-hidden rounded-xl border border-navy-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-200 bg-navy-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-500">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-500">Capabilities</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-semibold text-navy-500 md:table-cell">Example Use Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-mono text-xs text-navy-400">1</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">Reader</td>
                      <td className="px-4 py-3 text-navy-500">Parse all entities, preserve extensions on round-trip, handle many-to-many relationships</td>
                      <td className="hidden px-4 py-3 text-navy-400 md:table-cell">BI dashboards, governance views, reporting</td>
                    </tr>
                    <tr className="border-b border-navy-100">
                      <td className="px-4 py-3 font-mono text-xs text-navy-400">2</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">Writer</td>
                      <td className="px-4 py-3 text-navy-500">Level 1 + append evidence, increment versions, record audit events, maintain immutability constraint</td>
                      <td className="hidden px-4 py-3 text-navy-400 md:table-cell">Agent frameworks, AI curation, collaboration tools</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-amber-600">3</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">Platform</td>
                      <td className="px-4 py-3 text-navy-500">Level 2 + real-time event stream, version history, portfolio diffing, scenario modelling, confidence scoring</td>
                      <td className="hidden px-4 py-3 text-navy-400 md:table-cell">Strategic intelligence platforms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* MCP Integration */}
            <SectionAnchor id="mcp" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">MCP Integration</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Tell operations are designed to be exposed as MCP (Model Context
                  Protocol) tools, enabling AI agents to read strategic context and
                  write evidence through standard tool calls.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    name: 'tell_read_portfolio',
                    desc: 'Returns the complete strategic model with all bets, assumptions, evidence, and connections.',
                    params: 'portfolio_id, include_evidence?, include_scenarios?',
                  },
                  {
                    name: 'tell_read_assumption',
                    desc: 'Returns a specific assumption with its full evidence timeline and linked bets.',
                    params: 'assumption_id',
                  },
                  {
                    name: 'tell_write_evidence',
                    desc: 'Appends a new evidence record to an assumption. Increments portfolio version.',
                    params: 'assumption_id, signal, content, confidence, source',
                  },
                  {
                    name: 'tell_read_stale',
                    desc: 'Returns assumptions with no recent evidence, sorted by staleness.',
                    params: 'portfolio_id, days_threshold?',
                  },
                  {
                    name: 'tell_read_risk',
                    desc: 'Returns assumptions shared across multiple bets where status is under pressure.',
                    params: 'portfolio_id',
                  },
                ].map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-lg border border-navy-200 p-4"
                  >
                    <code className="text-sm font-semibold text-amber-600">
                      {tool.name}
                    </code>
                    <p className="mt-1 text-sm text-navy-500">{tool.desc}</p>
                    <p className="mt-2 font-mono text-xs text-navy-400">
                      Params: {tool.params}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Versioning */}
            <SectionAnchor id="versioning" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Versioning</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Tell portfolios carry an integer version number that increments on
                  structural changes — new bets, status transitions, connection
                  modifications. Evidence appends do <em>not</em> increment the
                  version, as they represent continuous signal accumulation rather
                  than structural change.
                </p>
                <p>
                  Level 3 (Platform) implementations support version history and
                  portfolio diffing — the ability to compare any two versions and see
                  what changed. This is the strategic equivalent of{' '}
                  <code className="text-xs text-amber-600">git diff</code>.
                </p>
              </div>
            </section>

            {/* Serialisation */}
            <SectionAnchor id="serialisation" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Serialisation</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  The canonical serialisation format is JSON. Tell files use the{' '}
                  <code className="text-xs text-amber-600">.tell.json</code> extension.
                </p>
                <p>
                  Every Tell document must include a{' '}
                  <code className="text-xs text-amber-600">tell_version</code> field at the
                  top level indicating which version of the protocol it conforms to.
                </p>
                <div className="rounded-lg border border-navy-200 bg-navy-950 p-4">
                  <pre className="text-sm text-navy-300">
{`{
  "tell_version": "0.2",
  "portfolio": { ... }
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Extensions */}
            <SectionAnchor id="extensions" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Extensions</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Every entity supports an optional{' '}
                  <code className="text-xs text-amber-600">extensions</code> object for
                  domain-specific data. Extensions use namespaced keys:
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm text-navy-500">
                  <li>
                    <code className="text-xs text-amber-600">tell.*</code> — Reserved
                    for future protocol use
                  </li>
                  <li>
                    <code className="text-xs text-amber-600">apophenic.*</code> —
                    Platform-specific extensions
                  </li>
                  <li>
                    <code className="text-xs text-amber-600">{'<vendor>'}.*</code> —
                    Third-party extensions
                  </li>
                </ul>
                <p>
                  Conformant implementations must preserve unrecognised extensions on
                  round-trip — never strip data you don&apos;t understand.
                </p>
              </div>
            </section>

            {/* Security */}
            <SectionAnchor id="security" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-navy-900">Security &amp; Governance</h2>
              <div className="mt-4 space-y-4 text-navy-600">
                <p>
                  Tell models contain sensitive strategic information. Implementations
                  must consider:
                </p>
                <ul className="list-inside list-disc space-y-2 text-sm text-navy-500">
                  <li>
                    <strong>Access control:</strong> Who can read the portfolio? Who can
                    write evidence? Role-based access (owner, facilitator, contributor,
                    observer) is recommended.
                  </li>
                  <li>
                    <strong>Audit trail:</strong> All mutations should be recorded with
                    contributor attribution and timestamps.
                  </li>
                  <li>
                    <strong>Agent identity:</strong> AI agents should be registered as
                    contributors with explicit role assignments.
                  </li>
                  <li>
                    <strong>Transport security:</strong> Tell data should always be
                    transmitted over encrypted channels (TLS).
                  </li>
                </ul>
              </div>
            </section>

            {/* Next */}
            <div className="rounded-xl border border-navy-200 bg-navy-50 p-6">
              <h3 className="font-semibold text-navy-900">What&apos;s next?</h3>
              <p className="mt-2 text-sm text-navy-500">
                Ready to implement? Start with the{' '}
                <Link href="/guide" className="text-amber-600 underline underline-offset-2 hover:text-amber-500">
                  Getting Started Guide
                </Link>{' '}
                for a practical walkthrough, or explore the{' '}
                <Link href="/about" className="text-amber-600 underline underline-offset-2 hover:text-amber-500">
                  About page
                </Link>{' '}
                to understand the story behind Tell.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
