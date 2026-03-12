import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/bin/tell.ts'],
    format: ['esm'],
    clean: true,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
  },
]);
