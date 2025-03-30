// Main library entry point for Frenzy UI
// Handles global initialization and component exports

import { onLibraryInitialized } from './theme-loader.js';

// Import all components to register them
import '../components/fz-button/fz-button.js';
// Additional component imports will go here as they're added

/**
 * Initialize the global styling system to prevent FOUC
 */
function initializeGlobalStyles() {
  // Create global stylesheet for uninitialized components
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(`
    /* Hide uninitialized custom elements completely */
    :not(:defined) {
      opacity: 0 !important;
      visibility: hidden;
    }
    
    /* Style for components being initialized */
    .fz-initializing {
      opacity: 0 !important;
    }
    
    /* Transition for initialized components */
    .fz-initialized {
      opacity: 1 !important;
      transition: opacity 0.1s ease-in;
    }
  `);
  
  try {
    // Try to use adoptedStyleSheets (modern browsers)
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets,
      styleSheet
    ];
  } catch (error) {
    // Fallback for older browsers
    const style = document.createElement('style');
    style.textContent = styleSheet.cssRules[0].cssText + 
                        styleSheet.cssRules[1].cssText + 
                        styleSheet.cssRules[2].cssText;
    document.head.appendChild(style);
  }
}

/**
 * Initialize Frenzy UI library
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 */
export function initialize() {
  return new Promise(resolve => {
    // Apply global styles immediately
    initializeGlobalStyles();
    
    // Register callback for when all components are ready
    onLibraryInitialized(() => {
      console.debug('Frenzy UI initialized successfully');
      resolve();
    });
    
    // If no components are registered within 2 seconds, resolve anyway
    // This prevents hanging in case component registration fails
    setTimeout(() => {
      console.debug('Frenzy UI initialization timed out, continuing');
      resolve();
    }, 2000);
  });
}

// Auto-initialize the library on load
initialize().catch(error => {
  console.error('Error initializing Frenzy UI:', error);
});

// Export components and utilities
export * from '../components/fz-button/fz-button.js';
// Add additional exports as components are added

// Export default with initialization control
export default {
  initialize
};