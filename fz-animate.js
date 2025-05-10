const ANIME_JS_ESM_URL = "https://esm.sh/animejs@4";
let animeJsModulePromise = null;

class FrenzyAnimate extends HTMLElement {
  #animeInstance = null;
  #componentId = "";
  #slotElement = null;
  #slotChangeHandler = null;

  static get observedAttributes() {
    return [
      "animation-props",
      "duration",
      "ease",
      "delay",
      "loop",
      "direction",
      "autoplay",
      "trigger-on-attribute-change",
    ];
  }

  static loadAnimeJs() {
    if (animeJsModulePromise) {
      return animeJsModulePromise;
    }

    animeJsModulePromise = import(ANIME_JS_ESM_URL)
      .then((module) => {
        if (module && typeof module.animate === "function") {
          return module;
        } else {
          console.error(
            'Anime.js v4 module loaded, but "animate" function is missing or not a function.',
            module,
          );
          throw new Error(
            'Anime.js v4 loaded, but "animate" function is not available.',
          );
        }
      })
      .catch((error) => {
        console.error(
          `Error dynamically importing Anime.js v4 module from ${ANIME_JS_ESM_URL}:`,
          error,
        );
        animeJsModulePromise = null;
        throw error;
      });

    return animeJsModulePromise;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .error-message {
          color: #ef4444;
          padding: 0.5rem;
          background-color: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 0.25rem;
          margin-top: 0.5rem;
        }
      </style>
      <slot></slot>
    `;
    this.#componentId =
      this.id || `anim-el-${Math.random().toString(36).substr(2, 5)}`;
  }

  async connectedCallback() {
    this.#slotElement = this.shadowRoot.querySelector("slot");
    this.#slotChangeHandler = async () => {
      await this.#applyAnimation();
    };

    if (this.#slotElement) {
      this.#slotElement.addEventListener("slotchange", this.#slotChangeHandler);
    }
    Promise.resolve().then(() => this.#applyAnimation());
  }

  disconnectedCallback() {
    if (this.#slotElement && this.#slotChangeHandler) {
      this.#slotElement.removeEventListener(
        "slotchange",
        this.#slotChangeHandler,
      );
    }
    if (
      this.#animeInstance &&
      typeof this.#animeInstance.pause === "function"
    ) {
      this.#animeInstance.pause();
    }
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "ease" || FrenzyAnimate.observedAttributes.includes(name)) {
      const shouldTrigger =
        this.getAttribute("trigger-on-attribute-change") !== "false";
      if (shouldTrigger) {
        await this.#applyAnimation();
      }
    }
  }

  #getTargetElement() {
    if (!this.#slotElement) return null;
    const assignedNodes = this.#slotElement.assignedNodes({ flatten: true });
    return assignedNodes.find((node) => node.nodeType === Node.ELEMENT_NODE);
  }

  #getAnimationOptions() {
    const options = {};
    const propsAttr = this.getAttribute("animation-props");
    if (propsAttr) {
      try {
        Object.assign(options, JSON.parse(propsAttr));
      } catch (e) {
        console.error(
          `[${this.#componentId}]`,
          "Error parsing animation-props JSON:",
          e,
          propsAttr,
        );
        this.#displayError("Invalid JSON in animation-props.");
        return null;
      }
    } else {
      this.#displayError("animation-props attribute is required.");
      return null;
    }

    if (this.hasAttribute("duration"))
      options.duration = parseInt(this.getAttribute("duration"), 10);

    if (this.hasAttribute("ease")) {
      let easeValue = this.getAttribute("ease");
      if (easeValue.startsWith("ease")) {
        if (easeValue.includes("Elastic")) {
          easeValue = easeValue.replace(/^easeO/, "o");
        } else if (easeValue.includes("InOu")) {
          easeValue = easeValue.replace(/^easeInOut/, "inOut");
        } else if (easeValue.includes("In")) {
          easeValue = easeValue.replace(/^easeIn/, "in");
        } else if (easeValue.includes("Out")) {
          easeValue = easeValue.replace(/^easeOut/, "out");
        }
      }
      options.ease = easeValue;
    }

    if (this.hasAttribute("delay"))
      options.delay = parseInt(this.getAttribute("delay"), 10);

    const directionAttr = this.getAttribute("direction");
    if (directionAttr === "alternate") {
      options.alternate = true;
    } else if (directionAttr === "reverse") {
      options.reversed = true;
    }

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
      } else {
        const loopNum = parseInt(loopAttr, 10);
        if (!isNaN(loopNum)) {
          options.loop = loopNum;
        }
      }
    }

    this.#clearError();
    return options;
  }

  async #applyAnimation() {
    let animeModule;
    try {
      animeModule = await loadAnimeJs();
    } catch (error) {
      this.#displayError(`Anime.js v4 module failed to load: ${error.message}`);
      return;
    }

    const animateFunc = animeModule.animate;
    if (typeof animateFunc !== "function") {
      const errorMsg = `Anime.js v4 "animate" is not a function. Found type: ${typeof animateFunc}.`;
      console.error(`[${this.#componentId}]`, errorMsg, "Module:", animeModule);
      this.#displayError(errorMsg);
      return;
    }

    const targetElement = this.#getTargetElement();
    if (!targetElement) {
      return;
    }

    const animationOptions = this.#getAnimationOptions();
    if (!animationOptions) {
      return;
    }

    try {
      this.#animeInstance = animateFunc(targetElement, animationOptions);
    } catch (e) {
      let errorMessage = "Unknown animation error";
      if (e instanceof Error) errorMessage = e.message;
      else if (typeof e === "string") errorMessage = e;
      else
        try {
          errorMessage = JSON.stringify(e);
        } catch {
          errorMessage = "Unserializable error object";
        }
      console.error(
        `[${this.#componentId}]`,
        `[V4 ANIMATION ERROR] ${errorMessage}`,
        e,
        "Options:",
        animationOptions,
      );
      this.#displayError(`Animation setup failed: ${errorMessage}`);
    }
  }

  #displayError(message) {
    let errorDiv = this.shadowRoot.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      this.shadowRoot.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  }

  #clearError() {
    const errorDiv = this.shadowRoot.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
  }
}

customElements.define("fz-animate", FrenzyAnimate);

export default FrenzyAnimate;
