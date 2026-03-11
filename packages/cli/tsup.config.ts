import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin/tell.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
