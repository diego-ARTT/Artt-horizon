---
name: Arttitude (ARTT)
description: A wearable gallery for limited-run, art-driven streetwear.
colors:
  ink: '#000000'
  ink-muted: '#000000cf'
  canvas: '#ffffff'
  canvas-haze: '#f5f5f5'
  canvas-sage: '#eef1ea'
  canvas-ice: '#e1edf5'
  canvas-graphite: '#333333'
  hairline: '#0000000f'
  hairline-mid: '#000000cf'
  accent-cobalt: '#1d3686'
  state-instock: '#3ed660'
  state-lowstock: '#ee9441'
  state-outofstock: '#c8c8c8'
  state-error: '#8b0000'
  state-success: '#006400'
  icons-void: '#0a0a0a'
  icons-void-lifted: '#111111'
  icons-bone: '#e4e1da'
  icons-bone-bright: '#f4f1eb'
  icons-bone-muted: '#9a948b'
  icons-hairline: '#e4e1da24'
typography:
  display:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: 'clamp(2.5rem, 5.6vw, 3.5rem)'
    fontWeight: 900
    lineHeight: 1
    letterSpacing: '0em'
  headline:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: 'clamp(2rem, 4.8vw, 3rem)'
    fontWeight: 900
    lineHeight: 1
    letterSpacing: '0em'
  title:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '2rem'
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: '0em'
  subtitle:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 900
    lineHeight: 1
    letterSpacing: '0em'
  body:
    fontFamily: 'Space Mono, ui-monospace, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: '0em'
  label:
    fontFamily: 'DM Sans, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '0.06em'
  meta:
    fontFamily: 'Space Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: '0.13em'
  icons-display:
    fontFamily: 'Bodoni Moda, Georgia, serif'
    fontSize: 'clamp(2.5rem, 6vw, 5.4rem)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.01em'
  icons-label:
    fontFamily: 'Helvetica Neue, Arial, sans-serif'
    fontSize: '0.66rem'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '0.34em'
rounded:
  xs: '0.2rem'
  sm: '4px'
  md: '12px'
  lg: '14px'
  pill: '32px'
  full: '100px'
spacing:
  xs: '0.5rem'
  sm: '0.7rem'
  md: '0.8rem'
  lg: '1rem'
  xl: '1.25rem'
  2xl: '1.5rem'
  3xl: '1.75rem'
  4xl: '2rem'
  5xl: '3rem'
  6xl: '5rem'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.canvas}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '16px 24px'
  button-primary-hover:
    backgroundColor: '{colors.canvas-graphite}'
    textColor: '{colors.canvas}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '16px 24px'
  button-secondary-hover:
    backgroundColor: '{colors.canvas-haze}'
    textColor: '{colors.canvas-graphite}'
  input:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '0.8rem 0.8rem'
  card:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
  badge:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.canvas}'
    typography: '{typography.meta}'
    rounded: '{rounded.full}'
    padding: '4px 16px'
  chip-swatch:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.pill}'
    size: '34px'
  chip-variant:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '0.7rem 1rem'
  icons-submit:
    backgroundColor: '{colors.icons-bone-bright}'
    textColor: '{colors.icons-void}'
    typography: '{typography.icons-label}'
    rounded: '{rounded.xs}'
    padding: '0.95rem 2.4rem'
  icons-input:
    backgroundColor: 'transparent'
    textColor: '{colors.icons-bone-bright}'
    rounded: '{rounded.xs}'
    padding: '0.85rem 0.25rem'
---

# Design System: Arttitude (ARTT)

## 1. Overview

**Creative North Star: "The Wearable Gallery"**

Arttitude is a fashion house that turns fine art into wearable streetwear in limited drops. The site exists to let the work breathe: garments and the artwork they carry are the visual subject, and every other layer of the page (chrome, navigation, type, color) steps back to make space for them. The result reads less like a Shopify store and more like a gallery you can buy from: white walls, captioned objects, narrow aisles of negative space.

The system is **monochrome by doctrine**. Five color schemes ship with the theme; all five are near-black on near-white (or its inverse). Color in the saturated sense does not come from UI; it comes from product photography, the artwork printed on the garment, and editorial imagery. Tinted neutrals (sage, ice, graphite) exist as alternate paper stocks, not as "accents." The accent in scheme-4 (`#1d3686`) is the only chromatic UI color in the system and earns its use sparingly — borders on dedicated drop or campaign sections, not generalized brand color.

Typography is a deliberate two-family pairing: **DM Sans 900 (Black)** as display, **Space Mono 400** as body. The contrast (geometric black-weight sans against a stenciled monospace) is the voice of the system. Body copy stays at 14px / 1.6 line-height across the storefront; headlines run heavy and tight (line-height 1.0, no letter-spacing concession) up to 56px on `<h1>`. The mono carries metadata: drop names, run sizes, artist credits, product captions, navigation labels.

The system explicitly rejects: the generic Shopify fashion theme stack (hero → featured collection → reviews → newsletter), fast-fashion urgency (countdown timers, percent-off ribbons), corporate-luxury formality (serif crests, gold flourishes, marble textures), and SaaS visual grammar (soft gradients, AI-pastel backgrounds, rounded-everything).

**Key Characteristics:**

- Monochrome UI; the artwork and garment supply all the color
- DM Sans 900 + Space Mono — deliberate pairing, kept across the system
- Flat by doctrine; no decorative shadows, no card lift at rest
- Narrow page width (90rem max) — composed columns over wide grids
- Generous heading scale (clamp to 56px) against tight 14px mono body
- Mono carries metadata; sans carries headings; both stay in their lane

## 2. Colors: The Wearable Gallery Palette

A two-tone system (ink + canvas) with four alternate canvases for sectional rhythm. Saturated color is reserved for product photography and artwork; it never appears as decorative UI fill.

### Primary

- **Ink** (`#000000`): Heading color, primary button background, hairline accents at full opacity. The only true black in the system.
- **Ink Muted** (`#000000cf`, ~81% black): Body copy, secondary text, default foreground. The single contrast risk in the system — borderline 4.5:1 on tinted canvases; verify before using on `Canvas Sage` or `Canvas Ice` for sustained body copy.

### Neutral

- **Canvas** (`#ffffff`): Default page background. The gallery wall.
- **Canvas Haze** (`#f5f5f5`): Secondary scheme background. Use for product-grid sections and quiet supporting blocks where pure white would feel sterile.
- **Canvas Sage** (`#eef1ea`): Tertiary scheme background. Use sparingly, for chapter-shift sections (about, journal, collab intros) where a tonal pause is editorial intent.
- **Canvas Ice** (`#e1edf5`): Quaternary scheme background. Reserved for drop or campaign sections that pair with the cobalt accent (scheme-4 native).
- **Canvas Graphite** (`#333333`): Inverse scheme background. Footer, full-bleed dark sections, drop reveals where the gallery flips to night mode.
- **Hairline** (`#0000000f`, ~6% black): Default border weight — dividers, card outlines, hairline rules between rows.
- **Hairline Mid** (`#000000cf`): Strong border for emphasis (selected variant, focused field, scheme-3 borders).

### Accent

- **Cobalt** (`#1d3686`): The only saturated UI color in the system. Native to scheme-4 (button borders on `Canvas Ice`). Use only in sections that already sit on `Canvas Ice` — never as a default brand accent.

### State

- **State / In Stock** (`#3ed660`): Availability dot on PDP and product cards.
- **State / Low Stock** (`#ee9441`): Urgency indicator. Limited use; "low stock" language should still avoid fast-fashion urgency.
- **State / Out Of Stock** (`#c8c8c8`): Sold-out swatches and grayed-out availability.
- **State / Error** (`#8b0000`): Form errors, validation failures.
- **State / Success** (`#006400`): Add-to-cart confirmations, form success states.

### Collection Worlds

A drop may run its own palette when the collection's narrative demands it. Today exactly one does: **ICONS** (`sections/icons-lookbook.liquid`, mounted on `templates/collection.icons.json`). It inverts the storefront — near-black surface, bone type — because the campaign is a darkened room with lit portraits in it. These values are scoped under `.icons-lp` and must not leak into the storefront's default schemes.

- **ICONS / Void** (`#0a0a0a`, `--lp-bg`): The collection's surface. Replaces `Canvas` for the whole section, never elsewhere.
- **ICONS / Void Lifted** (`#111111`, `--lp-ink`): A single step up from Void, for panels that need separation without a border.
- **ICONS / Bone** (`#e4e1da`, `--lp-fg`): Body and UI foreground on Void. The collection's answer to `Ink`.
- **ICONS / Bone Bright** (`#f4f1eb`, `--lp-fg-bright`): Reserved for type sitting on the hero video, where the backdrop is brighter and less predictable than flat Void.
- **ICONS / Bone Muted** (`#9a948b`, `--lp-muted`): Secondary metadata on Void — the equivalent of `Ink Muted`, not a disabled state.
- **ICONS / Hairline** (`#e4e1da24`, `--lp-hairline`): Dividers and input underlines on Void. The inverse of `Hairline`.

### Named Rules

**The Collection World Rule.** A collection may own a palette, a display face, and a layout logic — a complete visual world — when the drop's story requires it. The permission is bounded three ways: the world is scoped to that collection's section and template, it never redefines a storefront token, and it must be documented here before it ships. An undocumented local palette is drift, not art direction. ICONS is the reference implementation.

**The Art Carries the Color Rule.** Saturated chromatic color belongs to product photography, artwork prints, and editorial imagery. It does not belong to buttons, headings, dividers, illustrations, or backgrounds. If a UI element needs to "feel branded," reach for typographic weight, scale, or negative space — not color.

**The Tinted Canvas Rule.** `Canvas Haze`, `Canvas Sage`, `Canvas Ice`, and `Canvas Graphite` are alternate paper stocks, not accents. A whole section sits on them; UI elements within do not. Never use a tinted canvas as a card background or button fill against a different page background.

**The One Saturated Color Rule.** Cobalt (`#1d3686`) is the only saturated UI color in the system, and it only appears on `Canvas Ice`. If a new section needs a new color, the answer is a new artwork or a new image, not a new hex.

## 3. Typography

**Display Font:** DM Sans (with system sans-serif fallback)
**Body Font:** Space Mono (with `ui-monospace` fallback)

**Character:** A deliberate contrast pairing. DM Sans at weight 900 is heavy, geometric, immediate — it shouts the drop name. Space Mono at regular is even, mechanical, captioned — it carries the run size, the artist credit, the price. The space between them is the brand's voice.

Both families are on Brand 2026's reflex-reject list for new projects. Here they are an existing identity decision; identity-preservation wins. Do not migrate away from them or "modernize" the pairing.

### Hierarchy

- **Display** (DM Sans 900, `clamp(2.5rem, 5.6vw, 3.5rem)` / 56px max, line-height 1.0, letter-spacing 0): `<h1>` on hero sections, drop reveal headlines, campaign titles. The single largest type on a page.
- **Headline** (DM Sans 900, `clamp(2rem, 4.8vw, 3rem)` / 48px max, line-height 1.0): `<h2>`. Section openers, collection titles, About-page chapter heads.
- **Title** (DM Sans 900, 2rem / 32px, line-height 1.1): `<h3>`. Product titles on PDP, subsection heads.
- **Subtitle** (DM Sans 900, 1.5rem / 24px, line-height 1.0): `<h4>`. Card titles, quote attributions.
- **Body** (Space Mono 400, 0.875rem / 14px, line-height 1.6): Paragraph copy, descriptions, long-form prose. Cap line length at 65–75ch on About/Journal long-form.
- **Label** (DM Sans 500, 0.875rem / 14px, letter-spacing 0.06em): `<h5>`. Section labels, nav links, eyebrow tags when one is deliberately placed.
- **Meta** (Space Mono 400, 0.75rem / 12px, letter-spacing 0.13em): `<h6>`. Captions, run-size notation, artist credits, drop numbers, edition counts.

### Collection Worlds

**ICONS** runs its own type, and this is deliberate — not drift to be corrected back to DM Sans + Space Mono.

- **ICONS / Display** (Bodoni Moda 700, `clamp(2.5rem, 6vw, 5.4rem)` / 86px max, line-height 1.05, letter-spacing −0.01em): The rotating question in the hero. Self-hosted woff2 at weights 600 and 700; loaded only on this template. A high-contrast didone against the storefront's geometric sans — the contrast is the point, and it reads as a gallery caption rather than a product page.
- **ICONS / Label** (Helvetica Neue / Arial, 0.66rem / 10.5px, uppercase, letter-spacing 0.34em): The hero's corner labels and the scarcity line. Tracked far wider than the storefront's `Meta` (0.13em) because at this size, on video, tracking is what makes the line legible as a label rather than a word.

### Named Rules

**The Mono Carries the Metadata Rule.** Space Mono is for everything that _labels_ the work: drop names, edition numbers, run sizes, artist credits, prices, dates, breadcrumbs. DM Sans is for everything that _names_ the work: headings, hero text, drop titles. Never swap the assignment. Mono in a headline reads as costume; DM Sans 900 in a caption reads as a typo.

**The Heavy Headlines Rule.** Display and headline always run at weight 900 with line-height 1.0 and no positive letter-spacing. Lighter weights, looser leading, or tracked headings break the gallery-wall posture. If a headline needs a softer feel, the answer is more white space around it, not a thinner weight.

**The 14px Body Rule.** Body copy stays at 14px / 1.6 across the storefront. This is a deliberately small, dense body size that pairs with the heavy display; pushing body to 16px to "feel more readable" breaks the contrast that makes the pairing work. If a block needs more emphasis, use the Subtitle role, not a larger body size.

**The No Eyebrow Reflex Rule.** Repeated tiny tracked uppercase labels above every section heading (the 2023-era kicker) are forbidden. A single named brand eyebrow used on one or two specific sections per page is fine; the eyebrow-on-every-section grammar is AI scaffolding and is not the ARTT system.

**The Borrowed Face Rule.** A collection world may bring its own display face, and when it does, that face carries the collection's headline type — not the storefront's. It does not follow that the world may bring a second _body_ face: ICONS' labels run in a system sans because they are chrome, not copy, and there is no ICONS body role at all. If a collection world ever needs running prose, it uses Space Mono. Two display faces is art direction; two body faces is a broken system.

**The Bounded Tracking Exception.** ICONS' corner labels (0.34em) and scarcity line (0.24em) are tracked far beyond the storefront's `Meta` (0.13em). This is licensed for that surface only, and it does not reopen the eyebrow reflex above: ICONS uses two labels total, both structural to the hero's frame, neither sitting above a heading as a kicker. Wide tracking as a section-opening grammar remains forbidden everywhere.

## 4. Elevation

The system is **flat by doctrine.** Surfaces sit at the same plane at rest. Depth and hierarchy are conveyed by typography scale, white space, hairline rules (`#0000000f`), and the alternate canvas tonal stack — not by shadows. The page reads like a gallery floor: walls are flat; the work is what stands out.

Shadows exist in the system in exactly three places: a small button shadow for tactile press feedback, a soft drop-shadow under open drawers, and a blurred backdrop behind drawers (custom ARTT addition — `--drawer-backdrop-blur`, 8px by default). They are _stateful_, not decorative. No card has a shadow at rest.

### Shadow Vocabulary

- **Button shadow** (`box-shadow: 0 2px 3px rgb(0 0 0 / 20%)`): Tactile depth on primary buttons. Subtle, never decorative.
- **Drawer drop-shadow**: Applied to open cart and menu drawers via theme setting. Indicates the drawer floats above the page.
- **Drawer backdrop blur** (`backdrop-filter: blur(8px)`): Custom ARTT addition. Applied to the drawer backdrop to dim and soften the page beneath an open drawer. Settings-controlled 0–20px range.

### Named Rules

**The Flat At Rest Rule.** Cards, sections, headers, and panels are flat at rest. Shadows, lift, and scale appear only as a response to state (drawer open, hover where deliberate, focus). A card with a default `box-shadow` is forbidden.

**The Tonal Hierarchy Rule.** When depth is needed between sections, switch the canvas (`Canvas` → `Canvas Haze` → `Canvas Sage` → `Canvas Graphite`), not the elevation. The five color schemes are the system's depth model.

## 5. Components

### Buttons

- **Shape:** Rounded rectangles. Primary radius 14px, secondary radius 12px.
- **Primary:** Ink (`#000000`) background, Canvas (`#ffffff`) text, no visible border (0px primary border width, but a black outline color is set for focus). Padding 16px block / 24px inline. Font: Space Mono 400, 14px. Subtle 2px/3px black drop shadow for tactile feedback.
- **Hover:** Background shifts to Canvas Graphite (`#333333`); text stays Canvas. Transitions: `color`, `box-shadow`, `background-color` over `--animation-speed` (125ms) `ease-in-out`.
- **Secondary:** Transparent background, Ink text, 1px Ink border (rendered via inset box-shadow). Radius 12px, same padding as primary. Used for "View collection", "Read more", supporting CTAs.
- **Secondary hover:** Background shifts to a light canvas tint (`Canvas Haze` family); text shifts toward Canvas Graphite.
- **Text case:** Inherits from theme settings (`--button-text-case-primary`, `--button-text-case-secondary`). Currently `none` — no forced uppercase. Do not introduce reflexive uppercase on CTAs; let label clarity carry the action.
- **Disabled:** Opacity 0.5, `cursor: not-allowed`.

### Chips & Swatches

- **Variant swatch chip:** 34×34px (`--variant-picker-swatch-width/height: 34px`), 32px radius (effectively a circle/pill), 1px border at configurable opacity. Selected state: hairline-mid border at full weight.
- **Variant button chip:** Pill-shaped (radius 14px), 1px border, equal-width across the variant row (`--variant-button-width: equal-width-buttons`). Used for sizes, lengths, scalars.

### Cards / Containers

- **Corner Style:** 4px radius (`--card-corner-radius`). Restrained. Product imagery and content do not get extra rounding; corners are nearly square.
- **Product card corner:** 0px (`--product-corner-radius`). Product images and product-card outer frames are sharp-cornered. Deliberate.
- **Background:** Inherits the surrounding scheme. Cards do not introduce their own background tint.
- **Shadow Strategy:** None at rest. See [Elevation](#4-elevation).
- **Border:** Hairline (`#0000000f`) only when separation is structurally necessary. Default to spacing as the separator.
- **Hover:** `card_hover_effect: none` is the system default. Do not introduce a lift, scale, or shadow hover effect on cards unless it earns its place per-section.

### Inputs / Fields

- **Style:** Canvas-colored background at slight transparency (`#ffffffc7`), 1px Ink border, 4px radius. Padding 0.8rem block / 0.8rem inline.
- **Focus:** Box-shadow ring at the input border color (0.5px expansion). No glow, no color shift toward an accent.
- **Placeholder:** Same color as Input text; hidden on user input.
- **Error:** Use State / Error (`#8b0000`) for the border and message text; do not introduce a red background fill.
- **Disabled:** 10% ink-on-canvas background; 50% ink text.

### Navigation

- **Style:** Mono labels in Space Mono (subheading font role). Spacing tight, dividers minimal. Mobile uses a drawer with `--drawer-max-width: 500px` and the custom backdrop blur.
- **Active / Hover:** Underline or weight shift; do not introduce a color change (the system has no nav accent color).

### Badges

- **Shape:** Full pill (100px radius via `badge_corner_radius`). Padding tight (4px block / 16px inline on desktop).
- **Color assignment:** Sale badge uses scheme-2; sold-out badge uses scheme-3. Default monochrome.
- **Text:** Space Mono meta, with letter-spacing. Do not force uppercase.

### Drawer (signature component)

The cart and menu drawer is the most ARTT-specific component in the system. Right-anchored panel, max width 500px / 95vw, 100dvh height. Open animation: 200ms `cubic-bezier(0.4, 0, 0.2, 1)`. Backdrop is the custom **blur backdrop** (`backdrop-filter: blur(8px)` over 15% black overlay) — a deliberate ARTT extension on top of stock Horizon. The backdrop is the part of the system that breaks the flat-by-doctrine rule, intentionally: an open drawer makes the page beneath feel like glass behind it.

### ICONS Collection Tease (signature component)

The pre-launch tease for a drop: a full-bleed dark surface that behaves like a darkened gallery room. Three parts, all scoped under `.icons-lp`.

- **Question hero:** viewport-height stage (`100dvh` minus the header's real footprint, inside `@supports (height: 100dvh)`, with a `100vh` fallback), sized so its bottom row always clears the fold. A blurred looping video sits under a two-layer scrim whose floors are tuned so bone type clears WCAG AA on any frame. A three-row grid — corner labels, the rotating question in ICONS / Display, then the conversion row. Motion is a GSAP word-by-word mask reveal; under `prefers-reduced-motion` GSAP is never fetched and an opacity fade carries it instead.
- **Inline capture:** the conversion row holds the email field and submit inline, so signing up costs no scroll. Field is a bone underline on transparent (never a filled box); submit is bone-bright on void. The same form renders again after the grid as a second chance — one snippet, two instances, distinct ids.
- **Lookbook grid:** full-bleed, 2 columns on mobile and 3 from 750px, `2px` gutters. The gutter is the only separation; no cards, no radii, no captions. The photographs do the work.

**The Darkened Room Rule.** The tease inverts the storefront on purpose: where the gallery is white walls, the tease is the room with the lights down and the work lit. Anything that reintroduces storefront chrome — a card, a rounded container, a tinted canvas, a drop shadow — breaks the room. If an element needs definition here, it gets a hairline or nothing.

## 6. Do's and Don'ts

### Do:

- **Do** keep UI monochrome. Saturated color comes from product photography and artwork, never from UI fills, buttons, dividers, or illustrations.
- **Do** pair DM Sans 900 with Space Mono 400 across the storefront. Display and headlines in DM Sans; metadata (run sizes, drop names, artist credits, captions, prices) in Space Mono.
- **Do** use DM Sans 900 at line-height 1.0 with 0 letter-spacing on display and headline. Heavy, tight, and immediate is the posture.
- **Do** keep body copy at 14px / 1.6 (Space Mono). Trust the contrast against the heavy display.
- **Do** keep surfaces flat at rest. Switch the canvas (`Canvas Haze`, `Canvas Sage`, `Canvas Ice`, `Canvas Graphite`) when sections need tonal differentiation; do not reach for shadows.
- **Do** cap page width at 90rem (`--narrow-page-width`) — the theme is set to `narrow` and that is the composed-column posture of the system.
- **Do** name the artist, the collab, the city, the run size in copy. Surface scarcity through structure (edition numbers, sequence, sold-out treatment), not through urgency language.
- **Do** ship real imagery — product photography, artwork, editorial — on every page that implies it. A solid-color block where a photograph belongs is worse than a representative stock photo.

### Don't:

- **Don't** introduce decorative shadows or `box-shadow` on cards at rest. The system is flat by doctrine. The drawer's backdrop blur is the _only_ sanctioned exception, and it's stateful.
- **Don't** use Space Mono in headlines or DM Sans in metadata. The role assignment is the voice of the pairing; swapping it reads as costume.
- **Don't** introduce a new accent color. Cobalt (`#1d3686`) is the only saturated UI color in the system, and it only appears on `Canvas Ice`. New emphasis comes from artwork, not from new hex.
- **Don't** push body copy to 16px to "feel more readable." The 14px Space Mono body is a system-level decision that holds the contrast with DM Sans 900.
- **Don't** add a tracked uppercase eyebrow above every section heading (the 2023-era kicker). One named brand eyebrow on one or two specific sections per page is fine; eyebrow-on-every-section is AI grammar and is not the ARTT system.
- **Don't** add 01 / 02 / 03 numbered section markers as default scaffolding. Numbers earn their place only when the section _is_ a sequence (drop order, edition number, ordered process).
- **Don't** use gradient text (`background-clip: text` + gradient). Forbidden in the system.
- **Don't** use side-stripe borders (`border-left` > 1px as a colored accent) on cards, callouts, or list items. Forbidden.
- **Don't** introduce countdown timers, percent-off ribbons, urgency banners, or fast-fashion sale language. Scarcity is structural (limited runs, edition numbers, sold-out states), not promotional.
- **Don't** reach for corporate-luxury cues (serif crests, gold flourishes, marble textures) or SaaS grammar (soft gradients, AI-pastel canvases, rounded-everything illustration). Both are explicit anti-references from PRODUCT.md.
- **Don't** introduce a third type family into the storefront. DM Sans + Space Mono is the system; adding a "supporting serif" or "display script" breaks the gallery voice. A documented collection world (ICONS / Bodoni Moda) is the sole exception, and it is scoped to that collection's template.
- **Don't** let a collection world leak. ICONS' void-and-bone palette, Bodoni display, and wide tracking are scoped under `.icons-lp`. They never redefine a storefront token, and they never appear on a default template.
- **Don't** ship a local palette or face without documenting it here first. An undocumented set of `--lp-*`-style tokens in a section file is drift, and drift is how a system stops being one.
- **Don't** rely on color alone for state. Pair availability ("Sold out", "Low stock", "In stock") with text or an icon, not just the state dot. Color blindness coverage is part of the AA floor.
