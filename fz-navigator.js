class FrenzyNavigator extends HTMLElement {
  static get templateString() {
    return /*html*/ `
      <style>
        :host {
          --fz-mobile-menu-bg-color: white;
          --fz-mobile-menu-item-color: white;
          --fz-mobile-menu-toggle-color: black;
          --fz-mobile-menu-toggle-active-color: black;

          display: block;
          background-color: #ffffff;
          font-family: inherit;
        }

        .menu-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .main-nav {
          display: none;
        }

        .main-nav ::slotted(a) {
          margin: 0 12px;
        }

        .hamburger-btn {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 28px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 1001;
        }

        .hamburger-btn span {
          display: block;
          width: 100%;
          height: 3px;
          background-color: var(--fz-mobile-menu-toggle-color);
          border-radius: 3px;
          transition: all 200ms ease-in-out;
        }

        :host([drawer-open="true"]) .hamburger-btn span {
          background-color: var(--fz-mobile-menu-toggle-active-color);
        }

        :host([drawer-open="true"]) .hamburger-btn span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }
        :host([drawer-open="true"]) .hamburger-btn span:nth-child(2) {
          opacity: 0;
        }
        :host([drawer-open="true"]) .hamburger-btn span:nth-child(3) {
          transform: translateY(-13px) rotate(-45deg);
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          max-width: 90vw;
          height: 100%;
          background-color: var(--fz-mobile-menu-bg-color);
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
          transition: right 200ms ease-in-out;
          z-index: 1000;
          overflow-y: auto;
        }

        :host([drawer-open="true"]) .mobile-drawer {
          right: 0;
        }

        .mobile-drawer-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .overlay {
          opacity: 0;
          visibility: hidden;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 999;
          pointer-events: none;
        }

        @media (min-width: 769px) {
          .main-nav {
            display: flex;
            align-items: center;
          }
          .hamburger-btn {
            display: none;
          }
          .mobile-drawer {
            display: none;
          }
          .overlay {
            display: none !important;
            opacity: 0;
            visibility: hidden;
          }
        }
      </style>

      <div id="eyebrow-slot-container">
        <slot name="eyebrow"></slot>
      </div>

      <div class="menu-container">
        <div class="logo-container">
          <slot name="logo"></slot>
        </div>

        <nav class="main-nav">
          <slot name="main-menu"></slot>
        </nav>

        <button
          class="hamburger-btn"
          aria-label="Toggle menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div class="overlay" aria-hidden="true"></div>
      <aside class="mobile-drawer" aria-hidden="true">
        <nav class="mobile-drawer-content">
          <slot name="mobile-menu"></slot>
        </nav>
      </aside>
    `;
  }

  constructor() {
    super();
    const templateElement = document.createElement("template");
    templateElement.innerHTML = FrenzyNavigator.templateString;

    this.attachShadow({ mode: "open" }).appendChild(
      templateElement.content.cloneNode(true)
    );

    this._hamburgerBtn = this.shadowRoot.querySelector(".hamburger-btn");
    this._mobileDrawer = this.shadowRoot.querySelector(".mobile-drawer");
    this._overlay = this.shadowRoot.querySelector(".overlay");

    // Initialize drawer as closed by default
    this._isDrawerOpen = false;

    // Set initial styles for overlay
    this._overlay.style.transition = "opacity 200ms ease-in-out";
    this._overlay.style.opacity = "0";
    this._overlay.style.visibility = "hidden";
    this._overlay.style.pointerEvents = "none";

    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleMobileMenuClick = this.handleMobileMenuClick.bind(this);
  }

  connectedCallback() {
    this._hamburgerBtn.addEventListener("click", this.toggleDrawer);
    this._overlay.addEventListener("click", this.toggleDrawer);

    // Set initial attributes based on closed state
    this.setAttribute("drawer-open", this._isDrawerOpen.toString());
    this._hamburgerBtn.setAttribute(
      "aria-expanded",
      this._isDrawerOpen.toString()
    );
    this._mobileDrawer.setAttribute(
      "aria-hidden",
      (!this._isDrawerOpen).toString()
    );
    this._overlay.setAttribute("aria-hidden", (!this._isDrawerOpen).toString());

    // Close drawer when mobile menu items are clicked
    this.shadowRoot
      .querySelector(".mobile-drawer-content")
      .addEventListener("click", this.handleMobileMenuClick);
  }

  disconnectedCallback() {
    this._hamburgerBtn.removeEventListener("click", this.toggleDrawer);
    this._overlay.removeEventListener("click", this.toggleDrawer);

    // Remove mobile drawer content click listener
    this.shadowRoot
      .querySelector(".mobile-drawer-content")
      .removeEventListener("click", this.handleMobileMenuClick);
  }

  handleMobileMenuClick(event) {
    const clickedElement = event
      .composedPath()
      .find((el) => el.nodeType === Node.ELEMENT_NODE && el.tagName === "A");

    if (clickedElement && this._isDrawerOpen) {
      this.toggleDrawer();
    }
  }

  toggleDrawer() {
    this._isDrawerOpen = !this._isDrawerOpen;

    if (this._isDrawerOpen) {
      document.body.style.overflow = "hidden";
      // When opening: make overlay visible first, then animate opacity
      this._overlay.style.visibility = "visible";
      this._overlay.style.pointerEvents = "auto";

      // Force browser to recognize the visibility change before opacity transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._overlay.style.opacity = "1";
        });
      });
    } else {
      document.body.style.overflow = "";
      this._overlay.style.opacity = "0";

      // Wait for transition to complete before changing visibility
      this._overlay.addEventListener(
        "transitionend",
        (e) => {
          if (e.propertyName === "opacity" && !this._isDrawerOpen) {
            this._overlay.style.visibility = "hidden";
            this._overlay.style.pointerEvents = "none";
          }
        },
        { once: true }
      );
    }

    // Update attributes for accessibility and CSS hooks
    this.setAttribute("drawer-open", this._isDrawerOpen.toString());
    this._hamburgerBtn.setAttribute(
      "aria-expanded",
      this._isDrawerOpen.toString()
    );
    this._mobileDrawer.setAttribute(
      "aria-hidden",
      (!this._isDrawerOpen).toString()
    );
    this._overlay.setAttribute("aria-hidden", (!this._isDrawerOpen).toString());
  }
}

if (!customElements.get("fz-navigator")) {
  customElements.define("fz-navigator", FrenzyNavigator);
}

export default FrenzyNavigator;
