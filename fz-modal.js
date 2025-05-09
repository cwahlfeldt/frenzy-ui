class FrenzyModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = /*html*/ `
      <style>
        :host {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.3s ease,
            visibility 0.3s ease;
        }

        :host([open]) {
          opacity: 1;
          visibility: visible;
        }

        .modal-content {
          margin: auto;
          max-width: 100vw;
          position: relative;
          transform: scale(0.95);
          transition: transform 0.3s ease;
        }

        :host([open]) .modal-content {
          transform: scale(1);
        }

        .close-button {
          color: black;
          display: none;
          position: absolute;
          top: 4rem;
          right: 3rem;
          font-size: 3rem;
          font-weight: 100;
          line-height: 1;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          font-family: unset;
        }

        @media (min-width: 1024px) {
          .close-button {
            display: block;
          }
        }

        .close-button:hover,
        .close-button:focus {
          color: black;
          text-decoration: none;
        }

        .modal-body {
          margin-top: 20px; /* Provides some space if the slotted content doesn't have its own margin */
        }
      </style>

      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button class="close-button" aria-label="Close modal">&times;</button>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  #handleKeydown = (event) => {
    if (event.key === "Escape") {
      this.close();
    }
  };

  #handleBackdropClick = (event) => {
    // Close if the click is directly on the host element (the backdrop)
    if (event.target === this.shadowRoot.host) {
      this.close();
    }
  };

  connectedCallback() {
    const closeButton = this.shadowRoot.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", this.close);
    }
    this.shadowRoot.host.addEventListener("click", this.#handleBackdropClick);
  }

  disconnectedCallback() {
    const closeButton = this.shadowRoot.querySelector(".close-button");
    if (closeButton) {
      closeButton.removeEventListener("click", this.close);
    }
    this.shadowRoot.host.removeEventListener(
      "click",
      this.#handleBackdropClick,
    );
    document.removeEventListener("keydown", this.#handleKeydown);
  }

  open() {
    this.setAttribute("open", "");
    document.addEventListener("keydown", this.#handleKeydown);

    // Attempt to focus the close button if it's visible
    // Useful for accessibility, but do it after the modal is rendered and transitions might have started
    requestAnimationFrame(() => {
      const closeButton = this.shadowRoot.querySelector(".close-button");
      if (
        closeButton &&
        window.getComputedStyle(closeButton).display !== "none"
      ) {
        closeButton.focus();
      }
    });
  }

  close() {
    this.removeAttribute("open");
    document.removeEventListener("keydown", this.#handleKeydown);
    // const scrollY = document.body.style.top; // This line was present but unused.
    // If scroll locking/unlocking is desired,
    // a more robust implementation would be needed.
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  customElements.define("fz-modal", FrenzyModal);
});

export default FrenzyModal;
