/**
 * FrenzyColorPicker Web Component
 *
 * Allows changing the background color of the first slotted HTML element
 * via a custom icon button that triggers the native color picker.
 * The button is only visible when hovering over the component's host element,
 * the button itself is focused, or the color picker is open.
 * It hides otherwise, including when the picker is closed without selection.
 * Positioned absolutely, without affecting layout.
 * Optionally persists the selected color to localStorage.
 * The icon color automatically adjusts for contrast against the selected background,
 * updating live during color selection where supported.
 *
 * If an 'id' attribute is provided, it also sets a global CSS variable on
 * document.documentElement named '--fz-color-picker-contrast-{id}' with the
 * calculated contrast color (e.g., #000000 or #FFFFFF), allowing other
 * elements in the light DOM to use this value.
 *
 * @element fz-color-picker
 *
 * @attr {string} color - Background color value (e.g., #RRGGBB, color name). Defaults 'transparent'.
 * @attr {boolean} disabled - Disables the color picker button.
 * @attr {boolean} persist - Saves/loads color to localStorage based on host 'id'. Requires 'id'.
 * @attr {string} id - Required for 'persist' and for setting the global contrast CSS variable.
 *
 * @prop {string} color - Gets/sets the current background color. Syncs with attribute, style, localStorage.
 * @prop {boolean} disabled - Gets/sets the disabled state.
 * @prop {boolean} persist - Gets/sets the persistence state.
 * @prop {HTMLElement | null} slottedElement - Gets the actual slotted element.
 *
 * @fires change - When color selection is finalized (picker closed). Detail: { color: string }
 * @fires slotted-element-missing - If no suitable element found in slot on init.
 *
 * @cssprop --fz-color-picker-button-size - Size of the button (default: 3em).
 * @cssprop --fz-color-picker-button-border-color - Button border color (default: #ccc). Fallback. Uses --fz-color-picker-icon-color by default.
 * @cssprop --fz-color-picker-button-hover-background - Button hover background (default: rgba(200, 200, 200, 0.2)).
 * @cssprop --fz-color-picker-button-disabled-opacity - Component opacity when disabled (default: 0.5).
 * @cssprop --fz-color-picker-button-offset-top - Button top offset (default: 12px).
 * @cssprop --fz-color-picker-button-offset-right - Button right offset (default: 8px).
 * @cssprop --fz-color-picker-icon-color - SVG icon color (default: #000000). Auto-calculated for contrast. Applied to host.
 *
 * @csspart button - The color picker button element.
 *
 * @globalcssvar --fz-color-picker-contrast-{id} - Set on document.documentElement if the component has an 'id'. Contains the calculated contrast color ('#000000' or '#FFFFFF').
 */
class FrenzyColorPicker extends HTMLElement {
  // --- Private Class Fields ---
  #internals = null;
  #slottedElement = null;
  #colorButton = null;
  #hiddenColorInput = null;
  #currentColor = "transparent";
  #currentContrastColor = "#000000";
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null;
  #boundHandleButtonClick = null;
  #boundHandleHiddenInputChange = null;
  #boundHandleHiddenInputInput = null;
  #boundHandleMutation = null;
  #boundHandleHostMouseEnter = null;
  #boundHandleHostMouseLeave = null;
  #boundHandleHiddenInputBlur = null;
  #hasWarnedAboutMissingIdOnSave = false;
  #hasWarnedAboutMissingIdForGlobalVar = false;

  static get observedAttributes() {
    return ["color", "disabled", "persist", "id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM();
    this.#colorButton = this.shadowRoot.getElementById("color-button");
    this.#hiddenColorInput = this.shadowRoot.getElementById(
      "color-picker-hidden",
    );
  }

  // --- Public Property Getters/Setters ---
  // (Getters/Setters remain the same)
  get color() {
    return this.#currentColor;
  }

  set color(newValue) {
    const stringValue = String(newValue ?? "transparent").trim();
    const colorForInput =
      stringValue === "transparent" ? "#ffffff" : stringValue;

    if (this.#currentColor !== stringValue) {
      this.#currentColor = stringValue;

      if (
        !this.#isProgrammaticChange &&
        this.getAttribute("color") !== stringValue
      ) {
        this.#isProgrammaticChange = true;
        this.setAttribute("color", stringValue);
        this.#isProgrammaticChange = false;
      }

      this.#applyVisualUpdates(stringValue, colorForInput);
    } else {
      this.#updateHiddenInputValue(colorForInput);
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    const shouldBeDisabled = Boolean(value);
    if (this.disabled !== shouldBeDisabled) {
      this.toggleAttribute("disabled", shouldBeDisabled);
      if (this.#isInitialized) this.#updateDisabledState();
    }
  }

  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    const shouldPersist = Boolean(value);
    if (this.persist !== shouldPersist) {
      this.toggleAttribute("persist", shouldPersist);
      if (this.#isInitialized) {
        if (shouldPersist) {
          this.#saveToLocalStorage();
        } else {
          this.#clearFromLocalStorage();
        }
      }
    }
  }

  get slottedElement() {
    return this.#slottedElement;
  }

  // --- Lifecycle Callbacks ---
  // (connectedCallback, disconnectedCallback, attributeChangedCallback remain the same)
  connectedCallback() {
    if (this.#isInitialized) return;

    requestAnimationFrame(() => {
      this.#slottedElement = this.querySelector(
        ":scope > *:not(style):not(script)",
      );

      if (!this.#slottedElement) {
        console.error(
          "FrenzyColorPicker: No suitable element found in the default slot.",
          this,
        );
        this.dispatchEvent(
          new CustomEvent("slotted-element-missing", {
            bubbles: true,
            composed: true,
          }),
        );
        this.disabled = true;
        return;
      }

      this.#colorButton?.classList.remove("visible");

      let initialColor = "transparent";
      let sourceName = "default";

      if (this.hasAttribute("persist")) {
        const storageKey = this.#getStorageKey();
        if (storageKey) {
          try {
            const storedValue = localStorage.getItem(storageKey);
            if (storedValue !== null) {
              initialColor = storedValue;
              sourceName = "localStorage";
            }
          } catch (e) {
            console.warn(
              `FrenzyColorPicker (${
                this.id || "no-id"
              }): Failed to read localStorage.`,
              e,
            );
          }
        } else if (!this.#hasWarnedAboutMissingIdOnSave) {
          console.warn(
            `FrenzyColorPicker: 'persist' attribute enabled but 'id' is missing. Cannot load from localStorage.`,
          );
          this.#hasWarnedAboutMissingIdOnSave = true;
        }
      }

      if (sourceName === "default") {
        const attributeValue = this.getAttribute("color");
        if (attributeValue !== null) {
          initialColor = attributeValue;
          sourceName = "attribute";
        }
      }

      this.#isProgrammaticChange = this.getAttribute("color") === initialColor;
      this.#currentColor = initialColor;
      this.#applyVisualUpdates(
        initialColor,
        initialColor === "transparent" ? "#ffffff" : initialColor,
      );
      if (this.getAttribute("color") !== initialColor) {
        this.setAttribute("color", initialColor);
      }
      this.#isProgrammaticChange = false;

      this.#attachEventListeners();
      this.#updateDisabledState();
      this.#observeMutations();

      this.#isInitialized = true;
      console.debug(
        `FrenzyColorPicker (${
          this.id || "no-id"
        }): Initialized (color source: ${sourceName}).`,
      );
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    this.#removeGlobalContrastVariable(this.id);
    console.debug(`FrenzyColorPicker (${this.id || "no-id"}): Disconnected.`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;

    console.debug(
      `FrenzyColorPicker Attribute Changed: ${name}, Old: ${oldValue}, New: ${newValue}`,
    );

    switch (name) {
      case "color":
        if (!this.#isProgrammaticChange) {
          this.color = newValue ?? "transparent";
        }
        break;
      case "disabled":
        this.disabled = this.hasAttribute("disabled");
        // --- Add check state after disabled changes ---
        this.#checkHoverAndFocusState();
        // ---
        break;
      case "persist":
        this.persist = this.hasAttribute("persist");
        break;
      case "id":
        if (oldValue) {
          this.#removeGlobalContrastVariable(oldValue);
        }
        this.#updateGlobalContrastVariable();
        if (this.persist && oldValue !== null) {
          console.warn(
            `FrenzyColorPicker: 'id' changed from '${oldValue}' to '${newValue}'. localStorage key will change.`,
          );
          this.#saveToLocalStorage();
        }
        break;
    }
  }

  // --- Private Helper Methods ---
  // (#applyVisualUpdates, #updateHiddenInputValue, #getStorageKey, #saveToLocalStorage, #clearFromLocalStorage remain the same)
  // (#setupShadowDOM remains the same)
  // (#applyColorToSlottedElement, #updateIconAndGlobalContrastColor, #updateGlobalContrastVariable, #removeGlobalContrastVariable remain the same)
  // (#updateDisabledState remains the same)
  // (#observeMutations, #handleMutation remain the same)
  #applyVisualUpdates(currentColor, colorForInput) {
    this.#applyColorToSlottedElement(currentColor);
    requestAnimationFrame(() => {
      this.#updateIconAndGlobalContrastColor();
    });
    this.#updateHiddenInputValue(colorForInput);
  }

  #updateHiddenInputValue(colorForInput) {
    if (
      this.#hiddenColorInput &&
      this.#hiddenColorInput.value !== colorForInput
    ) {
      try {
        this.#hiddenColorInput.value = colorForInput;
      } catch (e) {
        console.warn(
          `FrenzyColorPicker: Could not set hidden color input value to "${colorForInput}". Resetting to black.`,
          e,
        );
        this.#hiddenColorInput.value = "#000000";
      }
    }
  }

  #getStorageKey() {
    const id = this.id;
    if (!id) return null;
    return `fz-color-picker-persist-v1-${id}`;
  }

  #saveToLocalStorage() {
    if (!this.#isInitialized || !this.persist) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, this.#currentColor);
      } catch (e) {
        console.warn(
          `FrenzyColorPicker (${
            this.id || "no-id"
          }): Failed to write localStorage ('${storageKey}').`,
          e,
        );
      }
    } else if (this.persist && !this.#hasWarnedAboutMissingIdOnSave) {
      console.warn(
        `FrenzyColorPicker: Cannot persist color without an 'id' attribute.`,
      );
      this.#hasWarnedAboutMissingIdOnSave = true;
    }
  }

  #clearFromLocalStorage() {
    if (!this.#isInitialized) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
        console.debug(
          `FrenzyColorPicker (${
            this.id || "no-id"
          }): Removed color from localStorage ('${storageKey}').`,
        );
      } catch (e) {
        console.warn(
          `FrenzyColorPicker (${
            this.id || "no-id"
          }): Failed to remove localStorage item ('${storageKey}').`,
          e,
        );
      }
    }
  }

  #setupShadowDOM() {
    const defaultIconColor = "#000000";
    // Styles remain the same
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host {
          display: block;
          position: relative;
          --fz-color-picker-button-size: 3em;
          --fz-color-picker-button-border-color: #ccc;
          --fz-color-picker-button-hover-background: rgba(200, 200, 200, 0.2);
          --fz-color-picker-button-disabled-opacity: 0.5;
          --fz-color-picker-button-offset-top: 12px;
          --fz-color-picker-button-offset-right: 8px;
          --fz-color-picker-icon-color: ${defaultIconColor};
        }

        #color-button {
          position: absolute;
          top: var(--fz-color-picker-button-offset-top);
          right: var(--fz-color-picker-button-offset-right);
          z-index: 21;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--fz-color-picker-button-size);
          height: var(--fz-color-picker-button-size);
          padding: 0;
          border: 2px solid var(--fz-color-picker-icon-color);
          border-radius: 8px;
          background-color: transparent;
          cursor: pointer;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          opacity: 0;
          pointer-events: none; /* Hidden by default */
          transition:
            opacity 0.2s ease-out,
            background-color 0.2s ease-out,
            border-color 0.2s ease-out,
            box-shadow 0.2s ease-out;
        }

        #color-button.visible {
          opacity: 1;
          pointer-events: auto; /* Visible and interactive */
        }

        #color-button:hover:not([disabled]) {
          background-color: var(--fz-color-picker-button-hover-background);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }
        #color-button:focus-visible {
          outline: 2px solid Highlight;
          outline: 2px solid -webkit-focus-ring-color;
          outline-offset: 2px;
          opacity: 1; /* Ensure visible when focused */
          pointer-events: auto;
        }

        #color-button svg {
          width: 70%;
          height: 70%;
          stroke: var(--fz-color-picker-icon-color);
          fill: none;
          display: block;
          transition:
            stroke 0.1s ease-out,
            fill 0.1s ease-out;
          pointer-events: none; /* Prevent SVG interference */
        }
        #color-button svg circle {
          fill: var(--fz-color-picker-icon-color);
          stroke: none;
          pointer-events: none; /* Prevent SVG interference */
        }

        #color-picker-hidden {
          position: absolute;
          top: var(--fz-color-picker-button-offset-top);
          right: var(--fz-color-picker-button-offset-right);
          width: var(--fz-color-picker-button-size);
          height: var(--fz-color-picker-button-size);
          opacity: 0;
          border: none;
          padding: 0;
          pointer-events: none;
          visibility: visible;
        }

        :host([disabled]) {
          opacity: var(--fz-color-picker-button-disabled-opacity);
          cursor: not-allowed;
          pointer-events: none;
        }
        #color-button[disabled] {
          cursor: not-allowed;
          background-color: rgba(238, 238, 238, 0.3);
          border-color: #ddd !important;
          box-shadow: none;
          opacity: 1 !important; /* Make sure disabled button is visible if needed */
          pointer-events: none !important;
        }
        #color-button[disabled] svg {
          stroke: #aaa !important;
        }
        #color-button[disabled] svg circle {
          fill: #aaa !important;
        }

        ::slotted(*) {
          background-color: inherit; /* Inherit background from host/JS */
          margin: 0; /* Basic reset */
        }
      </style>
      <slot></slot>
      <button
        type="button"
        id="color-button"
        part="button"
        aria-label="Change background color"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-paint-bucket-icon lucide-paint-bucket"
        >
          <path
            d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"
          />
          <path d="m5 2 5 5" />
          <path d="M2 13h15" />
          <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" />
        </svg>
      </button>
      <input
        type="color"
        id="color-picker-hidden"
        tabindex="-1"
        aria-hidden="true"
      />
    `;
  }

  #applyColorToSlottedElement(colorToApply) {
    if (this.#slottedElement) {
      try {
        this.#slottedElement.style.backgroundColor = colorToApply;
      } catch (e) {
        console.error(
          `FrenzyColorPicker: Failed to apply background color "${colorToApply}".`,
          e,
        );
      }
    } else {
      console.warn(
        "FrenzyColorPicker: Attempted to apply color, but slottedElement is null.",
      );
    }
  }

  #updateIconAndGlobalContrastColor() {
    if (!this.#isInitialized) {
      this.#currentContrastColor = "#000000";
      this.style.setProperty(
        "--fz-color-picker-icon-color",
        this.#currentContrastColor,
      );
      this.#updateGlobalContrastVariable();
      return;
    }

    let calculatedContrastColor = "#000000";

    if (this.#slottedElement) {
      const computedStyle = window.getComputedStyle(this.#slottedElement);
      const computedBgColor = computedStyle.backgroundColor;

      if (
        computedBgColor &&
        computedBgColor !== "transparent" &&
        !computedBgColor.startsWith("rgba(0, 0, 0, 0)")
      ) {
        try {
          calculatedContrastColor = getContrastingTextColor(computedBgColor);
        } catch (e) {
          console.error(
            "FrenzyColorPicker: Error calculating contrast color. Using default.",
            e,
          );
          calculatedContrastColor = "#000000";
        }
      }
    }

    this.#currentContrastColor = calculatedContrastColor;
    this.style.setProperty(
      "--fz-color-picker-icon-color",
      this.#currentContrastColor,
    );
    this.#updateGlobalContrastVariable();
  }

  #updateGlobalContrastVariable() {
    const currentId = this.id;
    if (currentId) {
      const globalVarName = `--fz-color-picker-contrast-${currentId}`;
      try {
        document.documentElement.style.setProperty(
          globalVarName,
          this.#currentContrastColor,
        );
      } catch (e) {
        console.error(
          `FrenzyColorPicker: Failed to set global CSS variable ${globalVarName}.`,
          e,
        );
      }
    }
  }

  #removeGlobalContrastVariable(idToRemove) {
    if (idToRemove) {
      const globalVarName = `--fz-color-picker-contrast-${idToRemove}`;
      try {
        document.documentElement.style.removeProperty(globalVarName);
        console.debug(`FrenzyColorPicker: Removed global var ${globalVarName}`);
      } catch (e) {
        console.error(
          `FrenzyColorPicker: Failed to remove global CSS variable ${globalVarName}.`,
          e,
        );
      }
    }
  }

  #updateDisabledState() {
    const isDisabled = this.disabled;
    if (this.#colorButton) {
      this.#colorButton.disabled = isDisabled;
      this.#colorButton.setAttribute("aria-disabled", String(isDisabled));
      // Visibility is handled by #checkHoverAndFocusState now
      // if (isDisabled) {
      //   this.#colorButton.classList.remove("visible");
      // }
    }
    if (this.#hiddenColorInput) {
      this.#hiddenColorInput.disabled = isDisabled;
    }
    console.debug(
      `FrenzyColorPicker UpdateDisabledState: Disabled=${isDisabled}`,
    );
  }

  #observeMutations() {
    if (!this.#slottedElement || this.#mutationObserver) return;

    this.#boundHandleMutation = this.#handleMutation.bind(this);
    this.#mutationObserver = new MutationObserver(this.#boundHandleMutation);
    this.#mutationObserver.observe(this, { childList: true });
    console.debug(
      `FrenzyColorPicker (${this.id || "no-id"}): MutationObserver attached.`,
    );
  }

  #handleMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        let elementRemoved = false;
        mutation.removedNodes.forEach((node) => {
          if (node === this.#slottedElement) {
            elementRemoved = true;
          }
        });

        if (elementRemoved) {
          console.warn("FrenzyColorPicker: Slotted element was removed.", this);
          this.#slottedElement = null;
          this.disabled = true;
          this.#updateIconAndGlobalContrastColor();
          // Check state after disabling
          this.#checkHoverAndFocusState();
        }

        if (!this.#slottedElement && mutation.addedNodes.length > 0) {
          const newElement = this.querySelector(
            ":scope > *:not(style):not(script)",
          );
          if (newElement) {
            console.log(
              "FrenzyColorPicker: New slotted element detected.",
              newElement,
            );
            this.#slottedElement = newElement;
            this.#applyVisualUpdates(
              this.#currentColor,
              this.#currentColor === "transparent"
                ? "#ffffff"
                : this.#currentColor,
            );
            if (!this.hasAttribute("disabled")) {
              this.disabled = false;
            }
            // Check state after potentially enabling
            this.#checkHoverAndFocusState();
          }
        }
      }
    }
  }

  #attachEventListeners() {
    if (this.#boundHandleButtonClick) return;

    // Bind 'this' context
    this.#boundHandleButtonClick = this.#handleButtonClick.bind(this);
    this.#boundHandleHiddenInputChange =
      this.#handleHiddenInputChange.bind(this);
    this.#boundHandleHiddenInputInput = this.#handleHiddenInputInput.bind(this);
    this.#boundHandleHostMouseEnter = this.#handleHostMouseEnter.bind(this);
    this.#boundHandleHostMouseLeave = this.#handleHostMouseLeave.bind(this);
    this.#boundHandleHiddenInputBlur = this.#handleHiddenInputBlur.bind(this);

    // Button and Input listeners
    this.#colorButton?.addEventListener("click", this.#boundHandleButtonClick);
    this.#hiddenColorInput?.addEventListener(
      "change",
      this.#boundHandleHiddenInputChange,
    );
    this.#hiddenColorInput?.addEventListener(
      "input",
      this.#boundHandleHiddenInputInput,
    );
    this.#hiddenColorInput?.addEventListener(
      // Add blur listener
      "blur",
      this.#boundHandleHiddenInputBlur,
    );

    // Host hover listeners
    this.addEventListener("mouseenter", this.#boundHandleHostMouseEnter);
    this.addEventListener("mouseleave", this.#boundHandleHostMouseLeave);

    // --- NEW: Add focus/blur listeners to the button itself for keyboard nav ---
    this.#colorButton?.addEventListener(
      "focus",
      this.#boundHandleHostMouseEnter,
    ); // Treat focus like mouse enter
    this.#colorButton?.addEventListener(
      "blur",
      this.#boundHandleHostMouseLeave,
    ); // Treat blur like mouse leave
    // ---

    console.debug(
      `FrenzyColorPicker (${this.id || "no-id"}): Event listeners attached.`,
    );
  }

  #removeEventListeners() {
    // Button and Input listeners
    this.#colorButton?.removeEventListener(
      "click",
      this.#boundHandleButtonClick,
    );
    this.#hiddenColorInput?.removeEventListener(
      "change",
      this.#boundHandleHiddenInputChange,
    );
    this.#hiddenColorInput?.removeEventListener(
      "input",
      this.#boundHandleHiddenInputInput,
    );
    this.#hiddenColorInput?.removeEventListener(
      // Remove blur listener
      "blur",
      this.#boundHandleHiddenInputBlur,
    );

    // Host hover listeners
    this.removeEventListener("mouseenter", this.#boundHandleHostMouseEnter);
    this.removeEventListener("mouseleave", this.#boundHandleHostMouseLeave);

    // --- NEW: Remove focus/blur listeners from the button ---
    this.#colorButton?.removeEventListener(
      "focus",
      this.#boundHandleHostMouseEnter,
    );
    this.#colorButton?.removeEventListener(
      "blur",
      this.#boundHandleHostMouseLeave,
    );
    // ---

    // Clear bound handler references
    this.#boundHandleButtonClick = null;
    this.#boundHandleHiddenInputChange = null;
    this.#boundHandleHiddenInputInput = null;
    this.#boundHandleHostMouseEnter = null;
    this.#boundHandleHostMouseLeave = null;
    this.#boundHandleHiddenInputBlur = null;

    console.debug(
      `FrenzyColorPicker (${this.id || "no-id"}): Event listeners removed.`,
    );
  }

  // --- Event Handlers ---

  #handleButtonClick(event) {
    if (this.disabled || !this.#hiddenColorInput) return;
    console.debug(
      `FrenzyColorPicker Button Click: Triggering hidden color input.`,
    );
    try {
      const currentVal =
        this.#currentColor === "transparent" ? "#ffffff" : this.#currentColor;
      this.#updateHiddenInputValue(currentVal);
      this.#hiddenColorInput.click();
      // No need to explicitly call checkHoverAndFocusState here,
      // focus shift to hidden input will trigger it via its focus handler (implicitly via blur/focus cycle)
      // or the existing mouseenter state keeps it visible.
    } catch (e) {
      console.error(
        "FrenzyColorPicker: Could not programmatically click hidden color input.",
        e,
      );
    }
  }

  #handleHiddenInputInput(event) {
    if (this.disabled) return;
    const liveColor = event.target.value;
    this.#applyVisualUpdates(liveColor, liveColor);
  }

  #handleHiddenInputChange(event) {
    if (this.disabled) return;
    const finalColor = event.target.value;
    console.debug(
      `FrenzyColorPicker Final Change: New color selected "${finalColor}".`,
    );

    this.#isProgrammaticChange = false;
    this.color = finalColor;

    this.#saveToLocalStorage();
    this.#dispatchChangeEvent(finalColor);

    // Check state after change, using microtask for focus shifts
    queueMicrotask(() => {
      this.#checkHoverAndFocusState();
    });
  }

  #handleHiddenInputBlur() {
    // console.debug("FrenzyColorPicker Hidden Input Blur");
    // Check state after blur, using microtask for focus shifts
    queueMicrotask(() => {
      this.#checkHoverAndFocusState();
    });
  }

  #handleHostMouseEnter() {
    // Check state on mouse enter
    // console.debug("FrenzyColorPicker Host Mouse Enter / Button Focus");
    // No microtask needed here, we want immediate feedback
    this.#checkHoverAndFocusState();
  }

  #handleHostMouseLeave() {
    // console.debug("FrenzyColorPicker Host Mouse Leave / Button Blur");
    // Check state after mouse leave/blur, using microtask for focus shifts
    queueMicrotask(() => {
      this.#checkHoverAndFocusState();
    });
  }

  // --- MODIFIED: Centralized check for hover/focus state ---
  #checkHoverAndFocusState() {
    if (!this.#isInitialized || !this.#colorButton) return; // Don't run if not ready

    const isHostHovered = this.matches(":hover");
    // Check if focus is *within* the shadow root
    const activeShadowElement = this.shadowRoot.activeElement;
    const isButtonFocused = activeShadowElement === this.#colorButton;
    const isInputFocused = activeShadowElement === this.#hiddenColorInput;

    // Determine if the button should be visible
    const shouldBeVisible =
      !this.disabled && (isHostHovered || isButtonFocused || isInputFocused);

    if (shouldBeVisible) {
      if (!this.#colorButton.classList.contains("visible")) {
        this.#colorButton.classList.add("visible");
        // console.debug("CheckHoverFocus: Setting visible");
      }
    } else {
      if (this.#colorButton.classList.contains("visible")) {
        this.#colorButton.classList.remove("visible");
        // console.debug("CheckHoverFocus: Setting hidden");
      }
    }
    // Optional detailed logging:
    // console.debug(`CheckHoverFocus: HostHovered=${isHostHovered}, ButtonFocused=${isButtonFocused}, InputFocused=${isInputFocused}, Disabled=${this.disabled}, ShouldBeVisible=${shouldBeVisible}`);
  }
  //---

  #dispatchChangeEvent(colorValue) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { color: colorValue },
        bubbles: true,
        composed: true,
      }),
    );
    console.debug(
      `FrenzyColorPicker Dispatched 'change' event with color "${colorValue}".`,
    );
  }
}

if (!customElements.get("fz-color-picker")) {
  customElements.define("fz-color-picker", FrenzyColorPicker);
}

export default FrenzyColorPicker;

function getContrastingTextColor(rgbString) {
  // Default color in case of parsing errors
  const defaultTextColor = "#000000"; // Black

  // Try to parse the RGB values from the string
  const match = rgbString.match(
    /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*[\d.]+)?\)/,
  );

  if (!match) {
    console.warn("Could not parse RGB string:", rgbString);
    return defaultTextColor; // Return default if parsing fails
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // Calculate perceived brightness using the YIQ formula's coefficients (approximation)
  // Formula: (R*299 + G*587 + B*114) / 1000
  // Values range from 0 (black) to 255 (white)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Determine text color based on brightness threshold
  // 128 is the midpoint of the 0-255 range
  const textColor = brightness >= 128 ? "#000000" : "#FFFFFF"; // Black text for light backgrounds, White text for dark backgrounds

  return textColor;
}
