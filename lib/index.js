// Main library entry point for Frenzy UI
// Handles global initialization and component exports

/**
 * Initialize the Frenzy UI library
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 */
export async function initialize() {
  return new Promise(async (resolve) => {
    try {
      // Load all components
      const components = await Promise.all([
        import('../components/fz-button/fz-button.js'),
        import('../components/fz-navigator/fz-navigator.js')
        // Add new component imports here as they are created
      ]);
      
      // Wait a moment for components to be fully defined and styled
      setTimeout(() => {
        console.debug('Frenzy UI components initialized');
        resolve();
      }, 100);
      
    } catch (error) {
      console.error('Error initializing Frenzy UI components:', error);
      // Resolve anyway to avoid hanging
      resolve();
    }
  });
}

// Export all components
export { FzButton } from '../components/fz-button/fz-button.js';
export { FzNavigator } from '../components/fz-navigator/fz-navigator.js';

// Export default with initialization control
export default {
  initialize
};