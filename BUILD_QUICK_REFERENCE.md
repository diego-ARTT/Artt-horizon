# Production Build - Quick Reference

## TL;DR

**Goal:** Minify CSS/JS for production only, keep dev workflow unchanged.

**How:** Build scripts that run only when `NODE_ENV=production`.

**When:** Before deploying to production.

## Commands

```bash
# Build production assets
npm run build

# Build CSS only
npm run build:css

# Build JS only
npm run build:js

# Clean build artifacts
npm run build:clean

# Build + Deploy
npm run build && shopify theme push
```

## File Structure

```
assets/
  ├── *.js              # Source (committed)
  ├── *.css             # Source (committed)
  ├── *.min.js          # Minified (gitignored, deployed)
  └── *.min.css         # Minified (gitignored, deployed)
```

## Environment Detection

**Development (local):**

- `shopify theme dev` → Uses source files
- No build needed

**Production:**

- `shop.environment == 'production'` → Uses minified files
- Build before deploying

## Key Files

- `scripts/build.js` - Main build orchestrator
- `scripts/build-css.js` - CSS minification
- `scripts/build-js.js` - JavaScript minification
- `scripts/utils/config.js` - Build configuration
- `snippets/scripts.liquid` - Conditional importmap
- `snippets/stylesheets.liquid` - Conditional CSS loading

## Workflow

1. **Develop locally** → No changes needed
2. **Build for production** → `npm run build`
3. **Deploy** → `shopify theme push`
4. **Production uses minified** → Automatic via Liquid conditionals

## Expected Results

- **30-45% file size reduction**
- **Faster page loads**
- **Better caching**
- **Zero dev workflow impact**

## Troubleshooting

| Issue               | Solution                        |
| ------------------- | ------------------------------- |
| Build fails         | Check `NODE_ENV=production`     |
| Files not loading   | Verify Liquid templates updated |
| Source maps missing | Check build output              |
| Build slow          | Normal for first build          |

## Documentation

- **Full Plan:** `PRODUCTION_BUILD_OPTIMIZATION_PLAN.md`
- **Implementation:** `BUILD_IMPLEMENTATION_GUIDE.md`
- **Quick Ref:** This file

---

**Status:** Planning Complete ✅  
**Next:** Implementation
