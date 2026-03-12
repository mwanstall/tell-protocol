# @tell-protocol/mcp-server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that gives AI agents strategic context from [Tell Protocol](https://github.com/mwanstall/tell-protocol) portfolios.

## Install

```bash
npm install -g @tell-protocol/mcp-server
```

## Configuration

### Local Portfolio

Add to your `claude_desktop_config.json` (or any MCP-compatible client):

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

If `TELL_DIR` is not set, the server auto-discovers the nearest `.tell/` directory.

### Apophenic Platform (Cloud)

Connect to a cloud-hosted portfolio on [Apophenic](https://apophenic.tech):

```json
{
  "mcpServers": {
    "tell": {
      "command": "tell-mcp",
      "env": {
        "APOPHENIC_TOKEN": "your-api-token",
        "APOPHENIC_PORTFOLIO": "your-portfolio-id"
      }
    }
  }
}
```

Set `APOPHENIC_URL` to override the default platform URL.

## Tools

The server exposes five MCP tools:

| Tool | Description |
|---|---|
| `tell_read_portfolio` | Read the full strategic model — bets, assumptions, connections |
| `tell_read_assumption` | Read a single assumption with its full evidence history |
| `tell_write_evidence` | Append evidence to an assumption (supports, weakens, neutral) |
| `tell_read_stale` | Find assumptions that lack recent evidence |
| `tell_read_risk` | Portfolio-level risk analysis and health score |

## Store Resolution

The server resolves its data store in priority order:

1. **RemoteStore** — `APOPHENIC_TOKEN` + `APOPHENIC_PORTFOLIO` env vars → Apophenic platform API
2. **FileStore** — `TELL_DIR` env var or auto-discovered `.tell/` directory → local files
3. **InMemoryStore** — empty fallback (run `tell init` to create a portfolio)

## Related Packages

- [`@tell-protocol/cli`](https://www.npmjs.com/package/@tell-protocol/cli) — `tell` command-line tool
- [`@tell-protocol/core`](https://www.npmjs.com/package/@tell-protocol/core) — Types, algorithms, and store interface
- [`@tell-protocol/schema`](https://www.npmjs.com/package/@tell-protocol/schema) — JSON Schema definitions

## License

Apache 2.0
