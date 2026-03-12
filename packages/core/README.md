# @tell-protocol/core

Core types, algorithms, and store interface for the [Tell Protocol](https://github.com/mwanstall/tell-protocol).

## Install

```bash
npm install @tell-protocol/core
```

## Usage

```typescript
import type { Portfolio, Bet, Assumption, Evidence, TellStore } from '@tell-protocol/core';
import { InMemoryStore, computeHealth, findStale, analyseRisk } from '@tell-protocol/core';
```

## What's Included

- **TypeScript types** for all Tell Protocol entities (Portfolio, Bet, Assumption, Evidence, Connection, Scenario, Experiment, Contributor)
- **`TellStore` interface** — abstract store contract implemented by FileStore (CLI) and RemoteStore (MCP)
- **`InMemoryStore`** — in-memory implementation for testing and ephemeral use
- **Algorithms** — `computeHealth()`, `findStale()`, `analyseRisk()` for portfolio analysis

## Related Packages

- [`@tell-protocol/cli`](https://www.npmjs.com/package/@tell-protocol/cli) — `tell` command-line tool
- [`@tell-protocol/schema`](https://www.npmjs.com/package/@tell-protocol/schema) — JSON Schema definitions
- [`@tell-protocol/mcp-server`](https://www.npmjs.com/package/@tell-protocol/mcp-server) — MCP server for AI agents

## License

Apache 2.0
