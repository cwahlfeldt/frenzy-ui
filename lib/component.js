// Base component class for Frenzy UI components
import { themeStyles } from './theme.css.js';
import { baseStyles } from './base.css.js';

/**
 * Base class for all Frenzy UI components
 * Handles shadow DOM initialization and styling
 */
export default class Component extends HTMLElement {
    /**
     * Create a new component
     * @param {string[]} componentStyles - Array of CSS strings for this component
     */
    constructor(componentStyles = []) {
        super();

        // Create shadow DOM
        this.attachShadow({ mode: 'open' });

        // Add initial loading state to prevent FOUC
        this.classList.add('fz-initializing');

        // Store component tag name for reference
        this.componentName = this.tagName.toLowerCase();
        
        // Apply styles immediately
        this._applyStyles(componentStyles);
        
        // Complete initialization after a small delay to ensure fonts are loaded
        // and all styling is applied correctly
        setTimeout(() => {
            // Remove loading state
            this.classList.remove('fz-initializing');
            this.classList.add('fz-initialized');
        }, 50); // Small delay to ensure fonts are loaded properly
    }

    /**
     * Apply styles to the shadow DOM
     * @param {string[]} componentStyles - Array of CSS strings for this component
     */
    _applyStyles(componentStyles) {
        try {
            // Create style element
            const styleElement = document.createElement('style');
            
            // Combine all styles: theme, base, and component-specific
            const allStyles = [
                themeStyles,         // Global theme variables
                baseStyles,          // Base component styles
                ...componentStyles   // Component-specific styles
            ];
            
            // Apply styles
            styleElement.textContent = allStyles.join('\n');
            this.shadowRoot.appendChild(styleElement);
        } catch (error) {
            console.error(`Style setup error for ${this.componentName}:`, error);
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

// Add global styles to prevent FOUC (Flash of Unstyled Content)
(() => {
    const style = document.createElement('style');
    style.textContent = `
    /* Hide components while initializing */
    .fz-initializing {
      opacity: 0 !important;
    }
    
    /* Show components when initialized */
    .fz-initialized {
      opacity: 1 !important;
      transition: opacity 0.1s ease-in-out;
    }
    
    /* Hide undefined elements */
    :not(:defined) {
      opacity: 0;
      visibility: hidden;
    }
  `;
    document.head.appendChild(style);
})();