# ICONS Collection — Pre-Launch Conversion Fixes

**Date:** 2026-07-18
**Status:** Approved design, ready for implementation plan
**Branch:** `feature/icons-conversion-fold-fix`

## Problem

The ICONS collection tease (live at `/collections/icon-coilection` on the
`collection.icons` template) is the on-site companion to the Klaviyo teaser
series ahead of the **Aug 1** launch. Its only job before launch is capturing
"notify me" email signups — and the signup path is currently broken in two
ways and buried in a third.

Reported: the hero CTA falls below the fold. An audit of the section found
three further issues, one of them a silently dead code path.

## Goal

Maximize "Get Notified" signups between now and the Aug 1 cutover.

**Out of scope:** the post-Aug-1 live product grid (the collection is empty
until launch, so auditing that state would be speculative); the press/media
page (separate spec); the `icon-coilection` handle typo (see Deferred).

## Audit findings

| #   | Finding                                                                                                                                                                                                                                                      | Severity                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 1   | **CTA below the fold.** `.icons-hero { height: 100dvh }` renders _inside_ the sticky header, so the page is `header + 100dvh` and the hero's bottom row (the CTA) is pushed off-screen. `min-height: 640px` compounds it on short viewports.                 | High — the reported bug      |
| 2   | **CTA focus handler is dead.** The JS binds `.icons-lp__cta[href="#icons-subscribe"]` — the _type-only_ hero's class. The live hero (`hero_style: question_video`) uses `.icons-hero__cta`, so clicking "Get Notified" never moves focus to the email field. | High — a11y, silently broken |
| 3   | **Signup path buried.** The hero CTA anchors to `#icons-subscribe`, which sits _after_ all 24 lookbook images.                                                                                                                                               | Medium — conversion          |
| 4   | **No responsive images.** The 24 lookbook `<img>`s use `asset_url` at a fixed 1530×2048 (2.0 MB total), so phones download desktop-sized images.                                                                                                             | Medium — mobile perf         |

### Constraint discovered during design

`srcset` is **not achievable** for these images as modelled. The `look` block's
`image` setting is a `text` field holding a _theme asset filename_, rendered via
`asset_url`. Shopify's image CDN transforms (`image_url: width:`) only apply to
uploaded/Shopify-hosted images, not theme assets. Rather than migrate 24 images
to `image_picker` (a data migration requiring the merchant to re-pick all 24,
and losing the "ships with the theme" property), we re-encode the assets in
place.

## Design

### Architecture — extract the form, render it twice

**New file: `snippets/icons-subscribe-form.liquid`**

| Param       | Purpose                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_suffix` | `hero` / `footer` → `icons-email-hero`, `icons-email-footer`. Removes the duplicate-`id` bug and keeps `<label for>` correct in both instances. |
| `variant`   | Layout class: `inline` (hero — field + button on one row) / `stacked` (footer — current appearance).                                            |
| `s`         | `section.settings`, passing Klaviyo keys and all `msg_*` strings through unchanged.                                                             |

Contents move verbatim from the current `#icons-subscribe` block:
`form[data-icons-subscribe]`, visually-hidden label, email input,
`company_website` honeypot, submit button, `p[data-status][role="status"]`.
No behavior change — only parameterized IDs and a variant class.

**This works without a JS rewrite.** The existing handler already does
`document.querySelectorAll('[data-icons-subscribe]')` and scopes every lookup to
`form.querySelector(...)`, so a second form is picked up automatically.

### Files changed

1. **`sections/icons-lookbook.liquid`**
   - Hero bottom row: replace the anchor CTA with the snippet
     (`id_suffix: 'hero'`, `variant: 'inline'`). Reuse the existing **`hero_cta`**
     setting as the submit button label — no new schema setting, merchant copy
     preserved.
   - `#icons-subscribe`: same snippet (`id_suffix: 'footer'`, `variant: 'stacked'`),
     retained as the second-chance capture after the grid.
   - CSS: fold fix + inline-variant styles.
   - JS: fix the dead focus handler.
   - Schema: unchanged.
2. **`templates/index.json`** — repoint the `hero_jVaWmY` button.
3. **`assets/icons-look-*.webp`** — re-encoded in place, same 24 filenames.

**Not changed:** `templates/collection.icons.json` (settings reused, filenames
unchanged); the type-only fallback hero; Klaviyo integration, honeypot, and
status/aria wiring.

### Fix 1 — Fold

```css
.icons-hero {
  /* available viewport once the header's real footprint is accounted for */
  --icons-hero-avail: calc(
    100dvh - var(--header-group-height, 0px) * (1 - var(--transparent-header-offset-boolean, 0))
  );

  height: var(--icons-hero-avail);
  min-height: min(32rem, var(--icons-hero-avail)); /* was: 640px */
}
```

Both variables are defined on `body` in `sections/header.liquid`, so they are
globally readable.

- The `* (1 - boolean)` term handles the runbook's optional transparent header:
  when transparent (`1`) the header overlays content and nothing is subtracted;
  when standard (`0`) its full height is subtracted. One rule covers both, so
  toggling that theme setting cannot reintroduce the bug.
- **`min-height` must be self-limiting, not just smaller.** The old `640px` was a
  hard floor: on a landscape phone (~375px of viewport height) the hero was
  forced to 640px and overflowed regardless of the height fix. Simply lowering
  it to `32rem` (512px) would have the same failure, just later. Wrapping it in
  `min(32rem, var(--icons-hero-avail))` gives a sensible floor on normal screens
  while guaranteeing the hero never exceeds the space actually available — which
  is the property the fold fix depends on.
- Binding the available height to a single custom property keeps `height` and
  `min-height` from drifting apart if the header math is later revised.

### Fix 2 — Focus handler

Replace the `.icons-lp__cta` binding and its `getElementById('icons-email')`
call with a generic one: a click on any `[href="#icons-subscribe"]` focuses the
email input **within** `#icons-subscribe`. This keeps the type-only fallback
working and is unambiguous now that IDs are unique.

### Fix 3 — Conversion path

The hero bottom row becomes `[ email field ][ Get Notified ]` alongside the
dots and scarcity line, so signup requires **zero scroll**. The status message
renders inline in the hero. The footer form remains as the second chance.

### Fix 4 — Performance

- **Images:** re-encode the 24 webp files in place, targeting roughly
  2.0 MB → 1.0 MB, preserving filenames (zero template/JSON churn, no merchant
  action). **Aspect ratio must be preserved and the hardcoded
  `width="1530" height="2048"` attributes updated to the new intrinsic size** —
  otherwise the perf win is traded for a layout-shift bug.
- **Video (above the fold, largest win):** keep
  `autoplay muted loop playsinline`, but serve **poster-only on small screens**
  and honor `prefers-reduced-motion` and `Save-Data`, so phones don't pull an
  MP4 while someone is trying to sign up.
- **GSAP (71 KB):** already `defer`. Tighten to load only when the hero is in
  view _and_ motion is allowed — under `prefers-reduced-motion` the kinetic
  reveal is skipped, making the payload pure waste.

### Homepage link

`templates/index.json` → `hero_jVaWmY` → `button_QFiR43`:

```
label: "Shop Sale"                             → "Discover ICONS"
link:  shopify://collections/seven-deadly-sins → shopify://collections/icon-coilection
```

That hero already carries ICONS copy ("Every icon leaves a question.") and the
ICONS background video, so the "Shop Sale" button pointing at
`seven-deadly-sins` reads as a stale mismatch.

`index.json` is Shopify-auto-generated and the theme editor can overwrite it.
The change is made in git (matching the git → theme push workflow); if the hero
is edited in the theme editor before deploy, it can drift.

## Verification

Behavioral, not just "lint passes":

| What            | How                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fold fix        | `shopify theme dev`; CTA/form visible with no scrolling at 1440×900, 1366×768, 375×667, and landscape phone                                                                  |
| Header variants | Re-check with the **announcement bar enabled** and with **transparent header on/off**                                                                                        |
| Signup path     | Submit a test email from the **hero** form → confirm the profile lands on Klaviyo list `VTivuP`; repeat from the **footer** form (proves both forms work and IDs are unique) |
| a11y            | Keyboard-tab to the hero form; status is announced; the `#icons-subscribe` anchor focuses the footer email input                                                             |
| Reduced motion  | GSAP skipped, no layout break, hero legible                                                                                                                                  |
| Perf            | Mobile Lighthouse before/after; confirm phones receive the poster, not the MP4                                                                                               |
| Gates           | `lint` + `theme-check` green                                                                                                                                                 |

## Risks

1. **Announcement bar height — highest-likelihood regression.**
   `--header-group-height` is set equal to `--header-height` (60px) and may not
   include the announcement bar/marquee. The runbook instructs the merchant to
   _add_ an announcement bar for ICONS discovery, which would push the hero down
   by an uncounted amount and partially reintroduce the bug. Mitigation in
   order: (a) verify in the theme editor with the bar enabled; (b) if uncounted,
   add the marquee height to the calc; (c) if that proves unreliable, fall back
   to a `ResizeObserver` that measures the real header group and writes an
   `--icons-hero-offset` variable.
2. **Image re-encode** must preserve aspect ratio and update the intrinsic
   `width`/`height` attributes, or it trades a perf win for CLS.
3. **Two live Klaviyo forms** both post to list `VTivuP`. Duplicate submissions
   from one person are deduped by Klaviyo — benign.
4. **Aug 1 cutover is unaffected** — nothing here touches the template
   reassignment. Re-confirm at the end.

## Rollback

All changes land on one branch. CSS and markup revert cleanly; the original
images are recoverable from git history since they are committed.

## Deferred

- **`icon-coilection` handle typo.** The handle is misspelled, but it is what
  the runbook, the tease URL, and the Klaviyo campaign all use. Renaming it
  before Aug 1 would break the cutover. Post-launch cleanup, and it would need a
  URL redirect.
- Post-Aug-1 product grid audit.
- Press/media page — separate spec.
