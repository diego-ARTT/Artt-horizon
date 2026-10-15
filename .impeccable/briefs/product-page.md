# Design Brief: Product Page

**Target surface:** `templates/product.json` (all products).
**Mode:** Persuade. The visitor decides and buys; the art behind the garment is the argument.
**Anchors:** PRODUCT.md (name names, scarcity is structural), DESIGN.md (Wearable Gallery, mono carries metadata, flat by doctrine), `.impeccable/briefs/current-drop.md` (museum-placard caption rhythm).

## Scene

A collector who arrived from a drop post holds a phone, sees the print, and needs three answers before committing: whose art is this, how many exist, what does it cost. Everything else can wait below the fold.

## Structure

1. **Buy box.** Title, then the **placard** (artist / edition size / sold out, mono 12px, tracked 0.13em), then price, stars, variants, add to cart. App widgets stay where the apps put them.
2. **Below the buy box.** Description and Shipping & Returns stay in the accordion. The icon trust row becomes a **spec list**: mono label/value rows with hairline rules, no icons. "As seen on" press logos close the column as a credit line instead of interrupting the purchase.
3. **Art story section.** A detail crop of the product's own photograph (zoomed into the print), beside `custom.about_the_art` and the edition statement as the placard. Sits on Canvas Haze. This is the one motion moment: the crop tightens as it scrolls in (scroll-driven, off under reduced motion).
4. Then upsell → reviews → recommendations. The News blog feed is removed: an editorial blog feed on a product page splits attention at the moment of decision.

## Data contract

- `custom.edition_quantity`: free text today; the first bare number in it is the run size. With no number, the placard hides the edition.
- `custom.artist` (optional, not yet defined): when set, it names the artist on the placard and heads the art story.
- `custom.about_the_art`: drives the art story section; with no value, the section renders nothing.
