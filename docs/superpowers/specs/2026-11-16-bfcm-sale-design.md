# BFCM 2026 Sale — Design

**Date:** 2026-11-16 · **Status:** awaiting owner approval
**Store:** arttitudes.myshopify.com · **Theme repo:** artt-horizon (main = published theme)

## Intent

Run a storewide **30% off** BFCM sale from **now (Nov 16) through the end of Cyber Monday (Nov 30)**, shown as real strikethrough pricing on every product, and make it unmissable on the storefront with a black, loud homepage banner and the header marquee — in the brand fonts.

## Goals

- Every active product (187 products / 952 variants) sells at 30% off its **original** price, shown as compare-at strikethrough + sale badge on cards, PDP and cart.
- A BFCM banner leads the homepage; the header marquee announces the sale site-wide.
- Everything reverts cleanly when the sale ends, including the 110 products that were already marked down before BFCM.

## Non-goals

- No discount codes or automatic discounts (owner chose compare-at pricing).
- No new sale collection, email/Klaviyo campaign, or ads work in this scope.
- No changes to free-shipping rules.

## Anti-goals (failure even if it "works")

- Any price going **up** at launch.
- Stacking discounts so the strikethrough misrepresents the original price.
- Losing the pre-sale prices (no clean revert).
- A banner that reads well on desktop but breaks on phones (~90% of orders are mobile).

## Approaches

**Pricing — 30% of what?** (owner picked **A**)

- **A. 30% off the original price** ← chosen. Honest "30% off" everywhere, protects margin.
- B. Extra 30% off today's price — stacks to ~47–52% off on already-marked-down items.
- C. Skip already-marked-down items — not truly storewide.

**Pricing — how applied** (owner picked **script**)

- **Admin API script with snapshot + rollback** ← chosen. Reuses the proven SEO-pass pattern (`.claude/seo-audit/apply.py`), exact math, exact revert.
- CSV export/import — manual rounding, fragile revert.

**Banner + marquee** (owner picked **1**)

- **1. New BFCM hero section above the ICONS hero + enable marquee, shipped as a PR** ← chosen. Reviewable, revertible by git, ICONS hero untouched.
- 2. Repurpose the ICONS hero — loses the ICONS video during peak traffic; manual restore.
- 3. Duplicate theme + publish — fights the GitHub→published-theme sync.

## Pricing rules

For each variant of each active product, with `P` = current price and `C` = current compare-at (may be null):

1. `original = C if C > P else P`
2. `target = floor(original × 0.70)` (whole dollars, rounded **down** → always ≥30% off) — _my call; owner can ask for exact cents_
3. `new_price = min(P, target)` → never raises a price; items already past 30% off keep their price
4. `new_compare_at = original`
5. Skip the write if nothing changes.

Process: fetch live catalog (the Nov 13 snapshot is stale) → write timestamped **backup of every variant's price + compare-at** → dry-run diff report (counts, min/max discount %, any skipped/odd variants) → owner glances at it → apply via `productVariantsBulkUpdate` → re-fetch and verify every variant matches the plan.

Revert: restore price + compare-at for every variant from the backup, then verify. Products created or repriced by hand during the sale are reported, not blindly overwritten.

## Storefront

- **Homepage banner:** new `hero` section instance at the top of `templates/index.json`, above `hero_jVaWmY` (ICONS). Black background, white type. Headline "30% OFF EVERYTHING" in DM Sans Black (heading font), subline in Space Mono (body font) with the end date ("Black Friday through Cyber Monday · ends Nov 30"), one CTA "Shop the sale" → `/collections/all`. Mobile-first sizing; no video/image required. — _copy and link are my calls; owner can change_
- **Marquee:** enable `header_marquee_98qecc` in `sections/header-group.json`; replace the 4th of July copy with BFCM copy (e.g. "BLACK FRIDAY · 30% OFF EVERYTHING · ENDS CYBER MONDAY"), black background, white text, link to `/collections/all`.
- **Sale badge:** currently `#f5f5f5` (color4) — nearly invisible as a BFCM signal. Switch to black/white for the sale and revert after. — _my call_
- Built with existing Horizon sections/settings; no new Liquid unless the hero can't express the design.

## Launch & teardown

- **Launch (ASAP):** apply prices, then merge the theme PR to main (= live). Verify on the live storefront, phone width first: homepage banner, marquee, a collection grid, a PDP, cart.
- **End:** sale ends **Dec 1, 00:00 store time**. Revert PR for theme + price rollback script, run together, then verify live. Whether this runs by hand or on a scheduled job is decided in the plan.

## Constraints

- Merging to main deploys to production; never `theme push`.
- Customizer edits on the live theme during the sale can conflict with the GitHub sync — avoid touching homepage/header in the customizer until teardown.
- Admin API via `shopify store execute` (global CLI 4.9.4); theme dev via pinned `@shopify/cli@4.6.0`.

## Left to the builder

Exact hero settings/spacing, marquee speed, script structure, the verification checks, and the teardown mechanism.
