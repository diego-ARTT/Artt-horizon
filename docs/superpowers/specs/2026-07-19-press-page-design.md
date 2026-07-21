# ARTT Press / Media Page

**Date:** 2026-07-19
**Status:** Approved design, ready for implementation plan
**Branch:** `feature/press-page`

## Problem

ARTT has press coverage — GQ, Modern Luxury and USA Today logos already appear
in an "As seen on…" row on the product page — but no press page. A journalist
who wants to cover the brand has no way to get a logo, quote the boilerplate,
or check basic facts without emailing someone and waiting.

## Goal

A working press kit. Success: **a journalist landing cold can get the logo,
quote the boilerplate verbatim, cite founding facts and founder names, and see
who else has covered ARTT — without emailing anyone** — and knows where to
write if they need more.

**Audience:** journalists on deadline. Explicitly _not_ a customer-facing
credibility wall; that was considered and rejected.

**Scene sentence (drives the design):** a features editor at 4pm Thursday,
deadline in two hours, scanning on a laptop in a bright open-plan office for a
logo she can drop into a layout and a sentence she can quote.

## What exists today

| Asset                                             | Status                      |
| ------------------------------------------------- | --------------------------- |
| Brand logos (SVG/PNG, light + dark)               | ✅ present as `shop_images` |
| Founder bios + photos (Sylvain and Amrita Castet) | ✅ available                |
| Boilerplate + a media contact                     | ✅ available                |
| Hi-res press imagery                              | ❌ **does not exist yet**   |

The imagery gap shapes the design: the kit is a repeater, so imagery is a block
added later rather than a redesign. Nothing renders an empty slot in the
meantime.

Note for the merchant: Shopify stores image _originals_, so existing product
photography may already be press-usable at full resolution even though the
storefront serves downsized versions. Worth checking before commissioning new
photography.

## Design

### Page order

Ordered for the deadline, not for the brand story. Brand prose does not lead.

```
1  Orientation + press contact     one line + mailto
2  Press kit (downloads)           assets first
3  Fast facts                      structured, quotable
4  Boilerplate + copy button       quotable block, not prose
5  Founders                        media-with-content x2
6  Previously covered              outlet · date · link
```

### Files

**Two new files.**

1. **`sections/press-kit.liquid`** — owns the press-kit _content model_: the
   things a journalist takes away. Three block types plus a boilerplate setting.
2. **`templates/page.press.json`** — composes the page.

**Nothing existing is modified.** No core theme file, no shared snippet, no
settings. The change is purely additive, so it cannot regress anything
currently shipping and it survives upstream Horizon syncs.

### Composed from what Horizon already ships (no new code)

| Part of the page            | Built with                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Orientation + press contact | generic `section` + text block + button block (`mailto:`)                                    |
| Founders                    | `media-with-content` (`media_with_text`, with an `editorial` content block), one per founder |

**The press email address is never hardcoded.** It is set by the merchant on
the button block's link field as a `mailto:` URL, so it lives in the theme
editor alongside the rest of the page's copy. The implementer does not need to
know the address.

`media-with-content` is the purpose-built image+prose section and is already
used by `templates/page.about.json`. Hand-composing `group` + `image` + `text`
would re-implement it.

**Verified: no existing Horizon section lists links or files**, so
`press-kit.liquid` is not reinventing an existing capability.

### `press-kit.liquid` schema

**Section settings:** `downloads_heading` (default "Press kit"),
`facts_heading` (default "Fast facts"), `coverage_heading` (default
"Previously covered"), `boilerplate` (richtext), `boilerplate_heading`,
`color_scheme`, and the standard padding pair.

**Block types** (max 12 each):

| Block      | Settings                                                              | Renders as                                         |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| `download` | `label` (text), `description` (text), `file_url` (url), `meta` (text) | `<ul>` of hairline rows                            |
| `fact`     | `term` (text), `value` (text)                                         | `<dl>` — semantically correct for term/value pairs |
| `coverage` | `outlet` (text), `date` (text), `url` (url)                           | `<ul>`, outlet + date, opens in a new tab          |

Shopify has no generic file-picker setting type (only `image_picker` and
`video`), so `file_url` is a `url` setting with `info` text directing the
merchant to upload under **Content → Files** and paste the URL.

`meta` is hand-typed ("SVG, PNG · 2 MB") because Liquid cannot read file size
or format from an arbitrary URL. See Risks.

### Why one section rather than three

This section carries three block types, which sits close to the "one big
section" shape rejected during design. The boundary is deliberate: it owns the
**press-kit content model** and nothing else. Page furniture — orientation,
founders, contact — still comes from Horizon. The rejected alternative would
have rebuilt those too.

Two or three block types with distinct rendering is ordinary Shopify practice,
and three files for a single page is fragmentation today. If the section grows
past this, splitting `press-facts` out is the natural next move.

### Markup and semantics

- **Downloads:** a `<ul>`; each `<li>` contains a single `<a>` wrapping label,
  description and meta, so the whole row is one target rather than a small link
  inside a large row. Hairline dividers between rows. No cards — DESIGN.md is
  flat by doctrine and "cards are the lazy answer."
- **Fast facts:** a `<dl>` of `<dt>`/`<dd>` pairs. A definition list is what
  term/value pairs are; a table or paragraphs would be wrong.
- **Boilerplate:** a quotable block with a copy-to-clipboard button, visually
  distinct from surrounding prose so a journalist can see what is safe to paste.
- **Coverage:** a `<ul>` of outbound links, each `target="_blank"
rel="noopener"`.

**Heading levels.** The page title is the `<h1>` (supplied by the page
template). Every heading this section renders — downloads, facts, boilerplate,
coverage — is an `<h2>`. No heading level is skipped, and no `<h1>` is emitted
by the section. This matters for the same reason it did on the ICONS tease: a
journalist using a screen reader navigates by heading, and a page offering one
stop is a page they have to read linearly.

### Typography — documented roles, no new tokens

| Element                   | Role                           |
| ------------------------- | ------------------------------ |
| Section headings          | Headline (DM Sans 900)         |
| Item label / fact term    | Subtitle                       |
| Description / boilerplate | Body (Space Mono 14px)         |
| Format, size, date        | Meta (Space Mono 12px, 0.13em) |

Formats, sizes and dates in Meta is exactly what `The Mono Carries the Metadata
Rule` assigns mono to ("run sizes, artist credits, prices, dates").

**This page does not use the ICONS "collection world" pattern.** No new fonts,
no new tokens, no local palette. `The Collection World Rule` requires a
narrative reason for a per-surface world, and a press kit is not one. This is
core storefront and uses the storefront system.

### Color and lane

**Restrained** — monochrome by doctrine, per DESIGN.md. Not a real choice on a
core storefront page.

The flat hairline-row treatment sits adjacent to the brand register's
reflex-reject "editorial-typographic" lane (display serif + mono labels + ruled
separators + monochrome). It clears on three counts, recorded here so it is not
re-litigated later:

1. ARTT's display face is DM Sans 900 — a geometric black sans, not a display serif.
2. Identity-preservation: this is the committed existing system, not a greenfield pick.
3. Founder photos mean the page is not the lane's imageless fingerprint.

### Interaction

The only JavaScript on the page is copy-to-clipboard on the boilerplate:
`navigator.clipboard.writeText`, with a `role="status"` confirmation ("Copied")
and a graceful no-op where the API is unavailable — the button must never
appear broken.

## Key states

| State                     | Behaviour                                                     |
| ------------------------- | ------------------------------------------------------------- |
| Default                   | All groups render with their headings                         |
| No blocks of a type       | That group and its heading render nothing — no orphan heading |
| Block missing its URL     | That row is skipped                                           |
| Long label or description | Wraps; no truncation, no overflow                             |
| No boilerplate set        | Block and copy button both absent                             |
| Clipboard unavailable     | Button no-ops silently rather than erroring                   |
| No hi-res imagery (today) | Kit lists only what exists; imagery is a later block          |

## Verification

**Verifiable without store credentials:** all four gates (`lint:theme` at the
0 errors / 54 warnings baseline, `lint:js`, `lint:css`, `format:check`); schema
JSON parses; brace/paren balance confirmed by read-back — **no gate parses the
embedded `{% stylesheet %}` CSS**, so manual read-back is the real syntax
check; the template references only sections that exist; empty and
missing-field blocks render nothing.

**Requires the merchant (browser checkpoint):** that a real Shopify Files URL
downloads; that the copy button works (clipboard needs HTTPS and a user
gesture); keyboard and screen-reader behaviour; and the merchant flow of
creating the page and assigning the template.

## Risks

1. **The `download` attribute will not fire.** Shopify Files are served from
   `cdn.shopify.com`, cross-origin from the store domain, and `download` is only
   honoured same-origin — so an SVG or JPG opens in a tab instead of
   downloading. Mitigations: keep the attribute (correct intent, works if assets
   ever move same-origin), add `target="_blank" rel="noopener"` so an opened
   file does not cost the journalist the page, and **recommend zipping
   multi-file assets** since a `.zip` downloads reliably regardless of origin.
   Documented, not solved.
2. **`meta` goes stale.** Hand-typed format and size will lie if a file is
   swapped without updating the label. Accepted: the alternative is showing
   nothing, which is worse for someone deciding whether to click.
3. **Fast facts and coverage are new content to maintain.** The page is only as
   useful as those stay current, and a stale "previously covered" list is worse
   than none.
4. **Clipboard API needs HTTPS and a user gesture.** Fine in production; it may
   no-op in some preview contexts, hence the graceful fallback.

## Merchant setup (one-time)

1. Admin → **Content → Pages → Add page**, titled "Press".
2. Set _Theme template_ → **press**.
3. Upload assets under **Content → Files**; paste each URL into a `download`
   block. Zip anything with more than one file.
4. Fill the `fact`, `coverage` and boilerplate content in the theme editor.

## Out of scope

- Hi-res press imagery — does not exist yet; it is a `download` block added
  later, with no redesign.
- A customer-facing coverage or logo wall — the audience decision was
  journalists, not both.
- Download analytics.
- Gating assets behind a form.
- Multi-language press copy.
- A structured contact form. A `mailto:` is the primary contact because a
  journalist on deadline wants to reply from their own client with their own
  signature and thread. Horizon's native `contact-form` block can be added
  later with no rework if structured intake is ever wanted.
