import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.window = {
  requestIdleCallback: undefined,
  setTimeout,
  requestAnimationFrame: callback => setTimeout(callback, 0),
};
globalThis.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
globalThis.customElements = {
  get: () => class {},
  define() {},
};
globalThis.HTMLElement = class HTMLElement {};
globalThis.ResizeObserver = class ResizeObserver {};
globalThis.MutationObserver = class MutationObserver {
  observe() {}
  disconnect() {}
};
globalThis.document = {
  readyState: 'complete',
  documentElement: {
    setAttribute() {},
    removeAttribute() {},
  },
  addEventListener() {},
  head: { querySelector: () => null },
  querySelector: () => null,
  body: { style: { setProperty() {} } },
};

const { debounce } = await import('../assets/utilities.js');

test('flush runs a pending debounced call immediately', () => {
  let calls = 0;
  const debounced = debounce(() => {
    calls += 1;
  }, 500);

  debounced();
  assert.equal(calls, 0);
  debounced.flush();
  assert.equal(calls, 1);
  debounced.flush();
  assert.equal(calls, 1);
});

test('cancel drops a pending call so flush does not run it', () => {
  let calls = 0;
  const debounced = debounce(() => {
    calls += 1;
  }, 500);

  debounced('first');
  debounced.cancel();
  debounced.flush();
  assert.equal(calls, 0);

  debounced('second');
  debounced.flush();
  assert.equal(calls, 1);
});

test('flush keeps the latest arguments and receiver', () => {
  /** @type {unknown[]} */
  const seen = [];
  const debounced = debounce(function (value) {
    seen.push([this, value]);
  }, 500);
  const receiver = { id: 'cart' };

  debounced.call(receiver, 'old');
  debounced.call(receiver, 'new');
  debounced.flush();

  assert.deepEqual(seen, [[receiver, 'new']]);
});
