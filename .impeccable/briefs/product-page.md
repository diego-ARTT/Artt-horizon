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

- `custom.edition_quantity`: a list of single-line text (a sentence such as "…limited edition of 500 pieces…"). The first bare number in it is the run size; with no number, the placard hides the edition.
- `custom.artist` (single-line text; set on some products, e.g. the Caravaggio pieces): when set, it names the artist on the placard and heads the art story.
- `custom.about_the_art`: drives the art story section; with no value, the section renders nothing.

## Revision 2: the gallery wall (bolder)

References: ALD (desktop three columns; mobile always-pinned buy bar with size selection), Kith (Complete the look). The ALD layout is read through ARTT's own metaphor: the placard sits beside the work and the purchase on the other side.

- Desktop ≥990px: placard | photographs | purchase, with both side columns sticky.
- Mobile <750px: the bar is pinned from first paint and is the only buy box (size strip, Add to cart, wallet). Order below the gallery: head → purchase extras → body.
- Tablet 750–989px: Horizon's two columns, with the mobile order (head → purchase → body) so Add to cart sits above the fold. The Inbox launcher is hidden there as on mobile, and the chat link takes over.
- Square corners on this page only (DESIGN.md, The Square Wall Rule).
- Complete the look: complementary recommendations from Search & Discovery; hidden until curated.
- Horizon's scroll-triggered sticky add-to-cart is turned off on this template; the pinned bar replaces it.

## Live-store check after each deploy

The mobile bar depends on how three apps build their widgets. Each override is commented where it lives, but an app update can rename what it targets without warning. After each merge to main, open a product page on a phone (or at 390px) and check:

- The bar is 160px tall, with Add to cart and Buy with Shop side by side.
- The Dealeasy gift card shows in the page, not in the bar (`assets/pdp-layout.js`).
- Klaviyo's "10% off" tab sits on the bar's top edge, not on Add to cart (`[class*='kl-teaser-']`).
- Google's store widget is absent on the product page (`#google-merchantwidget-iframe-wrapper`).
- Tabbing through the page never puts focus under the bar or the header. The reCAPTCHA badge's own Privacy/Terms links are the known exception: they live in a pinned iframe.
