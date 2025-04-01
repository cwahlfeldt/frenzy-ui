// Base component class for Frenzy UI components
import { themeStyles } from './theme.css.js';
import { baseStyles } from './base.css.js';
import { frenzyStyles } from './frenzy.css.js';

/**
 * Base class for all Frenzy UI components
 * Handles shadow DOM initialization and styling
 */
export default class Component extends HTMLElement {
    // Static property to track if document styles are already applied
    static documentStylesApplied = false;

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
        // Apply component-specific styles to shadow DOM
        this.#applyComponentStyles(componentStyles);
        // Apply document-level styles (only once)
        this.#ensureDocumentStyles();

        // Initialize as early as possible, but ensure DOM is ready
        if (document.readyState === 'loading') {
            // Use high priority with once: true to ensure execution
            document.addEventListener('DOMContentLoaded', () => this.initialize(), { once: true });
        } else {
            // Initialize immediately but use microtask to ensure styles are established
            queueMicrotask(() => this.initialize());
        }
    }

    initialize() { };

    isSlotFilled(slotName) {
        if (slotName) {
            const slot = this.shadowRoot.querySelector(`slot[name=${slotName}]`)
            return slot ? slot.assignedNodes().length > 0 : false;
        }

        return false;
    }

    /**
     * Apply component-specific styles to the shadow DOM
     * @param {string[]} componentStyles - Array of CSS strings for this component
     */
    #applyComponentStyles(componentStyles) {
        try {
            // Create a constructed stylesheet
            const sheet = new CSSStyleSheet();

            // Replace the stylesheet's contents
            sheet.replaceSync(componentStyles);

            // Adopt the stylesheet in shadow DOM
            this.shadowRoot.adoptedStyleSheets = [sheet];
        } catch (error) {
            console.error(`Shadow DOM style setup error for ${this.componentName}:`, error);

            // Fallback to traditional method if constructed stylesheets aren't supported
            const styleElement = document.createElement('style');
            styleElement.textContent = [themeStyles, baseStyles, ...componentStyles].join('\n');
            this.shadowRoot.appendChild(styleElement);
        }
    }

    /**
     * Ensure document-level styles are applied only once
     * regardless of how many components are instantiated
     */
    #ensureDocumentStyles() {
        // Only apply document styles once across all component instances
        if (!Component.documentStylesApplied) {
            try {
                const styles = [
                    frenzyStyles, // Global theme variables
                ].join('\n');

                // Create a constructed stylesheet for document-level styles
                const documentSheet = new CSSStyleSheet();

                // We could add specific document-level styles here if needed
                // For now, just using theme styles as an example
                documentSheet.replaceSync(styles);

                // Add to document's adopted stylesheets, preserving any existing ones
                document.adoptedStyleSheets = [documentSheet, ...document.adoptedStyleSheets];

                // Mark as applied so we don't add it again
                Component.documentStylesApplied = true;
            } catch (error) {
                console.error('Document style setup error:', error);

                // Fallback for browsers that don't support constructed stylesheets
                if (!document.querySelector('#frenzy-document-styles')) {
                    const styleElement = document.createElement('style');
                    styleElement.id = 'frenzy-document-styles';
                    styleElement.textContent = themeStyles;
                    document.head.appendChild(styleElement);
                    Component.documentStylesApplied = true;
                }
            }
        }
    }
}