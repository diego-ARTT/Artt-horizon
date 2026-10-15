import assert from 'node:assert/strict';
import test from 'node:test';
import { applyBuybarPrice } from '../assets/pdp-layout.js';

/**
 * @param {string} text
 * @param {{ connected?: boolean }} [options]
 */
const priceNode = (text, { connected = true } = {}) => ({
  isConnected: connected,
  textContent: text,
});

/**
 * @param {Record<string, { textContent: string } | null>} matches
 */
const response = matches => ({
  /**
   * @param {string} selector
   */
  querySelector(selector) {
    if (Object.prototype.hasOwnProperty.call(matches, selector)) return matches[selector];
    return null;
  },
});

test('copies the price from the matching section', () => {
  const price = priceNode('$48.00');
  const html = response({
    '#shopify-section-main .pdp-buybar__price': { textContent: '\n  $64.00\n' },
    '.pdp-buybar__price': { textContent: '$10.00' },
  });

  assert.equal(applyBuybarPrice(price, html, 'shopify-section-main'), true);
  assert.equal(price.textContent, '$64.00');
});

test('does not write a price node that morph already detached', () => {
  const price = priceNode('$48.00', { connected: false });
  const html = response({
    '#shopify-section-main .pdp-buybar__price': { textContent: '$64.00' },
  });

  assert.equal(applyBuybarPrice(price, html, 'shopify-section-main'), false);
  assert.equal(price.textContent, '$48.00');
});

test('does not take a price from another section', () => {
  const price = priceNode('$48.00');
  const html = response({
    '#shopify-section-other .pdp-buybar__price': { textContent: '$12.00' },
  });

  assert.equal(applyBuybarPrice(price, html, 'shopify-section-main'), false);
  assert.equal(price.textContent, '$48.00');
});

test('leaves the node alone when the rendered price already matches', () => {
  const price = priceNode('  $64.00  ');
  const html = response({
    '.pdp-buybar__price': { textContent: '$64.00' },
  });

  assert.equal(applyBuybarPrice(price, html), false);
  assert.equal(price.textContent, '  $64.00  ');
});

test('ignores a response with no buy-bar price', () => {
  const price = priceNode('$48.00');

  assert.equal(applyBuybarPrice(price, response({}), 'shopify-section-main'), false);
  assert.equal(applyBuybarPrice(null, response({}), 'shopify-section-main'), false);
  assert.equal(price.textContent, '$48.00');
});

test('ignores a selector the document cannot parse', () => {
  const price = priceNode('$48.00');
  const html = {
    querySelector() {
      throw new SyntaxError('invalid selector');
    },
  };

  assert.equal(applyBuybarPrice(price, html, 'shopify-section-main'), false);
  assert.equal(price.textContent, '$48.00');
});
