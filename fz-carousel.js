class FrenzyCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Define the template content directly as a string
    const templateContent = /*html*/ `
      <style>
        
        @import url("/wp-content/themes/surfaces/assets/css/theme.util.css");

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

        .carousel-wrapper > ::slotted(*), /* Style slotted elements directly if they are direct children */
        .carousel-wrapper > * { /* Fallback for cloned elements not going through slot */
          flex-shrink: 0;
          height: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
          position: relative;
          display: flex;
          align-items: start;
          justify-content: start;
          overflow: hidden;
        }

        .carousel-wrapper > ::slotted(img),
        .carousel-wrapper > img {
          width: auto;
          max-width: none;
          object-fit: contain;
          display: block;
          pointer-events: none; /* Prevent dragging images */
        }
        
        /* Class for the current slide */
        .fz-current-slide {
          /* Add any specific styling for the current slide here if needed */
          /* For example: border: 2px solid blue; */
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
        

        <button class="nav-arrow prev hidden" aria-label="Previous slide" part="nav-button prev-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 44.424 76.168">
  <path id="angle-up-solid" d="M65.528,129.884a6.355,6.355,0,0,1,8.982,0l31.724,31.725a6.351,6.351,0,0,1-8.982,8.982L70.009,143.347,42.766,170.57a6.351,6.351,0,0,1-8.982-8.982l31.725-31.725Z" transform="translate(-128.025 108.094) rotate(-90)" fill="#fff"/>
</svg>
        </button>
        <button class="nav-arrow next hidden" aria-label="Next slide" part="nav-button next-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 44.424 76.168">
  <path id="angle-up-solid" d="M65.528,129.884a6.355,6.355,0,0,1,8.982,0l31.724,31.725a6.351,6.351,0,0,1-8.982,8.982L70.009,143.347,42.766,170.57a6.351,6.351,0,0,1-8.982-8.982l31.725-31.725Z" transform="translate(172.449 -31.925) rotate(90)" fill="#fff"/>
</svg>
        </button>
                </div>
        <div class="nav-dots hidden" part="dots-container"></div>
      </div>
    `;

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
    this._currentDOMIndex = 0; // Represents the index in _allSlidesInDOM that is currently targeted
    this._isTransitioning = false;
    this._offsetToFirstActualSlide = 0; // Index in _allSlidesInDOM where the first "real" (non-clone) slide begins
    this._numLeadingCloneSets = 2; // Number of full sets of original slides cloned at the beginning
    this._numTrailingCloneSets = 2; // Number of full sets of original slides cloned at the end
    this._isActive = false; // Becomes true after setupCarousel is complete
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
    this._dragThreshold = 50; // Min pixels to drag to trigger a slide change

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
          this._goToDOMIndex(this._currentDOMIndex, false, true); // Recalculate position and update classes
        });
      }
      if (needsAutoplayRestart) {
        this._handleAutoplay();
      }
    }
  }

  connectedCallback() {
    if (!this._slot) {
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

    this._handleSlotChange(); // Initial setup

    this._resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (
          entry.target === this ||
          this._allSlidesInDOM.some((slide) => slide === entry.target)
        ) {
          requestAnimationFrame(() => {
            this._calculateSlideWidthsAndOffsets();
            this._goToDOMIndex(this._currentDOMIndex, false, true); // Recalculate position and update classes
          });
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
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
  }

  _handleSlotChange() {
    this._originalSlides = this._slot.assignedElements({
      flatten: true,
    });
    // Ensure images from new slots are not draggable
    this._originalSlides.forEach(slide => {
      slide.querySelectorAll('img').forEach(img => img.draggable = false);
    });
    this._currentOriginalIndex = 0; // Reset to the first slide conceptually
    this._setupCarousel();
  }

  _setupCarousel() {
    this._isActive = false; // Mark as inactive during setup
    this._stopAutoplay();
    if (!this._wrapper || !this._originalSlides) {
      return;
    }
    this._wrapper.style.gap = this.getAttribute("gap") || "0px";

    // Unobserve previous slides if any
    if (this._resizeObserver) {
      this._allSlidesInDOM.forEach((slide) =>
        this._resizeObserver.unobserve(slide)
      );
    }
    this._wrapper.innerHTML = ""; // Clear existing slides
    this._allSlidesInDOM = []; // Reset the DOM slides array

    const numOriginalSlides = this._originalSlides.length;

    if (numOriginalSlides === 0) {
      this._slideOffsets = [0];
      this._offsetToFirstActualSlide = 0;
      this._currentDOMIndex = 0;
    } else if (numOriginalSlides === 1) {
      const clonedSingleSlide = this._originalSlides[0].cloneNode(true);
      clonedSingleSlide.setAttribute('part', 'slide original-slide-0'); // Set part for single slide
      clonedSingleSlide.setAttribute('data-fz-original-index', '0');
      clonedSingleSlide
        .querySelectorAll("img")
        .forEach((img) => (img.draggable = false));
      this._allSlidesInDOM = [clonedSingleSlide];
      this._wrapper.appendChild(clonedSingleSlide);
      if (this._resizeObserver) this._resizeObserver.observe(clonedSingleSlide);
      this._offsetToFirstActualSlide = 0;
      this._currentDOMIndex = 0;
    } else {
      // Calculate where the actual (non-cloned for looping) slides start
      this._offsetToFirstActualSlide = this._numLeadingCloneSets * numOriginalSlides;

      const processAndAddSlide = (originalSlide, type, originalIndexForActual) => {
        const clone = originalSlide.cloneNode(true);
        let parts = ['slide'];
        clone.querySelectorAll("img").forEach((img) => { img.draggable = false; });

        if (type) clone.setAttribute("data-fz-clone-type", type);
        if (originalIndexForActual !== undefined) {
          clone.setAttribute("data-fz-original-index", originalIndexForActual);
          parts.push(`original-slide-${originalIndexForActual}`);
        }
        clone.setAttribute('part', parts.join(' '));
        this._wrapper.appendChild(clone);
        this._allSlidesInDOM.push(clone);
        if (this._resizeObserver) this._resizeObserver.observe(clone);
      };

      // Add leading clones
      for (let set = 0; set < this._numLeadingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++)
          processAndAddSlide(this._originalSlides[i], `leading-set-${set}`, i); // Pass original index for clones too
      }
      // Add original slides
      for (let i = 0; i < numOriginalSlides; i++)
        processAndAddSlide(this._originalSlides[i], null, i); // 'null' type, provide originalIndex
      // Add trailing clones
      for (let set = 0; set < this._numTrailingCloneSets; set++) {
        for (let i = 0; i < numOriginalSlides; i++)
          processAndAddSlide(this._originalSlides[i], `trailing-set-${set}`, i); // Pass original index for clones too
      }
      this._currentDOMIndex = this._offsetToFirstActualSlide; // Start at the first "real" slide
    }

    this._setupDots();
    this._updateNavigationVisibility();

    requestAnimationFrame(() => {
      this._calculateSlideWidthsAndOffsets();
      // _currentOriginalIndex is already 0
      // _currentDOMIndex is set above based on numOriginalSlides
      if (numOriginalSlides > 0) {
        this._goToDOMIndex(this._currentDOMIndex, false, true); // Go to initial slide without animation, update classes
      } else {
        this._updateCurrentSlideClass(); // Handle zero slides case for classes
      }
      this._isActive = true; // Carousel is now ready
      this._handleAutoplay();
    });
  }

  /**
   * Updates the CSS class and 'part' attribute for the current slide.
   * Adds 'fz-current-slide' class and 'current-slide' part to the active slide.
   */
  _updateCurrentSlideClass() {
    if (!this._allSlidesInDOM || this._allSlidesInDOM.length === 0) {
      return;
    }
    const currentSlideClass = 'fz-current-slide';

    this._allSlidesInDOM.forEach((slide, index) => {
      const isCurrent = index === this._currentDOMIndex;
      // data-fz-original-index might not be set on clones if not explicitly copied,
      // but we still want to manage the 'slide' and 'current-slide' parts.
      const originalIndex = slide.getAttribute('data-fz-original-index');
      let parts = ['slide']; // Base part

      // Add original-slide-X part if the original index is known for this DOM element
      if (originalIndex !== null) {
        parts.push(`original-slide-${originalIndex}`);
      }

      if (isCurrent) {
        slide.classList.add(currentSlideClass);
        parts.push('current-slide');
      } else {
        slide.classList.remove(currentSlideClass);
      }
      slide.setAttribute('part', parts.join(' '));
    });
  }


  _updateNavigationVisibility() {
    const hasMultipleSlides = this._originalSlides.length > 1;
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
  }

  _setupDots() {
    this._dotsContainer.innerHTML = "";
    if (this._originalSlides.length <= 1 || !this._showDots) return; // Also check _showDots
    this._originalSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.setAttribute("part", `dot dot-${index}`);
      dot.addEventListener("click", () => this.goToSlide(index));
      this._dotsContainer.appendChild(dot);
    });
    this._updateDots(); // Initial update
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
      const isActive = index === this._currentOriginalIndex;
      dot.classList.toggle("active", isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      // Update part for active dot
      let parts = ['dot', `dot-${index}`];
      if (isActive) parts.push('active-dot');
      dot.setAttribute('part', parts.join(' '));
    });
  }

  _goToDOMIndex(domIndex, animate = true, forceNoTransition = false) {
    if (
      !this._isActive && !(animate === false && forceNoTransition === true) // Allow initial setup call
    ) return;

    if (!this._wrapper || this._allSlidesInDOM.length === 0 || !this._slideOffsets || this._slideOffsets.length === 0) {
      this._updateCurrentSlideClass(); // Ensure classes are cleared if no slides
      return;
    }


    if (this._isTransitioning && animate && !forceNoTransition) {
      const currentTransform = window.getComputedStyle(this._wrapper).transform;
      this._wrapper.style.transition = "none";
      this._wrapper.style.transform = currentTransform;
      // eslint-disable-next-line no-unused-expressions
      this._wrapper.offsetHeight; // Force reflow
      this._isTransitioning = false;
    }

    // Ensure domIndex is valid, otherwise, try to correct it based on currentOriginalIndex
    if (domIndex < 0 || domIndex >= this._allSlidesInDOM.length) {
      // Fallback to a safe index if the provided domIndex is out of bounds
      // This might happen if slides are dynamically added/removed and indices are stale
      domIndex = Math.max(0, Math.min(this._offsetToFirstActualSlide + this._currentOriginalIndex, this._allSlidesInDOM.length - 1));
      if (domIndex < 0 || domIndex >= this._allSlidesInDOM.length) { // Still invalid after correction
        this._updateCurrentSlideClass(); // Update classes based on potentially reset _currentDOMIndex
        return;
      }
    }


    let targetOffset;
    const viewportWidth = this._innerContainer.offsetWidth;
    const currentSlideElement = this._allSlidesInDOM[domIndex];
    if (!currentSlideElement) {
      this._updateCurrentSlideClass(); // Update classes if target slide doesn't exist
      return;
    }
    const currentSlideWidth = currentSlideElement.offsetWidth;

    if (this._isCenteredMode && this._originalSlides.length > 0) {
      targetOffset =
        viewportWidth / 2 -
        (this._slideOffsets[domIndex] + currentSlideWidth / 2);
    } else {
      targetOffset = -this._slideOffsets[domIndex];
    }

    this._currentDOMIndex = domIndex; // Update the current DOM index
    this._updateCurrentSlideClass();   // <<<< UPDATE SLIDE CLASSES HERE >>>>

    const effectiveTransition =
      animate && !forceNoTransition && parseFloat(this._speedValue) > 0;

    if (effectiveTransition) {
      this._wrapper.style.transition = `transform ${this._speedValue} ${this._easingFunctionValue}`;
      this._isTransitioning = true;
    } else {
      this._wrapper.style.transition = "none";
      this._isTransitioning = false;
      if (!forceNoTransition) {
        // eslint-disable-next-line no-unused-expressions
        this._wrapper.offsetHeight; // Force reflow if not a forced no-transition (e.g. initial setup)
      }
    }
    this._wrapper.style.transform = `translateX(${targetOffset}px)`;

    // If not animating (e.g., drag release, initial setup, or speed is 0), handle potential infinite loop jump immediately.
    if (!effectiveTransition) {
      this._handlePossibleInfiniteLoopJump(); // This might change _currentDOMIndex and will call _updateCurrentSlideClass again
    }
  }

  _handlePossibleInfiniteLoopJump() {
    if (this._isTransitioning && parseFloat(this._speedValue) > 0) return; // Don't jump if an animation is in progress

    const numOriginal = this._originalSlides.length;
    if (numOriginal <= 1) { // If 0 or 1 slide, no looping logic needed
      this._updateDots();
      this._updateCurrentSlideClass(); // <<<< UPDATE SLIDE CLASSES HERE >>>>
      return;
    }

    const currentDOM = this._currentDOMIndex;
    let jumpNeeded = false;
    let newOriginalIdx = this._currentOriginalIndex; // Preserve current original index by default
    let newDOMTargetIdx = this._currentDOMIndex;    // Preserve current DOM index by default

    const startOfOriginalSet = this._offsetToFirstActualSlide; // e.g., 2 * 3 = 6
    const endOfOriginalSet = startOfOriginalSet + numOriginal - 1; // e.g., 6 + 3 - 1 = 8
    const totalClonedSlidesPerSide = this._numLeadingCloneSets * numOriginal; // same as _offsetToFirstActualSlide

    // Check if currentDOM is in a leading clone area that needs to jump to the equivalent "actual" slide area
    // Example: numOriginal = 3, numLeadingCloneSets = 2. Clones: 0-5. Actuals: 6-8.
    // If currentDOM is 5 (last clone of 2nd leading set), it should map to original index 2 (slide 8 in DOM).
    if (currentDOM < startOfOriginalSet) {
      newOriginalIdx = ((startOfOriginalSet - 1 - currentDOM) % numOriginal + numOriginal) % numOriginal; // Calculate original index from end of leading clones
      newOriginalIdx = numOriginal - 1 - newOriginalIdx; // Correct the index direction
      newDOMTargetIdx = startOfOriginalSet + newOriginalIdx;
      jumpNeeded = true;
    }
    // Check if currentDOM is in a trailing clone area
    // Example: numOriginal = 3, numTrailingCloneSets = 2. Actuals: 6-8. Trailing clones start at 9.
    // If currentDOM is 9 (first clone of 1st trailing set), it should map to original index 0 (slide 6 in DOM).
    else if (currentDOM > endOfOriginalSet) {
      newOriginalIdx = (currentDOM - startOfOriginalSet) % numOriginal;
      newDOMTargetIdx = startOfOriginalSet + newOriginalIdx;
      jumpNeeded = true;
    }


    if (jumpNeeded) {
      this._wrapper.style.transition = "none"; // No animation for the jump
      // eslint-disable-next-line no-unused-expressions
      this._wrapper.offsetHeight; // Force reflow

      let jumpTargetOffset;
      const viewportWidth = this._innerContainer.offsetWidth;
      const jumpTargetSlideElement = this._allSlidesInDOM[newDOMTargetIdx];
      if (!jumpTargetSlideElement) return; // Should not happen if logic is correct
      const jumpTargetSlideWidth = jumpTargetSlideElement.offsetWidth;

      if (this._isCenteredMode) {
        jumpTargetOffset =
          viewportWidth / 2 -
          (this._slideOffsets[newDOMTargetIdx] + jumpTargetSlideWidth / 2);
      } else {
        jumpTargetOffset = -this._slideOffsets[newDOMTargetIdx];
      }
      this._wrapper.style.transform = `translateX(${jumpTargetOffset}px)`;

      this._currentDOMIndex = newDOMTargetIdx;     // Update DOM index after jump
      this._currentOriginalIndex = newOriginalIdx; // Update original index to match
    } else {
      // If no jump was needed, ensure _currentOriginalIndex is correctly derived from _currentDOMIndex
      // This is important if _goToDOMIndex was called with a DOM index directly.
      if (currentDOM >= startOfOriginalSet && currentDOM <= endOfOriginalSet) {
        this._currentOriginalIndex = currentDOM - startOfOriginalSet;
      }
      // If currentDOM is somehow outside known ranges and no jump occurred,
      // this._currentOriginalIndex might be stale. This case should ideally not be reached
      // if domIndex validation in _goToDOMIndex is robust.
    }
    this._updateDots();
    this._updateCurrentSlideClass(); // <<<< UPDATE SLIDE CLASSES HERE >>>> (after potential _currentDOMIndex change)
  }

  _onTransitionEnd(event) {
    if (event.target !== this._wrapper || !this._isTransitioning) return;
    this._isTransitioning = false;
    this._handlePossibleInfiniteLoopJump(); // This will update dots and classes
    if (this._autoplayEnabled && this._originalSlides.length > 1)
      this._startAutoplay(); // Restart autoplay if it was paused by interaction
  }

  _startAutoplay() {
    this._stopAutoplay(); // Clear any existing timer
    if (
      this._autoplayEnabled &&
      this._originalSlides.length > 1 &&
      this._isActive
    ) {
      this._autoplayTimerId = setTimeout(
        () => this.nextSlide(true), // Pass true to indicate it's an autoplay advancement
        this._autoplayIntervalValue
      );
    }
  }
  _stopAutoplay() {
    if (this._autoplayTimerId) clearTimeout(this._autoplayTimerId);
    this._autoplayTimerId = null;
  }
  _handleAutoplay() {
    if (
      this._autoplayEnabled &&
      this._originalSlides.length > 1 &&
      this._isActive
    ) {
      this._startAutoplay();
    } else {
      this._stopAutoplay();
    }
  }

  // --- Dragging Logic ---
  _onMouseDown(event) {
    if (
      event.target.closest(".nav-arrow") ||
      event.target.closest(".dot") ||
      !this._isActive ||
      event.button !== 0 || // Only main (left) button
      this._noDrag ||
      this._originalSlides.length <= 1
    )
      return;

    event.preventDefault(); // Prevent text selection or other default actions

    try {
      this._isDragging = true;
      this._innerContainer.classList.add("dragging");
      this._dragStartX = event.clientX;
      this._dragCurrentX = this._dragStartX;
      this._dragStartTime = Date.now();

      // If a transition was in progress, capture current position and stop it
      if (this._isTransitioning) {
        const currentTransform = window.getComputedStyle(this._wrapper).transform;
        this._wrapper.style.transition = "none";
        this._wrapper.style.transform = currentTransform;
        // eslint-disable-next-line no-unused-expressions
        this._wrapper.offsetHeight; // Force reflow
        this._isTransitioning = false;
      }
      this._wrapper.style.transition = "none"; // Ensure no animation during drag

      const currentTransformStyle = window.getComputedStyle(this._wrapper).transform;
      if (currentTransformStyle && currentTransformStyle !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(currentTransformStyle);
          this._dragInitialWrapperX = matrix.e;
        } catch (e) { // Fallback if DOMMatrixReadOnly is not supported or fails
          if (this._slideOffsets && this._slideOffsets.length > this._currentDOMIndex) {
            if (this._isCenteredMode) {
              const viewportWidth = this._innerContainer.offsetWidth;
              const currentSlideElement = this._allSlidesInDOM[this._currentDOMIndex];
              const currentSlideWidth = currentSlideElement ? currentSlideElement.offsetWidth : 0;
              this._dragInitialWrapperX = viewportWidth / 2 - (this._slideOffsets[this._currentDOMIndex] + currentSlideWidth / 2);
            } else {
              this._dragInitialWrapperX = -this._slideOffsets[this._currentDOMIndex];
            }
          } else {
            this._dragInitialWrapperX = 0;
          }
        }
      } else {
        this._dragInitialWrapperX = 0;
      }
      this._stopAutoplay(); // Pause autoplay during drag

      document.addEventListener("mousemove", this._boundOnMouseMove);
      document.addEventListener("mouseup", this._boundOnMouseUp);
    } catch (e) {
      this._isDragging = false; // Reset state on error
      this._innerContainer.classList.remove("dragging");
    }
  }

  _onMouseMove(event) {
    if (!this._isDragging || this._noDrag) return;
    // event.preventDefault(); // Not typically needed for mousemove if mousedown handled it.
    try {
      this._dragCurrentX = event.clientX;
      const deltaX = this._dragCurrentX - this._dragStartX;
      this._wrapper.style.transform = `translateX(${this._dragInitialWrapperX + deltaX}px)`;
    } catch (e) {
      this._isDragging = false;
      this._innerContainer.classList.remove("dragging");
      document.removeEventListener("mousemove", this._boundOnMouseMove);
      document.removeEventListener("mouseup", this._boundOnMouseUp);
    }
  }

  _onMouseUp() {
    if (!this._isDragging || this._noDrag) return;
    this._isDragging = false;
    this._innerContainer.classList.remove("dragging");

    document.removeEventListener("mousemove", this._boundOnMouseMove);
    document.removeEventListener("mouseup", this._boundOnMouseUp);

    try {
      const dragDistance = this._dragCurrentX - this._dragStartX;
      const dragDuration = Date.now() - this._dragStartTime;
      const velocity = dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

      if (
        Math.abs(dragDistance) > this._dragThreshold ||
        (Math.abs(dragDistance) > 10 && velocity > 0.25) // Shorter drag if fast
      ) {
        if (dragDistance < 0) this.nextSlide();
        else this.prevSlide();
      } else {
        // Snap back to the current slide if drag was not enough
        this._goToDOMIndex(this._currentDOMIndex, true);
      }
    } catch (e) {
      this._goToDOMIndex(this._currentDOMIndex, true); // Fallback on error
    } finally {
      // Restart autoplay only if it was enabled and not a programmatic change
      if (this._autoplayEnabled && this._originalSlides.length > 1) {
        this._startAutoplay();
      }
    }
  }

  _onTouchStart(event) {
    if (
      !this._isActive ||
      this._noDrag ||
      event.touches.length > 1 || // Only single touch
      this._originalSlides.length <= 1
    )
      return;

    // Check if the touch target is a navigation element
    const target = event.target;
    if (target.closest('.nav-arrow') || target.closest('.dot')) {
      return;
    }

    try {
      this._isDragging = true;
      // No classList.add("dragging") for touch to avoid potential style conflicts if not desired
      this._dragStartX = event.touches[0].clientX;
      this._dragCurrentX = this._dragStartX;
      this._dragStartTime = Date.now();

      if (this._isTransitioning) {
        const currentTransform = window.getComputedStyle(this._wrapper).transform;
        this._wrapper.style.transition = "none";
        this._wrapper.style.transform = currentTransform;
        // eslint-disable-next-line no-unused-expressions
        this._wrapper.offsetHeight;
        this._isTransitioning = false;
      }
      this._wrapper.style.transition = "none";

      const currentTransformStyle = window.getComputedStyle(this._wrapper).transform;
      if (currentTransformStyle && currentTransformStyle !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(currentTransformStyle);
          this._dragInitialWrapperX = matrix.e;
        } catch (e) {
          if (this._slideOffsets && this._slideOffsets.length > this._currentDOMIndex) {
            if (this._isCenteredMode) {
              const viewportWidth = this._innerContainer.offsetWidth;
              const currentSlideElement = this._allSlidesInDOM[this._currentDOMIndex];
              const currentSlideWidth = currentSlideElement ? currentSlideElement.offsetWidth : 0;
              this._dragInitialWrapperX = viewportWidth / 2 - (this._slideOffsets[this._currentDOMIndex] + currentSlideWidth / 2);
            } else {
              this._dragInitialWrapperX = -this._slideOffsets[this._currentDOMIndex];
            }
          } else {
            this._dragInitialWrapperX = 0;
          }
        }
      } else {
        this._dragInitialWrapperX = 0;
      }
      this._stopAutoplay();
    } catch (e) {
      this._isDragging = false;
    }
  }

  _onTouchMove(event) {
    if (!this._isDragging || this._noDrag) return;
    // Only prevent default if we are actually moving, to allow vertical scroll if drag is not significant
    if (Math.abs(event.touches[0].clientX - this._dragStartX) > 10) { // Threshold for preventing default
      event.preventDefault();
    }

    try {
      this._dragCurrentX = event.touches[0].clientX;
      const deltaX = this._dragCurrentX - this._dragStartX;
      this._wrapper.style.transform = `translateX(${this._dragInitialWrapperX + deltaX}px)`;
    } catch (e) {
      this._isDragging = false;
    }
  }

  _onTouchEnd() {
    if (!this._isDragging || this._noDrag) return;
    this._isDragging = false;

    try {
      const dragDistance = this._dragCurrentX - this._dragStartX;
      const dragDuration = Date.now() - this._dragStartTime;
      const velocity = dragDuration > 0 ? Math.abs(dragDistance) / dragDuration : 0;

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
        this._goToDOMIndex(this._currentDOMIndex, true); // Snap back
      }
    } catch (e) {
      this._goToDOMIndex(this._currentDOMIndex, true); // Fallback
    } finally {
      if (this._autoplayEnabled && this._originalSlides.length > 1) {
        this._startAutoplay();
      }
    }
  }

  // --- Public Navigation Methods ---
  nextSlide(isAutoplay = false) {
    if (this._originalSlides.length <= 1 || (this._isTransitioning && !isAutoplay) || this._isDragging) return;
    if (!isAutoplay) this._stopAutoplay(); // Stop user-initiated autoplay restart

    // Determine the next logical original index
    const nextOriginalIndex = (this._currentOriginalIndex + 1) % this._originalSlides.length;

    // Determine the target DOM index.
    // If we are at the "end" of the visible part of a clone set that allows smooth transition to the next actual slide,
    // we can just increment _currentDOMIndex. Otherwise, we might need a more complex jump if near actual boundaries.
    let targetDOMIndex = this._currentDOMIndex + 1;

    // If targetDOMIndex goes into the trailing clones too far, _handlePossibleInfiniteLoopJump will correct it.
    // Or, if we are at the last "actual" slide and next means wrapping to the first "actual" slide via clones.

    this._currentOriginalIndex = nextOriginalIndex; // Update conceptual original index first
    this._goToDOMIndex(targetDOMIndex, true); // Animate to the next DOM slide

    // _updateDots is called within _handlePossibleInfiniteLoopJump or _goToDOMIndex if no jump
    // If speed is 0, _goToDOMIndex calls _handlePossibleInfiniteLoopJump which calls _updateDots and _updateCurrentSlideClass
    // If speed > 0, _onTransitionEnd calls _handlePossibleInfiniteLoopJump which calls _updateDots and _updateCurrentSlideClass

    // If autoplay is advancing and speed is 0, ensure it continues
    if (isAutoplay && this._autoplayEnabled && parseFloat(this._speedValue) === 0 && this._originalSlides.length > 1) {
      this._startAutoplay(); // Re-queue for next autoplay tick
    } else if (!isAutoplay && this._autoplayEnabled && this._originalSlides.length > 1) {
      // If user navigated, restart autoplay timer from full interval
      this._startAutoplay();
    }
  }

  prevSlide() {
    if (this._originalSlides.length <= 1 || this._isTransitioning || this._isDragging) return;
    this._stopAutoplay();

    const prevOriginalIndex = (this._currentOriginalIndex - 1 + this._originalSlides.length) % this._originalSlides.length;
    let targetDOMIndex = this._currentDOMIndex - 1;

    this._currentOriginalIndex = prevOriginalIndex;
    this._goToDOMIndex(targetDOMIndex, true);

    if (this._autoplayEnabled && this._originalSlides.length > 1) {
      this._startAutoplay();
    }
  }

  goToSlide(originalIndex) {
    if (
      originalIndex < 0 ||
      originalIndex >= this._originalSlides.length ||
      (originalIndex === this._currentOriginalIndex && !this._isTransitioning && !this._isDragging)
    ) {
      return;
    }
    this._stopAutoplay();
    this._currentOriginalIndex = originalIndex;
    // Calculate the DOM index that corresponds to the start of the "actual" slide set plus the new originalIndex
    const newDOMIndex = this._offsetToFirstActualSlide + this._currentOriginalIndex;

    this._goToDOMIndex(newDOMIndex, true);

    if (this._autoplayEnabled && this._originalSlides.length > 1) {
      this._startAutoplay();
    }
  }
}

// Corrected custom element definition
if (!customElements.get("fz-carousel")) {
  customElements.define("fz-carousel", FrenzyCarousel);
}

export default FrenzyCarousel;
