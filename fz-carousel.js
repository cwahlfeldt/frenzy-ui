class FrenzyCarousel extends HTMLElement {
  #currentIndex = 0; // Can become unbounded when looping
  #slides = [];
  #slideTrack = null;
  #container = null;
  #prevButton = null;
  #nextButton = null;
  #dotsContainer = null;
  #autoplayInterval = null;
  #isDragging = false;
  #startX = 0;
  #initialTrackOffset = 0;
  #draggedDistance = 0;
  #pointerId = null;
  #slotElement = null;

  #debouncedResize = null;
  #boundPrevClickHandler = null;
  #boundNextClickHandler = null;

  #onSlotChangeHandler = null;
  #render = null;
  #attachEventListeners = null;
  #removeEventListeners = null;
  #getSlideOffset = null;
  #getTotalSlidesWidthWithGaps = null; // Renamed for clarity
  #onPointerDown = null;
  #onPointerMove = null;
  #onPointerUp = null;
  #onResize = null;
  #updateView = null;
  #updateNavButtons = null;
  #createDots = null;
  #updateDots = null;
  #startAutoplay = null;
  #stopAutoplay = null;
  #resetAutoplay = null;
  #debounce = null;
  #getActualSlideIndex = null; // Helper for looped currentIndex
  #updateArrowVisibility = null;
  #processSlides = null;
  #updateSlideAppearances = null; // For opacity and other per-slide styles

  static MIN_OPACITY = 0.4; // Opacity for adjacent slides

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

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.#debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    this.#onResize = () => {
      this.#updateView();
    };

    this.#render = () => {
      this.shadowRoot.innerHTML = /*html*/ `
        <style>
          :host { display: block; position: relative; width: 100%; overflow: hidden; font-family: "Inter", sans-serif; user-select: none; -webkit-tap-highlight-color: transparent; }
          .carousel-container { position: relative; width: 100%; height: max-content; overflow: hidden; touch-action: pan-y; }
          .slide-track {
            display: flex;
            height: max-content;
            /* Elastic transition */
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: transform;
          }
          .slide-track.dragging { transition: none !important; }
          ::slotted(*) {
            flex-shrink: 0;
            width: auto; /* Slides define their own width, or it's set by slides-per-view logic if implemented */
            min-width: 50px;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            /* Transition for opacity */
            transition: opacity 0.5s ease-out;
            opacity: ${FrenzyCarousel.MIN_OPACITY}; /* Default to minimum opacity */
          }
          ::slotted(*.active-slide) {
            opacity: 1;
          }
          ::slotted(img) { max-width: 100%; width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 8px; }
          .nav-button { position: absolute; top: 50%; transform: translateY(-50%); background-color: rgba(30, 30, 30, 0.6); color: white; border: none; padding: 0; cursor: pointer; z-index: 10; border-radius: 50%; width: 44px; height: 44px; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
          .nav-button.hidden { visibility: hidden; opacity: 0; transform: translateY(-50%) scale(0.8); }
          .nav-button:hover:not(:disabled) { background-color: rgba(0, 0, 0, 0.8); transform: translateY(-50%) scale(1.05); }
          .nav-button:active:not(:disabled) { transform: translateY(-50%) scale(0.95); }
          .nav-button:disabled { opacity: 0.3; cursor: not-allowed; background-color: rgba(50, 50, 50, 0.4); }
          .prev { left: 16px; }
          .next { right: 16px; }
          .dots-container { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 10; padding: 4px; background-color: rgba(0,0,0,0.1); border-radius: 12px; transition: opacity 0.3s ease, visibility 0s linear 0s; }
          .dots-container.hidden { visibility: hidden; opacity: 0; }
          .dots-container:empty { display: none !important; }
          .dot { width: 10px; height: 10px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(0, 0, 0, 0.1); cursor: pointer; transition: background-color 0.3s ease, transform 0.3s ease; padding: 0; }
          .dot:hover { background-color: rgba(255, 255, 255, 0.8); }
          .dot.active { background-color: white; transform: scale(1.25); border-color: rgba(0,0,0,0.3); }
        </style>
        <div class="carousel-container" part="container">
          <div class="slide-track" part="track"><slot></slot></div>
          <button class="nav-button prev" part="prev-button" aria-label="Previous slide">&#10094;</button>
          <button class="nav-button next" part="next-button" aria-label="Next slide">&#10095;</button>
          <div class="dots-container" part="dots-container"></div>
        </div>
      `;
      this.#slideTrack = this.shadowRoot.querySelector(".slide-track");
      this.#container = this.shadowRoot.querySelector(".carousel-container");
      this.#prevButton = this.shadowRoot.querySelector(".prev");
      this.#nextButton = this.shadowRoot.querySelector(".next");
      this.#dotsContainer = this.shadowRoot.querySelector(".dots-container");
    };

    this.#processSlides = () => {
      if (!this.#slotElement) return;
      this.#slides = this.#slotElement
        .assignedNodes({ flatten: true })
        .filter((node) => node.nodeType === Node.ELEMENT_NODE);
      this.#slides.forEach((slide) => {
        if (window.getComputedStyle(slide).display === "none")
          slide.style.display = "flex";
      });

      if (!this.loop) {
        // Keep currentIndex within bounds for non-looping
        this.#currentIndex = Math.max(
          0,
          Math.min(this.#currentIndex, Math.max(0, this.#slides.length - 1)),
        );
      }
      // For looping, currentIndex can be outside, #getActualSlideIndex will handle it.
      // If slides reduce, #currentIndex might be out of "optimal" range for looping,
      // but #getActualSlideIndex will map it correctly.
    };

    this.#getActualSlideIndex = (indexToWrap = this.#currentIndex) => {
      if (this.#slides.length === 0) return 0;
      const numSlides = this.#slides.length;
      return ((indexToWrap % numSlides) + numSlides) % numSlides;
    };

    this.#onSlotChangeHandler = () => {
      this.#processSlides();
      this.#updateView(); // This will update positions, nav, dots, and appearances
    };

    this.#attachEventListeners = () => {
      if (this.#prevButton)
        this.#prevButton.addEventListener("click", this.#boundPrevClickHandler);
      if (this.#nextButton)
        this.#nextButton.addEventListener("click", this.#boundNextClickHandler);
      window.addEventListener("resize", this.#debouncedResize);
      if (this.#slideTrack)
        this.#slideTrack.addEventListener("pointerdown", this.#onPointerDown);
    };

    this.#removeEventListeners = () => {
      if (this.#prevButton)
        this.#prevButton.removeEventListener(
          "click",
          this.#boundPrevClickHandler,
        );
      if (this.#nextButton)
        this.#nextButton.removeEventListener(
          "click",
          this.#boundNextClickHandler,
        );
      window.removeEventListener("resize", this.#debouncedResize);
      if (this.#slideTrack)
        this.#slideTrack.removeEventListener(
          "pointerdown",
          this.#onPointerDown,
        );
    };

    this.#updateArrowVisibility = () => {
      if (!this.#prevButton || !this.#nextButton) return;
      this.#prevButton.classList.toggle("hidden", this.hideArrows);
      this.#nextButton.classList.toggle("hidden", this.hideArrows);
      this.#updateNavButtons();
    };

    this.#getSlideOffset = (targetIndexInAllSlides) => {
      // targetIndexInAllSlides is the 0-based index within the #slides array
      if (this.#slides[targetIndexInAllSlides]) {
        return this.#slides[targetIndexInAllSlides].offsetLeft;
      }
      return 0;
    };

    this.#getTotalSlidesWidthWithGaps = () => {
      if (!this.#slideTrack || this.#slides.length === 0) return 0;
      // scrollWidth should include total width of children + gaps if flexbox gap is well-supported and used
      // A more robust way if gap isn't included or for older browsers:
      let totalWidth = 0;
      const gapValue = parseFloat(this.slideGap || "0px");
      this.#slides.forEach((slide, index) => {
        totalWidth += slide.offsetWidth;
        if (index < this.#slides.length - 1) {
          totalWidth += gapValue;
        }
      });
      return totalWidth;
      // return this.#slideTrack.scrollWidth; // Simpler if gap is reliably in scrollWidth
    };

    this.#onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (
        !this.loop &&
        this.#slides.length > 0 &&
        this.#container &&
        this.#getTotalSlidesWidthWithGaps() <= this.#container.offsetWidth + 2
      )
        return;
      if (this.#slides.length === 0) return; // No slides, no drag
      if (this.#slides.length <= 1 && !this.loop) return; // Not enough to drag if not looping

      this.#isDragging = true;
      this.#pointerId = event.pointerId;
      this.#startX = event.clientX;
      const transform = window.getComputedStyle(this.#slideTrack).transform;
      this.#initialTrackOffset =
        transform && transform !== "none" ? new DOMMatrix(transform).m41 : 0;
      this.#draggedDistance = 0;
      this.#slideTrack.classList.add("dragging");
      try {
        this.#slideTrack.setPointerCapture(this.#pointerId);
      } catch (e) {
        /* ignore */
      }
      window.addEventListener("pointermove", this.#onPointerMove, {
        passive: false,
      });
      window.addEventListener("pointerup", this.#onPointerUp);
      window.addEventListener("pointercancel", this.#onPointerUp);
      this.#stopAutoplay();
    };

    this.#onPointerMove = (event) => {
      if (!this.#isDragging || event.pointerId !== this.#pointerId) return;
      if (event.cancelable) event.preventDefault();

      this.#draggedDistance = event.clientX - this.#startX;
      let newTrackX = this.#initialTrackOffset + this.#draggedDistance;

      if (!this.loop && this.#container) {
        const minTranslateX = 0;
        const maxTranslateX = -(
          this.#getTotalSlidesWidthWithGaps() - this.#container.offsetWidth
        );

        if (newTrackX > minTranslateX) {
          const overScroll = newTrackX - minTranslateX;
          newTrackX = minTranslateX + overScroll * 0.3; // Resistance
        } else if (newTrackX < maxTranslateX && maxTranslateX < 0) {
          // maxTranslateX can be > 0 if content is smaller than container
          const overScroll = newTrackX - maxTranslateX;
          newTrackX = maxTranslateX + overScroll * 0.3; // Resistance
        }
      }
      this.#slideTrack.style.transform = `translateX(${newTrackX}px)`;
      this.#updateSlideAppearances(newTrackX); // Update opacity dynamically during drag
    };

    this.#onPointerUp = (event) => {
      if (
        !this.#isDragging ||
        (event &&
          event.pointerId !== this.#pointerId &&
          typeof event.pointerId !== "undefined")
      )
        return;
      if (this.#slideTrack) {
        this.#slideTrack.classList.remove("dragging");
        if (this.#pointerId !== null)
          try {
            this.#slideTrack.releasePointerCapture(this.#pointerId);
          } catch (e) {
            /* ignore */
          }
      }
      window.removeEventListener("pointermove", this.#onPointerMove);
      window.removeEventListener("pointerup", this.#onPointerUp);
      window.removeEventListener("pointercancel", this.#onPointerUp);
      this.#isDragging = false;
      this.#pointerId = null;

      const threshold = this.#container ? this.#container.offsetWidth / 5 : 50; // Adjusted threshold

      if (Math.abs(this.#draggedDistance) > threshold) {
        if (this.#draggedDistance < 0) this.next();
        else this.prev();
      } else {
        this.#updateView(); // Snap back
      }
      this.#draggedDistance = 0;
      this.#resetAutoplay();
    };

    this.#updateSlideAppearances = (currentTrackTranslateX) => {
      if (!this.#container || this.#slides.length === 0) return;
      const containerWidth = this.#container.offsetWidth;
      const containerCenter = -currentTrackTranslateX + containerWidth / 2;

      this.#slides.forEach((slide, index) => {
        const slideWidth = slide.offsetWidth;
        const slideCenter = slide.offsetLeft + slideWidth / 2;
        const distanceToCenter = Math.abs(containerCenter - slideCenter);

        // Progress: 0 when slide is centered, 1 when its edge is at container center (approx)
        let progress = Math.min(
          1,
          distanceToCenter / (containerWidth / 2 + slideWidth / 2),
        );

        // Make current slide fully visible, others fade based on distance
        const actualCurrentSlideIndex = this.#getActualSlideIndex();
        if (index === actualCurrentSlideIndex && !this.#isDragging) {
          // Prioritize current index when not dragging
          progress = 0;
        }

        const opacity = 1 - (1 - FrenzyCarousel.MIN_OPACITY) * progress;
        slide.style.opacity = Math.max(
          FrenzyCarousel.MIN_OPACITY,
          Math.min(1, opacity),
        ).toFixed(2);
        slide.classList.toggle("active-slide", opacity > 0.95); // For direct full opacity if needed
      });
    };

    this.#updateView = () => {
      if (!this.#slideTrack || !this.#container || this.#slides.length === 0) {
        if (this.#slideTrack)
          this.#slideTrack.style.transform = "translateX(0px)";
        this.#updateNavButtons();
        this.#updateDots();
        if (this.#slides.length > 0) this.#updateSlideAppearances(0);
        return;
      }

      this.#slideTrack.style.gap = this.slideGap || "0px";
      const numSlides = this.#slides.length;
      const actualSlideIndexToDisplay = this.#getActualSlideIndex();

      let targetOffset = this.#getSlideOffset(actualSlideIndexToDisplay);
      let centeringAdjustment = 0;
      if (this.centeredSlides && this.#slides[actualSlideIndexToDisplay]) {
        centeringAdjustment =
          (this.#container.offsetWidth -
            this.#slides[actualSlideIndexToDisplay].offsetWidth) /
          2;
      }

      let finalTranslateX;
      if (this.loop) {
        const cycle = Math.floor(this.#currentIndex / numSlides);
        const cycleOffset = cycle * this.#getTotalSlidesWidthWithGaps();
        finalTranslateX = -(targetOffset + cycleOffset) + centeringAdjustment;
      } else {
        // Ensure currentIndex is within bounds for non-looping
        this.#currentIndex = Math.max(
          0,
          Math.min(this.#currentIndex, numSlides - 1),
        );
        targetOffset = this.#getSlideOffset(this.#currentIndex); // Re-get offset with bounded index
        finalTranslateX = -targetOffset + centeringAdjustment;
      }

      this.#slideTrack.style.transform = `translateX(${finalTranslateX}px)`;
      this.#updateNavButtons();
      this.#updateDots();
      this.#updateSlideAppearances(finalTranslateX);
    };

    this.#updateNavButtons = () => {
      if (!this.#prevButton || !this.#nextButton || this.hideArrows) {
        if (this.#prevButton) this.#prevButton.disabled = true;
        if (this.#nextButton) this.#nextButton.disabled = true;
        return;
      }
      const numSlides = this.#slides.length;
      if (numSlides === 0) {
        this.#prevButton.disabled = true;
        this.#nextButton.disabled = true;
        return;
      }

      if (this.loop) {
        // In true infinite loop, buttons are almost always enabled if slides > 1
        const disable = numSlides <= 1; // Only disable if 1 or 0 slides
        this.#prevButton.disabled = disable;
        this.#nextButton.disabled = disable;
      } else {
        this.#prevButton.disabled = this.#currentIndex === 0;
        // For non-looping, check if visually at the end
        const containerWidth = this.#container
          ? this.#container.offsetWidth
          : 0;
        const totalWidth = this.#getTotalSlidesWidthWithGaps();
        const currentTransform = window.getComputedStyle(
          this.#slideTrack,
        ).transform;
        const currentTrackTranslateX =
          currentTransform && currentTransform !== "none"
            ? new DOMMatrix(currentTransform).m41
            : 0;
        const isAtEnd =
          -currentTrackTranslateX + containerWidth >= totalWidth - 2;
        this.#nextButton.disabled =
          isAtEnd || this.#currentIndex >= numSlides - 1;
      }
    };

    this.#createDots = () => {
      if (!this.#dotsContainer) return;
      this.#dotsContainer.innerHTML = "";
      const numSlides = this.#slides.length;
      for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement("button");
        dot.classList.add("dot");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.setAttribute("type", "button");
        dot.addEventListener("click", () => this.goTo(i));
        this.#dotsContainer.appendChild(dot);
      }
    };

    this.#updateDots = () => {
      if (!this.#dotsContainer) return;
      const numSlides = this.#slides.length;
      const hideAttr = this.hideDots;
      let logicallyHide =
        hideAttr ||
        numSlides === 0 ||
        (!this.loop && numSlides <= 1 && this.slidesPerView >= numSlides);
      if (!logicallyHide && !this.loop && this.#container && this.#slideTrack) {
        if (
          this.#getTotalSlidesWidthWithGaps() <=
          this.#container.offsetWidth + 2
        )
          logicallyHide = true;
      }
      this.#dotsContainer.classList.toggle("hidden", logicallyHide);
      if (logicallyHide) {
        if (!hideAttr) this.#dotsContainer.innerHTML = "";
        return;
      }
      if (this.#dotsContainer.children.length !== numSlides) {
        this.#createDots();
      }
      const actualCurrentSlideIndex = this.#getActualSlideIndex();
      const allDots = this.#dotsContainer.querySelectorAll(".dot");
      allDots.forEach((dot, index) =>
        dot.classList.toggle("active", index === actualCurrentSlideIndex),
      );
    };

    this.#startAutoplay = () => {
      if (!this.autoplay || this.#slides.length <= 1) return;
      // For non-looping, don't autoplay if all slides are visible
      if (
        !this.loop &&
        this.#container &&
        this.#getTotalSlidesWidthWithGaps() <= this.#container.offsetWidth + 2
      )
        return;

      this.#stopAutoplay();
      this.#autoplayInterval = setInterval(() => {
        // For non-looping, stop if at the visual end
        if (!this.loop) {
          const actualCurrentSlideIndex = this.#getActualSlideIndex();
          const containerWidth = this.#container
            ? this.#container.offsetWidth
            : 0;
          const totalWidth = this.#getTotalSlidesWidthWithGaps();
          const currentTransform = window.getComputedStyle(
            this.#slideTrack,
          ).transform;
          const currentTrackTranslateX =
            currentTransform && currentTransform !== "none"
              ? new DOMMatrix(currentTransform).m41
              : 0;
          const isAtEnd =
            -currentTrackTranslateX + containerWidth >= totalWidth - 2;

          if (isAtEnd || actualCurrentSlideIndex >= this.#slides.length - 1) {
            this.#stopAutoplay();
            return;
          }
        }
        this.next();
      }, this.autoplayDelay);
    };

    this.#stopAutoplay = () => {
      if (this.#autoplayInterval) {
        clearInterval(this.#autoplayInterval);
        this.#autoplayInterval = null;
      }
    };
    this.#resetAutoplay = () => {
      if (this.autoplay && !this.#isDragging) {
        this.#stopAutoplay();
        this.#startAutoplay();
      }
    };

    this.#debouncedResize = this.#debounce(this.#onResize, 250);
    this.#boundPrevClickHandler = this.prev.bind(this);
    this.#boundNextClickHandler = this.next.bind(this);
  }

  get loop() {
    return this.hasAttribute("loop");
  }
  get centeredSlides() {
    return this.hasAttribute("centered-slides");
  }
  get slidesPerView() {
    const a = this.getAttribute("slides-per-view"),
      v = parseInt(a, 10);
    return isNaN(v) || v < 1 ? 1 : v;
  }
  get autoplay() {
    return this.hasAttribute("autoplay");
  }
  get autoplayDelay() {
    const a = this.getAttribute("autoplay-delay"),
      v = parseInt(a, 10);
    return isNaN(v) || v < 500 ? 3000 : v;
  }
  get hideArrows() {
    return this.hasAttribute("hide-arrows");
  }
  get hideDots() {
    return this.hasAttribute("hide-dots");
  }
  get slideGap() {
    return this.getAttribute("slide-gap") || "0px";
  }

  connectedCallback() {
    this.#render();
    this.#slotElement = this.shadowRoot.querySelector("slot");
    if (this.#slotElement)
      this.#slotElement.addEventListener(
        "slotchange",
        this.#onSlotChangeHandler,
      );
    queueMicrotask(() => {
      this.#processSlides();
      this.#updateArrowVisibility();
      this.#updateView();
      if (this.autoplay) this.#startAutoplay();
    });
    this.#attachEventListeners();
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    if (this.#slotElement)
      this.#slotElement.removeEventListener(
        "slotchange",
        this.#onSlotChangeHandler,
      );
    this.#stopAutoplay();
    if (this.#isDragging) {
      window.removeEventListener("pointermove", this.#onPointerMove);
      window.removeEventListener("pointerup", this.#onPointerUp);
      window.removeEventListener("pointercancel", this.#onPointerUp);
      if (this.#pointerId !== null && this.#slideTrack)
        try {
          this.#slideTrack.releasePointerCapture(this.#pointerId);
        } catch (e) {
          /* ignore */
        }
      this.#isDragging = false;
      this.#pointerId = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#slideTrack) return;
    switch (name) {
      case "hide-arrows":
        this.#updateArrowVisibility();
        break;
      case "hide-dots":
        this.#updateDots();
        break;
      case "autoplay":
        if (this.autoplay) this.#startAutoplay();
        else this.#stopAutoplay();
        break;
      case "autoplay-delay":
        if (this.autoplay) this.#resetAutoplay();
        break;
      case "loop": // Loop change might require re-evaluating currentIndex if it was unbounded
        if (!this.loop && this.#slides.length > 0) {
          // Switching from loop to non-loop
          this.#currentIndex = this.#getActualSlideIndex(); // Bring currentIndex back into normal bounds
        }
      // Fall-through to update view and reset autoplay
      case "centered-slides":
      case "slides-per-view":
      case "slide-gap":
        queueMicrotask(() => {
          this.#updateView();
          if (name === "loop" || name === "slides-per-view")
            this.#resetAutoplay();
        });
        break;
    }
  }

  next() {
    if (this.#slides.length === 0) return;
    if (!this.loop && this.#currentIndex >= this.#slides.length - 1) {
      // More robust check for non-looping end
      const containerWidth = this.#container ? this.#container.offsetWidth : 0;
      const totalWidth = this.#getTotalSlidesWidthWithGaps();
      const currentTransform = window.getComputedStyle(
        this.#slideTrack,
      ).transform;
      const currentTrackTranslateX =
        currentTransform && currentTransform !== "none"
          ? new DOMMatrix(currentTransform).m41
          : 0;
      if (-currentTrackTranslateX + containerWidth >= totalWidth - 2) {
        this.#updateView(); // Snap to end if slightly overdragged
        return;
      }
    }
    this.#currentIndex++;
    this.#updateView();
    this.#resetAutoplay();
  }

  prev() {
    if (this.#slides.length === 0) return;
    if (!this.loop && this.#currentIndex <= 0) {
      const currentTransform = window.getComputedStyle(
        this.#slideTrack,
      ).transform;
      const currentTrackTranslateX =
        currentTransform && currentTransform !== "none"
          ? new DOMMatrix(currentTransform).m41
          : 0;
      if (currentTrackTranslateX >= -2) {
        // At or very near the beginning
        this.#updateView(); // Snap to start
        return;
      }
    }
    this.#currentIndex--;
    this.#updateView();
    this.#resetAutoplay();
  }

  goTo(index) {
    // index is the 0-based unique slide index
    if (this.#slides.length === 0 || index < 0 || index >= this.#slides.length)
      return;

    if (this.loop) {
      // To go to the 'index'-th unique slide, we find the closest instance of it
      // to the current #currentIndex.
      const numSlides = this.#slides.length;
      const actualCurrent = this.#getActualSlideIndex();
      let diff = index - actualCurrent;
      // No need to add/subtract numSlides multiples if #currentIndex is already unbounded.
      // Simply set #currentIndex relative to its current "cycle"
      this.#currentIndex += diff;
    } else {
      if (index === this.#currentIndex) return;
      this.#currentIndex = index;
    }
    this.#updateView();
    this.#resetAutoplay();
  }
}

customElements.define("fz-carousel", FrenzyCarousel);
export default FrenzyCarousel;
