// Minimal ESLint flat config for @privaforge/encryption.
// TypeScript type-checking is handled by tsc; this config enforces style rules.
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
];
