/**
 * PDP layout helpers for the gallery wall (blocks/pdp-column.liquid).
 *
 * 1. Keeps app widgets out of the pinned mobile bar. The Dealeasy
 *    gift-with-product widget injects itself beside the add-to-cart button,
 *    which on mobile is inside the fixed buy bar; there it doubled the bar's
 *    height and pushed the wallet button off screen. While the bar is pinned,
 *    the widget is moved to its app block in the purchase column (or just after
 *    the bar when that block is missing). The gift is still added with the tee.
 * 2. Keeps keyboard focus clear of the bar and the sticky header.
 * 3. Publishes the desktop side columns' heights so a column taller than the
 *    window scrolls with the page first and sticks once its end is in view.
 * 4. Keeps the pinned bar's price on the selected variant. The span is static
 *    Liquid, and a same-product option change morphs only the variant picker.
 */

const BAR = '.pdp-column--buybar';
const WIDGETS = 'lb-gift-with-product';
const PRICE = '.pdp-buybar__price';

/**
 * @param {string} id
 * @returns {string}
 */
const escapeId = id => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(id);
  return id.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
};

/**
 * Copies the buy-bar price from a variant-change response onto the live node.
 * Returns false when there is nothing safe to write (missing nodes, a price
 * that morph already detached, or an unusable selector).
 *
 * @param {Element | null | undefined} price
 * @param {ParentNode | null | undefined} html
 * @param {string} [sectionId]
 * @returns {boolean}
 */
export const applyBuybarPrice = (price, html, sectionId) => {
  if (!price || !html || !price.isConnected) return false;

  const selector = sectionId ? `#${escapeId(sectionId)} ${PRICE}` : PRICE;

  /** @type {Element | null} */
  const next = (() => {
    try {
      return html.querySelector(selector);
    } catch {
      return null;
    }
  })();

  const nextText = next?.textContent?.trim() ?? '';
  if (!nextText) return false;
  if (price.textContent?.trim() === nextText) return false;

  price.textContent = nextText;
  return true;
};

/**
 * @param {Event & { promise?: Promise<{ detail?: { html?: ParentNode } }> }} event
 */
const syncBuybarPrice = async event => {
  const { target } = event;
  if (!(target instanceof Element)) return;
  if (target.closest('product-card, quick-add-dialog')) return;

  const section = target.closest('.shopify-section');
  const price = section?.querySelector(PRICE);
  if (!section || !price || !event.promise) return;

  try {
    const result = await event.promise;
    if (!price.isConnected) return;
    applyBuybarPrice(price, result?.detail?.html, section.id || undefined);
  } catch {
    // A newer option change aborts the in-flight request. Without HTML there
    // is nothing safe to write.
  }
};

const watchedSections = new WeakSet();

/** @type {{ productSelect: string } | undefined} */
let standardEvents;

const attachPriceSync = () => {
  if (!standardEvents || typeof document === 'undefined') return;

  for (const bar of document.querySelectorAll(BAR)) {
    const section = bar.closest('.shopify-section') ?? document;
    if (watchedSections.has(section)) continue;

    watchedSections.add(section);
    section.addEventListener(standardEvents.productSelect, syncBuybarPrice);
  }
};

const loadPriceSync = async () => {
  try {
    const events = await import('@shopify/events');
    standardEvents = events.StandardEvents;
  } catch {
    return;
  }

  attachPriceSync();
};

/** @type {MediaQueryList | undefined} */
let pinned;

const relocate = () => {
  if (!pinned?.matches) return;

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
  if (!pinned?.matches || !bar || !(target instanceof Element)) return;
  if (bar.contains(target) || target.closest('#header-component, dialog, [aria-modal="true"]'))
    return;

  requestAnimationFrame(() => {
    const box = (target.matches('input') && target.labels?.[0]) || target;
    const rect = box.getBoundingClientRect();
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

/** @type {ResizeObserver | undefined} */
let columnSize;

const observeColumns = () => {
  if (!columnSize) return;

  for (const selector of Object.values(COLUMNS)) {
    const column = document.querySelector(selector);
    if (!column || observed.has(column)) continue;
    observed.add(column);
    columnSize.observe(column);
  }
};

if (typeof document !== 'undefined' && document.querySelector(BAR)) {
  pinned = window.matchMedia('(max-width: 749px)');
  columnSize = new ResizeObserver(entries => {
    for (const entry of entries) {
      const role = entry.target.matches(COLUMNS.placard) ? 'placard' : 'purchase';
      const height =
        entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
      document.documentElement.style.setProperty(`--pdp-${role}-height`, `${Math.ceil(height)}px`);
    }
  });

  document.addEventListener('focusin', revealFocus);
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      relocate();
      observeColumns();
      attachPriceSync();
    });
  };

  relocate();
  observeColumns();
  loadPriceSync();
  pinned.addEventListener('change', relocate);
  // The app injects late and re-injects when a variant change morphs the form.
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
}
