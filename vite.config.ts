import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths, so the build works wherever GitHub Pages serves it.
  base: './',
  resolve: {
    alias: { '@shared': resolve(import.meta.dirname, 'src/shared') },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
