/**
 * Header slide (sticky mode "scroll-up").
 *
 * Horizon hides a scroll-up header by fading it and dropping it out of sticky
 * positioning. ARTT slides it instead (theme-overrides.css). CSS alone can't
 * tell the two ways into the `idle` state apart:
 *
 * - inactive -> idle: the header scrolled off naturally. Nothing to animate.
 * - active -> idle:   a visible sticky header is being hidden. Slide it out.
 *
 * This marks the second case on the header section with `data-header-hiding`,
 * and clears it once the header is shown again or is back at the top.
 */

const header = document.querySelector('header-component[sticky="scroll-up"]');
const section = header?.closest('.header-section');

if (header && section) {
  let previous = header.dataset.stickyState;

  new MutationObserver(() => {
    const current = header.dataset.stickyState;
    if (current === previous) return;

    if (previous === 'active' && current === 'idle') {
      section.setAttribute('data-header-hiding', '');
    } else if (current === 'active' || current === 'inactive') {
      section.removeAttribute('data-header-hiding');
    }

    previous = current;
  }).observe(header, { attributes: true, attributeFilter: ['data-sticky-state'] });
}
