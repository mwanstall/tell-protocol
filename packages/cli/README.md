# @tell-protocol/cli

The command-line interface for the [Tell Protocol](https://github.com/mwanstall/tell-protocol) — encode strategic intent as structured, machine-readable models.

## Install

```bash
npm install -g @tell-protocol/cli
```

## Quickstart

```bash
# Initialize a new portfolio (launches guided onboarding wizard)
tell init --name "My Portfolio" --org "My Org"

# Or just type `tell` for an interactive shell
tell
```

## Interactive Mode

Running `tell` with no arguments opens an interactive REPL:

```
  ████████╗ ███████╗ ██╗      ██╗
  ╚══██╔══╝ ██╔════╝ ██║      ██║
     ██║    █████╗   ██║      ██║
     ██║    ██╔══╝   ██║      ██║
     ██║    ███████╗ ███████╗ ███████╗
     ╚═╝    ╚══════╝ ╚══════╝ ╚══════╝

tell > status
tell > bet list
tell > exit
```

## Commands

| Command | Description |
|---|---|
| `tell init` | Initialize a portfolio with guided onboarding |
| `tell status` | Portfolio overview with health indicators |
| `tell bet add` | Add a strategic bet |
| `tell bet list` | List all bets |
| `tell assume add` | Add an assumption to a bet |
| `tell evidence add` | Record evidence for an assumption |
| `tell stale` | Find assumptions lacking recent evidence |
| `tell risk` | Portfolio-level risk analysis |
| `tell connect` | Define relationships between bets |
| `tell experiment` | Manage experiments |
| `tell export` | Export portfolio as JSON |
| `tell validate` | Validate portfolio against the schema |

## Cloud Sync

Connect to the [Apophenic](https://apophenic.tech) platform for team collaboration:

```bash
tell auth login
tell remote add <portfolio-id>
tell push
tell pull
```

## Related Packages

- [`@tell-protocol/core`](https://www.npmjs.com/package/@tell-protocol/core) — Types, algorithms, and store interface
- [`@tell-protocol/schema`](https://www.npmjs.com/package/@tell-protocol/schema) — JSON Schema definitions
- [`@tell-protocol/mcp-server`](https://www.npmjs.com/package/@tell-protocol/mcp-server) — MCP server for AI agents

## License

Apache 2.0
