class FrenzyCarousel extends HTMLElement {
  // Private DOM Element References
  #slot = null;
  #innerContainer = null;
  #wrapper = null;
  #prevButton = null;
  #nextButton = null;
  #dotsContainer = null;

  // Private Core State
  #originalSlides = [];
  #allSlidesInDOM = [];
  #slideOffsets = [];
  #currentOriginalIndex = 0;
  #currentDOMIndex = 0;
  #isTransitioning = false;
  #offsetToFirstActualSlide = 0;
  #numLeadingCloneSets = 2;
  #numTrailingCloneSets = 2;
  #isActive = false;

  // Private Attribute-controlled State
  #isCenteredMode = false;
  #showArrows = false;
  #showDots = false;
  #slideGapValue = "0px";
  #speedValue = "0.6s";
  #easingFunctionValue = "ease-in-out";
  #noDrag = false;

  // Private Internal Mechanics State
  #computedSlideGap = 0;
  #resizeObserver = null;

  // Private Autoplay State
  #autoplayEnabled = false;
  #autoplayIntervalValue = 3000;
  #autoplayTimerId = null;

  // Private Dragging State
  #isDragging = false;
  #dragStartX = 0;
  #dragCurrentX = 0;
  #dragStartTime = 0;
  #dragInitialWrapperX = 0;
  #dragThreshold = 50;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

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
          border-radius: inherit;
          touch-action: pan-x;
        }

        slot[name=""] {
          display: none;
        }

        .carousel-inner-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
          border-radius: inherit;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          cursor: grab;
        }
        :host([nodrag]) .carousel-inner-container {
          cursor: default;
        }
        .carousel-inner-container.dragging {
          cursor: grabbing;
        }

        .carousel-wrapper {
          display: flex;
          height: 100%;
          will-change: transform;
        }

        .carousel-wrapper > * {
          flex-shrink: 0;
          height: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .carousel-wrapper > * img {
          pointer-events: none;
        }

        .carousel-wrapper > img {
          width: auto;
          max-width: none;
          object-fit: contain;
          display: block;
        }

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
        .nav-arrow.prev {
          left: 15px;
        }
        .nav-arrow.next {
          right: 15px;
        }
        .nav-arrow.hidden,
        .nav-dots.hidden {
          display: none !important;
        }

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
        <button class="nav-arrow prev hidden" aria-label="Previous slide">
          &#10094;
        </button>
        <button class="nav-arrow next hidden" aria-label="Next slide">
          &#10095;
        </button>
        <div class="nav-dots hidden"></div>
      </div>
    `;
    const templateElement = document.createElement("template");
    templateElement.innerHTML = templateContent;
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

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
    )
      return;

    let needsUIRefresh = false;
    let needsAutoplayRestart = false;

    switch (name) {
      case "centered":
        this.#isCenteredMode = this.hasAttribute("centered");
        needsUIRefresh = true;
        break;
      case "autoplay":
        this.#autoplayEnabled = this.hasAttribute("autoplay");
        needsAutoplayRestart = true;
        break;
      case "autoplay-interval":
        const newInterval = parseInt(newValue, 10);
        this.#autoplayIntervalValue =
          !isNaN(newInterval) && newInterval > 0 ? newInterval : 3000;
        needsAutoplayRestart = true;
        break;
      case "gap":
        this.#slideGapValue = newValue || "0px";
        if (this.#wrapper) this.#wrapper.style.gap = this.#slideGapValue;
        needsUIRefresh = true;
        break;
      case "arrows":
        this.#showArrows = this.hasAttribute("arrows");
        if (this.#isActive) this.#updateNavigationVisibility();
        break;
      case "dots":
        this.#showDots = this.hasAttribute("dots");
        if (this.#isActive) this.#updateNavigationVisibility();
        break;
      case "nodrag":
        this.#noDrag = this.hasAttribute("nodrag");
        break;
      case "speed":
        this.#speedValue =
          typeof newValue === "string" && newValue.trim() !== ""
            ? newValue
            : "0.6s";
        break;
      case "easing":
        this.#easingFunctionValue =
          typeof newValue === "string" && newValue.trim() !== ""
            ? newValue
            : "ease-in-out";
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

    const images = this.querySelectorAll("img"); // Images directly in light DOM, if any
    images?.forEach((image) => (image.draggable = false));

    this.#isCenteredMode = this.hasAttribute("centered");
    this.#autoplayEnabled = this.hasAttribute("autoplay");
    this.#showArrows = this.hasAttribute("arrows");
    this.#showDots = this.hasAttribute("dots");
    this.#noDrag = this.hasAttribute("nodrag");
    this.#speedValue = this.getAttribute("speed") || "0.6s";
    this.#easingFunctionValue = this.getAttribute("easing") || "ease-in-out";
    this.#slideGapValue = this.getAttribute("gap") || "0px";
    if (this.#wrapper) this.#wrapper.style.gap = this.#slideGapValue;

    const intervalAttr = this.getAttribute("autoplay-interval");
    if (intervalAttr) {
      const parsedInterval = parseInt(intervalAttr, 10);
      if (!isNaN(parsedInterval) && parsedInterval > 0)
        this.#autoplayIntervalValue = parsedInterval;
    }

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

    this.#handleSlotChange();

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
    document.removeEventListener("mousemove", this.#onMouseMove);
    document.removeEventListener("mouseup", this.#onMouseUp);

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

    this.#wrapper.style.gap = this.getAttribute("gap") || "0px";

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
    } else if (numOriginalSlides === 1) {
      const clonedSingleSlide = this.#originalSlides[0].cloneNode(true);
      clonedSingleSlide
        .querySelectorAll("img")
        ?.forEach((img) => (img.draggable = false));
      this.#allSlidesInDOM = [clonedSingleSlide];
      this.#wrapper.appendChild(clonedSingleSlide);
      if (this.#resizeObserver) this.#resizeObserver.observe(clonedSingleSlide);
      this.#offsetToFirstActualSlide = 0;
    } else {
      this.#offsetToFirstActualSlide =
        this.#numLeadingCloneSets * numOriginalSlides;

      const processAndAddSlide = (
        originalSlide,
        type,
        originalIndexForActual,
      ) => {
        const clone = originalSlide.cloneNode(true);
        clone.querySelectorAll("img")?.forEach((img) => {
          img.draggable = false;
        });
        if (type) clone.setAttribute("data-fz-clone-type", type);
        if (originalIndexForActual !== undefined) {
          clone.setAttribute("data-fz-original-index", originalIndexForActual);
        }
        this.#wrapper.appendChild(clone);
        this.#allSlidesInDOM.push(clone);
        if (this.#resizeObserver) this.#resizeObserver.observe(clone);
      };

      for (let set = 0; set < this.#numLeadingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++) {
          processAndAddSlide(this.#originalSlides[i], `leading-set-${set}`);
        }
      }
      for (let i = 0; i < numOriginalSlides; i++) {
        processAndAddSlide(this.#originalSlides[i], null, i);
      }
      for (let set = 0; set < this.#numTrailingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++) {
          processAndAddSlide(this.#originalSlides[i], `trailing-set-${set}`);
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

  #goToDOMIndex = (domIndex, animate = true, forceNoTransition = false) => {
    if (
      !this.#isActive ||
      !this.#wrapper ||
      this.#allSlidesInDOM.length === 0 ||
      !this.#slideOffsets ||
      this.#slideOffsets.length === 0
    )
      return;

    if (this.#isTransitioning && animate && !forceNoTransition) {
      const currentTransform = window.getComputedStyle(this.#wrapper).transform;
      this.#wrapper.style.transition = "none";
      this.#wrapper.style.transform = currentTransform;
      this.#wrapper.offsetHeight;
      this.#isTransitioning = false;
    }

    if (domIndex < 0 || domIndex >= this.#slideOffsets.length) {
      domIndex = Math.max(
        0,
        Math.min(
          this.#offsetToFirstActualSlide + this.#currentOriginalIndex,
          this.#slideOffsets.length - 1,
        ),
      );
      if (domIndex < 0 || domIndex >= this.#slideOffsets.length) return;
    }

    let targetOffset;
    const viewportWidth = this.#innerContainer.offsetWidth;
    const currentSlideElement = this.#allSlidesInDOM[domIndex];
    if (!currentSlideElement) return;
    const currentSlideWidth = currentSlideElement.offsetWidth;

    if (this.#isCenteredMode && this.#originalSlides.length > 0) {
      targetOffset =
        viewportWidth / 2 -
        (this.#slideOffsets[domIndex] + currentSlideWidth / 2);
    } else {
      targetOffset = -this.#slideOffsets[domIndex];
    }

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

    if (!effectiveTransition) this.#handlePossibleInfiniteLoopJump();
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

      let jumpTargetOffset;
      const viewportWidth = this.#innerContainer.offsetWidth;
      const jumpTargetSlideElement = this.#allSlidesInDOM[newDOMTargetIdx];
      if (!jumpTargetSlideElement) return;
      const jumpTargetSlideWidth = jumpTargetSlideElement.offsetWidth;

      if (this.#isCenteredMode) {
        jumpTargetOffset =
          viewportWidth / 2 -
          (this.#slideOffsets[newDOMTargetIdx] + jumpTargetSlideWidth / 2);
      } else {
        jumpTargetOffset = -this.#slideOffsets[newDOMTargetIdx];
      }
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

  #onMouseDown = (event) => {
    if (
      event.target.closest(".nav-arrow, .dot") ||
      !this.#isActive ||
      event.button !== 0 ||
      this.#noDrag ||
      this.#originalSlides.length <= 1
    ) {
      return;
    }
    event.preventDefault();

    this.#isDragging = true;
    this.#innerContainer.classList.add("dragging");
    this.#dragStartX = event.clientX;
    this.#dragCurrentX = this.#dragStartX;
    this.#dragStartTime = Date.now();

    if (this.#isTransitioning) {
      this.#isTransitioning = false;
    }
    this.#wrapper.style.transition = "none";

    const currentTransformStyle = window.getComputedStyle(
      this.#wrapper,
    ).transform;
    if (currentTransformStyle && currentTransformStyle !== "none") {
      try {
        const matrix = new DOMMatrixReadOnly(currentTransformStyle);
        this.#dragInitialWrapperX = matrix.e;
      } catch (e) {
        if (
          this.#slideOffsets &&
          this.#slideOffsets.length > this.#currentDOMIndex
        ) {
          if (this.#isCenteredMode) {
            const viewportWidth = this.#innerContainer.offsetWidth;
            const currentSlideElement =
              this.#allSlidesInDOM[this.#currentDOMIndex];
            const currentSlideWidth = currentSlideElement
              ? currentSlideElement.offsetWidth
              : 0;
            this.#dragInitialWrapperX =
              viewportWidth / 2 -
              (this.#slideOffsets[this.#currentDOMIndex] +
                currentSlideWidth / 2);
          } else {
            this.#dragInitialWrapperX =
              -this.#slideOffsets[this.#currentDOMIndex];
          }
        } else {
          this.#dragInitialWrapperX = 0;
        }
      }
    } else {
      this.#dragInitialWrapperX = 0;
    }

    this.#stopAutoplay();

    document.addEventListener("mousemove", this.#onMouseMove);
    document.addEventListener("mouseup", this.#onMouseUp);
  };

  #onMouseMove = (event) => {
    if (!this.#isDragging || this.#noDrag) return;

    this.#dragCurrentX = event.clientX;
    const deltaX = this.#dragCurrentX - this.#dragStartX;
    this.#wrapper.style.transform = `translateX(${this.#dragInitialWrapperX + deltaX}px)`;
  };

  #onMouseUp = () => {
    if (!this.#isDragging || this.#noDrag) return;
    this.#isDragging = false;
    this.#innerContainer.classList.remove("dragging");

    document.removeEventListener("mousemove", this.#onMouseMove);
    document.removeEventListener("mouseup", this.#onMouseUp);

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

  #onTouchStart = (event) => {
    if (
      !this.#isActive ||
      this.#noDrag ||
      event.touches.length > 1 ||
      this.#originalSlides.length <= 1
    )
      return;

    const targetElement = event.target;
    if (targetElement.closest(".nav-arrow, .dot")) {
      return;
    }

    this.#isDragging = true;
    this.#dragStartX = event.touches[0].clientX;
    this.#dragCurrentX = this.#dragStartX;
    this.#dragStartTime = Date.now();

    if (this.#isTransitioning) {
      this.#isTransitioning = false;
    }
    this.#wrapper.style.transition = "none";

    const currentTransformStyle = window.getComputedStyle(
      this.#wrapper,
    ).transform;
    if (currentTransformStyle && currentTransformStyle !== "none") {
      try {
        const matrix = new DOMMatrixReadOnly(currentTransformStyle);
        this.#dragInitialWrapperX = matrix.e;
      } catch (e) {
        if (
          this.#slideOffsets &&
          this.#slideOffsets.length > this.#currentDOMIndex
        ) {
          if (this.#isCenteredMode) {
            const viewportWidth = this.#innerContainer.offsetWidth;
            const currentSlideElement =
              this.#allSlidesInDOM[this.#currentDOMIndex];
            const currentSlideWidth = currentSlideElement
              ? currentSlideElement.offsetWidth
              : 0;
            this.#dragInitialWrapperX =
              viewportWidth / 2 -
              (this.#slideOffsets[this.#currentDOMIndex] +
                currentSlideWidth / 2);
          } else {
            this.#dragInitialWrapperX =
              -this.#slideOffsets[this.#currentDOMIndex];
          }
        } else {
          this.#dragInitialWrapperX = 0;
        }
      }
    } else {
      this.#dragInitialWrapperX = 0;
    }
    this.#stopAutoplay();
  };

  #onTouchMove = (event) => {
    if (!this.#isDragging || this.#noDrag) return;
    event.preventDefault();

    this.#dragCurrentX = event.touches[0].clientX;
    const deltaX = this.#dragCurrentX - this.#dragStartX;
    this.#wrapper.style.transform = `translateX(${this.#dragInitialWrapperX + deltaX}px)`;
  };

  #onTouchEnd = () => {
    if (!this.#isDragging || this.#noDrag) return;
    this.#isDragging = false;

    const dragDistance = this.#dragCurrentX - this.#dragStartX;
    const dragDuration = Date.now() - this.#dragStartTime;
    const velocity =
      dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

    if (
      Math.abs(dragDistance) > this.#dragThreshold ||
      (Math.abs(dragDistance) > 10 && velocity > 0.25)
    ) {
      if (dragDistance < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    } else {
      this.#goToDOMIndex(this.#currentDOMIndex, true);
    }

    if (this.#autoplayEnabled && this.#originalSlides.length > 1) {
      this.#startAutoplay();
    }
  };

  nextSlide = (isAutoplay = false) => {
    if (
      this.#originalSlides.length <= 1 ||
      (this.#isTransitioning && !isAutoplay) ||
      (this.#isDragging && !isAutoplay)
    )
      return;
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
    )
      return;
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

export default FrenzyCarousel;
