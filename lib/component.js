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
    async _loadTheme() {
        try {
            // Get the component name
            const componentName = this.tagName.toLowerCase();

            // Register component and get theme stylesheet
            const themeSheet = await registerComponent(componentName);

            // Apply stylesheets
            this.shadowRoot.adoptedStyleSheets = [
                themeSheet,
                ...this.componentStyles
            ];
        } catch (error) {
            console.error(`Theme loading error for ${this.tagName.toLowerCase()}:`, error);
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