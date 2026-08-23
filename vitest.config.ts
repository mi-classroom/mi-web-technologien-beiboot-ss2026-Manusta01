import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/gesture-library/__tests__/**/*.test.ts'],
  },
})
