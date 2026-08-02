import { Component } from '@theme/component';
import { debounce, fetchConfig } from '@theme/utilities';
import { cartPerformance } from '@theme/performance';

/**
 * A custom element that displays a cart note.
 */
class CartNote extends Component {
  /** @type {string | null} */
  #latestNote = null;

  /** @type {Promise<void> | null} */
  #flushPromise = null;

  /**
   * Handles updates to the cart note.
   * Debounce coalesces keystrokes; the flush loop serializes cart/update writes
   * so an older in-flight payload cannot overwrite a newer note on the server.
   * Aborting cart/update only cancels the client listener — Shopify may still
   * apply the aborted request's body.
   * @param {InputEvent} event - The input event in our text-area.
   */
  updateCartNote = debounce(event => {
    if (!(event.target instanceof HTMLTextAreaElement)) return;

    this.#latestNote = event.target.value;

    if (!this.#flushPromise) {
      this.#flushPromise = this.#flushCartNote(event).finally(() => {
        this.#flushPromise = null;
      });
    }
  }, 200);

  /**
   * @param {InputEvent} event
   */
  async #flushCartNote(event) {
    /** @type {string | null} */
    let lastSent = null;

    try {
      while (this.#latestNote !== null && this.#latestNote !== lastSent) {
        const note = this.#latestNote;

        try {
          const config = fetchConfig('json', {
            body: JSON.stringify({ note }),
          });

          await fetch(Theme.routes.cart_update_url, config);
          lastSent = note;
        } catch {
          // Stop on network errors; a later input event will retry via debounce.
          break;
        }
      }
    } finally {
      cartPerformance.measureFromEvent('note-update:user-action', event);
    }
  }
}

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', CartNote);
}
