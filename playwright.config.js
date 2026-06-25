import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the Horizon theme.
 *
 * The `webServer` below launches `shopify theme dev` against the staging store and
 * waits for the local preview at http://127.0.0.1:9292. Auth is provided via env:
 *   - SHOPIFY_FLAG_STORE          your-staging-store.myshopify.com
 *   - SHOPIFY_CLI_THEME_TOKEN     Theme Access token (shptka_…) — read by the CLI
 *   - SHOPIFY_STOREFRONT_PASSWORD storefront "Restrict access" password (used by global-setup)
 *
 * See tests/README.md for local + CI setup.
 */

const PORT = Number(process.env.THEME_DEV_PORT ?? 9292);
export const BASE_URL = `http://127.0.0.1:${PORT}`;
export const STORAGE_STATE = 'tests/.auth/state.json';

const store = process.env.SHOPIFY_FLAG_STORE;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/global-setup.js',
  // theme dev serves a single shared preview, so keep runs serial and deterministic.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE_URL,
    storageState: STORAGE_STATE,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The CLI reads SHOPIFY_CLI_THEME_TOKEN from the environment for headless auth.
    command: `npx shopify theme dev --store=${store ?? ''} --port=${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
