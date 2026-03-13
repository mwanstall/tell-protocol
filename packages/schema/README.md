# @tell-protocol/schema

JSON Schema definitions and validation for the [Tell Protocol](https://github.com/mwanstall/tell-protocol) v0.2.

## Install

```bash
npm install @tell-protocol/schema
```

## Usage

```typescript
import { portfolioSchema, validate } from '@tell-protocol/schema';

const result = validate(myPortfolioData);
if (!result.valid) {
  console.error(result.errors);
}
```

## Schemas

Provides JSON Schema definitions for all Tell Protocol entities:

- Portfolio
- Bet
- Assumption
- Evidence
- Connection
- Scenario
- Experiment
- Contributor

## Related Packages

- [`@tell-protocol/cli`](https://www.npmjs.com/package/@tell-protocol/cli) — `tell` command-line tool
- [`@tell-protocol/core`](https://www.npmjs.com/package/@tell-protocol/core) — Types, algorithms, and store interface
- [`@tell-protocol/mcp-server`](https://www.npmjs.com/package/@tell-protocol/mcp-server) — MCP server for AI agents

## License

Apache 2.0
