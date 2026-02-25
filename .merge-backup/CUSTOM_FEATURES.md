# Custom Features to Preserve

## Custom Sections
1. **sections/media-quote-carousel.liquid** - Media quote carousel component
2. **sections/header-marquee.liquid** - Header marquee banner

## Custom Locale Keys (to be re-added after merge)
### In en.default.schema.json:
- "share_information_about_your": "Share information about your brand with your customers"
- "media_quote_carousel": "Media Quote Carousel"
- "media_quote_slide_label": "Slide {{ index }} of {{ total }}: {{ outlet }}"
- "media_quote_carousel_placeholder": "Add quotes from media outlets to showcase your brand"
- "media_quote_logo_alt": "Media outlet logo"
- "media_quote_carousel": "Media quote carousel" (in names section)
- "media_quote_carousel_block": "Quote"

### Text defaults:
- "media_quote_excerpt"
- "media_quote_excerpt_secondary"

## Files to Check After Merge
- Verify critical.js code is in utilities.js
- Verify product-card-link functionality is in product-card.js
- Check if email-signup.js is still needed

## Action Items
1. Save current versions of locale files with custom keys
2. Accept all upstream changes
3. Re-add custom locale keys to all locale files
4. Verify custom sections still work
