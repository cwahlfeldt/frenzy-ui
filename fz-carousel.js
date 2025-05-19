class FrenzyCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Define the template content directly as a string
    const templateContent = /*html*/ `
      <style>
        :host {
          --fz-arrow-bg: rgba(0, 0, 0, 0.6);
          --fz-arrow-color: white;
          --fz-dot-color: rgba(255, 255, 255, 0.5);
          --fz-dot-active-color: white;
          
          display: block;
          position: relative;
          width: 100%;
          height: 100%;

          border-radius: inherit;
          touch-action: pan-y;
        }

        slot[name=""] {
          display: none;
        } /* Default slot is hidden, content processed by JS */

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
          transition: background-color 0.2s ease, opacity 0.3s ease;
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
          transition: background-color 0.3s ease, transform 0.2s ease;
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

    // Create a template element and set its innerHTML
    const templateElement = document.createElement("template");
    templateElement.innerHTML = templateContent;
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this._slot = this.shadowRoot.querySelector("slot");
    this._innerContainer = this.shadowRoot.querySelector(
      ".carousel-inner-container"
    );
    this._wrapper = this.shadowRoot.querySelector(".carousel-wrapper");
    this._prevButton = this.shadowRoot.querySelector(".nav-arrow.prev");
    this._nextButton = this.shadowRoot.querySelector(".nav-arrow.next");
    this._dotsContainer = this.shadowRoot.querySelector(".nav-dots");

    this._originalSlides = [];
    this._allSlidesInDOM = [];
    this._slideOffsets = [];
    this._currentOriginalIndex = 0;
    this._currentDOMIndex = 0;
    this._isTransitioning = false;
    this._offsetToFirstActualSlide = 0;
    this._numLeadingCloneSets = 2;
    this._numTrailingCloneSets = 2;
    this._isActive = false;
    this._isCenteredMode = false;
    this._showArrows = false;
    this._showDots = false;
    this._slideGapValue = "0px";
    this._speedValue = "0.6s";
    this._easingFunctionValue = "ease-in-out";
    this._noDrag = false;
    this._computedSlideGap = 0;
    this._resizeObserver = null;
    this._autoplayEnabled = false;
    this._autoplayIntervalValue = 3000;
    this._autoplayTimerId = null;
    this._isDragging = false;
    this._dragStartX = 0;
    this._dragCurrentX = 0;
    this._dragStartTime = 0;
    this._dragInitialWrapperX = 0;
    this._dragThreshold = 50;

    this._boundOnMouseMove = this._onMouseMove.bind(this);
    this._boundOnMouseUp = this._onMouseUp.bind(this);
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
    // console.log(`FrenzyCarousel: Attribute changed: ${name}, oldValue: ${oldValue}, newValue: ${newValue}, isActive: ${this._isActive}`);
    if (
      oldValue === newValue &&
      !["nodrag", "autoplay", "arrows", "dots", "centered"].includes(name)
    )
      return;

    let needsUIRefresh = false;
    let needsAutoplayRestart = false;

    switch (name) {
      case "centered":
        this._isCenteredMode = this.hasAttribute("centered");
        needsUIRefresh = true;
        break;
      case "autoplay":
        this._autoplayEnabled = this.hasAttribute("autoplay");
        needsAutoplayRestart = true;
        break;
      case "autoplay-interval":
        const newInterval = parseInt(newValue, 10);
        this._autoplayIntervalValue =
          !isNaN(newInterval) && newInterval > 0 ? newInterval : 3000;
        needsAutoplayRestart = true;
        break;
      case "gap":
        this._slideGapValue = newValue || "0px";
        if (this._wrapper) this._wrapper.style.gap = this._slideGapValue;
        needsUIRefresh = true;
        break;
      case "arrows":
        this._showArrows = this.hasAttribute("arrows");
        if (this._isActive) this._updateNavigationVisibility();
        break;
      case "dots":
        this._showDots = this.hasAttribute("dots");
        if (this._isActive) this._updateNavigationVisibility();
        break;
      case "nodrag":
        this._noDrag = this.hasAttribute("nodrag");
        break;
      case "speed":
        this._speedValue =
          typeof newValue === "string" && newValue.trim() !== ""
            ? newValue
            : "0.6s";
        break;
      case "easing":
        this._easingFunctionValue =
          typeof newValue === "string" && newValue.trim() !== ""
            ? newValue
            : "ease-in-out";
        break;
    }

    if (this._isActive) {
      if (needsUIRefresh) {
        requestAnimationFrame(() => {
          this._calculateSlideWidthsAndOffsets();
          this._goToDOMIndex(this._currentDOMIndex, false, true);
        });
      }
      if (needsAutoplayRestart) {
        this._handleAutoplay();
      }
    }
  }

  connectedCallback() {
    // console.log('FrenzyCarousel: connectedCallback entered.');
    if (!this._slot) {
      // console.error("FrenzyCarousel: Slot not found in connectedCallback.");
      return;
    }

    const images = this.querySelectorAll("img");
    if (images && images.length > 0) {
      images.forEach((image) => (image.draggable = false));
    }

    this._isCenteredMode = this.hasAttribute("centered");
    this._autoplayEnabled = this.hasAttribute("autoplay");
    this._showArrows = this.hasAttribute("arrows");
    this._showDots = this.hasAttribute("dots");
    this._noDrag = this.hasAttribute("nodrag");
    this._speedValue = this.getAttribute("speed") || "0.6s";
    this._easingFunctionValue = this.getAttribute("easing") || "ease-in-out";
    this._slideGapValue = this.getAttribute("gap") || "0px";
    if (this._wrapper) this._wrapper.style.gap = this._slideGapValue;

    const intervalAttr = this.getAttribute("autoplay-interval");
    if (intervalAttr) {
      const parsedInterval = parseInt(intervalAttr, 10);
      if (!isNaN(parsedInterval) && parsedInterval > 0)
        this._autoplayIntervalValue = parsedInterval;
    }

    this._slot.addEventListener(
      "slotchange",
      this._handleSlotChange.bind(this)
    );
    this._prevButton.addEventListener("click", this.prevSlide.bind(this));
    this._nextButton.addEventListener("click", this.nextSlide.bind(this));
    this._wrapper.addEventListener(
      "transitionend",
      this._onTransitionEnd.bind(this)
    );

    this._innerContainer.addEventListener(
      "touchstart",
      this._onTouchStart.bind(this),
      { passive: true }
    );
    this._innerContainer.addEventListener(
      "touchmove",
      this._onTouchMove.bind(this),
      { passive: false }
    );
    this._innerContainer.addEventListener(
      "touchend",
      this._onTouchEnd.bind(this)
    );
    this._innerContainer.addEventListener(
      "touchcancel",
      this._onTouchEnd.bind(this)
    );
    this._innerContainer.addEventListener(
      "mousedown",
      this._onMouseDown.bind(this)
    );

    this._handleSlotChange();

    this._resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (
          entry.target === this ||
          this._allSlidesInDOM.some((slide) => slide === entry.target)
        ) {
          requestAnimationFrame(() => {
            this._calculateSlideWidthsAndOffsets();
            this._goToDOMIndex(this._currentDOMIndex, false, true);
          });
        }
      }
    });
    this._resizeObserver.observe(this);
    // console.log('FrenzyCarousel: connectedCallback finished.');
  }

  disconnectedCallback() {
    // console.log('FrenzyCarousel: disconnectedCallback entered.');
    if (this._slot)
      this._slot.removeEventListener(
        "slotchange",
        this._handleSlotChange.bind(this)
      );
    if (this._prevButton)
      this._prevButton.removeEventListener("click", this.prevSlide.bind(this));
    if (this._nextButton)
      this._nextButton.removeEventListener("click", this.nextSlide.bind(this));
    if (this._wrapper)
      this._wrapper.removeEventListener(
        "transitionend",
        this._onTransitionEnd.bind(this)
      );

    if (this._innerContainer) {
      this._innerContainer.removeEventListener(
        "touchstart",
        this._onTouchStart.bind(this)
      );
      this._innerContainer.removeEventListener(
        "touchmove",
        this._onTouchMove.bind(this)
      );
      this._innerContainer.removeEventListener(
        "touchend",
        this._onTouchEnd.bind(this)
      );
      this._innerContainer.removeEventListener(
        "touchcancel",
        this._onTouchEnd.bind(this)
      );
      this._innerContainer.removeEventListener(
        "mousedown",
        this._onMouseDown.bind(this)
      );
    }
    document.removeEventListener("mousemove", this._boundOnMouseMove);
    document.removeEventListener("mouseup", this._boundOnMouseUp);

    if (this._resizeObserver) {
      this._allSlidesInDOM.forEach((slide) =>
        this._resizeObserver.unobserve(slide)
      );
      this._resizeObserver.unobserve(this);
      this._resizeObserver.disconnect();
    }
    if (this._wrapper) this._wrapper.innerHTML = "";
    this._originalSlides = [];
    this._allSlidesInDOM = [];
    this._isActive = false;
    this._stopAutoplay();
    // console.log('FrenzyCarousel: disconnectedCallback finished.');
  }

  _handleSlotChange() {
    // console.log('FrenzyCarousel: _handleSlotChange entered.');
    this._originalSlides = this._slot.assignedElements({
      flatten: true,
    });
    this._currentOriginalIndex = 0;
    this._setupCarousel();
  }

  _setupCarousel() {
    // console.log('FrenzyCarousel: _setupCarousel entered.');
    this._isActive = false;
    this._stopAutoplay();
    if (!this._wrapper || !this._originalSlides) {
      // console.error("FrenzyCarousel: Wrapper or originalSlides not available in _setupCarousel.");
      return;
    }
    this._wrapper.style.gap = this.getAttribute("gap") || "0px";

    if (this._resizeObserver)
      this._allSlidesInDOM.forEach((slide) =>
        this._resizeObserver.unobserve(slide)
      );
    this._wrapper.innerHTML = "";
    this._allSlidesInDOM = [];

    const numOriginalSlides = this._originalSlides.length;

    if (numOriginalSlides === 0) {
      this._slideOffsets = [0];
      this._offsetToFirstActualSlide = 0;
    } else if (numOriginalSlides === 1) {
      const clonedSingleSlide = this._originalSlides[0].cloneNode(true);
      clonedSingleSlide
        .querySelectorAll("img")
        .forEach((img) => (img.draggable = false));
      this._allSlidesInDOM = [clonedSingleSlide];
      this._wrapper.appendChild(clonedSingleSlide);
      if (this._resizeObserver) this._resizeObserver.observe(clonedSingleSlide);
      this._offsetToFirstActualSlide = 0;
    } else {
      this._offsetToFirstActualSlide =
        this._numLeadingCloneSets * numOriginalSlides;
      const processAndAddSlide = (
        originalSlide,
        type,
        originalIndexForActual
      ) => {
        const clone = originalSlide.cloneNode(true);
        clone.querySelectorAll("img").forEach((img) => {
          img.draggable = false;
        });
        if (type) clone.setAttribute("data-fz-clone-type", type);
        if (originalIndexForActual !== undefined)
          clone.setAttribute("data-fz-original-index", originalIndexForActual);
        this._wrapper.appendChild(clone);
        this._allSlidesInDOM.push(clone);
        if (this._resizeObserver) this._resizeObserver.observe(clone);
      };

      for (let set = 0; set < this._numLeadingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++)
          processAndAddSlide(this._originalSlides[i], `leading-set-${set}`);
      }
      for (let i = 0; i < numOriginalSlides; i++)
        processAndAddSlide(this._originalSlides[i], null, i);
      for (let set = 0; set < this._numTrailingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++)
          processAndAddSlide(this._originalSlides[i], `trailing-set-${set}`);
      }
    }

    this._setupDots();
    this._updateNavigationVisibility();

    requestAnimationFrame(() => {
      this._calculateSlideWidthsAndOffsets();
      this._currentOriginalIndex = 0;
      this._currentDOMIndex = this._offsetToFirstActualSlide;
      if (numOriginalSlides > 0)
        this._goToDOMIndex(this._currentDOMIndex, false, true);
      this._isActive = true;
      // console.log('FrenzyCarousel: Carousel setup complete. isActive:', this._isActive);
      this._handleAutoplay();
    });
  }

  _updateNavigationVisibility() {
    const hasMultipleSlides = this._originalSlides.length > 1;
    // console.log(`FrenzyCarousel: Updating nav visibility: showArrows=${this._showArrows}, showDots=${this._showDots}, multipleSlides=${hasMultipleSlides}`);
    if (this._prevButton)
      this._prevButton.classList.toggle(
        "hidden",
        !(this._showArrows && hasMultipleSlides)
      );
    if (this._nextButton)
      this._nextButton.classList.toggle(
        "hidden",
        !(this._showArrows && hasMultipleSlides)
      );
    if (this._dotsContainer)
      this._dotsContainer.classList.toggle(
        "hidden",
        !(this._showDots && hasMultipleSlides)
      );
  }

  _calculateSlideWidthsAndOffsets() {
    if (!this._wrapper || this._allSlidesInDOM.length === 0) {
      this._slideOffsets = [];
      this._computedSlideGap = 0;
      return;
    }
    this._computedSlideGap =
      parseFloat(window.getComputedStyle(this._wrapper).gap) || 0;
    this._slideOffsets = [];
    let currentOffset = 0;
    this._allSlidesInDOM.forEach((slide, index) => {
      this._slideOffsets.push(currentOffset);
      currentOffset += slide.offsetWidth;
      if (index < this._allSlidesInDOM.length - 1)
        currentOffset += this._computedSlideGap;
    });
    // console.log('FrenzyCarousel: Calculated slide offsets:', this._slideOffsets, 'Computed gap:', this._computedSlideGap);
  }

  _setupDots() {
    this._dotsContainer.innerHTML = "";
    if (this._originalSlides.length <= 1) return;
    this._originalSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => this.goToSlide(index));
      this._dotsContainer.appendChild(dot);
    });
  }

  _updateDots() {
    if (
      this._originalSlides.length <= 1 ||
      !this._dotsContainer ||
      !this._showDots
    )
      return;
    const dots = this._dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this._currentOriginalIndex);
    });
  }

  _goToDOMIndex(domIndex, animate = true, forceNoTransition = false) {
    // console.log(`FrenzyCarousel: _goToDOMIndex called. domIndex: ${domIndex}, animate: ${animate}, forceNoTransition: ${forceNoTransition}, isActive: ${this._isActive}`);
    if (
      !this._isActive ||
      !this._wrapper ||
      this._allSlidesInDOM.length === 0 ||
      !this._slideOffsets ||
      this._slideOffsets.length === 0
    )
      return;

    if (this._isTransitioning && animate && !forceNoTransition) {
      // console.log('FrenzyCarousel: Interrupting existing transition');
      const currentTransform = window.getComputedStyle(this._wrapper).transform;
      this._wrapper.style.transition = "none";
      this._wrapper.style.transform = currentTransform;
      // eslint-disable-next-line no-unused-expressions
      this._wrapper.offsetHeight;
      this._isTransitioning = false;
    }

    if (domIndex < 0 || domIndex >= this._slideOffsets.length) {
      domIndex = Math.max(
        0,
        Math.min(
          this._offsetToFirstActualSlide + this._currentOriginalIndex,
          this._slideOffsets.length - 1
        )
      );
      if (domIndex < 0 || domIndex >= this._slideOffsets.length) return;
    }

    let targetOffset;
    const viewportWidth = this._innerContainer.offsetWidth;
    const currentSlideElement = this._allSlidesInDOM[domIndex];
    if (!currentSlideElement) return;
    const currentSlideWidth = currentSlideElement.offsetWidth;

    if (this._isCenteredMode && this._originalSlides.length > 0) {
      targetOffset =
        viewportWidth / 2 -
        (this._slideOffsets[domIndex] + currentSlideWidth / 2);
    } else {
      targetOffset = -this._slideOffsets[domIndex];
    }

    this._currentDOMIndex = domIndex;
    const effectiveTransition =
      animate && !forceNoTransition && parseFloat(this._speedValue) > 0;
    // console.log(`FrenzyCarousel: Effective transition: ${effectiveTransition}, Speed: ${this._speedValue}, Easing: ${this._easingFunctionValue}`);

    if (effectiveTransition) {
      this._wrapper.style.transition = `transform ${this._speedValue} ${this._easingFunctionValue}`;
      this._isTransitioning = true;
    } else {
      this._wrapper.style.transition = "none";
      this._isTransitioning = false;
      if (!forceNoTransition) {
        // eslint-disable-next-line no-unused-expressions
        this._wrapper.offsetHeight;
      }
    }
    this._wrapper.style.transform = `translateX(${targetOffset}px)`;
    // console.log(`FrenzyCarousel: Transform set to: translateX(${targetOffset}px)`);

    if (!effectiveTransition) this._handlePossibleInfiniteLoopJump();
  }

  _handlePossibleInfiniteLoopJump() {
    // console.log(`FrenzyCarousel: _handlePossibleInfiniteLoopJump. isTransitioning: ${this._isTransitioning}, speed: ${this._speedValue}`);
    if (this._isTransitioning && parseFloat(this._speedValue) > 0) return;

    const numOriginal = this._originalSlides.length;
    if (numOriginal <= 1) {
      this._updateDots();
      return;
    }

    const currentDOM = this._currentDOMIndex;
    let jumpNeeded = false;
    let newOriginalIdx = this._currentOriginalIndex;
    let newDOMTargetIdx = this._currentDOMIndex;

    const startOfOriginalSet = this._offsetToFirstActualSlide;
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
      // console.log(`FrenzyCarousel: Jump needed. New original index: ${newOriginalIdx}, new DOM index: ${newDOMTargetIdx}`);
      this._wrapper.style.transition = "none";
      // eslint-disable-next-line no-unused-expressions
      this._wrapper.offsetHeight;

      let jumpTargetOffset;
      const viewportWidth = this._innerContainer.offsetWidth;
      const jumpTargetSlideElement = this._allSlidesInDOM[newDOMTargetIdx];
      if (!jumpTargetSlideElement) return;
      const jumpTargetSlideWidth = jumpTargetSlideElement.offsetWidth;

      if (this._isCenteredMode) {
        jumpTargetOffset =
          viewportWidth / 2 -
          (this._slideOffsets[newDOMTargetIdx] + jumpTargetSlideWidth / 2);
      } else {
        jumpTargetOffset = -this._slideOffsets[newDOMTargetIdx];
      }
      this._wrapper.style.transform = `translateX(${jumpTargetOffset}px)`;

      this._currentDOMIndex = newDOMTargetIdx;
      this._currentOriginalIndex = newOriginalIdx;
    } else {
      if (
        currentDOM >= startOfOriginalSet &&
        currentDOM < startOfTrailingCloneRegion
      ) {
        this._currentOriginalIndex = currentDOM - startOfOriginalSet;
      }
    }
    this._updateDots();
  }

  _onTransitionEnd(event) {
    // console.log('FrenzyCarousel: Transition ended. Target:', event.target, 'isTransitioning:', this._isTransitioning);
    if (event.target !== this._wrapper || !this._isTransitioning) return;
    this._isTransitioning = false;
    this._handlePossibleInfiniteLoopJump();
    if (this._autoplayEnabled && this._originalSlides.length > 1)
      this._startAutoplay();
  }

  _startAutoplay() {
    this._stopAutoplay();
    if (
      this._autoplayEnabled &&
      this._originalSlides.length > 1 &&
      this._isActive
    ) {
      // console.log(`FrenzyCarousel: Starting autoplay. Interval: ${this._autoplayIntervalValue}`);
      this._autoplayTimerId = setTimeout(
        () => this.nextSlide(true),
        this._autoplayIntervalValue
      );
    }
  }
  _stopAutoplay() {
    if (this._autoplayTimerId) clearTimeout(this._autoplayTimerId);
    this._autoplayTimerId = null;
    // console.log('FrenzyCarousel: Autoplay stopped.');
  }
  _handleAutoplay() {
    if (
      this._autoplayEnabled &&
      this._originalSlides.length > 1 &&
      this._isActive
    )
      this._startAutoplay();
    else this._stopAutoplay();
  }

  // --- Dragging Logic ---
  _onMouseDown(event) {
    if (
      event.target.classList.contains("nav-arrow") ||
      event.target.classList.contains("dot") ||
      !this._isActive ||
      event.button !== 0 ||
      this._noDrag ||
      this._originalSlides.length <= 1
    )
      return;

    console.log("fuck");

    try {
      this._isDragging = true;
      this._innerContainer.classList.add("dragging");
      this._dragStartX = event.clientX;
      this._dragCurrentX = this._dragStartX;
      this._dragStartTime = Date.now();

      if (this._isTransitioning) {
        this._isTransitioning = false;
      }
      this._wrapper.style.transition = "none";

      const currentTransformStyle = window.getComputedStyle(
        this._wrapper
      ).transform;
      if (currentTransformStyle && currentTransformStyle !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(currentTransformStyle);
          this._dragInitialWrapperX = matrix.e;
        } catch (e) {
          if (
            this._slideOffsets &&
            this._slideOffsets.length > this._currentDOMIndex
          ) {
            if (this._isCenteredMode) {
              const viewportWidth = this._innerContainer.offsetWidth;
              const currentSlideElement =
                this._allSlidesInDOM[this._currentDOMIndex];
              const currentSlideWidth = currentSlideElement
                ? currentSlideElement.offsetWidth
                : 0;
              this._dragInitialWrapperX =
                viewportWidth / 2 -
                (this._slideOffsets[this._currentDOMIndex] +
                  currentSlideWidth / 2);
            } else {
              this._dragInitialWrapperX =
                -this._slideOffsets[this._currentDOMIndex];
            }
          } else {
            this._dragInitialWrapperX = 0;
          }
        }
      } else {
        this._dragInitialWrapperX = 0;
      }
      // console.log('FrenzyCarousel: Mouse Drag Start X:', this._dragStartX, 'Initial Wrapper X:', this._dragInitialWrapperX);
      this._stopAutoplay();

      document.addEventListener("mousemove", this._boundOnMouseMove);
      document.addEventListener("mouseup", this._boundOnMouseUp);
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onMouseDown:", e);
      this._isDragging = false;
      this._innerContainer.classList.remove("dragging");
    }
  }

  _onMouseMove(event) {
    if (!this._isDragging || this._noDrag) return;
    try {
      this._dragCurrentX = event.clientX;
      const deltaX = this._dragCurrentX - this._dragStartX;
      // console.log('FrenzyCarousel: Mouse Drag Move Delta X:', deltaX, 'New Wrapper X:', this._dragInitialWrapperX + deltaX);
      this._wrapper.style.transform = `translateX(${
        this._dragInitialWrapperX + deltaX
      }px)`;
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onMouseMove:", e);
      this._isDragging = false;
      this._innerContainer.classList.remove("dragging");
      document.removeEventListener("mousemove", this._boundOnMouseMove);
      document.removeEventListener("mouseup", this._boundOnMouseUp);
    }
  }

  _onMouseUp(event) {
    if (!this._isDragging || this._noDrag) return;
    this._isDragging = false;
    this._innerContainer.classList.remove("dragging");

    document.removeEventListener("mousemove", this._boundOnMouseMove);
    document.removeEventListener("mouseup", this._boundOnMouseUp);

    try {
      const dragDistance = this._dragCurrentX - this._dragStartX;
      const dragDuration = Date.now() - this._dragStartTime;
      // console.log('FrenzyCarousel: Mouse Drag End. Distance:', dragDistance, 'Duration:', dragDuration);

      const velocity =
        dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

      if (
        Math.abs(dragDistance) > this._dragThreshold ||
        (Math.abs(dragDistance) > 10 && velocity > 0.25)
      ) {
        if (dragDistance < 0) this.nextSlide();
        else this.prevSlide();
      } else {
        this._goToDOMIndex(this._currentDOMIndex, true);
      }
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onMouseUp:", e);
      this._goToDOMIndex(this._currentDOMIndex, true);
    } finally {
      if (this._autoplayEnabled && this._originalSlides.length > 1)
        this._startAutoplay();
    }
  }

  _onTouchStart(event) {
    // console.log('FrenzyCarousel: Touch Start', { noDrag: this._noDrag, touches: event.touches.length, slides: this._originalSlides.length, isActive: this._isActive });
    if (
      !this._isActive ||
      this._noDrag ||
      event.touches.length > 1 ||
      this._originalSlides.length <= 1
    )
      return;

    try {
      this._isDragging = true;
      this._dragStartX = event.touches[0].clientX;
      this._dragCurrentX = this._dragStartX;
      this._dragStartTime = Date.now();

      if (this._isTransitioning) {
        this._isTransitioning = false;
      }
      this._wrapper.style.transition = "none";

      const currentTransformStyle = window.getComputedStyle(
        this._wrapper
      ).transform;
      if (currentTransformStyle && currentTransformStyle !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(currentTransformStyle);
          this._dragInitialWrapperX = matrix.e;
        } catch (e) {
          // console.warn("FrenzyCarousel: Could not parse existing transform matrix on touch start. Using current slide offset.", e);
          if (
            this._slideOffsets &&
            this._slideOffsets.length > this._currentDOMIndex
          ) {
            if (this._isCenteredMode) {
              const viewportWidth = this._innerContainer.offsetWidth;
              const currentSlideElement =
                this._allSlidesInDOM[this._currentDOMIndex];
              const currentSlideWidth = currentSlideElement
                ? currentSlideElement.offsetWidth
                : 0;
              this._dragInitialWrapperX =
                viewportWidth / 2 -
                (this._slideOffsets[this._currentDOMIndex] +
                  currentSlideWidth / 2);
            } else {
              this._dragInitialWrapperX =
                -this._slideOffsets[this._currentDOMIndex];
            }
          } else {
            this._dragInitialWrapperX = 0;
          }
        }
      } else {
        this._dragInitialWrapperX = 0;
      }
      // console.log('FrenzyCarousel: Touch Drag Start X:', this._dragStartX, 'Initial Wrapper X:', this._dragInitialWrapperX);
      this._stopAutoplay();
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onTouchStart:", e);
      this._isDragging = false;
    }
  }

  _onTouchMove(event) {
    if (!this._isDragging || this._noDrag) return;
    try {
      event.preventDefault();
      this._dragCurrentX = event.touches[0].clientX;
      const deltaX = this._dragCurrentX - this._dragStartX;
      // console.log('FrenzyCarousel: Touch Drag Move Delta X:', deltaX, 'New Wrapper X:', this._dragInitialWrapperX + deltaX);
      this._wrapper.style.transform = `translateX(${
        this._dragInitialWrapperX + deltaX
      }px)`;
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onTouchMove:", e);
      this._isDragging = false;
    }
  }

  _onTouchEnd(event) {
    if (!this._isDragging || this._noDrag) return;
    this._isDragging = false;

    try {
      const dragDistance = this._dragCurrentX - this._dragStartX;
      const dragDuration = Date.now() - this._dragStartTime;
      // console.log('FrenzyCarousel: Touch Drag End. Distance:', dragDistance, 'Duration:', dragDuration);

      const velocity =
        dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

      if (
        Math.abs(dragDistance) > this._dragThreshold ||
        (Math.abs(dragDistance) > 10 && velocity > 0.25)
      ) {
        if (dragDistance < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      } else {
        this._goToDOMIndex(this._currentDOMIndex, true);
      }
    } catch (e) {
      // console.error("FrenzyCarousel: Error in _onTouchEnd:", e);
      this._goToDOMIndex(this._currentDOMIndex, true);
    } finally {
      if (this._autoplayEnabled && this._originalSlides.length > 1) {
        this._startAutoplay();
      }
    }
  }

  // Navigation Methods
  nextSlide(isAutoplay = false) {
    if (
      this._originalSlides.length <= 1 &&
      !this._isTransitioning &&
      !this._isDragging
    )
      return;
    if (!isAutoplay && !this._isDragging) this._stopAutoplay();

    const newDOMIndex = this._currentDOMIndex + 1;
    this._currentOriginalIndex =
      (this._currentOriginalIndex + 1) % this._originalSlides.length;
    this._goToDOMIndex(newDOMIndex, true);
    if (parseFloat(this._speedValue) > 0) this._updateDots();

    if (
      !isAutoplay &&
      this._autoplayEnabled &&
      parseFloat(this._speedValue) === 0 &&
      this._originalSlides.length > 1
    ) {
      this._startAutoplay();
    }
  }

  prevSlide() {
    if (
      this._originalSlides.length <= 1 &&
      !this._isTransitioning &&
      !this._isDragging
    )
      return;
    this._stopAutoplay();
    const newDOMIndex = this._currentDOMIndex - 1;
    this._currentOriginalIndex =
      (this._currentOriginalIndex - 1 + this._originalSlides.length) %
      this._originalSlides.length;
    this._goToDOMIndex(newDOMIndex, true);
    if (parseFloat(this._speedValue) > 0) this._updateDots();

    if (
      this._autoplayEnabled &&
      parseFloat(this._speedValue) === 0 &&
      this._originalSlides.length > 1
    ) {
      this._startAutoplay();
    }
  }

  goToSlide(originalIndex) {
    if (
      originalIndex < 0 ||
      originalIndex >= this._originalSlides.length ||
      (originalIndex === this._currentOriginalIndex &&
        !this._isTransitioning &&
        !this._isDragging)
    ) {
      return;
    }
    this._stopAutoplay();
    this._currentOriginalIndex = originalIndex;
    const newDOMIndex =
      this._offsetToFirstActualSlide + this._currentOriginalIndex;
    this._goToDOMIndex(newDOMIndex, true);
    if (parseFloat(this._speedValue) > 0) this._updateDots();

    if (
      this._autoplayEnabled &&
      parseFloat(this._speedValue) === 0 &&
      this._originalSlides.length > 1
    ) {
      this._startAutoplay();
    }
  }
}

if (!customElements.get("fz-color-picker")) {
  customElements.define("fz-carousel", FrenzyCarousel);
}

export default FrenzyCarousel;
