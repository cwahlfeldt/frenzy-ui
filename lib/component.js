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

        // Store component tag name for reference
        this.componentName = this.tagName.toLowerCase();

        // Apply styles synchronously
        this.#applyStyles(componentStyles);

        // No need for visibility toggling as we're using page-level fade
    }

    /**
     * Apply styles to the shadow DOM
     * @param {string[]} componentStyles - Array of CSS strings for this component
     */
    #applyStyles(componentStyles) {
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

// No global styles are needed here since we're using the page-level fade-in approach