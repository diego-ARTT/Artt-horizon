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
