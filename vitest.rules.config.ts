import { defineConfig } from 'vitest/config'

// Pruebas de firestore.rules: corren en Node contra el emulador de Firestore.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
  },
})
