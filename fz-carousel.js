// frenzy-carousel.js (Embedded with Simplified Slide Gap)
class FrenzyCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.debouncedResize = this._debounce(this._onResize.bind(this), 250);
    this._currentIndex = 0;
    this._slides = [];
    this._slideTrack = null;
    this._container = null;
    this._prevButton = null;
    this._nextButton = null;
    this._dotsContainer = null;
    this._autoplayInterval = null;
    this._isDragging = false;
    this._startX = 0;
    this._initialTrackOffset = 0;
    this._draggedDistance = 0;
    this._pointerId = null;
    this._onPointerMoveHandler = this._onPointerMove.bind(this);
    this._onPointerUpHandler = this._onPointerUp.bind(this);
  }

  static get observedAttributes() {
    return [
      "loop",
      "centered-slides",
      "slides-per-view",
      "autoplay",
      "autoplay-delay",
      "hide-arrows",
      "hide-dots",
      "slide-gap",
    ];
  }

  get loop() {
    return this.hasAttribute("loop");
  }
  get centeredSlides() {
    return this.hasAttribute("centered-slides");
  }
  get slidesPerView() {
    const attr = this.getAttribute("slides-per-view");
    const val = parseInt(attr, 10);
    return isNaN(val) || val < 1 ? 1 : val;
  }
  get autoplay() {
    return this.hasAttribute("autoplay");
  }
  get autoplayDelay() {
    const attr = this.getAttribute("autoplay-delay");
    const val = parseInt(attr, 10);
    return isNaN(val) || val < 500 ? 3000 : val;
  }
  get hideArrows() {
    return this.hasAttribute("hide-arrows");
  }
  get hideDots() {
    return this.hasAttribute("hide-dots");
  }
  get slideGap() {
    return this.getAttribute("slide-gap") || "0";
  }

  connectedCallback() {
    this._render();
    this._initializeSlides();
    this._attachEventListeners();
    this._updateControlsVisibility();
    if (this.autoplay) {
      this._startAutoplay();
    }
  }

  disconnectedCallback() {
    this._removeEventListeners();
    this._stopAutoplay();
    if (this._isDragging) {
      window.removeEventListener("pointermove", this._onPointerMoveHandler);
      window.removeEventListener("pointerup", this._onPointerUpHandler);
      window.removeEventListener("pointercancel", this._onPointerUpHandler);
      if (this._pointerId !== null && this._slideTrack) {
        try {
          this._slideTrack.releasePointerCapture(this._pointerId);
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "hide-arrows" || name === "hide-dots") {
      this._updateControlsVisibility();
    } else if (name === "autoplay") {
      if (this.autoplay) this._startAutoplay();
      else this._stopAutoplay();
    } else if (name === "autoplay-delay" && this.autoplay) {
      this._stopAutoplay();
      this._startAutoplay();
    } else {
      // For loop, centered-slides, slides-per-view, slide-gap
      // These attributes require recalculating slide positions and view.
      this._initializeSlides();
    }
  }

  // _parseCssUnitToPx method removed as it's no longer needed.

  _render() {
    this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: block; position: relative; width: 100%;
                            overflow: hidden; font-family: 'Inter', sans-serif;
                            user-select: none;
                        }
                        .carousel-container {
                            position: relative; width: 100%; height: max-content; /* Allow height to be determined by content */
                            overflow: hidden;
                            touch-action: pan-y;
                        }
                        .slide-track {
                            display: flex;
                            height: max-content; /* Allow height to be determined by content */
                            transition: transform 0.5s ease-in-out;
                            will-change: transform;
                            /* The 'gap' property will be set dynamically via JS from the 'slide-gap' attribute */
                        }
                        .slide-track.dragging {
                            transition: none !important;
                        }
                        ::slotted(*) {
                            flex-shrink: 0;
                            width: auto; /* Slides define their own width */
                            min-width: 50px; /* A sensible minimum */
                            height: 100%; /* Take full height of the track, which is max-content */
                            box-sizing: border-box;
                            display: flex; align-items: center; justify-content: center;
                            border-radius: 8px;
                        }
                        ::slotted(img) {
                            max-width: none; /* Allow image to dictate its own size if not constrained by slide wrapper */
                            width: 100%; /* If img is the direct slide, it fills its allocated space */
                            height: 100%;
                            object-fit: cover; display: block; border-radius: 8px;
                        }
                        .nav-button {
                            position: absolute; top: 50%; transform: translateY(-50%);
                            background-color: rgba(0, 0, 0, 0.5); color: white; border: none;
                            padding: 0; cursor: pointer; z-index: 10; border-radius: 50%;
                            width: 40px; height: 40px; font-size: 18px;
                            display: flex; align-items: center; justify-content: center;
                            transition: background-color 0.3s ease, opacity 0.3s ease, visibility 0s linear 0s;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        .nav-button.hidden { visibility: hidden; opacity: 0; }
                        .nav-button:hover { background-color: rgba(0, 0, 0, 0.8); }
                        .nav-button:disabled { opacity: 0.3; cursor: not-allowed; }
                        .prev { left: 15px; }
                        .next { right: 15px; }
                        .dots-container {
                            position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
                            display: flex; gap: 8px; z-index: 10;
                            transition: opacity 0.3s ease, visibility 0s linear 0s;
                        }
                        .dots-container.hidden { visibility: hidden; opacity: 0; }
                        .dot {
                            width: 10px; height: 10px; border-radius: 50%;
                            background-color: rgba(255, 255, 255, 0.5);
                            border: 1px solid rgba(0, 0, 0, 0.2);
                            cursor: pointer; transition: background-color 0.3s ease, transform 0.3s ease;
                        }
                        .dot.active { background-color: rgba(255, 255, 255, 1); transform: scale(1.2); }
                    </style>
                    <div class="carousel-container" part="container">
                        <div class="slide-track" part="track"> <slot></slot> </div>
                        <button class="nav-button prev" part="prev-button" aria-label="Previous slide">&#10094;</button>
                        <button class="nav-button next" part="next-button" aria-label="Next slide">&#10095;</button>
                        <div class="dots-container" part="dots-container"></div>
                    </div>
                `;
    this._slideTrack = this.shadowRoot.querySelector(".slide-track");
    this._container = this.shadowRoot.querySelector(".carousel-container");
    this._prevButton = this.shadowRoot.querySelector(".prev");
    this._nextButton = this.shadowRoot.querySelector(".next");
    this._dotsContainer = this.shadowRoot.querySelector(".dots-container");
  }

  _updateControlsVisibility() {
    if (this._prevButton && this._nextButton) {
      const shouldHideArrows = this.hideArrows;
      this._prevButton.classList.toggle("hidden", shouldHideArrows);
      this._nextButton.classList.toggle("hidden", shouldHideArrows);
    }
    if (this._dotsContainer) {
      this._dotsContainer.classList.toggle("hidden", this.hideDots);
      if (this.hideDots) {
        this._dotsContainer.innerHTML = "";
      } else {
        this._createDots();
      }
    }
  }

  _initializeSlides() {
    const slot = this.shadowRoot.querySelector("slot");
    const updateSlides = () => {
      this._slides = slot
        .assignedNodes({ flatten: true })
        .filter((node) => node.nodeType === Node.ELEMENT_NODE);
      this._slides.forEach((s) => {
        // Ensure slides are visible for offsetWidth/offsetLeft calculations
        if (window.getComputedStyle(s).display === "none")
          s.style.display = "flex";
      });
      this._currentIndex =
        this._slides.length > 0
          ? Math.max(0, Math.min(this._currentIndex, this._slides.length - 1))
          : 0;

      if (!this.hideDots) {
        this._createDots();
      } else if (this._dotsContainer) {
        this._dotsContainer.innerHTML = "";
        this._dotsContainer.classList.add("hidden");
      }
      this._updateView(); // This will also apply the gap
    };
    slot.removeEventListener("slotchange", updateSlides);
    slot.addEventListener("slotchange", updateSlides);
    updateSlides();
  }

  _attachEventListeners() {
    if (this._prevButton)
      this._prevButton.addEventListener("click", this.prev.bind(this));
    if (this._nextButton)
      this._nextButton.addEventListener("click", this.next.bind(this));
    window.addEventListener("resize", this.debouncedResize);
    if (this._slideTrack)
      this._slideTrack.addEventListener(
        "pointerdown",
        this._onPointerDown.bind(this),
      );
  }

  _removeEventListeners() {
    if (this._prevButton)
      this._prevButton.removeEventListener("click", this.prev.bind(this));
    if (this._nextButton)
      this._nextButton.removeEventListener("click", this.next.bind(this));
    window.removeEventListener("resize", this.debouncedResize);
    if (this._slideTrack)
      this._slideTrack.removeEventListener(
        "pointerdown",
        this._onPointerDown.bind(this),
      );
  }

  _getSlideOffset(targetIndex) {
    // offsetLeft of a slide is relative to its offsetParent, which should be the slide-track.
    // This already accounts for preceding slides and the gap applied to the slide-track.
    if (this._slides[targetIndex]) {
      return this._slides[targetIndex].offsetLeft;
    }
    return 0;
  }

  _getTotalContentWidth() {
    // scrollWidth of the slide-track includes all slides and gaps.
    return this._slideTrack ? this._slideTrack.scrollWidth : 0;
  }

  _onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!this.loop && this._slides.length > 0 && this._container) {
      const totalContentWidth = this._getTotalContentWidth();
      const containerWidth = this._container.offsetWidth;
      if (totalContentWidth <= containerWidth + 2) {
        return;
      }
    }
    if (this._slides.length <= 1 && !this.loop) return;

    this._isDragging = true;
    this._pointerId = event.pointerId;
    this._startX = event.clientX;
    const currentTransform = window.getComputedStyle(
      this._slideTrack,
    ).transform;
    this._initialTrackOffset =
      currentTransform && currentTransform !== "none"
        ? new DOMMatrix(currentTransform).m41
        : 0;
    this._slideTrack.classList.add("dragging");
    this._slideTrack.setPointerCapture(this._pointerId);
    window.addEventListener("pointermove", this._onPointerMoveHandler);
    window.addEventListener("pointerup", this._onPointerUpHandler);
    window.addEventListener("pointercancel", this._onPointerUpHandler);
    this._stopAutoplay();
  }

  _onPointerMove(event) {
    if (!this._isDragging || event.pointerId !== this._pointerId) return;
    const currentX = event.clientX;
    this._draggedDistance = currentX - this._startX;
    const newTrackX = this._initialTrackOffset + this._draggedDistance;
    this._slideTrack.style.transform = `translateX(${newTrackX}px)`;
  }

  _onPointerUp(event) {
    if (!this._isDragging || event.pointerId !== this._pointerId) return;
    this._slideTrack.classList.remove("dragging");
    try {
      this._slideTrack.releasePointerCapture(this._pointerId);
    } catch (e) {
      /* ignore */
    }
    window.removeEventListener("pointermove", this._onPointerMoveHandler);
    window.removeEventListener("pointerup", this._onPointerUpHandler);
    window.removeEventListener("pointercancel", this._onPointerUpHandler);
    this._isDragging = false;
    this._pointerId = null;
    const dragThreshold = this._container
      ? this._container.offsetWidth / 7
      : 50; // Fallback threshold
    if (Math.abs(this._draggedDistance) > dragThreshold) {
      if (this._draggedDistance < 0) this.next();
      else this.prev();
    } else {
      this._updateView();
    }
    this._draggedDistance = 0;
    this._resetAutoplay();
  }

  _onResize() {
    this._updateView();
  }

  _updateView() {
    if (!this._slideTrack || !this._container) return;

    // Apply slide gap to the track
    this._slideTrack.style.gap = this.slideGap || "0px";

    if (this._slides.length === 0) {
      this._slideTrack.style.transform = "translateX(0px)";
      this._updateNavButtons();
      if (!this.hideDots) this._updateDots();
      return;
    }

    let targetOffset = this._getSlideOffset(this._currentIndex);
    let centeringAdjustment = 0;
    if (this.centeredSlides && this._slides[this._currentIndex]) {
      const containerWidth = this._container.offsetWidth;
      const currentSlideWidth = this._slides[this._currentIndex].offsetWidth;
      centeringAdjustment = (containerWidth - currentSlideWidth) / 2;
    }
    const finalTranslateX = -targetOffset + centeringAdjustment;
    this._slideTrack.style.transform = `translateX(${finalTranslateX}px)`;
    this._updateNavButtons();
    if (!this.hideDots) this._updateDots();
  }

  _updateNavButtons() {
    if (this.hideArrows || !this._prevButton || !this._nextButton) {
      if (this._prevButton) this._prevButton.classList.add("hidden");
      if (this._nextButton) this._nextButton.classList.add("hidden");
      return;
    }
    this._prevButton.classList.remove("hidden");
    this._nextButton.classList.remove("hidden");

    const numSlides = this._slides.length;
    if (numSlides === 0) {
      this._prevButton.disabled = true;
      this._nextButton.disabled = true;
      return;
    }
    if (this.loop) {
      const disableLoopButtons = numSlides <= 1;
      this._prevButton.disabled = disableLoopButtons;
      this._nextButton.disabled = disableLoopButtons;
    } else {
      this._prevButton.disabled = this._currentIndex === 0;
      let isAtEnd = false;
      if (this._currentIndex >= numSlides - 1) {
        isAtEnd = true;
      } else if (this._container && this._slideTrack && numSlides > 0) {
        const totalContentWidth = this._getTotalContentWidth();
        const containerWidth = this._container.offsetWidth;
        const currentTrackTransform = window.getComputedStyle(
          this._slideTrack,
        ).transform;
        let currentTrackTranslateX =
          currentTrackTransform && currentTrackTransform !== "none"
            ? new DOMMatrix(currentTrackTransform).m41
            : 0;
        if (-currentTrackTranslateX + containerWidth >= totalContentWidth - 2) {
          isAtEnd = true;
        }
      }
      this._nextButton.disabled = isAtEnd;
    }
  }

  _createDots() {
    if (this.hideDots || !this._dotsContainer) {
      if (this._dotsContainer) this._dotsContainer.innerHTML = "";
      return;
    }
    this._dotsContainer.classList.remove("hidden");
    this._dotsContainer.innerHTML = "";
    const numSlides = this._slides.length;
    let shouldHideDotsLogically =
      numSlides === 0 || (!this.loop && numSlides <= 1);
    if (!shouldHideDotsLogically && !this.loop && this._container) {
      const totalContentWidth = this._getTotalContentWidth();
      if (totalContentWidth <= this._container.offsetWidth + 2) {
        shouldHideDotsLogically = true;
      }
    }
    if (shouldHideDotsLogically) {
      this._dotsContainer.style.display = "none";
      return;
    }

    this._dotsContainer.style.display = "flex";
    for (let i = 0; i < numSlides; i++) {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => this.goTo(i));
      this._dotsContainer.appendChild(dot);
    }
    this._updateDots();
  }

  _updateDots() {
    if (this.hideDots || !this._dotsContainer || this._slides.length === 0) {
      if (this._dotsContainer) {
        this._dotsContainer.style.display = this.hideDots
          ? "none"
          : this._slides.length === 0
            ? "none"
            : "flex";
        if (this.hideDots) this._dotsContainer.innerHTML = "";
      }
      return;
    }
    const allDots = this._dotsContainer.querySelectorAll(".dot");
    if (allDots.length === 0 && this._slides.length > 0 && !this.hideDots) {
      this._createDots();
      return;
    }
    const numSlides = this._slides.length;
    let hideDotsLogic = numSlides === 0 || (!this.loop && numSlides <= 1);
    if (!hideDotsLogic && !this.loop && this._container) {
      const totalContentWidth = this._getTotalContentWidth();
      if (totalContentWidth <= this._container.offsetWidth + 2)
        hideDotsLogic = true;
    }
    this._dotsContainer.style.display =
      this.hideDots || hideDotsLogic ? "none" : "flex";
    allDots.forEach((dot, index) =>
      dot.classList.toggle("active", index === this._currentIndex),
    );
  }

  next() {
    const numSlides = this._slides.length;
    if (numSlides === 0) return;

    if (!this.loop) {
      const totalContentWidth = this._getTotalContentWidth();
      const containerWidth = this._container ? this._container.offsetWidth : 0;
      const currentTrackTransform = window.getComputedStyle(
        this._slideTrack,
      ).transform;
      let currentTrackTranslateX =
        currentTrackTransform && currentTrackTransform !== "none"
          ? new DOMMatrix(currentTrackTransform).m41
          : 0;

      // If the rightmost edge of content is already visible, don't advance
      if (
        -currentTrackTranslateX + containerWidth >= totalContentWidth - 2 &&
        this._currentIndex === numSlides - 1
      ) {
        this._updateNavButtons();
        return;
      }
    }

    if (this.loop) {
      this._currentIndex = (this._currentIndex + 1) % numSlides;
    } else if (this._currentIndex < numSlides - 1) {
      this._currentIndex++;
    } else {
      this._updateNavButtons();
      return;
    }
    this._updateView();
    this._resetAutoplay();
  }

  prev() {
    const numSlides = this._slides.length;
    if (numSlides === 0) return;
    if (this.loop) {
      this._currentIndex = (this._currentIndex - 1 + numSlides) % numSlides;
    } else if (this._currentIndex > 0) {
      this._currentIndex--;
    } else {
      this._updateNavButtons();
      return;
    }
    this._updateView();
    this._resetAutoplay();
  }

  goTo(index) {
    const numSlides = this._slides.length;
    if (numSlides === 0 || index < 0 || index >= numSlides) return;
    this._currentIndex = index;
    this._updateView();
    this._resetAutoplay();
  }

  _startAutoplay() {
    if (!this.autoplay || this._slides.length <= 1) return;
    if (!this.loop && this._container) {
      const totalContentWidth = this._getTotalContentWidth();
      if (totalContentWidth <= this._container.offsetWidth + 2) return;
    }
    this._stopAutoplay();
    this._autoplayInterval = setInterval(() => this.next(), this.autoplayDelay);
  }

  _stopAutoplay() {
    if (this._autoplayInterval) {
      clearInterval(this._autoplayInterval);
      this._autoplayInterval = null;
    }
  }
  _resetAutoplay() {
    if (this.autoplay && !this._isDragging) {
      this._stopAutoplay();
      this._startAutoplay();
    }
  }

  _debounce(func, wait) {
    let timeout;
    return (...args) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
customElements.define("fz-carousel", FrenzyCarousel);
