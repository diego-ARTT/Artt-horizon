# Phase 1: Critical CSS Implementation - Testing Guide

## ✅ Implementation Complete

**Date:** December 10, 2025  
**Files Modified:**

- ✅ Created `snippets/critical-css.liquid` (6.9KB - under 14KB target!)
- ✅ Updated `snippets/stylesheets.liquid` (async CSS loading)
- ✅ Updated `layout/theme.liquid` (added critical CSS)

## 🎯 Expected Improvements

- **First Contentful Paint (FCP):** 0.5-1.5s improvement
- **Render-blocking CSS:** Reduced by 60-80%
- **Critical CSS size:** 6.9KB (target was <14KB)
- **Full CSS loading:** Now non-blocking via async pattern

## 🧪 Testing Checklist

### 1. Local Development Testing

#### Start Development Server

```bash
cd /Users/gris/Development/artt-horizon
shopify theme dev
```

#### Visual Testing

- [ ] **Homepage loads correctly**
  - Layout renders properly
  - No Flash of Unstyled Content (FOUC)
  - Typography looks correct
  - Spacing/margins are preserved
- [ ] **Product pages render correctly**
  - Product layout intact
  - Images display properly
  - Add to cart button visible and styled
- [ ] **Collection pages work**
  - Product grid displays correctly
  - Filters/sorting UI renders properly
- [ ] **Cart page functions**
  - Cart items display correctly
  - Checkout button styled properly

#### Browser Console Checks

- [ ] No CSS-related errors in console
- [ ] No 404 errors for CSS files
- [ ] Async CSS files load successfully

### 2. Performance Testing

#### Chrome DevTools Lighthouse

```bash
# Open in Chrome/Edge
# 1. Press F12 (DevTools)
# 2. Go to "Lighthouse" tab
# 3. Select "Performance" category
# 4. Choose "Mobile" device
# 5. Click "Analyze page load"
```

**Metrics to compare (before vs after):**

- [ ] First Contentful Paint (FCP): **_s → _**s
- [ ] Largest Contentful Paint (LCP): **_s → _**s
- [ ] Total Blocking Time (TBT): **_ms → _**ms
- [ ] Performance Score: **_ → _**

#### Network Panel Check

```bash
# In Chrome DevTools:
# 1. Go to "Network" tab
# 2. Filter by "CSS"
# 3. Reload page (Cmd+R)
# 4. Verify:
```

- [ ] `critical-css.liquid` is **inlined** (not a separate request)
- [ ] `base.css` loads with `media="print"` initially
- [ ] `base.css` switches to `media="all"` after load
- [ ] `overflow-list.css` loads asynchronously
- [ ] CSS files are marked as "lowest priority" in waterfall

### 3. Throttled Network Testing

#### Slow 3G Simulation

```bash
# In Chrome DevTools:
# 1. Go to "Network" tab
# 2. Click "No throttling" dropdown
# 3. Select "Slow 3G"
# 4. Reload page
```

- [ ] Page still renders content quickly (critical CSS working)
- [ ] No significant FOUC on slow connection
- [ ] Full styles apply smoothly after load

### 4. Browser Compatibility Testing

Test in multiple browsers to ensure async CSS works:

- [ ] **Chrome/Edge** (Latest)
- [ ] **Firefox** (Latest)
- [ ] **Safari** (Latest) - Important for Mac/iOS
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

### 5. JavaScript Disabled Testing

Critical CSS should work even without JavaScript:

```bash
# In Chrome DevTools:
# 1. Press Cmd+Shift+P (Command Palette)
# 2. Type "Disable JavaScript"
# 3. Select "Debugger: Disable JavaScript"
# 4. Reload page
```

- [ ] Noscript fallback loads full CSS
- [ ] Page renders correctly (though async benefit lost)
- [ ] Re-enable JavaScript and verify async works again

## 🔍 Things to Watch For

### Potential Issues

1. **FOUC (Flash of Unstyled Content)**
   - **Symptom:** Brief moment where page has no styles
   - **Fix:** May need to add more critical CSS rules
   - **Check:** Header, hero section, above-the-fold content

2. **Missing Styles**
   - **Symptom:** Some elements not styled until full CSS loads
   - **Fix:** Add those styles to critical CSS
   - **Check:** Buttons, cards, navigation

3. **Duplicate Styles**
   - **Symptom:** Same styles in critical CSS and base.css
   - **Impact:** Minor - increases transfer slightly but not critical
   - **Note:** This is acceptable for Phase 1

4. **Custom Styles Not Working**
   - **Symptom:** Size guide, drawer blur, etc. broken
   - **Fix:** Check if custom styles are in base.css async load
   - **Check:** Size guide button, drawer backdrop blur

## 📊 Success Criteria

✅ **Pass if:**

- FCP improves by at least 0.3s
- No visual regressions on any page
- Lighthouse Performance score increases by 5+ points
- No console errors
- All custom features still work

⚠️ **Needs adjustment if:**

- Noticeable FOUC occurs
- Performance score doesn't improve
- Custom features broken

❌ **Rollback if:**

- Critical errors in console
- Major visual breakage
- Worse performance than before

## 🚀 Deployment Steps

### To Development Theme

```bash
# Deploy to dev theme for testing
shopify theme push --development --allow-live
```

### To Production (After Testing)

```bash
# ONLY after thorough testing on dev theme!
# 1. Commit changes to git
git add .
git commit -m "feat: implement critical CSS for improved FCP (Phase 1)"

# 2. Push to repository
git push origin develop

# 3. Deploy to production theme
shopify theme push --live

# 4. Monitor for 24 hours
# - Check Google Search Console for Core Web Vitals
# - Monitor error logs
# - Watch conversion rates
```

## 📈 Monitoring Post-Deployment

### Google Search Console

- Check "Core Web Vitals" report after 7 days
- Look for improvements in LCP/FCP metrics

### Shopify Analytics

- Monitor conversion rate (should stay same or improve)
- Check bounce rate (should stay same or improve)
- Watch for any error spikes in Online Store logs

## 🔄 Rollback Plan

If issues occur in production:

```bash
# Quick rollback
git revert HEAD
git push origin develop
shopify theme push --live

# Or restore previous theme version from Shopify admin:
# Themes → Actions → Duplicate → Activate previous version
```

## 📝 Next Steps

After Phase 1 is validated:

- **Phase 2:** JavaScript code splitting & lazy loading
- **Phase 3:** Asset minification & compression
- **Phase 4:** Third-party app optimization

## ✅ Sign-off

- [ ] Local testing complete
- [ ] Performance improvements verified
- [ ] Browser compatibility confirmed
- [ ] Dev theme deployed and tested
- [ ] Ready for production deployment

**Tester:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Lighthouse Score Before:** **_  
**Lighthouse Score After:** _**  
**Approved for Production:** ☐ Yes ☐ No
