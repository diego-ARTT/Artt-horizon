# Product

## Register

brand

## Users

Art collectors, tastemakers, streetwear devotees, and young creators who treat fashion as self-expression. They arrive with intent — drawn by a drop, a collab, a piece they've seen on someone — and they're scanning for what's unique, unrepeatable, and personal. They don't follow trends; they want to be early to something that signals taste. Mobile-first, image-first, low patience for generic e-commerce friction.

## Product Purpose

Arttitude is a California fashion house founded by Sylvain and Amrita Castet that turns fine art into wearable streetwear in limited drops. The storefront's job is to make each drop feel rare and worth committing to: surface the art behind the garment, sell the scarcity ("no repeats, no replicas, only originals") without resorting to discount-store urgency, and convert intent into a purchase without breaking the editorial spell.

Success = the site reads as an extension of the brand (a gallery you can buy from), not as a Shopify theme with a logo on it.

## Brand Personality

**Raw · Cultural · Streetwear.**

Voice is direct, art-rooted, and culture-aware. Confident without being precious. Drops, collabs, and the people behind the brand (founders, artists) are part of the story — surface them, don't hide them. Copy is specific, not aphoristic; it names the artist, the collab, the city, the run size, never reaches for "elevate" or "curated" filler.

Emotional goals on the surface: _rarity, intent, belonging to something small._ Not luxury formality, not hype-bro shouting.

## Anti-references

This must explicitly NOT look like:

- **Generic Shopify fashion theme** — the hero → featured collection → reviews → newsletter stack. The default Horizon shape is the starting point, not the destination; sections need editorial reasoning to keep.
- **Fast-fashion / discount energy** — Shein, Fashion Nova, countdown urgency, "% OFF" banners, screaming sale ribbons. Scarcity here is structural (limited runs), not promotional.
- **Corporate luxury** — Gucci/LV-style serif crests, gold flourishes, marble textures, old-money formality. Wrong posture; ARTT is street-rooted, not heritage-rooted.
- **Generic SaaS / startup aesthetic** — soft gradients, pastel illustrations, rounded-everything, AI-default warm cream backgrounds. No SaaS visual grammar belongs on a fashion house storefront.

Closer reference territory (for tone, not for cloning): the gallery-meets-product energy of art-fashion crossovers (Off-White, KAWS collabs, CdG storefronts) and the editorial restraint of independent labels (Our Legacy, Cavempt, Mfpen, Acne Studios storefront) — minimal nav, oversized type, photography does the lifting, white space is structural.

## Design Principles

1. **The art is the hero.** Garment imagery, artwork, and editorial photography lead every layout. Type, UI chrome, and nav step back to let the work breathe. If a section can be simplified by removing UI and enlarging the image, do it.
2. **Scarcity is structural, not promotional.** Communicate "limited" through pacing, sequence numbers, edition counts, and "sold out" treatment — never through urgency timers or discount language. Let the math speak for itself.
3. **Editorial pacing over template pacing.** Spacing, section rhythm, and typographic scale should feel composed (like a magazine spread or gallery wall), not boxed (like a CMS grid). Vary section widths, image scales, and rhythm intentionally per page.
4. **Name names.** The founders, artists, collaborators, cities, and run sizes are the story. Surface them explicitly in copy and metadata; don't abstract them into "our community" or "our creators."
5. **Mono + display as voice.** Space Mono (body) + DM Sans (display) is already a deliberate pairing — mono for editorial labels, captions, and product metadata; display for headlines and drop names. Lean into the contrast; don't sand it down toward a single neutral sans.

## Accessibility & Inclusion

- **WCAG 2.2 AA** is the floor across the storefront.
- Body text ≥ 4.5:1 against its background; large headings ≥ 3:1. The current `#000000cf` (~81% black) on white is borderline for body — keep it under review when used on tinted or imagery-overlaid surfaces.
- Keyboard navigation works for all add-to-cart, variant, drawer, and filter interactions; visible focus states on every interactive element.
- Reduced-motion support is required for any drop reveal, scroll-driven, or hover-driven animation; default to a crossfade or instant transition under `prefers-reduced-motion: reduce`.
- Don't rely on color alone for availability ("sold out", "low stock", sale): pair with text or an icon.
- Image alt text describes the garment and, where relevant, the artwork it features — not generic "product image."
