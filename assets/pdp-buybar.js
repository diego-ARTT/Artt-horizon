/**
 * PDP buy bar: keeps app widgets out of the pinned mobile bar.
 *
 * The Dealeasy gift-with-product widget injects itself beside the add-to-cart
 * button, which on mobile is inside the fixed buy bar (blocks/pdp-column.liquid).
 * There it doubled the bar's height and pushed the wallet button off screen.
 * While the bar is pinned, the widget is moved to its app block in the purchase
 * column (or just after the bar when that block is missing). It keeps working
 * after the move: the gift is still added with the tee.
 */

const BAR = '.pdp-column--buybar';
const WIDGETS = 'lb-gift-with-product';
const pinned = window.matchMedia('(max-width: 749px)');

const relocate = () => {
  if (!pinned.matches) return;

  for (const widget of document.querySelectorAll(`${BAR} ${WIDGETS}`)) {
    const bar = widget.closest(BAR);
    if (!bar) continue;

    const home = document.querySelector('[id*="dealeasy_gift_with_product"]');
    if (home && !bar.contains(home)) {
      home.append(widget);
    } else {
      bar.after(widget);
    }
  }
};

if (document.querySelector(BAR)) {
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      relocate();
    });
  };

  relocate();
  pinned.addEventListener('change', relocate);
  // The app injects late and re-injects when a variant change morphs the form.
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
}
