class FrenzyCard extends HTMLElement {
  constructor() {
    super();
    this._isFlipped = false;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
    this._attachEventListeners();
    this._setupSlotChangeListener();
  }

  _render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host {
          display: inline-block;
          min-width: 50px;
          min-height: 50px;
          perspective: 1000px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
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
          border-radius: inherit;
          box-sizing: border-box;
        }

        /* Front face - centered layout (no scrolling) */
        .card-front {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--fz-card-front-color, #333333);
          z-index: 2;
        }

        /* Back face - scrollable layout */
        .card-back {
          color: var(--fz-card-back-color, #333333);
          transform: rotateY(180deg);
          overflow-y: auto;
          overflow-x: hidden;
          /* Ensure definite height for scrolling */
          min-height: 100%;
          /* Remove flex centering to allow natural content flow */
          padding: 0; /* Remove default padding, let slotted content control spacing */
        }

        /* Blend modes for specific slotted content */
        ::slotted(.front-team-member-name-wrap) {
          mix-blend-mode: multiply;
        }

        ::slotted(*) {
          text-align: center;
          max-width: 100%;
          box-sizing: border-box;
          isolation: isolate;
        }

        /* Default content styling */
        .default-content {
          padding: 15px;
          font-style: italic;
          color: #777;
          font-size: 0.9em;
        }

        /* Special styling for back face default content to show it's scrollable */
        .card-back .default-content {
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ensure slotted content in back can scroll properly */
        .card-back ::slotted(*) {
          display: block;
          width: 100%;
        }

        /* Optional: Add scroll indicators */
        .card-back::-webkit-scrollbar {
          width: 6px;
        }

        .card-back::-webkit-scrollbar-track {
          background: transparent;
        }

        .card-back::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .card-back::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
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
    // Slot change listeners removed as _updateSize is not being used
  }

  _getSlotContentDimensions(slot) {
    const assignedElements = slot.assignedElements({ flatten: true });
    let contentWidth = 0;
    let contentHeight = 0;

    if (assignedElements.length > 0) {
      const el = assignedElements[0];
      contentWidth = el.scrollWidth;
      contentHeight = el.scrollHeight;
    } else {
      const defaultContent = slot.querySelector(".default-content");
      if (defaultContent) {
        contentWidth = defaultContent.scrollWidth;
        contentHeight = defaultContent.scrollHeight;
      }
    }
    return { width: contentWidth, height: contentHeight };
  }

  _updateSize() {
    const frontSlot = this.shadowRoot.querySelector('slot[name="front"]');
    const backSlot = this.shadowRoot.querySelector('slot[name="back"]');

    const frontDimensions = this._getSlotContentDimensions(frontSlot);
    const backDimensions = this._getSlotContentDimensions(backSlot);

    let newWidth = Math.max(frontDimensions.width, backDimensions.width);
    let newHeight = Math.max(frontDimensions.height, backDimensions.height);

    const fallbackWidth = 200;
    const fallbackHeight = 150;

    if (newWidth <= 0) {
      newWidth = fallbackWidth;
    }
    if (newHeight <= 0) {
      newHeight = fallbackHeight;
    }

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
