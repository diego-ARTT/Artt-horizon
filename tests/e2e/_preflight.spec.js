import { test, expect } from '@playwright/test';
import { dismissPopups, expectNotPasswordWall } from '../helpers.js';

/**
 * Preflight: fail loudly (rather than letting every spec silently `test.skip()`) when the
 * staging store isn't seeded with the data the suite needs. This keeps a green run honest —
 * it can only pass if the purchase path was actually exercisable.
 *
 * Runs first (filename sorts ahead of the others).
 */
test('preflight: staging store is seeded for the purchase-path suite', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  await expectNotPasswordWall(page);
  await dismissPopups(page);

  const productPaths = await page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll('a[href*="/products/"]')].map(
        a => new URL(/** @type {HTMLAnchorElement} */ (a).href).pathname.split('?')[0]
      )
    ),
  ]);

  expect(
    productPaths.length,
    'No products on /collections/all. Publish products to the Online Store sales channel ' +
      '(Active, not Draft) on the staging store. See tests/README.md.'
  ).toBeGreaterThan(0);

  // At least one multi-variant product is required for the quick-add / variant-cart specs.
  let multiVariant = 0;
  for (const path of productPaths.slice(0, 8)) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const count = await page.locator('variant-picker input[type="radio"][data-variant-id]').count();
    if (count > 1) multiVariant++;
  }

  expect(
    multiVariant,
    'No multi-variant product found in the first 8 products. The quick-add and variant-cart ' +
      'specs need at least one product with multiple variant options.'
  ).toBeGreaterThan(0);
});
