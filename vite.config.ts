import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { NetlifyHeaderReader } from './tests/browser/NetlifyHeaderReader.ts';

const netlifyConfig = new NetlifyHeaderReader(
  readFileSync(resolve(import.meta.dirname, 'netlify.toml'), 'utf8'),
);

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/coverage/**', '**/dist/**'],
    },
  },
  preview: {
    headers: netlifyConfig.valuesFor('/index.html'),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts'],
      exclude: ['src/core/**/*.test.ts', 'src/core/models/**'],
    },
  },
});
