# ICONS Collection Pre-Launch Conversion Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ICONS collection tease convert — put a working email capture above the fold, fix a dead accessibility handler, and cut mobile page weight — before the Aug 1 launch.

**Architecture:** The subscribe form is extracted from `sections/icons-lookbook.liquid` into a reusable snippet rendered twice (inline in the hero, and after the lookbook grid as a second chance). The hero is sized to the viewport space actually left by the sticky header using existing theme CSS variables. The existing form JavaScript already iterates `querySelectorAll('[data-icons-subscribe]')` and scopes lookups per-form, so a second form needs no submission-logic rewrite.

**Tech Stack:** Shopify Liquid (Horizon theme), vanilla JS in a `{% javascript %}` block, CSS in a `{% stylesheet %}` block, GSAP 3.13 (self-hosted), Klaviyo client-side subscribe API, Shopify CLI + Theme Check.

## Global Constraints

Every task's requirements implicitly include this section.

- **Branch:** `feature/icons-conversion-fold-fix` (the design spec is already committed there).
- **Spec:** `docs/superpowers/specs/2026-07-18-icons-collection-conversion-design.md`.
- **Collection handle is `icon-coilection`** — misspelled, but it is what the runbook, tease URL, and Klaviyo campaign use. Use verbatim. Do **not** rename.
- **Klaviyo:** public key `Uu4Kt7`, list `VTivuP`. Do not change these values.
- **Do not modify `templates/collection.icons.json`** — settings are reused and asset filenames are unchanged.
- **Do not add new schema settings.** The hero submit label reuses the existing `hero_cta` setting.
- **The 24 lookbook asset filenames must not change** (`assets/icons-look-01.webp` … `icons-look-24.webp`).
- **`{% javascript %}` and `{% stylesheet %}` blocks are NOT Liquid-rendered.** Shopify compiles them to static assets, so `{{ ... | asset_url }}` will not work inside them. Pass any Liquid value into JS via a `data-` attribute on the markup.
- **Gates that must pass before each commit:** `npm run lint:theme` (exit 0), `npm run format:check` (exit 0), `npm run lint:js` (0 errors).
- **Line numbers in this plan describe `sections/icons-lookbook.liquid` as it stood when the plan was written (583 lines).** Earlier tasks shift them. Always locate the edit site by the **quoted code**, which is reproduced in full in every step, and treat the line number as a hint only.
- **The type-only fallback hero (`hero_style: type_only`) must keep working** — it is the merchant's escape hatch.
- **The Aug 1 cutover must remain unaffected** — nothing here may interfere with reassigning the collection to the Default template.

---

### Task 1: Extract the subscribe form into a snippet

Pure refactor. The page must render and behave identically when this task is done — same single form, same IDs are allowed to change, no visual change. Doing this first means Task 3 is a one-line render call.

**Files:**

- Create: `snippets/icons-subscribe-form.liquid`
- Modify: `sections/icons-lookbook.liquid:66-99` (the `#icons-subscribe` section)

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: `snippets/icons-subscribe-form.liquid`, rendered as
  `{% render 'icons-subscribe-form', s: s, id_suffix: <string>, variant: <'inline'|'stacked'>, button_label: <string> %}`.
  Emits `<form class="icons-lp__form icons-lp__form--{variant}" data-icons-subscribe>` containing an email input with `id="icons-email-{id_suffix}"`.
  Task 3 renders it a second time; Task 4 relies on the input living inside `#icons-subscribe`.

- [ ] **Step 1: Create the snippet**

Create `snippets/icons-subscribe-form.liquid`:

```liquid
{%- comment -%}
  ICONS subscribe form (Klaviyo, client-side).

  Rendered more than once on the ICONS tease: inline in the hero, and again
  after the lookbook grid. Each instance needs its own input id so the
  <label for> association stays correct — hence id_suffix.

  Accepts:
    s            - {Object} section.settings (Klaviyo keys + msg_* strings)
    id_suffix    - {String} unique per instance: 'hero' | 'footer'
    variant      - {String} 'inline' (hero, single row) | 'stacked' (default)
    button_label - {String} submit button text
{%- endcomment -%}
{%- liquid
  assign input_id = 'icons-email-' | append: id_suffix
  assign form_variant = variant | default: 'stacked'
-%}
<form
  class="icons-lp__form icons-lp__form--{{ form_variant }}"
  data-icons-subscribe
  data-klaviyo-company="{{ s.klaviyo_public_key | escape }}"
  data-klaviyo-list="{{ s.klaviyo_list_id | escape }}"
  data-msg-invalid="{{ s.msg_invalid | escape }}"
  data-msg-loading="{{ s.msg_loading | escape }}"
  data-msg-success="{{ s.msg_success | escape }}"
  data-msg-error="{{ s.msg_error | escape }}"
  novalidate>
  <label class="icons-lp__visually-hidden" for="{{ input_id }}">{{ s.subscribe_placeholder | escape }}</label>
  <input
    id="{{ input_id }}"
    class="icons-lp__input"
    type="email"
    name="email"
    autocomplete="email"
    autocapitalize="off"
    placeholder="{{ s.subscribe_placeholder | escape }}"
    required>
  <input
    class="icons-lp__visually-hidden"
    type="text"
    name="company_website"
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true">
  <button class="icons-lp__submit" type="submit">{{ button_label | escape }}</button>
  <p class="icons-lp__status" data-status role="status" aria-live="polite"></p>
</form>
```

- [ ] **Step 2: Replace the inline form with a render call**

In `sections/icons-lookbook.liquid`, replace the whole `<form ...>…</form>` block (currently lines 69-98, inside `<section class="icons-lp__subscribe" id="icons-subscribe">`) with:

```liquid
    {% render 'icons-subscribe-form',
      s: s,
      id_suffix: 'footer',
      variant: 'stacked',
      button_label: s.subscribe_button %}
```

Leave the surrounding `<section class="icons-lp__subscribe" id="icons-subscribe">`, the kicker `<p>`, and the sub-line `<p>` exactly as they are.

- [ ] **Step 3: Add the variant class to CSS**

In the `{% stylesheet %}` block, immediately after the `.icons-lp__form { … }` rule (currently ends line 249), add:

```css
.icons-lp__form--stacked {
  justify-content: center;
}
```

This preserves the current centered footer layout now that the base class is shared with the future inline variant.

- [ ] **Step 4: Verify nothing changed**

Run:

```bash
npm run lint:theme && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, both commands exit 0.

Then confirm the rendered form is unchanged apart from the input id:

```bash
grep -n "icons-subscribe-form\|icons-email" sections/icons-lookbook.liquid snippets/icons-subscribe-form.liquid
```

Expected: the section contains the `render` call and no `<form>`; the snippet contains `id="{{ input_id }}"`. There must be **no remaining `id="icons-email"`** literal in the section.

- [ ] **Step 5: Commit**

```bash
git add snippets/icons-subscribe-form.liquid sections/icons-lookbook.liquid
git commit -m "refactor(icons): extract subscribe form into a reusable snippet"
```

---

### Task 2: Size the hero to the real available viewport

**Files:**

- Modify: `sections/icons-lookbook.liquid:286-291` (the `.icons-hero` rule)

**Interfaces:**

- Consumes: nothing.
- Produces: a `--icons-hero-avail` custom property on `.icons-hero`, available to any later rule inside the hero.

- [ ] **Step 1: Replace the `.icons-hero` sizing**

Current rule (line 286-291):

```css
.icons-hero {
  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 640px;
  overflow: hidden;
  background: var(--lp-bg);
  color: #f4f1eb;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
```

Replace with:

```css
.icons-hero {
  /* Viewport space actually left over once the sticky header is accounted for.
       --header-group-height and --transparent-header-offset-boolean are defined
       on `body` in sections/header.liquid. When the header is transparent the
       boolean is 1 and it overlays content, so nothing is subtracted. */
  --icons-hero-avail: calc(
    100dvh - var(--header-group-height, 0px) * (1 - var(--transparent-header-offset-boolean, 0))
  );

  position: relative;
  height: 100vh; /* fallback for browsers without dvh */
  height: var(--icons-hero-avail);
  /* Self-limiting floor: a sensible minimum on normal screens that can never
       exceed the space available (a fixed floor overflowed landscape phones). */
  min-height: min(32rem, var(--icons-hero-avail));
  overflow: hidden;
  background: var(--lp-bg);
  color: #f4f1eb;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
```

- [ ] **Step 2: Verify the gates**

Run:

```bash
npm run lint:theme && npm run format:check && npm run lint:css && echo GATES-OK
```

Expected: `GATES-OK`.

- [ ] **Step 3: Verify behaviour in the browser**

Start the dev server (requires store auth — if `shopify theme dev` cannot authenticate, stop and report rather than guessing):

```bash
shopify theme dev --store arttitude-staging
```

Open `http://127.0.0.1:9292/collections/icon-coilection` and confirm at each viewport that the hero's **bottom row** (currently the "Get Notified" button, dots, scarcity line) is fully visible without scrolling:

| Viewport | Why                                                          |
| -------- | ------------------------------------------------------------ |
| 1440×900 | standard desktop                                             |
| 1366×768 | common laptop                                                |
| 375×667  | iPhone SE portrait                                           |
| 667×375  | landscape phone — the case the old `min-height: 640px` broke |

Then, in the theme editor, **enable the announcement bar** and re-check 1366×768. If the bottom row is now clipped, `--header-group-height` does not include the marquee — stop and report; the fallback is documented in the spec (add the marquee height to the calc, or measure with a `ResizeObserver`).

- [ ] **Step 4: Commit**

```bash
git add sections/icons-lookbook.liquid
git commit -m "fix(icons): size hero to viewport minus header so the CTA clears the fold"
```

---

### Task 3: Put the subscribe form inline in the hero

**Files:**

- Modify: `sections/icons-lookbook.liquid:29-33` (the `.icons-hero__bottom` markup)
- Modify: `sections/icons-lookbook.liquid` `{% stylesheet %}` (add inline-variant + hero-scoped field styles)

**Interfaces:**

- Consumes: `snippets/icons-subscribe-form.liquid` from Task 1 (render signature: `s`, `id_suffix`, `variant`, `button_label`).
- Produces: a second live form with input id `icons-email-hero`. The footer form's input id remains `icons-email-footer`.

- [ ] **Step 1: Replace the hero anchor CTA with the form**

Current markup (lines 29-33):

```liquid
        <div class="icons-hero__bottom">
          {% if s.hero_cta != blank %}<a class="icons-hero__cta" href="#icons-subscribe">{{ s.hero_cta | escape }}</a>{% endif %}
          <div class="icons-hero__dots" data-hero-dots aria-hidden="true"></div>
          {% if s.hero_scarcity != blank %}<span class="icons-hero__scarcity">{{ s.hero_scarcity | escape }}</span>{% endif %}
        </div>
```

Replace with:

```liquid
        <div class="icons-hero__bottom">
          {%- assign hero_button_label = s.hero_cta | default: s.subscribe_button -%}
          {% render 'icons-subscribe-form',
            s: s,
            id_suffix: 'hero',
            variant: 'inline',
            button_label: hero_button_label %}
          <div class="icons-hero__dots" data-hero-dots aria-hidden="true"></div>
          {% if s.hero_scarcity != blank %}<span class="icons-hero__scarcity">{{ s.hero_scarcity | escape }}</span>{% endif %}
        </div>
```

The label is resolved with `assign` first rather than piping a filter inside the `render` arguments, which is the portable form.

The `.icons-hero__cta` anchor is intentionally gone — signup now happens in place, with no scroll.

- [ ] **Step 1b: Delete the now-orphaned CTA rules**

`.icons-hero__cta` was used _only_ by the anchor removed in Step 1. The type-only
fallback hero uses a different class (`.icons-lp__cta`) with its own rules, so
these three are now dead code. Delete all of them from the `{% stylesheet %}`
block (currently lines 327, 331, 332):

```css
.icons-hero__cta {
  display: inline-block;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 0.66rem;
  color: var(--lp-bg);
  background: #f4f1eb;
  padding: 0.95rem 2.4rem;
}
@media (prefers-reduced-motion: no-preference) {
  .icons-hero__cta {
    transition: opacity 0.25s ease;
  }
}
.icons-hero__cta:hover {
  opacity: 0.85;
}
```

Do **not** touch any `.icons-lp__cta` rule — the type-only hero still needs it.

Verify nothing references the class afterwards:

```bash
grep -n "icons-hero__cta" sections/icons-lookbook.liquid || echo "NO-REFERENCES-OK"
```

Expected: `NO-REFERENCES-OK`.

- [ ] **Step 2: Add inline-variant and hero-scoped field styles**

In the `{% stylesheet %}` block, directly after the `.icons-lp__form--stacked` rule added in Task 1, add:

```css
.icons-lp__form--inline {
  justify-content: flex-start;
  max-width: 34rem;
  flex: 1 1 22rem;
}

/* The hero sits on dark video, so the fields need light-on-dark treatment. */
.icons-hero .icons-lp__input {
  color: #f4f1eb;
  border-bottom-color: rgba(244, 241, 235, 0.4);
}
.icons-hero .icons-lp__input::placeholder {
  color: rgba(244, 241, 235, 0.6);
}
.icons-hero .icons-lp__input:focus-visible {
  border-bottom-color: #f4f1eb;
}
.icons-hero .icons-lp__submit {
  background: #f4f1eb;
  color: var(--lp-bg);
  letter-spacing: 0.28em;
  font-size: 0.66rem;
  padding: 0.95rem 2.4rem;
}
.icons-hero .icons-lp__status {
  color: rgba(244, 241, 235, 0.75);
}
```

- [ ] **Step 3: Verify the gates**

Run:

```bash
npm run lint:theme && npm run format:check && npm run lint:css && echo GATES-OK
```

Expected: `GATES-OK`.

- [ ] **Step 4: Verify two forms exist with unique ids**

Run:

```bash
grep -c "icons-subscribe-form" sections/icons-lookbook.liquid
```

Expected: `2`.

With `shopify theme dev` running, load `/collections/icon-coilection` and in the browser console run:

```js
document.querySelectorAll('[data-icons-subscribe]').length
// expected: 2
[...document.querySelectorAll('[data-icons-subscribe] input[type=email]')].map(i => i.id)
// expected: ["icons-email-hero", "icons-email-footer"]
```

Both ids must be unique and non-empty — duplicate ids break the `<label for>` association.

- [ ] **Step 5: Verify both forms actually submit**

With the dev server running, submit a test address in the **hero** form and confirm the inline status message reaches the success state. Repeat in the **footer** form with a second address. Then confirm both profiles appear on Klaviyo list `VTivuP`.

If a submission fails, stop and report — do not proceed to later tasks with a broken capture path, since capture is the entire point of the page.

- [ ] **Step 6: Commit**

```bash
git add sections/icons-lookbook.liquid
git commit -m "feat(icons): capture email inline in the hero, no scroll required"
```

---

### Task 4: Fix the dead CTA focus handler

The current handler targets `.icons-lp__cta` (the type-only hero's class) and calls `getElementById('icons-email')`. Neither matches reality now: the live hero used `.icons-hero__cta`, and the input ids changed in Task 1. Make it generic so it works for any anchor pointing at the subscribe section.

**Files:**

- Modify: `sections/icons-lookbook.liquid:419-425` (inside the `{% javascript %}` block)

**Interfaces:**

- Consumes: the `icons-email-footer` input id produced in Task 1.
- Produces: no new interface.

- [ ] **Step 1: Replace the handler**

Current code (lines 419-425):

```js
var ctas = document.querySelectorAll('.icons-lp__cta[href="#icons-subscribe"]');
ctas.forEach(function (cta) {
  cta.addEventListener('click', function () {
    var el = document.getElementById('icons-email');
    if (el) {
      setTimeout(function () {
        el.focus({ preventScroll: true });
      }, 500);
    }
  });
});
```

Replace with:

```js
// Any anchor pointing at the subscribe section moves focus into that
// section's email field once the scroll settles. Bind by href rather than
// by a hero-specific class: the type-only hero uses .icons-lp__cta, and
// binding a single class silently no-ops on the other hero style.
var ctas = document.querySelectorAll('a[href="#icons-subscribe"]');
ctas.forEach(function (cta) {
  cta.addEventListener('click', function () {
    var target = document.getElementById('icons-subscribe');
    var el = target && target.querySelector('input[type="email"]');
    if (el) {
      setTimeout(function () {
        el.focus({ preventScroll: true });
      }, 500);
    }
  });
});
```

- [ ] **Step 2: Verify the gates**

Run:

```bash
npm run lint:theme && npm run lint:js && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, and `lint:js` reports **0 errors** (pre-existing warnings are acceptable).

- [ ] **Step 3: Verify focus moves**

In the theme editor set the section's **Hero style** to **Type only** (this is the path that still has an anchor CTA). Reload, click the CTA, and confirm keyboard focus lands in the footer email field — in the console, `document.activeElement.id` should be `icons-email-footer`.

Set **Hero style** back to **Question video** when done.

- [ ] **Step 4: Commit**

```bash
git add sections/icons-lookbook.liquid
git commit -m "fix(icons): focus the subscribe field from any anchor, not one hero class"
```

---

### Task 5: Load GSAP only when it can be used, and spare phones the video

Both wins are above the fold, which is where they matter. The hero JS already degrades correctly without GSAP — line 478 and 485 both branch on `if (reduce || !window.gsap)` and fall back to an opacity reveal, and the poll at line 514 tolerates a late arrival. So simply not loading GSAP under reduced-motion is safe.

**Files:**

- Modify: `sections/icons-lookbook.liquid:7` (hero element — add data attributes)
- Modify: `sections/icons-lookbook.liquid:10-17` (video markup)
- Modify: `sections/icons-lookbook.liquid:36` (remove the static GSAP tag)
- Modify: `sections/icons-lookbook.liquid` `{% javascript %}` (conditional loaders)

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: `data-gsap-src` and `data-hero-video` attributes read by the hero JS.

- [ ] **Step 1: Pass the GSAP url via a data attribute**

`{% javascript %}` is compiled to a static asset and is **not** Liquid-rendered, so the asset URL must come from markup. Change line 7 from:

```liquid
    <section class="icons-hero" data-icons-hero aria-label="{{ s.hero_topleft | escape }}">
```

to:

```liquid
    <section class="icons-hero" data-icons-hero
      data-gsap-src="{{ 'gsap.min.js' | asset_url }}"
      aria-label="{{ s.hero_topleft | escape }}">
```

- [ ] **Step 2: Remove the unconditional GSAP script tag**

Delete line 36 entirely:

```liquid
      <script src="{{ 'gsap.min.js' | asset_url }}" defer></script>
```

- [ ] **Step 3: Defer the video sources to JS**

Change the video markup (lines 10-17) from rendering `<source>` elements directly to carrying them as JSON. Replace:

```liquid
        {% if s.hero_video != blank %}
          <video class="icons-hero__video" autoplay muted loop playsinline preload="metadata"
            {% if s.hero_poster != blank %}poster="{{ s.hero_poster | image_url: width: 1600 }}"{% elsif s.hero_video.preview_image %}poster="{{ s.hero_video.preview_image | image_url: width: 1600 }}"{% endif %}>
            {% for source in s.hero_video.sources %}
              {% if source.format == 'mp4' or source.format == 'webm' %}<source src="{{ source.url }}" type="video/{{ source.format }}">{% endif %}
            {% endfor %}
          </video>
        {% endif %}
```

with:

```liquid
        {% if s.hero_video != blank %}
          <video class="icons-hero__video" data-hero-video autoplay muted loop playsinline preload="none"
            {% if s.hero_poster != blank %}poster="{{ s.hero_poster | image_url: width: 1600 }}"{% elsif s.hero_video.preview_image %}poster="{{ s.hero_video.preview_image | image_url: width: 1600 }}"{% endif %}>
          </video>
          <script type="application/json" data-hero-video-sources>
            [{% for source in s.hero_video.sources %}{% if source.format == 'mp4' or source.format == 'webm' %}{"src": {{ source.url | json }}, "type": "video/{{ source.format }}"}{% unless forloop.last %},{% endunless %}{% endif %}{% endfor %}]
          </script>
        {% endif %}
```

The poster still renders for everyone, so the hero never looks empty. `preload="none"` guarantees no bytes are fetched until sources are attached.

- [ ] **Step 4: Add the conditional loaders to the JS block**

Inside the `{% javascript %}` block, in the hero IIFE that begins at line 428 (`var root = document.querySelector('[data-icons-hero]');`), immediately after the existing `var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;` line (line 443), add:

```js
var saveData = !!(navigator.connection && navigator.connection.saveData);

// GSAP drives the kinetic reveal only when motion is allowed. Under
// reduced-motion the hero already falls back to an opacity fade, so
// fetching 71KB would be pure waste.
if (!reduce && !window.gsap && root.dataset.gsapSrc) {
  var gs = document.createElement('script');
  gs.src = root.dataset.gsapSrc;
  gs.defer = true;
  document.head.appendChild(gs);
}

// The backdrop video is decorative. Phones, reduced-motion users, and
// Save-Data users keep the poster image instead of pulling an MP4.
(function () {
  var video = root.querySelector('[data-hero-video]');
  var payload = root.querySelector('[data-hero-video-sources]');
  if (!video || !payload) return;
  var wideEnough = matchMedia('(min-width: 750px)').matches;
  if (reduce || saveData || !wideEnough) return;

  var sources;
  try {
    sources = JSON.parse(payload.textContent);
  } catch (e) {
    return;
  }
  if (!sources || !sources.length) return;

  sources.forEach(function (s) {
    var el = document.createElement('source');
    el.src = s.src;
    el.type = s.type;
    video.appendChild(el);
  });
  video.load();
})();
```

- [ ] **Step 5: Verify the gates**

Run:

```bash
npm run lint:theme && npm run lint:js && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, `lint:js` 0 errors.

- [ ] **Step 6: Verify the conditional loading**

With `shopify theme dev` running, open `/collections/icon-coilection` and use the browser DevTools Network panel:

| Condition                                        | Expected                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Desktop width ≥ 750px, motion allowed            | `gsap.min.js` **is** requested; the MP4 **is** requested; questions animate                                                     |
| Emulate a 375px-wide phone, reload               | MP4 is **not** requested; poster image displays; page still reads correctly                                                     |
| Emulate `prefers-reduced-motion: reduce`, reload | `gsap.min.js` is **not** requested; MP4 is **not** requested; the question still appears via the opacity fade and still rotates |

The third row is the important regression check: the hero must still cycle questions with GSAP absent.

- [ ] **Step 7: Commit**

```bash
git add sections/icons-lookbook.liquid
git commit -m "perf(icons): load GSAP and hero video only where they're usable"
```

---

### Task 6: Re-encode the lookbook images

2.0 MB across 24 files, served at full 1530×2048 to every device. `srcset` is impossible here because the block setting is a _text filename_ rendered through `asset_url`, and Shopify's CDN transforms do not apply to theme assets — so the fix is to ship smaller files under the same names.

**Files:**

- Modify: `assets/icons-look-01.webp` … `assets/icons-look-24.webp` (24 files, in place)
- Modify: `sections/icons-lookbook.liquid:54-60` (the `<img>` intrinsic dimensions)

**Interfaces:**

- Consumes: nothing.
- Produces: no code interface. Filenames are unchanged, so no template or JSON references move.

- [ ] **Step 1: Record the baseline**

```bash
ls -l assets/icons-look-*.webp | awk '{s+=$5; n++} END {printf "count=%d total=%.2f MB\n", n, s/1048576}'
identify -format "%f %wx%h\n" assets/icons-look-01.webp 2>/dev/null || sips -g pixelWidth -g pixelHeight assets/icons-look-01.webp
```

Expected baseline: `count=24 total=2.00 MB`, and image dimensions `1530x2048` (aspect ratio 0.747).

- [ ] **Step 2: Re-encode to ~1000px wide, preserving aspect ratio**

Target dimensions are **1000×1339** — that is 1000px on the _short_ edge (width); the long edge (height) becomes 1339. 1530×2048 has ratio 0.7471; 1000×1339 is 0.7468, equal within rounding.

**Every one of the 24 files must end up with identical dimensions**, because the grid relies on a uniform ratio.

Prefer the `optimize-images` skill, which handles encoding and quality tuning. If it is unavailable, this produces the same result with `cwebp` (quality 82 lands near the 1.0 MB target):

```bash
cd /Users/gris/Development/artt-horizon
for f in assets/icons-look-*.webp; do
  cwebp -q 82 -resize 1000 0 "$f" -o "$f.tmp" && mv "$f.tmp" "$f"
done
```

`-resize 1000 0` sets the width to 1000 and lets the height scale proportionally, which preserves the ratio exactly. Re-run Step 1's baseline command afterwards to compare.

- [ ] **Step 3: Verify the re-encode**

```bash
ls -l assets/icons-look-*.webp | awk '{s+=$5; n++} END {printf "count=%d total=%.2f MB\n", n, s/1048576}'
for f in assets/icons-look-*.webp; do sips -g pixelWidth -g pixelHeight "$f" | tr '\n' ' '; echo; done | sort -u -k3 | head
```

Expected: still `count=24`, total meaningfully below 2.00 MB (target ≈1.0 MB), and **every file reporting identical dimensions**. If any file differs in size ratio from the others, stop — a mismatched ratio will visibly break the grid.

- [ ] **Step 4: Update the intrinsic dimensions in markup**

The `<img>` currently hardcodes the old size (lines 54-60). Change:

```liquid
              width="1530"
              height="2048"
```

to match the new intrinsic size:

```liquid
              width="1000"
              height="1339"
```

These attributes reserve layout space before the image loads. If they disagree with the real file, the perf win is traded for a layout-shift bug.

- [ ] **Step 5: Verify the gates and the grid**

```bash
npm run lint:theme && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`.

With `shopify theme dev` running, load `/collections/icon-coilection`, scroll the full lookbook grid and confirm: all 24 images render, the grid is visually unchanged in proportion, and no image appears stretched or cropped differently from its neighbours.

- [ ] **Step 6: Commit**

```bash
git add assets/icons-look-*.webp sections/icons-lookbook.liquid
git commit -m "perf(icons): re-encode lookbook assets and correct intrinsic dimensions"
```

---

### Task 7: Point the homepage hero at the ICONS collection

**Files:**

- Modify: `templates/index.json:150-162` (block `button_QFiR43` in section `hero_jVaWmY`)

**Interfaces:**

- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Repoint the button**

That hero already carries ICONS copy ("Every icon leaves a question.") and the ICONS background video, so its "Shop Sale" button pointing at `seven-deadly-sins` is a stale mismatch. In `templates/index.json`, in the `button_QFiR43` settings, change exactly two values:

```json
                "label": "Discover ICONS",
                "link": "shopify://collections/icon-coilection",
```

Leave `open_in_new_tab`, `style_class`, `width`, `custom_width`, `width_mobile`, and `custom_width_mobile` untouched. Do not reformat the rest of the file — it is Shopify-auto-generated.

Note the handle really is `icon-coilection` (misspelled). Do not "fix" it; the runbook, tease URL, and Klaviyo campaign all depend on it.

- [ ] **Step 2: Verify the JSON is still valid**

```bash
perl -0pe 's{/\*.*?\*/}{}s' templates/index.json | python3 -c "import sys,json; json.load(sys.stdin); print('index.json VALID')"
npm run format:check && echo FORMAT-OK
```

Expected: `index.json VALID` and `FORMAT-OK`.

- [ ] **Step 3: Verify the link**

With `shopify theme dev` running, load `http://127.0.0.1:9292/`, confirm the first hero's button reads **Discover ICONS**, click it, and confirm it lands on `/collections/icon-coilection` showing the tease.

- [ ] **Step 4: Commit**

```bash
git add templates/index.json
git commit -m "feat(home): point the ICONS hero at the ICONS collection"
```

---

### Task 8: Update the manifest and run final verification

`CUSTOMIZATIONS.md` is this repo's record of every deviation from the Horizon boilerplate; the ICONS entry is now out of date.

**Files:**

- Modify: `CUSTOMIZATIONS.md` (the "ICONS Pre-Launch Collection Tease" entry)

**Interfaces:**

- Consumes: all prior tasks.
- Produces: nothing.

- [ ] **Step 1: Update the ICONS entry**

In the `### ICONS Pre-Launch Collection Tease` section, add these bullets to the existing list:

```markdown
- **Added:** `snippets/icons-subscribe-form.liquid` — the Klaviyo subscribe form, rendered twice (inline in the hero, and after the lookbook grid). `id_suffix` keeps each instance's input id unique so `<label for>` stays correct.
- **Changed (2026-07-18):** the hero is sized to `100dvh` minus the header's real footprint (`--header-group-height`, skipped when the header is transparent) with a self-limiting `min-height`, so the CTA clears the fold on laptops and landscape phones.
- **Changed (2026-07-18):** email capture is inline in the hero — no scroll needed. The form after the grid remains as a second chance.
- **Changed (2026-07-18):** GSAP and the hero video load only where usable (motion allowed, ≥750px, not Save-Data); phones and reduced-motion users get the poster.
- **Changed (2026-07-18):** lookbook assets re-encoded to 1000×1339 in place; `<img>` intrinsic dimensions updated to match.
- **Known limitation:** `srcset` is not possible for the lookbook — the block stores a theme-asset _filename_ and Shopify's CDN transforms only apply to uploaded images.
```

- [ ] **Step 2: Run every gate**

```bash
npm run lint:js && npm run lint:css && npm run format:check && npm run lint:theme && echo ALL-GATES-OK
```

Expected: `ALL-GATES-OK` (`lint:js` 0 errors; pre-existing warnings acceptable).

- [ ] **Step 3: Full behavioural pass**

With `shopify theme dev` running, walk the whole spec's verification table one more time on `/collections/icon-coilection`:

- Hero bottom row visible without scrolling at 1440×900, 1366×768, 375×667, 667×375.
- Re-check 1366×768 with the announcement bar enabled.
- Submit from the hero form and from the footer form; both profiles land on Klaviyo list `VTivuP`.
- Keyboard-tab reaches the hero form; the status message is announced.
- Under reduced-motion: no GSAP request, no MP4 request, questions still rotate.
- Homepage hero button reads "Discover ICONS" and reaches the tease.

- [ ] **Step 4: Confirm the Aug 1 cutover still works**

In the theme editor, reassign the ICONS collection to the **Default** template, confirm it renders a normal (currently empty) collection page with no console errors, then set it back to the **ICONS** template. This proves the launch-day flip is unaffected.

- [ ] **Step 5: Commit and open the PR**

```bash
git add CUSTOMIZATIONS.md
git commit -m "docs(icons): record pre-launch conversion changes in the manifest"
git push -u origin feature/icons-conversion-fold-fix
gh pr create --base develop --title "ICONS pre-launch conversion fixes" --body "Implements docs/superpowers/specs/2026-07-18-icons-collection-conversion-design.md"
```

Target `develop`, not `main` — that is this repo's integration branch.

---

## Deferred (explicitly not in this plan)

- The `icon-coilection` handle typo — renaming before Aug 1 would break the cutover and needs a URL redirect.
- Post-Aug-1 product grid audit — the collection is empty until launch.
- Migrating lookbook images to `image_picker` for true `srcset`.
- The press/media page — separate spec.
