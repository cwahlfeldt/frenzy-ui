// theme-loader.js - Loads multiple shared stylesheets for all FZ components

// Import stylesheets with the new "with" syntax
import globalStyle from './style.css' with {type: 'css'};
import themeStyle from '../theme.css' with {type: 'css'};

// Cache for component stylesheets
const styleCache = new Map();

// Keep track of registered components
const registeredComponents = new Set();

// Track initialization state
let libraryInitialized = false;
const initializedComponents = new Set();
const initCallbacks = [];

/**
 * Pre-construct theme stylesheets for faster loading
 * @returns {CSSStyleSheet[]} An array of loaded theme stylesheets
 */
function loadTheme() {
  // Re-use existing stylesheets if already loaded
  if (!styleCache.has('theme')) {
    styleCache.set('theme', [globalStyle, themeStyle]);
  }
  return styleCache.get('theme');
}

/**
 * Register a component with the theme system
 * @param {string} componentName - The name of the component
 * @returns {CSSStyleSheet[]} Array of theme stylesheets
 */
export function registerComponent(componentName) {
  if (!registeredComponents.has(componentName)) {
    registeredComponents.add(componentName);
    // Check if all known components are initialized when a new one is registered
    checkInitialization();
  }
  return loadTheme();
}

/**
 * Mark a component as fully initialized with styles applied
 * @param {string} componentName - The name of the component
 */
export function markComponentInitialized(componentName) {
  initializedComponents.add(componentName);
  checkInitialization();
}

/**
 * Check if all registered components are initialized
 * Called when components are registered or initialized
 */
function checkInitialization() {
  // If already marked as initialized, no need to check again
  if (libraryInitialized) return;
  
  // Check if all registered components are also initialized
  const allInitialized = Array.from(registeredComponents).every(name => 
    initializedComponents.has(name)
  );
  
  // If at least one component is registered and all registered are initialized
  if (registeredComponents.size > 0 && allInitialized) {
    libraryInitialized = true;
    // Notify all callbacks
    initCallbacks.forEach(callback => callback());
  }
}

/**
 * Register a callback to be called when all components are initialized
 * @param {Function} callback - Function to call when initialization is complete
 */
export function onLibraryInitialized(callback) {
  if (libraryInitialized) {
    // Call immediately if already initialized
    callback();
  } else {
    // Otherwise add to callback queue
    initCallbacks.push(callback);
  }
}

/**
 * Cache a component's stylesheets for reuse
 * @param {string} componentName - The name of the component
 * @param {CSSStyleSheet[]} styles - The component's stylesheets
 */
export function cacheComponentStyles(componentName, styles) {
  if (!styleCache.has(componentName)) {
    styleCache.set(componentName, styles);
  }
  return styleCache.get(componentName);
}

/**
 * Get cached stylesheets for a component if available
 * @param {string} componentName - The name of the component
 * @returns {CSSStyleSheet[]|null} The cached stylesheets or null
 */
export function getCachedStyles(componentName) {
  return styleCache.has(componentName) ? styleCache.get(componentName) : null;
}

export default { 
  registerComponent, 
  markComponentInitialized,
  onLibraryInitialized,
  cacheComponentStyles,
  getCachedStyles
};