class FrenzyCarousel extends HTMLElement {
  #currentIndex = 0;
  #originalSlides = [];
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
  #isResizing = false;
  #numOriginalSlides = 0;

  #debouncedResize = null;
  #boundPrevClickHandler = null;
  #boundNextClickHandler = null;
  #boundTransitionEndHandler = null;

  #onSlotChangeHandler = null;
  #render = null;
  #attachEventListeners = null;
  #removeEventListeners = null;
  #getSlideOffset = null;
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
  #updateArrowVisibility = null;
  #rebuildSlideTrack = null;
  #updateSlideAppearances = null;
  #getCurrentTransformX = null;
  #handleLoopReset = null;
  #getTotalWidthOfSet = null;

  static MIN_OPACITY = 0.4;
  static ANIMATION_DURATION = 600; // ms

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

    this.#getCurrentTransformX = () => {
      if (!this.#slideTrack) return 0;
      const currentStyle = window.getComputedStyle(this.#slideTrack);
      const transformMatrix = currentStyle.transform || "none";
      if (transformMatrix === "none") return 0;
      try {
        return new DOMMatrix(transformMatrix).m41;
      } catch (e) {
        const match = transformMatrix.match(/translateX\(([^px]+)px\)/);
        return match ? parseFloat(match[1]) : 0;
      }
    };

    this.#getTotalWidthOfSet = (slideSet) => {
      if (!slideSet || slideSet.length === 0) return 0;
      const gap = parseFloat(this.slideGap || "0px");
      return slideSet.reduce((acc, slide, index) => {
        return (
          acc + slide.offsetWidth + (index < slideSet.length - 1 ? gap : 0)
        );
      }, 0);
    };

    this.#onResize = () => {
      if (!this.#slideTrack || this.#slides.length === 0) return;
      this.#isResizing = true;
      this.#slideTrack.classList.add("no-transition");
      this.#slides.forEach((s) => s.classList.add("no-opacity-transition"));
      this.#rebuildSlideTrack();
      this.#updateView(true); // No animation for resize update
      this.#slideTrack.offsetHeight;
      requestAnimationFrame(() => {
        // Ensure classes are removed after styles applied
        this.#slideTrack.classList.remove("no-transition");
        this.#slides.forEach((s) =>
          s.classList.remove("no-opacity-transition"),
        );
        this.#isResizing = false;
      });
    };

    this.#render = () => {
      this.shadowRoot.innerHTML = /*html*/ `
        <style>
          :host { display: block; position: relative; width: 100%; overflow: hidden; font-family: "Inter", sans-serif; user-select: none; -webkit-tap-highlight-color: transparent; }
          .carousel-container { position: relative; width: 100%; height: max-content; overflow: hidden; touch-action: pan-y; }
          .slide-track {
            display: flex; height: max-content;
            transition-property: transform;
            transition-duration: 0s; /* Default: NO transition for transform */
            transition-timing-function: ease-in-out;
            will-change: transform;
          }
          .slide-track.fz-animated-transition {
            transition-duration: ${FrenzyCarousel.ANIMATION_DURATION / 1000}s;
          }
          .slide-track.dragging, .slide-track.no-transition { transition: none !important; }
          .fz-slide {
            flex-shrink: 0; min-width: 50px; height: 100%;
            box-sizing: border-box; display: flex; align-items: center; justify-content: center;
            border-radius: 8px;
            transition-property: opacity;
            transition-duration: 0.5s;
            transition-timing-function: ease-out;
            opacity: ${FrenzyCarousel.MIN_OPACITY};
            overflow: hidden;
          }
          .fz-slide.no-opacity-transition { transition-property: none !important; }
          .fz-slide.active-slide { opacity: 1; }
          .fz-slide img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; }

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
          <div class="slide-track" part="track"></div>
          <slot style="display: none;"></slot>
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
      this.#slotElement = this.shadowRoot.querySelector("slot");
    };

    this.#rebuildSlideTrack = () => {
      if (!this.#slotElement || !this.#slideTrack || !this.#container) return;
      this.#slideTrack.innerHTML = "";
      this.#originalSlides = Array.from(
        this.#slotElement.assignedNodes({ flatten: true }),
      ).filter((node) => node.nodeType === Node.ELEMENT_NODE);
      this.#numOriginalSlides = this.#originalSlides.length;

      if (this.#numOriginalSlides === 0) {
        this.#slides = [];
        this.#currentIndex = 0;
        this.#updateView(true);
        return;
      }

      const createSlideElement = (originalNode) => {
        const slideWrapper = document.createElement("div");
        slideWrapper.classList.add("fz-slide");
        const clone = originalNode.cloneNode(true);
        slideWrapper.appendChild(clone);
        return slideWrapper;
      };

      this.#slides = [];
      if (this.loop && this.#numOriginalSlides > 0) {
        this.#originalSlides.forEach((node) =>
          this.#slides.push(createSlideElement(node)),
        );
        this.#originalSlides.forEach((node) =>
          this.#slides.push(createSlideElement(node)),
        );
        this.#originalSlides.forEach((node) =>
          this.#slides.push(createSlideElement(node)),
        );
        this.#currentIndex = this.#numOriginalSlides;
      } else {
        this.#originalSlides.forEach((node) =>
          this.#slides.push(createSlideElement(node)),
        );
        this.#currentIndex = Math.max(
          0,
          Math.min(this.#currentIndex, this.#numOriginalSlides - 1),
        );
      }
      this.#slides.forEach((slideEl) => this.#slideTrack.appendChild(slideEl));
    };

    this.#onSlotChangeHandler = () => {
      this.#rebuildSlideTrack();
      this.#updateView(true);
      this.#resetAutoplay();
    };

    this.#attachEventListeners = () => {
      if (this.#prevButton)
        this.#prevButton.addEventListener("click", this.#boundPrevClickHandler);
      if (this.#nextButton)
        this.#nextButton.addEventListener("click", this.#boundNextClickHandler);
      window.addEventListener("resize", this.#debouncedResize);
      if (this.#slideTrack) {
        this.#slideTrack.addEventListener("pointerdown", this.#onPointerDown);
        this.#slideTrack.addEventListener(
          "transitionend",
          this.#boundTransitionEndHandler,
        );
      }
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
      if (this.#slideTrack) {
        this.#slideTrack.removeEventListener(
          "pointerdown",
          this.#onPointerDown,
        );
        this.#slideTrack.removeEventListener(
          "transitionend",
          this.#boundTransitionEndHandler,
        );
      }
    };

    this.#handleLoopReset = (event) => {
      if (
        event &&
        (event.target !== this.#slideTrack ||
          event.propertyName !== "transform")
      )
        return;

      if (this.#slideTrack.classList.contains("fz-animated-transition")) {
        this.#slideTrack.classList.remove("fz-animated-transition");
      }

      if (
        !this.loop ||
        this.#isDragging ||
        this.#isResizing ||
        this.#numOriginalSlides === 0
      )
        return;

      let needsReset = false;
      if (this.#currentIndex >= this.#numOriginalSlides * 2) {
        this.#currentIndex -= this.#numOriginalSlides;
        needsReset = true;
      } else if (this.#currentIndex < this.#numOriginalSlides) {
        this.#currentIndex += this.#numOriginalSlides;
        needsReset = true;
      }

      if (needsReset) {
        this.#slideTrack.classList.add("no-transition");
        this.#slides.forEach((s) => s.classList.add("no-opacity-transition"));
        this.#slideTrack.offsetHeight; // Force reflow before updating view

        this.#updateView(true); // true for noAnimation flag

        requestAnimationFrame(() => {
          // Schedule class removal for after this frame
          this.#slideTrack.classList.remove("no-transition");
          this.#slides.forEach((s) =>
            s.classList.remove("no-opacity-transition"),
          );
        });
      }
    };

    this.#updateArrowVisibility = () => {
      if (!this.#prevButton || !this.#nextButton) return;
      this.#prevButton.classList.toggle("hidden", this.hideArrows);
      this.#nextButton.classList.toggle("hidden", this.hideArrows);
      this.#updateNavButtons();
    };

    this.#getSlideOffset = (targetIndexInFullTrack) => {
      return this.#slides[targetIndexInFullTrack]
        ? this.#slides[targetIndexInFullTrack].offsetLeft
        : 0;
    };

    this.#onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (this.#slides.length === 0) return;
      if (!this.loop && this.#numOriginalSlides > 0 && this.#container) {
        const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
        if (
          this.#getTotalWidthOfSet(originalDOMSet) <=
          this.#container.offsetWidth + 2
        )
          return;
      }
      if (!this.loop && this.#numOriginalSlides <= 1) return;

      this.#isDragging = true;
      this.#pointerId = event.pointerId;
      this.#startX = event.clientX;
      this.#initialTrackOffset = this.#getCurrentTransformX();
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

      if (!this.loop && this.#container && this.#numOriginalSlides > 0) {
        const minTranslateX = 0;
        const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
        const trackWidth = this.#getTotalWidthOfSet(originalDOMSet);
        const maxTranslateX = -(trackWidth - this.#container.offsetWidth);
        if (newTrackX > minTranslateX)
          newTrackX = minTranslateX + (newTrackX - minTranslateX) * 0.3;
        else if (newTrackX < maxTranslateX && maxTranslateX < 0)
          newTrackX = maxTranslateX + (newTrackX - maxTranslateX) * 0.3;
      }
      this.#slideTrack.style.transform = `translateX(${newTrackX}px)`;
      this.#updateSlideAppearances(newTrackX);
    };

    this.#onPointerUp = (event) => {
      if (
        !this.#isDragging ||
        (event &&
          event.pointerId !== this.#pointerId &&
          typeof event.pointerId !== "undefined")
      )
        return;
      // No need to remove 'dragging' here if next/prev/goTo will call updateView which manages transition classes
      // this.#slideTrack.classList.remove("dragging");
      if (this.#pointerId !== null)
        try {
          this.#slideTrack.releasePointerCapture(this.#pointerId);
        } catch (e) {
          /* ignore */
        }
      window.removeEventListener("pointermove", this.#onPointerMove);
      window.removeEventListener("pointerup", this.#onPointerUp);
      window.removeEventListener("pointercancel", this.#onPointerUp);
      this.#isDragging = false;
      this.#pointerId = null;
      const threshold = this.#container ? this.#container.offsetWidth / 5 : 50;
      if (Math.abs(this.#draggedDistance) > threshold) {
        if (this.#draggedDistance < 0) this.next();
        else this.prev();
      } else {
        this.#updateView(false, true);
      } // Snap back with animation
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
        let progress = Math.min(
          1,
          distanceToCenter / (containerWidth / 2 + slideWidth / 2),
        );
        if (index === this.#currentIndex && !this.#isDragging) progress = 0;
        const opacity = 1 - (1 - FrenzyCarousel.MIN_OPACITY) * progress;
        slide.style.opacity = Math.max(
          FrenzyCarousel.MIN_OPACITY,
          Math.min(1, opacity),
        ).toFixed(2);
        slide.classList.toggle("active-slide", opacity > 0.98);
      });
    };

    this.#updateView = (noAnimation = false, useAnimatedTransition = false) => {
      if (!this.#slideTrack || !this.#container) return;
      if (this.#slides.length === 0) {
        this.#slideTrack.style.transform = "translateX(0px)";
        this.#updateNavButtons();
        this.#updateDots();
        return;
      }
      this.#slideTrack.style.gap = this.slideGap || "0px";
      const targetSlideIndex = Math.max(
        0,
        Math.min(this.#currentIndex, this.#slides.length - 1),
      );
      let targetOffset = this.#getSlideOffset(targetSlideIndex);
      let centeringAdjustment = 0;
      if (this.centeredSlides && this.#slides[targetSlideIndex]) {
        centeringAdjustment =
          (this.#container.offsetWidth -
            this.#slides[targetSlideIndex].offsetWidth) /
          2;
      }
      const finalTranslateX = -targetOffset + centeringAdjustment;

      // Explicitly manage transition classes based on flags
      if (noAnimation) {
        this.#slideTrack.classList.add("no-transition");
        this.#slides.forEach((s) => s.classList.add("no-opacity-transition"));
        this.#slideTrack.classList.remove("fz-animated-transition");
      } else if (useAnimatedTransition) {
        this.#slideTrack.classList.add("fz-animated-transition");
        this.#slideTrack.classList.remove("no-transition"); // Ensure no-transition is off
        this.#slides.forEach((s) =>
          s.classList.remove("no-opacity-transition"),
        ); // Ensure opacity can animate
      } else {
        // Default to no specific animation class (uses CSS default 0s duration)
        this.#slideTrack.classList.remove(
          "no-transition",
          "fz-animated-transition",
        );
        this.#slides.forEach((s) =>
          s.classList.remove("no-opacity-transition"),
        );
      }

      this.#slideTrack.style.transform = `translateX(${finalTranslateX}px)`;
      this.#updateSlideAppearances(finalTranslateX); // Update opacities based on new position

      // If noAnimation was true, the 'no-transition' classes are still on.
      // The caller (e.g., #handleLoopReset or #onResize) is responsible for removing them after a reflow.
      // If useAnimatedTransition was true, 'fz-animated-transition' is on, and 'transitionend' will clean it up.

      this.#updateNavButtons();
      this.#updateDots();
    };

    this.#updateNavButtons = () => {
      if (!this.#prevButton || !this.#nextButton || this.hideArrows) {
        if (this.#prevButton) this.#prevButton.disabled = true;
        if (this.#nextButton) this.#nextButton.disabled = true;
        return;
      }
      if (this.#numOriginalSlides === 0) {
        this.#prevButton.disabled = true;
        this.#nextButton.disabled = true;
        return;
      }
      if (this.loop && this.#numOriginalSlides > 1) {
        this.#prevButton.disabled = false;
        this.#nextButton.disabled = false;
      } else if (!this.loop) {
        this.#prevButton.disabled = this.#currentIndex === 0;
        const containerWidth = this.#container
          ? this.#container.offsetWidth
          : 0;
        const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
        const trackWidth = this.#getTotalWidthOfSet(originalDOMSet);
        const currentTX = this.#getCurrentTransformX();
        const isAtEnd = -currentTX + containerWidth >= trackWidth - 2;
        this.#nextButton.disabled =
          isAtEnd || this.#currentIndex >= this.#numOriginalSlides - 1;
      } else {
        this.#prevButton.disabled = true;
        this.#nextButton.disabled = true;
      }
    };

    this.#createDots = () => {
      if (!this.#dotsContainer) return;
      this.#dotsContainer.innerHTML = "";
      for (let i = 0; i < this.#numOriginalSlides; i++) {
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
      const hideAttr = this.hideDots;
      let logicallyHide =
        hideAttr ||
        this.#numOriginalSlides === 0 ||
        this.#numOriginalSlides <= 1;
      if (
        !logicallyHide &&
        !this.loop &&
        this.#container &&
        this.#numOriginalSlides > 0
      ) {
        const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
        if (
          this.#getTotalWidthOfSet(originalDOMSet) <=
          this.#container.offsetWidth + 2
        )
          logicallyHide = true;
      }
      this.#dotsContainer.classList.toggle("hidden", logicallyHide);
      if (logicallyHide) {
        if (!hideAttr) this.#dotsContainer.innerHTML = "";
        return;
      }
      if (this.#dotsContainer.children.length !== this.#numOriginalSlides)
        this.#createDots();
      const activeDotIndex =
        this.loop && this.#numOriginalSlides > 0
          ? this.#currentIndex % this.#numOriginalSlides
          : this.#currentIndex;
      const allDots = this.#dotsContainer.querySelectorAll(".dot");
      allDots.forEach((dot, index) =>
        dot.classList.toggle("active", index === activeDotIndex),
      );
    };

    this.#startAutoplay = () => {
      if (!this.autoplay || this.#numOriginalSlides <= 1) return;
      if (!this.loop && this.#container && this.#numOriginalSlides > 0) {
        const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
        if (
          this.#getTotalWidthOfSet(originalDOMSet) <=
          this.#container.offsetWidth + 2
        )
          return;
      }
      this.#stopAutoplay();
      this.#autoplayInterval = setInterval(() => {
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

    this.#boundPrevClickHandler = this.prev.bind(this);
    this.#boundNextClickHandler = this.next.bind(this);
    this.#boundTransitionEndHandler = this.#handleLoopReset.bind(this);
    this.#debouncedResize = this.#debounce(this.#onResize, 250);
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
    if (this.#slotElement)
      this.#slotElement.addEventListener(
        "slotchange",
        this.#onSlotChangeHandler,
      );
    queueMicrotask(() => {
      this.#rebuildSlideTrack();
      this.#updateArrowVisibility();
      this.#updateView(true);
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
    if (oldValue === newValue || !this.isConnected) return;
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
      case "loop":
      case "slides-per-view":
      case "slide-gap":
        queueMicrotask(() => {
          this.#rebuildSlideTrack();
          this.#updateView(true);
          this.#resetAutoplay();
        });
        break;
      case "centered-slides":
        queueMicrotask(() => this.#updateView(false, true));
        break;
    }
  }

  next() {
    if (this.#slides.length === 0) return;
    if (!this.loop && this.#currentIndex >= this.#numOriginalSlides - 1) {
      const containerWidth = this.#container ? this.#container.offsetWidth : 0;
      const originalDOMSet = this.#slides.slice(0, this.#numOriginalSlides);
      const trackWidth = this.#getTotalWidthOfSet(originalDOMSet);
      const currentTX = this.#getCurrentTransformX();
      if (-currentTX + containerWidth >= trackWidth - 2) {
        this.#updateView(false, true);
        return;
      }
    }
    this.#currentIndex++;
    this.#updateView(false, true);
    this.#resetAutoplay();
  }

  prev() {
    if (this.#slides.length === 0) return;
    if (!this.loop && this.#currentIndex <= 0) {
      const currentTX = this.#getCurrentTransformX();
      if (currentTX >= -2) {
        this.#updateView(false, true);
        return;
      }
    }
    this.#currentIndex--;
    this.#updateView(false, true);
    this.#resetAutoplay();
  }

  goTo(originalSlideIndex) {
    if (
      this.#numOriginalSlides === 0 ||
      originalSlideIndex < 0 ||
      originalSlideIndex >= this.#numOriginalSlides
    )
      return;
    let targetIndexInFullTrack =
      this.loop && this.#numOriginalSlides > 0
        ? this.#numOriginalSlides + originalSlideIndex
        : originalSlideIndex;
    if (targetIndexInFullTrack === this.#currentIndex) return;
    this.#currentIndex = targetIndexInFullTrack;
    this.#updateView(false, true);
    this.#resetAutoplay();
  }
}

customElements.define("fz-carousel", FrenzyCarousel);
export default FrenzyCarousel;
