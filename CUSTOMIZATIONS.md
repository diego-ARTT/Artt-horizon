# Theme Customizations Manifest

> **Purpose:** This document tracks all modifications to the Horizon theme boilerplate to enable safe upstream updates while preserving custom functionality.

---

## 📋 Theme Information

| Property               | Value                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Base Theme**         | Shopify Horizon                                                                  |
| **Horizon Version**    | v3.1.0 (as of Nov 3, 2024)                                                       |
| **Custom Theme Name**  | ARTT Horizon                                                                     |
| **Custom Version**     | 1.1.0                                                                            |
| **Last Updated**       | 2025-01-XX                                                                       |
| **Last Upstream Sync** | Nov 3, 2024 (commit: 51a72d4)                                                    |
| **Maintainer**         | [@diego-ARTT](https://github.com/diego-ARTT)                                     |
| **Repository**         | [github.com/diego-ARTT/Artt-horizon](https://github.com/diego-ARTT/Artt-horizon) |

---

## 🎨 Modified Core Files

> **Note:** These files exist in the Horizon boilerplate but have been modified. Exercise caution when merging upstream updates.

### Core Assets

#### `assets/base.css`

- **Status:** ⚠️ Modified
- **Changes Made:**
  - **January 2025:** Added drawer backdrop blur effect
    - Added `.dialog-drawer::backdrop` styles with blur filter
    - Default blur: 8px (configurable via CSS variable)
    - Smooth transitions for blur animation
    - Combines with existing backdrop brightness and opacity
- **Reason:** Enhanced visual focus for drawer overlays
- **Last Modified:** January 2025
- **Merge Strategy:** ⚠️ Review carefully - preserve custom backdrop blur styles
- **Notes:** Blur effect uses CSS custom property `--drawer-backdrop-blur` set via theme settings

### Configuration Files

#### `config/settings_data.json`

- **Status:** ⚠️ Modified (store-specific settings)
- **Changes Made:**
  - Store-specific configuration
  - Theme customization settings
  - Populated via theme editor
- **Reason:** Required for active theme configuration
- **Last Modified:** Nov 10, 2024
- **Merge Strategy:** ⚠️ **DO NOT OVERWRITE** - Contains live store settings
- **Notes:** This file contains production store configuration and should be managed via Shopify theme editor only

#### `templates/index.json`

- **Lines Modified:** Added media-quote-carousel section
- **Changes Made:**
  - Added `media-quote-carousel` section reference (lines 260-261)
  - Custom homepage layout configuration
- **Reason:** Integration of custom quote carousel on homepage
- **Dependencies:**
  - `sections/media-quote-carousel.liquid`
- **Last Modified:** Nov 10, 2024
- **Author:** [@diego-ARTT]
- **Merge Strategy:** ✅ Safe - JSON template can be recreated if needed
- **Notes:** May need to re-add custom section after Horizon updates

#### `blocks/_product-details.liquid`

- **Status:** ⚠️ Modified
- **Changes Made:**
  - **January 2025:** Added `size-guide` block type to schema
  - Block can now be added to product details section
- **Reason:** Enable size guide widget on product pages
- **Last Modified:** January 2025
- **Merge Strategy:** ⚠️ Review carefully - preserve custom block addition
- **Notes:** Size guide block reads from product metafield

#### `config/settings_schema.json`

- **Status:** ⚠️ Modified
- **Changes Made:**
  - **January 2025:** Added `drawer_backdrop_blur` setting to Drawers section
    - Range: 0-20px
    - Default: 8px
    - Controls blur intensity for drawer backdrops
- **Reason:** Configurable backdrop blur effect for drawers
- **Last Modified:** January 2025
- **Merge Strategy:** ⚠️ Review carefully - preserve custom setting
- **Notes:** Setting appears in Theme Settings → Drawers → Backdrop blur

#### `snippets/theme-styles-variables.liquid`

- **Status:** ⚠️ Modified
- **Changes Made:**
  - **January 2025:** Added `--drawer-backdrop-blur` CSS custom property
    - Reads from `settings.drawer_backdrop_blur`
    - Default fallback: 8px
- **Reason:** Make drawer backdrop blur configurable via theme settings
- **Last Modified:** January 2025
- **Merge Strategy:** ⚠️ Review carefully - preserve custom CSS variable
- **Notes:** Variable used in `assets/base.css` for drawer backdrop styling

#### `sections/header-group.json`

- **Status:** Modified
- **Changes Made:**
  - Custom header configuration
  - Section arrangement modifications
- **Reason:** Store-specific header customization
- **Last Modified:** Nov 10, 2024
- **Merge Strategy:** ⚠️ Review carefully - contains custom settings

#### `sections/footer-group.json`

- **Status:** Modified
- **Changes Made:**
  - Custom footer configuration
  - Section arrangement modifications
- **Reason:** Store-specific footer customization
- **Last Modified:** Nov 10, 2024
- **Merge Strategy:** ⚠️ Review carefully - contains custom settings

### Locale Files

#### All locale files (`locales/*.schema.json`)

- **Files Modified:** Czech (cs), Danish (da), Chinese Simplified (zh-CN), Chinese Traditional (zh-TW), English (en.default)
- **Changes Made:**
  - Added translations for custom `media-quote-carousel` section
  - Added missing translation keys:
    - `names.media_quote_carousel`
    - `names.media_quote_carousel_block`
    - `names.column`
    - `settings.logo_max_height`
    - `settings.quote_alignment`
    - `settings.quote_font_size`
    - `settings.slide_background_style`
    - `settings.slide_border_weight`
    - `settings.media_type_1`
    - `settings.media_type_2`
    - `content.submissions_are_sent_to_store_email_address`
  - Removed orphaned translations:
    - `settings.block_link` (existed only in translations, not in default)
    - `text_defaults.faq` (existed only in translations, not in default)
  - **January 2025 Updates:**
    - Added translations for `size-guide` block:
      - `names.size_guide`
      - `settings.size_guide.*` (button_text, icon, icon_size, hide_title, title_size)
      - `info.size_guide_button_text`
      - `info.size_guide_hide_title`
    - Added translations for drawer backdrop blur:
      - `settings.backdrop_blur`
      - `info.drawer_backdrop_blur`
    - Added `content.button` translation
- **Reason:** Support for custom media quote carousel section, size guide block, drawer backdrop blur, and translation consistency
- **Last Modified:** January 2025
- **Merge Strategy:** ⚠️ Append new custom keys, preserve during updates
- **Notes:** Custom translation keys use `media_quote_carousel` and `size_guide` prefixes for easy identification

---

## ✨ Custom Files (Safe from Upstream Conflicts)

> **Note:** These files are custom additions and will never conflict with Horizon updates.

### Custom Blocks

#### `blocks/size-guide.liquid`

- **Purpose:** Display size guide pages in an accessible modal/drawer based on product metafields
- **Features:**
  - Reads size guide page from product metafield: `product.metafields.custom.size_guide_page`
  - Configurable button text and styling
  - Adjustable icon selection (ruler, arrow, question_mark, clipboard, eye, or none)
  - Adjustable icon size (12-32px)
  - Adjustable modal title size (h1-h6 or custom font size)
  - Modal or drawer display modes
  - Responsive table styling for size charts
  - Full accessibility compliance (ARIA labels, keyboard navigation, focus management)
  - Conditional rendering (only shows if metafield is set)
- **Schema Settings:**
  - Button text
  - Icon selection and size
  - Button type preset (link, paragraph, h1-h6)
  - Behavior (modal or drawer)
  - Hide title option
  - Title size (h1-h6 or custom)
  - Custom title font size (when title_size is custom)
  - Button padding controls
- **Dependencies:**
  - `assets/dialog.js` (core Horizon component)
  - Product metafield: `custom.size_guide_page` (page_reference type)
- **Status:** ✅ Complete and functional
- **Created:** January 2025
- **Author:** [@diego-ARTT]
- **Usage:** Add as block in product details section via theme editor

### Custom Sections

#### `sections/media-quote-carousel.liquid`

- **Purpose:** Display rotating quotes/testimonials with media logos
- **Features:**
  - Responsive carousel with autoplay support
  - Configurable quote font size (small, default, large, extra large)
  - Adjustable quote alignment (left, center, right)
  - Customizable slide backgrounds (light, solid, none)
  - Adjustable border weight
  - Logo display with max-height control
  - Optional CTA links per slide
  - Accessible carousel with ARIA labels
  - Keyboard navigation support
  - Pause on hover functionality
- **Schema Settings:**
  - Heading & subheading
  - Quote font size selector
  - Quote alignment
  - Slide background style
  - Slide border weight
  - Logo max height
  - Color scheme integration
  - Spacing controls
  - Navigation arrows toggle
  - Autoplay settings (enable/disable, interval)
  - Controls style (counter, dots, etc.)
- **Block Type:** `media_quote_carousel_block`
  - Quote text
  - Media outlet name
  - Media logo image
  - CTA label & URL
- **Dependencies:**
  - `snippets/slideshow.liquid` (core Horizon snippet)
  - `snippets/slideshow-slide.liquid` (core Horizon snippet)
  - `snippets/slideshow-controls.liquid` (core Horizon snippet)
  - `snippets/spacing-style.liquid` (core Horizon snippet)
  - `assets/base.css` (styling)
- **Status:** ✅ Complete and functional
- **Created:** Nov 10, 2024
- **Author:** [@diego-ARTT]
- **Testing Status:** Needs comprehensive testing
- **Usage:** Can be added to any template via theme editor

---

## 🔧 Development Tooling Setup

> **Note:** These are development-only files and don't affect the theme functionality.

### Linting & Formatting Configuration

#### `.eslintrc.json` / `eslint.config.js`

- **Purpose:** JavaScript code quality and consistency
- **Configuration:** ESLint v9 with modern ES6+ rules
- **Status:** ✅ Configured
- **Created:** Nov 4, 2024

#### `.prettierrc` & `.prettierignore`

- **Purpose:** Code formatting automation
- **Configuration:**
  - Single quotes
  - 2-space indentation
  - Trailing commas
  - 100 character line width
  - **Excludes:** `.liquid` files (uses Theme Check instead)
- **Status:** ✅ Configured
- **Created:** Nov 4, 2024

#### `.stylelintrc.json`

- **Purpose:** CSS code quality
- **Configuration:** Standard CSS rules with Shopify-specific adjustments
- **Status:** ✅ Configured
- **Created:** Nov 4, 2024

#### `.lintstagedrc.json`

- **Purpose:** Pre-commit hook configuration
- **Runs:** ESLint, Stylelint, and Prettier on staged files
- **Status:** ✅ Configured
- **Created:** Nov 4, 2024

#### `.husky/pre-commit`

- **Purpose:** Automated pre-commit checks
- **Runs:** lint-staged before every commit
- **Status:** ✅ Active
- **Created:** Nov 4, 2024

### CI/CD

#### `.github/workflows/ci.yml`

- **Purpose:** Continuous integration pipeline
- **Triggers:** Push to main/develop, PRs to main/develop
- **Checks:**
  - JavaScript linting (ESLint)
  - CSS linting (Stylelint)
  - Theme check (Shopify Theme Check)
  - Code formatting (Prettier)
- **Status:** ✅ Active
- **Created:** Nov 4, 2024
- **Notes:** All checks must pass before merge

#### ESLint Code Quality Fixes (Jan 2025)

- **Purpose:** Fix ESLint errors and warnings to ensure CI pipeline passes
- **Status:** ✅ Completed
- **Date:** January 2025
- **Reason:** CI pipeline was failing due to ESLint violations
- **Impact:** Low - Code quality improvements, no functional changes
- **Merge Strategy:** ✅ Safe - These are code quality fixes that should be preserved

**Files Modified:**

1. **`assets/cart-discount.js`**
   - Fixed empty catch blocks (lines 113, 165) - Added comments explaining silent error handling for abort controller scenarios
   - Changed `catch (error)` to `catch` (error variable unused)

2. **`assets/cart-note.js`**
   - Fixed empty catch block (line 36) - Added comment explaining silent error handling
   - Changed `catch (error)` to `catch` (error variable unused)

3. **`assets/component.js`**
   - Fixed `prefer-const` error (line 231) - Changed `let [selector, method]` to `const [selector, method]` and introduced `cleanedMethod` variable for reassignment
   - Fixed `no-useless-escape` errors (line 234) - Removed unnecessary escapes in regex pattern: `/([/?][^/?]+)([/?][^/?]+)$/`
   - Added eslint-disable comment for console.error (line 257) - Legitimate error logging

4. **`assets/facets.js`**
   - Fixed `prefer-const` error (line 30) - Changed `let newParameters` to `const newParameters`

5. **`assets/gift-card-recipient-form.js`**
   - Removed unused imports: `CartErrorEvent`, `CartAddEvent`
   - Fixed `prefer-const` error (line 249) - Changed `let controlFlag` to `const controlFlag`
   - Added eslint-disable comment for console.warn (line 193) - Legitimate warning logging

6. **`assets/header-menu.js`**
   - Fixed `prefer-const` errors (lines 95, 114) - Changed `let item` and `let overflowMenuHeight` to `const`
   - Note: `let submenu` remains as `let` because it's reassigned later

7. **`assets/localization.js`**
   - Fixed `prefer-const` error (line 184) - Changed `let matchTypes` to `const matchTypes`

8. **`assets/product-form.js`**
   - Removed unused imports: `CartUpdateEvent`, `VariantUpdateEvent`
   - Fixed `prefer-const` error (line 288) - Changed `let cartItemComponentsSectionIds` to `const cartItemComponentsSectionIds`
   - Added eslint-disable comments for console.error statements (lines 211, 384) - Legitimate error logging

9. **`assets/utilities.js`**
   - Fixed `prefer-const` errors (lines 92, 250) - Changed `let cleanupFunctions` and `let valueWithNoSpaces` to `const`

10. **Removed Unused Imports (Multiple Files):**
    - `assets/cart-icon.js` - Removed `CartUpdateEvent`
    - `assets/component-cart-items.js` - Removed `QuantitySelectorUpdateEvent`, `CartAddEvent` (Note: `CartUpdateEvent` kept as it's used on line 160)
    - `assets/drag-zoom-wrapper.js` - Removed `ZoomDialog`
    - `assets/local-pickup.js` - Removed `VariantUpdateEvent`
    - `assets/media-gallery.js` - Removed `VariantUpdateEvent`, `ZoomMediaSelectedEvent`
    - `assets/predictive-search.js` - Removed `DialogComponent`
    - `assets/product-card.js` - Removed `VariantSelectedEvent`, `VariantUpdateEvent`
    - `assets/product-inventory.js` - Removed `VariantUpdateEvent`
    - `assets/product-price.js` - Removed `VariantUpdateEvent`
    - `assets/quick-add.js` - Removed `CartUpdateEvent`

11. **Console Statement Handling:**
    - Added `eslint-disable-next-line no-console` comments for legitimate error/warning logging in:
      - `assets/component-cart-items.js` (line 175)
      - `assets/component.js` (line 257)
      - `assets/gift-card-recipient-form.js` (line 193)
      - `assets/product-form.js` (lines 211, 384)
      - `assets/product-recommendations.js` (line 142)
      - `assets/variant-picker.js` (lines 255, 258)

12. **Unused Variable Fixes:**
    - `assets/cart-icon.js` (line 100) - Changed `catch (_)` to `catch` (unused catch parameter)
    - `assets/theme-editor.js` (line 93) - Removed unused `event` parameter from beforeunload handler

**Summary:**

- **20 errors fixed** (empty catch blocks, prefer-const, no-useless-escape)
- **30 warnings addressed** (unused imports, console statements, unused variables)
- **No functional changes** - All fixes are code quality improvements
- **Upstream compatibility:** ✅ High - These are standard ESLint fixes that won't conflict with upstream changes

#### Stylelint CSS Code Quality Fixes (Jan 2025)

- **Purpose:** Fix Stylelint errors and warnings to ensure CI pipeline passes
- **Status:** ✅ Completed
- **Date:** January 2025
- **Reason:** CI pipeline was failing due to Stylelint violations
- **Impact:** Low - Code quality improvements, no functional changes
- **Merge Strategy:** ✅ Safe - These are code quality fixes that should be preserved

**Files Modified:**

1. **`assets/base.css`**
   - **Duplicate selectors merged:**
     - `.product-card__content` (lines 85, 89) - Merged into single rule
     - `.flex` (lines 527, 562) - Removed duplicate
     - `.button-secondary` (lines 1324, 1378) - Merged hover state into single rule
     - `.quantity-selector input[type='number']` (lines 2694, 2712) - Merged Firefox-specific styles using nested selectors
     - `slideshow-controls[controls-on-media]` (lines 3365, 3477) - Merged position styles
     - `.slideshow-controls__dots, .slideshow-controls__counter` (lines 3531, 3596) - Merged `:only-child` rule
     - `.icon-caret` (lines 3627, 3631) - Removed duplicate
     - `.media-gallery--carousel slideshow-arrows .slideshow-control` (lines 3805, 3818) - Merged opacity into padding rule

   - **Deprecated properties fixed:**
     - `clip: rect(0 0 0 0)` → `clip-path: inset(50%)` (lines 502, 517) - Modern way to hide elements visually
     - `word-break: break-word` removed (line 205) - Redundant with `overflow-wrap: break-word`
     - `word-wrap` → `overflow-wrap` (auto-fixed by Stylelint)

   - **Keyframe names converted to kebab-case:**
     - All 26 keyframe names converted from camelCase to kebab-case (e.g., `fadeInUp` → `fade-in-up`, `slideInLeft` → `slide-in-left`)
     - All usages of these keyframes updated throughout the file

   - **Media query range notation:**
     - Auto-fixed by Stylelint: `min-width: 750px` → `width >= 750px` (62 instances)

   - **Value keyword case:**
     - `currentColor` → `currentcolor` (auto-fixed by Stylelint)

   - **Formatting:**
     - Added empty line before custom property in `.button-secondary` (line 1319)

2. **`assets/overflow-list.css`**
   - Media query range notation auto-fixed

3. **`assets/template-giftcard.css`**
   - Media query range notation auto-fixed

**Summary:**

- **97 errors fixed** (duplicate selectors, deprecated properties, keyframe naming, media query syntax)
- **62 errors auto-fixed** by Stylelint (media query range notation, value keyword case)
- **No functional changes** - All fixes are code quality improvements
- **Upstream compatibility:** ✅ High - These are standard Stylelint fixes that won't conflict with upstream changes

### Repository Configuration

#### `.gitignore`

- **Custom Additions:**
  - `node_modules/`
  - `.env*`
  - `*.log`
  - `.DS_Store`
  - `.shopify/`
- **Reason:** Exclude development files and sensitive data
- **Last Modified:** Nov 4, 2024

#### `.shopifyignore`

- **Purpose:** Exclude development files from theme uploads
- **Configuration:** Prevents linting configs and dev files from being uploaded
- **Status:** ✅ Configured
- **Created:** Nov 4, 2024

### Documentation

#### `DEVELOPMENT-SETUP.md`

- **Purpose:** Development environment setup guide
- **Contains:**
  - Development dependencies list
  - Configuration files overview
  - NPM scripts usage
  - Git hooks explanation
  - CI/CD workflow details
  - Troubleshooting tips
- **Status:** ✅ Complete
- **Created:** Nov 4, 2024
- **Maintainer:** [@diego-ARTT]

---

## 📐 Custom CSS Variables & Styling

### Media Quote Carousel Styles

The `media-quote-carousel` section uses custom CSS properties defined in `assets/base.css`:

```css
/* Custom properties set via section settings */
--quote-font-size: /* Responsive clamp() values based on size setting */ --slide-background:
  /* Color-mix() for subtle backgrounds */
  --slide-border-width: /* Pixel value from settings */
  --slide-border-color: /* Color-mix() for subtle borders */
  --quote-text-align: /* left, center, or right */
  --quote-footer-justify: /* flex-start, center, or flex-end */
  --logo-max-height: /* Pixel value from settings */;
```

**Location:** Set inline in section via Liquid  
**Merge Strategy:** ✅ Safe - inline styles don't conflict with base theme

---

## 📦 Dependencies

### NPM Packages (Development Only)

```json
{
  "@shopify/cli": "^3.86.1",
  "@shopify/theme-check-node": "^3.23.0",
  "eslint": "^9.39.1",
  "globals": "^16.5.0",
  "husky": "^9.1.7",
  "keyv": "^5.5.3",
  "lint-staged": "^16.2.6",
  "prettier": "^3.6.2",
  "stylelint": "^16.25.0",
  "stylelint-config-standard": "^39.0.1"
}
```

**Status:** ✅ All installed and configured  
**Last Updated:** Nov 4, 2024  
**Notes:** Keyv version pinned due to dependency conflicts

---

## 🔄 Upstream Update Strategy

### Before Pulling Updates

1. **Review Horizon changelog** - Check [Horizon releases](https://github.com/Shopify/horizon/releases)
2. **Backup current theme** - Create backup in Shopify admin or git tag
3. **Commit all changes** - Ensure clean working directory
4. **Review this manifest** - Know what files we've modified
5. **Check for conflicts** - Preview diff before merging

### Update Process

```bash
# 1. Fetch Horizon updates (assuming upstream remote is set)
git fetch upstream

# 2. Review changes
git log HEAD..upstream/main
git diff HEAD..upstream/main

# 3. Create update branch
git checkout -b update/horizon-vX.X.X

# 4. Merge (expect conflicts on modified files)
git merge upstream/main

# 5. Resolve conflicts using this manifest
# Priority order:
#   1. Preserve custom sections (media-quote-carousel.liquid)
#   2. Review JSON template changes (index.json, etc.)
#   3. Preserve locale translations for custom sections
#   4. Keep development tooling configs
#   5. Accept Horizon improvements for unmodified files

# 6. Test thoroughly (see checklist below)

# 7. Update this manifest
#   - Update Horizon version number
#   - Update "Last Upstream Sync" date
#   - Document any new files modified
#   - Note any new conflicts encountered

# 8. Deploy to development theme
shopify theme push --development

# 9. Manual testing on dev theme

# 10. Create PR to main
git push origin update/horizon-vX.X.X
```

### Files Safe to Auto-Merge (Low Conflict Risk)

- ✅ New files added by Horizon (no conflict)
- ✅ Core Horizon sections we haven't touched
- ✅ Core Horizon snippets we haven't modified
- ✅ Horizon assets (CSS/JS) if we haven't customized
- ✅ Core templates we haven't modified

### Files Requiring Manual Review (High Conflict Risk)

- ⚠️ `templates/index.json` - Contains our custom section reference
- ⚠️ `blocks/_product-details.liquid` - Contains size-guide block addition
- ⚠️ `assets/base.css` - Contains drawer backdrop blur styles
- ⚠️ `config/settings_schema.json` - Contains drawer backdrop blur setting
- ⚠️ `snippets/theme-styles-variables.liquid` - Contains drawer backdrop blur CSS variable
- ⚠️ `sections/header-group.json` - May have store-specific settings
- ⚠️ `sections/footer-group.json` - May have store-specific settings
- ⚠️ `locales/en.default.schema.json` - Contains custom carousel and size guide translations
- ⚠️ All other `locales/*.schema.json` files - Custom translations added
- ⚠️ `config/settings_data.json` - **CRITICAL** - Never auto-merge!

### Custom Files to Preserve (Never Merge)

- 🔒 `blocks/size-guide.liquid` - Our custom size guide block
- 🔒 `sections/media-quote-carousel.liquid` - Our custom section
- 🔒 All development tooling files (`.eslintrc.json`, `.prettierrc`, etc.)
- 🔒 `.github/workflows/ci.yml` - Our CI pipeline
- 🔒 `DEVELOPMENT-SETUP.md` - Our documentation
- 🔒 `CUSTOMIZATIONS.md` (this file)

### Conflict Resolution Guidelines

**Strategy 1: Preserve Custom Code (Default for custom sections)**

- Use when: Our customization is critical and complex
- Action: Keep our version entirely
- Examples: `media-quote-carousel.liquid`, development configs

**Strategy 2: Accept Horizon Changes (Default for core files)**

- Use when: We haven't modified the file
- Action: Accept Horizon changes completely
- Examples: Core sections, unmodified snippets

**Strategy 3: Hybrid Approach (For JSON templates & locales)**

- Use when: Both versions have value
- Action: Manually merge - keep our additions, integrate Horizon improvements
- Examples: `index.json` (add our section to new structure), locale files (merge translations)

---

## 🧪 Testing Checklist After Updates

### Critical User Flows

- [ ] **Homepage**
  - [ ] Loads without errors
  - [ ] Media Quote Carousel displays correctly
  - [ ] Carousel autoplay functions
  - [ ] Carousel navigation (arrows, dots) works
  - [ ] All sections render properly
  - [ ] No console errors

- [ ] **Navigation**
  - [ ] Desktop menu functions
  - [ ] Mobile menu opens/closes
  - [ ] Mega menu displays correctly (if configured)
  - [ ] Search works

- [ ] **Product Page**
  - [ ] Images load and gallery works
  - [ ] Variant selection functions
  - [ ] Add to cart works
  - [ ] Product information displays
  - [ ] Size guide button appears (if metafield is set)
  - [ ] Size guide modal/drawer opens correctly
  - [ ] Size guide content displays properly
  - [ ] Size guide accessibility (keyboard navigation, screen reader)

- [ ] **Collection Page**
  - [ ] Products load correctly
  - [ ] Filtering works
  - [ ] Sorting functions
  - [ ] Pagination works

- [ ] **Cart**
  - [ ] Add/remove items
  - [ ] Update quantities
  - [ ] Checkout process

- [ ] **Theme Editor**
  - [ ] Media Quote Carousel section can be added
  - [ ] All carousel settings appear in editor
  - [ ] Settings changes reflect in preview
  - [ ] Block management works (add/remove/reorder quotes)
  - [ ] Size Guide block can be added to product details
  - [ ] Size Guide settings appear correctly
  - [ ] Size Guide preview works (with metafield set)
  - [ ] Drawer backdrop blur setting appears in Theme Settings → Drawers
  - [ ] Drawer backdrop blur adjustment works in preview

### Media Quote Carousel Specific Tests

- [ ] Single quote displays correctly (no carousel controls)
- [ ] Multiple quotes enable carousel
- [ ] Autoplay starts/stops correctly
- [ ] Pause on hover works
- [ ] Keyboard navigation (arrow keys)
- [ ] Screen reader accessibility (ARIA labels)
- [ ] Quote font size options work
- [ ] Quote alignment options work
- [ ] Background style options work
- [ ] Border weight settings apply
- [ ] Logo displays with correct max height
- [ ] CTA links work when configured
- [ ] Responsive behavior on mobile
- [ ] Color scheme integration

### Device Testing

- [ ] Desktop (Chrome, Safari, Firefox, Edge)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet (iPad, Android tablet)

### Performance Checks

- [ ] Lighthouse score > 85
- [ ] No console errors
- [ ] No 404s on assets
- [ ] Images load properly
- [ ] Carousel animations are smooth

### Development Tools Testing

- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] Pre-commit hooks function
- [ ] CI pipeline passes on GitHub

---

## 🚨 Known Issues & Limitations

### Issue 1: Translation Coverage

- **Problem:** Custom carousel translations only added to 4 languages (en, cs, da, zh-CN, zh-TW)
- **Affected Files:** `locales/*.schema.json` files for other languages
- **Impact:** Other language locales won't have translated labels for carousel in theme editor
- **Workaround:** Carousel will function but may show English fallbacks in theme editor
- **Permanent Fix:** Need to translate carousel schema to all supported languages
- **Status:** Open
- **Priority:** Medium (only affects theme editor UI, not storefront)

### Issue 2: German Locale Validation Errors

- **Problem:** Theme check reports missing translations in German locale (`de.schema.json`)
- **Affected Files:** `locales/de.schema.json`
- **Impact:** Theme check fails for German locale
- **Workaround:** None currently - only affects validation
- **Permanent Fix:** Add missing translations to German locale
- **Status:** Open (not part of initial customization scope)
- **Priority:** Low (unless German language support is needed)

### Issue 3: Settings Data Not in Version Control

- **Problem:** `config/settings_data.json` contains environment-specific configuration
- **Affected Files:** `config/settings_data.json`
- **Impact:** Settings need to be reconfigured when setting up new development environments
- **Workaround:** Document critical settings separately or use theme editor
- **Solution:** This is by design - settings_data should not be in version control
- **Status:** Expected behavior
- **Priority:** N/A

---

## 📝 Change Log

### Version 1.1.0 - January 2025

#### Size Guide Widget

- **New Custom Block:** `blocks/size-guide.liquid`
  - Displays size guide pages in an accessible modal/drawer
  - Reads from product metafield: `product.metafields.custom.size_guide_page`
  - Features:
    - Configurable button text and icon
    - Adjustable icon selection (ruler, arrow, question_mark, clipboard, eye, or none)
    - Adjustable icon size (12-32px)
    - Adjustable title size (h1-h6 or custom font size)
    - Modal or drawer display modes
    - Responsive table styling for size charts
    - Full accessibility compliance (ARIA labels, keyboard navigation, focus management)
  - Integration: Added to `blocks/_product-details.liquid` schema
  - Translations: Added to `locales/en.default.schema.json`
    - `names.size_guide`
    - `settings.size_guide.*` (button_text, icon, icon_size, hide_title, title_size)
    - `info.size_guide_button_text`
    - `info.size_guide_hide_title`
- **Files Created:**
  - `blocks/size-guide.liquid` - Main size guide block
- **Files Modified:**
  - `blocks/_product-details.liquid` - Added size-guide to block schema
  - `locales/en.default.schema.json` - Added size guide translations
- **Dependencies:**
  - Uses existing `dialog.js` component
  - Requires product metafield: `custom.size_guide_page` (page_reference type)
- **Status:** ✅ Complete and functional
- **Created:** January 2025

#### Drawer Backdrop Blur Effect

- **Feature:** Configurable background blur effect for drawer overlays
- **Implementation:**
  - Added CSS for `.dialog-drawer::backdrop` with blur effect
  - Default blur: 8px (configurable via theme settings)
  - Smooth transitions for blur animation
  - Combines with existing backdrop brightness and opacity
- **Theme Setting:** Added `drawer_backdrop_blur` range setting (0-20px)
  - Location: Theme Settings → Drawers → Backdrop blur
  - Default: 8px
  - Set to 0px to disable blur
- **CSS Variable:** `--drawer-backdrop-blur` (set via theme settings)
- **Files Modified:**
  - `assets/base.css` - Added drawer backdrop blur styles
  - `config/settings_schema.json` - Added backdrop blur setting to Drawers section
  - `snippets/theme-styles-variables.liquid` - Added CSS variable
  - `locales/en.default.schema.json` - Added translations (`backdrop_blur`, `drawer_backdrop_blur` info)
- **Affected Drawers:**
  - Size guide drawer (when in drawer mode)
  - Filters drawer
  - Popup link drawer (when in drawer mode)
  - Any drawer using `.dialog-drawer` class
- **Status:** ✅ Complete and functional
- **Created:** January 2025

### Version 1.0.0 - Nov 10, 2024

- **Initial custom theme based on Horizon v3.1.0**
- Added custom `media-quote-carousel` section with full features
- Set up development tooling:
  - ESLint for JavaScript
  - Prettier for code formatting
  - Stylelint for CSS
  - Husky for git hooks
  - lint-staged for pre-commit checks
  - GitHub Actions CI pipeline
- Added translations for custom carousel (en, cs, da, zh-CN, zh-TW)
- Fixed translation inconsistencies across all locales
- Created comprehensive documentation

### Horizon v3.1.0 - Nov 3, 2024

- Base theme version
- Upstream merge from Shopify/Horizon

---

## 👥 Team & Contacts

| Role               | GitHub                                                     | Responsibilities                             |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| **Lead Developer** | [@diego-ARTT](https://github.com/diego-ARTT)               | Theme architecture, custom sections, updates |
| **Repository**     | [Artt-horizon](https://github.com/diego-ARTT/Artt-horizon) | Main codebase                                |

---

## 📚 Resources & Documentation

### Internal Documentation

- [DEVELOPMENT-SETUP.md](./DEVELOPMENT-SETUP.md) - Development environment setup
- [CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md) - This document
- [release-notes.md](./release-notes.md) - Horizon release notes

### External Resources

- [Horizon Theme Repository](https://github.com/Shopify/horizon)
- [Shopify Theme Development Docs](https://shopify.dev/themes)
- [Liquid Documentation](https://shopify.dev/api/liquid)
- [Theme Architecture Docs](https://shopify.dev/docs/themes/architecture)
- [Accessibility Guidelines](https://shopify.dev/docs/themes/best-practices/accessibility)

### NPM Scripts Reference

```bash
# Linting
npm run lint              # Run all linters (JS, CSS, Theme)
npm run lint:js           # ESLint check
npm run lint:css          # Stylelint check
npm run lint:theme        # Shopify Theme Check

# Formatting
npm run format            # Auto-format code
npm run format:check      # Check formatting without changes

# Git Hooks
npm run prepare           # Set up Husky hooks
```

---

## 🔄 Maintenance Schedule

### After Each Horizon Update

- [ ] Review Horizon changelog
- [ ] Update version number in this document
- [ ] Test all custom sections
- [ ] Run full testing checklist
- [ ] Update dependencies if needed
- [ ] Verify CI pipeline passes

### Monthly

- [ ] Check for new Horizon releases
- [ ] Review open issues
- [ ] Update npm dependencies
- [ ] Security audit (`npm audit`)
- [ ] Review and update documentation

### Quarterly

- [ ] Performance optimization review
- [ ] Accessibility audit
- [ ] Code quality review
- [ ] Remove unused code/features

---

## 📋 Quick Reference

### Most Important Custom Files

1. `blocks/size-guide.liquid` - Custom size guide block
2. `sections/media-quote-carousel.liquid` - Custom carousel section
3. `locales/en.default.schema.json` - Translation definitions
4. `assets/base.css` - Drawer backdrop blur styles
5. `config/settings_schema.json` - Drawer backdrop blur setting
6. `templates/index.json` - Homepage layout with carousel
7. Development tooling configs (`.eslintrc.json`, `.prettierrc`, etc.)

### Emergency Rollback

```bash
# If update breaks production
git revert HEAD
git push origin main

# Or restore from specific commit
git reset --hard <commit-hash>
git push origin main --force

# Or restore from GitHub
# Download previous theme version and upload via Shopify admin
```

### Getting Help

1. Check this manifest for customization context
2. Review [DEVELOPMENT-SETUP.md](./DEVELOPMENT-SETUP.md) for tooling
3. Check GitHub Actions logs for CI failures
4. Review Horizon changelog for breaking changes
5. [Shopify Theme Support](https://help.shopify.com/en/partners/theme-development)
6. [Shopify Community Forums](https://community.shopify.com/)

---

## 🎯 Future Enhancements (Roadmap)

### Planned Custom Sections

- [ ] Enhanced testimonial grid (alternative to carousel)
- [ ] Custom hero banner with video support
- [ ] Advanced product filtering
- [ ] Custom blog layout sections

### Development Improvements

- [ ] Add automated testing (Jest for JS)
- [ ] Theme performance monitoring
- [ ] Automated screenshot testing
- [ ] Component documentation system

### Internationalization

- [ ] Complete translations for all supported languages
- [ ] RTL language support testing
- [ ] Locale-specific customizations

---

**Document Version:** 1.1.0  
**Last Updated:** 2025-01-XX  
**Next Review:** 2025-02-XX  
**Maintained By:** [@diego-ARTT](https://github.com/diego-ARTT)

---

## 📌 Notes for Future Developers

### Working with Custom Sections

When adding new custom sections:

1. Create the section file with a descriptive name
2. Add translations to `locales/en.default.schema.json`
3. Add translations to other supported locales
4. Test in theme editor
5. Document in this manifest
6. Add to relevant templates
7. Test thoroughly before deployment

### Naming Conventions

**Custom sections:** Use descriptive kebab-case names (e.g., `media-quote-carousel`)  
**CSS classes:** Follow BEM methodology (e.g., `.media-quote-carousel__slide`)  
**Translation keys:** Use namespaced keys (e.g., `names.media_quote_carousel`)  
**Git branches:** Use `feature/`, `fix/`, `update/` prefixes

### Best Practices

- Always test custom sections with various content configurations
- Ensure accessibility (ARIA labels, keyboard navigation, screen reader support)
- Make sections responsive (test on mobile, tablet, desktop)
- Follow Horizon's existing patterns and conventions
- Keep custom code minimal and maintainable
- Document complex logic with comments
- Use semantic HTML
- Optimize images and assets
- Test with different color schemes

### When Things Go Wrong

1. **Theme breaks after update:**
   - Check git diff to see what changed
   - Revert to last working commit
   - Apply updates incrementally
   - Test after each change

2. **Custom section not appearing:**
   - Check file naming and location
   - Verify schema is valid JSON
   - Check for Liquid syntax errors
   - Review browser console for errors

3. **Translations missing:**
   - Verify keys exist in `en.default.schema.json`
   - Check key naming matches exactly
   - Ensure proper JSON formatting

4. **CI pipeline failing:**
   - Review GitHub Actions logs
   - Run linters locally (`npm run lint`)
   - Check for syntax errors
   - Verify all tests pass locally

---

_This document should be updated whenever custom modifications are made to the theme._
