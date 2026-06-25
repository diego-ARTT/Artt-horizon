import { test } from '@playwright/test';
import { dismissPopups } from '../helpers.js';

/**
 * TEMPORARY diagnostic — prints what the staging store actually contains so we can
 * see why the purchase-path specs skip. Always passes. Delete once staging is seeded.
 */
test('diagnostic: report staging store shape', async ({ page }) => {
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  await dismissPopups(page);

  const shape = await page.evaluate(() => {
    const productLinks = [
      ...new Set(
        [...document.querySelectorAll('a[href*="/products/"]')].map(
          a => new URL(/** @type {HTMLAnchorElement} */ (a).href).pathname.split('?')[0]
        )
      ),
    ];
    const buttons = [...document.querySelectorAll('quick-add-component button')].map(b =>
      (b.textContent || '').trim()
    );
    return {
      collectionAllProductCount: productLinks.length,
      quickAddComponentCount: document.querySelectorAll('quick-add-component').length,
      quickAddButtonLabels: [...new Set(buttons)],
      chooseButtonCount: buttons.filter(t => /choose/i.test(t)).length,
      productCardCount: document.querySelectorAll('product-card').length,
      cardsWithSlideshow: document.querySelectorAll('product-card slideshow-component').length,
      sampleProductPaths: productLinks.slice(0, 5),
    };
  });

  // Probe the first few PDPs for variant counts.
  const variantReport = [];
  for (const path of shape.sampleProductPaths) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const variantCount = await page
      .locator('variant-picker input[type="radio"][data-variant-id]')
      .count();
    const slideCount = await page
      .locator('media-gallery slideshow-slide, media-gallery img')
      .count();
    variantReport.push({ path, variantCount, mediaCount: slideCount });
  }

  // eslint-disable-next-line no-console
  console.log('STAGING_SHAPE ' + JSON.stringify({ ...shape, variantReport }, null, 2));
});
