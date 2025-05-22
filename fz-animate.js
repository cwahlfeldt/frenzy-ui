/**
 * FrenzyAnimate - A simple web component wrapper for Anime.js v4
 * Provides declarative animations through HTML attributes
 */

const ANIME_JS_CDN_URL = "https://esm.sh/animejs@4";

// Global anime.js management
let animeLibrary = null;
let animeLoadPromise = null;

/**
 * Check if anime.js is already available globally or load it
 */
async function ensureAnimeJs() {
  // Check if already loaded in our cache
  if (animeLibrary) {
    return animeLibrary;
  }

  // Check if anime.js is already available globally
  if (typeof window !== 'undefined' && window.anime && typeof window.anime.animate === 'function') {
    animeLibrary = window.anime;
    return animeLibrary;
  }

  // If we're already loading, return the same promise
  if (animeLoadPromise) {
    return animeLoadPromise;
  }

  // Load anime.js from CDN
  animeLoadPromise = import(ANIME_JS_CDN_URL)
    .then((module) => {
      if (module && typeof module.animate === 'function' && typeof module.onScroll === 'function') {
        animeLibrary = module;
        return animeLibrary;
      } else {
        throw new Error('Anime.js module loaded but required functions not found');
      }
    })
    .catch((error) => {
      console.error('Failed to load Anime.js:', error);
      animeLoadPromise = null; // Reset so we can try again
      throw error;
    });

  return animeLoadPromise;
}

class FrenzyAnimate extends HTMLElement {
  #animation = null;
  #isInitialized = false;
  #target = null;
  #animationOptions = null;
  #attributeTimeout = null;

  static get observedAttributes() {
    return [
      'target',
      'props',
      'duration',
      'easing',
      'delay',
      'loop',
      'direction',
      'autoplay',
      'trigger',
      'scroll-container',
      'scroll-target',
      'scroll-enter',
      'scroll-leave',
      'scroll-sync',
      'scroll-repeat',
      'scroll-horizontal'
    ];
  }

  constructor() {
    super();
    this.style.display = 'contents'; // Don't affect layout
  }

  async connectedCallback() {
    if (!this.#isInitialized) {
      await this.#initialize();
      this.#isInitialized = true;
    }
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    // Clear cached values when attributes change
    this.#target = null;
    this.#animationOptions = null;
    
    // Only re-animate if we're initialized and trigger allows it
    if (this.#isInitialized && this.#shouldTriggerOnChange()) {
      // Throttle attribute-based re-animations
      if (this.#attributeTimeout) {
        clearTimeout(this.#attributeTimeout);
      }
      this.#attributeTimeout = setTimeout(() => {
        this.#animate();
        this.#attributeTimeout = null;
      }, 16); // ~60fps throttling
    }
  }

  async #initialize() {
    try {
      await ensureAnimeJs();
      
      // Cache target and options for performance
      this.#target = this.#getTarget();
      this.#animationOptions = this.#getAnimationProps();
      
      if (this.#target && this.#animationOptions) {
        await this.#animate();
      }
    } catch (error) {
      console.error('FrenzyAnimate initialization failed:', error);
      this.#showError(`Failed to load animation library: ${error.message}`);
    }
  }

  #getTarget() {
    const targetSelector = this.getAttribute('target');
    
    if (targetSelector) {
      // Look for target by selector within this element first, then globally
      return this.querySelector(targetSelector) || document.querySelector(targetSelector);
    }
    
    // Default: animate the first child element
    return this.children[0] || null;
  }

  #getAnimationProps() {
    const propsAttr = this.getAttribute('props');
    let props = {};

    if (propsAttr) {
      try {
        props = JSON.parse(propsAttr);
      } catch (error) {
        console.error('Invalid props JSON:', propsAttr);
        this.#showError('Invalid props JSON format');
        return null;
      }
    }

    // Apply attribute overrides with defaults
    if (this.hasAttribute('duration')) {
      props.duration = parseInt(this.getAttribute('duration')) || 1000;
    } else if (!props.duration) {
      props.duration = 1000; // Default duration
    }

    if (this.hasAttribute('easing')) {
      props.easing = this.getAttribute('easing') || 'easeOutQuad';
    } else if (!props.easing) {
      props.easing = 'easeOutQuad'; // Default easing
    }

    if (this.hasAttribute('delay')) {
      props.delay = parseInt(this.getAttribute('delay')) || 0;
    }

    if (this.hasAttribute('loop')) {
      const loop = this.getAttribute('loop');
      if (loop === 'true' || loop === '') {
        props.loop = true;
      } else if (loop === 'false') {
        props.loop = false;
      } else {
        props.loop = parseInt(loop) || false;
      }
    }

    if (this.hasAttribute('direction')) {
      const direction = this.getAttribute('direction');
      if (direction === 'reverse') {
        props.direction = 'reverse';
      } else if (direction === 'alternate') {
        props.direction = 'alternate';
      }
    }

    // Autoplay handling - check for scroll-based autoplay first
    if (this.hasAttribute('scroll-container') || this.hasAttribute('scroll-target')) {
      // Use onScroll autoplay
      const scrollOptions = this.#getScrollOptions();
      if (scrollOptions && animeLibrary.onScroll) {
        try {
          props.autoplay = animeLibrary.onScroll(scrollOptions);
        } catch (error) {
          console.error('Failed to create scroll observer:', error);
          // Fallback to regular autoplay
          props.autoplay = false;
        }
      } else {
        props.autoplay = false;
      }
    } else {
      // Regular autoplay handling
      const autoplay = this.getAttribute('autoplay');
      if (autoplay !== null) {
        props.autoplay = autoplay !== 'false';
      } else {
        props.autoplay = true; // Default to autoplay
      }
    }

    return props;
  }

  #shouldTriggerOnChange() {
    const trigger = this.getAttribute('trigger');
    return trigger !== 'manual'; // Default is to trigger on change
  }

  #getScrollOptions() {
    const scrollOptions = {};

    // Container - can be selector string or element
    const containerAttr = this.getAttribute('scroll-container');
    if (containerAttr) {
      if (containerAttr === 'window') {
        // For window, we don't set container in the options
        // Anime.js v4 uses window by default
      } else {
        const containerEl = document.querySelector(containerAttr);
        if (containerEl) {
          scrollOptions.container = containerEl;
        }
      }
    }

    // Target - defaults to the animation target if not specified
    const targetAttr = this.getAttribute('scroll-target');
    if (targetAttr) {
      const targetEl = document.querySelector(targetAttr);
      if (targetEl) {
        scrollOptions.target = targetEl;
      }
    } else {
      const target = this.#getTarget();
      if (target) {
        scrollOptions.target = target;
      }
    }

    // Enter threshold
    const enterAttr = this.getAttribute('scroll-enter');
    if (enterAttr) {
      scrollOptions.enter = enterAttr.includes('%') ? enterAttr : parseFloat(enterAttr);
    }

    // Leave threshold  
    const leaveAttr = this.getAttribute('scroll-leave');
    if (leaveAttr) {
      scrollOptions.leave = leaveAttr.includes('%') ? leaveAttr : parseFloat(leaveAttr);
    }

    // Boolean options
    if (this.hasAttribute('scroll-sync')) {
      scrollOptions.sync = this.getAttribute('scroll-sync') !== 'false';
    }

    if (this.hasAttribute('scroll-repeat')) {
      scrollOptions.repeat = this.getAttribute('scroll-repeat') !== 'false';
    }

    if (this.hasAttribute('scroll-horizontal')) {
      scrollOptions.horizontal = this.getAttribute('scroll-horizontal') !== 'false';
    }

    return Object.keys(scrollOptions).length > 0 ? scrollOptions : null;
  }

  async #animate() {
    if (!animeLibrary) {
      return;
    }

    // Use cached values or get fresh ones
    const target = this.#target || this.#getTarget();
    const props = this.#animationOptions || this.#getAnimationProps();

    if (!target || !props) {
      return;
    }

    try {
      // Stop any existing animation
      if (this.#animation && typeof this.#animation.pause === 'function') {
        this.#animation.pause();
      }

      // Create new animation
      this.#animation = animeLibrary.animate(target, props);
      
      this.#clearError(); // Clear any previous errors
      
    } catch (error) {
      console.error('Animation failed:', error);
      this.#showError(`Animation failed: ${error.message}`);
    }
  }

  #cleanup() {
    if (this.#animation) {
      this.#animation.pause();
      this.#animation = null;
    }
    if (this.#attributeTimeout) {
      clearTimeout(this.#attributeTimeout);
      this.#attributeTimeout = null;
    }
  }

  #showError(message) {
    // Simple error display - just log to console and add error class
    console.error('FrenzyAnimate error:', message);
    this.classList.add('fz-animate-error');
    this.setAttribute('data-error', message);
  }

  #clearError() {
    this.classList.remove('fz-animate-error');
    this.removeAttribute('data-error');
  }

  // Public API methods
  play() {
    if (this.#animation && this.#animation.play) {
      this.#animation.play();
    }
  }

  pause() {
    if (this.#animation && this.#animation.pause) {
      this.#animation.pause();
    }
  }

  restart() {
    if (this.#animation && this.#animation.restart) {
      this.#animation.restart();
    } else {
      this.#animate();
    }
  }

  // Trigger animation manually
  animate() {
    return this.#animate();
  }
}

// Register the custom element
customElements.define('fz-animate', FrenzyAnimate);

export default FrenzyAnimate;