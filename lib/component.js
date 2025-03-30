// fz-base-component.js - Simplified base class for FZ components

import { registerComponent } from './theme-loader.js';

/**
 * Simple base class for FZ components
 * Handles theme registration and shadow DOM initialization
 */
export class Component extends HTMLElement {
    /**
     * Create a new FzBaseComponent
     * @param {CSSStyleSheet[]} componentStyles - Component-specific stylesheets
     */
    constructor(componentStyles = []) {
        super();

        // Create shadow DOM
        this.attachShadow({ mode: 'open' });

        // Store component stylesheets
        this.componentStyles = componentStyles;

        // Initialize the theme
        this._loadTheme();
    }

    /**
     * Load and apply the theme
     */
    _loadTheme() {
        try {
            // Get the component name
            const componentName = this.tagName.toLowerCase();

            // Register component and get theme stylesheets
            const themeSheets = registerComponent(componentName);

            // Apply all stylesheets
            this.shadowRoot.adoptedStyleSheets = [
                ...themeSheets,
                ...this.componentStyles
            ];
        } catch (error) {
            console.error(`Theme loading error for ${this.tagName.toLowerCase()}:`, error);
            // Apply component styles even if theme failed
            if (this.componentStyles.length > 0) {
                this.shadowRoot.adoptedStyleSheets = [...this.componentStyles];
            }
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

export default Component;