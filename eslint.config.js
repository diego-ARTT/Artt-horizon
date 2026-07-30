import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        Shopify: 'readonly',
        Theme: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    // E2E tests run in Node (Playwright runner) but their page.evaluate() callbacks
    // run in the browser, so allow both global sets here.
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      '*.min.js',
      '**/*.min.js',
      'assets/popover-polyfill.js',
      'assets/qr-code-generator.js',
      'playwright-report/',
      'test-results/',
    ],
  },
];
