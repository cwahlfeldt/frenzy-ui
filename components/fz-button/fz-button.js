// Import lit-html
import { html, render } from '../../lib/lit-html.js';
import buttonStyles from './fz-button.css' with { type: 'css' };

// Define the FzButton class
class FzButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Add styles to shadow root
        this.shadowRoot.adoptedStyleSheets = [buttonStyles];

        // Initialize internal state
        this._icon = null;
        this._iconPosition = 'left';
        this._colorScheme = 'primary';
    }

    // Observed attributes
    static get observedAttributes() {
        return [
            // Common attributes
            'icon', 'icon-position', 'color-scheme', 'disabled',

            // Link specific attributes
            'href', 'target', 'rel', 'download', 'hreflang', 'ping', 'referrerpolicy',

            // Button specific attributes
            'type', 'name', 'value', 'form', 'formaction', 'formenctype',
            'formmethod', 'formnovalidate', 'formtarget', 'autofocus'
        ];
    }

    // Attribute changed callback
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        // Store special attributes internally
        if (name === 'icon') {
            this._icon = newValue;
        } else if (name === 'icon-position') {
            this._iconPosition = newValue || 'left';
        } else if (name === 'color-scheme') {
            this._colorScheme = newValue || 'primary';
        }

        this.render();
    }

    // Connected callback - when the element is added to the DOM
    connectedCallback() {
        this.render();
    }

    // Render method using lit-html
    render() {
        // Get button or link attributes
        const isLink = this.hasAttribute('href');
        const elementType = isLink ? 'a' : 'button';

        // Create attributes object for the element
        const attrs = {};

        // Process all attributes for the element
        if (isLink) {
            // Link attributes
            this._copyAttribute(attrs, 'href');
            this._copyAttribute(attrs, 'target');
            this._copyAttribute(attrs, 'rel');
            this._copyAttribute(attrs, 'download');
            this._copyAttribute(attrs, 'hreflang');
            this._copyAttribute(attrs, 'ping');
            this._copyAttribute(attrs, 'referrerpolicy');

            // Class and part
            attrs.class = `button ${this._colorScheme}`;
            attrs.part = 'button';

            // Disabled state for links
            if (this.hasAttribute('disabled')) {
                attrs['aria-disabled'] = 'true';
                attrs.tabindex = '-1';
            }
        } else {
            // Button attributes
            attrs.type = this.getAttribute('type') || 'button';
            this._copyAttribute(attrs, 'name');
            this._copyAttribute(attrs, 'value');
            this._copyAttribute(attrs, 'disabled');
            this._copyAttribute(attrs, 'form');
            this._copyAttribute(attrs, 'formaction');
            this._copyAttribute(attrs, 'formenctype');
            this._copyAttribute(attrs, 'formmethod');
            this._copyAttribute(attrs, 'formnovalidate');
            this._copyAttribute(attrs, 'formtarget');
            this._copyAttribute(attrs, 'autofocus');

            // Class and part
            attrs.class = `button ${this._colorScheme}`;
            attrs.part = 'button';
        }

        // Create the icon element if an icon is provided
        let iconHtml = '';
        if (this._icon) {
            // Determine the icon type and render accordingly
            if (this._icon.startsWith('<svg') || this._icon.startsWith('<img')) {
                // If it's an SVG or IMG tag, use it directly
                iconHtml = html`<span class="icon">${this._createElementFromString(this._icon)}</span>`;
            } else {
                // Otherwise, render as text (emoji, character, etc.)
                iconHtml = html`<span class="icon">${this._icon}</span>`;
            }
        }

        // Create the element with all attributes
        const element = document.createElement(elementType);
        for (const [key, value] of Object.entries(attrs)) {
            if (value !== null && value !== undefined) {
                element.setAttribute(key, value);
            }
        }

        // Handle the icon position and content
        if (this._iconPosition === 'left' && this._icon) {
            element.appendChild(this._createElementFromString(`<span class="icon">${this._icon}</span>`));
        }

        // Add the slot
        const slot = document.createElement('slot');
        element.appendChild(slot);

        if (this._iconPosition === 'right' && this._icon) {
            element.appendChild(this._createElementFromString(`<span class="icon">${this._icon}</span>`));
        }

        // Clear and render to the shadow root
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        this.shadowRoot.appendChild(element);
    }

    // Helper method to copy attributes
    _copyAttribute(target, name) {
        const actualName = name.includes('-') ? name : name;
        if (this.hasAttribute(actualName)) {
            target[name] = this.getAttribute(actualName);
        }
    }

    // Helper method to create element from string
    _createElementFromString(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
}

// Define the custom element
customElements.define('fz-button', FzButton);

export default FzButton;