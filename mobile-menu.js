// Mobile Menu Web Component
class MobileMenu extends HTMLElement {
  constructor() {
    super();
    
    // Create a shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initial setup
    this.isOpen = false;
    
    // Create the component structure
    this.render();
    
    // Add styles
    this.addStyles();
    
    // Initialize after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }
  
  // Render the component structure
  render() {
    this.shadowRoot.innerHTML = `
      <div class="mobile-menu-component">
        <!-- Mobile Nav -->
        <nav class="mobile-nav">
          <div class="container">
            <div class="mobile-nav-container">
              <!-- Logo slot -->
              <slot name="logo"></slot>
              
              <!-- Right-side actions -->
              <div class="mobile-nav-actions">
                <!-- Search button slot -->
                <slot name="search-button"></slot>
                
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
        
        <!-- Mobile Menu Panel -->
        <div class="mobile-menu-wrapper">
          <div class="mobile-menu">
            <!-- Menu content slot -->
            <slot name="menu-content"></slot>
          </div>
        </div>
      </div>
    `;
  }
  
  // Add component styles
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        --primary: #b31b34;
        --construction: #e58e1a;
        --power-sports: #0072e9;
        --lawn-garden: #ffcf00;
        --black: #000000;
        --white: #ffffff;
        --grey: #e6e7e8;
        --font-family: 'Open Sans', sans-serif;
        --transition-speed: 0.3s;
        --mobile-nav-height: 72px;
      }
      
      .mobile-menu-component {
        font-family: var(--font-family);
      }
      
      /* Mobile Nav */
      .mobile-nav {
        background-color: var(--primary);
        padding: 1rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        height: var(--mobile-nav-height);
      }
      
      .container {
        width: 100%;
        margin: 0 auto;
        padding: 0 15px;
      }
      
      .mobile-nav-container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      
      .mobile-nav-actions {
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
      }
      
      /* Hamburger Menu */
      .menu-toggle {
        background: none;
        border: none;
        color: var(--white);
        cursor: pointer;
        padding: 0.5rem;
        margin-left: 0.5rem;
      }
      
      .menu-toggle:focus {
        outline: none;
      }
      
      .hamburger {
        display: inline-block;
        position: relative;
        width: 24px;
        height: 24px;
      }
      
      .hamburger span {
        display: block;
        position: absolute;
        height: 2px;
        width: 100%;
        background: var(--white);
        opacity: 1;
        left: 0;
        transform: rotate(0deg);
        transition: .25s ease-in-out;
      }
      
      .hamburger span:nth-child(1) {
        top: 6px;
      }
      
      .hamburger span:nth-child(2), 
      .hamburger span:nth-child(3) {
        top: 12px;
      }
      
      .hamburger span:nth-child(4) {
        top: 18px;
      }
      
      .menu-toggle.active .hamburger span:nth-child(1) {
        top: 12px;
        width: 0%;
        left: 50%;
      }
      
      .menu-toggle.active .hamburger span:nth-child(2) {
        transform: rotate(45deg);
      }
      
      .menu-toggle.active .hamburger span:nth-child(3) {
        transform: rotate(-45deg);
      }
      
      .menu-toggle.active .hamburger span:nth-child(4) {
        top: 12px;
        width: 0%;
        left: 50%;
      }
      
      /* Mobile Menu */
      .mobile-menu-wrapper {
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: var(--white);
        transform: translateX(100%);
        transition: transform var(--transition-speed) ease;
        z-index: 999;
        pointer-events: none;
      }
      
      .mobile-menu-wrapper.active {
        transform: translateX(0);
        pointer-events: auto;
      }
      
      .mobile-menu {
        padding: 2rem 1rem;
        height: 100%;
        overflow-y: auto;
        padding-top: calc(var(--mobile-nav-height) + 1rem);
        padding-bottom: 2rem;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Utility for slotted content */
      ::slotted(.mobile-menu-items) {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem 0;
      }
      
      ::slotted(.mobile-menu-items li) {
        margin-bottom: 1rem;
      }
    `;
    
    this.shadowRoot.appendChild(style);
  }
  
  // Initialize component functionality
  initialize() {
    // Add body class for mobile nav spacing
    document.body.classList.add('has-mobile-nav');
    document.body.style.paddingTop = getComputedStyle(this).getPropertyValue('--mobile-nav-height');
    
    // Get elements
    this.menuToggle = this.shadowRoot.querySelector('.menu-toggle');
    this.mobileMenuWrapper = this.shadowRoot.querySelector('.mobile-menu-wrapper');
    
    // Attach event listeners
    this.addEventListeners();
    
    // Set up accordion for menu items
    this.setupAccordion();
  }
  
  // Add component event listeners
  addEventListeners() {
    // Toggle mobile menu
    this.menuToggle.addEventListener('click', () => {
      this.toggleMenu();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1200) {
        document.body.classList.remove('has-mobile-nav');
        document.body.style.paddingTop = '0';
      } else {
        document.body.classList.add('has-mobile-nav');
        document.body.style.paddingTop = getComputedStyle(this).getPropertyValue('--mobile-nav-height');
      }
    });
  }
  
  // Toggle menu open/close
  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.menuToggle.classList.toggle('active');
    this.mobileMenuWrapper.classList.toggle('active');
    document.body.classList.toggle('mobile-nav-is-open');
    
    // Update aria-expanded
    this.menuToggle.setAttribute('aria-expanded', this.isOpen);
  }
  
  // Set up accordion functionality for menu items
  setupAccordion() {
    // Get the slot element
    const menuSlot = this.shadowRoot.querySelector('slot[name="menu-content"]');
    
    // Wait for slotchange event to access assigned nodes
    menuSlot.addEventListener('slotchange', () => {
      // Get assigned elements from slot
      const assignedElements = menuSlot.assignedElements();
      
      assignedElements.forEach(element => {
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
    });
  }
  
  // Called when component is disconnected from the DOM
  disconnectedCallback() {
    document.body.classList.remove('has-mobile-nav');
    document.body.classList.remove('mobile-nav-is-open');
    document.body.style.paddingTop = '0';
  }
}

// Register the custom element
customElements.define('mobile-menu', MobileMenu);