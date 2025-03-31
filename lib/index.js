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
  // Core modules to load - navigator first for faster perceived loading
  const modules = [
    '../components/fz-navigator/fz-navigator.js', // Load navigator first as it's visible immediately
    '../components/fz-button/fz-button.js'
    // Add new component paths here as they are created
  ];

  try {
    // Load each module synchronously in order of visual importance
    // This ensures critical components are defined before proceeding
    for (const modulePath of modules) {
      await import(modulePath);

      // Force synchronous component definition by checking for defined status
      if (modulePath.includes('fz-navigator')) {
        // Wait for navigator to be defined before continuing
        if (!customElements.get('fz-navigator')) {
          // Force a small delay to ensure component registration completes
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    // Force a synchronous layout calculation to ensure styles are applied
    void document.body.offsetHeight;

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