# Desktop mega menu: flat submenu column wraps against empty panel

**Date:** 2026-08-04
**Status:** Approved design, ready for implementation plan
**Branch:** `worktree-megamenu-flat-column-wrap` (based on `develop`)

## Problem

On desktop, hovering **COLLECTIONS** in the header drops a full-bleed panel
whose collection names wrap mid-title — "Seven Deadly Sins Collection" breaks
across two lines, as do "Memento Mori Collection" and "ARTT Original
Collection" — while roughly five-sixths of the panel to the right is empty.
The wrapping reads as a bug precisely because there is so obviously room.

## Root cause

Three facts compose into the defect.

1. **The panel is always viewport-width.** `blocks/_header-menu.liquid:410`
   sets `.menu-list__submenu` to `position: absolute; width: 100%`.

2. **Its inner grid is hard-coded to six equal tracks.** `_header-menu.liquid:136`
   renders `mega-menu-list` with `grid_columns_count: 6`, and
   `.mega-menu__grid` (line 626) resolves to
   `repeat(6, minmax(0, 1fr))` at ≥990px.

3. **A flat submenu stacks into exactly one of those tracks.**
   `snippets/mega-menu-list.liquid:82-107` opens a `.mega-menu__column` and
   only closes it when the _next_ link has children of its own. COLLECTIONS'
   six children are all leaf links, so the column is never closed and all six
   stack inside it.

`.mega-menu__list` (line 687) is `grid-template-columns: subgrid` spanning
`--menu-columns-desktop`, so it adopts the parent's six `1fr` tracks rather
than making its own. Its single `<li>` takes track 1:

> **~270px at a 1920px viewport.** "Seven Deadly Sins Collection" needs ~340px.

### The variable is a span count, not a width

The generated rule is a red herring worth naming explicitly, because it is
where the eye lands first:

```css
[data-menu-list-id='MegaMenuList-1'] {
  --menu-columns-desktop: 6;
  --menu-columns-tablet: 4;
}
```

That `6` feeds `grid-column: span 6` — how many tracks the _list_ occupies —
not how wide its column is. Lowering it would shrink the list's footprint
while leaving the `<li>` on a track that is still 1/6 of the panel. **Track
width is what has to change, and it is owned by `subgrid`.**

### Why the panel is empty (context, not in scope)

`sections/header-group.json:50` sets `menu_style: "featured_products"` for the
whole header menu block. `mega-menu-list.liquid:64-72` honours that mode only
when the top-level link _is_ a collection:

```liquid
if menu_content_type == 'featured_products'
  if parent_link.type == 'collection_link'      → its products
  elsif catalog_link / collections_link         → collections.all
  else                                          → menu_content_type = 'text'
```

MEN / WOMEN / ACCESSORIES point at collections and get product cards.
COLLECTIONS does not, so it degrades silently to bare text — which is also why
`max_menu_columns` is never decremented and stays at `6` in the CSS above.

**Filling that space is deliberately deferred to a separate spec.** It is a
distinct defect with a distinct fix (a `featured_collections` fallback plus a
two-part panel layout), and bundling it would turn a one-declaration CSS change
into a change in how the panel composes.

## Goal

Flat submenus render one collection name per line at desktop widths, with no
change to any menu that has featured content or nested sublists.

**Non-goals:** filling the empty right side; changing the panel's full-bleed
treatment; touching the mobile drawer.

## Design

One declaration, added beside the existing `.mega-menu__list` rule at
`blocks/_header-menu.liquid:687`:

```css
/* A submenu whose links are all flat (no grandchildren) stacks into a single
   column, which subgrid pins to one 1/6 track (~270px @1920px) — long
   collection names wrap while five-sixths of the panel sits empty. Opt just
   that case out of subgrid so the column sizes to its longest label. */
.mega-menu__list:not(:has(ul, .mega-menu__link-image)):has(> .mega-menu__column:only-child) {
  grid-template-columns: minmax(0, max-content);
}
```

> **Do not fold the exclusions into the `:has()` argument.** Selectors Level 4
> forbids `:has()` inside another `:has()`, so a selector like
> `:has(> .mega-menu__column:only-child:not(:has(ul)))` is invalid and every
> browser silently drops the entire rule — a fix that appears to ship and does
> nothing. `:not(:has(…))` on the subject is valid; only nesting inside a
> `:has()` argument is not.

### Why `minmax(0, max-content)` rather than `max-content`

A single track with a `0` minimum has base size 0 and growth limit
`max-content`. Track maximization then grows the base toward that limit but is
bounded by available space, so the used size is `min(max-content, container)`.

The track therefore expands to the longest label when the panel has room and
falls back to wrapping when it does not. A bare `max-content` track would
overflow the panel instead, and would need an arbitrary cap (`max-width: 40ch`)
to be safe. This formulation is self-limiting and carries no magic number.

To be precise about when the fallback engages: **only when the panel is
narrower than the longest label** (~337px for "Seven Deadly Sins Collection").
That does not happen at any real breakpoint — a tablet panel is ~950px, and the
drawer replaces this menu on mobile. So the floor is a _safety property_, not
an expected behaviour: it guarantees the column can never push the panel into
horizontal scroll, however long a collection gets named.

### Why the selector is narrow

Each guard excludes a case that would regress. The first two are combined into
the single `:not(:has(ul, .mega-menu__link-image))` above, but are worth
justifying separately:

| Guard                                | Excludes                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:not(:has(ul))`                     | Any list with a nested sublist. This also covers wide columns implicitly: a column only spans 2–4 tracks when it holds more than ten child links, which always emits a nested `<ul style="column-count: N">` whose multicol needs a known width. An explicit `--span-1` guard would be redundant. |
| `:not(:has(.mega-menu__link-image))` | `collection_images` mode. Its columns are one-per-link, so `:only-child` already excludes it whenever there are two or more links — but a single-link image menu would otherwise match, and a `max-content` track would size to the image's _intrinsic_ width rather than its `width: 100%`.      |
| `:only-child`                        | Multi-column lists, which must stay on subgrid to keep their columns mutually aligned.                                                                                                                                                                                                            |

### Blast radius

Nothing else moves. `.mega-menu__content` is right-anchored via
`grid-column: span N / -1` and is absent in the matched case anyway. Menus with
featured content keep both their subgrid and their track widths.

`:has()` is already used 13 times in this file, so the technique is idiomatic
here rather than newly introduced. Browsers without support (pre-Safari 15.4,
pre-Chrome 105) fall through to today's wrapping — a graceful floor, not a
break.

### Evidence

The rule was measured in Chromium against a harness reproducing the grid
structure verbatim (six `1fr` tracks, subgrid list, 20px monospace links), to
confirm the selector parses and the guards hold.

**Selector survives parsing** — `selectorText` reads back intact, so the rule is
not dropped.

**Case A, the flat COLLECTIONS list**, at a 1840px panel:

|        | Column width | "Seven Deadly Sins Collection" | List height |
| ------ | ------------ | ------------------------------ | ----------- |
| Before | 273px        | **2 line boxes** (46px)        | 255px       |
| After  | 337px        | **1 line box** (23px)          | 186px       |

**Guards hold.** Three control cases stay pinned at 273px, i.e. unchanged:
a single column _with_ a nested sublist, a two-column list, and a single-link
`collection_images` column.

**The floor works.** Narrowing the panel: 400px → column 337px, one line;
260px → column shrinks to 260px and wraps, still inside the panel. It only
escapes below ~200px, the min-content width of the longest word — unreachable
here, since the panel is viewport-width and the drawer takes over on mobile.

## Files touched

| File                         | Change                                             |
| ---------------------------- | -------------------------------------------------- |
| `blocks/_header-menu.liquid` | One CSS rule beside `.mega-menu__list` (~line 687) |
| `CUSTOMIZATIONS.md`          | New entry — the file is not yet tracked there      |

## Verification

Checked by the maintainer in the Shopify theme editor:

1. **1920px — COLLECTIONS.** Each of the six names on one line. "Seven Deadly
   Sins Collection" is the case to watch.
2. **1920px — MEN / WOMEN / ACCESSORIES.** Product cards and their link columns
   pixel-unchanged. This is the regression check that matters most.
3. **Tablet (<990px).** Names still on one line — the panel is ~950px, so the
   column stays at its ~337px content width. The check here is that the page
   does **not** scroll horizontally. (Do not expect wrapping to return at this
   width; the floor engages only below ~337px, which no breakpoint reaches.)
4. **Any menu with nested sublists**, if one exists in the main menu, to confirm
   the `:not(:has(ul, …))` guard holds it out.

## Follow-up (not this change)

COLLECTIONS' empty right side. Two candidate approaches were sketched: cards for
its own child collections via a `featured_collections` fallback (imagery matches
the links beside it), or products from `collections.all` (matches the sibling
tabs' look, but the products bear no relation to the links). Either needs the
panel to become a `max-content 1fr` two-part layout, because adding featured
content decrements `max_menu_columns` and would otherwise collide with the
widened text column.
