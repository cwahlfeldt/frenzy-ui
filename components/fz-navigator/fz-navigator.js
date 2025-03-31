import { html, render } from '../../lib/html/lit-html.js';
import { unsafeHTML } from '../../lib/html/unsafe-html.js';
import Component from '../../lib/component.js';
import { navigatorStyles } from './fz-navigator.css.js';
import {
  DEFAULT_MENU,
  parseMenuData,
  createPrimaryMenuHTML,
  createSecondaryMenuHTML,
  createEyebrowMenuHTML
} from './fz-navigator-menu.js';

/**
 * FZ Navigator Component
 * Mobile-friendly navigation component with search and dropdown menus
 */
export class FzNavigator extends Component {
  // Private properties
  #isOpen = false;
  #menuToggle = null;
  #navigatorWrapper = null;
  #searchBtn = null;
  #searchContainer = null;
  #searchInput = null;
  #searchForm = null;
  #desktopNavItems = null;
  #eyebrowContainer = null;

  // Menu data
  #menuData = DEFAULT_MENU;

  constructor() {
    // Apply styles immediately through the base component
    super([navigatorStyles]);

    // Try to parse menu data from attribute
    if (this.hasAttribute('menu-data')) {
      this.#menuData = parseMenuData(this.getAttribute('menu-data'));
    }

    // Add initializing class early to document for layout reservation
    document.documentElement.classList.add('fz-navigator-initializing');
  }

  /**
   * Initialize component functionality after render
   */
  /**
   * Update the menu data
   * @param {Object|string} data - New menu data (object or JSON string)
   */
  setMenuData(data) {
    this.#menuData = parseMenuData(data);
    this.render();
    this.setupAccordion();
  }

  /**
   * Get the current menu data
   * @returns {Object} Current menu data
   */
  getMenuData() {
    return { ...this.#menuData };
  }

  /**
   * Initialize component functionality after render
   */
  initialize() {
    // Render the initial structure immediately
    this.render();

    // Get references to necessary elements
    this.#menuToggle = this.shadowRoot.querySelector('.menu-toggle');
    this.#navigatorWrapper = this.shadowRoot.querySelector('.navigator-wrapper');
    this.#searchBtn = this.shadowRoot.querySelector('.search-btn');
    this.#desktopNavItems = this.shadowRoot.querySelector('.desktop-nav-container');
    this.#eyebrowContainer = this.shadowRoot.querySelector('.eyebrow-container');
    this.#searchContainer = this.shadowRoot.querySelector('.search-container');
    this.#searchInput = this.#searchContainer.querySelector('.search-input');
    this.#searchForm = this.#searchContainer.querySelector('.search-form');

    // Attach event listeners
    this.addEventListeners();

    // Set up accordion for menu items
    this.setupAccordion();

    // Remove the initializing class to allow normal flow
    document.documentElement.classList.remove('fz-navigator-initializing');

    // Mark component as fully initialized
    this.classList.add('fz-navigator-initialized');
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Bind methods to this instance to ensure proper removal later
    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);

    // Handler for search form submission
    this.handleSearchSubmit = (e) => {
      e.preventDefault();
      // Implement search functionality here
      console.log('Search submitted:', this.#searchInput.value);
      // Close search after submission
      this.toggleSearch(false);
    };

    // Toggle mobile menu
    this.#menuToggle.addEventListener('click', this.toggleMenu);

    // Toggle search
    this.#searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleSearch();
    });

    // Handle search form submission
    this.#searchForm.addEventListener('submit', this.handleSearchSubmit);
  }

  /**
   * Toggle search open/close
   * @param {boolean} forceState - Optional force state (true = open, false = close)
   */
  toggleSearch(forceState) {
    const shouldOpen = forceState !== undefined ? forceState : !this.#searchContainer.classList.contains('active');

    if (shouldOpen) {
      this.#searchContainer.classList.add('active');
      // Focus the input after animation completes
      setTimeout(() => this.#searchInput.focus(), 300);
    } else {
      this.#searchContainer.classList.remove('active');
      this.#searchInput.value = '';
    }
  }

  /**
   * Toggle menu open/close
   */
  toggleMenu() {
    this.#isOpen = !this.#isOpen;
    this.#menuToggle.classList.toggle('active');

    // Both static and fixed use the same animation style with transform and active class
    this.#navigatorWrapper.classList.toggle('active');

    // Ensure transform is applied consistently (direct style has priority over CSS classes)
    this.#navigatorWrapper.style.transform = this.#isOpen ? 'translateX(0)' : 'translateX(100%)';

    // For fixed position only, toggle body class
    if (this.getAttribute('position-type') !== 'static') {
      document.body.classList.toggle('navigator-is-open');
    }

    // Force a reflow to ensure visual changes take effect immediately
    void this.#navigatorWrapper.offsetWidth;

    // Update aria-expanded
    this.#menuToggle.setAttribute('aria-expanded', this.#isOpen);
  }

  /**
   * Set up accordion functionality for menu items
   */
  setupAccordion() {
    // Get the slot element
    const menuSlot = this.shadowRoot.querySelector('slot[name="menu-content"]');

    // Handle both slotted content and default content
    menuSlot.addEventListener('slotchange', () => {
      this.setupAccordionItems(menuSlot.assignedElements());
    });

    // Trigger initial setup
    const assignedElements = menuSlot.assignedElements();
    if (assignedElements.length > 0) {
      this.setupAccordionItems(assignedElements);
    } else {
      const defaultContent = this.shadowRoot.querySelector('.default-menu-content');
      if (defaultContent) {
        this.setupAccordionItems([defaultContent]);
      }
    }
  }

  /**
   * Set up accordion items
   * @param {Element[]} elements - Elements to set up accordion on
   */
  setupAccordionItems(elements) {
    elements.forEach(element => {
      // Find all menu items with children (submenus)
      const menuItemsWithChildren = element.querySelectorAll('.menu-item-has-children > a');
      const submenus = element.querySelectorAll('.sub-menu');

      // Initialize submenus
      submenus.forEach(submenu => {
        // Store original height
        submenu.setAttribute('data-height', submenu.scrollHeight + 'px');

        // Set initial state
        submenu.style.height = '0';
        submenu.style.overflow = 'hidden';
        submenu.style.transition = 'height 0.3s ease-in-out';
        submenu.style.display = 'block';
      });

      // Add click handlers to menu items
      menuItemsWithChildren.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();

          const currentParent = item.parentNode;
          const currentSubmenu = currentParent.querySelector('.sub-menu');
          const isCurrentlyOpen = currentParent.classList.contains('submenu-open');

          // Close all open submenus
          const allOpenSubmenus = element.querySelectorAll('.menu-item-has-children.submenu-open');

          allOpenSubmenus.forEach(openItem => {
            if (openItem !== currentParent) {
              const submenu = openItem.querySelector('.sub-menu');
              submenu.style.height = '0';
              openItem.classList.remove('submenu-open');
            }
          });

          // Toggle current submenu with animation
          if (!isCurrentlyOpen) {
            currentParent.classList.add('submenu-open');
            currentSubmenu.style.height = currentSubmenu.getAttribute('data-height');
          } else {
            currentSubmenu.style.height = '0';
            currentParent.classList.remove('submenu-open');
          }
        });
      });
    });
  }

  /**
   * Called when component is disconnected from the DOM
   */
  disconnectedCallback() {
    document.body.classList.remove('navigator-is-open');
    document.documentElement.classList.remove('fz-navigator-initializing');

    // Remove all event listeners to prevent memory leaks
    if (this.#menuToggle) {
      this.#menuToggle.removeEventListener('click', this.toggleMenu);
    }
    if (this.#searchBtn) {
      this.#searchBtn.removeEventListener('click', this.toggleSearch);
    }
    if (this.#searchForm) {
      this.#searchForm.removeEventListener('submit', this.handleSearchSubmit);
    }
  }

  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'menu-data') {
      this.#menuData = parseMenuData(newValue);
      this.render();
      this.setupAccordion();
    }
  }

  /**
 * Render the component structure
 */
  render() {
    // Generate menu HTML from data
    const primaryMenuHTML = createPrimaryMenuHTML(this.#menuData?.primary);
    const secondaryMenuHTML = createSecondaryMenuHTML(this.#menuData?.secondary);
    const eyebrowMenuHTML = createEyebrowMenuHTML(this.#menuData?.eyebrow);
    const mobilePrimaryMenuHTML = createPrimaryMenuHTML(this.#menuData?.primary, false);
    const eyebrowSlot = this.shadowRoot.querySelector()

    const template = html`
        <section class="navigator-component">
          <!-- Eyebrow Menu -->
          ${(eyebrowMenuHTML) && html`
          <div class="eyebrow-container">
            <div class="container">
              ${unsafeHTML(eyebrowMenuHTML)}
              <slot name="eyebrow-slot"></slot>
            </div>
          </div>`
      }
          
          <!-- Main Navigation -->
          <nav class="navigator">
            <div class="container">
              <div class="navigator-container">
                <!-- Logo slot with default -->
                <div class="logo-container">
                  <slot name="logo">
                    <a href="/" class="default-logo">
                      <svg width="67" height="41" viewBox="0 0 67 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                              d="M45.0353 4.66312C45.8331 3.77669 46.7195 3.04539 47.6281 2.46921C49.2236 1.47198 50.9079 0.940125 52.6364 0.940125V15.411C51.3732 11.0232 48.6475 7.25591 45.0353 4.66312ZM66.5533 40.9401H15.2957C6.87461 40.9401 0.0712891 34.1146 0.0712891 25.7157C0.0712891 17.6714 6.3206 11.0675 14.232 10.5135V0.940125C16.0048 0.940125 17.7555 1.44982 19.3954 2.46921C20.304 3.02323 21.1904 3.75453 21.9882 4.59663C25.2458 2.31409 29.1904 0.984446 33.4674 0.984446C33.4674 10.2254 30.1433 20.9734 19.3289 20.9955H33.3566C32.9577 19.2005 31.3178 17.8709 29.3677 17.8487H37.5228C35.5727 17.8487 33.9328 19.2005 33.5339 21.0177H46.6087C49.2236 21.0177 51.8164 21.5274 54.2541 22.5468C56.6696 23.544 58.8857 25.0288 60.725 26.8681C62.5865 28.7296 64.0491 30.9235 65.0464 33.339C66.0436 35.7324 66.5533 38.3252 66.5533 40.9401ZM22.8525 10.7795C23.1849 11.6437 24.0713 12.6188 25.3123 13.3279C26.5533 14.0371 27.8386 14.3252 28.7472 14.1922C28.4148 13.3279 27.5284 12.3529 26.2874 11.6437C25.0464 10.9346 23.761 10.6465 22.8525 10.7795ZM41.5117 13.3279C40.2707 14.0371 38.9854 14.3252 38.0768 14.1922C38.4092 13.3279 39.2957 12.3529 40.5367 11.6437C41.7777 10.9346 43.063 10.6465 43.9716 10.7795C43.6613 11.6437 42.7527 12.6188 41.5117 13.3279Z"
                              fill="currentColor"></path>
                      </svg>
                    </a>
                  </slot>
                </div>
                
                <!-- Desktop Primary Nav Items -->
                <div class="desktop-nav-container">
                  <slot name="nav-items">
                    ${unsafeHTML(primaryMenuHTML)}
                  </slot>
                </div>
                
                <!-- Right-side actions -->
                <div class="navigator-actions">
                  <!-- Search button slot with default -->
                  <button class="search-btn default-search-btn" aria-label="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="10" cy="10" r="8"></circle>
                    <line x1="22" y1="22" x2="16" y2="16"></line>
                  </svg>
                </button>
                  <div class="search-container">
                    <form class="search-form">
                      <input type="text" placeholder="Search..." class="search-input">
                    </form>
                  </div>
                  
                  <!-- Menu toggle button -->
                  <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
                    <div class="hamburger">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </nav>
          
          <!-- Menu Panel -->
          <div class="navigator-wrapper">
            <div class="navigator drawer-content">
              <!-- Mobile version of primary nav items -->
              <div class="mobile-nav-items-container">
                ${unsafeHTML(mobilePrimaryMenuHTML)}
              </div>
              
              <!-- Secondary menu items -->
              <div class="secondary-menu-container">
                ${unsafeHTML(secondaryMenuHTML)}
              </div>
              
              <!-- Custom menu content slot -->
              <slot name="menu-content"></slot>
            </div>
          </div>
        </section>
      `;

    // Render to shadow DOM
    render(template, this.shadowRoot);
  }

}

// Define the custom element
customElements.define('fz-navigator', FzNavigator);

export default FzNavigator;