# Design Brief: As Featured On — Press Pull-Quotes

**Target surface:** Homepage (after `product_list_CYHNbA`, before `hero_ti6TLC`) and `/pages/press` (above the existing `press_kit` section).
**Anchors:** PRODUCT.md (brand register, name names, credibility is earned), DESIGN.md (Wearable Gallery, monochrome by doctrine, mono carries metadata, no eyebrow reflex).
**Visual probes:** Skipped (no native image gen in this harness). Lane chosen from DESIGN.md.
**Status:** Shaping. Implementation route resolved — adapt existing section, do not build new.

## 1. Feature Summary

A press pull-quote carousel that lets a first-time visitor borrow someone else's judgement. Arttitude sells limited-edition art on garments at a price that asks for trust, and a visitor two scrolls into the homepage has no reason yet to extend it. Four editorial outlets saying the work matters does what our own copy cannot. The quotes are set as type, not logos — monochrome, gallery-placard rhythm, the outlet named the same way we name an artist.

This is **not a new build.** `sections/media-quote-carousel.liquid` already exists (647 lines, three commits, last touched at `19075e0`), is structurally sound, and has never been placed on a template. The work is finishing and placing it.

## 2. Primary User Action

**Read one quote, register the outlet, keep scrolling with more confidence.** This is a trust component, not a destination — there is no conversion event here. Success is a visitor who does not bounce at the price. Secondary action (recede hard behind primary): follow a quote to its source article, for the small number of readers who want to verify. The existing `cta_label` / `cta_url` block fields carry this; leave them empty on slides with no linkable source.

## 3. Design Direction

**Color strategy:** Restrained. UI stays monochrome; there is no artwork in this section to carry color, so the section is pure type on canvas. _The Art Carries the Color Rule_ means the absence of art here is an argument for **more** restraint, not for decorative compensation.

**Scene sentence:** A visitor reads the small framed press clipping mounted beside a gallery's entrance — four sentences, four mastheads, set in plain type on white — and walks in.

**Anchor references:**

- **A gallery's press wall** — the physical thing. Clippings under glass, no ornament, the masthead doing the work.
- **Exhibition catalogue endpapers** — where critical quotes are set as running type with the source in small caps beneath, never as logo lockups.
- **CdG / Off-White press pages, ~2017–2019** — quote as the largest type on the surface, attribution demoted to mono metadata.

Anti-references: the SaaS "as seen in" logo bar (grey wordmarks in a row), star ratings, review-widget chrome, quotation-mark glyphs used as decorative graphics at 200px.

**Per-surface override of DESIGN.md:** none. One amendment is **required** to DESIGN.md itself — see §10.

## 4. Scope

- **Fidelity:** Production-ready.
- **Breadth:** One existing section, finished and placed on two templates. No new section file.
- **Interactivity:** Manual carousel. Scroll-snap, drag, arrows, keyboard. **No autoplay** — `enable_autoplay` already defaults to `false` and stays there.
- **Time intent:** Ship.
- **Implementation route:** **Adapt `sections/media-quote-carousel.liquid`.** It already reuses Horizon's native `slideshow-slide` / `slideshow-controls` primitives, carries `role="region"`, `aria-roledescription="carousel"`, `aria-live`, and a `prefers-reduced-motion` branch. Building new would discard working accessible markup. Three defects to correct before placing it — see §7.

## 5. Layout Strategy

**Desktop (≥960px):** Page-width (90rem cap, `section_width: page-width`). One quote visible at a time, centred, occupying roughly the middle 60% of the column so the line length lands at 45–60ch. Generous vertical air — the section should feel underfilled. Dots below, arrows flanking at the column edges.

**Tablet (640–960px):** Same single-slide model, quote spans ~80% of column.

**Mobile (<640px):** Single slide, full column inside `--padding-2xl` inline padding. Arrows hidden; dots and swipe carry navigation. Quote size steps down via the existing `clamp()`.

**Section height:** `auto` on every breakpoint. The longest quote sets it. Do not pin a `svh` height — a fixed height with variable quote lengths produces ragged vertical centring across slides.

**The slide stack, in vertical order:**

1. **Section eyebrow** (DM Sans 500, `Label` preset / `<h5>`, 0.875rem, letter-spacing 0.06em, ink-muted): `AS FEATURED ON`
2. **Spacer** (`--gap-3xl`)
3. **Quote** (DM Sans **900**, `--quote-font-size`, line-height 1.15, ink): the pull-quote in curly double quotes
4. **Spacer** (`--gap-xl`)
5. **Outlet** (Space Mono 400, `Meta` preset, 0.75rem, letter-spacing 0.13em, uppercase, ink-muted): `THE RITZ HERALD`
6. **Source link** (optional, Space Mono, `Meta`, underlined on hover only): `Read the piece →`
7. **Spacer** (`--gap-3xl`)
8. **Controls** — dots, and arrows on ≥640px

The eyebrow is deliberate and is the section's **one** sanctioned brand eyebrow. See §10 for why this does not reopen the No Eyebrow Reflex Rule.

## 6. Key States

**Default (4 slides):** First slide active, dots showing 4, arrows enabled both directions (wrapping).

**Single slide (merchant deletes blocks):** `has_multiple` is already false in that case — suppress dots and arrows entirely and render as a static quote. Already handled; verify after the type changes.

**Zero slides:** Section renders nothing on the storefront and shows the existing `media_quote_carousel_placeholder` string in the theme editor. Already handled.

**Reduced motion:** `scroll-behavior: auto`, snap still active. Already implemented at line 372.

**Keyboard:** Arrow keys move slides when the region has focus; dots are real buttons with `aria-selected`. Inherited from `slideshow-controls`; needs a verification pass, not a rebuild.

**Long quote:** The Modern Luxury line is one clause and short; Daily Front Row's was the longest and is now cut. Cap the rendered quote at ~180 characters in the schema `info` text so a merchant does not paste a paragraph.

## 7. Defects To Fix Before Placing

1. **`font-weight: 600` on `.media-quote-carousel__quote-text` (line 265).** Violates the Heavy Headlines Rule — display and headline type run at 900. Change to `900`. This is the single most visible fix; at 600 the quote reads as a testimonial widget, at 900 it reads as ARTT.
2. **Attribution typeface unresolved.** The section does not currently set a family on `media_name`. Set it to Space Mono `Meta` — see §10 for the doctrine ruling.
3. **`media_logo` is offered but should not be used.** Leave the field in the schema (harmless, and useful if the position ever changes) but ship with it empty on all four blocks. Rationale in §8.

## 8. Content Requirements

**Static labels (section settings, editable per locale):**

- `heading`: `AS FEATURED ON`
- `subheading`: leave empty. The eyebrow is the whole frame.

**The four slides, in order:**

| # | `media_name` | `quote_text` | Source link |
|---|---|---|---|
| 1 | THE RITZ HERALD | "The first of its kind — a bridge between street culture and the art world." | if available |
| 2 | VRAI MAGAZINE | "A powerful statement at the intersection of fashion and art." | if available |
| 3 | BEAUTY NEWS NYC | "Vivid and powerful — a gorgeous representation of art on clothing." | if available |
| 4 | MODERN LUXURY | "Arttitude is democratizing art appreciation." | digital issue, p.62 |

**Two quotes are deliberately excluded.** Daily Front Row and USA News are partnership/sponsored placements. Presenting paid placements under an unqualified "AS FEATURED ON" banner alongside genuine editorial is the exact pattern the FTC endorsement guides treat as a material connection requiring disclosure. Decision taken 2026-08-02: cut them rather than caveat them — four unambiguous editorial quotes carry more weight for a brand selling art-world credibility than six with an asterisk. **If anyone re-adds them later, they must carry a visible disclosure**; this is a content rule, not a preference.

**Modern Luxury is gated on verification.** The quote is currently rendered here in sentence case; the source was supplied in all caps and the exact wording is unconfirmed. `digital.modernluxury.com` serves a JavaScript flipbook with no extractable text, so it cannot be verified programmatically — a human needs to read p.62 of issue 848363. **Ship slides 1–3 if verification is not done by launch**; three verified quotes beat four with one invented. Do not paraphrase to fit the layout.

**No logos.** Four reasons: monochrome UI doctrine forbids the grey-wordmark bar; masthead logos are third-party trademarks whose use in an endorsement context is a permissions question nobody has answered; the quotes are the asset and logos would compete with them; and set as type, the outlet name follows the same rule as an artist credit, which is the system we already have.

**Voice notes for merchant copy:** Never trim a quote in a way that changes its claim. Never add an exclamation point. Outlet names render uppercase via CSS `text-transform`, so store them in their natural case.

## 9. Interaction Model

Scroll-snap horizontal track, one slide per viewport. Drag/swipe on touch, arrows and dots on pointer, arrow keys on focus. No autoplay, no progress bar, no pause button (nothing to pause). Wrapping enabled — with four slides a hard stop at the end reads as breakage. Slide changes must not move page scroll position.

## 10. Doctrine Note — DESIGN.md Needs One Amendment

DESIGN.md contradicts itself for this component and the contradiction should be resolved in the doc, not silently in a section file:

- §3 **Hierarchy** assigns "quote attributions" to the **Subtitle** role (DM Sans 900, 1.5rem).
- §3 **The Mono Carries the Metadata Rule** assigns "artist credits" and everything that _labels_ the work to **Space Mono**.

A press outlet is a source credit — structurally identical to `Artist · [Name]`, which is explicitly mono. The Subtitle line almost certainly describes a testimonial card where the attribution is a *person's name* functioning as a card title, which is a different component.

**Ruling for this brief: outlet attribution is Space Mono `Meta`.** DM Sans 900 at 1.5rem directly beneath a DM Sans 900 quote produces two competing heavy weights and kills the contrast the pairing exists to create.

**Action:** amend DESIGN.md §3 Hierarchy to read "quote attributions (person)" so the rule stops colliding with Mono Carries the Metadata. Not optional — an undocumented divergence in a section file is precisely the drift the doc's closing rule forbids.

**On the eyebrow:** the No Eyebrow Reflex Rule forbids tracked uppercase kickers *above every section heading*, and licenses "a single named brand eyebrow used on one or two specific sections per page." `AS FEATURED ON` is that one. It is also not decorative — it is the only thing that tells you what the four sentences are. Confirm it remains the sole eyebrow on the homepage; if another section has since grown one, that one goes, not this.

## 11. Open Questions

1. **Modern Luxury wording** — blocking for slide 4 only. Human verification of p.62, issue 848363.
2. **Source URLs** — do we have live article links for Ritz Herald, Vrai, Beauty News NYC? If not, ship with `cta_url` empty; an unlinked quote is fine, a broken link is not.
3. **Homepage position** — brief assumes slot 3, after the first product list. The competing argument is slot 6+, after the visitor has seen more work. Cheap to A/B by reordering in the theme editor.
4. **Press page duplication** — the `press_kit` section already has a `coverage` block (`outlet`/`date`/`url`). With this carousel above it, coverage becomes the "everything else" list. Confirm that reads as intentional rather than redundant.

## Hand-off

Next: craft phase on `sections/media-quote-carousel.liquid` — three defects in §7, four content blocks in §8, placement into `templates/index.json` and `templates/page.press.json`. No new section file. DESIGN.md amendment in §10 lands in the same change.
