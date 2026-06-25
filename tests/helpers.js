import { expect } from '@playwright/test';

/**
 * `shopify theme dev` compiles pages on first hit and can drop/abort the first request
 * for a route (seen as net::ERR_ABORTED), especially right after startup. Retry the
 * navigation a few times so cold-start flakiness doesn't fail a run.
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @param {{ tries?: number }} [opts]
 */
export async function gotoStable(page, path, opts = {}) {
  const tries = opts.tries ?? 4;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      // theme dev sometimes returns a transient 5xx while warming up — retry those too.
      if (res && res.status() >= 500) throw new Error(`status ${res.status()}`);
      return res;
    } catch (err) {
      lastErr = err;
      await page.waitForTimeout(1500 * (i + 1));
    }
  }
  throw lastErr;
}

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
  await gotoStable(page, collectionPath);
  const handles = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="/products/"]')]
      .map(a => new URL(/** @type {HTMLAnchorElement} */ (a).href).pathname.split('?')[0])
      .filter((p, i, arr) => arr.indexOf(p) === i)
      .slice(0, 12)
  );

  for (const path of handles) {
    await gotoStable(page, path);
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
