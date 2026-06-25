import { expect } from '@playwright/test';

/**
 * Storefront apps on the store (Klaviyo, etc.) render overlays that intercept clicks.
 * Dismiss any that are present so interactions don't flake.
 * @param {import('@playwright/test').Page} page
 */
export async function dismissPopups(page) {
  await page
    .evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (/no thanks|close|dismiss/i.test(b.textContent || '')) b.click();
      });
      document
        .querySelectorAll('[class*="kl-private"], .klaviyo-form, [data-testid="POPUP"]')
        .forEach(el => el.remove());
    })
    .catch(() => {});
}

/**
 * Records console errors that originate from the theme (not third-party app/CDN noise).
 * Returns a live array that accumulates as the page runs.
 * @param {import('@playwright/test').Page} page
 * @returns {string[]}
 */
export function collectThemeConsoleErrors(page) {
  /** @type {string[]} */
  const errors = [];
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const url = msg.location()?.url ?? '';
    // Ignore known third-party / preview-environment noise.
    const isThirdParty =
      /cdn\.shopify\.com\/extensions|klaviyo|tidio|dealeasy|selleasy|avada|pages\.dev|ERR_CONNECTION_REFUSED|Failed to load resource/i.test(
        `${text} ${url}`
      );
    if (!isThirdParty) errors.push(`${text}  @ ${url}`);
  });
  return errors;
}

/**
 * Finds a product detail page that has selectable variants (radio inputs with variant ids).
 * Data-resilient: walks the catalog rather than hardcoding handles/IDs.
 * @param {import('@playwright/test').Page} page
 * @param {string} [collectionPath]
 * @returns {Promise<string | null>} pathname of a multi-variant product, or null
 */
export async function findMultiVariantProductPath(page, collectionPath = '/collections/all') {
  await page.goto(collectionPath, { waitUntil: 'domcontentloaded' });
  const handles = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="/products/"]')]
      .map(a => new URL(/** @type {HTMLAnchorElement} */ (a).href).pathname.split('?')[0])
      .filter((p, i, arr) => arr.indexOf(p) === i)
      .slice(0, 12)
  );

  for (const path of handles) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const variantCount = await page
      .locator('variant-picker input[type="radio"][data-variant-id]')
      .count();
    if (variantCount > 1) return path;
  }
  return null;
}

/**
 * Asserts we landed on a real storefront page (not the password wall).
 * @param {import('@playwright/test').Page} page
 */
export async function expectNotPasswordWall(page) {
  expect(
    page.url(),
    'unexpectedly on the password page — check SHOPIFY_STOREFRONT_PASSWORD'
  ).not.toContain('/password');
}
