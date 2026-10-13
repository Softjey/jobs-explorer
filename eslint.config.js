import js from '@eslint/js'
import query from '@tanstack/eslint-plugin-query'
import router from '@tanstack/eslint-plugin-router'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

const allowed = {
  app: ['app', 'routes', 'pages', 'components', 'store', 'lib'],
  routes: ['routes', 'app', 'pages', 'components', 'store', 'entities', 'lib'],
  pages: ['pages', 'components', 'store', 'entities', 'lib'],
  components: ['components', 'store', 'entities', 'lib'],
  store: ['store', 'api', 'entities', 'lib'],
  api: ['api', 'entities', 'lib'],
  entities: ['entities'],
  lib: ['lib'],
  test: ['test', 'app', 'routes', 'pages', 'components', 'store', 'api', 'entities', 'lib'],
}
const layers = ['routes', 'pages', 'components', 'store', 'api', 'entities']

export default defineConfig(
  {
    ignores: [
      'dist',
      'coverage',
      'playwright-report',
      'test-results',
      'src/routeTree.gen.ts',
      'src/components/ui',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...query.configs['flat/recommended'],
  ...router.configs['flat/recommended'],
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        ...layers.map((l) => ({ type: l, pattern: `src/${l}/**`, partialMatch: false })),
        { type: 'lib', pattern: 'src/lib/**' },
        { type: 'test', pattern: 'src/test/**' },
        {
          type: 'app',
          pattern: ['src/main.tsx', 'src/router.ts', 'src/routeTree.gen.ts'],
          partialMatch: false,
        },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: Object.entries(allowed).map(([from, to]) => ({
            from: { element: { type: from } },
            allow: to.map((t) => ({ to: { element: { type: t } } })),
          })),
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'boundaries/dependencies': 'off' },
  },
)
