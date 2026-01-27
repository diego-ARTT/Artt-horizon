# Production Build Optimization Plan

## Overview

This document outlines a comprehensive strategy for optimizing CSS and JavaScript assets for production builds while maintaining a clean development workflow. The optimization will be **production-only** and won't affect local development.

## Goals

1. **Minify CSS and JavaScript** - Reduce file sizes by 30-60%
2. **Compress assets** - Enable gzip/brotli compression headers
3. **Production-only** - Keep development workflow unchanged
4. **Maintain source maps** - For debugging production issues
5. **Preserve ES modules** - Maintain importmap structure
6. **Automated** - Integrate into CI/CD pipeline

## Current State

- **No build process** - Assets are served directly from `assets/` folder
- **ES Modules** - Uses importmap for module resolution
- **Async CSS loading** - Already optimized for non-blocking CSS
- **Development tools** - ESLint, Stylelint, Prettier configured
- **CI/CD** - GitHub Actions for linting only

## Architecture

### Build Strategy

```
Development (Local)          Production (Deployed)
───────────────────          ────────────────────
assets/*.js  ──────────┐
assets/*.css ──────────┤───► Build Process ───► assets/*.min.js
                       │                         assets/*.min.css
                       └───► (No build)         (with source maps)
```

### Key Principles

1. **Source files remain unchanged** - Original files stay in repo
2. **Build outputs are gitignored** - Only built files deployed
3. **Environment detection** - Build only when `NODE_ENV=production`
4. **Incremental builds** - Only rebuild changed files
5. **Source maps** - Generate `.map` files for debugging

## Implementation Plan

### Phase 1: Build Tool Setup

#### 1.1 Install Dependencies

```json
{
  "devDependencies": {
    "esbuild": "^0.25.10", // Already installed via @shopify/cli
    "csso-cli": "^4.0.0", // CSS minification
    "terser": "^5.36.0", // JS minification (fallback)
    "chalk": "^5.3.0", // Colored console output
    "glob": "^11.0.0", // File pattern matching
    "fs-extra": "^11.2.0" // Enhanced file operations
  }
}
```

**Why these tools:**

- **esbuild** - Fast, already available, handles ES modules well
- **csso-cli** - Advanced CSS optimization (better than cssnano)
- **terser** - Fallback for complex JS that esbuild can't handle
- **glob** - Pattern matching for asset discovery
- **fs-extra** - Better file operations than native fs

#### 1.2 Build Script Structure

```
scripts/
  ├── build.js              # Main build orchestrator
  ├── build-css.js          # CSS minification
  ├── build-js.js           # JavaScript minification
  └── utils/
      ├── file-utils.js      # File operations
      └── config.js          # Build configuration
```

### Phase 2: Build Configuration

#### 2.1 Build Configuration (`scripts/utils/config.js`)

```javascript
export const BUILD_CONFIG = {
  // Source directories
  sourceDir: 'assets',
  outputDir: 'assets',

  // File patterns
  jsPattern: '**/*.js',
  cssPattern: '**/*.css',

  // Exclusions (don't minify these)
  exclude: [
    '**/*.min.js', // Already minified
    '**/*.min.css', // Already minified
    '**/*.map', // Source maps
    '**/jsconfig.json', // Config files
    '**/global.d.ts', // TypeScript definitions
  ],

  // esbuild options
  esbuild: {
    minify: true,
    format: 'esm', // ES modules
    target: 'es2020', // Modern browsers
    sourcemap: 'external', // Separate .map files
    keepNames: false, // Shorter variable names
    treeShaking: true, // Remove unused code
  },

  // CSS minification options
  css: {
    restructure: true, // Advanced optimization
    comments: false, // Remove comments
    sourceMap: true, // Generate source maps
  },
};
```

#### 2.2 Environment Detection

```javascript
// Only build in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('Skipping build - not in production mode');
  process.exit(0);
}
```

### Phase 3: CSS Minification

#### 3.1 CSS Build Script (`scripts/build-css.js`)

**Features:**

- Minify CSS files
- Generate source maps
- Preserve critical CSS structure
- Remove comments and whitespace
- Optimize selectors

**Output:**

- `base.css` → `base.min.css` + `base.min.css.map`
- `overflow-list.css` → `overflow-list.min.css` + `overflow-list.min.css.map`

**Considerations:**

- Don't minify CSS variables (they're used in Liquid)
- Preserve `@media` query structure
- Maintain CSS custom properties

### Phase 4: JavaScript Minification

#### 4.1 JS Build Script (`scripts/build-js.js`)

**Features:**

- Minify ES modules
- Preserve import/export statements
- Generate source maps
- Tree-shake unused code
- Optimize for modern browsers

**Output:**

- `critical.js` → `critical.min.js` + `critical.min.js.map`
- `component.js` → `component.min.js` + `component.min.js.map`
- etc.

**Special Handling:**

- **Importmap compatibility** - Must work with existing importmap
- **ES modules** - Preserve `import`/`export` syntax
- **Dynamic imports** - Handle `import()` calls correctly

#### 4.2 Importmap Update Strategy

**Option A: Conditional Importmap (Recommended)**

```liquid
{% if shop.environment == 'production' %}
  <script type="importmap">
    {
      "imports": {
        "@theme/critical": "{{ 'critical.min.js' | asset_url }}",
        ...
      }
    }
  </script>
{% else %}
  <script type="importmap">
    {
      "imports": {
        "@theme/critical": "{{ 'critical.js' | asset_url }}",
        ...
      }
    }
  </script>
{% endif %}
```

**Option B: Build-time Importmap Generation**

- Generate separate importmap files for dev/prod
- Use Liquid includes to switch

**Recommendation:** Option A is simpler and more maintainable.

### Phase 5: File Organization

#### 5.1 Directory Structure

```
assets/
  ├── *.js                    # Source files (committed)
  ├── *.css                   # Source files (committed)
  ├── *.min.js                # Minified JS (gitignored, deployed)
  ├── *.min.css               # Minified CSS (gitignored, deployed)
  ├── *.min.js.map            # Source maps (gitignored, deployed)
  └── *.min.css.map           # Source maps (gitignored, deployed)
```

#### 5.2 .gitignore Updates

```gitignore
# Build outputs (production only)
assets/**/*.min.js
assets/**/*.min.css
assets/**/*.map
```

#### 5.3 .shopifyignore Updates

```shopifyignore
# Don't deploy source maps to Shopify (optional)
*.map
```

**Note:** Source maps can be deployed for debugging, but they're optional.

### Phase 6: NPM Scripts

#### 6.1 Package.json Scripts

```json
{
  "scripts": {
    "build": "NODE_ENV=production node scripts/build.js",
    "build:css": "NODE_ENV=production node scripts/build-css.js",
    "build:js": "NODE_ENV=production node scripts/build-js.js",
    "build:clean": "rm -rf assets/**/*.min.* assets/**/*.map",
    "predeploy": "npm run build",
    "dev": "shopify theme dev",
    "deploy": "npm run build && shopify theme push"
  }
}
```

### Phase 7: CI/CD Integration

#### 7.1 GitHub Actions Workflow

**New workflow:** `.github/workflows/build.yml`

```yaml
name: Build Production Assets

on:
  push:
    branches: [main]
    paths:
      - 'assets/**/*.js'
      - 'assets/**/*.css'
      - 'scripts/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production assets
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: production-assets
          path: |
            assets/**/*.min.js
            assets/**/*.min.css
          retention-days: 7
```

#### 7.2 Deployment Strategy

**Option A: Pre-deploy Build (Recommended)**

```bash
# Before deploying
npm run build
shopify theme push
```

**Option B: CI/CD Automated Build**

- Build in GitHub Actions
- Download artifacts
- Deploy via Shopify CLI

**Option C: Shopify Deploy Hook**

- Use Shopify CLI hooks
- Build before push

**Recommendation:** Option A - Simple, explicit, works with existing workflow.

### Phase 8: Liquid Template Updates

#### 8.1 Conditional Asset Loading

**Update `snippets/scripts.liquid`:**

```liquid
{%- liquid
  assign is_production = false
  if shop.environment == 'production' or request.design_mode == false
    assign is_production = true
  endif

  if is_production
    assign critical_js = 'critical.min.js'
    assign component_js = 'component.min.js'
  else
    assign critical_js = 'critical.js'
    assign component_js = 'component.js'
  endif
-%}

<script type="importmap">
  {
    "imports": {
      "@theme/critical": "{{ critical_js | asset_url }}",
      "@theme/component": "{{ component_js | asset_url }}",
      ...
    }
  }
</script>
```

**Update `snippets/stylesheets.liquid`:**

```liquid
{%- liquid
  assign is_production = false
  if shop.environment == 'production' or request.design_mode == false
    assign is_production = true
  endif

  if is_production
    assign base_css = 'base.min.css'
    assign overflow_css = 'overflow-list.min.css'
  else
    assign base_css = 'base.css'
    assign overflow_css = 'overflow-list.css'
  endif

  assign base_css_url = base_css | asset_url
  assign overflow_list_css_url = overflow_css | asset_url
-%}
```

### Phase 9: Compression (Server-Side)

#### 9.1 Shopify CDN Compression

**Shopify automatically compresses assets** when:

- Files are served via CDN
- Client supports gzip/brotli
- File size exceeds threshold

**No action needed** - Shopify handles this automatically.

#### 9.2 File Size Optimization

**Pre-compression optimizations:**

- Minification (removes whitespace, comments)
- Tree-shaking (removes unused code)
- Dead code elimination
- Variable name shortening

**These reduce file size before CDN compression.**

### Phase 10: Performance Monitoring

#### 10.1 Build Metrics

Track:

- Original file sizes
- Minified file sizes
- Compression ratios
- Build time

#### 10.2 Performance Budgets

Set targets:

- CSS: < 50KB per file (minified)
- JS: < 100KB per file (minified)
- Total CSS: < 200KB
- Total JS: < 500KB

## Best Practices

### 1. Development Workflow

**Local Development:**

```bash
# No build needed
shopify theme dev
```

**Production Build:**

```bash
# Build before deploying
npm run build
shopify theme push
```

### 2. Source Maps

**Development:** No source maps needed
**Production:** Include source maps for debugging
**Deployment:** Optional (can exclude from Shopify)

### 3. File Naming

- **Source:** `file.js`, `file.css`
- **Minified:** `file.min.js`, `file.min.css`
- **Source maps:** `file.min.js.map`, `file.min.css.map`

### 4. Git Strategy

**Committed:**

- Source files (`*.js`, `*.css`)
- Build scripts
- Configuration files

**Gitignored:**

- Minified files (`*.min.js`, `*.min.css`)
- Source maps (`*.map`)

**Deployed:**

- Both source and minified (for fallback)
- Or only minified (if confident)

### 5. Error Handling

**Build failures should:**

- Exit with error code
- Show clear error messages
- Not break development workflow
- Log to console with details

### 6. Testing

**Before deploying:**

1. Build locally
2. Test with minified files
3. Verify importmap works
4. Check source maps (if deployed)
5. Test in production environment

## Implementation Checklist

### Setup

- [ ] Install build dependencies
- [ ] Create build script structure
- [ ] Configure build options
- [ ] Update .gitignore
- [ ] Update .shopifyignore (optional)

### CSS Minification

- [ ] Implement CSS build script
- [ ] Test CSS minification
- [ ] Verify source maps
- [ ] Test CSS loading in production

### JavaScript Minification

- [ ] Implement JS build script
- [ ] Test ES module preservation
- [ ] Verify importmap compatibility
- [ ] Test dynamic imports
- [ ] Verify source maps

### Liquid Templates

- [ ] Update `snippets/scripts.liquid`
- [ ] Update `snippets/stylesheets.liquid`
- [ ] Test conditional loading
- [ ] Verify production detection

### NPM Scripts

- [ ] Add build scripts
- [ ] Add clean script
- [ ] Add predeploy hook
- [ ] Test scripts locally

### CI/CD

- [ ] Create build workflow (optional)
- [ ] Test automated builds
- [ ] Configure artifact storage

### Documentation

- [ ] Update README with build instructions
- [ ] Document deployment process
- [ ] Add troubleshooting guide

### Testing

- [ ] Test local development (no build)
- [ ] Test production build
- [ ] Test deployment
- [ ] Verify performance improvements
- [ ] Test source maps (if deployed)

## Expected Results

### File Size Reduction

**CSS:**

- `base.css`: ~50KB → ~35KB (30% reduction)
- `overflow-list.css`: ~5KB → ~3KB (40% reduction)

**JavaScript:**

- `critical.js`: ~20KB → ~12KB (40% reduction)
- `component.js`: ~15KB → ~9KB (40% reduction)
- Average: 35-45% reduction

### Performance Impact

- **Faster page loads** - Smaller files download faster
- **Better caching** - Smaller files cache more efficiently
- **Reduced bandwidth** - Lower data usage for users
- **Improved Core Web Vitals** - Better LCP, FID scores

### Development Impact

- **Zero impact** - Development workflow unchanged
- **Optional builds** - Build only when needed
- **Fast builds** - esbuild is very fast (< 5 seconds)

## Risks & Mitigations

### Risk 1: Build Breaks Production

**Mitigation:** Test builds thoroughly before deploying

### Risk 2: Source Maps Expose Code

**Mitigation:** Optional deployment, can exclude from Shopify

### Risk 3: Importmap Compatibility

**Mitigation:** Test extensively, maintain fallback to source files

### Risk 4: Development Workflow Disruption

**Mitigation:** Build is production-only, dev workflow unchanged

### Risk 5: Build Tool Updates

**Mitigation:** Pin versions, test updates before applying

## Future Enhancements

1. **Code Splitting** - Split large JS files into chunks
2. **Tree Shaking** - Remove unused exports
3. **CSS Purging** - Remove unused CSS (if using utility classes)
4. **Asset Bundling** - Combine related files (if beneficial)
5. **Critical CSS Extraction** - Inline critical CSS
6. **Preload Optimization** - Optimize resource hints
7. **Service Worker** - Cache optimized assets

## References

- [esbuild Documentation](https://esbuild.github.io/)
- [csso Documentation](https://github.com/css/csso)
- [Shopify Asset Optimization](https://shopify.dev/docs/themes/best-practices/performance)
- [Web Performance Best Practices](https://web.dev/performance/)

## Questions & Decisions

### Q1: Should we deploy source maps?

**Decision:** Optional - Include for debugging, exclude for security

### Q2: Should we minify in CI/CD or locally?

**Decision:** Locally before deploy - Simpler, more control

### Q3: Should we bundle files?

**Decision:** No - ES modules work well as separate files

### Q4: Should we use Brotli compression?

**Decision:** Shopify CDN handles this automatically

### Q5: Should we optimize images?

**Decision:** Separate concern - Handle in image optimization plan

---

**Last Updated:** 2026-01-26
**Status:** Planning Phase
**Next Steps:** Review plan, approve approach, begin implementation
