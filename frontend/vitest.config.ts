import {fileURLToPath} from 'node:url'

import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" -> "./*" alias so tests resolve app imports.
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['app/**/*.test.{ts,tsx}'],
  },
  esbuild: {
    jsx: 'automatic',
  },
})
