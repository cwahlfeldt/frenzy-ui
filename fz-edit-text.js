/**
 * FrenzyEditText Web Component (Enhancer Version with Toolbar, Auto Color, Font/Weight Controls, Reset, and State Reflection)
 *
 * Enhances the first slotted HTML element, making it directly editable
 * inline. Manages state, persistence, and events. Provides a formatting
 * toolbar with dynamic font selection (loads all weights), weight adjustment,
 * color picker, reset button, and reflects the current selection's format.
 * Toolbar visibility is tied to focus within the editable element.
 *
 * NOTE: Font family, font weight, and the bold button now apply to the *entire*
 * element's content for consistency and simplicity.
 *
 * @element fz-edit-text
 *
 * @attr {string} value - The text value (potentially containing HTML).
 * @attr {string} placeholder - Placeholder text.
 * @attr {number} maxlength - Maximum character length (ignored if `toolbar` is active).
 * @attr {boolean} readonly - Makes the text non-editable.
 * @attr {boolean} disabled - Disables the component.
 * @attr {boolean} highlight - Applies a highlight background style.
 * @attr {number} tabindex - Sets the host's tab index.
 * @attr {boolean} persist - Saves/loads value, font family, and font weight to/from localStorage via 'id'.
 * @attr {boolean} toolbar - Enables rich text editing and shows the toolbar.
 * @attr {boolean} auto-color - If set, applies the text color defined by the CSS variable
 * `--color-changer-icon-color`. Hides the manual color picker.
 *
 * @prop {string} value - Gets or sets the current value (potentially HTML).
 * @prop {string} placeholder - Gets or sets the placeholder text.
 * @prop {number | null} maxLength - Gets or sets the max length (ignored if `toolbar`).
 * @prop {boolean} readOnly - Gets or sets the readonly state.
 * @prop {boolean} disabled - Gets or sets the disabled state.
 * @prop {boolean} persist - Gets or sets the persistence state.
 * @prop {boolean} highlight - Gets or sets the highlight state.
 * @prop {boolean} toolbar - Gets or sets the toolbar state.
 * @prop {boolean} autoColor - Gets or sets the auto-color state.
 * @prop {HTMLElement | null} editableElement - Gets the slotted element being edited.
 *
 * @fires input - When the value changes due to user input. Detail: { value: string }
 * @fires change - When the value is committed (blur/Enter). Detail: { value: string }
 * @fires char-count - On value change. Detail: { value: string, length: number, maxLength: number | null }
 * @fires max-length - On attempt to exceed maxlength (no toolbar). Detail: { value: string, length: number, maxLength: number }
 * @fires slotted-element-missing - If no suitable element found in slot.
 * @fires font-load-error - If a selected Google Font stylesheet (all weights) fails to load. Detail: { fontName: string, error: Error }
 * @fires reset - When the reset button is clicked.
 *
 * @cssprop --editable-hover-border-color - Default: #ccc.
 * @cssprop --editable-focus-border-color - Default: #4dabf7.
 * @cssprop --editable-hover-background-color - Default: rgba(240, 249, 255, 0.6).
 * @cssprop --editable-focus-background-color - Default: rgba(231, 245, 255, 0.8).
 * @cssprop --editable-highlight-color - Default: rgba(255, 255, 0, 0.2).
 * @cssprop --editable-placeholder-color - Default: #999 (Used by global CSS).
 * @cssprop --editable-disabled-opacity - Default: 0.6.
 * @cssprop --editable-toolbar-background - Default: #f8f9fa.
 * @cssprop --editable-toolbar-border - Default: #dee2e6.
 * @cssprop --editable-toolbar-button-hover-background - Default: #e9ecef.
 * @cssprop --editable-toolbar-button-active-background - Default: #d0ebff;
 * @cssprop --editable-toolbar-color-input-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-background - Default: #fff.
 * @cssprop --editable-toolbar-slider-thumb-background - Default: #4dabf7.
 * @cssprop --editable-toolbar-slider-track-background - Default: #dee2e6.
 * @cssprop --color-changer-icon-color - **Read by the component** when `auto-color` is set.
 *
 * @slot - Default slot. Expects a single HTML element (e.g., h1, p, div).
 *
 * @example Required Global CSS for Placeholder:
 * ```css
 * [data-editable-placeholder]:empty::before {
 * content: attr(data-editable-placeholder);
 * color: var(--editable-placeholder-color, #999);
 * font-style: italic;
 * pointer-events: none;
 * display: inline;
 * user-select: none;
 * opacity: 0.8;
 * }
 * ```
 */
class FrenzyEditText extends HTMLElement {
  // --- Private Class Fields ---
  #internals;
  #slottedElement = null;
  #toolbarElement = null;
  #colorInputElement = null;
  #fontSelectElement = null;
  #fontWeightSliderElement = null;
  #fontWeightValueElement = null;
  #resetButtonElement = null;
  #boldButtonElement = null;
  #italicButtonElement = null;
  #currentValue = "";
  #initialComponentValue = ""; // Stores the very first value set (or default)
  #initialValueOnFocus = null; // Stores value when focus is gained
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null;
  #toolbarFocusTimeout = null;
  #currentFontFamily = "inherit"; // Default font family
  #currentFontWeight = 400; // Default font weight
  #requestedFontFamilies = new Set();
  #updateToolbarStateTimeout = null;
  #hasFocusWithin = false; // Track focus within component
  hasWarnedAboutMissingId = false; // Track warning for persist

  // Bound event listeners
  _boundHandleFocusIn = null;
  _boundHandleFocusOut = null;
  _boundHandleSlottedInput = null;
  _boundHandleSlottedKeydown = null;
  _boundHandleSlottedMouseUp = null;
  _boundHandleMutation = null;
  _boundHandleToolbarMouseDown = null;
  _boundHandleToolbarColorInput = null;
  _boundHandleFontChange = null;
  _boundHandleFontWeightChange = null;
  _boundHandleReset = null;
  _boundHandleSelectionChange = null;

  // --- Static Properties ---
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "maxlength",
      "readonly",
      "disabled",
      "highlight",
      "tabindex",
      "persist",
      "id",
      "toolbar",
      "auto-color",
    ];
  }

  static availableFonts = [
    { name: "Default", family: "inherit" },
    { name: "Roboto", family: "'Roboto', sans-serif" },
    { name: "Open Sans", family: "'Open Sans', sans-serif" },
    { name: "Lato", family: "'Lato', sans-serif" },
    { name: "Montserrat", family: "'Montserrat', sans-serif" },
    { name: "Source Code Pro", family: "'Source Code Pro', monospace" },
    { name: "Merriweather", family: "'Merriweather', serif" },
    { name: "Poppins", family: "'Poppins', sans-serif" },
    { name: "Nunito", family: "'Nunito', sans-serif" },
    { name: "Lobster Two", family: "'Lobster Two', serif" },
  ];

  // Constants for font weights
  static FONT_WEIGHT_NORMAL = 400;
  static FONT_WEIGHT_BOLD = 700;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM();
  }

  // --- Public Property Getters/Setters ---
  get value() {
    return this.#currentValue;
  }
  set value(newValue) {
    const strVal = String(newValue ?? "");
    // Capture the very first value assigned if not already done
    if (!this.#isInitialized && this.#initialComponentValue === "") {
      this.#initialComponentValue = strVal;
    }
    if (this.#currentValue === strVal) {
      if (!this.#isInitialized) this.#render();
      return;
    }
    this.#currentValue = strVal;
    // Reflect attribute if changed programmatically
    if (!this.#isProgrammaticChange && this.getAttribute("value") !== strVal) {
      this.#isProgrammaticChange = true;
      this.setAttribute("value", strVal);
      this.#isProgrammaticChange = false;
    }
    // Update slotted element content
    if (this.#slottedElement) {
      const prop = this.toolbar ? "innerHTML" : "textContent";
      if (this.#slottedElement[prop] !== strVal) {
        this.#slottedElement[prop] = strVal;
      }
      // Re-apply styles in case content change affected them (unlikely but safe)
      this.#applyCurrentStyles();
    }
    // Persist the new value (and current font/weight)
    this.#saveToLocalStorage();
    this.#render(); // Update placeholder visibility
    // Dispatch events only after initialization
    if (this.isConnected && this.#isInitialized) {
      this.#dispatchCharCountEvent();
    }
  }
  get placeholder() {
    return this.getAttribute("placeholder") ?? "";
  }
  set placeholder(value) {
    const strVal = String(value ?? "");
    if (strVal) this.setAttribute("placeholder", strVal);
    else this.removeAttribute("placeholder");
    if (this.#isInitialized) this.#render();
  }
  get maxLength() {
    if (this.toolbar) return null; // Maxlength ignored with toolbar
    const attr = this.getAttribute("maxlength");
    if (attr === null) return null;
    const num = parseInt(attr, 10);
    return !isNaN(num) && num >= 0 ? num : null;
  }
  set maxLength(value) {
    if (value == null) this.removeAttribute("maxlength");
    else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) this.setAttribute("maxlength", String(num));
      else this.removeAttribute("maxlength");
    }
    // Enforce max length immediately if set and no toolbar
    if (this.#isInitialized && !this.toolbar) {
      const txt = this.#slottedElement?.textContent ?? "";
      const max = this.maxLength;
      if (max !== null && txt.length > max) {
        this.value = txt.substring(0, max); // Use setter to trigger updates
      }
    }
  }
  get readOnly() {
    return this.hasAttribute("readonly");
  }
  set readOnly(value) {
    const should = Boolean(value);
    if (this.readOnly !== should) {
      this.toggleAttribute("readonly", should);
      if (this.#isInitialized) this.#updateEditableState();
    }
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    const should = Boolean(value);
    if (this.disabled !== should) {
      this.toggleAttribute("disabled", should);
      if (this.#isInitialized) this.#updateEditableState();
    }
  }
  get highlight() {
    return this.hasAttribute("highlight");
  }
  set highlight(value) {
    const should = Boolean(value);
    if (this.highlight !== should) {
      this.toggleAttribute("highlight", should);
    }
  }
  get persist() {
    return this.hasAttribute("persist");
  }
  set persist(value) {
    const should = Boolean(value);
    if (this.persist !== should) {
      this.toggleAttribute("persist", should);
      if (should && this.#isInitialized) this.#saveToLocalStorage();
      else if (!should && this.#isInitialized) this.#clearFromLocalStorage();
    }
  }
  get toolbar() {
    return this.hasAttribute("toolbar");
  }
  set toolbar(value) {
    const needs = Boolean(value);
    if (this.toolbar !== needs) {
      this.toggleAttribute("toolbar", needs);
      if (this.#isInitialized) {
        this.#updateEditableState();
        // If toolbar removed, ensure value is plain text
        if (!needs) {
          const txt = this.#slottedElement?.textContent ?? "";
          if (this.value !== txt) this.value = txt; // Use setter
        }
        this.#render();
      }
    }
  }
  get autoColor() {
    return this.hasAttribute("auto-color");
  }
  set autoColor(value) {
    const should = Boolean(value);
    if (this.autoColor !== should) {
      this.toggleAttribute("auto-color", should);
      // attributeChangedCallback handles the state update
    }
  }
  get editableElement() {
    return this.#slottedElement;
  }

  // --- Lifecycle Callbacks ---

  connectedCallback() {
    if (this.#isInitialized) return; // Prevent re-initialization

    // Defer setup until the element is potentially rendered and slotted content is available
    requestAnimationFrame(() => {
      this.#slottedElement = this.querySelector(
        ":scope > *:not(style):not(script)",
      );
      if (!this.#slottedElement) {
        console.error(
          "FrenzyEditText: No suitable editable element found in the slot.",
        );
        this.dispatchEvent(new CustomEvent("slotted-element-missing"));
        return; // Stop initialization if no element
      }

      // --- Determine Initial Value, Font, and Weight ---
      let valueSource = "slot";
      let initialValueToSet = null;
      let initialFontFamily =
        this.#slottedElement.style.fontFamily || "inherit";
      let initialFontWeightStr =
        this.#slottedElement.style.fontWeight ||
        String(FrenzyEditText.FONT_WEIGHT_NORMAL);
      let initialFontWeight = parseInt(initialFontWeightStr, 10);
      if (
        isNaN(initialFontWeight) ||
        initialFontWeight < 100 ||
        initialFontWeight > 900
      ) {
        initialFontWeight = FrenzyEditText.FONT_WEIGHT_NORMAL;
      }

      const hasToolbarAttr = this.toolbar;

      // 1. Check Persistence
      if (this.persist) {
        const key = this.#getStorageKey();
        if (key) {
          try {
            const persistedValue = localStorage.getItem(key);
            const persistedFont = localStorage.getItem(key + "-font"); // ** NEW **
            const persistedWeightStr = localStorage.getItem(key + "-weight"); // ** NEW **

            if (persistedValue !== null) {
              initialValueToSet = persistedValue;
              valueSource = "persist";
            }
            if (persistedFont !== null) {
              // Basic validation: Check if it's one of the available font families
              const isValidFont = FrenzyEditText.availableFonts.some(
                (f) => f.family === persistedFont,
              );
              if (isValidFont) {
                initialFontFamily = persistedFont;
                console.debug(
                  `FrenzyEditText (${this.id}): Loaded font family "${initialFontFamily}" from localStorage.`,
                );
              } else {
                console.warn(
                  `FrenzyEditText (${this.id}): Ignored invalid persisted font family "${persistedFont}".`,
                );
              }
            }
            if (persistedWeightStr !== null) {
              const weight = parseInt(persistedWeightStr, 10);
              if (
                !isNaN(weight) &&
                weight >= 100 &&
                weight <= 900 &&
                weight % 100 === 0
              ) {
                initialFontWeight = weight;
                console.debug(
                  `FrenzyEditText (${this.id}): Loaded font weight "${initialFontWeight}" from localStorage.`,
                );
              } else {
                console.warn(
                  `FrenzyEditText (${this.id}): Ignored invalid persisted font weight "${persistedWeightStr}".`,
                );
              }
            }
          } catch (e) {
            console.warn(
              "FrenzyEditText: Failed to read persisted state from localStorage.",
              e,
            );
          }
        } else if (!this.hasWarnedAboutMissingId) {
          console.warn("FrenzyEditText: 'persist' attribute requires an 'id'.");
          this.hasWarnedAboutMissingId = true;
        }
      }

      // 2. Check 'value' attribute if nothing persisted
      if (initialValueToSet === null && this.hasAttribute("value")) {
        initialValueToSet = this.getAttribute("value");
        valueSource = "attribute";
      }

      // 3. Fallback to slotted content if nothing else
      if (initialValueToSet === null) {
        initialValueToSet = hasToolbarAttr
          ? (this.#slottedElement.innerHTML?.trim() ?? "")
          : (this.#slottedElement.textContent?.trim() ?? "");
        valueSource = "slot";
      }

      // Store the determined initial value for reset purposes
      this.#initialComponentValue = initialValueToSet ?? "";

      // Set the current font state based on loaded/default values
      this.#currentFontFamily = initialFontFamily;
      this.#currentFontWeight = initialFontWeight;

      // --- Apply Initial State ---
      // Set the content using the determined initial value
      const contentProp = hasToolbarAttr ? "innerHTML" : "textContent";
      if (this.#slottedElement[contentProp] !== this.#initialComponentValue) {
        this.#slottedElement[contentProp] = this.#initialComponentValue;
      }

      // Set the component's value property (triggers setter logic including saveToLocalStorage if persist is on)
      // Prevent attribute reflection if the initial value came from the attribute itself
      this.#isProgrammaticChange = valueSource === "attribute";
      this.value = this.#initialComponentValue;
      this.#isProgrammaticChange = false;

      // --- Setup ---
      this.#populateFontSelector(); // Populate dropdown
      this.#fontSelectElement.value = this.#currentFontFamily; // ** NEW ** Set dropdown to loaded/current font
      this.#updateFontWeightSliderValue(); // ** NEW ** Set slider to loaded/current weight
      this.#attachEventListeners();
      this.#updateEditableState(); // Sets initial attributes, applies styles (including loaded font/weight)
      this.#observeHostMutations();
      this.#render(); // Initial placeholder check

      this.#isInitialized = true;
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Initialized. Value source: ${valueSource}. Font: ${
          this.#currentFontFamily
        }, Weight: ${this.#currentFontWeight}`,
      );
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    clearTimeout(this.#toolbarFocusTimeout);
    clearTimeout(this.#updateToolbarStateTimeout);
    this.#requestedFontFamilies.clear();
    console.debug(`FrenzyEditText (${this.id || "no-id"}): Disconnected.`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;

    console.debug(
      `FrenzyEditText (${
        this.id || "no-id"
      }): Attribute changed: ${name} from "${oldValue}" to "${newValue}"`,
    );

    switch (name) {
      case "value":
        // Only update if the change didn't come from the component's setter
        if (!this.#isProgrammaticChange) {
          this.value = newValue ?? ""; // Use setter
        }
        break;
      case "readonly":
      case "disabled":
      case "toolbar":
      case "auto-color":
        this.#updateEditableState();
        break;
      case "highlight":
        // No setter needed, just toggle internal state if required by CSS
        // this.highlight = this.hasAttribute("highlight");
        break;
      case "tabindex":
        this.#updateEditableState(); // Re-apply tabindex logic
        break;
      case "placeholder":
        this.placeholder = newValue; // Use setter
        break;
      case "maxlength":
        this.maxLength = newValue; // Use setter
        break;
      case "persist":
        // Use setter to handle logic
        this.persist = this.hasAttribute("persist");
        break;
      case "id":
        // If ID changes and persist was on with the old ID, save current state with new ID
        if (this.persist && oldValue !== null) {
          console.debug(
            `FrenzyEditText (${
              newValue || "no-id"
            }): ID changed, re-saving persisted state.`,
          );
          // Clear old keys if possible (though old ID might be lost)
          const oldKey = this.#getStorageKey(oldValue);
          if (oldKey) {
            try {
              localStorage.removeItem(oldKey);
              localStorage.removeItem(oldKey + "-font");
              localStorage.removeItem(oldKey + "-weight");
            } catch (e) {
              /* ignore */
            }
          }
          this.#saveToLocalStorage(); // Save with new ID
        }
        break;
    }
  }

  // --- Private Helper Methods ---

  #getStorageKey(idOverride = null) {
    const id = idOverride ?? this.id;
    return id ? `fz-edit-text-persist-v2-${id}` : null; // Changed version prefix
  }

  #saveToLocalStorage() {
    if (!this.#isInitialized || !this.persist) return;
    const key = this.#getStorageKey();
    if (key) {
      try {
        localStorage.setItem(key, this.#currentValue);
        // ** NEW: Save font family and weight **
        localStorage.setItem(key + "-font", this.#currentFontFamily);
        localStorage.setItem(key + "-weight", String(this.#currentFontWeight));
        // console.debug(`FrenzyEditText (${this.id}): Saved state to localStorage. Font: ${this.#currentFontFamily}, Weight: ${this.#currentFontWeight}`);
      } catch (e) {
        console.warn(
          `FrenzyEditText (${this.id}): Failed to save state to localStorage.`,
          e,
        );
      }
    } else if (!this.hasWarnedAboutMissingId) {
      console.warn(
        "FrenzyEditText: 'persist' attribute requires an 'id' to save state.",
      );
      this.hasWarnedAboutMissingId = true; // Warn only once per instance
    }
  }

  #clearFromLocalStorage() {
    if (!this.#isInitialized) return; // Don't clear if not initialized
    const key = this.#getStorageKey();
    if (key) {
      try {
        console.debug(
          `FrenzyEditText (${this.id}): Clearing persisted data for key:`,
          key,
        );
        localStorage.removeItem(key);
        // ** NEW: Clear font family and weight **
        localStorage.removeItem(key + "-font");
        localStorage.removeItem(key + "-weight");
      } catch (e) {
        console.warn(
          `FrenzyEditText (${this.id}): Failed to clear state from localStorage.`,
          e,
        );
      }
    }
  }

  #rgbToHex(rgb) {
    if (!rgb || typeof rgb !== "string") return "#000000";

    // If it's already hex (3 or 6 digits)
    if (rgb.startsWith("#")) {
      if (rgb.length === 4) {
        // Expand shorthand hex (#RGB to #RRGGBB)
        return `#${rgb[1]}${rgb[1]}${rgb[2]}${rgb[2]}${rgb[3]}${rgb[3]}`;
      }
      return rgb.toLowerCase(); // Return as is (lowercase preferred)
    }

    // Try parsing rgb(a) format
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return "#000000"; // Default if parsing fails

    const r = parseInt(result[0], 10);
    const g = parseInt(result[1], 10);
    const b = parseInt(result[2], 10);

    // Clamp values and convert to hex
    const toHex = (c) => {
      const clamped = Math.max(0, Math.min(255, c)); // Ensure value is 0-255
      const hex = clamped.toString(16);
      return hex.length === 1 ? "0" + hex : hex; // Pad with zero if needed
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  #setupShadowDOM() {
    // Unchanged from previous version - styles remain the same
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        /* Base styles */
        :host {
          display: inline-block;
          vertical-align: baseline;
          position: relative;
          border-radius: 1px;
          outline: none;
          line-height: inherit;
          cursor: text;
          padding: 1px 2px;
          box-shadow: inset 0 -1px 0 transparent;
          transition:
            background-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
          --editable-hover-border-color: #ccc;
          --editable-focus-border-color: #4dabf7;
          --editable-hover-background-color: rgba(240, 249, 255, 0.6);
          --editable-focus-background-color: rgba(231, 245, 255, 0.8);
          --editable-highlight-color: rgba(255, 255, 0, 0.2);
          --editable-disabled-opacity: 0.6;
          --editable-toolbar-background: #f8f9fa;
          --editable-toolbar-border: #dee2e6;
          --editable-toolbar-button-hover-background: #e9ecef;
          --editable-toolbar-button-active-background: #d0ebff; /* Light blue for active */
          --editable-toolbar-color-input-border: #ced4da;
          --editable-toolbar-select-border: #ced4da;
          --editable-toolbar-select-background: #fff;
          --editable-toolbar-slider-thumb-background: #4dabf7;
          --editable-toolbar-slider-track-background: #dee2e6;
        }
        :host([highlight]) {
          background-color: var(--editable-highlight-color);
          box-shadow: inset 0 -1px 0 transparent;
        }
        :host(:not([disabled]):not([readonly]):hover) {
          box-shadow: inset 0 -1px 0 var(--editable-hover-border-color);
          background-color: var(--editable-hover-background-color);
        }
        /* Use :focus-within for better focus indication including toolbar */
        :host(:not([disabled]):not([readonly]):focus-within) {
          box-shadow:
            inset 0 -1.5px 0 var(--editable-focus-border-color),
            0 0 0 2px rgba(77, 171, 247, 0.2);
          background-color: var(--editable-focus-background-color);
        }
        :host([readonly]) {
          cursor: default;
          background-color: transparent !important;
          box-shadow: inset 0 -1px 0 transparent !important;
          user-select: text;
        }
        :host([disabled]) {
          opacity: var(--editable-disabled-opacity);
          cursor: not-allowed;
          user-select: none;
          background-color: transparent !important;
          box-shadow: inset 0 -1px 0 transparent !important;
        }

        /* Toolbar styles */
        #toolbar {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background-color: var(--editable-toolbar-background);
          border: 1px solid var(--editable-toolbar-border);
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          padding: 3px 5px;
          display: none; /* Hidden by default */
          white-space: nowrap;
          user-select: none;
        }
        #toolbar.visible {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          flex-wrap: wrap;
          min-width: max-content;
        }
        #toolbar button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font: inherit;
          font-weight: bold;
          background: none;
          border: none;
          padding: 4px 6px;
          cursor: pointer;
          border-radius: 3px;
          line-height: 1;
          transition: background-color 0.15s ease-in-out;
          min-width: 28px;
          min-height: 24px;
          text-align: center;
          color: inherit;
        }
        #toolbar button:hover:not(:disabled) {
          background-color: var(--editable-toolbar-button-hover-background);
        }
        #toolbar button[data-active="true"]:not(:disabled) {
          background-color: var(--editable-toolbar-button-active-background);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        #toolbar button[data-command="italic"] {
          font-style: italic;
          font-weight: normal;
        }
        #toolbar button svg {
          width: 1em;
          height: 1em;
          vertical-align: middle; /* Align icon */
        }
        #toolbar input[type="color"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 22px;
          height: 22px;
          padding: 0;
          border: 1px solid var(--editable-toolbar-color-input-border);
          border-radius: 3px;
          background-color: transparent;
          cursor: pointer;
          vertical-align: middle;
        }
        #toolbar input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        #toolbar input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 2px;
        }
        #toolbar input[type="color"]::-moz-color-swatch {
          border: none;
          border-radius: 2px;
        }
        #toolbar input[type="color"]:hover:not(:disabled) {
          border-color: var(--editable-focus-border-color);
        }
        :host([auto-color]) #color-input {
          display: none;
        } /* Hide color input if auto-color */

        /* Font Selector Styles */
        #font-select {
          font-size: 0.85em;
          padding: 3px 5px;
          border: 1px solid var(--editable-toolbar-select-border, #ced4da);
          border-radius: 3px;
          background-color: var(--editable-toolbar-select-background, #fff);
          cursor: pointer;
          margin-left: 2px;
          height: 24px;
          vertical-align: middle;
          line-height: 1;
          max-width: 110px;
        }
        #font-select:hover:not(:disabled) {
          border-color: var(--editable-focus-border-color);
        }
        #font-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #eee;
        }

        /* Font Weight Slider Styles */
        .font-weight-control {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          vertical-align: middle;
          margin-left: 4px;
        }
        #font-weight-slider {
          width: 80px;
          height: 10px;
          cursor: pointer;
          appearance: none;
          background: var(--editable-toolbar-slider-track-background, #dee2e6);
          border-radius: 5px;
          outline: none;
          transition: opacity 0.2s;
          vertical-align: middle;
        }
        #font-weight-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: var(--editable-toolbar-slider-thumb-background, #4dabf7);
          border-radius: 50%;
          cursor: pointer;
        }
        #font-weight-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--editable-toolbar-slider-thumb-background, #4dabf7);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        #font-weight-value {
          font-size: 0.8em;
          min-width: 25px;
          text-align: right;
          color: #555;
        }
        #font-weight-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        #font-weight-slider:disabled::-webkit-slider-thumb {
          background: #bbb;
        }
        #font-weight-slider:disabled::-moz-range-thumb {
          background: #bbb;
        }

        /* Slotted element styles */
        ::slotted(*) {
          /* Critical: Ensure slotted element behaves correctly */
          outline: none;
          line-height: inherit; /* Inherit line height from host */
          min-height: 1em; /* Ensure it has some height */
          padding: 0 !important; /* Override user padding */
          border: none !important; /* Override user border */
          margin: 0 !important; /* Override user margin */
          display: inline; /* Default display, can be overridden by user CSS on element */
          /* Allow user styles for font, color etc. to pass through */
          font: inherit;
          color: inherit;
          background-color: transparent; /* Ensure no background interferes */
          caret-color: currentcolor; /* Make caret visible */
        }
        /* Host padding provides the visual space */
        :host {
          padding: 1px 2px;
        }

        /* Placeholder styling via attribute (requires global CSS) */
        /* Example global CSS is in the JSDoc header */
      </style>
      <div id="toolbar" part="toolbar">
        <button
          type="button"
          id="bold-button"
          data-command="bold"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          id="italic-button"
          data-command="italic"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <input
          type="color"
          id="color-input"
          data-command="foreColor"
          title="Text Color"
          value="#000000"
        />
        <select id="font-select" title="Font Family"></select>
        <div class="font-weight-control">
          <input
            type="range"
            id="font-weight-slider"
            min="100"
            max="900"
            step="100"
            title="Font Weight"
          />
          <span id="font-weight-value">400</span>
        </div>
        <button
          type="button"
          id="reset-button"
          title="Reset Formatting and Content"
        >
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      <slot></slot>
    `;
    // Get references to shadow DOM elements
    this.#toolbarElement = this.shadowRoot.getElementById("toolbar");
    this.#colorInputElement = this.shadowRoot.getElementById("color-input");
    this.#fontSelectElement = this.shadowRoot.getElementById("font-select");
    this.#fontWeightSliderElement =
      this.shadowRoot.getElementById("font-weight-slider");
    this.#fontWeightValueElement =
      this.shadowRoot.getElementById("font-weight-value");
    this.#resetButtonElement = this.shadowRoot.getElementById("reset-button");
    this.#boldButtonElement = this.shadowRoot.getElementById("bold-button");
    this.#italicButtonElement = this.shadowRoot.getElementById("italic-button");
  }

  #populateFontSelector() {
    if (!this.#fontSelectElement) return;
    this.#fontSelectElement.innerHTML = ""; // Clear existing options
    FrenzyEditText.availableFonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.family; // Use CSS family string as value
      option.textContent = font.name; // User-friendly name
      // Apply the font to the option itself for preview (optional)
      // option.style.fontFamily = font.family;
      this.#fontSelectElement.appendChild(option);
    });
    // Initial value is set during connectedCallback after loading persisted state
  }

  #updateFontWeightSliderValue() {
    // Update both the slider position and the text display
    if (this.#fontWeightSliderElement) {
      this.#fontWeightSliderElement.value = this.#currentFontWeight;
    }
    if (this.#fontWeightValueElement) {
      this.#fontWeightValueElement.textContent = this.#currentFontWeight;
    }
  }

  #attachEventListeners() {
    // Ensure listeners aren't attached multiple times
    if (!this.#slottedElement || this._boundHandleFocusIn) return;

    // Create bound versions of handlers
    this._boundHandleFocusIn = this.#handleFocusIn.bind(this);
    this._boundHandleFocusOut = this.#handleFocusOut.bind(this);
    this._boundHandleSlottedInput = this.#handleSlottedInput.bind(this);
    this._boundHandleSlottedKeydown = this.#handleSlottedKeydown.bind(this);
    this._boundHandleSlottedMouseUp = this.#handleSlottedMouseUp.bind(this);
    this._boundHandleToolbarMouseDown = this.#handleToolbarMouseDown.bind(this);
    this._boundHandleToolbarColorInput =
      this.#handleToolbarColorInput.bind(this);
    this._boundHandleFontChange = this.#handleFontChange.bind(this);
    this._boundHandleFontWeightChange = this.#handleFontWeightChange.bind(this);
    this._boundHandleReset = this.#handleReset.bind(this);
    this._boundHandleSelectionChange = this.#handleSelectionChange.bind(this);

    // Listen on the host element for focus events bubbling up
    // This allows capturing focus even if it lands on the host itself
    this.addEventListener("focusin", this._boundHandleFocusIn);
    this.addEventListener("focusout", this._boundHandleFocusOut);

    // Listeners directly on the slotted element for content changes/interactions
    this.#slottedElement.addEventListener(
      "input",
      this._boundHandleSlottedInput,
    );
    this.#slottedElement.addEventListener(
      "keydown",
      this._boundHandleSlottedKeydown,
    );
    this.#slottedElement.addEventListener(
      "mouseup",
      this._boundHandleSlottedMouseUp,
    ); // For selection updates

    // Listeners within the shadow DOM for toolbar interactions
    this.#toolbarElement?.addEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown,
    ); // Use mousedown to prevent blur
    this.#colorInputElement?.addEventListener(
      "input",
      this._boundHandleToolbarColorInput,
    );
    this.#fontSelectElement?.addEventListener(
      "change",
      this._boundHandleFontChange,
    );
    this.#fontWeightSliderElement?.addEventListener(
      "input",
      this._boundHandleFontWeightChange,
    ); // 'input' for live updates
    this.#resetButtonElement?.addEventListener("click", this._boundHandleReset); // 'click' is fine for reset

    // Listener on the document for selection changes (needed for toolbar state)
    document.addEventListener(
      "selectionchange",
      this._boundHandleSelectionChange,
    );
  }

  #removeEventListeners() {
    this.removeEventListener("focusin", this._boundHandleFocusIn);
    this.removeEventListener("focusout", this._boundHandleFocusOut);
    this.#slottedElement?.removeEventListener(
      "input",
      this._boundHandleSlottedInput,
    );
    this.#slottedElement?.removeEventListener(
      "keydown",
      this._boundHandleSlottedKeydown,
    );
    this.#slottedElement?.removeEventListener(
      "mouseup",
      this._boundHandleSlottedMouseUp,
    );
    this.#toolbarElement?.removeEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown,
    );
    this.#colorInputElement?.removeEventListener(
      "input",
      this._boundHandleToolbarColorInput,
    );
    this.#fontSelectElement?.removeEventListener(
      "change",
      this._boundHandleFontChange,
    );
    this.#fontWeightSliderElement?.removeEventListener(
      "input",
      this._boundHandleFontWeightChange,
    );
    this.#resetButtonElement?.removeEventListener(
      "click",
      this._boundHandleReset,
    );
    document.removeEventListener(
      "selectionchange",
      this._boundHandleSelectionChange,
    );

    // Clear bound function references
    this._boundHandleFocusIn = null;
    this._boundHandleFocusOut = null;
    this._boundHandleSlottedInput = null;
    this._boundHandleSlottedKeydown = null;
    this._boundHandleSlottedMouseUp = null;
    this._boundHandleToolbarMouseDown = null;
    this._boundHandleToolbarColorInput = null;
    this._boundHandleFontChange = null;
    this._boundHandleFontWeightChange = null;
    this._boundHandleReset = null;
    this._boundHandleSelectionChange = null;
  }

  #observeHostMutations() {
    // Observe the host element for removal of the slotted child
    if (!this.#slottedElement || this.#mutationObserver) return;
    this._boundHandleMutation = this.#handleMutation.bind(this);
    this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
    // Observe direct children list changes on the host (light-DOM)
    this.#mutationObserver.observe(this, { childList: true });
  }

  #handleMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
        let elementRemoved = false;
        mutation.removedNodes.forEach((node) => {
          if (node === this.#slottedElement) elementRemoved = true;
        });
        if (elementRemoved) {
          console.warn(
            `FrenzyEditText (${this.id || "no-id"}): Slotted element removed.`,
          );
          this.#removeEventListeners(); // Clean up listeners
          this.#mutationObserver?.disconnect(); // Stop observing
          this.#mutationObserver = null;
          this.#slottedElement = null; // Clear reference
          this.#hideToolbar(); // Ensure toolbar is hidden
          // Optionally, dispatch an event or set an error state
          break; // No need to check other mutations
        }
      }
    }
  }

  #render() {
    // Update placeholder visibility based on content
    if (!this.#slottedElement) return;
    const placeholderText = this.placeholder;
    // Check content based on whether toolbar is active (HTML vs text)
    const contentToCheck = this.toolbar
      ? this.#slottedElement.innerHTML
      : this.#slottedElement.textContent;
    // Consider empty or just whitespace as empty
    const isEmpty = (contentToCheck ?? "").trim() === "";

    if (placeholderText && isEmpty) {
      // Add attribute for global CSS rule to show placeholder
      this.#slottedElement.setAttribute(
        "data-editable-placeholder",
        placeholderText,
      );
    } else {
      // Remove attribute if content exists or no placeholder defined
      this.#slottedElement.removeAttribute("data-editable-placeholder");
    }
  }

  #updateEditableState() {
    const isDisabled = this.disabled;
    const isReadOnly = this.readOnly;
    const hasToolbar = this.toolbar;
    const useAutoColor = this.autoColor;
    const explicitTabIndex = this.getAttribute("tabindex");

    // --- Host Element State ---
    // Set tabindex for focusability: disabled=-1, otherwise use explicit or default 0
    let targetTabIndex = isDisabled ? "-1" : (explicitTabIndex ?? "0");
    if (this.getAttribute("tabindex") !== targetTabIndex) {
      this.setAttribute("tabindex", targetTabIndex);
    }
    // Set ARIA states for accessibility
    this.toggleAttribute("aria-disabled", isDisabled);
    // aria-readonly should only be true if it's readonly BUT NOT disabled
    this.toggleAttribute("aria-readonly", isReadOnly && !isDisabled);

    // --- Slotted Element State ---
    if (this.#slottedElement) {
      const canEdit = !isDisabled && !isReadOnly;
      // Set contenteditable mode: 'true' for rich text, 'plaintext-only' for plain, 'false' if not editable
      const editableMode = canEdit
        ? hasToolbar
          ? "true"
          : "plaintext-only"
        : "false";
      this.#slottedElement.setAttribute("contenteditable", editableMode);
      // Make slotted element non-focusable itself; focus managed by host
      this.#slottedElement.setAttribute("tabindex", "-1");

      // Apply auto-color if enabled, otherwise ensure no inline color is forced by this logic
      if (useAutoColor) {
        this.#applyAutoColor();
      } else {
        // If auto-color was just turned off, we might need to remove the color it set.
        // However, we don't want to remove user-set colors.
        // This is tricky. Let's assume #applyCurrentStyles handles the correct color.
      }

      // Apply the current font family and weight (handles loading)
      this.#applyCurrentStyles();
    }

    // --- Toolbar State ---
    // Enable/disable toolbar items based on component state
    if (this.#toolbarElement) {
      const enableToolbarItems = hasToolbar && !isDisabled && !isReadOnly;
      const items = this.#toolbarElement.querySelectorAll(
        'button, input, select, input[type="range"]',
      );
      items.forEach((item) => {
        const isColorInput = item === this.#colorInputElement;
        // Disable item if toolbar shouldn't be active, OR if it's the color input and autoColor is on
        item.disabled = !enableToolbarItems || (isColorInput && useAutoColor);
        // Visual indication of disabled state
        item.style.opacity = item.disabled ? "0.5" : "1";
        item.style.cursor = item.disabled ? "not-allowed" : "pointer";
      });

      // If toolbar is enabled and component has focus, update button states
      if (enableToolbarItems && this.#hasFocusWithin) {
        this.#requestToolbarStateUpdate();
      } else if (!enableToolbarItems) {
        this.#hideToolbar(); // Ensure toolbar is hidden if component becomes non-editable
      }
    }
  }

  #applyAutoColor() {
    if (!this.autoColor || !this.#slottedElement) return;
    try {
      // Get the computed style of the HOST element to read the CSS variable
      const hostStyle = window.getComputedStyle(this);
      const targetColor =
        hostStyle.getPropertyValue("--color-changer-icon-color").trim() ||
        "inherit";

      // Apply the color directly to the slotted element's style
      if (this.#slottedElement.style.color !== targetColor) {
        this.#slottedElement.style.color = targetColor;
        console.debug(
          `FrenzyEditText (${
            this.id || "no-id"
          }): Applied auto-color: ${targetColor}`,
        );
      }
    } catch (e) {
      console.error(
        `FrenzyEditText (${this.id || "no-id"}): Error applying auto color.`,
        e,
      );
      // Fallback to inherit if reading variable fails
      if (this.#slottedElement.style.color !== "inherit") {
        this.#slottedElement.style.color = "inherit";
      }
    }
  }

  #showToolbar() {
    // Only show if toolbar enabled and component is interactive
    if (!this.toolbar || this.readOnly || this.disabled) return;
    this.#toolbarElement?.classList.add("visible");
  }

  #hideToolbar() {
    this.#toolbarElement?.classList.remove("visible");
    // Reset active states on buttons when hiding
    this.#boldButtonElement?.removeAttribute("data-active");
    this.#italicButtonElement?.removeAttribute("data-active");
  }

  // --- Event Handlers ---

  #handleFocusIn(event) {
    this.#hasFocusWithin = true;
    // Show toolbar only if focus lands *directly* on the editable element
    if (event.target === this.#slottedElement) {
      clearTimeout(this.#toolbarFocusTimeout); // Cancel any pending hide
      if (this.#initialValueOnFocus === null) {
        // Store the value when focus is first gained
        this.#initialValueOnFocus = this.#currentValue;
      }
      this.#showToolbar();
      this.#requestToolbarStateUpdate(); // Update button states based on selection/cursor
    }
    // If focus lands elsewhere within the component (e.g., toolbar button),
    // #hasFocusWithin is true, but we don't necessarily show the toolbar here.
    // The toolbar remains visible due to the focusout timeout logic.
  }

  #handleFocusOut(event) {
    this.#hasFocusWithin = false;
    // Use a timeout to delay hiding the toolbar. This allows focus to move
    // *within* the component (e.g., from text to a toolbar button) without
    // the toolbar flickering off and on.
    clearTimeout(this.#toolbarFocusTimeout);
    this.#toolbarFocusTimeout = setTimeout(() => {
      // After the delay, check if focus is *still* outside the entire component
      const isFocusOutside =
        !this.shadowRoot.activeElement && // Focus not in shadow DOM
        document.activeElement !== this && // Focus not on host
        !this.contains(document.activeElement); // Focus not on any light DOM child (unlikely but safe)

      if (isFocusOutside) {
        this.#hideToolbar();
        // If the value changed since focus was gained, dispatch 'change' event
        if (
          this.#initialValueOnFocus !== null &&
          this.#initialValueOnFocus !== this.#currentValue
        ) {
          this.#dispatchChangeEvent();
        }
        this.#initialValueOnFocus = null; // Reset for next focus
      }
    }, 150); // 150ms delay seems reasonable
  }

  #handleSlottedInput(event) {
    // Ignore input events triggered programmatically or not on the target element
    if (
      this.#isProgrammaticChange ||
      !this.#slottedElement ||
      event.target !== this.#slottedElement
    )
      return;

    // If readonly or disabled, revert the change immediately
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      const prop = this.toolbar ? "innerHTML" : "textContent";
      // Restore the previous value
      this.#slottedElement[prop] = this.#currentValue;
      return;
    }

    // Get the new value based on toolbar mode
    const newValue = this.toolbar
      ? this.#slottedElement.innerHTML
      : (this.#slottedElement.textContent ?? "");

    // --- Max Length Check (Only for Plain Text Mode) ---
    const max = this.maxLength; // Getter handles toolbar check
    if (max !== null) {
      const textContentLength = this.#slottedElement.textContent?.length ?? 0;
      if (textContentLength > max) {
        console.warn(
          `FrenzyEditText (${
            this.id || "no-id"
          }): Exceeded max length (${max}) on input.`,
        );
        // Trim the text content
        const originalText = this.#slottedElement.textContent;
        this.#slottedElement.textContent = originalText.substring(0, max);
        // Get the corrected value (might still be HTML if toolbar was briefly on)
        const correctedValue = this.toolbar
          ? this.#slottedElement.innerHTML
          : this.#slottedElement.textContent;

        // Update the component's value using the setter
        this.#isProgrammaticChange = true;
        this.value = correctedValue;
        this.#isProgrammaticChange = false;

        // Dispatch events for the *corrected* state
        this.#dispatchInputEvent(); // Input event reflects the corrected value
        this.#dispatchMaxLengthEvent(correctedValue, max);
        this.#render(); // Update placeholder if needed

        // Try to move cursor to the end after correction
        try {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(this.#slottedElement);
          range.collapse(false); // Collapse to the end
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          /* ignore potential selection errors */
        }

        return; // Stop further processing for this input event
      }
    }

    // --- Update Component State ---
    // Use the setter to update the internal value and trigger side effects (persist, events)
    this.#isProgrammaticChange = true; // Prevent attribute reflection loop
    this.value = newValue;
    this.#isProgrammaticChange = false;

    // Dispatch input event
    this.#dispatchInputEvent();
    this.#render(); // Update placeholder if needed

    // Update toolbar state based on potential cursor position change
    this.#requestToolbarStateUpdate();
  }

  #handleSlottedKeydown(event) {
    if (!this.#slottedElement) return;

    const isReadOnlyOrDisabled = this.readOnly || this.disabled;
    const isMeta = event.ctrlKey || event.metaKey; // Ctrl or Cmd

    // --- ReadOnly/Disabled Handling ---
    // Define keys that are generally allowed even when readonly (navigation, selection, copy)
    const isNavigation = [
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(event.key);
    const isModifier = ["Shift", "Control", "Alt", "Meta"].includes(event.key);
    const isFunctionKey = event.key.startsWith("F"); // F1, F2, etc.
    const isAllowedReadOnlyAction =
      isNavigation ||
      isModifier ||
      isFunctionKey ||
      event.key === "Escape" ||
      (isMeta && ["a", "c"].includes(event.key.toLowerCase())); // Select All (a), Copy (c)

    // Define write actions (cut, paste) - allowed only if Meta key is pressed AND not readonly/disabled
    const isAllowedWriteAction =
      !isReadOnlyOrDisabled &&
      isMeta &&
      ["x", "v"].includes(event.key.toLowerCase()); // Cut (x), Paste (v)

    // If readonly/disabled, prevent default for any keydown that isn't explicitly allowed
    if (
      isReadOnlyOrDisabled &&
      !isAllowedReadOnlyAction &&
      !isAllowedWriteAction
    ) {
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Keydown blocked (readonly/disabled): ${event.key}`,
      );
      event.preventDefault();
      return;
    }

    // --- Editable State Handling ---
    if (!isReadOnlyOrDisabled) {
      // --- Keyboard Shortcuts & Special Keys ---
      switch (event.key) {
        case "Enter":
          // Prevent new line in plain text mode, commit change by blurring
          if (!event.shiftKey && !this.toolbar) {
            event.preventDefault();
            this.#slottedElement.blur(); // Triggers focusout -> change event
          }
          // In toolbar mode, Enter usually creates a new paragraph/line break (default behavior)
          break;

        case "Escape":
          // Revert to value on focus and blur
          event.preventDefault();
          if (
            this.#initialValueOnFocus !== null &&
            this.#currentValue !== this.#initialValueOnFocus
          ) {
            console.debug(
              `FrenzyEditText (${this.id || "no-id"}): Reverting value on Escape.`,
            );
            this.value = this.#initialValueOnFocus; // Use setter to update
          }
          this.#slottedElement.blur(); // Triggers focusout
          break;
      }

      // --- Formatting Shortcuts (Toolbar Mode Only) ---
      if (this.toolbar && isMeta) {
        switch (event.key.toLowerCase()) {
          case "b": // Bold
            event.preventDefault();
            this.#toggleBoldState();
            break;
          case "i": // Italic
            event.preventDefault();
            this.#executeFormatCommand("italic"); // Still uses execCommand
            break;
          // Add other shortcuts (e.g., 'u' for underline) if needed
        }
      }

      // --- Max Length Check (Plain Text Mode - Before Character is Inserted) ---
      const max = this.maxLength; // Getter handles toolbar check
      // Check if the key is likely to add a character (simplistic check)
      const isPotentiallyLengthChanging =
        event.key.length === 1 && !isMeta && !event.altKey; // Exclude control keys, Alt+Key

      if (max !== null && isPotentiallyLengthChanging) {
        const currentLength = this.#slottedElement.textContent?.length ?? 0;
        const selection = window.getSelection();
        // Check if the key press will replace a selection within the element
        const isReplacingSelection =
          selection &&
          !selection.isCollapsed &&
          this.#slottedElement.contains(selection.anchorNode);

        // Prevent insertion if length is already at max AND not replacing selected text
        if (currentLength >= max && !isReplacingSelection) {
          console.warn(
            `FrenzyEditText (${
              this.id || "no-id"
            }): Max length (${max}) reached, blocking key: ${event.key}`,
          );
          event.preventDefault();
          this.#dispatchMaxLengthEvent(this.#currentValue, max);
          return; // Stop processing this keydown
        }
      }
    } // End if (!isReadOnlyOrDisabled)

    // --- Update Toolbar State ---
    // Request toolbar update after keys that might change selection or formatting state
    if (
      isNavigation ||
      ["Backspace", "Delete"].includes(event.key) ||
      (isMeta && ["b", "i"].includes(event.key.toLowerCase()))
    ) {
      this.#requestToolbarStateUpdate();
    }
  }

  #handleSlottedMouseUp(event) {
    // Update toolbar state after mouse up, as selection might have changed
    this.#requestToolbarStateUpdate();
  }

  #handleToolbarMouseDown(event) {
    // Find the button that was clicked, if any
    const button = event.target.closest(
      "button[data-command], button#reset-button",
    );

    // Only act if a button was clicked and it's not disabled
    if (button && !button.disabled) {
      // CRITICAL: Prevent the mousedown event from causing the slotted element
      // to lose focus. This keeps the selection active for formatting commands.
      event.preventDefault();

      const command = button.dataset.command;

      if (command === "bold") {
        this.#toggleBoldState(); // Use the dedicated method for bold
      } else if (command && command !== "foreColor") {
        // Handle other commands that still use execCommand (e.g., italic)
        this.#executeFormatCommand(command);
      }
      // Note:
      // - 'foreColor' is handled by the color input's 'input' event.
      // - 'reset' is handled by the reset button's 'click' event.
    }
    // If click is not on a button (e.g., on toolbar background), do nothing, allow focus to shift naturally.
  }

  #toggleBoldState() {
    if (!this.#slottedElement || this.readOnly || this.disabled) return;

    const isCurrentlyBold =
      this.#currentFontWeight >= FrenzyEditText.FONT_WEIGHT_BOLD;

    // Toggle the internal weight state
    this.#currentFontWeight = isCurrentlyBold
      ? FrenzyEditText.FONT_WEIGHT_NORMAL
      : FrenzyEditText.FONT_WEIGHT_BOLD;

    console.debug(
      `FrenzyEditText (${this.id || "no-id"}): Toggling bold. New weight: ${
        this.#currentFontWeight
      }`,
    );

    // Apply the new weight style to the element
    this.#applyCurrentStyles(); // This updates the slotted element's style

    // Update the slider UI to match
    this.#updateFontWeightSliderValue();

    // Update the toolbar button's active state
    this.#requestToolbarStateUpdate();

    // Persist the change immediately
    this.#saveToLocalStorage();

    // Try to restore focus to the editor to keep context
    this.#slottedElement?.focus({ preventScroll: true });
  }

  #handleToolbarColorInput(event) {
    // Ensure the event is from the correct input and the component is editable
    if (
      !this.#colorInputElement ||
      event.target !== this.#colorInputElement ||
      !this.#slottedElement ||
      this.autoColor ||
      this.readOnly ||
      this.disabled
    ) {
      return;
    }

    const command = this.#colorInputElement.dataset.command; // Should be 'foreColor'
    const value = this.#colorInputElement.value; // The selected hex color

    if (command && value) {
      this.#executeFormatCommand(command, value);
    }
  }

  #handleFontChange(event) {
    // Ensure the event is from the correct select and the component is editable
    if (
      !this.#fontSelectElement ||
      event.target !== this.#fontSelectElement ||
      !this.#slottedElement ||
      this.readOnly ||
      this.disabled
    ) {
      return;
    }

    const selectedFontFamily = this.#fontSelectElement.value;
    this.#currentFontFamily = selectedFontFamily;

    console.debug(
      `FrenzyEditText (${this.id || "no-id"}): Font family changed to: ${
        this.#currentFontFamily
      }`,
    );

    // Optionally reset weight when changing font (or keep current? TBD)
    // Let's keep the current weight for now, unless changing to 'inherit'
    // if (selectedFontFamily === 'inherit') {
    //     this.#currentFontWeight = FrenzyEditText.FONT_WEIGHT_NORMAL;
    // }
    // No, let's just apply the font family and keep the weight.
    // The #applyCurrentStyles method will handle loading the new font if needed.

    this.#applyCurrentStyles(); // Apply the new font family

    // Persist the change immediately
    this.#saveToLocalStorage();

    // Update the slider UI (in case weight was implicitly changed, though currently it's not)
    this.#updateFontWeightSliderValue();

    // Update toolbar state (though font doesn't have an 'active' state)
    this.#requestToolbarStateUpdate();

    // Restore focus
    this.#slottedElement?.focus({ preventScroll: true });
  }

  #handleFontWeightChange(event) {
    // Ensure the event is from the correct slider and the component is editable
    if (
      !this.#fontWeightSliderElement ||
      event.target !== this.#fontWeightSliderElement ||
      !this.#slottedElement ||
      this.readOnly ||
      this.disabled
    ) {
      return;
    }
    const newWeight = parseInt(event.target.value, 10);
    if (isNaN(newWeight)) return; // Ignore if somehow not a number

    this.#currentFontWeight = newWeight;

    // console.debug(`FrenzyEditText (${this.id || "no-id"}): Font weight changed to: ${this.#currentFontWeight}`); // Can be noisy

    // Update the text display next to the slider
    this.#updateFontWeightSliderValue();

    // Apply the new font weight style
    this.#applyCurrentStyles();

    // Persist the change immediately
    this.#saveToLocalStorage();

    // Update toolbar state (specifically the bold button active state)
    this.#requestToolbarStateUpdate();

    // No need to refocus here usually, as slider interaction doesn't typically blur the editor
  }

  #handleReset(event) {
    if (!this.#slottedElement || this.disabled || this.readOnly) return;

    console.debug(
      `FrenzyEditText (${this.id || "no-id"}): Resetting component state.`,
    );

    // 1. Reset Content to initial value
    this.value = this.#initialComponentValue; // Use setter to trigger updates

    // 2. Reset Font Family and Weight to defaults
    this.#currentFontFamily = "inherit";
    this.#currentFontWeight = FrenzyEditText.FONT_WEIGHT_NORMAL;

    // 3. Update UI Elements
    this.#updateFontWeightSliderValue();
    if (this.#fontSelectElement) this.#fontSelectElement.value = "inherit";
    if (this.#colorInputElement) this.#colorInputElement.value = "#000000"; // Reset color picker

    // 4. Apply Reset Styles (including color if not auto-color)
    if (!this.autoColor && this.#slottedElement.style.color) {
      this.#slottedElement.style.color = ""; // Remove inline color style
    }
    this.#applyCurrentStyles(); // Apply default font/weight

    // 5. Clear Persisted Data (if applicable) ** MODIFIED **
    if (this.persist) {
      this.#clearFromLocalStorage(); // Clears value, font, and weight
    }

    // 6. Dispatch Reset Event
    this.dispatchEvent(
      new CustomEvent("reset", { bubbles: true, composed: true }),
    );

    // 7. Update Toolbar State and Focus
    this.#requestToolbarStateUpdate();
    this.focus(); // Focus the host element
  }

  #handleSelectionChange(event) {
    const selection = document.getSelection();

    // Only update toolbar state if:
    // 1. The component currently thinks it has focus within.
    // 2. A selection exists.
    // 3. The selection's anchor node (where selection starts) is inside our slotted element.
    if (
      this.#hasFocusWithin &&
      selection &&
      this.#slottedElement?.contains(selection.anchorNode)
    ) {
      this.#requestToolbarStateUpdate();
    }
    // If focus is lost (#hasFocusWithin is false), we don't need to react to
    // selection changes elsewhere on the page. The focusout handler manages hiding the toolbar.
  }

  #requestToolbarStateUpdate() {
    // Debounce the update function to avoid excessive calls during rapid changes
    clearTimeout(this.#updateToolbarStateTimeout);
    this.#updateToolbarStateTimeout = setTimeout(() => {
      this.#updateToolbarState();
    }, 50); // 50ms delay
  }

  #updateToolbarState() {
    // Exit if toolbar shouldn't be active or component isn't ready
    if (
      !this.#isInitialized ||
      !this.toolbar ||
      this.disabled ||
      this.readOnly ||
      !this.#slottedElement ||
      !this.#hasFocusWithin
    ) {
      return;
    }

    try {
      // --- Bold / Italic Button States ---
      // Italic: Still relies on queryCommandState as it manipulates inline styles/tags
      const isItalic = document.queryCommandState("italic");
      this.#italicButtonElement?.setAttribute("data-active", isItalic);

      // Bold: Reflects the component's overall font weight state
      const isBoldActive =
        this.#currentFontWeight >= FrenzyEditText.FONT_WEIGHT_BOLD;
      this.#boldButtonElement?.setAttribute("data-active", isBoldActive);

      // --- Get Selection/Cursor Context ---
      const selection = window.getSelection();
      let targetNodeForStyle = null; // The node whose style we'll check for color

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Get the common ancestor or start container to check styles
        targetNodeForStyle = range.commonAncestorContainer;
        // If the node is a text node, get its parent element for computed style
        if (
          targetNodeForStyle &&
          targetNodeForStyle.nodeType === Node.TEXT_NODE
        ) {
          targetNodeForStyle = targetNodeForStyle.parentElement;
        }
      }

      // Fallback to the main slotted element if no specific node found or it's outside
      if (
        !targetNodeForStyle ||
        !this.#slottedElement.contains(targetNodeForStyle)
      ) {
        targetNodeForStyle = this.#slottedElement;
      }

      // --- Update Toolbar Inputs based on Context ---
      if (targetNodeForStyle) {
        const computedStyle = window.getComputedStyle(targetNodeForStyle);

        // Color Input: Update based on computed color of the selection/cursor position
        if (this.#colorInputElement && !this.autoColor) {
          const currentColor = computedStyle.color;
          this.#colorInputElement.value = this.#rgbToHex(currentColor);
        }

        // Font Family Select: Reflect the component's overall font family state
        if (this.#fontSelectElement) {
          // Ensure dropdown matches the internal state, not computed style (which might differ)
          if (this.#fontSelectElement.value !== this.#currentFontFamily) {
            this.#fontSelectElement.value = this.#currentFontFamily;
          }
        }

        // Font Weight Slider: Reflect the component's overall font weight state
        if (this.#fontWeightSliderElement) {
          // Ensure slider matches internal state, not computed style
          this.#updateFontWeightSliderValue(); // This ensures slider and text value match #currentFontWeight
        }
      }
    } catch (e) {
      console.warn(
        `FrenzyEditText (${this.id || "no-id"}): Error updating toolbar state.`,
        e,
      );
    }
  }

  /** Applies the current font family and weight, loading font stylesheet if needed */
  #applyCurrentStyles() {
    if (!this.#slottedElement) return;

    const targetFontFamily = this.#currentFontFamily || "inherit";
    const targetFontWeight =
      this.#currentFontWeight || FrenzyEditText.FONT_WEIGHT_NORMAL;

    // --- Apply styles directly to the slotted element ---
    // This affects the *entire* content globally.
    let stylesChanged = false;
    if (this.#slottedElement.style.fontFamily !== targetFontFamily) {
      this.#slottedElement.style.fontFamily = targetFontFamily;
      stylesChanged = true;
    }
    if (this.#slottedElement.style.fontWeight !== String(targetFontWeight)) {
      this.#slottedElement.style.fontWeight = String(targetFontWeight); // Ensure it's a string
      stylesChanged = true;
    }

    if (stylesChanged) {
      // console.debug(`FrenzyEditText (${this.id || "no-id"}): Applied styles - Font: ${targetFontFamily}, Weight: ${targetFontWeight}`);
    }

    // --- Load Google Font Stylesheet (if needed) ---
    // Don't load if 'inherit' or already requested/loading
    if (targetFontFamily === "inherit") return;

    const fontDefinition = FrenzyEditText.availableFonts.find(
      (f) => f.family === targetFontFamily,
    );
    const fontName = fontDefinition?.name; // User-friendly name like "Roboto"

    if (!fontName || fontName === "Default") return; // Should not happen if value is valid

    // Check if we've already tried to load this font family (avoids redundant requests)
    if (this.#requestedFontFamilies.has(fontName)) {
      return;
    }

    try {
      // Construct the Google Fonts URL to load *all* weights (100-900)
      const encodedFontName = fontName.replace(/ /g, "+");
      const weights = "100;200;300;400;500;600;700;800;900"; // Load all standard weights
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@${weights}&display=swap`;

      // Check if this exact stylesheet URL is already added to the document head
      if (document.head.querySelector(`link[href="${fontUrl}"]`)) {
        console.debug(
          `FrenzyEditText (${
            this.id || "no-id"
          }): Font stylesheet for ${fontName} already exists.`,
        );
        this.#requestedFontFamilies.add(fontName); // Mark as requested/present
        return;
      }

      // Inject the <link> tag into the document's <head>
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Injecting stylesheet for ${fontName} (all weights): ${fontUrl}`,
      );
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      link.onload = () => {
        console.debug(
          `FrenzyEditText (${
            this.id || "no-id"
          }): Font stylesheet for ${fontName} loaded successfully.`,
        );
        // Font is ready, style is already applied
      };
      link.onerror = (err) => {
        console.error(
          `FrenzyEditText (${
            this.id || "no-id"
          }): Failed to load font stylesheet for ${fontName}. Reverting font.`,
          err,
        );
        this.dispatchEvent(
          new CustomEvent("font-load-error", {
            detail: {
              fontName: fontName,
              error: new Error("Stylesheet load failed"),
            },
            bubbles: true,
            composed: true,
          }),
        );
        // Revert font if loading failed and it was the currently selected one
        if (this.#currentFontFamily === targetFontFamily) {
          this.#currentFontFamily = "inherit";
          this.#currentFontWeight = FrenzyEditText.FONT_WEIGHT_NORMAL;
          this.#slottedElement.style.fontFamily = "inherit";
          this.#slottedElement.style.fontWeight = "normal";
          if (this.#fontSelectElement)
            this.#fontSelectElement.value = "inherit";
          this.#updateFontWeightSliderValue();
          this.#saveToLocalStorage(); // Persist the reverted state
          this.#updateToolbarState(); // Reflect reverted state in toolbar
        }
      };

      document.head.appendChild(link);
      this.#requestedFontFamilies.add(fontName); // Mark as requested (even if it fails later)
    } catch (error) {
      console.error(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Error injecting stylesheet for ${fontName}:`,
        error,
      );
      this.dispatchEvent(
        new CustomEvent("font-load-error", {
          detail: { fontName: fontName, error },
          bubbles: true,
          composed: true,
        }),
      );
      // Attempt to revert if an error occurred during link creation/append
      if (this.#currentFontFamily === targetFontFamily) {
        this.#currentFontFamily = "inherit";
        this.#currentFontWeight = FrenzyEditText.FONT_WEIGHT_NORMAL;
        if (this.#slottedElement) {
          this.#slottedElement.style.fontFamily = "inherit";
          this.#slottedElement.style.fontWeight = "normal";
        }
        if (this.#fontSelectElement) this.#fontSelectElement.value = "inherit";
        this.#updateFontWeightSliderValue();
        this.#saveToLocalStorage();
        this.#updateToolbarState();
      }
    }
  }

  #executeFormatCommand(command, value = null) {
    // This function now primarily handles 'italic' and 'foreColor' via execCommand.
    // 'bold' is handled entirely by #toggleBoldState.
    if (!this.toolbar || this.readOnly || this.disabled) return;
    if (command === "foreColor" && this.autoColor) return; // Don't apply color if autoColor is on

    // Explicitly block 'bold' command here to prevent accidental use
    if (command === "bold") {
      console.warn(
        "FrenzyEditText: 'bold' command should be handled by #toggleBoldState. Use that method instead.",
      );
      return;
    }

    const selection = window.getSelection();
    let selectionRange = null;
    let restoreCollapsedSelection = false; // Flag if we selected all programmatically

    // Ensure focus is within the editable element before executing command
    if (!this.#slottedElement?.contains(document.activeElement)) {
      this.#slottedElement?.focus({ preventScroll: true });
      // Re-get selection after focusing
      // selection = window.getSelection(); // Re-getting might not be needed immediately
    }

    // Check if selection exists *within* the element
    if (
      selection &&
      selection.rangeCount > 0 &&
      this.#slottedElement?.contains(selection.anchorNode)
    ) {
      selectionRange = selection.getRangeAt(0);
    }

    // --- Select All Logic (for formatting commands on collapsed selection) ---
    const isFormattingCommand = ["italic", "foreColor"].includes(command);
    const isSelectionCollapsed = !selectionRange || selectionRange.collapsed;

    if (isFormattingCommand && isSelectionCollapsed) {
      // If the command is for formatting (italic, color) and there's no selection,
      // apply the format to the entire content.
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Collapsed selection for '${command}', selecting all content.`,
      );
      selection?.selectAllChildren(this.#slottedElement);
      restoreCollapsedSelection = true; // Mark that we need to collapse the selection afterwards
      // Update selectionRange after selecting all
      if (selection && selection.rangeCount > 0) {
        selectionRange = selection.getRangeAt(0);
      }
    }

    // --- Execute Command ---
    try {
      // Use document.execCommand for italic and foreColor
      document.execCommand(command, false, value);
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Executed command '${command}' with value '${value}'.`,
      );
    } catch (e) {
      console.error(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Error executing command '${command}'.`,
        e,
      );
      // Attempt to restore selection even if command failed
      if (restoreCollapsedSelection && selection) {
        selection.collapseToEnd();
      }
      return; // Stop processing if command failed
    }

    // --- Post-Command Cleanup ---
    // Restore collapsed selection if we selected all programmatically
    if (restoreCollapsedSelection && selection) {
      console.debug(
        `FrenzyEditText (${
          this.id || "no-id"
        }): Restoring collapsed selection after '${command}'.`,
      );
      selection.collapseToEnd();
    }

    // --- Update State ---
    // Read the updated HTML content *after* the command execution
    const newHtml = this.#slottedElement?.innerHTML ?? "";
    // Update the component's value only if it actually changed
    if (this.#currentValue !== newHtml) {
      this.#isProgrammaticChange = true;
      this.value = newHtml; // Use setter (triggers save, events, etc.)
      this.#isProgrammaticChange = false;
      this.#dispatchInputEvent(); // Dispatch input as content changed
      this.#render(); // Update placeholder if needed
    }

    // Update the toolbar state to reflect the applied formatting
    this.#requestToolbarStateUpdate();
  }

  // --- Custom Event Dispatchers ---

  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.#currentValue },
        bubbles: true, // Allow event to bubble up
        composed: true, // Allow event to cross shadow DOM boundary
      }),
    );
  }

  #dispatchChangeEvent() {
    // Dispatched on blur if value changed since focus
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.#currentValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchCharCountEvent() {
    // Dispatched on value change (via setter)
    const len = this.#slottedElement?.textContent?.length ?? 0;
    this.dispatchEvent(
      new CustomEvent("char-count", {
        detail: {
          value: this.#currentValue, // Current value (potentially HTML)
          length: len, // Text content length
          maxLength: this.maxLength, // Max length constraint (null if toolbar)
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchMaxLengthEvent(currentValue, maxLength) {
    // Dispatched when user tries to exceed max length
    const len = this.#slottedElement?.textContent?.length ?? 0;
    this.dispatchEvent(
      new CustomEvent("max-length", {
        detail: {
          value: currentValue, // Value at the time of exceeding
          length: len, // Length at the time (should be === maxLength)
          maxLength: maxLength,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
} // End of FrenzyEditText class

// Define the custom element if it doesn't exist yet
if (!customElements.get("fz-edit-text")) {
  customElements.define("fz-edit-text", FrenzyEditText);
}

// Export the class for potential module usage
export default FrenzyEditText;
