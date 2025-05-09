const ANIME_JS_ESM_URL = "https://esm.sh/animejs@3.2.1";
let animeLoadPromise = null; // This promise will resolve with the anime function itself.

class FrenzyAnimate extends HTMLElement {
  static get observedAttributes() {
    return [
      "animation-props",
      "duration",
      "easing",
      "delay",
      "loop",
      "direction",
      "autoplay",
      "trigger-on-attribute-change",
    ];
  }

  static _loadAnimeJs() {
    if (animeLoadPromise) {
      // console.log(`%c[FrenzyAnimate]`, 'color: #4ade80;', 'Anime.js load already in progress or completed. Returning existing promise.');
      return animeLoadPromise;
    }

    // console.log(`%c[FrenzyAnimate]`, 'color: #4ade80;', `Initiating dynamic import for Anime.js from ${ANIME_JS_ESM_URL}`);
    animeLoadPromise = import(ANIME_JS_ESM_URL)
      .then((module) => {
        // esm.sh typically provides the main export as 'default' for libraries like Anime.js
        if (module.default && typeof module.default === "function") {
          // console.log(`%c[FrenzyAnimate]`, 'color: #4ade80;', 'Anime.js ESM module loaded successfully from esm.sh. Using default export.');
          return module.default;
        } else {
          // Fallback if module structure is different than expected (e.g. animejs itself is the function)
          if (typeof module === "function") {
            // console.log(`%c[FrenzyAnimate]`, 'color: #4ade80;', 'Anime.js ESM module loaded, and the module itself is the function.');
            return module;
          }
          console.error(
            `%c[FrenzyAnimate]`,
            "color: red;",
            "Anime.js ESM module loaded from esm.sh, but default export is not a function, nor is the module itself.",
            module,
          );
          console.log("Anime.js loaded module structure:", module);
          throw new Error(
            "Anime.js loaded, but a usable function was not found.",
          );
        }
      })
      .catch((error) => {
        console.error(
          `%c[FrenzyAnimate]`,
          "color: red;",
          `Error dynamically importing Anime.js from ${ANIME_JS_ESM_URL}:`,
          error,
        );
        animeLoadPromise = null;
        throw error;
      });

    return animeLoadPromise;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
                    <style>
                        :host { display: block; }
                        .error-message {
                            color: #ef4444; /* Tailwind red-500 */
                            padding: 0.5rem;
                            background-color: #fee2e2; /* Tailwind red-100 */
                            border: 1px solid #fca5a5; /* Tailwind red-300 */
                            border-radius: 0.25rem;
                            margin-top: 0.5rem;
                        }
                    </style>
                    <slot></slot>
                `;
    this._animeInstance = null;
    this._componentId =
      this.id || `anim-el-${Math.random().toString(36).substr(2, 5)}`;
  }

  async connectedCallback() {
    this._slotElement = this.shadowRoot.querySelector("slot");
    this._slotChangeHandler = async () => {
      await this._applyAnimation();
    };

    if (this._slotElement) {
      this._slotElement.addEventListener("slotchange", this._slotChangeHandler);
    }
    Promise.resolve().then(() => this._applyAnimation());
  }

  disconnectedCallback() {
    if (this._slotElement && this._slotChangeHandler) {
      this._slotElement.removeEventListener(
        "slotchange",
        this._slotChangeHandler,
      );
    }
    if (
      this._animeInstance &&
      typeof this._animeInstance.pause === "function"
    ) {
      this._animeInstance.pause();
    }
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    const shouldTrigger =
      this.getAttribute("trigger-on-attribute-change") !== "false";
    if (shouldTrigger) {
      await this._applyAnimation();
    }
  }

  _getTargetElement() {
    if (!this._slotElement) return null;
    const assignedNodes = this._slotElement.assignedNodes({ flatten: true });
    return assignedNodes.find((node) => node.nodeType === Node.ELEMENT_NODE);
  }

  _getAnimationOptions() {
    const options = {};
    const propsAttr = this.getAttribute("animation-props");
    if (propsAttr) {
      try {
        Object.assign(options, JSON.parse(propsAttr));
      } catch (e) {
        console.error(
          `%c[${this._componentId}]`,
          "color: red;",
          "Error parsing animation-props JSON:",
          e,
          propsAttr,
        );
        this._displayError("Invalid JSON in animation-props.");
        return null;
      }
    } else {
      this._displayError("animation-props attribute is required.");
      return null;
    }

    if (this.hasAttribute("duration"))
      options.duration = parseInt(this.getAttribute("duration"), 10);
    if (this.hasAttribute("easing"))
      options.easing = this.getAttribute("easing");
    if (this.hasAttribute("delay"))
      options.delay = parseInt(this.getAttribute("delay"), 10);
    if (this.hasAttribute("direction"))
      options.direction = this.getAttribute("direction");

    const autoplayAttr = this.getAttribute("autoplay");
    if (autoplayAttr !== null) {
      options.autoplay = autoplayAttr !== "false";
    } else {
      options.autoplay = true;
    }

    const loopAttr = this.getAttribute("loop");
    if (loopAttr) {
      if (loopAttr === "true" || loopAttr === "") {
        options.loop = true;
      } else if (!isNaN(parseInt(loopAttr, 10))) {
        options.loop = parseInt(loopAttr, 10);
      }
    }

    this._clearError();
    return options;
  }

  async _applyAnimation() {
    let animeFunction;
    try {
      animeFunction = await FrenzyAnimate._loadAnimeJs();
    } catch (error) {
      this._displayError(`Anime.js library failed to load: ${error.message}`);
      return;
    }

    if (typeof animeFunction !== "function") {
      const errorMsg = `Anime.js resolved, but the result is not a function. Found type: ${typeof animeFunction}.`;
      console.error(
        `%c[${this._componentId}]`,
        "color: red;",
        errorMsg,
        "Value:",
        animeFunction,
      );
      this._displayError(errorMsg);
      return;
    }

    const targetElement = this._getTargetElement();
    if (!targetElement) {
      return;
    }

    const animationOptions = this._getAnimationOptions();
    if (!animationOptions) {
      return;
    }

    animationOptions.targets = targetElement;

    try {
      // Ensure anime.remove exists before calling it (it's part of anime.js API)
      if (typeof animeFunction.remove === "function") {
        animeFunction.remove(targetElement);
      }
      this._animeInstance = animeFunction(animationOptions);
    } catch (e) {
      let errorMessage = "Unknown animation error";
      let errorStack = "";

      if (e instanceof Error) {
        errorMessage = e.message;
        errorStack = e.stack;
      } else if (typeof e === "string") {
        errorMessage = e;
      } else if (e && typeof e === "object") {
        errorMessage = JSON.stringify(e);
      } else {
        errorMessage = "Error object could not be meaningfully stringified.";
      }

      console.error(
        `%c[${this._componentId}]`,
        "color: red;",
        "[ANIMATION ERROR] Message:",
        errorMessage,
      );
      if (e && typeof e === "object" && !(e instanceof Error)) {
        console.error(
          `%c[${this._componentId}]`,
          "color: red;",
          "[ANIMATION ERROR] Raw error object:",
          e,
        );
      }
      if (errorStack) {
        console.error(
          `%c[${this._componentId}]`,
          "color: red;",
          "[ANIMATION ERROR] Stack trace:",
          errorStack,
        );
      }
      console.error(
        `%c[${this._componentId}]`,
        "color: red;",
        "[ANIMATION ERROR] Options at time of error:",
        JSON.parse(
          JSON.stringify(animationOptions, (key, value) => {
            if (
              key === "targets" &&
              value &&
              typeof value === "object" &&
              value.nodeName
            ) {
              return `<${value.nodeName.toLowerCase()} id="${value.id || ""}" class="${value.className || ""}">`;
            }
            return value;
          }),
        ),
      );
      this._displayError(`Animation setup failed: ${errorMessage}`);
    }
  }

  _displayError(message) {
    let errorDiv = this.shadowRoot.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      this.shadowRoot.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  }

  _clearError() {
    const errorDiv = this.shadowRoot.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
  }
}

customElements.define("fz-animate", FrenzyAnimate);

export default FrenzyAnimate;
