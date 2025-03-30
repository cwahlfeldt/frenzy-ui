/**
 * FZ Navigator Menu - Helper module for handling menu data and rendering
 */

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
 * Create HTML for the primary menu (horizontal desktop nav)
 * @param {Array} items - Menu items
 * @param {boolean} isDesktop - Whether this is for desktop view
 * @returns {string} HTML for the menu
 */
export function createPrimaryMenuHTML(items, isDesktop = true) {
  if (!items || !items.length) {
    return '';
  }

  const containerClass = isDesktop ? 'desktop-nav-items' : 'mobile-nav-items';

  let html = `<ul class="${containerClass}">`;

  items.forEach(item => {
    const hasChildren = item.children && item.children.length > 0;
    const itemClass = hasChildren ? 'menu-item-has-children' : '';

    html += `<li class="${itemClass}">`;
    html += `<a href="${item.url || '#'}">${item.label}</a>`;

    if (hasChildren) {
      html += '<ul class="sub-menu">';
      item.children.forEach(child => {
        html += `<li><a href="${child.url || '#'}">${child.label}</a></li>`;
      });
      html += '</ul>';
    }

    html += '</li>';
  });

  html += '</ul>';
  return html;
}

/**
 * Create HTML for the secondary menu (drawer menu)
 * @param {Array} items - Menu items
 * @returns {string} HTML for the menu
 */
export function createSecondaryMenuHTML(items) {
  if (!items || !items.length) {
    return '';
  }

  let html = '<ul class="navigator-items secondary-menu">';

  items.forEach(item => {
    const hasChildren = item.children && item.children.length > 0;
    const itemClass = hasChildren ? 'menu-item-has-children' : '';

    html += `<li class="${itemClass}">`;
    html += `<a href="${item.url || '#'}">${item.label}</a>`;

    if (hasChildren) {
      html += '<ul class="sub-menu">';
      item.children.forEach(child => {
        html += `<li><a href="${child.url || '#'}">${child.label}</a></li>`;
      });
      html += '</ul>';
    }

    html += '</li>';
  });

  html += '</ul>';
  return html;
}

/**
 * Create HTML for the eyebrow menu (top utility links)
 * @param {Array} items - Menu items
 * @returns {string} HTML for the menu
 */
export function createEyebrowMenuHTML(items) {
  if (!items || !items.length) {
    return '';
  }

  let html = '<ul class="eyebrow-menu">';

  items.forEach(item => {
    html += `<li><a href="${item.url || '#'}">${item.label}</a></li>`;
  });

  html += '</ul>';
  return html;
}
