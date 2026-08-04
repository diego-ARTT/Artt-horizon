/**
 * Theme overrides
 * ---------------
 * Behaviour that intentionally diverges from upstream Horizon. Kept in a file
 * we own so upstream merges never conflict here — do not fold this into an
 * upstream asset.
 */

(() => {
  /**
   * Closes the top drawer when the scrim behind it is clicked (>= 990px only).
   *
   * At this breakpoint the drawer is a *non-modal* dialog, so the browser
   * renders no `::backdrop` and upstream's own backdrop-click handler never
   * fires: it listens on the dialog element and relies on the click
   * retargeting that only modal mode performs. The scrim is ours instead —
   * a `.page-wrapper::after` pseudo-element drawn in theme-overrides.css.
   *
   * Pseudo-elements are not event targets, so a click landing on the scrim is
   * dispatched with `.page-wrapper` itself as the target. Testing for that
   * exact target is what separates a scrim click from a click on real page
   * content, which always targets something deeper.
   *
   * Below 990px the drawer is modal and the native `::backdrop` handles
   * dismissal, so this listener deliberately does nothing.
   */
  const SQUEEZE_QUERY = window.matchMedia('(min-width: 990px)');

  /** @param {Element} drawer */
  const stackOrder = drawer =>
    Number(/** @type {HTMLElement} */ (drawer).style.getPropertyValue('--drawer-stack-order')) || 0;

  document.addEventListener('click', event => {
    if (!SQUEEZE_QUERY.matches) return;

    const pageWrapper = document.querySelector('.page-wrapper--drawer-open');
    if (!pageWrapper || event.target !== pageWrapper) return;

    const openDrawers = Array.from(document.querySelectorAll('theme-drawer[open]'));
    if (!openDrawers.length) return;

    // Close one layer at a time, matching how modal mode dismisses stacked
    // drawers. `--drawer-stack-order` is set on the host element every time a
    // drawer opens or is brought to the front, so the highest value is on top.
    const topmost = openDrawers.reduce((a, b) => (stackOrder(b) >= stackOrder(a) ? b : a));

    // theme-drawer.js is a deferred module, so the element may not have
    // upgraded yet — in which case there is no drawer state to close.
    if (typeof (/** @type {any} */ (topmost).close) === 'function') {
      /** @type {any} */ (topmost).close();
    }
  });
})();
