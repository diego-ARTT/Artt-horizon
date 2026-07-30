import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { BASE_URL, STORAGE_STATE } from '../playwright.config.js';

/**
 * Authenticates past the staging store's "Restrict access" password page once, then
 * persists the session (the `storefront_digest` cookie) to STORAGE_STATE so every test
 * reuses it. If the preview isn't password-protected, this is a no-op that still writes
 * an empty state file.
 *
 * @param {import('@playwright/test').FullConfig} _config
 */
export default async function globalSetup(_config) {
  const password = process.env.SHOPIFY_STOREFRONT_PASSWORD;

  await mkdir(dirname(STORAGE_STATE), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const onPasswordWall =
      page.url().includes('/password') ||
      (await page.locator('input[name="password"]').count()) > 0;

    if (onPasswordWall) {
      if (!password) {
        throw new Error(
          'Storefront is password-protected but SHOPIFY_STOREFRONT_PASSWORD is not set. ' +
            'Set it (Online Store → Preferences → Restrict access) or disable password protection.'
        );
      }
      await page.goto(`${BASE_URL}/password`, { waitUntil: 'domcontentloaded' });
      await page.fill('input[name="password"]', password);
      await Promise.all([
        page.waitForURL(url => !url.pathname.replace(/\/$/, '').endsWith('/password'), {
          timeout: 30_000,
        }),
        page.click('button[type="submit"], input[type="submit"], [type="submit"]'),
      ]);
    }

    await context.storageState({ path: STORAGE_STATE });
  } finally {
    await browser.close();
  }
}
