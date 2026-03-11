import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Install',
  description: 'Install the Tell Protocol CLI, MCP server, and libraries.',
}

const packages = [
  {
    name: '@tell-protocol/cli',
    description: 'Command-line tool for managing strategic portfolios',
    install: 'npm install -g @tell-protocol/cli',
    binary: 'tell',
  },
  {
    name: '@tell-protocol/mcp-server',
    description: 'MCP server exposing Tell tools to AI agents',
    install: 'npm install -g @tell-protocol/mcp-server',
    binary: 'tell-mcp',
  },
  {
    name: '@tell-protocol/core',
    description: 'Types, algorithms, and store interface for building Tell-compatible tools',
    install: 'npm install @tell-protocol/core',
  },
  {
    name: '@tell-protocol/schema',
    description: 'JSON Schema definitions and validation for Tell documents',
    install: 'npm install @tell-protocol/schema',
  },
]

export default function InstallPage() {
  return (
    <>
      <section className="border-b border-navy-200 bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Install
          </h1>
          <p className="mt-4 text-lg text-navy-300">
            Get started with the Tell Protocol tooling. All packages require Node.js 20+.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Quickstart */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy-900">Quickstart</h2>
            <p className="mt-2 text-navy-500">
              Install the CLI globally and initialise your first portfolio in seconds.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-navy-200 bg-navy-950">
              <div className="flex items-center gap-2 border-b border-navy-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
                <span className="h-3 w-3 rounded-full bg-navy-700" />
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-[1.8]">
                <code className="text-navy-300">
{`$ npm install -g @tell-protocol/cli
$ tell init --name "My Portfolio" --org "My Org"
$ tell bet add "Users prefer AI summaries" --horizon 6m
$ tell status`}
                </code>
              </pre>
            </div>
          </div>

          {/* Packages */}
          <h2 className="text-2xl font-bold text-navy-900">Packages</h2>
          <div className="mt-6 space-y-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-navy-200 p-6"
              >
                <h3 className="text-lg font-semibold text-navy-900">
                  {pkg.name}
                  {pkg.binary && (
                    <span className="ml-2 text-sm font-normal text-navy-400">
                      (binary: <code className="text-amber-600">{pkg.binary}</code>)
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm text-navy-500">{pkg.description}</p>
                <div className="mt-4 overflow-hidden rounded-lg bg-navy-950 px-4 py-3">
                  <code className="text-sm text-navy-300">
                    <span className="text-navy-500">$</span> {pkg.install}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* MCP Server Setup */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-900">MCP Server Setup</h2>
            <p className="mt-2 text-navy-500">
              Configure the Tell MCP server for your AI agent.
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-navy-900">Claude Desktop</h3>
              <p className="mt-2 text-sm text-navy-500">
                Add to your <code className="rounded bg-navy-100 px-1 py-0.5 text-xs text-navy-700">claude_desktop_config.json</code>:
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-navy-200 bg-navy-950">
                <div className="border-b border-navy-800 px-4 py-2">
                  <span className="text-xs text-navy-500">claude_desktop_config.json</span>
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                  <code className="text-navy-300">
{`{
  "mcpServers": {
    "tell": {
      "command": "tell-mcp",
      "env": {
        "TELL_DIR": "/path/to/your/project/.tell"
      }
    }
  }
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-navy-900">Claude Code</h3>
              <p className="mt-2 text-sm text-navy-500">
                Add to your project&apos;s <code className="rounded bg-navy-100 px-1 py-0.5 text-xs text-navy-700">.mcp.json</code>:
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-navy-200 bg-navy-950">
                <div className="border-b border-navy-800 px-4 py-2">
                  <span className="text-xs text-navy-500">.mcp.json</span>
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                  <code className="text-navy-300">
{`{
  "mcpServers": {
    "tell": {
      "command": "tell-mcp"
    }
  }
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Library Usage */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-900">Library Usage</h2>
            <p className="mt-2 text-navy-500">
              Build Tell-compatible tools with the core library.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-navy-200 bg-navy-950">
              <div className="border-b border-navy-800 px-4 py-2">
                <span className="text-xs text-navy-500">TypeScript</span>
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                <code className="text-navy-300">
{`import { InMemoryStore, generateId, nowISO } from '@tell-protocol/core'
import { serialize } from '@tell-protocol/core'

const store = new InMemoryStore()
const bet = await store.addBet({
  thesis: 'Users prefer AI summaries',
  status: 'active',
  assumptions: [],
})
const asm = await store.addAssumption(bet.id, {
  statement: 'Users engage 3x more with summaries',
})
const portfolio = await store.getPortfolio()
const json = serialize(portfolio)  // → valid .tell.json`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
