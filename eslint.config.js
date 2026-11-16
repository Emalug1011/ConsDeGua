import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/data/constitucion.json'],
              message: 'Lee el catálogo con features/constitution/catalog.ts.',
            },
            {
              group: ['firebase', 'firebase/*', '**/config/firebase'],
              message: 'Usa el servicio de la feature (service.ts), no Firebase directo.',
            },
          ],
        },
      ],
    },
  },
  {
    // Únicos puntos que pueden leer el JSON del catálogo.
    files: ['src/features/constitution/catalog.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Únicos puntos que hablan con Firebase.
    files: [
      'src/config/firebase.ts',
      'src/features/*/service.ts',
      'src/features/metrics/track.ts',
      'tests/rules/**',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // En pruebas, una aserción `!` que falle rompe la prueba de inmediato.
    files: ['**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  prettier,
])
