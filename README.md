# Tell Protocol

**The open standard for encoding strategic intent.**

Tell is a protocol for encoding strategy as structured, machine-readable models. Define bets. Track assumptions. Surface evidence. Give your teams and AI agents a shared language for what your organisation is betting on.

The relationship between Tell and [Apophenic](https://apophenic.tech) mirrors **Git and GitHub**: Tell is the open protocol, Apophenic is the proprietary platform built on top.

## Install

```bash
npm install -g @tell-protocol/cli
```

## Quickstart

```bash
tell init --name "My Portfolio" --org "My Org"
tell bet add "Users prefer AI summaries" --horizon 6m
tell assume add bet_xxx "Users engage 3x more with summaries"
tell evidence add asm_xxx --signal supports --confidence high "A/B test: 3.2x engagement"
tell status
```

## Packages

| Package | Description |
|---|---|
| [`@tell-protocol/schema`](packages/schema) | JSON Schema definitions and validation |
| [`@tell-protocol/core`](packages/core) | Types, algorithms, and store interface |
| [`@tell-protocol/cli`](packages/cli) | `tell` command-line tool |
| [`@tell-protocol/mcp-server`](packages/mcp-server) | MCP server for AI agents |

## MCP Server

Install the MCP server to give AI agents strategic context:

```bash
npm install -g @tell-protocol/mcp-server
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tell": {
      "command": "tell-mcp",
      "env": {
        "TELL_DIR": "/path/to/your/project/.tell"
      }
    }
  }
}
```

Five tools are available:

| Tool | Description |
|---|---|
| `tell_read_portfolio` | Read the full strategic model |
| `tell_read_assumption` | Read assumption with evidence history |
| `tell_write_evidence` | Append evidence to assumptions |
| `tell_read_stale` | Find assumptions lacking recent evidence |
| `tell_read_risk` | Portfolio-level risk analysis |

## Protocol

Tell v0.2 defines 7 core entities:

- **Portfolio** — top-level container
- **Bet** — falsifiable hypothesis your organisation invests in
- **Assumption** — condition that must hold for a bet (many-to-many with bets)
- **Evidence** — append-only signal supporting or weakening an assumption
- **Connection** — relationship between bets (tension, synergy, dependency, resource conflict)
- **Scenario** — hypothetical portfolio modification
- **Contributor** — human or agent that contributes evidence

See the [full specification](docs/spec/SPEC-v0.2.md) for details.

## Development

```bash
pnpm install
pnpm turbo build
pnpm turbo test
```

## License

Apache 2.0 — see [LICENSE](LICENSE).
