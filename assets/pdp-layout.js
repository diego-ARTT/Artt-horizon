/**
 * PDP layout helpers for the gallery wall (blocks/pdp-column.liquid).
 *
 * 1. Keeps the payment actions together. The Dealeasy gift-with-product
 *    widget injects itself beside the add-to-cart button: on mobile that is
 *    inside the fixed buy bar (it doubled the bar's height and pushed the
 *    wallet button off screen), and on desktop it split Add to cart from
 *    Buy with Shop. At every width the widget is moved to its app block after
 *    the purchase controls (or just after the bar when that block is missing).
 *    The gift is still added with the tee.
 *    Virtual Try-On sits under the size picker (inside the bar's markup); while
 *    the bar is pinned it moves out to just after the bar, so the pinned bar
 *    stays sizes + payment only, and it moves back if the bar unpins.
 * 2. Keeps keyboard focus clear of the bar and the sticky header.
 * 3. Publishes the pinned bar's real height as --pdp-buybar-height. The CSS
 *    default (10rem) fits a size-only bar; a product with a second option
 *    (e.g. Size + Style) grows the bar to ~243px, and the page padding, scroll
 *    padding and the Klaviyo / hCaptcha offsets must follow it.
 * 4. Publishes the desktop side columns' heights so a column taller than the
 *    window scrolls with the page first and sticks once its end is in view.
 */

const BAR = '.pdp-column--buybar';
const WIDGETS = 'lb-gift-with-product';
const pinned = window.matchMedia('(max-width: 749px)');

const TRY_ON = '[id*="vton_app_vton_button"]';

const placeTryOn = () => {
  const bar = document.querySelector(BAR);
  const tryOn = document.querySelector(TRY_ON);
  if (!bar || !tryOn) return;

  if (pinned.matches) {
    if (bar.contains(tryOn)) bar.after(tryOn);
    return;
  }

  // Unpinned: under the size picker, the slot the template gives it.
  const picker = bar.querySelector('variant-picker');
  const slot = picker && [...bar.children].find(child => child.contains(picker));
  if (slot && slot.nextElementSibling !== tryOn) slot.after(tryOn);
};

const relocate = () => {
  placeTryOn();

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

/**
 * Keeps keyboard focus visible between the sticky header and the pinned bar
 * (WCAG 2.4.11). The bar's CSS sets scroll-padding, but Chrome ignores it when
 * scrolling a focused element into view, so the page is nudged here instead.
 * @param {FocusEvent} event
 */
const revealFocus = event => {
  const bar = document.querySelector(BAR);
  const target = event.target;
  if (!pinned.matches || !bar || !(target instanceof Element)) return;
  if (bar.contains(target) || target.closest('#header-component, dialog, [aria-modal="true"]'))
    return;

  requestAnimationFrame(() => {
    // Measure the control itself. Only an input with no visible box of its own
    // (a size chip's hidden radio) is measured by its label; a text field's
    // label is often visually hidden (1x1px) and would misplace the field.
    let rect = target.getBoundingClientRect();
    const label = target instanceof HTMLInputElement ? target.labels?.[0] : null;
    if (label && (rect.width <= 1 || rect.height <= 1)) rect = label.getBoundingClientRect();
    if (!rect.height) return;

    const margin = 16;
    const floor = bar.getBoundingClientRect().top - margin;
    const header = document.querySelector('#header-component');
    const ceiling = (header ? Math.max(0, header.getBoundingClientRect().bottom) : 0) + margin;

    if (rect.bottom > floor) {
      window.scrollBy({ top: rect.bottom - floor, behavior: 'instant' });
    } else if (rect.top < ceiling) {
      window.scrollBy({ top: rect.top - ceiling, behavior: 'instant' });
    }
  });
};

/*
 * The heights live on the root, not the columns: Horizon morphs product details
 * on variant change and would strip an inline style from the column itself.
 */
const COLUMNS = { placard: '.pdp-column--placard', purchase: '.pdp-column--purchase' };
const observed = new WeakSet();
const columnSize = new ResizeObserver(entries => {
  for (const entry of entries) {
    const role = entry.target.matches(COLUMNS.placard) ? 'placard' : 'purchase';
    const height =
      entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
    document.documentElement.style.setProperty(`--pdp-${role}-height`, `${Math.ceil(height)}px`);
  }
});

const barSize = new ResizeObserver(entries => {
  const root = document.documentElement;
  for (const entry of entries) {
    if (!pinned.matches) {
      root.style.removeProperty('--pdp-buybar-height');
      continue;
    }
    const height =
      entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
    if (height) root.style.setProperty('--pdp-buybar-height', `${Math.ceil(height)}px`);
  }
});

const observeColumns = () => {
  for (const selector of Object.values(COLUMNS)) {
    const column = document.querySelector(selector);
    if (!column || observed.has(column)) continue;
    observed.add(column);
    columnSize.observe(column);
  }

  const bar = document.querySelector(BAR);
  if (bar && !observed.has(bar)) {
    observed.add(bar);
    barSize.observe(bar);
  }
};

if (document.querySelector(BAR)) {
  document.addEventListener('focusin', revealFocus);
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      relocate();
      observeColumns();
    });
  };

  relocate();
  observeColumns();
  pinned.addEventListener('change', relocate);
  // The app injects late and re-injects when a variant change morphs the form.
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
}
