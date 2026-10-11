import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Pure logic: mappers, formatters, API client, design tokens, small hooks.
const unitTests = [
  'src/**/lib/**/*.test.{ts,tsx}',
  'src/**/*.unit.test.{ts,tsx}',
  'src/shared/api/**/*.test.{ts,tsx}',
  'src/shared/design/**/*.test.{ts,tsx}',
  'src/shared/hooks/**/*.test.{ts,tsx}',
  'tests/unit/**/*.test.{ts,tsx}',
];

// Feature-level tests: components plus hooks that talk to SWR/MSW.
const integrationTests = [
  'src/**/*.int.test.{ts,tsx}',
  'src/features/*/*.test.{ts,tsx}',
  'src/features/*/hooks/**/*.test.{ts,tsx}',
  'src/shared/ui/**/*.test.{ts,tsx}',
];

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    projects: [
      {
        test: {
          name: 'unit',
          include: unitTests,
          exclude: integrationTests,
        },
      },
      {
        test: {
          name: 'integration',
          include: integrationTests,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/__mocks__/**',
        'src/shared/api/mockEnvelope.ts',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/not-found.tsx',
        'src/app/**/error.tsx',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        statements: 60,
        branches: 50,
        'src/**/lib/**': { lines: 85, functions: 85, statements: 85, branches: 75 },
        'src/shared/api/**': { lines: 85, functions: 85, statements: 85, branches: 75 },
        'src/shared/design/**': { lines: 85, functions: 85, statements: 85, branches: 75 },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
