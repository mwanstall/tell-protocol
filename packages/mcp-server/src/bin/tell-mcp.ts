import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { FileStore, resolveTellDir } from '@tell-protocol/cli';
import { InMemoryStore } from '@tell-protocol/core';
import { RemoteStore } from '../remote-store.js';
import { createTellServer } from '../server.js';

async function main() {
  const store = resolveStore();
  const server = createTellServer(store);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/**
 * Resolve which store to use, in priority order:
 *
 * 1. APOPHENIC_TOKEN + APOPHENIC_PORTFOLIO → RemoteStore (Apophenic platform API)
 * 2. TELL_DIR or auto-discovered .tell/ → FileStore (local portfolio)
 * 3. Fallback → InMemoryStore (empty, ephemeral)
 */
function resolveStore() {
  // Option 1: Apophenic platform (remote)
  const token = process.env.APOPHENIC_TOKEN;
  const portfolioId = process.env.APOPHENIC_PORTFOLIO;
  if (token && portfolioId) {
    const baseUrl = process.env.APOPHENIC_URL || 'https://app.apophenic.com';
    console.error(`Connected to Apophenic platform: ${baseUrl} (portfolio: ${portfolioId})`);
    return new RemoteStore(baseUrl, token, portfolioId);
  }

  // Option 2: Local .tell/ directory
  const tellDir = process.env.TELL_DIR || resolveTellDir();
  if (tellDir) {
    return new FileStore(tellDir);
  }

  // Option 3: Empty fallback
  console.error(
    'No .tell/ directory found and no APOPHENIC_TOKEN set. Using empty in-memory store. Run "tell init" to create a portfolio.',
  );
  return new InMemoryStore();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
