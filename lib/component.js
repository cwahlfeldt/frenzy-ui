// fz-base-component.js - Simplified base class for FZ components

import { 
  registerComponent, 
  markComponentInitialized, 
  cacheComponentStyles, 
  getCachedStyles 
} from './theme-loader.js';

/**
 * Simple base class for FZ components
 * Handles theme registration and shadow DOM initialization
 */
export default class Component extends HTMLElement {
    /**
     * Create a new FzBaseComponent
     * @param {CSSStyleSheet[]} componentStyles - Component-specific stylesheets
     */
    constructor(componentStyles = []) {
        super();

        // Create shadow DOM and apply initial styles immediately
        this.attachShadow({ mode: 'open' });

        // Add initial loading state to prevent FOUC
        this.classList.add('fz-initializing');

        // Store component tag name for reference
        this.componentName = this.tagName.toLowerCase();

        // Cache component styles for reuse or retrieve from cache
        this.componentStyles = getCachedStyles(this.componentName) || 
                              cacheComponentStyles(this.componentName, componentStyles);

        // Apply theme styles immediately to prevent FOUC
        this._applyInitialStyles();

        // Complete style loading asynchronously (prevents blocking rendering)
        queueMicrotask(() => this._completeStyleLoading());
    }

    /**
     * Apply critical styles immediately in constructor
     * This helps prevent FOUC by ensuring basic styling is applied
     * before the first paint cycle
     */
    _applyInitialStyles() {
        try {
            // Get minimal theme stylesheets
            const themeSheets = registerComponent(this.componentName);
            
            // Apply stylesheets immediately
            this.shadowRoot.adoptedStyleSheets = [
                ...themeSheets,
                ...this.componentStyles
            ];
        } catch (error) {
            console.error(`Initial style loading error for ${this.componentName}:`, error);
            // Apply component styles even if theme failed
            if (this.componentStyles.length > 0) {
                this.shadowRoot.adoptedStyleSheets = [...this.componentStyles];
            }
        }
    }

    /**
     * Complete the style loading process
     * This runs after initial paint to avoid blocking rendering
     */
    _completeStyleLoading() {
        try {
            // Mark component as fully styled and initialized
            markComponentInitialized(this.componentName);
            
            // Remove loading state
            this.classList.remove('fz-initializing');
            this.classList.add('fz-initialized');
        } catch (error) {
            console.error(`Style finalization error for ${this.componentName}:`, error);
            // Remove loading class even if there was an error
            this.classList.remove('fz-initializing');
        }
    }

    /**
     * Helper to create an element from HTML string
     */
    createFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
}

/**
 * Add global initialization styles to prevent FOUC
 */
(() => {
    // Add a style sheet to handle uninitialized components
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
        /* Hide components while initializing */
        :not(:defined), .fz-initializing {
            opacity: 0 !important;
        }
        
        /* Show components when initialized */
        .fz-initialized {
            opacity: 1 !important;
            transition: opacity 0.1s ease-in-out;
        }
    `);
    
    // Apply to document
    try {
        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets,
            styleSheet
        ];
    } catch (error) {
        // Fallback for browsers that don't support adoptedStyleSheets
        const style = document.createElement('style');
        style.textContent = `
            /* Hide components while initializing */
            :not(:defined), .fz-initializing {
                opacity: 0 !important;
            }
            
            /* Show components when initialized */
            .fz-initialized {
                opacity: 1 !important;
                transition: opacity 0.1s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }
})();