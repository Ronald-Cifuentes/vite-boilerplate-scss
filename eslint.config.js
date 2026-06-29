// eslint.config.js — ESLint 10 flat config.
// Rewritten to depend ONLY on installed plugins: the committed version imported
// `@eslint/eslintrc`, `@eslint/js`, and `globals`, none of which are installed
// (package.json is locked, so they cannot be added). See docs/ENGINEERING-NOTES.md.
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

// Inlined globals (the `globals` package is not installed).
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  HTMLSelectElement: 'readonly',
  Element: 'readonly',
}
const jestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  jest: 'readonly',
}

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.yarn/**',
      'templates/**',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs',
      'jest-setup.ts',
      'index.js',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...browserGlobals, ...jestGlobals },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    // Pin the version: `detect` triggers eslint-plugin-react's version probe, which
    // calls the removed `context.getFilename()` and crashes on ESLint 10.
    settings: { react: { version: '19.2.7' } },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // NOTE: eslint-plugin-react's full `recommended` set is omitted — several of its
      // rules use ESLint-≤9 context APIs removed in ESLint 10. Only the JSX-usage rules
      // (verified ESLint-10-safe) are enabled below.

      // SOLID / complexity guards (carried over from the original config).
      'react/react-in-jsx-scope': 'off',
      'no-console': 'off',
      camelcase: [
        'error',
        { properties: 'always', ignoreImports: true, ignoreDestructuring: true },
      ],
      'max-len': ['error', { code: 180, comments: 180, ignoreUrls: true }],
      'max-lines-per-function': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 3],
      'no-await-in-loop': 'warn',
      complexity: ['error', 10],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars

      // ------------------------------------------------------------------------
      // Signals are mandatory for React state in this repo. The
      // `eslint-plugin-signals` package on npm ships a Spanish-documented
      // Angular-style naming-convention rule (`finnish`) that conflicts with
      // Preact signals conventions (Preact uses unsuffixed names; Angular
      // uses a `$` suffix), so we enforce the contract with plain ESLint
      // rules that work for any rendering library:
      //
      //   1. `no-restricted-imports` bans `useState` and `useReducer` from
      //      `react`. They are the only React state hooks — any new code
      //      that reaches for them should be using a signal instead.
      //
      //   2. `no-restricted-syntax` bans the *bare* `signal(...)`,
      //      `computed(...)`, and `effect(...)` calls. Those primitives
      //      create a fresh reactive value on every call; in a component
      //      body that loses state on every render. Components must use the
      //      lifecycle-aware hooks `useSignal` / `useComputed` /
      //      `useSignalEffect`, or move the call to module scope.
      //
      // The selector matches `CallExpression[callee.name=...]`, so it also
      // applies in .tsx (where the JSX parser would otherwise dispatch
      // differently). The error message points developers at the canonical
      // example in `src/i18n/signals/locale-signal.ts`.
      // ------------------------------------------------------------------------
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useState', 'useReducer'],
              message:
                'React state hooks are banned. Use @preact/signals-react ' +
                'instead — see src/i18n/signals/locale-signal.ts for the pattern.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='signal'], " +
            "CallExpression[callee.name='computed'], " +
            "CallExpression[callee.name='effect']",
          message:
            'signal()/computed()/effect() create a fresh reactive value on ' +
            'every call. Inside a component body that loses state on every ' +
            'render. Use useSignal / useComputed / useSignalEffect from ' +
            '@preact/signals-react, or hoist the call to module scope.',
        },
      ],
    },
  },
  // Prettier last so it disables conflicting stylistic rules.
  prettierRecommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'prettier/prettier': 'error' },
  },
  {
    // Signal-definition modules are the ONLY legitimate place to call
    // bare `signal()` / `computed()` / `effect()`. Disabling the rule
    // here keeps module-scope calls clean while the rule still fires on
    // any signal creation inside a component or hook.
    files: ['src/**/signals/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]
