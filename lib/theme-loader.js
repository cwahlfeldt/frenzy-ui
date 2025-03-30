// theme-loader.js - Loads multiple shared stylesheets for all FZ components

// Import stylesheets with the new "with" syntax
import globalStyle from './style.css' with {type: 'css'};
import themeStyle from '../theme.css' with {type: 'css'};

// Keep track of whether the theme has been loaded
const registeredComponents = new Set();

/**
 * Loads the theme CSS files and returns them as an array
 * @returns {CSSStyleSheet[]} An array of loaded stylesheets
 */
function loadTheme() {
  return [globalStyle, themeStyle];
}

/**
 * Register a component with the theme system
 * @param {string} componentName - The name of the component
 * @returns {CSSStyleSheet[]} Array of theme stylesheets
 */
export function registerComponent(componentName) {
  registeredComponents.add(componentName);
  return loadTheme();
}

export default { registerComponent };