import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Tell exists, how it got its name, and the relationship between the open protocol and the Apophenic platform.',
}

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-navy-200 bg-navy-950 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            About Tell
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-400">
            Why the protocol exists, how it got its name, and where it&apos;s
            going.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* The Problem */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900">The Problem</h2>
          <div className="mt-4 space-y-4 text-navy-600">
            <p>
              Every layer of the modern technology stack has a standard.
              Authentication has OAuth. APIs have OpenAPI. Agent tooling has MCP.
              Code has Git.
            </p>
            <p>
              Strategy has nothing.
            </p>
            <p>
              Strategic intent — what an organisation is betting on, what
              assumptions underpin those bets, and what evidence says about
              whether they&apos;re working — lives in slide decks, board packs,
              and the heads of a few senior leaders. It can&apos;t be queried. It
              can&apos;t be versioned. It can&apos;t be read by the AI agents
              that increasingly execute on an organisation&apos;s behalf.
            </p>
            <p>
              The result: AI agents operate at machine speed with zero strategic
              context. They can do things, but they have no way of knowing
              whether those things align with what the organisation actually
              cares about.
            </p>
            <p>Tell is the protocol that fills this gap.</p>
          </div>
        </section>

        {/* The Name */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900">Why &ldquo;Tell&rdquo;?</h2>
          <div className="mt-4 space-y-4 text-navy-600">
            <p>
              In poker, a tell is the involuntary signal that reveals the truth
              behind the bluff. A twitch, a pause, a pattern in the betting —
              something that tells you what&apos;s really going on beneath the
              surface.
            </p>
            <p>
              Every strategy has tells too. Evidence signals buried in data,
              customer behaviour, market movements, operational metrics — signals
              that reveal whether your strategic assumptions are actually holding
              or quietly breaking.
            </p>
            <p>
              Most organisations can&apos;t read the tells because their strategy
              lives in a deck, not a model. Tell is the protocol that makes
              those signals readable — by humans and by machines.
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-navy-200 bg-navy-50 p-6">
            <blockquote className="text-lg font-medium italic text-navy-700">
              &ldquo;We named it Tell because that&apos;s what evidence does — it
              tells you whether your thesis is holding.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* Protocol vs Platform */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900">
            Protocol vs. Platform
          </h2>
          <div className="mt-4 space-y-4 text-navy-600">
            <p>
              The relationship between Tell and Apophenic mirrors Git and GitHub.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-navy-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-200 bg-navy-50">
                  <th className="px-4 py-3 text-left font-semibold text-navy-500"></th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-900">
                    Tell
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-navy-900">
                    Apophenic
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-navy-100">
                  <td className="px-4 py-3 text-sm font-medium text-navy-500">
                    What it is
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Open protocol
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Platform
                  </td>
                </tr>
                <tr className="border-b border-navy-100">
                  <td className="px-4 py-3 text-sm font-medium text-navy-500">
                    Ownership
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Community-governed (eventually)
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Proprietary
                  </td>
                </tr>
                <tr className="border-b border-navy-100">
                  <td className="px-4 py-3 text-sm font-medium text-navy-500">
                    Purpose
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Define the standard. Proliferate.
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">
                    Canonical implementation. Full experience.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-navy-500">
                    Analogy
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">Git</td>
                  <td className="px-4 py-3 text-sm text-navy-600">GitHub</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4 text-navy-600">
            <p>
              Tell is designed to be useful even without Apophenic. A team could
              implement a basic Tell model in a spreadsheet. An agent framework
              could support Tell reads and writes. A consulting firm could
              structure client engagements using Tell.
            </p>
            <p>
              Each of these implementations validates the standard and expands
              the ecosystem. Apophenic is where the full Level 3 Platform
              experience lives — real-time events, version history, scenario
              modelling, AI-powered intelligence — but the protocol itself is
              open for anyone to implement.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900">Roadmap</h2>
          <div className="mt-6">
            <div className="relative space-y-0 border-l-2 border-navy-200 pl-8">
              {[
                {
                  version: 'v0.1',
                  title: 'Conceptual Model',
                  status: 'complete',
                  desc: 'Core entity definitions, initial ontology design.',
                },
                {
                  version: 'v0.2',
                  title: 'Expanded Specification',
                  status: 'current',
                  desc: 'Full entity schemas, conformance levels, MCP integration patterns, evidence weighting algorithm.',
                },
                {
                  version: 'v0.3',
                  title: 'JSON Schema + Tooling',
                  status: 'complete',
                  desc: 'Formal JSON Schema for all entities. CLI tool, MCP server, TypeScript libraries. Published as @tell-protocol/* npm packages.',
                },
                {
                  version: 'v0.4',
                  title: 'Schema Refinement',
                  status: 'planned',
                  desc: 'Refinements from real-world usage. Edge case handling. Extension ecosystem patterns.',
                },
                {
                  version: 'v1.0',
                  title: 'Formal Specification',
                  status: 'planned',
                  desc: 'RFC-style formal spec. Comprehensive test suite. Reference implementation in TypeScript and Python.',
                },
              ].map((item) => (
                <div key={item.version} className="relative pb-8 last:pb-0">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[calc(2rem+5px)] flex h-3 w-3 rounded-full ${
                      item.status === 'current'
                        ? 'bg-amber-500'
                        : item.status === 'complete'
                        ? 'bg-navy-400'
                        : 'bg-navy-200'
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-navy-900">
                      {item.version}
                    </span>
                    {item.status === 'current' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        CURRENT
                      </span>
                    )}
                    {item.status === 'complete' && (
                      <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-semibold text-navy-500">
                        COMPLETE
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 font-semibold text-navy-900">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-navy-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-navy-200 bg-navy-50 p-4">
            <p className="text-sm text-navy-600">
              <strong>Guiding principle:</strong> Validate before you publish.
              Tell is being refined through real deployments before the formal
              1.0 specification is released.
            </p>
          </div>
        </section>

        {/* Governance */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900">Governance</h2>
          <div className="mt-4 space-y-4 text-navy-600">
            <p>
              Tell is currently developed and maintained by{' '}
              <a
                href="https://apophenic.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
              >
                Apophenic
              </a>
              . As the protocol matures and gains external implementors, the goal
              is to transition governance to a community-driven model.
            </p>
            <p>
              The specification, JSON schemas, and reference implementations are
              published openly. Feedback, issues, and contributions are welcome
              via the{' '}
              <a
                href="https://github.com/apophenic/tell-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline underline-offset-2 hover:text-amber-500"
              >
                GitHub repository
              </a>
              .
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border-2 border-navy-200 bg-navy-950 p-8 text-center">
          <h3 className="text-xl font-bold text-white">Ready to build?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-400">
            Start with the specification, explore the getting started guide, or
            try Apophenic — the canonical platform implementation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/spec"
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-amber-400"
            >
              Read the Spec
            </Link>
            <Link
              href="/guide"
              className="rounded-lg border border-navy-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-navy-500"
            >
              Getting Started
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
