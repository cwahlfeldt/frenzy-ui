// frenzy-carousel.js (Embedded with Simplified Slide Gap)
class FrenzyCarousel extends HTMLElement {
  #currentIndex = 0;
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
  #debouncedResize;
  #slotElement = null; // Store reference to the slot element

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#debouncedResize = this.#debounce(this.#onResize, 250);
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
    this.#render();
    this.#slotElement = this.shadowRoot.querySelector("slot");

    if (this.#slotElement) {
      this.#slotElement.addEventListener(
        "slotchange",
        this.#onSlotChangeHandler,
      );
    }
    this.#onSlotChangeHandler(); // Process initial slides

    this.#attachEventListeners();
    this.#updateControlsVisibility(); // Call after slides are initialized for correct dot visibility
    if (this.autoplay) {
      this.#startAutoplay();
    }
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    if (this.#slotElement) {
      this.#slotElement.removeEventListener(
        "slotchange",
        this.#onSlotChangeHandler,
      );
    }
    this.#stopAutoplay();
    if (this.#isDragging) {
      window.removeEventListener("pointermove", this.#onPointerMove);
      window.removeEventListener("pointerup", this.#onPointerUp);
      window.removeEventListener("pointercancel", this.#onPointerUp);
      if (this.#pointerId !== null && this.#slideTrack) {
        try {
          this.#slideTrack.releasePointerCapture(this.#pointerId);
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    // If critical DOM elements aren't ready yet (e.g., initial attribute setting before connectedCallback fully runs)
    // and the attribute affects slide layout/initialization, defer.
    // connectedCallback will handle the initial setup.
    if (
      !this.#slideTrack &&
      (name === "loop" ||
        name === "centered-slides" ||
        name === "slides-per-view" ||
        name === "slide-gap")
    ) {
      return;
    }

    if (name === "hide-arrows" || name === "hide-dots") {
      this.#updateControlsVisibility();
    } else if (name === "autoplay") {
      if (this.autoplay) this.#startAutoplay();
      else this.#stopAutoplay();
    } else if (name === "autoplay-delay" && this.autoplay) {
      this.#stopAutoplay();
      this.#startAutoplay();
    } else {
      // For loop, centered-slides, slides-per-view, slide-gap
      // These attributes require recalculating slide positions and view.
      this.#onSlotChangeHandler();
    }
  }

  #onSlotChangeHandler = () => {
    if (!this.#slotElement) {
      // This might happen if called by attributeChangedCallback before slotElement is set in connectedCallback
      // However, the guard in attributeChangedCallback should prevent this for attributes affecting slides.
      // If it still happens, it means an attribute like hide-dots/hide-arrows called it before connectedCallback finished.
      // In that case, we can defer to connectedCallback's own call to #onSlotChangeHandler.
      return;
    }

    this.#slides = this.#slotElement
      .assignedNodes({ flatten: true })
      .filter((node) => node.nodeType === Node.ELEMENT_NODE);

    this.#slides.forEach((s) => {
      if (window.getComputedStyle(s).display === "none")
        s.style.display = "flex";
    });

    const oldCurrentIndex = this.#currentIndex;
    this.#currentIndex =
      this.#slides.length > 0
        ? Math.max(0, Math.min(this.#currentIndex, this.#slides.length - 1))
        : 0;

    // If current index changed due to slides being removed, update view
    // Otherwise, createDots and updateView will handle current state.
    const requiresViewUpdateForIndexChange =
      oldCurrentIndex !== this.#currentIndex && this.#slides.length > 0;

    if (!this.hideDots) {
      this.#createDots(); // This will also call #updateDots
    } else if (this.#dotsContainer) {
      this.#dotsContainer.innerHTML = "";
      this.#dotsContainer.classList.add("hidden");
    }

    this.#updateView();

    // Ensure nav buttons are updated after potential slide changes
    this.#updateNavButtons();
  };

  #render() {
    this.shadowRoot.innerHTML = /**/ `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          overflow: hidden;
          font-family: "Inter", sans-serif;
          user-select: none;
        }
        .carousel-container {
          position: relative;
          width: 100%;
          height: max-content; /* Allow height to be determined by content */
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
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        ::slotted(img) {
          max-width: none; /* Allow image to dictate its own size if not constrained by slide wrapper */
          width: 100%; /* If img is the direct slide, it fills its allocated space */
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 8px;
        }
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 0;
          cursor: pointer;
          z-index: 10;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background-color 0.3s ease,
            opacity 0.3s ease,
            visibility 0s linear 0s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .nav-button.hidden {
          visibility: hidden;
          opacity: 0;
        }
        .nav-button:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }
        .nav-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .prev {
          left: 15px;
        }
        .next {
          right: 15px;
        }
        .dots-container {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
          transition:
            opacity 0.3s ease,
            visibility 0s linear 0s;
        }
        .dots-container.hidden {
          visibility: hidden;
          opacity: 0;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition:
            background-color 0.3s ease,
            transform 0.3s ease;
        }
        .dot.active {
          background-color: rgba(255, 255, 255, 1);
          transform: scale(1.2);
        }
      </style>
      <div class="carousel-container" part="container">
        <div class="slide-track" part="track"><slot></slot></div>
        <button
          class="nav-button prev"
          part="prev-button"
          aria-label="Previous slide"
        >
          &#10094;
        </button>
        <button
          class="nav-button next"
          part="next-button"
          aria-label="Next slide"
        >
          &#10095;
        </button>
        <div class="dots-container" part="dots-container"></div>
      </div>
    `;
    this.#slideTrack = this.shadowRoot.querySelector(".slide-track");
    this.#container = this.shadowRoot.querySelector(".carousel-container");
    this.#prevButton = this.shadowRoot.querySelector(".prev");
    this.#nextButton = this.shadowRoot.querySelector(".next");
    this.#dotsContainer = this.shadowRoot.querySelector(".dots-container");
  }

  #updateControlsVisibility() {
    if (this.#prevButton && this.#nextButton) {
      const shouldHideArrows = this.hideArrows;
      this.#prevButton.classList.toggle("hidden", shouldHideArrows);
      this.#nextButton.classList.toggle("hidden", shouldHideArrows);
    }
    if (this.#dotsContainer) {
      this.#dotsContainer.classList.toggle("hidden", this.hideDots);
      if (this.hideDots) {
        this.#dotsContainer.innerHTML = "";
      } else {
        // #onSlotChangeHandler will call #createDots if not hiding,
        // which in turn calls #updateDots.
        // However, if hideDots changes from true to false, we need to explicitly create them.
        this.#createDots();
      }
    }
    this.#updateNavButtons(); // Update button states as well
  }

  #attachEventListeners() {
    if (this.#prevButton)
      this.#prevButton.addEventListener("click", this.prev.bind(this));
    if (this.#nextButton)
      this.#nextButton.addEventListener("click", this.next.bind(this));
    window.addEventListener("resize", this.#debouncedResize);
    if (this.#slideTrack)
      this.#slideTrack.addEventListener("pointerdown", this.#onPointerDown);
  }

  #removeEventListeners() {
    if (this.#prevButton)
      this.#prevButton.removeEventListener("click", this.prev.bind(this));
    if (this.#nextButton)
      this.#nextButton.removeEventListener("click", this.next.bind(this));
    window.removeEventListener("resize", this.#debouncedResize);
    if (this.#slideTrack)
      this.#slideTrack.removeEventListener("pointerdown", this.#onPointerDown);
  }

  #getSlideOffset(targetIndex) {
    if (this.#slides[targetIndex]) {
      return this.#slides[targetIndex].offsetLeft;
    }
    return 0;
  }

  #getTotalContentWidth() {
    return this.#slideTrack ? this.#slideTrack.scrollWidth : 0;
  }

  #onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!this.loop && this.#slides.length > 0 && this.#container) {
      const totalContentWidth = this.#getTotalContentWidth();
      const containerWidth = this.#container.offsetWidth;
      if (totalContentWidth <= containerWidth + 2) {
        // +2 for potential subpixel issues
        return;
      }
    }
    if (this.#slides.length <= 1 && !this.loop) return; // No dragging if not enough slides and not looping

    this.#isDragging = true;
    this.#pointerId = event.pointerId;
    this.#startX = event.clientX;
    const currentTransform = window.getComputedStyle(
      this.#slideTrack,
    ).transform;
    this.#initialTrackOffset =
      currentTransform && currentTransform !== "none"
        ? new DOMMatrix(currentTransform).m41
        : 0;
    this.#slideTrack.classList.add("dragging");
    this.#slideTrack.setPointerCapture(this.#pointerId);
    window.addEventListener("pointermove", this.#onPointerMove);
    window.addEventListener("pointerup", this.#onPointerUp);
    window.addEventListener("pointercancel", this.#onPointerUp);
    this.#stopAutoplay();
  };

  #onPointerMove = (event) => {
    if (!this.#isDragging || event.pointerId !== this.#pointerId) return;
    const currentX = event.clientX;
    this.#draggedDistance = currentX - this.#startX;
    const newTrackX = this.#initialTrackOffset + this.#draggedDistance;
    this.#slideTrack.style.transform = `translateX(${newTrackX}px)`;
  };

  #onPointerUp = (event) => {
    if (
      !this.#isDragging ||
      (event &&
        event.pointerId !== this.#pointerId &&
        typeof event.pointerId !== "undefined")
    )
      return;

    if (this.#slideTrack) {
      // Ensure slideTrack exists
      this.#slideTrack.classList.remove("dragging");
      if (this.#pointerId !== null) {
        try {
          this.#slideTrack.releasePointerCapture(this.#pointerId);
        } catch (e) {
          /* ignore */
        }
      }
    }

    window.removeEventListener("pointermove", this.#onPointerMove);
    window.removeEventListener("pointerup", this.#onPointerUp);
    window.removeEventListener("pointercancel", this.#onPointerUp);

    this.#isDragging = false;
    this.#pointerId = null;

    const dragThreshold = this.#container
      ? this.#container.offsetWidth / 7 // A fraction of the container width
      : 50; // Fallback threshold

    if (Math.abs(this.#draggedDistance) > dragThreshold) {
      if (this.#draggedDistance < 0) this.next();
      else this.prev();
    } else {
      this.#updateView(); // Snap back if not dragged enough
    }
    this.#draggedDistance = 0;
    this.#resetAutoplay();
  };

  #onResize = () => {
    this.#updateView();
  };

  #updateView() {
    if (!this.#slideTrack || !this.#container) return;

    this.#slideTrack.style.gap = this.slideGap || "0px";

    if (this.#slides.length === 0) {
      this.#slideTrack.style.transform = "translateX(0px)";
      this.#updateNavButtons();
      if (!this.hideDots) this.#updateDots();
      return;
    }

    let targetOffset = this.#getSlideOffset(this.#currentIndex);
    let centeringAdjustment = 0;
    if (this.centeredSlides && this.#slides[this.#currentIndex]) {
      const containerWidth = this.#container.offsetWidth;
      const currentSlideWidth = this.#slides[this.#currentIndex].offsetWidth;
      centeringAdjustment = (containerWidth - currentSlideWidth) / 2;
    }
    const finalTranslateX = -targetOffset + centeringAdjustment;
    this.#slideTrack.style.transform = `translateX(${finalTranslateX}px)`;

    this.#updateNavButtons();
    if (!this.hideDots) this.#updateDots();
  }

  #updateNavButtons() {
    if (!this.#prevButton || !this.#nextButton) return; // Buttons might not be rendered yet

    const hide = this.hideArrows;
    this.#prevButton.classList.toggle("hidden", hide);
    this.#nextButton.classList.toggle("hidden", hide);
    if (hide) return;

    const numSlides = this.#slides.length;
    if (numSlides === 0) {
      this.#prevButton.disabled = true;
      this.#nextButton.disabled = true;
      return;
    }
    if (this.loop) {
      // Disable buttons if not enough slides to loop meaningfully
      const disableLoopButtons = numSlides <= 1;
      // Or, if slidesPerView is high, disable if all slides are visible
      // For now, simple check:
      this.#prevButton.disabled = disableLoopButtons;
      this.#nextButton.disabled = disableLoopButtons;
    } else {
      this.#prevButton.disabled = this.#currentIndex === 0;

      let isAtEnd = false;
      if (this.#currentIndex >= numSlides - 1) {
        isAtEnd = true; // Definitely at the end if on the last slide index
      } else if (this.#container && this.#slideTrack && numSlides > 0) {
        // Check if the right edge of the content is visible
        const totalContentWidth = this.#getTotalContentWidth();
        const containerWidth = this.#container.offsetWidth;

        // Get current translation from #updateView's calculation
        let currentTrackTranslateX = 0;
        const transformStyle = this.#slideTrack.style.transform;
        if (transformStyle && transformStyle.includes("translateX")) {
          currentTrackTranslateX = parseFloat(
            transformStyle.replace(/translateX\(|\px\)/g, ""),
          );
        }

        // If (current offset + container width) is close to or greater than total content width
        if (-currentTrackTranslateX + containerWidth >= totalContentWidth - 2) {
          // -2 for subpixel tolerance
          isAtEnd = true;
        }
      }
      this.#nextButton.disabled = isAtEnd;
    }
  }

  #createDots() {
    if (this.hideDots || !this.#dotsContainer) {
      if (this.#dotsContainer) this.#dotsContainer.innerHTML = "";
      return;
    }
    this.#dotsContainer.classList.remove("hidden");
    this.#dotsContainer.innerHTML = "";

    const numSlides = this.#slides.length;
    let shouldHideDotsLogically =
      numSlides === 0 || (!this.loop && numSlides <= 1);

    if (!shouldHideDotsLogically && !this.loop && this.#container) {
      const totalContentWidth = this.#getTotalContentWidth();
      if (totalContentWidth <= this.#container.offsetWidth + 2) {
        // +2 for tolerance
        shouldHideDotsLogically = true;
      }
    }

    if (shouldHideDotsLogically) {
      this.#dotsContainer.style.display = "none";
      return;
    }

    this.#dotsContainer.style.display = "flex";
    for (let i = 0; i < numSlides; i++) {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => this.goTo(i));
      this.#dotsContainer.appendChild(dot);
    }
    this.#updateDots();
  }

  #updateDots() {
    if (this.hideDots || !this.#dotsContainer || this.#slides.length === 0) {
      if (this.#dotsContainer) {
        this.#dotsContainer.style.display =
          this.hideDots || this.#slides.length === 0 ? "none" : "flex";
        if (this.hideDots) this.#dotsContainer.innerHTML = "";
      }
      return;
    }

    const allDots = this.#dotsContainer.querySelectorAll(".dot");
    if (allDots.length === 0 && this.#slides.length > 0 && !this.hideDots) {
      // This case implies dots should be there but aren't; #createDots should have handled it.
      // But as a fallback, or if hideDots was toggled.
      this.#createDots();
      return;
    }

    const numSlides = this.#slides.length;
    let hideDotsLogic = numSlides === 0 || (!this.loop && numSlides <= 1);
    if (!hideDotsLogic && !this.loop && this.#container) {
      const totalContentWidth = this.#getTotalContentWidth();
      if (totalContentWidth <= this.#container.offsetWidth + 2)
        hideDotsLogic = true;
    }
    this.#dotsContainer.style.display =
      this.hideDots || hideDotsLogic ? "none" : "flex";

    allDots.forEach((dot, index) =>
      dot.classList.toggle("active", index === this.#currentIndex),
    );
  }

  next() {
    const numSlides = this.#slides.length;
    if (numSlides === 0) return;

    if (!this.loop) {
      // Check if already at the effective end based on visibility
      const totalContentWidth = this.#getTotalContentWidth();
      const containerWidth = this.#container ? this.#container.offsetWidth : 0;
      let currentTrackTranslateX = 0;
      const transformStyle = this.#slideTrack.style.transform;
      if (transformStyle && transformStyle.includes("translateX")) {
        currentTrackTranslateX = parseFloat(
          transformStyle.replace(/translateX\(|\px\)/g, ""),
        );
      }

      if (-currentTrackTranslateX + containerWidth >= totalContentWidth - 2) {
        // -2 for tolerance
        // Already at the end, don't advance further
        this.#updateNavButtons(); // Ensure button state is correct
        return;
      }
    }

    if (this.loop) {
      this.#currentIndex = (this.#currentIndex + 1) % numSlides;
    } else if (this.#currentIndex < numSlides - 1) {
      this.#currentIndex++;
    } else {
      // Already at the last slide index and not looping
      this.#updateNavButtons();
      return;
    }
    this.#updateView();
    this.#resetAutoplay();
  }

  prev() {
    const numSlides = this.#slides.length;
    if (numSlides === 0) return;
    if (this.loop) {
      this.#currentIndex = (this.#currentIndex - 1 + numSlides) % numSlides;
    } else if (this.#currentIndex > 0) {
      this.#currentIndex--;
    } else {
      // Already at the first slide and not looping
      this.#updateNavButtons();
      return;
    }
    this.#updateView();
    this.#resetAutoplay();
  }

  goTo(index) {
    const numSlides = this.#slides.length;
    if (numSlides === 0 || index < 0 || index >= numSlides) return;
    if (index === this.#currentIndex) return; // No change
    this.#currentIndex = index;
    this.#updateView();
    this.#resetAutoplay();
  }

  #startAutoplay() {
    if (!this.autoplay || this.#slides.length <= 1) return;
    if (!this.loop && this.#container) {
      // Check if content is scrollable for non-looping autoplay
      const totalContentWidth = this.#getTotalContentWidth();
      if (totalContentWidth <= this.#container.offsetWidth + 2) return;
    }
    this.#stopAutoplay();
    this.#autoplayInterval = setInterval(() => this.next(), this.autoplayDelay);
  }

  #stopAutoplay() {
    if (this.#autoplayInterval) {
      clearInterval(this.#autoplayInterval);
      this.#autoplayInterval = null;
    }
  }
  #resetAutoplay() {
    if (this.autoplay && !this.#isDragging) {
      this.#stopAutoplay();
      this.#startAutoplay();
    }
  }

  #debounce(func, wait) {
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

export default FrenzyCarousel;
