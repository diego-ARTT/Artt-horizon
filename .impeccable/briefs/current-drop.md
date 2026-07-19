# Design Brief: Current Drop Section

**Target surface:** Homepage. New section, lands directly after the hero, before the seasonal product carousel (`product_list_CYHNbA`).
**Drop anchor:** Seven Deadly Sins.
**Anchors:** PRODUCT.md (brand register, name names, scarcity is structural), DESIGN.md (Wearable Gallery, monochrome by doctrine, mono carries metadata).
**Visual probes:** Skipped (no native image gen in this harness). Lane chosen from DESIGN.md.

## 1. Feature Summary

A full-bleed, artwork-led section that surfaces the _current drop_ on the homepage. It exists so a first-time visitor learns within one scroll that Arttitude releases named, dated, edition-numbered drops created with named artists — and so a returning collector can spot the active release without hunting through the menu. The artwork carries the visual weight; mono captions name the drop, edition count, artist, and release date. One CTA into the drop's collection.

## 2. Primary User Action

**See the work and click into the drop's collection.** A visitor lands here, the artwork stops them, the metadata answers "what is this and why does it matter," and the CTA takes them to the full drop. Secondary action (recede behind primary): "View artist" link to a separate artist page if one exists; cut if it doesn't.

## 3. Design Direction

**Color strategy:** Restrained (continues the project default). The artwork is the saturated color; the UI stays monochrome. _The Art Carries the Color Rule_ from DESIGN.md applies here without exception.

**Scene sentence:** A collector lingers in front of a fine-art print on a gallery wall under cold museum lighting, reads the small typewritten placard beside it, and decides whether to buy.

**Anchor references:**

- **CdG storefront product pages** — full-bleed photography, mono captions, no chrome competing with the image.
- **Off-White product pages, ~2017–2019 era** — the heavy display headline + small mono metadata pairing, dropped onto large imagery without decorative scaffolding.
- **A museum exhibition placard** — the actual physical thing. Title, artist, year, medium, edition. Set on the wall beside the work. That's the rhythm of the copy stack.

No serif. No gradient. No drop-shadow on the image. No "soft" corner radius on the artwork.

**Per-surface override of DESIGN.md:** none. Stays within the system.

## 4. Scope

- **Fidelity:** Production-ready.
- **Breadth:** One section. Drops into `templates/index.json` between `hero_jVaWmY` and `product_list_CYHNbA`.
- **Interactivity:** Static content section. CTA links to the collection page. No carousel, no autoplay, no scroll-driven motion in MVP.
- **Time intent:** Ship.
- **Implementation route:** Repurpose Horizon's existing `sections/media-with-content.liquid` if its block schema can carry the typography precisely. If it can't (e.g. forces a card affordance, can't hit edge-to-edge media with metadata stack at exact h1/h6 presets, can't render the four-line caption stack), build a new `sections/current-drop.liquid` modeled on `media-with-content` but constrained to the drop-card schema below. **Decision deferred to craft phase**, where the actual schema needs evaluation against the visual requirements below.

## 5. Layout Strategy

**Desktop (≥960px):** Two-column, full-width section (escapes the 90rem page-width). Left ~58% of viewport is the artwork at edge-to-edge full bleed (no padding, no radius). Right ~42% is a Canvas (white) panel with the metadata stack vertically centered, ample left padding (`--padding-6xl`, 4rem). On `Canvas Graphite` scheme if we want night-mode drop reveal energy; default to `Canvas` (white) so the section reads as gallery wall and the artwork against it.

**Tablet (640–960px):** Stack. Artwork on top at full-bleed, metadata block below on Canvas with `--padding-4xl` block padding. Same caption stack.

**Mobile (<640px):** Stack. Artwork at aspect 4:5 (taller, garment-shaped) at edge-to-edge. Metadata block below with `--padding-2xl` inline padding.

**Section height:** Desktop: `--section-height-large` (80svh) — committed but not maxed. Tablet/mobile: `auto` so the stack determines height.

**The metadata stack, in vertical order:**

1. **Meta line** (Space Mono 0.75rem tracked, `var(--font-h6--*)` preset, ink-muted): `DROP 04 · LIVE` (or `DROP 04 · PRESALE` / `DROP 04 · SOLD OUT` per state)
2. **Drop name** (DM Sans 900, h1 preset, ink): `Seven Deadly Sins`
3. **Hairline rule** (1px ink-muted, 4rem wide, left-aligned)
4. **Caption block** (Space Mono 0.875rem, body preset, ink-muted), three lines:
   - `Artist · [Artist Name]`
   - `Edition · [n / total]` (e.g. `1 of 80`, or `Sold out` when state demands)
   - `Released · [Month Day, Year]` (or `Releases [date]` for presale)
5. **Spacer** (`--gap-2xl`)
6. **CTA** — primary button: `See the drop` → `shopify://collections/seven-deadly-sins`

Negative space is the brand. Do not pack.

## 6. Key States

The section is data-driven by theme settings (drop name, artist, edition, date, status). The merchant flips state via a setting; the section renders accordingly.

**Live (default):**

- Meta line: `DROP NN · LIVE`
- Caption: artist, edition (`1 of 80` or `42 of 80` depending on remaining stock), released date
- CTA: `See the drop` → collection page

**Presale / Upcoming:**

- Meta line: `DROP NN · PRESALE` or `DROP NN · OPENS [date]`
- Caption: artist, edition total only (no `n of total`), `Releases [date]`
- CTA: `Get drop access` (links to email-capture page or directly to a Klaviyo signup; defer to merchant)
- Artwork stays at full quality. No "coming soon" overlay. The scarcity language is the announcement.

**Sold out:**

- Meta line: `DROP NN · SOLD OUT`
- Caption: artist, `Edition · Sold out`, released date
- CTA: `See the archive` → collection page (which now shows sold-out variants)
- Artwork stays full quality. No `SOLD OUT` watermark across the image.

**Between drops (no current drop set in theme editor):**

- Section does not render. Theme editor setting `drop_status: "hidden"` removes it from the page entirely. No empty-state placeholder ships.
- Document this in the section schema with help text: _"Set status to Hidden between drops. The section will not render."_

**Edge cases:**

- **Long drop name** ("The Seven Deadly Sins of Modern Streetwear" — 47 chars): `text-wrap: balance` on the h1, max-width `--max-width--display-normal` (13em). If it wraps to 3 lines on desktop, accept; the layout has the vertical room.
- **No artist** (drop is "house"): caption line reads `Artist · Arttitude Studio`. Never omit the row; the structure is the brand voice.
- **Reduced motion**: nothing animates here in MVP. n/a.

## 7. Interaction Model

- **Entry**: scroll past the hero. Section enters viewport, artwork is already loaded (eager `loading="eager"`, `fetchpriority="high"` since it's the second LCP candidate).
- **Default state**: static. No autoplay, no scroll-triggered reveal, no parallax on the artwork. The composition itself is the impact.
- **CTA click**: navigates to the collection page. Standard transition (Horizon's `page_transition_enabled` setting carries through).
- **CTA hover**: per DESIGN.md primary button — bg shifts from ink to Canvas Graphite (`#333`) over 125ms. No bounce, no scale.
- **Artwork**: not interactive. No hover state. The image is a museum print, not a clickable thumbnail.
- **Keyboard / a11y**: section is a `<section>` with `aria-labelledby` pointing at the h1 (the drop name). CTA is a real `<a>` (button-styled) with the destination URL. Tab order: CTA only; nothing else in the section accepts focus.

## 8. Content Requirements

**Static labels (in section schema, editable per locale):**

- Status prefix: `DROP`
- Status suffix per state: `LIVE` / `PRESALE` / `OPENS` / `SOLD OUT`
- Caption labels: `Artist` / `Edition` / `Released` / `Releases` (presale variant)
- CTA per state: `See the drop` / `Get drop access` / `See the archive`

**Dynamic content (merchant-editable per drop):**

- Drop number (string, e.g. `04`)
- Drop name (string, ≤48 chars recommended; theme-editor warning at 48+)
- Artist name (string; one line; if multiple artists, comma-separated)
- Edition total (integer; appears in caption as `1 of TOTAL`)
- Edition current (integer or null; null hides the `n of` prefix and shows `TOTAL only` for presale)
- Release date (date)
- Status (select: `live` / `presale` / `sold_out` / `hidden`)
- Collection link (collection picker; defaults to the drop's collection)
- Artwork (image; required; recommend 16:10 desktop, 4:5 mobile; theme-editor help text: _"The artwork printed on the drop, the original painting, or a campaign still. Not a product photograph; that goes in the carousel below."_)

**Voice notes for merchant copy:**

- Drop name in title case ("Seven Deadly Sins"), not all caps. DM Sans 900 carries the weight; uppercase is reserved for meta.
- Artist name as the artist prefers it (full name, mononym, studio name). No "by" prefix; the `Artist · ` label does the work.
- Released date as `Month Day, Year` (`March 14, 2026`). Mono numerals make the format read clean.
- Never write "limited time," "while supplies last," "hurry," "don't miss out." Per PRODUCT.md: scarcity is structural. The edition number is the scarcity.

**Image roles required:**

- One drop artwork per drop (merchant-supplied real asset). The brief assumes a real artwork is available for _Seven Deadly Sins_. If not, craft phase should accept a placeholder asset but flag the slot as "real artwork required before publish."

## 9. Recommended References

When the user runs `/impeccable craft current-drop` against this brief, the implementation should also load:

- **`reference/typeset.md`** — the caption stack lives or dies on type contrast (h1 vs meta vs body); typeset's rules carry over.
- **`reference/layout.md`** — the two-column / stack responsive behavior, hairline rule placement, padding scale across breakpoints.
- **`reference/harden.md`** — states, edge cases, empty/hidden behavior, alt text rules, fetchpriority on the artwork.
- **`reference/brand.md`** — the image-led brief warnings (full-bleed photography expected; do not ship a colored block instead).

## 10. Open Questions

None. Everything ambiguous in discovery was decided in the brief. The one item worth flagging for the merchant (not for the brief itself):

- **Drop status is merchant-managed via theme editor.** The brief does not automate detection from Shopify metafields, inventory levels, or product tags. That can be a follow-up if a future drop needs the status to flip automatically (e.g. inventory hits zero → status flips to `sold_out` without manual editor action). For MVP, the merchant flips it.

---

## Hand-off

Confirm this brief and the next step is `/impeccable craft current-drop` — which will:

1. Decide between repurposing `sections/media-with-content.liquid` vs writing a new `sections/current-drop.liquid`
2. Build the section with schema, Liquid markup, scoped CSS, and the four state branches
3. Add the section to `templates/index.json` directly after the hero
4. Verify type rhythm and contrast across all four states
5. Commit per the per-action rule

If the brief is wrong anywhere — wrong drop, wrong position, wrong lane, wrong CTA, wrong states — say where and we revise here before craft starts.
