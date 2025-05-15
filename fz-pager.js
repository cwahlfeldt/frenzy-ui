class FrenzyPager extends HTMLElement {
  #items = [];
  #currentPage = 1;
  #itemsPerPage = 10;
  #isReady = false;
  #slot = null;
  #paginationContainer = null;
  #styleElement = null;

  static get observedAttributes() {
    return ["items-per-page"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#itemsPerPage = parseInt(
      this.getAttribute("items-per-page") || this.#itemsPerPage,
      10,
    );
  }

  static get observedAttributes() {
    return ["items-per-page"];
  }

  connectedCallback() {
    this.#itemsPerPage = parseInt(
      this.getAttribute("items-per-page") || this.#itemsPerPage,
      10,
    );

    this.#slot = document.createElement("slot");
    this.#slot.addEventListener("slotchange", this.#handleSlotChange);

    this.#paginationContainer = document.createElement("div");
    this.#paginationContainer.id = "pagination-controls";
    this.#paginationContainer.part = "controls-container";

    this.#styleElement = document.createElement("style");

    // Append style, slot, then pagination controls
    this.shadowRoot.append(
      this.#styleElement,
      this.#slot,
      this.#paginationContainer,
    );

    this.#applyStyles();

    requestAnimationFrame(() => {
      this.#handleSlotChange();
      this.#isReady = true;
      if (this.hasAttribute("items-per-page")) {
        const initialValue = this.getAttribute("items-per-page");
        this.#updateItemsPerPage(initialValue);
      } else {
        this.#renderPagination();
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#isReady) return;

    if (name === "items-per-page") {
      this.#updateItemsPerPage(newValue);
    }
  }

  #updateItemsPerPage(value) {
    const newItemsPerPage = parseInt(value, 10);
    if (!isNaN(newItemsPerPage) && newItemsPerPage > 0) {
      if (this.#itemsPerPage !== newItemsPerPage) {
        this.#itemsPerPage = newItemsPerPage;
        this.#currentPage = 1;
        this.#updateItemVisibility();
        this.#renderPagination();
      }
    } else {
      console.warn(
        `FrenzyPager: Invalid value for items-per-page: ${value}. Must be a positive integer.`,
      );
    }
  }

  #handleSlotChange = () => {
    this.#items = this.#slot
      .assignedNodes({ flatten: true })
      .filter((node) => node.nodeType === Node.ELEMENT_NODE);
    this.#currentPage = 1;

    this.#updateItemVisibility();
    this.#renderPagination();
    this.#adjustHostPadding(); // Adjust host padding when items change
  };

  #updateItemVisibility() {
    if (!this.#items || this.#items.length === 0) {
      if (this.#paginationContainer) {
        this.#paginationContainer.hidden = true;
      }
      return;
    }

    const startIndex = (this.#currentPage - 1) * this.#itemsPerPage;
    const endIndex = startIndex + this.#itemsPerPage;

    this.#items.forEach((item, index) => {
      item.style.display =
        index >= startIndex && index < endIndex ? "" : "none";
    });

    this.dispatchEvent(
      new CustomEvent("pagechange", {
        detail: {
          currentPage: this.#currentPage,
          itemsPerPage: this.#itemsPerPage,
          totalItems: this.#items.length,
          totalPages: Math.ceil(this.#items.length / this.#itemsPerPage),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #renderPagination() {
    if (!this.#paginationContainer) return;

    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);

    const wasHidden = this.#paginationContainer.hidden;
    const isHidden = totalPages <= 1;
    this.#paginationContainer.hidden = isHidden;

    if (totalPages > 1) {
      // Clear only if needed (avoids unnecessary DOM manipulation)
      if (this.#paginationContainer.children.length === 0 || wasHidden) {
        while (this.#paginationContainer.firstChild) {
          this.#paginationContainer.removeChild(
            this.#paginationContainer.firstChild,
          );
        }
        const prevButton = this.#createButton(
          "Previous",
          this.#currentPage === 1,
          "button button-prev",
          this.#goToPrevPage,
        );
        const pageInfo = document.createElement("span");
        pageInfo.id = "page-info";
        pageInfo.part = "page-info";
        pageInfo.setAttribute("role", "status");
        pageInfo.setAttribute("aria-live", "polite");
        const nextButton = this.#createButton(
          "Next",
          this.#currentPage === totalPages,
          "button button-next",
          this.#goToNextPage,
        );
        this.#paginationContainer.append(prevButton, pageInfo, nextButton);
      }
      // Update existing page info text content for efficiency
      const pageInfoSpan =
        this.#paginationContainer.querySelector("#page-info");
      if (pageInfoSpan) {
        pageInfoSpan.textContent = `Page ${this.#currentPage} of ${totalPages}`;
      }
      // Update button disabled states
      const prevBtn =
        this.#paginationContainer.querySelector("button:first-child");
      const nextBtn =
        this.#paginationContainer.querySelector("button:last-child");
      if (prevBtn) prevBtn.disabled = this.#currentPage === 1;
      if (nextBtn) nextBtn.disabled = this.#currentPage === totalPages;
    } else {
      while (this.#paginationContainer.firstChild) {
        this.#paginationContainer.removeChild(
          this.#paginationContainer.firstChild,
        );
      }
    }

    // Adjust host padding after render if visibility changed
    if (wasHidden !== isHidden) {
      this.#adjustHostPadding();
    }
  }

  #createButton(text, disabled, partName, onClickCallback) {
    const button = document.createElement("button");
    button.textContent = text;
    button.disabled = disabled;
    button.part = partName;
    button.className = partName;
    button.type = "button";
    button.addEventListener("click", onClickCallback);
    return button;
  }

  #goToPrevPage = () => {
    if (this.#currentPage > 1) {
      this.#currentPage--;
      this.#updateItemVisibility();
      this.#renderPagination();
    }
  };

  #goToNextPage = () => {
    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    if (this.#currentPage < totalPages) {
      this.#currentPage++;
      this.#updateItemVisibility();
      this.#renderPagination();
    }
  };

  #adjustHostPadding = () => {
    // Add padding to the bottom of the host element to prevent
    // the absolute positioned controls from overlapping the last
    // row of slotted content, only when controls are visible.
    requestAnimationFrame(() => {
      // Ensure calculation happens after render
      if (this.#paginationContainer && !this.#paginationContainer.hidden) {
        const controlsHeight = this.#paginationContainer.offsetHeight;
        // Add some extra space (e.g., 1rem)
        const paddingValue =
          controlsHeight > 0 ? `${controlsHeight / 16 + 1.5}rem` : "3rem"; // Convert px to rem and add buffer
        this.style.paddingBottom = paddingValue;
      } else {
        this.style.paddingBottom = "0";
      }
    });
  };

  #applyStyles() {
    if (!this.#styleElement) return;
    this.#styleElement.textContent = /*css*/ `
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        padding-bottom: 0;
        transition: padding-bottom 0.2s ease-out; /* Smooth transition for padding */
      }

      [hidden] {
        display: none !important;
      }

      ::slotted(*) {
        box-sizing: border-box;
      }

      /* Style the pagination controls container */

      #pagination-controls {
        position: absolute;
        bottom: -1rem; /* Position below the host's bottom edge */
        left: 50%;
        transform: translateX(-50%);
        width: max-content; /* Ensure width fits content */
        max-width: 90%; /* Prevent overflow on small screens */
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap; /* Prevent wrapping */
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        z-index: 10;
      }

      .button {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        background-color: #ffffff;
        color: #374151;
        border-radius: 0.375rem;
        cursor: pointer;
        font: inherit;
        font-size: 0.875rem;
        transition:
          background-color 0.2s ease,
          border-color 0.2s ease,
          opacity 0.2s ease;
        flex-shrink: 0;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .button:not(:disabled):hover,
      .button:not(:disabled):focus-visible {
        background-color: #f3f4f6;
        border-color: #9ca3af;
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      .button:not(:disabled):active {
        background-color: #e5e7eb;
      }

      .button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      #page-info {
        margin-inline: 0.5rem;
        font-size: 0.875rem;
        color: #4b5563;
        white-space: nowrap;
        flex-shrink: 0;
        user-select: none;
      }
    `;
  }
}

customElements.define("fz-pager", FrenzyPager);

export default FrenzyPager;
