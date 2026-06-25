import { test, expect } from '@playwright/test';
import { dismissPopups, findMultiVariantProductPath } from '../helpers.js';

test.describe('variant cart-gate (#6)', () => {
  test('selecting a variant then immediately adding to cart adds the selected variant', async ({
    page,
  }) => {
    const productPath = await findMultiVariantProductPath(page);
    test.skip(!productPath, 'no multi-variant product found on this store');

    await page.goto(/** @type {string} */ (productPath));
    await dismissPopups(page);

    // Resolve a non-default, in-stock variant to target, and clear the cart first.
    const targetVariant = await page.evaluate(async () => {
      await fetch('/cart/clear.js', { method: 'POST' });
      const radios = [
        ...document.querySelectorAll('variant-picker input[type="radio"][data-variant-id]'),
      ];
      const checked = radios.findIndex(r => /** @type {HTMLInputElement} */ (r).checked);
      const target =
        radios.find((r, i) => i !== checked && !(/** @type {HTMLInputElement} */ (r).disabled)) ||
        radios[0];
      return /** @type {HTMLElement} */ (target)?.dataset.variantId ?? null;
    });
    test.skip(!targetVariant, 'could not resolve a target variant');

    // The race: select the variant, then click Add to cart in the same synchronous burst —
    // before the section refresh settles. The queued add must use the selected variant.
    const result = await page.evaluate(async targetVariantId => {
      const radios = [
        ...document.querySelectorAll('variant-picker input[type="radio"][data-variant-id]'),
      ];
      const target = radios.find(
        r => /** @type {HTMLElement} */ (r).dataset.variantId === targetVariantId
      );
      const label =
        document.querySelector(`label[for="${/** @type {HTMLElement} */ (target).id}"]`) ||
        /** @type {HTMLElement} */ (target).closest('label');
      const atc =
        document.querySelector('product-form-component button[name="add"]') ||
        [...document.querySelectorAll('product-form-component button')].find(b =>
          /add/i.test(b.textContent || '')
        );

      /** @type {HTMLElement} */ (label || target).click();
      /** @type {HTMLElement | null} */ (atc)?.click();

      let cart = null;
      const start = Date.now();
      while (Date.now() - start < 12_000) {
        await new Promise(r => setTimeout(r, 400));
        cart = await fetch('/cart.js')
          .then(r => r.json())
          .catch(() => null);
        if (cart && cart.item_count > 0) break;
      }
      return {
        itemCount: cart?.item_count ?? 0,
        variantIds: (cart?.items ?? []).map(i => String(i.variant_id)),
      };
    }, targetVariant);

    expect(result.itemCount, 'an item should be in the cart').toBeGreaterThan(0);
    expect(result.variantIds, 'the selected variant should be the one added').toContain(
      targetVariant
    );
  });
});
