# Deferred Script Loading Pitfalls

## Dynamically Injected Custom Elements

When behavior is loaded by scanning the initial DOM, check whether any later code injects matching custom elements. If a loader returns early because no element exists at page load, custom elements inserted later may never upgrade.

Example from quick-add:

- `snippets/scripts.liquid` defers `media-gallery.js` by observing initial `<media-gallery>` elements.
- Collection/search pages can start without a `<media-gallery>`.
- `assets/quick-add.js` later fetches product page markup and injects a `<media-gallery>` into the modal.
- Without a conditional import before injection, the gallery does not register its `variant:update` listener, leaving quick-add variant media stale.

Preferred fix pattern:

```js
if (container.querySelector('custom-element-name') && !customElements.get('custom-element-name')) {
  await import('@theme/custom-element-module');
}
```

Apply this close to the injection point so normal deferred loading still works for pages that render the element initially.
