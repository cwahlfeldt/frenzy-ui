/**
 * @class FrenzyEditImage
 * @extends HTMLElement
 * @description A custom web component that wraps a slotted `<img>` element,
 * allowing users to replace its source by selecting a new image file by clicking anywhere on the image area.
 * It expects an `<img>` tag to be provided via the default slot.
 * Supports features like read-only/disabled states, preview mode,
 * placeholder fallback on error, and optional persistence to localStorage.
 *
 * @slot - Default slot. Expects a single `<img>` element. The component will manage this image's `src` and `alt`.
 *
 * @fires input - Dispatched when the image source is changed by the user via file selection. Contains `{ detail: { src: newSrc } }`.
 * @fires change - Dispatched after the 'input' event when the image source is changed. Contains `{ detail: { src: newSrc } }`.
 *
 * @attr {string} src - Gets/sets the source URL of the managed `<img>` element. If not set initially, it may adopt the `src` from the slotted image.
 * @attr {string} alt - Gets/sets the alternative text of the managed `<img>` element. If not set initially, it may adopt the `alt` from the slotted image.
 * @attr {boolean} readonly - If present, prevents the user from changing the image but keeps it interactive (e.g., hover effects).
 * @attr {boolean} disabled - If present, disables the component entirely, preventing interaction and reducing opacity.
 * @attr {boolean} preview - If present, acts like readonly, hiding the edit overlay. Useful for displaying the final state without edit controls.
 * @attr {boolean} persist - If present, the component will save its `src` and `alt` attributes to localStorage and load them on initialization.
 * @attr {string} storage-key - Specifies a custom key for localStorage persistence. Defaults to a generated key based on ID or DOM position.
 *
 * @cssprop --fz-editimage-overlay-bg - Background color of the overlay shown on hover (default: rgba(0, 0, 0, 0.5)).
 * @cssprop --fz-editimage-icon-color - Color of the edit icon in the overlay (default: white).
 * @cssprop --fz-editimage-disabled-opacity - Opacity of the component when disabled (default: 0.6).
 * @cssprop --fz-editimage-border-radius - Border radius for the container and slotted image (default: 0px).
 * @cssprop --fz-editimage-aspect-ratio - Aspect ratio for the container (default: auto). Slotted image `object-fit` is set to `cover`.
 * @cssprop --fz-editimage-icon-position - Position of the edit icon within the overlay (default: center). Options: top-right, top-left, bottom-right, bottom-left, center.
 * @cssprop --fz-editimage-icon-size - Size of the edit icon (default: 32px).
 * @cssprop --fz-editimage-icon-padding - Padding around the edit icon (default: 8px).
 *
 * @csspart container - The main container div element.
 * @csspart image - The slotted `<img>` element. This part is dynamically added to the slotted image.
 * @csspart overlay - The overlay `<div>` shown on hover.
 * @csspart edit-icon - The SVG icon inside the overlay.
 */
class FrenzyEditImage extends HTMLElement {
  // --- Static and Private Fields ---
  static observedAttributes = [
    "src",
    "alt",
    "readonly",
    "disabled",
    "preview",
    "persist",
    "storage-key",
  ];

  #shadowRoot;
  #container;
  #imageElement = null;
  #overlay;
  #editIcon; // Reference to the icon within the overlay
  #fileInput;
  #slot;
  #placeholderSrc = "https://placehold.co/400x400/eee/aaa?text=Error";
  #isInitialized = false;

  // --- Lifecycle Methods ---
  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
    this.#createStructureAndStyles();
    this.#addEventListeners();
  }

  connectedCallback() {
    this.#slot = this.#shadowRoot.querySelector("slot");
    this.#slot.addEventListener("slotchange", this.#handleSlotChange);

    this.#findAndInitializeSlottedImage();

    this.#upgradeProperty("src");
    this.#upgradeProperty("alt");
    this.#upgradeProperty("readOnly");
    this.#upgradeProperty("disabled");
    this.#upgradeProperty("preview");
    this.#upgradeProperty("persist");
    this.#upgradeProperty("storageKey");

    this.#updateEditableState();

    if (this.persist) {
      this.#loadFromLocalStorage();
    }

    this.#isInitialized = true;
  }

  disconnectedCallback() {
    if (this.#slot) {
      this.#slot.removeEventListener("slotchange", this.#handleSlotChange);
    }
    if (this.#imageElement) {
      this.#imageElement.onerror = null;
    }
    // No need to remove container click listener explicitly if shadow root is destroyed
    this.#isInitialized = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) {
      return;
    }
    switch (name) {
      case "src":
      case "alt":
        this.#updateRendering();
        if (this.persist) this.#saveToLocalStorage();
        break;
      case "readonly":
      case "disabled":
      case "preview":
        this.#updateEditableState();
        break;
      case "persist":
        if (this.persist) this.#loadFromLocalStorage();
        break;
      case "storage-key":
        if (this.persist) this.#loadFromLocalStorage();
        break;
    }
  }

  // --- Public Property Accessors ---
  // (Getters/Setters for src, alt, readOnly, disabled, preview, persist, storageKey remain the same)
  get src() {
    return this.getAttribute("src") || "";
  }
  set src(value) {
    this.setAttribute("src", String(value || ""));
  }

  get alt() {
    return this.getAttribute("alt") || "";
  }
  set alt(value) {
    this.setAttribute("alt", String(value || ""));
  }

  get readOnly() {
    return this.hasAttribute("readonly");
  }
  set readOnly(value) {
    this.toggleAttribute("readonly", Boolean(value));
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }

  get preview() {
    return this.hasAttribute("preview");
  }
  set preview(value) {
    this.toggleAttribute("preview", Boolean(value));
  }

  get persist() {
    return this.hasAttribute("persist");
  }
  set persist(value) {
    this.toggleAttribute("persist", Boolean(value));
  }

  get storageKey() {
    return this.getAttribute("storage-key") || this.#getDefaultStorageKey();
  }
  set storageKey(value) {
    this.setAttribute("storage-key", String(value));
  }

  // --- Private Helper Methods ---

  #upgradeProperty(prop) {
    if (Object.hasOwn(this, prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  #createStructureAndStyles() {
    // Container
    this.#container = document.createElement("div");
    this.#container.className = "fz-editimage-container";
    this.#container.setAttribute("part", "container");

    // Slot
    this.#slot = document.createElement("slot"); // Assign to #slot here
    this.#container.appendChild(this.#slot);

    // Overlay
    this.#overlay = document.createElement("div");
    this.#overlay.className = "fz-editimage-overlay";
    this.#overlay.setAttribute("part", "overlay");
    this.#container.appendChild(this.#overlay);

    // Edit Icon (inside overlay, no button)
    this.#editIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    this.#editIcon.setAttribute("width", "24"); // Base size, controlled by CSS var
    this.#editIcon.setAttribute("height", "24"); // Base size, controlled by CSS var
    this.#editIcon.setAttribute("viewBox", "0 0 24 24");
    this.#editIcon.setAttribute("fill", "none");
    this.#editIcon.setAttribute("stroke", "currentColor"); // Color controlled by CSS var
    this.#editIcon.setAttribute("stroke-width", "2");
    this.#editIcon.setAttribute("stroke-linecap", "round");
    this.#editIcon.setAttribute("stroke-linejoin", "round");
    this.#editIcon.setAttribute("class", "lucide-image-plus-icon");
    this.#editIcon.setAttribute("part", "edit-icon");
    this.#editIcon.innerHTML = /*html*/ `
        <title>Edit Image</title> <path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>
    `;
    this.#overlay.appendChild(this.#editIcon);

    // Hidden File Input
    this.#fileInput = document.createElement("input");
    this.#fileInput.type = "file";
    this.#fileInput.accept = "image/*";
    this.#fileInput.style.display = "none";
    this.#fileInput.setAttribute("aria-hidden", "true");
    this.#fileInput.setAttribute("tabindex", "-1"); // Prevent tabbing
    this.#container.appendChild(this.#fileInput);

    // Styles
    const styleEl = document.createElement("style");
    styleEl.textContent = /*css*/ `
      /* --- Host Styles & CSS Custom Properties --- */
      :host {
        --fz-editimage-overlay-bg: rgba(0, 0, 0, 0.5);
        --fz-editimage-icon-color: white; /* Changed from button color */
        --fz-editimage-disabled-opacity: 0.6;
        --fz-editimage-border-radius: 0px;
        --fz-editimage-aspect-ratio: auto;
        --fz-editimage-icon-position: center; /* Default position for icon */
        --fz-editimage-icon-size: 32px; /* Default icon size */
        --fz-editimage-icon-padding: 8px; /* Padding around icon */

        display: inline-block;
        position: relative;
        vertical-align: top;
        width: inherit;
        height: inherit;
      }
      :host([hidden]) {
        display: none;
      }

      /* --- Container Styles --- */
      .fz-editimage-container {
        position: relative;
        display: block;
        overflow: hidden;
        cursor: default; /* Default cursor, changed below if editable */
        border-radius: var(--fz-editimage-border-radius);
        aspect-ratio: var(--fz-editimage-aspect-ratio);
        background-color: #eee;
      }

      /* Make container clickable when editable */
      :host(:not([disabled]):not([readonly]):not([preview]))
        .fz-editimage-container {
        cursor: pointer;
      }

      /* --- Disabled/Readonly State Styles --- */
      :host([disabled]) .fz-editimage-container {
        opacity: var(--fz-editimage-disabled-opacity);
        cursor: not-allowed;
      }
      /* readonly and preview keep default cursor (set above) */

      /* --- Slotted Image Styles --- */
      ::slotted(img) {
        display: block;
        width: 100%; /* Ensure image tries to fill */
        height: 100%; /* Ensure image tries to fill */
        object-fit: cover; /* Default to cover */
        border-radius: var(--fz-editimage-border-radius);
        background-color: transparent;
      }

      /* --- Overlay Styles --- */
      .fz-editimage-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--fz-editimage-overlay-bg);
        display: flex; /* Use flexbox for icon positioning */
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        pointer-events: none; /* Overlay doesn't capture clicks */
        border-radius: var(--fz-editimage-border-radius);
      }

      /* --- Icon Positioning within Overlay --- */
      /* Default (center) & fallback */
      :host([style*="--fz-editimage-icon-position: center"])
        .fz-editimage-overlay,
      :host(:not([style*="--fz-editimage-icon-position"]))
        .fz-editimage-overlay {
        align-items: center;
        justify-content: center;
      }
      :host([style*="--fz-editimage-icon-position: top-right"])
        .fz-editimage-overlay {
        align-items: flex-start;
        justify-content: flex-end;
      }
      :host([style*="--fz-editimage-icon-position: top-left"])
        .fz-editimage-overlay {
        align-items: flex-start;
        justify-content: flex-start;
      }
      :host([style*="--fz-editimage-icon-position: bottom-right"])
        .fz-editimage-overlay {
        align-items: flex-end;
        justify-content: flex-end;
      }
      :host([style*="--fz-editimage-icon-position: bottom-left"])
        .fz-editimage-overlay {
        align-items: flex-end;
        justify-content: flex-start;
      }

      /* --- Hover Interaction --- */
      /* Show overlay with icon on hover *only if editable* */
      :host(:not([disabled]):not([readonly]):not([preview]))
        .fz-editimage-container:hover
        .fz-editimage-overlay {
        opacity: 1;
      }
      /* Ensure overlay stays hidden if not editable (redundant but safe) */
      :host([disabled]) .fz-editimage-overlay,
      :host([readonly]) .fz-editimage-overlay,
      :host([preview]) .fz-editimage-overlay {
        opacity: 0 !important;
        pointer-events: none;
      }

      /* --- Edit Icon Styles (replaces button styles) --- */
      .fz-editimage-overlay .lucide-image-plus-icon {
        color: var(--fz-editimage-icon-color); /* Use icon color variable */
        width: var(--fz-editimage-icon-size);
        height: var(--fz-editimage-icon-size);
        /* Apply padding based on position variable for spacing */
        padding: var(--fz-editimage-icon-padding);
        flex-shrink: 0; /* Prevent shrinking if container is small */
      }

      /* --- Slot Styles --- */
      slot {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: var(--fz-editimage-border-radius);
      }
    `;

    this.#shadowRoot.appendChild(styleEl);
    this.#shadowRoot.appendChild(this.#container);
  }

  #addEventListeners() {
    this.#container.addEventListener("click", this.#handleContainerClick);
    this.#fileInput.addEventListener("change", this.#handleFileChange);
    // slotchange listener added in connectedCallback
  }

  #handleSlotChange = () => {
    // console.log("FrenzyEditImage: Slot content changed.");
    if (this.#imageElement) {
      this.#imageElement.onerror = null;
      this.#imageElement.removeAttribute("part"); // Clean up part from old image
    }
    this.#findAndInitializeSlottedImage();
    this.#updateRendering();
    this.#updateEditableState();
  };

  #findAndInitializeSlottedImage() {
    const assignedNodes = this.#slot.assignedNodes({ flatten: true });
    const newImageElement = assignedNodes.find(
      (node) => node.nodeName === "IMG",
    );

    if (newImageElement) {
      this.#imageElement = newImageElement;
      // console.log("FrenzyEditImage: Found slotted image:", this.#imageElement);

      this.#imageElement.setAttribute("part", "image"); // Ensure part is set
      this.#imageElement.onerror = this.#handleImageError;

      const componentSrc = this.getAttribute("src");
      const componentAlt = this.getAttribute("alt");
      const imageSrc = this.#imageElement.getAttribute("src");
      const imageAlt = this.#imageElement.getAttribute("alt");

      // Sync logic (same as before)
      if (componentSrc !== null) {
        if (this.#imageElement.src !== componentSrc) {
          this.#imageElement.src = componentSrc;
        }
      } else if (imageSrc !== null) {
        this.setAttribute("src", imageSrc);
      }

      if (componentAlt !== null) {
        if (this.#imageElement.alt !== componentAlt) {
          this.#imageElement.alt = componentAlt;
        }
      } else if (imageAlt !== null) {
        this.setAttribute("alt", imageAlt);
      } else {
        this.#imageElement.alt = "Editable image";
      }
    } else {
      // console.warn('FrenzyEditImage: No <img> element found in the default slot.');
      this.#imageElement = null;
    }
  }

  #handleImageError = () => {
    // (This method remains the same)
    if (!this.#imageElement) return;
    const currentImageSrc = this.#imageElement.src;
    if (currentImageSrc !== this.#placeholderSrc) {
      console.warn(
        `FrenzyEditImage: Failed to load src "${currentImageSrc}". Falling back to placeholder.`,
      );
      this.#imageElement.src = this.#placeholderSrc;
    } else {
      console.error(
        `FrenzyEditImage: Failed to load placeholder image "${
          this.#placeholderSrc
        }". Hiding image.`,
      );
      this.#imageElement.style.setProperty("display", "none", "important");
      this.#container.style.backgroundColor = "#fdd";
    }
  };

  /**
   * @method #handleContainerClick
   * Opens the file picker when the main container is clicked, if editable.
   * Arrow function preserves `this` context.
   * @param {MouseEvent} event
   * @private
   */
  #handleContainerClick = (event) => {
    // Check if the component is in an editable state
    if (this.disabled || this.readOnly || this.preview) {
      return; // Do nothing if not editable
    }
    this.#fileInput.click();
  };

  #handleFileChange = (event) => {
    if (this.disabled || this.readOnly || this.preview) return;
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.src = e.target.result; // This will trigger attributeChangedCallback -> saveToLocalStorage if persist is true
        this.#dispatchInputEvent();
        this.#dispatchChangeEvent();
      };
      reader.onerror = (e) =>
        console.error("FrenzyEditImage: Error reading file:", e);
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  #updateRendering() {
    if (!this.#imageElement) return;

    const componentSrc = this.src;
    const componentAlt = this.alt || "Editable image";

    this.#imageElement.style.display = "";
    this.#container.style.backgroundColor = "";

    if (this.#imageElement.alt !== componentAlt) {
      this.#imageElement.alt = componentAlt;
    }

    const currentImageSrc = this.#imageElement.src;
    if (componentSrc) {
      if (currentImageSrc !== componentSrc) {
        this.#imageElement.src = componentSrc;
      }
    } else {
      if (currentImageSrc !== this.#placeholderSrc && currentImageSrc !== "") {
        this.#imageElement.src = this.#placeholderSrc;
      } else if (
        currentImageSrc === "" &&
        this.#imageElement.hasAttribute("src")
      ) {
        this.#imageElement.removeAttribute("src");
      }
    }
  }

  #updateEditableState() {
    this.toggleAttribute("disabled", this.disabled);
    this.toggleAttribute("readonly", this.readOnly);
    this.toggleAttribute("preview", this.preview);
  }

  // --- Event Dispatchers ---
  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { src: this.src },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { src: this.src },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // --- Persistence Methods ---
  #getDefaultStorageKey() {
    if (this.id) return `fz-editimage-${this.id}`;
    try {
      const siblings = document.querySelectorAll(this.localName);
      const index = Array.from(siblings).indexOf(this);
      return `fz-editimage-${this.localName}-${index}`;
    } catch (e) {
      console.warn(
        "FrenzyEditImage: Could not determine stable default storage key. Using random key.",
      );
      return `fz-editimage-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }
  }
  #saveToLocalStorage() {
    if (!this.persist) return;
    const key = this.storageKey;
    const altKey = `${key}-alt`;
    try {
      const currentSrc = this.src;
      const currentAlt = this.alt;
      if (currentSrc) localStorage.setItem(key, currentSrc);
      else localStorage.removeItem(key);
      if (currentAlt) localStorage.setItem(altKey, currentAlt);
      else localStorage.removeItem(altKey);
    } catch (error) {
      console.warn(
        `FrenzyEditImage: Failed to save state to localStorage (key: ${key}). Error:`,
        error,
      );
    }
  }
  #loadFromLocalStorage() {
    if (!this.persist || !this.#isInitialized) return; // Guard against running too early
    const key = this.storageKey;
    const altKey = `${key}-alt`;
    try {
      const savedSrc = localStorage.getItem(key);
      const savedAlt = localStorage.getItem(altKey);
      if (savedSrc !== null && savedSrc !== this.src) this.src = savedSrc;
      else if (savedSrc === null && this.src !== "") this.src = "";
      if (savedAlt !== null && savedAlt !== this.alt) this.alt = savedAlt;
      else if (savedAlt === null && this.alt !== "") this.alt = "";
    } catch (error) {
      console.warn(
        `FrenzyEditImage: Failed to load state from localStorage (key: ${key}). Error:`,
        error,
      );
    }
  }
}

// --- Custom Element Registration ---
if (!customElements.get("fz-editimage")) {
  customElements.define("fz-editimage", FrenzyEditImage);
}

// Export the class
export default FrenzyEditImage;
