import { test, expect } from '@playwright/test';
import { dismissPopups } from '../helpers.js';

/**
 * Regression guard for issue #8 / PR #9.
 *
 * `<slideshow-component>` is lazy-loaded via a viewport IntersectionObserver, so product-card
 * hover handlers can run before it upgrades. Calling `.next()`/`.previous()`/`.select()` in
 * that window threw "is not a function". This blocks the deferred module to force the
 * un-upgraded state, then exercises the handlers and asserts nothing throws.
 *
 * NOTE: this FAILS on `main` until PR #9 is merged. Merge #9 first.
 */
test.describe('product-card slideshow upgrade guard (#8)', () => {
  test('hovering a card whose slideshow has not upgraded does not throw', async ({ page }) => {
    /** @type {string[]} */
    const fnErrors = [];
    page.on('console', m => {
      if (m.type() === 'error' && /is not a function/.test(m.text())) fnErrors.push(m.text());
    });
    page.on('pageerror', e => {
      if (/is not a function/.test(e.message)) fnErrors.push(e.message);
    });

    // Block only slideshow.js (not layered-slideshow.js) so the element never upgrades.
    await page.route(/\/slideshow\.js(\?|$)/, route => route.abort());
    await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
    await dismissPopups(page);

    const exercised = await page.evaluate(() => {
      const card = document.querySelector('product-card');
      const slideshow = card?.querySelector('slideshow-component');
      // Only meaningful while un-upgraded (no `.next` method yet).
      if (!card || !slideshow || typeof (/** @type {any} */ (slideshow).next) === 'function') {
        return false;
      }
      /** @type {any} */ (card).previewImage?.({ pointerType: 'mouse' });
      /** @type {any} */ (card).resetImage?.({ pointerType: 'mouse' });
      return true;
    });
    test.skip(!exercised, 'no un-upgraded product-card slideshow available to exercise');

    expect(fnErrors, fnErrors.join('\n')).toEqual([]);
  });
});
