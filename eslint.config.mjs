import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import playwright from 'eslint-plugin-playwright';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    name: 'project/type-aware',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    name: 'project/plugins',
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    plugins: {
      import: importPlugin,
      react: reactPlugin,
    },
    rules: {
      'import/no-cycle': 'error',
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
      'react/jsx-no-useless-fragment': 'error',
    },
  },

  {
    name: 'project/recommended',
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'max-lines': ['warn', 200],
      complexity: ['warn', 10],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'next/middleware', message: 'middleware.ts is gone; use proxy.ts.' },
            { name: 'next/legacy/image', message: 'Use next/image only.' },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='unstable_cache']",
          message: 'unstable_cache is removed; use cacheTag/cacheLife with use cache.',
        },
      ],
      'jsx-a11y/anchor-is-valid': 'off',
    },
  },

  {
    name: 'project/no-persian',
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/i18n/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u0600-\\u06FF]/]',
          message:
            'Persian UI copy only in src/shared/i18n/fa.ts. Depending on the parse stage, node scripts/check-no-persian.mjs instead.',
        },
      ],
    },
  },

  {
    name: 'project/vitest',
    files: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    ...vitest.configs.recommended,
  },
  {
    name: 'project/testing-library',
    files: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    name: 'project/playwright',
    files: ['tests/e2e/**/*.{ts,tsx}'],
    ...playwright.configs['flat/recommended'],
  },

  {
    name: 'project/scripts',
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'playwright-report/**',
    'docs/**',
    'visuals/**',
  ]),
  prettier,
]);

export default eslintConfig;
