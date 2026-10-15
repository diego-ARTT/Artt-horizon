/**
 * Hero clear: floating badges stay off the homepage hero.
 *
 * Google's store widget (Google & YouTube app embed) floats bottom-left, which
 * is exactly where the hero's headline and copy sit. Its position is an inline
 * !important style that cannot be moved, so while the first hero is on screen
 * `hero-in-view` on <html> hides it (theme-overrides.css); it returns once the
 * visitor scrolls past.
 */

const hero = document.querySelector('main .hero');

if (hero && 'IntersectionObserver' in window) {
  const root = document.documentElement;

  new IntersectionObserver(
    ([entry]) => {
      root.classList.toggle('hero-in-view', Boolean(entry?.isIntersecting));
    },
    // The hero counts as gone once its last fifth has left the screen.
    { rootMargin: '0px 0px -20% 0px', threshold: 0 }
  ).observe(hero);
}
