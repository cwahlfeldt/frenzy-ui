// Main library entry point for Frenzy UI
// Handles global initialization and component exports

// Keep track of loaded modules
const loadedModules = new Set();

// Track pending module loads
const pendingModules = new Map();

/**
 * Preload a module for faster access
 * @param {string} modulePath - Path to the module
 * @returns {Promise<any>} Promise that resolves with the module
 */
export function preloadModule(modulePath) {
  // Skip if already loaded or pending
  if (loadedModules.has(modulePath) || pendingModules.has(modulePath)) {
    return pendingModules.get(modulePath);
  }

  // Create a new promise for this module
  const modulePromise = import(modulePath)
    .then(module => {
      loadedModules.add(modulePath);
      pendingModules.delete(modulePath);
      return module;
    });

  // Store pending load
  pendingModules.set(modulePath, modulePromise);

  return modulePromise;
}

/**
 * Initialize the Frenzy UI library
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 */
export async function initialize() {
  // Core modules to load
  const modules = [
    '../components/fz-button/fz-button.js',
    '../components/fz-navigator/fz-navigator.js'
    // Add new component paths here as they are created
  ];

  try {
    // Load all components in parallel
    await Promise.all(modules.map(preloadModule));

    // Immediate completion - no delays
    window.dispatchEvent(new CustomEvent('frenzy-ui-ready'));

    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing Frenzy UI components:', error);
    return Promise.resolve(); // Resolve anyway to avoid hanging
  }
}

// Export all components for direct access
export { FzButton } from '../components/fz-button/fz-button.js';
export { FzNavigator } from '../components/fz-navigator/fz-navigator.js';

// Export default with initialization control
export default {
  initialize,
  preloadModule
};