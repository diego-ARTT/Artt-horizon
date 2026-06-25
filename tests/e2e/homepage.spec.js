import { test, expect } from '@playwright/test';
import { dismissPopups, expectNotPasswordWall } from '../helpers.js';

test.describe('homepage gender tiles (#7)', () => {
  test('each full-card link matches its visible button label', async ({ page }) => {
    await page.goto('/');
    await expectNotPasswordWall(page);
    await dismissPopups(page);

    const tiles = await page.evaluate(() =>
      [...document.querySelectorAll('a.group-block__link')].map(a => {
        const container = a.parentElement;
        const buttons = [...(container?.querySelectorAll('a[href*="/collections/"]') || [])]
          .map(l => ({
            text: (l.textContent || '').trim(),
            href: new URL(/** @type {HTMLAnchorElement} */ (l).href).pathname,
          }))
          .filter(l => l.text);
        return {
          cardHref: new URL(/** @type {HTMLAnchorElement} */ (a).href).pathname,
          buttons,
        };
      })
    );

    test.skip(tiles.length < 2, 'gender tile section not present on this store');

    for (const tile of tiles) {
      for (const btn of tile.buttons) {
        expect(btn.href, `button "${btn.text}" should match its full-card link`).toBe(
          tile.cardHref
        );
      }
    }
  });

  test('clicking the Menswear tile navigates to the men collection', async ({ page }) => {
    await page.goto('/');
    await dismissPopups(page);

    const menswear = page.locator('a.group-block__link[href$="/collections/man"]').first();
    test.skip((await menswear.count()) === 0, 'no menswear tile on this store');

    await menswear.click();
    await expect(page).toHaveURL(/\/collections\/man(\b|\/|$)/);
  });
});
