/**
 * FZ Navigator Menu - Helper module for handling menu data and rendering
 */

import { html } from '../../lib/html/lit-html.js';

/**
 * Default menu structure
 */
export const DEFAULT_MENU = {
  eyebrow: [
    { label: "Contact", url: "#contact" },
    { label: "Support", url: "#support" }
  ],
  primary: [
    { label: "Home", url: "#" },
    { label: "Examples", url: "/examples" },
    { label: "Products", url: "#products" },
    { label: "Features", url: "#features" },
    {
      label: "Solutions",
      url: "#solutions",
      children: [
        { label: "Enterprise", url: "#enterprise" },
        { label: "Small Business", url: "#small-business" },
        { label: "Personal", url: "#personal" }
      ]
    }
  ],
  secondary: [
    { label: "About", url: "#about" },
    { label: "Blog", url: "#blog" },
    {
      label: "Resources",
      url: "#resources",
      children: [
        { label: "Documentation", url: "#docs" },
        { label: "Tutorials", url: "#tutorials" },
        { label: "API Reference", url: "#api" }
      ]
    },
    { label: "Pricing", url: "#pricing" }
  ]
};

/**
 * Parse string or object menu data
 * @param {string|object} data - Menu data as string or object
 * @returns {object} Parsed menu data
 */
export function parseMenuData(data) {
  if (!data) {
    return DEFAULT_MENU;
  }

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Invalid menu JSON data:', e);
      return DEFAULT_MENU;
    }
  }

  return data;
}

/**
 * Create lit-html template for the primary menu (horizontal desktop nav)
 * @param {Array} items - Menu items
 * @param {boolean} isDesktop - Whether this is for desktop view
 * @returns {TemplateResult} Lit-html template for the menu
 */
export function createPrimaryMenu(items, isDesktop = true) {
  if (!items || !items.length) {
    return html``;
  }

  const containerClass = isDesktop ? 'desktop-nav-items' : 'mobile-nav-items';

  return html`
    <ul class="${containerClass}">
      ${items.map(item => {
    const hasChildren = item.children && item.children.length > 0;
    const itemClass = hasChildren ? 'menu-item-has-children' : '';

    return html`
          <li class="${itemClass}">
            <a href="${item.url || '#'}">${item.label}</a>
            ${hasChildren ?
        html`
                <ul class="sub-menu">
                  ${item.children.map(child => html`
                    <li><a href="${child.url || '#'}">${child.label}</a></li>
                  `)}
                </ul>
              ` :
        null
      }
          </li>
        `;
  })}
    </ul>
  `;
}

/**
 * Create lit-html template for the secondary menu (drawer menu)
 * @param {Array} items - Menu items
 * @returns {TemplateResult} Lit-html template for the menu
 */
export function createSecondaryMenu(items) {
  if (!items || !items.length) {
    return html``;
  }

  return html`
    <ul class="navigator-items secondary-menu">
      ${items.map(item => {
    const hasChildren = item.children && item.children.length > 0;
    const itemClass = hasChildren ? 'menu-item-has-children' : '';

    return html`
          <li class="${itemClass}">
            <a href="${item.url || '#'}">${item.label}</a>
            ${hasChildren ?
        html`
                <ul class="sub-menu">
                  ${item.children.map(child => html`
                    <li><a href="${child.url || '#'}">${child.label}</a></li>
                  `)}
                </ul>
              ` :
        null
      }
          </li>
        `;
  })}
    </ul>
  `;
}

/**
 * Create lit-html template for the eyebrow menu (top utility links)
 * @param {Array} items - Menu items
 * @returns {TemplateResult} Lit-html template for the menu
 */
export function createEyebrowMenu(items) {
  if (!items || !items.length) {
    return html``;
  }

  return html`
    <ul class="eyebrow-menu">
      ${items.map(item => html`
        <li><a href="${item.url || '#'}">${item.label}</a></li>
      `)}
    </ul>
  `;
}