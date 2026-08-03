import { Component } from '@theme/component';
import {
  fetchConfig,
  debounce,
  onAnimationEnd,
  prefersReducedMotion,
  resetShimmer,
  startViewTransition,
} from '@theme/utilities';
import { morphSection, sectionRenderer } from '@theme/section-renderer';
import {
  ThemeEvents,
  CartUpdateEvent,
  QuantitySelectorUpdateEvent,
  CartAddEvent,
  DiscountUpdateEvent,
} from '@theme/events';
import { cartPerformance } from '@theme/performance';

/** @typedef {import('./utilities').TextComponent} TextComponent */

/**
 * A custom element that displays a cart items component.
 *
 * @typedef {object} Refs
 * @property {HTMLElement[]} quantitySelectors - The quantity selector elements.
 * @property {HTMLTableRowElement[]} cartItemRows - The cart item rows.
 * @property {TextComponent} cartTotal - The cart total.
 *
 * @extends {Component<Refs>}
 */
class CartItemsComponent extends Component {
  #debouncedOnChange = debounce(this.#onQuantityChange, 300).bind(this);

  /** @type {Promise<void>} */
  #writeChain = Promise.resolve();

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener(ThemeEvents.cartUpdate, this.#handleCartUpdate);
    document.addEventListener(ThemeEvents.discountUpdate, this.handleDiscountUpdate);
    document.addEventListener(ThemeEvents.quantitySelectorUpdate, this.#debouncedOnChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener(ThemeEvents.cartUpdate, this.#handleCartUpdate);
    document.removeEventListener(ThemeEvents.quantitySelectorUpdate, this.#debouncedOnChange);
  }

  /**
   * Resolves the stable Shopify line-item key for a quantity change or row.
   * Line numbers shift when an earlier row is removed; keys do not.
   * @param {EventTarget | null} target
   * @param {number} line
   * @returns {string | undefined}
   */
  #getLineItemKey(target, line) {
    if (target instanceof Element) {
      const row = target.closest('tr[data-key]');
      if (row instanceof HTMLElement && row.dataset.key) {
        return row.dataset.key;
      }
    }

    const rowByLine = this.refs.cartItemRows?.[line - 1];
    return rowByLine?.dataset?.key;
  }

  /**
   * Handles QuantitySelectorUpdateEvent change event.
   * @param {QuantitySelectorUpdateEvent} event - The event.
   */
  #onQuantityChange(event) {
    if (!(event.target instanceof Node) || !this.contains(event.target)) return;

    const { quantity, cartLine: line } = event.detail;

    // Cart items require a line number (used for row lookup / error UI)
    if (!line) return;

    const key = this.#getLineItemKey(event.target, line);
    if (!key) return;

    if (quantity === 0) {
      return this.onLineItemRemove(line);
    }

    this.updateQuantity({
      line,
      key,
      quantity,
      action: 'change',
    });
    const lineItemRow = this.refs.cartItemRows[line - 1];

    if (!lineItemRow) return;

    const textComponent = /** @type {TextComponent | undefined} */ (
      lineItemRow.querySelector('text-component')
    );
    textComponent?.shimmer();
  }

  /**
   * Handles the line item removal.
   * @param {number} line - The line item index.
   */
  onLineItemRemove(line) {
    const cartItemRowToRemove = this.refs.cartItemRows[line - 1];
    const key = cartItemRowToRemove?.dataset.key;

    if (!cartItemRowToRemove || !key) return;

    this.updateQuantity({
      line,
      key,
      quantity: 0,
      action: 'clear',
    });

    const rowsToRemove = [
      cartItemRowToRemove,
      // Get all nested lines of the row to remove
      ...this.refs.cartItemRows.filter(
        row => row.dataset.parentKey === cartItemRowToRemove.dataset.key
      ),
    ];

    // If the cart item row is the last row, optimistically trigger the cart empty state
    const isEmptyCart = rowsToRemove.length == this.refs.cartItemRows.length;

    const template = document.getElementById('empty-cart-template');
    if (isEmptyCart && template instanceof HTMLTemplateElement) {
      const clone = document.importNode(template.content, true);

      startViewTransition(() => {
        this.replaceChildren(clone);
      }, [this.isDrawer ? 'empty-cart-drawer' : 'empty-cart-page']);

      return;
    }

    // Add class to the row to trigger the animation
    rowsToRemove.forEach(row => {
      const remove = () => row.remove();

      if (prefersReducedMotion()) return remove();

      row.style.setProperty('--row-height', `${row.clientHeight}px`);
      row.classList.add('removing');

      // Remove the row after the animation ends
      onAnimationEnd(row, remove);
    });
  }

  /**
   * Enqueues a cart/change write. Overlapping line-number-based changes can hit the
   * wrong item after an earlier remove renumbers the cart; keys + serialization
   * keep quantity updates on the intended line item.
   * @param {Object} config - The config.
   * @param {number} config.line - The line (for error UI / shimmer).
   * @param {string} config.key - The stable cart line-item key.
   * @param {number} config.quantity - The quantity.
   * @param {string} config.action - The action.
   */
  updateQuantity(config) {
    const run = this.#writeChain.then(() => this.#performQuantityUpdate(config));
    // Keep the chain alive after failures so later updates still run.
    this.#writeChain = run.then(
      () => {},
      () => {}
    );
    return run;
  }

  /**
   * @param {Object} config
   * @param {number} config.line
   * @param {string} config.key
   * @param {number} config.quantity
   * @param {string} config.action
   */
  async #performQuantityUpdate(config) {
    const cartPerformaceUpdateMarker = cartPerformance.createStartingMarker(
      `${config.action}:user-action`
    );

    this.#disableCartItems();

    const { line, key, quantity } = config;
    const { cartTotal } = this.refs;

    const cartItemsComponents = document.querySelectorAll('cart-items-component');
    const sectionsToUpdate = new Set([this.sectionId]);
    cartItemsComponents.forEach(item => {
      if (item instanceof HTMLElement && item.dataset.sectionId) {
        sectionsToUpdate.add(item.dataset.sectionId);
      }
    });

    // Prefer stable line-item key (`id`) over `line` index. Concurrent removes
    // renumber cart lines; keys stay tied to the intended merchandise row.
    const body = JSON.stringify({
      id: key,
      quantity: quantity,
      sections: Array.from(sectionsToUpdate).join(','),
      sections_url: window.location.pathname,
    });

    cartTotal?.shimmer();

    try {
      const response = await fetch(
        `${Theme.routes.cart_change_url}`,
        fetchConfig('json', { body })
      );
      const responseText = await response.text();
      const parsedResponseText = JSON.parse(responseText);

      resetShimmer(this);

      if (parsedResponseText.errors) {
        this.#handleCartError(line, parsedResponseText);
        return;
      }

      const newSectionHTML = new DOMParser().parseFromString(
        parsedResponseText.sections[this.sectionId],
        'text/html'
      );

      // Grab the new cart item count from a hidden element
      const newCartHiddenItemCount =
        newSectionHTML.querySelector('[ref="cartItemCount"]')?.textContent;
      const newCartItemCount = newCartHiddenItemCount ? parseInt(newCartHiddenItemCount, 10) : 0;

      // Update data-cart-quantity for all matching variants
      this.#updateQuantitySelectors(parsedResponseText);

      this.dispatchEvent(
        new CartUpdateEvent(parsedResponseText, this.sectionId, {
          itemCount: newCartItemCount,
          source: 'cart-items-component',
          sections: parsedResponseText.sections,
        })
      );

      morphSection(
        this.sectionId,
        parsedResponseText.sections[this.sectionId],
        this.isDrawer ? 'hydration' : 'full'
      );

      this.#updateCartQuantitySelectorButtonStates();
    } catch (error) {
      console.error(error);
      // Optimistic empty-cart / row removal can leave the DOM out of sync with
      // the server when the change request fails — restore from section render.
      try {
        await sectionRenderer.renderSection(this.sectionId, { cache: false });
      } catch (renderError) {
        console.error(renderError);
      }
    } finally {
      this.#enableCartItems();
      cartPerformance.measureFromMarker(cartPerformaceUpdateMarker);
    }
  }

  /**
   * Handles the discount update.
   * @param {DiscountUpdateEvent} event - The event.
   */
  handleDiscountUpdate = event => {
    this.#handleCartUpdate(event);
  };

  /**
   * Handles the cart error.
   * @param {number} line - The line item index.
   * @param {Object} parsedResponseText - The parsed response text.
   * @param {string} parsedResponseText.errors - The errors.
   */
  #handleCartError = (line, parsedResponseText) => {
    const quantitySelector = this.refs.quantitySelectors?.[line - 1];
    const quantityInput = quantitySelector?.querySelector('input');

    // Row may already be gone after optimistic empty-cart / remove animation.
    if (!quantityInput) {
      sectionRenderer.renderSection(this.sectionId, { cache: false });
      return;
    }

    quantityInput.value = quantityInput.defaultValue;

    const cartItemError = this.refs[`cartItemError-${line}`];
    const cartItemErrorContainer = this.refs[`cartItemErrorContainer-${line}`];

    if (!(cartItemError instanceof HTMLElement)) throw new Error('Cart item error not found');
    if (!(cartItemErrorContainer instanceof HTMLElement))
      throw new Error('Cart item error container not found');

    cartItemError.textContent = parsedResponseText.errors;
    cartItemErrorContainer.classList.remove('hidden');
  };

  /**
   * Handles the cart update.
   *
   * @param {DiscountUpdateEvent | CartUpdateEvent | CartAddEvent} event
   */
  #handleCartUpdate = event => {
    if (event instanceof DiscountUpdateEvent) {
      sectionRenderer.renderSection(this.sectionId, { cache: false });
      return;
    }
    if (event.target === this) return;

    const cartItemsHtml = event.detail.data.sections?.[this.sectionId];
    if (cartItemsHtml) {
      morphSection(this.sectionId, cartItemsHtml);

      // Update button states for all cart quantity selectors after morph
      this.#updateCartQuantitySelectorButtonStates();
    } else {
      sectionRenderer.renderSection(this.sectionId, { cache: false });
    }
  };

  /**
   * Disables the cart items.
   */
  #disableCartItems() {
    this.classList.add('cart-items-disabled');
  }

  /**
   * Enables the cart items.
   */
  #enableCartItems() {
    this.classList.remove('cart-items-disabled');
  }

  /**
   * Updates quantity selectors for all matching variants in the cart.
   * @param {Object} updatedCart - The updated cart object.
   * @param {Array<{variant_id: number, quantity: number}>} [updatedCart.items] - The cart items.
   */
  #updateQuantitySelectors(updatedCart) {
    if (!updatedCart.items) return;

    for (const item of updatedCart.items) {
      const variantId = item.variant_id.toString();
      const selectors = document.querySelectorAll(
        `quantity-selector-component[data-variant-id="${variantId}"]`
      );

      for (const selector of selectors) {
        const input = selector.querySelector('input[data-cart-quantity]');
        if (!input) continue;

        input.setAttribute('data-cart-quantity', item.quantity.toString());

        // Update the quantity selector's internal state
        if ('updateCartQuantity' in selector && typeof selector.updateCartQuantity === 'function') {
          selector.updateCartQuantity();
        }
      }
    }
  }

  /**
   * Updates button states for all cart quantity selector components.
   */
  #updateCartQuantitySelectorButtonStates() {
    for (const selector of document.querySelectorAll('cart-quantity-selector-component')) {
      /** @type {any} */ (selector).updateButtonStates?.();
    }
  }

  /**
   * Gets the section id.
   * @returns {string} The section id.
   */
  get sectionId() {
    const { sectionId } = this.dataset;

    if (!sectionId) throw new Error('Section id missing');

    return sectionId;
  }

  /**
   * @returns {boolean} Whether the component is a drawer.
   */
  get isDrawer() {
    return this.dataset.drawer !== undefined;
  }
}

if (!customElements.get('cart-items-component')) {
  customElements.define('cart-items-component', CartItemsComponent);
}
