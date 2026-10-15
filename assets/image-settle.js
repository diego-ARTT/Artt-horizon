/**
 * Image settle: below-the-fold product imagery arrives slightly enlarged and
 * settles to rest once, as its frame enters the viewport.
 *
 * Frames start as `data-settle="out"` only when they are below the fold at the
 * moment they are found, so nothing visible on load ever moves. Without this
 * script (or with reduced motion) no attribute is set and images sit at rest.
 * Frames added later (recommendations are fetched in, galleries are morphed on
 * variant change) are picked up by a MutationObserver.
 */

const FRAMES = [
  '.product-information .media-gallery__grid .product-media-container',
  '.product-recommendations .product-media-container',
  '.art-story__media',
].join(',');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        /** @type {HTMLElement} */ (entry.target).dataset.settle = 'in';
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  const tag = () => {
    for (const frame of document.querySelectorAll(FRAMES)) {
      if (!(frame instanceof HTMLElement) || frame.dataset.settle) continue;

      if (frame.getBoundingClientRect().top < window.innerHeight) {
        frame.dataset.settle = 'in';
      } else {
        frame.dataset.settle = 'out';
        observer.observe(frame);
      }
    }
  };

  let queued = false;
  const queueTag = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      tag();
    });
  };

  tag();
  new MutationObserver(queueTag).observe(document.body, { childList: true, subtree: true });
}
