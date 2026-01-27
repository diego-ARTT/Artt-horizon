# Production Build Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing production build optimization.

## Prerequisites

- Node.js 20+
- npm installed
- Shopify CLI configured

## Step 1: Install Dependencies

```bash
npm install --save-dev csso-cli terser chalk glob fs-extra
```

**Why:**

- `csso-cli` - Advanced CSS minification
- `terser` - JavaScript minification (fallback)
- `chalk` - Colored console output
- `glob` - File pattern matching
- `fs-extra` - Enhanced file operations

## Step 2: Create Build Scripts Directory

```bash
mkdir -p scripts/utils
```

## Step 3: Build Configuration

Create `scripts/utils/config.js`:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export const BUILD_CONFIG = {
  sourceDir: path.join(rootDir, 'assets'),
  outputDir: path.join(rootDir, 'assets'),

  jsPattern: '**/*.js',
  cssPattern: '**/*.css',

  exclude: ['**/*.min.js', '**/*.min.css', '**/*.map', '**/jsconfig.json', '**/global.d.ts'],

  esbuild: {
    minify: true,
    format: 'esm',
    target: 'es2020',
    sourcemap: 'external',
    keepNames: false,
    treeShaking: true,
  },

  css: {
    restructure: true,
    comments: false,
    sourceMap: true,
  },
};
```

## Step 4: CSS Build Script

Create `scripts/build-css.js`:

```javascript
import { execSync } from 'child_process';
import { glob } from 'glob';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { BUILD_CONFIG } from './utils/config.js';
import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log(chalk.yellow('Skipping CSS build - not in production mode'));
  process.exit(0);
}

async function buildCSS() {
  const cssFiles = await glob(BUILD_CONFIG.cssPattern, {
    cwd: BUILD_CONFIG.sourceDir,
    ignore: BUILD_CONFIG.exclude,
  });

  console.log(chalk.blue(`Found ${cssFiles.length} CSS files to minify`));

  for (const file of cssFiles) {
    const inputPath = `${BUILD_CONFIG.sourceDir}/${file}`;
    const outputPath = inputPath.replace('.css', '.min.css');

    try {
      // Use csso-cli for minification
      execSync(`npx csso ${inputPath} --output ${outputPath} --source-map file`, {
        stdio: 'inherit',
      });

      const originalSize = readFileSync(inputPath).length;
      const minifiedSize = existsSync(outputPath) ? readFileSync(outputPath).length : 0;
      const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

      console.log(
        chalk.green(
          `✓ ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`
        )
      );
    } catch (error) {
      console.error(chalk.red(`✗ Failed to minify ${file}:`), error.message);
      process.exit(1);
    }
  }
}

buildCSS().catch(error => {
  console.error(chalk.red('Build failed:'), error);
  process.exit(1);
});
```

## Step 5: JavaScript Build Script

Create `scripts/build-js.js`:

```javascript
import { build } from 'esbuild';
import { glob } from 'glob';
import { readFileSync, statSync } from 'fs';
import { BUILD_CONFIG } from './utils/config.js';
import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log(chalk.yellow('Skipping JS build - not in production mode'));
  process.exit(0);
}

async function buildJS() {
  const jsFiles = await glob(BUILD_CONFIG.jsPattern, {
    cwd: BUILD_CONFIG.sourceDir,
    ignore: BUILD_CONFIG.exclude,
  });

  console.log(chalk.blue(`Found ${jsFiles.length} JavaScript files to minify`));

  for (const file of jsFiles) {
    const inputPath = `${BUILD_CONFIG.sourceDir}/${file}`;
    const outputPath = inputPath.replace('.js', '.min.js');

    try {
      const originalSize = statSync(inputPath).size;

      await build({
        entryPoints: [inputPath],
        outfile: outputPath,
        ...BUILD_CONFIG.esbuild,
      });

      const minifiedSize = statSync(outputPath).size;
      const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

      console.log(
        chalk.green(
          `✓ ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`
        )
      );
    } catch (error) {
      console.error(chalk.red(`✗ Failed to minify ${file}:`), error.message);
      process.exit(1);
    }
  }
}

buildJS().catch(error => {
  console.error(chalk.red('Build failed:'), error);
  process.exit(1);
});
```

## Step 6: Main Build Script

Create `scripts/build.js`:

```javascript
import { execSync } from 'child_process';
import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log(chalk.yellow('Skipping build - not in production mode'));
  console.log(chalk.gray('Set NODE_ENV=production to build'));
  process.exit(0);
}

console.log(chalk.blue('🚀 Starting production build...\n'));

try {
  // Build CSS
  console.log(chalk.cyan('📦 Building CSS...'));
  execSync('node scripts/build-css.js', { stdio: 'inherit' });

  // Build JavaScript
  console.log(chalk.cyan('\n📦 Building JavaScript...'));
  execSync('node scripts/build-js.js', { stdio: 'inherit' });

  console.log(chalk.green('\n✅ Build complete!'));
} catch (error) {
  console.error(chalk.red('\n❌ Build failed:'), error.message);
  process.exit(1);
}
```

## Step 7: Update package.json

Add these scripts:

```json
{
  "scripts": {
    "build": "NODE_ENV=production node scripts/build.js",
    "build:css": "NODE_ENV=production node scripts/build-css.js",
    "build:js": "NODE_ENV=production node scripts/build-js.js",
    "build:clean": "find assets -name '*.min.*' -o -name '*.map' | xargs rm -f",
    "predeploy": "npm run build"
  }
}
```

## Step 8: Update .gitignore

Add to `.gitignore`:

```gitignore
# Build outputs (production only)
assets/**/*.min.js
assets/**/*.min.css
assets/**/*.map
```

## Step 9: Update Liquid Templates

### Update `snippets/scripts.liquid`

Add at the top:

```liquid
{%- liquid
  assign is_production = false
  if shop.environment == 'production' or request.design_mode == false
    assign is_production = true
  endif

  if is_production
    assign critical_js = 'critical.min.js'
    assign component_js = 'component.min.js'
    assign dialog_js = 'dialog.min.js'
    assign events_js = 'events.min.js'
    assign focus_js = 'focus.min.js'
    assign morph_js = 'morph.min.js'
    assign paginated_list_js = 'paginated-list.min.js'
    assign performance_js = 'performance.min.js'
    assign product_form_js = 'product-form.min.js'
    assign recently_viewed_js = 'recently-viewed-products.min.js'
    assign scrolling_js = 'scrolling.min.js'
    assign section_renderer_js = 'section-renderer.min.js'
    assign section_hydration_js = 'section-hydration.min.js'
    assign utilities_js = 'utilities.min.js'
    assign variant_picker_js = 'variant-picker.min.js'
    assign media_gallery_js = 'media-gallery.min.js'
    assign quick_add_js = 'quick-add.min.js'
    assign paginated_list_aspect_ratio_js = 'paginated-list-aspect-ratio.min.js'
    assign popover_polyfill_js = 'popover-polyfill.min.js'
    assign component_quantity_selector_js = 'component-quantity-selector.min.js'
    assign product_title_js = 'product-title-truncation.min.js'
  else
    assign critical_js = 'critical.js'
    assign component_js = 'component.js'
    assign dialog_js = 'dialog.js'
    assign events_js = 'events.js'
    assign focus_js = 'focus.js'
    assign morph_js = 'morph.js'
    assign paginated_list_js = 'paginated-list.js'
    assign performance_js = 'performance.js'
    assign product_form_js = 'product-form.js'
    assign recently_viewed_js = 'recently-viewed-products.js'
    assign scrolling_js = 'scrolling.js'
    assign section_renderer_js = 'section-renderer.js'
    assign section_hydration_js = 'section-hydration.js'
    assign utilities_js = 'utilities.js'
    assign variant_picker_js = 'variant-picker.js'
    assign media_gallery_js = 'media-gallery.js'
    assign quick_add_js = 'quick-add.js'
    assign paginated_list_aspect_ratio_js = 'paginated-list-aspect-ratio.js'
    assign popover_polyfill_js = 'popover-polyfill.js'
    assign component_quantity_selector_js = 'component-quantity-selector.js'
    assign product_title_js = 'product-title-truncation.js'
  endif
-%}
```

Update the importmap:

```liquid
<script type="importmap">
  {
    "imports": {
      "@theme/critical": "{{ critical_js | asset_url }}",
      "@theme/product-title": "{{ product_title_js | asset_url }}",
      "@theme/component": "{{ component_js | asset_url }}",
      "@theme/dialog": "{{ dialog_js | asset_url }}",
      "@theme/events": "{{ events_js | asset_url }}",
      "@theme/focus": "{{ focus_js | asset_url }}",
      "@theme/morph": "{{ morph_js | asset_url }}",
      "@theme/paginated-list": "{{ paginated_list_js | asset_url }}",
      "@theme/performance": "{{ performance_js | asset_url }}",
      "@theme/product-form": "{{ product_form_js | asset_url }}",
      "@theme/recently-viewed-products": "{{ recently_viewed_js | asset_url }}",
      "@theme/scrolling": "{{ scrolling_js | asset_url }}",
      "@theme/section-renderer": "{{ section_renderer_js | asset_url }}",
      "@theme/section-hydration": "{{ section_hydration_js | asset_url }}",
      "@theme/utilities": "{{ utilities_js | asset_url }}",
      "@theme/variant-picker": "{{ variant_picker_js | asset_url }}",
      "@theme/media-gallery": "{{ media_gallery_js | asset_url }}",
      "@theme/quick-add": "{{ quick_add_js | asset_url }}",
      "@theme/paginated-list-aspect-ratio": "{{ paginated_list_aspect_ratio_js | asset_url }}",
      "@theme/popover-polyfill": "{{ popover_polyfill_js | asset_url }}",
      "@theme/component-quantity-selector": "{{ component_quantity_selector_js | asset_url }}"
    }
  }
</script>
```

### Update `snippets/stylesheets.liquid`

Add at the top:

```liquid
{%- liquid
  assign is_production = false
  if shop.environment == 'production' or request.design_mode == false
    assign is_production = true
  endif

  if is_production
    assign base_css = 'base.min.css'
    assign overflow_list_css = 'overflow-list.min.css'
  else
    assign base_css = 'base.css'
    assign overflow_list_css = 'overflow-list.css'
  endif

  assign base_css_url = base_css | asset_url
  assign overflow_list_css_url = overflow_list_css | asset_url
-%}
```

## Step 10: Test the Build

```bash
# Test build locally
NODE_ENV=production npm run build

# Verify minified files were created
ls -lh assets/*.min.*

# Clean build artifacts
npm run build:clean
```

## Step 11: Deploy

```bash
# Build before deploying
npm run build

# Deploy to Shopify
shopify theme push

# Or use the predeploy hook
npm run deploy  # (if you create this script)
```

## Troubleshooting

### Build fails with "command not found"

- Ensure dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 20+)

### Minified files not loading

- Verify Liquid templates are updated
- Check `shop.environment` value
- Test in production environment

### Source maps not working

- Ensure source maps are generated (check for `.map` files)
- Verify source map references in minified files
- Check browser DevTools settings

### Build is slow

- This is normal for first build
- Subsequent builds are faster (incremental)
- Consider parallel processing for large projects

## Best Practices

1. **Always build before deploying** to production
2. **Test minified files** in staging/production environment
3. **Keep source files** - Don't delete originals
4. **Version control** - Commit source files, ignore minified
5. **Monitor file sizes** - Track compression ratios

## Next Steps

1. Implement build scripts
2. Test locally
3. Update Liquid templates
4. Test in production environment
5. Monitor performance improvements

---

**See also:** `PRODUCTION_BUILD_OPTIMIZATION_PLAN.md` for detailed planning document.
