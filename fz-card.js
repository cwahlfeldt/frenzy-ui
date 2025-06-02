class FrenzyCard extends HTMLElement {
  constructor() {
    super();
    this._isFlipped = false;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
    this._attachEventListeners();
    this._setupSlotChangeListener(); // For dynamic resizing
    // Initial size calculation, might need a slight delay for content to be fully ready
    // requestAnimationFrame(() => this._updateSize());
  }

  _render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host {
          display: inline-block;
          /* Default width and height are removed; JS will set them */
          min-width: 50px; /* Optional: prevent completely collapsing */
          min-height: 50px; /* Optional: prevent completely collapsing */
          perspective: 1000px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          /* Transition for size changes if desired, can make it smoother */
          /* transition: width 0.3s ease, height 0.3s ease; */
        }

        .card-container {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          border-radius: inherit;
        }

        :host(.is-flipped) .card-container {
          transform: rotateY(-180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: inherit;
          box-sizing: border-box;
        }

        /* ::slotted(.team-card-front) {
          background-blend-mode: multiply;
        } */

        ::slotted(.front-team-member-name-wrap) {
          mix-blend-mode: multiply;
        }

        .card-front {
          /* background-color: var(--fz-card-front-bg, #ffffff); */
          color: var(--fz-card-front-color, #333333);
          z-index: 2;
        }

        .card-back {
          /* background-color: var(--fz-card-back-bg, #f8f9fa); */
          color: var(--fz-card-back-color, #333333);
          transform: rotateY(180deg);
        }

        ::slotted(*) {
          text-align: center;
          max-width: 100%;
          box-sizing: border-box;
          isolation: isolate;
        }

        .default-content {
          padding: 15px; /* Add padding to default content for some spacing */
          font-style: italic;
          color: #777;
          font-size: 0.9em;
        }
      </style>
      <div class="card-container" part="container">
        <div class="card-face card-front" part="front">
          <slot name="front">
            <div class="default-content">Front Side (Default)</div>
          </slot>
        </div>
        <div class="card-face card-back" part="back">
          <slot name="back">
            <div class="default-content">Back Side (Default)</div>
          </slot>
        </div>
      </div>
    `;
  }

  _attachEventListeners() {
    this.addEventListener("click", () => {
      this.toggleFlip();
    });
  }

  _setupSlotChangeListener() {
    const frontSlot = this.shadowRoot.querySelector('slot[name="front"]');
    const backSlot = this.shadowRoot.querySelector('slot[name="back"]');

    // Using arrow functions to maintain 'this' context
    // frontSlot.addEventListener("slotchange", () => this._updateSize());
    // backSlot.addEventListener("slotchange", () => this._updateSize());
  }

  _getSlotContentDimensions(slot) {
    const assignedElements = slot.assignedElements({ flatten: true });
    let contentWidth = 0;
    let contentHeight = 0;

    if (assignedElements.length > 0) {
      // Measure the first element assigned to the slot
      const el = assignedElements[0];
      // scrollWidth/Height includes content + padding, and overflowed content
      contentWidth = el.scrollWidth;
      contentHeight = el.scrollHeight;
    } else {
      // If no element is slotted, measure the default content placeholder
      const defaultContent = slot.querySelector(".default-content");
      if (defaultContent) {
        contentWidth = defaultContent.scrollWidth;
        contentHeight = defaultContent.scrollHeight;
      }
    }
    return { width: contentWidth, height: contentHeight };
  }

  // not being used
  _updateSize() {
    const frontSlot = this.shadowRoot.querySelector('slot[name="front"]');
    const backSlot = this.shadowRoot.querySelector('slot[name="back"]');

    const frontDimensions = this._getSlotContentDimensions(frontSlot);
    const backDimensions = this._getSlotContentDimensions(backSlot);

    let newWidth = Math.max(frontDimensions.width, backDimensions.width);
    let newHeight = Math.max(frontDimensions.height, backDimensions.height);

    // Fallback to a default size if content yields no dimensions
    const fallbackWidth = 200;
    const fallbackHeight = 150; // Adjusted fallback height

    if (newWidth <= 0) {
      newWidth = fallbackWidth;
    }
    if (newHeight <= 0) {
      newHeight = fallbackHeight;
    }

    // Apply the calculated dimensions to the host element
    this.style.width = `${newWidth}px`;
    this.style.height = `${newHeight}px`;
  }

  toggleFlip() {
    this._isFlipped = !this._isFlipped;
    this.classList.toggle("is-flipped", this._isFlipped);
    this.dispatchEvent(
      new CustomEvent("flip", { detail: { flipped: this._isFlipped } })
    );
  }

  flipToFront() {
    if (this._isFlipped) this.toggleFlip();
  }

  flipToBack() {
    if (!this._isFlipped) this.toggleFlip();
  }

  get flipped() {
    return this._isFlipped;
  }

  set flipped(value) {
    const shouldBeFlipped = Boolean(value);
    if (this._isFlipped !== shouldBeFlipped) {
      this.toggleFlip();
    }
  }

  static get observedAttributes() {
    return ["flipped"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "flipped") {
      this.flipped = newValue !== null;
    }
  }
}

customElements.define("fz-card", FrenzyCard);
