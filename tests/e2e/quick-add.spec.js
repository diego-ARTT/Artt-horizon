import { test, expect } from '@playwright/test';
import { dismissPopups, collectThemeConsoleErrors, gotoStable } from '../helpers.js';

test.describe('quick-add (#3/#4)', () => {
  test('quick-add modal opens, upgrades media-gallery, and throws no theme errors', async ({
    page,
  }) => {
    const errors = collectThemeConsoleErrors(page);

    await gotoStable(page, '/collections/all');
    await dismissPopups(page);

    // A "Choose" quick-add button => a multi-variant product (opens the variant-picker modal).
    const choose = page.locator('quick-add-component button', { hasText: /choose/i }).first();
    test.skip((await choose.count()) === 0, 'no multi-variant quick-add product on this store');

    await choose.scrollIntoViewIfNeeded();
    await dismissPopups(page);
    await choose.click();

    const content = page.locator('#quick-add-modal-content');
    await expect(content.locator('variant-picker')).toBeVisible({ timeout: 15_000 });

    // #3: when the injected product markup contains a <media-gallery>, the deferred
    // custom element must be imported/upgraded (otherwise variant media goes stale).
    const media = await page.evaluate(() => ({
      present: !!document.querySelector('#quick-add-modal-content media-gallery'),
      upgraded: !!customElements.get('media-gallery'),
    }));
    if (media.present) {
      expect(media.upgraded, 'media-gallery should upgrade inside the quick-add modal').toBe(true);
    }

    expect(errors, `theme console errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
