class FrenzyPager extends HTMLElement {
  #items = [];
  #currentPage = 1;
  #itemsPerPage = 10;
  #isReady = false;
  #slot = null;
  #paginationContainer = null;
  #dotsContainer = null;
  #leftArrow = null;
  #rightArrow = null;
  #styleElement = null;

  static get observedAttributes() {
    return ["items-per-page", "controls", "dots", "arrows"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#itemsPerPage = parseInt(
      this.getAttribute("items-per-page") || this.#itemsPerPage,
      10
    );
  }

  connectedCallback() {
    this.#itemsPerPage = parseInt(
      this.getAttribute("items-per-page") || this.#itemsPerPage,
      10
    );

    this.#slot = document.createElement("slot");
    this.#slot.addEventListener("slotchange", this.#handleSlotChange);

    this.#paginationContainer = document.createElement("div");
    this.#paginationContainer.id = "pagination-controls";
    this.#paginationContainer.part = "controls-container";

    this.#dotsContainer = document.createElement("div");
    this.#dotsContainer.id = "dots-navigation";
    this.#dotsContainer.part = "dots-container";

    this.#leftArrow = document.createElement("button");
    this.#leftArrow.id = "left-arrow";
    this.#leftArrow.part = "arrow arrow-left";
    this.#leftArrow.className = "arrow arrow-left";
    this.#leftArrow.type = "button";
    this.#leftArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="44.424" height="76.168" viewBox="0 0 44.424 76.168"><path d="M1.859 42.567a6.355 6.355 0 0 1 0-8.982L33.584 1.861a6.351 6.351 0 0 1 8.982 8.982L15.322 38.086l27.223 27.243a6.351 6.351 0 0 1-8.982 8.982L1.838 42.586Z" fill="#0033a0"/></svg>`;
    this.#leftArrow.setAttribute("aria-label", "Previous page");
    this.#leftArrow.addEventListener("click", this.#goToPrevPage);

    this.#rightArrow = document.createElement("button");
    this.#rightArrow.id = "right-arrow";
    this.#rightArrow.part = "arrow arrow-right";
    this.#rightArrow.className = "arrow arrow-right";
    this.#rightArrow.type = "button";
    this.#rightArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="44.424" height="76.168" viewBox="0 0 44.424 76.168"><path d="M42.565 33.603a6.355 6.355 0 0 1 0 8.982L10.84 74.309a6.351 6.351 0 0 1-8.982-8.982l27.244-27.243L1.879 10.841a6.351 6.351 0 0 1 8.982-8.982l31.725 31.725Z" fill="#0033a0"/></svg>`;
    this.#rightArrow.setAttribute("aria-label", "Next page");
    this.#rightArrow.addEventListener("click", this.#goToNextPage);

    this.#styleElement = document.createElement("style");

    // Append style, arrows, slot, then navigation elements
    this.shadowRoot.append(
      this.#styleElement,
      this.#leftArrow,
      this.#slot,
      this.#rightArrow,
      this.#paginationContainer,
      this.#dotsContainer
    );

    this.#applyStyles();

    requestAnimationFrame(() => {
      this.#handleSlotChange();
      this.#isReady = true;
      if (this.hasAttribute("items-per-page")) {
        const initialValue = this.getAttribute("items-per-page");
        this.#updateItemsPerPage(initialValue);
      } else {
        this.#renderNavigationElements();
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#isReady) return;

    if (name === "items-per-page") {
      this.#updateItemsPerPage(newValue);
    } else if (name === "controls" || name === "dots" || name === "arrows") {
      this.#renderNavigationElements();
    }
  }

  #updateItemsPerPage(value) {
    const newItemsPerPage = parseInt(value, 10);
    if (!isNaN(newItemsPerPage) && newItemsPerPage > 0) {
      if (this.#itemsPerPage !== newItemsPerPage) {
        this.#itemsPerPage = newItemsPerPage;
        this.#currentPage = 1;
        this.#updateItemVisibility();
        this.#renderNavigationElements();
      }
    } else {
      console.warn(
        `FrenzyPager: Invalid value for items-per-page: ${value}. Must be a positive integer.`
      );
    }
  }

  #handleSlotChange = () => {
    this.#items = this.#slot
      .assignedNodes({ flatten: true })
      .filter((node) => node.nodeType === Node.ELEMENT_NODE);
    this.#currentPage = 1;

    this.#updateItemVisibility();
    this.#renderNavigationElements();
    this.#adjustHostPadding();
  };

  #updateItemVisibility() {
    if (!this.#items || this.#items.length === 0) {
      this.#hideAllNavigation();
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
      })
    );
  }

  #hideAllNavigation() {
    if (this.#paginationContainer) this.#paginationContainer.hidden = true;
    if (this.#dotsContainer) this.#dotsContainer.hidden = true;
    if (this.#leftArrow) this.#leftArrow.hidden = true;
    if (this.#rightArrow) this.#rightArrow.hidden = true;
  }

  #renderNavigationElements() {
    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    const shouldShowNavigation = totalPages > 1;

    // Handle controls attribute
    if (this.hasAttribute("controls") && shouldShowNavigation) {
      this.#renderPagination();
    } else {
      this.#paginationContainer.hidden = true;
    }

    // Handle dots attribute
    if (this.hasAttribute("dots") && shouldShowNavigation) {
      this.#renderDots();
    } else {
      this.#dotsContainer.hidden = true;
    }

    // Handle arrows attribute
    if (this.hasAttribute("arrows") && shouldShowNavigation) {
      this.#renderArrows();
    } else {
      this.#leftArrow.hidden = true;
      this.#rightArrow.hidden = true;
    }

    // If no navigation is shown, hide all
    if (!shouldShowNavigation) {
      this.#hideAllNavigation();
    }

    this.#adjustHostPadding();
  }

  #renderPagination() {
    if (!this.#paginationContainer) return;

    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    this.#paginationContainer.hidden = false;

    // Clear and rebuild controls
    while (this.#paginationContainer.firstChild) {
      this.#paginationContainer.removeChild(
        this.#paginationContainer.firstChild
      );
    }

    const prevButton = this.#createButton(
      "Previous",
      this.#currentPage === 1,
      "button button-prev",
      this.#goToPrevPage
    );
    const pageInfo = document.createElement("span");
    pageInfo.id = "page-info";
    pageInfo.part = "page-info";
    pageInfo.setAttribute("role", "status");
    pageInfo.setAttribute("aria-live", "polite");
    pageInfo.textContent = `Page ${this.#currentPage} of ${totalPages}`;
    const nextButton = this.#createButton(
      "Next",
      this.#currentPage === totalPages,
      "button button-next",
      this.#goToNextPage
    );
    this.#paginationContainer.append(prevButton, pageInfo, nextButton);
  }

  #renderDots() {
    if (!this.#dotsContainer) return;

    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    this.#dotsContainer.hidden = false;

    // Clear existing dots
    while (this.#dotsContainer.firstChild) {
      this.#dotsContainer.removeChild(this.#dotsContainer.firstChild);
    }

    // Create dots for each page
    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement("button");
      dot.className = `dot ${i === this.#currentPage ? "active" : ""}`;
      dot.part = `dot ${i === this.#currentPage ? "dot-active" : ""}`;
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to page ${i}`);
      dot.addEventListener("click", () => this.#goToPage(i));
      this.#dotsContainer.appendChild(dot);
    }
  }

  #renderArrows() {
    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);

    this.#leftArrow.hidden = false;
    this.#rightArrow.hidden = false;
    this.#leftArrow.disabled = this.#currentPage === 1;
    this.#rightArrow.disabled = this.#currentPage === totalPages;
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

  #goToPage(pageNumber) {
    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== this.#currentPage
    ) {
      this.#currentPage = pageNumber;
      this.#updateItemVisibility();
      this.#renderNavigationElements();
    }
  }

  #goToPrevPage = () => {
    if (this.#currentPage > 1) {
      this.#currentPage--;
      this.#updateItemVisibility();
      this.#renderNavigationElements();
    }
  };

  #goToNextPage = () => {
    const totalPages = Math.ceil(this.#items.length / this.#itemsPerPage);
    if (this.#currentPage < totalPages) {
      this.#currentPage++;
      this.#updateItemVisibility();
      this.#renderNavigationElements();
    }
  };

  #adjustHostPadding = () => {
    requestAnimationFrame(() => {
      let maxHeight = 0;

      // Check height of visible navigation elements
      if (!this.#paginationContainer.hidden) {
        maxHeight = Math.max(maxHeight, this.#paginationContainer.offsetHeight);
      }
      if (!this.#dotsContainer.hidden) {
        maxHeight = Math.max(maxHeight, this.#dotsContainer.offsetHeight);
      }

      if (maxHeight > 0) {
        const paddingValue = `${maxHeight / 16 + 1.5}rem`;
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
        transition: padding-bottom 0.2s ease-out;
      }

      [hidden] {
        display: none !important;
      }

      ::slotted(*) {
        box-sizing: border-box;
      }

      /* Pagination controls container */
      #pagination-controls {
        position: absolute;
        bottom: -1rem;
        left: 50%;
        transform: translateX(-50%);
        width: max-content;
        max-width: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        z-index: 10;
      }

      /* Dots navigation container */
      #dots-navigation {
        position: absolute;
        bottom: -1rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        z-index: 10;
      }

      /* Left and right arrows */
      .arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 2.5rem;
        height: 2.5rem;
        background-color: transparent;
        color: #374151;
        cursor: pointer;
        font-size: 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        filter: brightness(1);
        justify-content: center;
        border: none;
        z-index: 10;
        transition: filter 200ms ease-in-out;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .arrow-left {
        left: -1rem;
      }

      .arrow-right {
        right: -1rem;
      }

      .arrow:not(:disabled):hover,
      .arrow:not(:disabled):focus-visible {
        filter: brightness(0.5);
      }

      .arrow:not(:disabled):active {
        background-color: rgba(229, 231, 235, 0.95);
      }

      .arrow:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }

      /* Standard button styles */
      .button {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        background-color: #ffffff;
        color: #374151;
        border-radius: 0.375rem;
        cursor: pointer;
        font: inherit;
        font-size: 0.875rem;
        outline: none;
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

      /* Dot styles */
      .dot {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        border: 1px solid #d1d5db;
        background-color: #ffffff;
        cursor: pointer;
        transition:
          background-color 0.2s ease,
          border-color 0.2s ease,
          transform 0.2s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .dot:hover,
      .dot:focus-visible {
        background-color: #f3f4f6;
        border-color: #9ca3af;
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      .dot.active {
        background-color: #374151;
        border-color: #374151;
      }

      .dot:active {
        transform: scale(0.95);
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
