import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { FileStore, resolveTellDir } from '@tell-protocol/cli';
import { InMemoryStore } from '@tell-protocol/core';
import { createTellServer } from '../server.js';

async function main() {
  const tellDir = process.env.TELL_DIR || resolveTellDir();

  let store;
  if (tellDir) {
    store = new FileStore(tellDir);
  } else {
    console.error(
      'No .tell/ directory found. Using empty in-memory store. Run "tell init" to create a portfolio.',
    );
    store = new InMemoryStore();
  }

  const server = createTellServer(store);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
