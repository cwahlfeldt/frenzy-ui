import { html, render } from '../../lib/html/lit-html.js';
import { unsafeHTML } from '../../lib/html/unsafe-html.js';
import FzBaseComponent from '../../lib/component.js';
import buttonStyles from './fz-button.css' with { type: 'css' };

/**
 * FZ Button Component
 */
export class FzButton extends FzBaseComponent {
    #icon = null;
    #iconPosition = 'left';
    #colorScheme = 'primary';

    constructor() {
        super([buttonStyles]);
    }

    static get observedAttributes() {
        return [
            // Common attributes
            'icon', 'icon-position', 'color-scheme', 'disabled',

            // Link specific attributes
            'href', 'target', 'rel', 'download',

            // Button specific attributes
            'type', 'name', 'value', 'form', 'formaction'
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === 'icon') {
            this.#icon = newValue;
        } else if (name === 'icon-position') {
            this.#iconPosition = newValue || 'left';
        } else if (name === 'color-scheme') {
            this.#colorScheme = newValue || 'primary';
        }

        this.render();
    }

    connectedCallback() {
        this.render();
    }

    #createIconTemplate() {
        if (!this.#icon) return null;

        // If the icon appears to be HTML/SVG (contains tags), use unsafeHTML
        if (this.#icon.includes('<') && this.#icon.includes('>')) {
            return html`<span class="icon">${unsafeHTML(this.#icon)}</span>`;
        }

        // Otherwise treat as text/emoji
        return html`<span class="icon">${this.#icon}</span>`;
    }

    render() {
        // Determine if button or link based on href attribute
        const isLink = this.hasAttribute('href');

        // Create icon template if needed
        const iconTemplate = this.#createIconTemplate();

        // Create content based on icon position
        const contentTemplate = this.#iconPosition === 'left'
            ? html`${iconTemplate}<slot></slot>`
            : html`<slot></slot>${iconTemplate}`;

        // Create button or link template
        let template;

        if (isLink) {
            template = html`
                <a 
                href="${this.getAttribute('href')}"
                class="button ${this.#colorScheme}"
                part="button"
                ?target="${this.getAttribute('target')}"
                ?rel="${this.getAttribute('rel')}"
                ?download="${this.getAttribute('download')}"
                ?aria-disabled="${this.hasAttribute('disabled')}"
                ?tabindex="${this.hasAttribute('disabled') ? '-1' : null}"
                >
                ${contentTemplate}
                </a>
            `;
        } else {
            template = html`
                <button 
                type="${this.getAttribute('type') || 'button'}"
                class="button ${this.#colorScheme}"
                part="button"
                ?disabled="${this.hasAttribute('disabled')}"
                ?name="${this.getAttribute('name')}"
                ?value="${this.getAttribute('value')}"
                ?form="${this.getAttribute('form')}"
                ?formaction="${this.getAttribute('formaction')}"
                >
                ${contentTemplate}
                </button>
            `;
        }

        // Render to shadow DOM
        render(template, this.shadowRoot);
    }
}

// Define the custom element
customElements.define('fz-button', FzButton);

export default FzButton;