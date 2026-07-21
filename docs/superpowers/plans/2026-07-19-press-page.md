# ARTT Press Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working press kit so a journalist on deadline can get the logo, quote the boilerplate, cite founding facts, and see prior coverage without emailing anyone.

**Architecture:** One new section, `sections/press-kit.liquid`, owns the press-kit content model — `download`, `fact` and `coverage` blocks plus a quotable boilerplate with copy-to-clipboard. Page furniture (orientation + `mailto:` contact, founder bios) is composed in `templates/page.press.json` from sections Horizon already ships. Purely additive: no existing theme file is modified.

**Tech Stack:** Shopify Liquid (Horizon theme), section `{% schema %}` with block types, CSS in a `{% stylesheet %}` block, one small vanilla-JS clipboard handler in a `{% javascript %}` block.

## Global Constraints

Every task's requirements implicitly include this section.

- **Branch:** `feature/press-page` (the spec is already committed there).
- **Spec:** `docs/superpowers/specs/2026-07-19-press-page-design.md`.
- **Purely additive.** Do NOT modify any existing theme file. The only pre-existing file touched anywhere in this plan is `CUSTOMIZATIONS.md`, in the final task.
- **No new fonts, no new tokens, no local palette.** This page uses the storefront system. DESIGN.md's `The Collection World Rule` requires a narrative reason for a per-surface world and a press kit is not one. Do not copy the ICONS `--lp-*` pattern.
- **Heading levels:** the page `<h1>` comes from the page template. Every heading this section renders is an `<h2>`. The section must never emit an `<h1>`.
- **Shopify has no generic file-picker setting type** (only `image_picker` and `video`), so file links are `url` settings. This is not an oversight — do not "improve" it to a picker that doesn't exist.
- **The `download` attribute will not fire** for `cdn.shopify.com` URLs (cross-origin). Keep the attribute anyway, always pair it with `target="_blank" rel="noopener"`, and tell the merchant to zip multi-file assets. Do not spend effort trying to force downloads with JS.
- **Section wrapper convention** (copied from this repo's own `sections/media-quote-carousel.liquid`, lines 170-172) — follow it exactly:
  ```liquid
  <div class="section-background color-{{ section.settings.color_scheme }}"></div>
  <div class="section section--{{ section.settings.section_width }} color-{{ section.settings.color_scheme }} spacing-style"
    style="{% render 'spacing-style', settings: section.settings %}">
  ```
- **Gates before every commit:** `npm run lint:theme` (exit 0; baseline **0 errors / 54 warnings**), `npm run lint:js` (**0 errors**; pre-existing warnings fine), `npm run lint:css` (exit 0), `npm run format:check` (exit 0).
- **No gate parses the CSS inside `{% stylesheet %}`** — stylelint only reads `assets/**/*.css` and `.prettierignore` excludes `*.liquid`. After every CSS edit you MUST read the block back and confirm brace/paren balance by hand. A stray brace will pass all four gates.
- **`.prettierignore` now excludes `templates/*.json`**, so `templates/page.press.json` is deliberately not format-checked. Validate it by parsing it as JSON instead (command given in Task 5).
- **No Shopify store credentials exist.** Do NOT attempt `shopify theme dev` or any browser check. Where a step needs a browser, skip it and say so in your report; the human verifies at a checkpoint.

---

### Task 1: Press-kit section skeleton + download blocks

The first deliverable is a working downloads list. Facts, coverage and boilerplate land in later tasks so each can be reviewed on its own.

**Files:**

- Create: `sections/press-kit.liquid`

**Interfaces:**

- Consumes: `snippets/spacing-style.liquid` (existing Horizon snippet; takes `settings:`).
- Produces: section type `press-kit`; block type `download` with settings `label`, `description`, `file_url`, `meta`; CSS classes `.press-kit`, `.press-kit__heading`, `.press-kit__list`, `.press-kit__row`, `.press-kit__link`, `.press-kit__label`, `.press-kit__desc`, `.press-kit__meta`. Tasks 2-4 add markup inside the same wrapper and reuse `.press-kit__heading`.

- [ ] **Step 1: Create the section file**

Create `sections/press-kit.liquid`:

```liquid
{%- liquid
  assign s = section.settings
  assign downloads = section.blocks | where: 'type', 'download'
-%}
<div class="section-background color-{{ s.color_scheme }}"></div>
<div
  class="section section--{{ s.section_width }} color-{{ s.color_scheme }} spacing-style press-kit"
  style="{% render 'spacing-style', settings: section.settings %}"
>
  {% if downloads.size > 0 %}
    <section class="press-kit__group" aria-labelledby="press-kit-downloads-{{ section.id }}">
      <h2 class="press-kit__heading" id="press-kit-downloads-{{ section.id }}">{{ s.downloads_heading | escape }}</h2>
      <ul class="press-kit__list" role="list">
        {% for block in downloads %}
          {% if block.settings.label != blank and block.settings.file_url != blank %}
            <li class="press-kit__row" {{ block.shopify_attributes }}>
              <a
                class="press-kit__link"
                href="{{ block.settings.file_url | escape }}"
                download
                target="_blank"
                rel="noopener"
              >
                <span class="press-kit__label">{{ block.settings.label | escape }}</span>
                {% if block.settings.description != blank %}
                  <span class="press-kit__desc">{{ block.settings.description | escape }}</span>
                {% endif %}
                {% if block.settings.meta != blank %}
                  <span class="press-kit__meta">{{ block.settings.meta | escape }}</span>
                {% endif %}
              </a>
            </li>
          {% endif %}
        {% endfor %}
      </ul>
    </section>
  {% endif %}
</div>

{% stylesheet %}
  .press-kit__group + .press-kit__group {
    margin-block-start: 4rem;
  }
  .press-kit__heading {
    margin: 0 0 1.5rem;
  }
  .press-kit__list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-block-start: 1px solid var(--color-border);
  }
  .press-kit__row {
    border-block-end: 1px solid var(--color-border);
  }
  .press-kit__link {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25rem 1.5rem;
    align-items: baseline;
    min-height: 44px;
    padding: 1.25rem 0;
    text-decoration: none;
    color: inherit;
  }
  .press-kit__label {
    grid-column: 1;
    font-size: 1.5rem;
    line-height: 1.2;
  }
  .press-kit__desc {
    grid-column: 1;
    font-size: 0.875rem;
    line-height: 1.6;
    opacity: 0.8;
  }
  .press-kit__meta {
    grid-column: 2;
    grid-row: 1;
    font-size: 0.75rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.7;
  }
  @media (prefers-reduced-motion: no-preference) {
    .press-kit__link {
      transition: opacity 0.2s ease;
    }
  }
  .press-kit__link:hover {
    opacity: 0.7;
  }
  .press-kit__link:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 4px;
  }
  @media screen and (max-width: 749px) {
    .press-kit__link {
      grid-template-columns: 1fr;
    }
    .press-kit__meta {
      grid-column: 1;
      grid-row: auto;
    }
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Press kit",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "downloads_heading", "label": "Downloads heading", "default": "Press kit" },
    {
      "type": "select",
      "id": "section_width",
      "label": "Section width",
      "options": [
        { "value": "page-width", "label": "Page" },
        { "value": "full-width", "label": "Full" }
      ],
      "default": "page-width"
    },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding-block-start", "label": "Top padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 48 },
    { "type": "range", "id": "padding-block-end", "label": "Bottom padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 48 }
  ],
  "blocks": [
    {
      "type": "download",
      "name": "Download",
      "settings": [
        { "type": "text", "id": "label", "label": "Label", "default": "Logo pack" },
        { "type": "text", "id": "description", "label": "Description", "info": "One line. What the file contains." },
        { "type": "url", "id": "file_url", "label": "File URL", "info": "Upload under Content > Files, then paste the URL. Zip anything with more than one file — a .zip downloads reliably, a loose SVG or JPG opens in the browser instead." },
        { "type": "text", "id": "meta", "label": "Format and size", "info": "Typed by hand, e.g. \"SVG, PNG · 2 MB\". Update it if you swap the file." }
      ]
    }
  ],
  "presets": [{ "name": "Press kit" }]
}
{% endschema %}
```

- [ ] **Step 2: Verify the schema parses and the CSS is balanced**

The gates do not check either of these. Run:

```bash
python3 - <<'PY'
import re, json
src = open('sections/press-kit.liquid').read()
schema = re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}', src, re.S).group(1)
d = json.loads(schema)
print("schema VALID |", len(d['settings']), "settings |", [b['type'] for b in d['blocks']])
css = re.search(r'\{%\s*stylesheet\s*%\}(.*?)\{%\s*endstylesheet\s*%\}', src, re.S).group(1)
depth = 0; neg = False
for c in css:
    if c == '{': depth += 1
    elif c == '}':
        depth -= 1
        if depth < 0: neg = True
print(f"braces end {depth} | went negative {neg} | parens {css.count('(') - css.count(')')}")
print("emits h1 (must be False):", '<h1' in src)
PY
```

Expected: `schema VALID | 5 settings | ['download']`, `braces end 0 | went negative False | parens 0`, `emits h1 (must be False): False`.

- [ ] **Step 3: Run the gates**

```bash
npm run lint:theme && npm run lint:css && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`. `lint:theme` must report **0 errors** and **54 warnings** — a higher warning count means this section introduced one.

- [ ] **Step 4: Commit**

```bash
git add sections/press-kit.liquid
git commit -m "feat(press): press-kit section with download blocks"
```

---

### Task 2: Fast facts

**Files:**

- Modify: `sections/press-kit.liquid`

**Interfaces:**

- Consumes: the wrapper, `.press-kit__group` and `.press-kit__heading` from Task 1.
- Produces: block type `fact` with settings `term`, `value`; CSS classes `.press-kit__facts`, `.press-kit__term`, `.press-kit__value`.

- [ ] **Step 1: Add the facts markup**

In `sections/press-kit.liquid`, add `assign facts = section.blocks | where: 'type', 'fact'` to the opening `{%- liquid -%}` block, then insert this immediately after the closing `{% endif %}` of the downloads group and before the wrapper's closing `</div>`:

```liquid
  {% if facts.size > 0 %}
    <section class="press-kit__group" aria-labelledby="press-kit-facts-{{ section.id }}">
      <h2 class="press-kit__heading" id="press-kit-facts-{{ section.id }}">{{ s.facts_heading | escape }}</h2>
      <dl class="press-kit__facts">
        {% for block in facts %}
          {% if block.settings.term != blank and block.settings.value != blank %}
            <div class="press-kit__fact" {{ block.shopify_attributes }}>
              <dt class="press-kit__term">{{ block.settings.term | escape }}</dt>
              <dd class="press-kit__value">{{ block.settings.value | escape }}</dd>
            </div>
          {% endif %}
        {% endfor %}
      </dl>
    </section>
  {% endif %}
```

A `<dl>` is correct here: these are term/value pairs, not a table and not prose. The `<div>` wrapper around each pair is valid HTML inside `<dl>` and is what makes them styleable as rows.

- [ ] **Step 2: Add the facts CSS**

Append inside the existing `{% stylesheet %}` block:

```css
.press-kit__facts {
  margin: 0;
  border-block-start: 1px solid var(--color-border);
}
.press-kit__fact {
  display: grid;
  grid-template-columns: minmax(8rem, 16rem) 1fr;
  gap: 1.5rem;
  padding: 1rem 0;
  border-block-end: 1px solid var(--color-border);
}
.press-kit__term {
  font-size: 0.75rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  opacity: 0.7;
}
.press-kit__value {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}
@media screen and (max-width: 749px) {
  .press-kit__fact {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
```

- [ ] **Step 3: Add the schema entries**

Add to `settings` (after `downloads_heading`):

```json
    { "type": "text", "id": "facts_heading", "label": "Facts heading", "default": "Fast facts" },
```

Add to `blocks` (after the `download` entry):

```json
{
  "type": "fact",
  "name": "Fact",
  "settings": [
    {
      "type": "text",
      "id": "term",
      "label": "Term",
      "info": "e.g. Founded, Founders, Based, Run size"
    },
    {
      "type": "text",
      "id": "value",
      "label": "Value",
      "info": "e.g. 2021 — or Sylvain and Amrita Castet"
    }
  ]
}
```

- [ ] **Step 4: Verify and run the gates**

Re-run the Step 2 verification block from Task 1 (it is generic). Expected: `schema VALID | 6 settings | ['download', 'fact']`, braces `0`, negative `False`, `emits h1: False`.

Then:

```bash
npm run lint:theme && npm run lint:css && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, still 0 errors / 54 warnings.

- [ ] **Step 5: Commit**

```bash
git add sections/press-kit.liquid
git commit -m "feat(press): fast facts as a definition list"
```

---

### Task 3: Previously covered

**Files:**

- Modify: `sections/press-kit.liquid`

**Interfaces:**

- Consumes: the wrapper, `.press-kit__group`, `.press-kit__heading`, `.press-kit__list`, `.press-kit__row`, `.press-kit__link`, `.press-kit__label`, `.press-kit__meta` from Tasks 1-2.
- Produces: block type `coverage` with settings `outlet`, `date`, `url`.

- [ ] **Step 1: Add the coverage markup**

Add `assign coverage = section.blocks | where: 'type', 'coverage'` to the opening `{%- liquid -%}` block, then insert after the facts group and before the wrapper's closing `</div>`:

```liquid
  {% if coverage.size > 0 %}
    <section class="press-kit__group" aria-labelledby="press-kit-coverage-{{ section.id }}">
      <h2 class="press-kit__heading" id="press-kit-coverage-{{ section.id }}">{{ s.coverage_heading | escape }}</h2>
      <ul class="press-kit__list" role="list">
        {% for block in coverage %}
          {% if block.settings.outlet != blank and block.settings.url != blank %}
            <li class="press-kit__row" {{ block.shopify_attributes }}>
              <a
                class="press-kit__link"
                href="{{ block.settings.url | escape }}"
                target="_blank"
                rel="noopener"
              >
                <span class="press-kit__label">{{ block.settings.outlet | escape }}</span>
                {% if block.settings.date != blank %}
                  <span class="press-kit__meta">{{ block.settings.date | escape }}</span>
                {% endif %}
              </a>
            </li>
          {% endif %}
        {% endfor %}
      </ul>
    </section>
  {% endif %}
```

Note there is no `download` attribute here — these are articles to read, not files to take.

- [ ] **Step 2: Add the schema entries**

Add to `settings` (after `facts_heading`):

```json
    { "type": "text", "id": "coverage_heading", "label": "Coverage heading", "default": "Previously covered" },
```

Add to `blocks` (after the `fact` entry):

```json
{
  "type": "coverage",
  "name": "Coverage",
  "settings": [
    { "type": "text", "id": "outlet", "label": "Outlet", "info": "e.g. GQ" },
    { "type": "text", "id": "date", "label": "Date", "info": "e.g. March 2026" },
    { "type": "url", "id": "url", "label": "Article URL" }
  ]
}
```

- [ ] **Step 3: Verify and run the gates**

Re-run Task 1's Step 2 verification block. Expected: `schema VALID | 7 settings | ['download', 'fact', 'coverage']`, braces `0`, `emits h1: False`.

```bash
npm run lint:theme && npm run lint:css && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, 0 errors / 54 warnings.

- [ ] **Step 4: Commit**

```bash
git add sections/press-kit.liquid
git commit -m "feat(press): previously-covered list"
```

---

### Task 4: Boilerplate with copy-to-clipboard

The only JavaScript on the page. It must degrade to a no-op rather than appear broken.

**Files:**

- Modify: `sections/press-kit.liquid`

**Interfaces:**

- Consumes: the wrapper, `.press-kit__group`, `.press-kit__heading`.
- Produces: settings `boilerplate_heading`, `boilerplate`, `copy_label`, `copied_label`; CSS classes `.press-kit__boilerplate`, `.press-kit__quote`, `.press-kit__copy`, `.press-kit__copied`; data attributes `data-press-copy`, `data-press-quote`, `data-press-copied`.

- [ ] **Step 1: Add the boilerplate markup**

Insert after the coverage group and before the wrapper's closing `</div>`:

```liquid
  {% if s.boilerplate != blank %}
    <section class="press-kit__group press-kit__boilerplate" aria-labelledby="press-kit-boilerplate-{{ section.id }}">
      <h2 class="press-kit__heading" id="press-kit-boilerplate-{{ section.id }}">{{ s.boilerplate_heading | escape }}</h2>
      <div class="press-kit__quote" data-press-quote>{{ s.boilerplate }}</div>
      <button class="press-kit__copy" type="button" data-press-copy hidden>
        {{ s.copy_label | escape }}
      </button>
      <p class="press-kit__copied" data-press-copied role="status" aria-live="polite"></p>
    </section>
  {% endif %}
```

The button ships with `hidden` and is revealed by JS only when the clipboard API is actually available. That is what stops it appearing broken where it cannot work — do not remove the `hidden` attribute.

`{{ s.boilerplate }}` is deliberately unescaped: it is a `richtext` setting, which Shopify already restricts to a safe subset of tags.

- [ ] **Step 2: Add the boilerplate CSS**

Append inside the existing `{% stylesheet %}` block:

```css
.press-kit__quote {
  max-width: 60ch;
  font-size: 0.875rem;
  line-height: 1.6;
  padding-inline-start: 1.25rem;
  border-inline-start: 1px solid var(--color-border);
}
.press-kit__quote p {
  margin: 0 0 1em;
}
.press-kit__quote p:last-child {
  margin-block-end: 0;
}
.press-kit__copy {
  margin-block-start: 1.25rem;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: inherit;
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 0.75rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.press-kit__copy:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 3px;
}
.press-kit__copied {
  margin: 0.5rem 0 0;
  min-height: 1.2em;
  font-size: 0.75rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  opacity: 0.7;
}
```

The `border-inline-start: 1px` on the quote is a hairline rule marking quotable text, not a decorative accent — it is 1px, so it does not trip the side-stripe ban, which applies to colored stripes wider than 1px.

- [ ] **Step 3: Add the JavaScript**

Add this block immediately after `{% endstylesheet %}`:

```liquid
{% javascript %}
  (function () {
    document.querySelectorAll('[data-press-copy]').forEach(function (button) {
      var group = button.closest('.press-kit__boilerplate');
      if (!group) return;
      var quote = group.querySelector('[data-press-quote]');
      var status = group.querySelector('[data-press-copied]');
      if (!quote || !navigator.clipboard || !navigator.clipboard.writeText) return;

      // Only reveal the button once we know the API exists — a copy button
      // that silently does nothing is worse than no button.
      button.hidden = false;

      button.addEventListener('click', function () {
        navigator.clipboard.writeText(quote.innerText.trim()).then(
          function () {
            if (status) status.textContent = button.dataset.copiedLabel || 'Copied';
          },
          function () {
            if (status) status.textContent = 'Press Ctrl+C to copy';
          }
        );
      });
    });
  })();
{% endjavascript %}
```

`{% javascript %}` is compiled to a static asset and is NOT Liquid-rendered, so the "Copied" label cannot be interpolated here. Pass it through a data attribute instead — update the button markup from Step 1 to add it:

```liquid
      <button
        class="press-kit__copy"
        type="button"
        data-press-copy
        data-copied-label="{{ s.copied_label | escape }}"
        hidden
      >
        {{ s.copy_label | escape }}
      </button>
```

Note the `hidden` attribute is removed only after the API check passes, and the handler is attached only then — so on a browser without clipboard support the button never appears at all.

- [ ] **Step 4: Add the schema entries**

Add to `settings` (after `coverage_heading`):

```json
    { "type": "text", "id": "boilerplate_heading", "label": "Boilerplate heading", "default": "Boilerplate" },
    { "type": "richtext", "id": "boilerplate", "label": "Boilerplate", "info": "The paragraph a journalist may quote verbatim." },
    { "type": "text", "id": "copy_label", "label": "Copy button label", "default": "Copy boilerplate" },
    { "type": "text", "id": "copied_label", "label": "Copied confirmation", "default": "Copied" },
```

- [ ] **Step 5: Verify and run the gates**

Re-run Task 1's Step 2 verification block. Expected: `schema VALID | 11 settings | ['download', 'fact', 'coverage']`, braces `0`, `emits h1: False`.

Then confirm no Liquid leaked into the JS block, and run all four gates:

```bash
python3 -c "
import re
js = re.search(r'\{%\s*javascript\s*%\}(.*?)\{%\s*endjavascript\s*%\}', open('sections/press-kit.liquid').read(), re.S).group(1)
print('Liquid inside {% javascript %} (must be False):', ('{{' in js) or ('{%' in js))"
npm run lint:theme && npm run lint:js && npm run lint:css && npm run format:check && echo GATES-OK
```

Expected: `False`, then `GATES-OK` with `lint:js` at **0 errors**.

- [ ] **Step 6: Commit**

```bash
git add sections/press-kit.liquid
git commit -m "feat(press): quotable boilerplate with copy-to-clipboard"
```

---

### Task 5: Page template

**Files:**

- Create: `templates/page.press.json`

**Interfaces:**

- Consumes: section type `press-kit` from Tasks 1-4; Horizon's `section` and `media-with-content` section types.
- Produces: the `press` page template.

- [ ] **Step 1: Create the template**

Create `templates/page.press.json`. Section order is deliberate — assets and facts come before brand prose, because the reader is on deadline:

```json
{
  "sections": {
    "orientation": {
      "type": "section",
      "blocks": {
        "intro": {
          "type": "text",
          "settings": {
            "text": "<p>Press and media resources for ARTTITUDE. For anything not here, get in touch.</p>",
            "max_width": "narrow",
            "alignment": "left"
          }
        },
        "contact": {
          "type": "button",
          "settings": {
            "label": "Email press",
            "link": "mailto:press@arttitude.us",
            "style_class": "button-secondary"
          }
        }
      },
      "block_order": ["intro", "contact"],
      "settings": {
        "section_width": "page-width",
        "padding-block-start": 48,
        "padding-block-end": 24
      }
    },
    "press_kit": {
      "type": "press-kit",
      "blocks": {
        "download_logos": {
          "type": "download",
          "settings": {
            "label": "Logo pack",
            "description": "Wordmark in black and white, SVG and PNG",
            "file_url": "",
            "meta": "ZIP"
          }
        },
        "fact_founded": { "type": "fact", "settings": { "term": "Founded", "value": "" } },
        "fact_founders": {
          "type": "fact",
          "settings": { "term": "Founders", "value": "Sylvain and Amrita Castet" }
        },
        "fact_based": { "type": "fact", "settings": { "term": "Based", "value": "California" } },
        "coverage_1": { "type": "coverage", "settings": { "outlet": "", "date": "", "url": "" } }
      },
      "block_order": [
        "download_logos",
        "fact_founded",
        "fact_founders",
        "fact_based",
        "coverage_1"
      ],
      "settings": {
        "downloads_heading": "Press kit",
        "facts_heading": "Fast facts",
        "coverage_heading": "Previously covered",
        "boilerplate_heading": "Boilerplate",
        "boilerplate": "<p>ARTTITUDE is a California fashion house that turns fine art into wearable streetwear in limited drops.</p>",
        "copy_label": "Copy boilerplate",
        "copied_label": "Copied",
        "section_width": "page-width",
        "padding-block-start": 24,
        "padding-block-end": 48
      }
    },
    "founders": {
      "type": "media-with-content",
      "settings": {
        "media_position": "left",
        "section_width": "page-width",
        "padding-block-start": 48,
        "padding-block-end": 48
      }
    },
    "main": {
      "type": "main-page"
    }
  },
  "order": ["orientation", "press_kit", "founders", "main"]
}
```

Empty-string values are intentional placeholders for the merchant to fill in the theme editor (the file URL, founding year, and first coverage entry). Every one of them renders nothing until filled, because each block is guarded — an empty `file_url` skips that download row, an empty `outlet`/`url` skips that coverage row.

`main-page` is included so the page's own body content from the Shopify admin still renders. Its `<h1>` is the page title, which is why the section never emits one.

- [ ] **Step 2: Validate the JSON**

`.prettierignore` excludes `templates/*.json`, so `format:check` will NOT catch a syntax error here. Parse it directly:

```bash
python3 -c "
import json, re
src = open('templates/page.press.json').read()
d = json.loads(re.sub(r'^/\*.*?\*/\s*', '', src, flags=re.S))
print('JSON VALID')
print('order:', d['order'])
orphans = [o for o in d['order'] if o not in d['sections']]
missing = [s for s in d['sections'] if s not in d['order']]
print('orphan order entries:', orphans or 'none')
print('sections not in order:', missing or 'none')
print('section types:', sorted({s['type'] for s in d['sections'].values()}))"
```

Expected: `JSON VALID`, orphans `none`, missing `none`, and section types `['main-page', 'media-with-content', 'press-kit', 'section']`.

- [ ] **Step 3: Confirm every referenced section exists**

```bash
for t in press-kit section media-with-content main-page; do
  [ -f "sections/$t.liquid" ] && echo "  ok: sections/$t.liquid" || echo "  MISSING: sections/$t.liquid"
done
```

Expected: all four `ok`.

- [ ] **Step 4: Run the gates**

```bash
npm run lint:theme && npm run format:check && echo GATES-OK
```

Expected: `GATES-OK`, 0 errors / 54 warnings. Theme Check validates that template JSON references real section types, so this is the step that catches a typo in a section name.

- [ ] **Step 5: Commit**

```bash
git add templates/page.press.json
git commit -m "feat(press): page.press template"
```

---

### Task 6: Manifest entry and merchant runbook

`CUSTOMIZATIONS.md` is this repo's record of every deviation from the Horizon boilerplate. A new section and template that are not recorded there are invisible to the next person.

**Files:**

- Create: `docs/PRESS_PAGE_SETUP.md`
- Modify: `CUSTOMIZATIONS.md`

**Interfaces:**

- Consumes: everything from Tasks 1-5.
- Produces: nothing code-facing.

- [ ] **Step 1: Write the merchant runbook**

Create `docs/PRESS_PAGE_SETUP.md`:

```markdown
# Press page — setup

The press page is built from `sections/press-kit.liquid` on the
`templates/page.press.json` template.

## One-time setup

1. **Create the page.** Admin → Content → Pages → Add page, titled "Press".
   Under _Theme template_, choose **press**. Save.
2. **Upload the assets.** Admin → Content → Files. Upload the logo pack and
   any other downloads, then copy each file's URL.
3. **Fill the kit.** Theme editor → the Press page → Press kit section:
   - Paste each file URL into its Download block.
   - Fill the Fast facts values (founding year, and anything else you want
     quotable).
   - Add a Coverage block per article, with outlet, date and link.
   - Check the boilerplate reads the way you want it quoted.
4. **Set the press email.** In the orientation section's button block, set the
   link to `mailto:` your real press address.

## Zip anything with more than one file

Shopify serves files from `cdn.shopify.com`, which is a different origin from
the storefront. Browsers ignore the download attribute across origins, so a
loose `.svg` or `.jpg` **opens in a tab** instead of downloading. A `.zip`
always downloads. Ship the logo pack as one zip.

## Keeping it honest

- The **format and size** on each download ("SVG, PNG · 2 MB") is typed by
  hand. If you swap a file, update that line or it will lie.
- A stale **Previously covered** list is worse than none. Prune it.

## Adding hi-res imagery later

There is no imagery in the kit yet. When press-quality images exist, add
another Download block — no code change, no redesign.
```

- [ ] **Step 2: Add the manifest entry**

In `CUSTOMIZATIONS.md`, under `## ✨ Custom Files (Safe from Upstream Conflicts)` → `### Custom Sections`, add:

```markdown
#### `sections/press-kit.liquid`

- **Purpose:** The press kit content model for the media page — the things a
  journalist takes away.
- **Blocks:** `download` (label, description, file URL, hand-typed format/size),
  `fact` (term/value, rendered as a `<dl>`), `coverage` (outlet, date, link).
- **Settings:** a heading per group, plus a `richtext` boilerplate with a
  copy-to-clipboard button.
- **Template:** `templates/page.press.json`, which composes the orientation and
  `mailto:` contact from Horizon's generic `section`, and founder bios from
  `media-with-content`. Purely additive — no core theme file modified.
- **Known limitation:** the `download` attribute does not fire for
  `cdn.shopify.com` URLs (cross-origin), so multi-file assets must be zipped.
- **Deliberately not a "collection world":** uses the storefront type and
  colour system, no new fonts or tokens. See DESIGN.md's Collection World Rule.
- **Setup:** [`docs/PRESS_PAGE_SETUP.md`](./docs/PRESS_PAGE_SETUP.md)
- **Created:** 2026-07-19
- **Spec:** `docs/superpowers/specs/2026-07-19-press-page-design.md`
```

- [ ] **Step 3: Run every gate**

```bash
npm run lint:js && npm run lint:css && npm run format:check && npm run lint:theme && echo ALL-GATES-OK
```

Expected: `ALL-GATES-OK`, `lint:js` 0 errors, `lint:theme` 0 errors / 54 warnings.

- [ ] **Step 4: Commit**

```bash
git add CUSTOMIZATIONS.md docs/PRESS_PAGE_SETUP.md
git commit -m "docs(press): manifest entry and merchant runbook"
```

- [ ] **Step 5: Push and open a PR**

```bash
git push -u origin feature/press-page
gh pr create --base develop --title "Press / media page" \
  --body "Implements docs/superpowers/specs/2026-07-19-press-page-design.md"
```

Target `develop`, not `main` — that is this repo's integration branch.

---

## What only the human can verify

No store credentials exist in the implementation environment, so these are checkpoint items, not plan steps:

- A real Shopify Files URL actually downloads (and that a zip behaves differently from a loose SVG).
- The copy button appears and works — the clipboard API needs HTTPS and a user gesture, so it may stay hidden in some preview contexts.
- Keyboard and screen-reader behaviour: heading order (`h1` from the page, `h2` per group), focus rings, and whether each row's link text makes sense read on its own.
- The merchant flow end to end: create the page, assign the template, fill the blocks.

## Deferred

- Hi-res press imagery — add a `download` block when it exists.
- A customer-facing coverage or logo wall — the audience decision was journalists, not both.
- Download analytics, gated assets, multi-language press copy.
- A structured contact form; Horizon's native `contact-form` block drops in later if wanted.
