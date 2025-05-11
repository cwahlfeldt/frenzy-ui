class FrenzyCarousel extends HTMLElement {
  // Private DOM Element References
  #slot = null;
  #innerContainer = null;
  #wrapper = null;
  #prevButton = null;
  #nextButton = null;
  #dotsContainer = null;

  // Private Core State
  #originalSlides = []; // Array of original light DOM slide elements
  #allSlidesInDOM = []; // Array of all slide elements in the shadow DOM (including clones)
  #slideOffsets = []; // Array of pre-calculated X offsets for each slide in #allSlidesInDOM
  #currentOriginalIndex = 0; // Index of the currently active slide relative to #originalSlides
  #currentDOMIndex = 0; // Index of the currently active slide relative to #allSlidesInDOM
  #isTransitioning = false; // Flag to indicate if a slide transition animation is in progress
  #offsetToFirstActualSlide = 0; // DOM index where the first non-cloned (original) slide begins
  #numLeadingCloneSets = 2; // Number of sets of original slides cloned at the beginning for infinite loop
  #numTrailingCloneSets = 2; // Number of sets of original slides cloned at the end for infinite loop
  #isActive = false; // Flag to indicate if the carousel has been initialized and is active

  // Private Attribute-controlled State
  #isCenteredMode = false; // `centered` attribute: centers the active slide
  #showArrows = false; // `arrows` attribute: shows navigation arrows
  #showDots = false; // `dots` attribute: shows pagination dots
  #slideGapValue = "0px"; // `gap` attribute: space between slides
  #speedValue = "0.6s"; // `speed` attribute: transition speed
  #easingFunctionValue = "ease-in-out"; // `easing` attribute: CSS easing function for transitions
  #noDrag = false; // `nodrag` attribute: disables mouse/touch dragging

  // Private Internal Mechanics State
  #computedSlideGap = 0; // The actual computed gap value in pixels
  #resizeObserver = null; // Observes size changes on the host element and slides

  // Private Autoplay State
  #autoplayEnabled = false; // `autoplay` attribute: enables auto-sliding
  #autoplayIntervalValue = 3000; // `autoplay-interval` attribute: time in ms between auto-slides
  #autoplayTimerId = null; // Timer ID for autoplay

  // Private Dragging State
  #isDragging = false; // Flag to indicate if a drag operation is in progress
  #dragStartX = 0; // Initial X coordinate at the start of a drag
  #dragCurrentX = 0; // Current X coordinate during a drag
  #dragStartTime = 0; // Timestamp at the start of a drag
  #dragInitialWrapperX = 0; // X transform of the wrapper at the start of a drag
  #dragThreshold = 50; // Minimum pixel distance to register a drag as a swipe

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Define the HTML structure and styles for the carousel
    const templateContent = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
          --fz-arrow-bg: rgba(0, 0, 0, 0.6);
          --fz-arrow-color: white;
          --fz-dot-color: rgba(255, 255, 255, 0.5);
          --fz-dot-active-color: white;
          border-radius: inherit; /* Inherit border-radius from host */
          touch-action: pan-y; /* Allow vertical scroll, horizontal is handled by component by default */
        }
        :host([nodrag]) {
            touch-action: auto; /* Allow default touch actions if dragging is disabled */
        }

        /* Hidden slot for original slide content */
        slot[name=""] {
          display: none;
        }

        .carousel-inner-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
          border-radius: inherit;
          user-select: none; /* Disable text selection during drag */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          cursor: grab; /* Indicate draggability */
        }
        :host([nodrag]) .carousel-inner-container {
          cursor: default;
        }
        .carousel-inner-container.dragging {
          cursor: grabbing; /* Indicate active drag */
        }

        .carousel-wrapper {
          display: flex;
          height: 100%;
          will-change: transform; /* Optimize for transform animations */
        }

        /* Styles for individual slides */
        /* These styles apply to the elements *you* place in the wrapper */
        .carousel-wrapper > * {
          flex-shrink: 0; /* Prevent slides from shrinking */
          height: 100%;
          /* It's often better to let content define its width, or control width via JS if all slides must be same width as container */
          /* max-height: 100% !important; */ /* This can be too restrictive, height: 100% is usually enough */
          /* max-width: 100% !important; */ /* This might conflict with centered mode or multi-slide view. Width is usually slide.offsetWidth */
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden; /* Good for ensuring content fits */
        }

        /* Prevent dragging of images within slides */
        .carousel-wrapper > * img {
          pointer-events: none;
        }

        /* Specific styles for direct image slides if they are children of the wrapper */
        .carousel-wrapper > img {
          /* width: auto; */ /* This might be too small if the image is meant to fill the slide */
          /* max-width: none; */
          object-fit: contain; /* Or cover, depending on desired effect */
          display: block;
          width: 100%; /* Make images fill the slide container by default if they are direct children */
          height: 100%;
        }

        /* Navigation arrows */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--fz-arrow-bg);
          color: var(--fz-arrow-color);
          border: none;
          padding: 0;
          cursor: pointer;
          z-index: 10;
          border-radius: 50%;
          font-size: 20px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background-color 0.2s ease,
            opacity 0.3s ease;
          opacity: 0.8;
        }
        .nav-arrow:hover {
          background-color: rgba(0, 0, 0, 0.8);
          opacity: 1;
        }
        .nav-arrow.prev { left: 15px; }
        .nav-arrow.next { right: 15px; }
        .nav-arrow.hidden,
        .nav-dots.hidden {
          display: none !important; /* Hide arrows/dots when not needed */
        }

        /* Pagination dots */
        .nav-dots {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
          padding: 5px;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
        }
        .dot {
          width: 12px;
          height: 12px;
          background-color: var(--fz-dot-color);
          border-radius: 50%;
          cursor: pointer;
          transition:
            background-color 0.3s ease,
            transform 0.2s ease;
        }
        .dot:hover {
          transform: scale(1.2);
        }
        .dot.active {
          background-color: var(--fz-dot-active-color);
          transform: scale(1.1);
        }
      </style>

      <slot style="display: none;"></slot>

      <div class="carousel-inner-container">
        <div class="carousel-wrapper"></div>
        <button class="nav-arrow prev hidden" aria-label="Previous slide">&#10094;</button>
        <button class="nav-arrow next hidden" aria-label="Next slide">&#10095;</button>
        <div class="nav-dots hidden"></div>
      </div>
    `;
    const templateElement = document.createElement("template");
    templateElement.innerHTML = templateContent;
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

    // Cache references to key DOM elements in the shadow DOM
    this.#slot = this.shadowRoot.querySelector("slot");
    this.#innerContainer = this.shadowRoot.querySelector(
      ".carousel-inner-container",
    );
    this.#wrapper = this.shadowRoot.querySelector(".carousel-wrapper");
    this.#prevButton = this.shadowRoot.querySelector(".nav-arrow.prev");
    this.#nextButton = this.shadowRoot.querySelector(".nav-arrow.next");
    this.#dotsContainer = this.shadowRoot.querySelector(".nav-dots");
  }

  static get observedAttributes() {
    return [
      "centered",
      "autoplay",
      "autoplay-interval",
      "gap",
      "arrows",
      "dots",
      "nodrag",
      "speed",
      "easing",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      oldValue === newValue &&
      !["nodrag", "autoplay", "arrows", "dots", "centered"].includes(name)
    ) {
      return;
    }

    let needsUIRefresh = false;
    let needsAutoplayRestart = false;

    switch (name) {
      case "centered":
        this.#isCenteredMode = this.#getBooleanAttribute("centered");
        needsUIRefresh = true;
        break;
      case "autoplay":
        this.#autoplayEnabled = this.#getBooleanAttribute("autoplay");
        needsAutoplayRestart = true;
        break;
      case "autoplay-interval":
        this.#autoplayIntervalValue = this._getNumberAttribute(
          "autoplay-interval",
          3000,
          1,
        );
        needsAutoplayRestart = true;
        break;
      case "gap":
        this.#slideGapValue = this._getStringAttribute("gap", "0px");
        if (this.#wrapper) this.#wrapper.style.gap = this.#slideGapValue;
        needsUIRefresh = true;
        break;
      case "arrows":
        this.#showArrows = this.#getBooleanAttribute("arrows");
        if (this.#isActive) this.#updateNavigationVisibility();
        break;
      case "dots":
        this.#showDots = this.#getBooleanAttribute("dots");
        if (this.#isActive) this.#updateNavigationVisibility();
        break;
      case "nodrag":
        this.#noDrag = this.#getBooleanAttribute("nodrag");
        // The :host([nodrag]) CSS rule will handle touch-action
        break;
      case "speed":
        this.#speedValue = this._getStringAttribute("speed", "0.6s");
        break;
      case "easing":
        this.#easingFunctionValue = this._getStringAttribute(
          "easing",
          "ease-in-out",
        );
        break;
    }

    if (this.#isActive) {
      if (needsUIRefresh) {
        requestAnimationFrame(() => {
          this.#calculateSlideWidthsAndOffsets();
          this.#goToDOMIndex(this.#currentDOMIndex, false, true);
        });
      }
      if (needsAutoplayRestart) {
        this.#handleAutoplay();
      }
    }
  }

  connectedCallback() {
    if (!this.#slot) return;

    // --- BEGIN STYLE MIRRORING ---
    // This logic mirrors stylesheets from the document head into the shadow DOM.
    // It runs once by checking for a marker attribute on already cloned style/link elements.
    // It uses `this.ownerDocument` to correctly reference the document containing this element.
    if (!this.shadowRoot.querySelector('[data-fz-cloned-stylesheet="true"]')) {
      const fragment = document.createDocumentFragment();
      const doc = this.ownerDocument || document; // Get the document context

      // Clone <link rel="stylesheet"> elements from the document's head
      doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const newLink = link.cloneNode(true);
        newLink.setAttribute("data-fz-cloned-stylesheet", "true"); // Mark as cloned
        fragment.appendChild(newLink);
      });

      // Clone <style> elements from the document's head
      // This includes styles defined in <style> tags directly in the head.
      doc.head.querySelectorAll("style").forEach((style) => {
        const newStyle = style.cloneNode(true);
        newStyle.setAttribute("data-fz-cloned-stylesheet", "true"); // Mark as cloned
        fragment.appendChild(newStyle);
      });

      // Prepend these to the shadow root so the component's own styles can override them if necessary.
      // The component's <style> tag (defined in the constructor) will come after these.
      if (fragment.childNodes.length > 0) {
        this.shadowRoot.insertBefore(fragment, this.shadowRoot.firstChild);
      }
    }
    // --- END STYLE MIRRORING ---

    // Initial attribute parsing
    this.#isCenteredMode = this.#getBooleanAttribute("centered");
    this.#autoplayEnabled = this.#getBooleanAttribute("autoplay");
    this.#showArrows = this.#getBooleanAttribute("arrows");
    this.#showDots = this.#getBooleanAttribute("dots");
    this.#noDrag = this.#getBooleanAttribute("nodrag");
    // touch-action is handled by :host CSS

    this.#speedValue = this._getStringAttribute("speed", "0.6s");
    this.#easingFunctionValue = this._getStringAttribute(
      "easing",
      "ease-in-out",
    );
    this.#slideGapValue = this._getStringAttribute("gap", "0px");
    if (this.#wrapper) this.#wrapper.style.gap = this.#slideGapValue;
    this.#autoplayIntervalValue = this._getNumberAttribute(
      "autoplay-interval",
      3000,
      1,
    );

    const lightDOMImages = this.querySelectorAll("img");
    lightDOMImages.forEach((image) => (image.draggable = false));

    this.#slot.addEventListener("slotchange", this.#handleSlotChange);
    this.#prevButton.addEventListener("click", this.prevSlide);
    this.#nextButton.addEventListener("click", this.nextSlide);
    this.#wrapper.addEventListener("transitionend", this.#onTransitionEnd);

    this.#innerContainer.addEventListener("touchstart", this.#onTouchStart, {
      passive: true,
    });
    this.#innerContainer.addEventListener("touchmove", this.#onTouchMove, {
      passive: false,
    });
    this.#innerContainer.addEventListener("touchend", this.#onTouchEnd);
    this.#innerContainer.addEventListener("touchcancel", this.#onTouchEnd);
    this.#innerContainer.addEventListener("mousedown", this.#onMouseDown);

    this.#handleSlotChange(); // Initial setup

    this.#resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (
          entry.target === this ||
          this.#allSlidesInDOM.some((slide) => slide === entry.target)
        ) {
          requestAnimationFrame(() => {
            this.#calculateSlideWidthsAndOffsets();
            this.#goToDOMIndex(this.#currentDOMIndex, false, true);
          });
        }
      }
    });
    this.#resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this.#slot?.removeEventListener("slotchange", this.#handleSlotChange);
    this.#prevButton?.removeEventListener("click", this.prevSlide);
    this.#nextButton?.removeEventListener("click", this.nextSlide);
    this.#wrapper?.removeEventListener("transitionend", this.#onTransitionEnd);

    if (this.#innerContainer) {
      this.#innerContainer.removeEventListener(
        "touchstart",
        this.#onTouchStart,
      );
      this.#innerContainer.removeEventListener("touchmove", this.#onTouchMove);
      this.#innerContainer.removeEventListener("touchend", this.#onTouchEnd);
      this.#innerContainer.removeEventListener("touchcancel", this.#onTouchEnd);
      this.#innerContainer.removeEventListener("mousedown", this.#onMouseDown);
    }
    document.removeEventListener("mousemove", this.#onDragMouseMove);
    document.removeEventListener("mouseup", this.#onDragMouseUp);

    if (this.#resizeObserver) {
      this.#allSlidesInDOM.forEach((slide) =>
        this.#resizeObserver.unobserve(slide),
      );
      this.#resizeObserver.unobserve(this);
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    if (this.#wrapper) this.#wrapper.innerHTML = "";
    this.#originalSlides = [];
    this.#allSlidesInDOM = [];
    this.#isActive = false;
    this.#stopAutoplay();
  }

  // --- Attribute Helper Methods ---
  #getBooleanAttribute(name) {
    return this.hasAttribute(name);
  }

  _getStringAttribute(name, defaultValue) {
    const value = this.getAttribute(name);
    return value === null || value.trim() === "" ? defaultValue : value;
  }

  _getNumberAttribute(name, defaultValue, minValue = -Infinity) {
    const value = this.getAttribute(name);
    if (value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < minValue ? defaultValue : parsed;
  }

  // --- Carousel Setup and Management ---
  #handleSlotChange = () => {
    this.#originalSlides = Array.from(
      this.#slot.assignedElements({ flatten: true }),
    );
    this.#currentOriginalIndex = 0;
    this.#setupCarousel();
  };

  #setupCarousel = () => {
    this.#isActive = false;
    this.#stopAutoplay();

    if (!this.#wrapper || !this.#originalSlides) return;

    this.#wrapper.style.gap = this.#slideGapValue;

    if (this.#resizeObserver) {
      this.#allSlidesInDOM.forEach((slide) =>
        this.#resizeObserver.unobserve(slide),
      );
    }
    this.#wrapper.innerHTML = "";
    this.#allSlidesInDOM = [];

    const numOriginalSlides = this.#originalSlides.length;

    if (numOriginalSlides === 0) {
      this.#slideOffsets = [0];
      this.#offsetToFirstActualSlide = 0;
      this.#updateNavigationVisibility();
      return;
    }

    if (numOriginalSlides === 1) {
      const singleSlideOriginal = this.#originalSlides[0];
      const singleSlideClone = singleSlideOriginal.cloneNode(true);
      this.#prepareClonedSlide(singleSlideClone, singleSlideOriginal, null, 0); // Pass original for potential style access
      this.#allSlidesInDOM = [singleSlideClone];
      this.#wrapper.appendChild(singleSlideClone);
      if (this.#resizeObserver) this.#resizeObserver.observe(singleSlideClone);
      this.#offsetToFirstActualSlide = 0;
    } else {
      this.#offsetToFirstActualSlide =
        this.#numLeadingCloneSets * numOriginalSlides;

      const addSlideToDOM = (originalSlide, type, originalIndexForActual) => {
        const clone = originalSlide.cloneNode(true);
        // Pass the original slide to #prepareClonedSlide if you need to access its computed styles directly later,
        // though the mirrored stylesheet approach is generally preferred.
        this.#prepareClonedSlide(
          clone,
          originalSlide,
          type,
          originalIndexForActual,
        );
        this.#wrapper.appendChild(clone);
        this.#allSlidesInDOM.push(clone);
        if (this.#resizeObserver) this.#resizeObserver.observe(clone);
      };

      for (let set = 0; set < this.#numLeadingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++) {
          addSlideToDOM(this.#originalSlides[i], `leading-set-${set}`); // originalIndexForActual is undefined here
        }
      }
      for (let i = 0; i < numOriginalSlides; i++) {
        addSlideToDOM(this.#originalSlides[i], null, i);
      }
      for (let set = 0; set < this.#numTrailingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++) {
          addSlideToDOM(this.#originalSlides[i], `trailing-set-${set}`); // originalIndexForActual is undefined here
        }
      }
    }

    this.#setupDots();
    this.#updateNavigationVisibility();

    requestAnimationFrame(() => {
      this.#calculateSlideWidthsAndOffsets();
      this.#currentOriginalIndex = 0;
      this.#currentDOMIndex = this.#offsetToFirstActualSlide;

      if (numOriginalSlides > 0) {
        this.#goToDOMIndex(this.#currentDOMIndex, false, true);
      }
      this.#isActive = true;
      this.#handleAutoplay();
    });
  };

  #prepareClonedSlide(
    cloneElement,
    originalSlideElement, // Added to potentially access original's computed styles if needed, though not used in this specific fix
    cloneType = null,
    originalIndex = undefined, // This is the index within the original set of slides
  ) {
    cloneElement
      .querySelectorAll("img")
      .forEach((img) => (img.draggable = false));

    // Construct a meaningful part attribute.
    // Example: "fz-slide fz-slide-original-0" or "fz-slide fz-slide-clone"
    let partValue = "fz-slide";
    if (originalIndex !== undefined) {
      partValue += ` fz-slide-original fz-slide-original-${originalIndex}`;
    } else {
      partValue += " fz-slide-clone";
    }
    if (cloneType) {
      // e.g., leading-set-0
      partValue += ` fz-clone-${cloneType.replace(/\s+/g, "-")}`; // Sanitize cloneType for class-like usage
    }
    cloneElement.setAttribute("part", partValue);

    if (cloneType) cloneElement.setAttribute("data-fz-clone-type", cloneType);
    if (originalIndex !== undefined) {
      cloneElement.setAttribute("data-fz-original-index", originalIndex);
    }
    // No direct style copying here as the mirrored stylesheets should handle it.
    // `cloneNode(true)` already copies inline styles and classes from the originalSlideElement.
  }

  #updateNavigationVisibility = () => {
    const hasMultipleSlides = this.#originalSlides.length > 1;
    this.#prevButton?.classList.toggle(
      "hidden",
      !(this.#showArrows && hasMultipleSlides),
    );
    this.#nextButton?.classList.toggle(
      "hidden",
      !(this.#showArrows && hasMultipleSlides),
    );
    this.#dotsContainer?.classList.toggle(
      "hidden",
      !(this.#showDots && hasMultipleSlides),
    );
  };

  #calculateSlideWidthsAndOffsets = () => {
    if (!this.#wrapper || this.#allSlidesInDOM.length === 0) {
      this.#slideOffsets = [];
      this.#computedSlideGap = 0;
      return;
    }
    this.#computedSlideGap =
      parseFloat(window.getComputedStyle(this.#wrapper).gap) || 0;
    this.#slideOffsets = [];
    let currentOffset = 0;
    this.#allSlidesInDOM.forEach((slide, index) => {
      this.#slideOffsets.push(currentOffset);
      currentOffset += slide.offsetWidth;
      if (index < this.#allSlidesInDOM.length - 1) {
        currentOffset += this.#computedSlideGap;
      }
    });
  };

  #setupDots = () => {
    if (!this.#dotsContainer) return;
    this.#dotsContainer.innerHTML = "";
    if (this.#originalSlides.length <= 1) return;

    this.#originalSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => this.goToSlide(index));
      this.#dotsContainer.appendChild(dot);
    });
    this.#updateDots();
  };

  #updateDots = () => {
    if (
      this.#originalSlides.length <= 1 ||
      !this.#dotsContainer ||
      !this.#showDots
    )
      return;
    const dots = this.#dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.#currentOriginalIndex);
    });
  };

  #getTargetTransformX = (domIndex) => {
    if (
      domIndex < 0 ||
      domIndex >= this.#slideOffsets.length ||
      !this.#allSlidesInDOM[domIndex]
    ) {
      const fallbackIndex = Math.max(
        0,
        Math.min(this.#currentDOMIndex, this.#slideOffsets.length - 1),
      );
      if (
        fallbackIndex < 0 ||
        fallbackIndex >= this.#slideOffsets.length ||
        !this.#allSlidesInDOM[fallbackIndex]
      ) {
        return 0;
      }
      domIndex = fallbackIndex;
    }

    const viewportWidth = this.#innerContainer.offsetWidth;
    const currentSlideElement = this.#allSlidesInDOM[domIndex];
    const currentSlideWidth = currentSlideElement.offsetWidth;

    if (this.#isCenteredMode && this.#originalSlides.length > 0) {
      return (
        viewportWidth / 2 -
        (this.#slideOffsets[domIndex] + currentSlideWidth / 2)
      );
    } else {
      return -this.#slideOffsets[domIndex];
    }
  };

  #goToDOMIndex = (domIndex, animate = true, forceNoTransition = false) => {
    if (
      !this.#isActive ||
      !this.#wrapper ||
      this.#allSlidesInDOM.length === 0 ||
      !this.#slideOffsets ||
      this.#slideOffsets.length === 0
    ) {
      return;
    }

    if (this.#isTransitioning && animate && !forceNoTransition) {
      const currentTransform = window.getComputedStyle(this.#wrapper).transform;
      this.#wrapper.style.transition = "none";
      this.#wrapper.style.transform = currentTransform;
      this.#wrapper.offsetHeight;
      this.#isTransitioning = false;
    }

    if (domIndex < 0 || domIndex >= this.#slideOffsets.length) {
      console.warn(
        `FrenzyCarousel: domIndex ${domIndex} out of bounds. Resetting.`,
      );
      domIndex = Math.max(
        0,
        Math.min(
          this.#offsetToFirstActualSlide + this.#currentOriginalIndex,
          this.#slideOffsets.length - 1,
        ),
      );
      if (domIndex < 0 || domIndex >= this.#slideOffsets.length) return;
    }

    const targetOffset = this.#getTargetTransformX(domIndex);
    this.#currentDOMIndex = domIndex;

    const effectiveTransition =
      animate && !forceNoTransition && parseFloat(this.#speedValue) > 0;

    if (effectiveTransition) {
      this.#wrapper.style.transition = `transform ${this.#speedValue} ${this.#easingFunctionValue}`;
      this.#isTransitioning = true;
    } else {
      this.#wrapper.style.transition = "none";
      this.#isTransitioning = false;
      if (!forceNoTransition) {
        this.#wrapper.offsetHeight;
      }
    }
    this.#wrapper.style.transform = `translateX(${targetOffset}px)`;

    if (!effectiveTransition) {
      this.#handlePossibleInfiniteLoopJump();
    }
  };

  #handlePossibleInfiniteLoopJump = () => {
    if (this.#isTransitioning && parseFloat(this.#speedValue) > 0) return;

    const numOriginal = this.#originalSlides.length;
    if (numOriginal <= 1) {
      this.#updateDots();
      return;
    }

    const currentDOM = this.#currentDOMIndex;
    let jumpNeeded = false;
    let newOriginalIdx = this.#currentOriginalIndex;
    let newDOMTargetIdx = this.#currentDOMIndex;

    const startOfOriginalSet = this.#offsetToFirstActualSlide;
    const endOfOriginalSet = startOfOriginalSet + numOriginal - 1;
    const startOfTrailingCloneRegion = startOfOriginalSet + numOriginal;

    if (currentDOM >= startOfTrailingCloneRegion) {
      newOriginalIdx = (currentDOM - startOfOriginalSet) % numOriginal;
      newDOMTargetIdx = startOfOriginalSet + newOriginalIdx;
      jumpNeeded = true;
    } else if (currentDOM < startOfOriginalSet) {
      newOriginalIdx = ((currentDOM % numOriginal) + numOriginal) % numOriginal;
      newDOMTargetIdx = startOfOriginalSet + newOriginalIdx;
      jumpNeeded = true;
    }

    if (jumpNeeded) {
      this.#wrapper.style.transition = "none";
      this.#wrapper.offsetHeight;

      const jumpTargetOffset = this.#getTargetTransformX(newDOMTargetIdx);
      this.#wrapper.style.transform = `translateX(${jumpTargetOffset}px)`;

      this.#currentDOMIndex = newDOMTargetIdx;
      this.#currentOriginalIndex = newOriginalIdx;
    } else {
      if (currentDOM >= startOfOriginalSet && currentDOM <= endOfOriginalSet) {
        this.#currentOriginalIndex = currentDOM - startOfOriginalSet;
      }
    }
    this.#updateDots();
  };

  #onTransitionEnd = (event) => {
    if (event.target !== this.#wrapper || !this.#isTransitioning) return;
    this.#isTransitioning = false;
    this.#handlePossibleInfiniteLoopJump();
    if (this.#autoplayEnabled && this.#originalSlides.length > 1) {
      this.#startAutoplay();
    }
  };

  #startAutoplay = () => {
    this.#stopAutoplay();
    if (
      this.#autoplayEnabled &&
      this.#originalSlides.length > 1 &&
      this.#isActive
    ) {
      this.#autoplayTimerId = setTimeout(
        () => this.nextSlide(true),
        this.#autoplayIntervalValue,
      );
    }
  };

  #stopAutoplay = () => {
    if (this.#autoplayTimerId) clearTimeout(this.#autoplayTimerId);
    this.#autoplayTimerId = null;
  };

  #handleAutoplay = () => {
    if (
      this.#autoplayEnabled &&
      this.#originalSlides.length > 1 &&
      this.#isActive
    ) {
      this.#startAutoplay();
    } else {
      this.#stopAutoplay();
    }
  };

  _getDragInitialWrapperX() {
    const currentTransformStyle = window.getComputedStyle(
      this.#wrapper,
    ).transform;
    if (currentTransformStyle && currentTransformStyle !== "none") {
      try {
        const matrix = new DOMMatrixReadOnly(currentTransformStyle);
        return matrix.e;
      } catch (e) {
        console.warn(
          "FrenzyCarousel: Could not parse transform matrix, falling back to calculated offset.",
          e,
        );
        return this.#getTargetTransformX(this.#currentDOMIndex);
      }
    }
    return this.#getTargetTransformX(this.#currentDOMIndex);
  }

  _handleDragStart = (clientX) => {
    if (!this.#isActive || this.#noDrag || this.#originalSlides.length <= 1)
      return false;

    this.#isDragging = true;
    this.#innerContainer.classList.add("dragging");
    this.#dragStartX = clientX;
    this.#dragCurrentX = this.#dragStartX;
    this.#dragStartTime = Date.now();

    if (this.#isTransitioning) {
      this.#isTransitioning = false;
    }
    this.#wrapper.style.transition = "none";

    this.#dragInitialWrapperX = this._getDragInitialWrapperX();
    this.#stopAutoplay();
    return true;
  };

  _handleDragMove = (clientX) => {
    if (!this.#isDragging || this.#noDrag) return;

    this.#dragCurrentX = clientX;
    const deltaX = this.#dragCurrentX - this.#dragStartX;
    this.#wrapper.style.transform = `translateX(${this.#dragInitialWrapperX + deltaX}px)`;
  };

  _handleDragEnd = () => {
    if (!this.#isDragging || this.#noDrag) return;
    this.#isDragging = false;
    this.#innerContainer.classList.remove("dragging");

    const dragDistance = this.#dragCurrentX - this.#dragStartX;
    const dragDuration = Date.now() - this.#dragStartTime;
    const velocity =
      dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

    if (
      Math.abs(dragDistance) > this.#dragThreshold ||
      (Math.abs(dragDistance) > 10 && velocity > 0.25)
    ) {
      if (dragDistance < 0) this.nextSlide();
      else this.prevSlide();
    } else {
      this.#goToDOMIndex(this.#currentDOMIndex, true);
    }

    if (this.#autoplayEnabled && this.#originalSlides.length > 1) {
      this.#startAutoplay();
    }
  };

  #onMouseDown = (event) => {
    if (event.target.closest(".nav-arrow, .dot") || event.button !== 0) return;

    if (this._handleDragStart(event.clientX)) {
      event.preventDefault();
      document.addEventListener("mousemove", this.#onDragMouseMove);
      document.addEventListener("mouseup", this.#onDragMouseUp);
    }
  };

  #onDragMouseMove = (event) => {
    this._handleDragMove(event.clientX);
  };

  #onDragMouseUp = () => {
    this._handleDragEnd();
    document.removeEventListener("mousemove", this.#onDragMouseMove);
    document.removeEventListener("mouseup", this.#onDragMouseUp);
  };

  #onTouchStart = (event) => {
    if (event.touches.length > 1 || event.target.closest(".nav-arrow, .dot"))
      return;
    this._handleDragStart(event.touches[0].clientX);
  };

  #onTouchMove = (event) => {
    if (!this.#isDragging || this.#noDrag) return;
    event.preventDefault();
    this._handleDragMove(event.touches[0].clientX);
  };

  #onTouchEnd = () => {
    this._handleDragEnd();
  };

  nextSlide = (isAutoplay = false) => {
    if (
      this.#originalSlides.length <= 1 ||
      (this.#isTransitioning && !isAutoplay) ||
      (this.#isDragging && !isAutoplay)
    ) {
      return;
    }
    if (!isAutoplay && !this.#isDragging) this.#stopAutoplay();

    const newDOMIndex = this.#currentDOMIndex + 1;
    this.#goToDOMIndex(newDOMIndex, true);

    if (
      !isAutoplay &&
      this.#autoplayEnabled &&
      parseFloat(this.#speedValue) === 0 &&
      this.#originalSlides.length > 1
    ) {
      this.#startAutoplay();
    }
  };

  prevSlide = () => {
    if (
      this.#originalSlides.length <= 1 ||
      this.#isTransitioning ||
      this.#isDragging
    ) {
      return;
    }
    this.#stopAutoplay();

    const newDOMIndex = this.#currentDOMIndex - 1;
    this.#goToDOMIndex(newDOMIndex, true);

    if (
      this.#autoplayEnabled &&
      parseFloat(this.#speedValue) === 0 &&
      this.#originalSlides.length > 1
    ) {
      this.#startAutoplay();
    }
  };

  goToSlide = (originalIndex) => {
    if (
      originalIndex < 0 ||
      originalIndex >= this.#originalSlides.length ||
      (originalIndex === this.#currentOriginalIndex &&
        !this.#isTransitioning &&
        !this.#isDragging)
    ) {
      return;
    }
    this.#stopAutoplay();
    const newDOMIndex = this.#offsetToFirstActualSlide + originalIndex;
    this.#goToDOMIndex(newDOMIndex, true);

    if (
      this.#autoplayEnabled &&
      parseFloat(this.#speedValue) === 0 &&
      this.#originalSlides.length > 1
    ) {
      this.#startAutoplay();
    }
  };
}

customElements.define("fz-carousel", FrenzyCarousel);

export default FrenzyCarousel; // Uncomment if using ES modules
