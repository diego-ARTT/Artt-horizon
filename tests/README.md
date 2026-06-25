# E2E tests

Playwright smoke tests that drive a live `shopify theme dev` preview of the **staging**
store. They defend the purchase path (quick-add, variant changes, add-to-cart) and a few
regression guards. Written data-resiliently — they discover products at runtime rather than
hardcoding IDs, and `test.skip()` when a store lacks the data a test needs.

## What runs

| Spec                             | Guards                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `e2e/homepage.spec.js`           | Homepage gender tiles — full-card links match their button labels (#7)           |
| `e2e/quick-add.spec.js`          | Quick-add modal opens, `media-gallery` upgrades, no theme console errors (#3/#4) |
| `e2e/variant-cart.spec.js`       | Select variant → immediate add-to-cart adds the **selected** variant (#6)        |
| `e2e/product-card-hover.spec.js` | Hover before slideshow upgrades doesn't throw (#8 — **needs PR #9 merged**)      |

## Required secrets / env

| Name                          | What it is                                                                                            | Where to get it                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `SHOPIFY_FLAG_STORE`          | `your-staging-store.myshopify.com`                                                                    | Partner dashboard → your dev store                   |
| `SHOPIFY_CLI_THEME_TOKEN`     | Theme Access token (`shptka_…`) for headless `theme dev`                                              | Install the **Theme Access** app → "Create password" |
| `SHOPIFY_STOREFRONT_PASSWORD` | Storefront "Restrict access" password — unlocks `theme dev` (`--store-password`) and the preview wall | Online Store → Preferences → Restrict access         |

In CI these are GitHub **repository secrets** (Settings → Secrets and variables → Actions).

## Run locally

```bash
npm ci
npx playwright install chromium

export SHOPIFY_FLAG_STORE=your-staging-store.myshopify.com
export SHOPIFY_CLI_THEME_TOKEN=shptka_xxx
export SHOPIFY_STOREFRONT_PASSWORD=yourpassword

npm run test:e2e          # headless
npm run test:e2e:ui       # interactive UI mode
npm run test:e2e:report   # open the last HTML report
```

`playwright.config.js` launches `shopify theme dev` automatically (the `webServer` block)
and waits for `http://127.0.0.1:9292`. `tests/global-setup.js` logs in past the storefront
password once and saves the session to `tests/.auth/state.json` (gitignored). If you already
have `shopify theme dev` running locally, the config reuses it (outside CI).

## Notes

- Tests target the **staging** store only — they clear the cart and add items, which you do
  not want against the live shop.
- Third-party app console noise (Klaviyo, Tidio, etc.) is filtered; only theme-originated
  errors fail a test.
- `product-card-hover.spec.js` fails on `main` until **PR #9** (issue #8 fix) is merged.
