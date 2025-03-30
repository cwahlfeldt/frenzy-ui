// Frenzy UI Bundle Entry Point
// This file serves as the main entry point for using the library with a single script tag

// This is a self-executing function to create a module scope
(async function() {
  // Pre-emptively add style to hide uninitialized elements
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Hide custom elements while loading to prevent FOUC */
    :not(:defined) {
      opacity: 0 !important;
      visibility: hidden;
    }
  `;
  document.head.appendChild(styleEl);
  
  // Dynamic import the main library to ensure it's loaded as a module
  try {
    // Get the path to this script to calculate the base path
    const scriptPath = document.currentScript.src;
    const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
    
    // Import the library using the base path
    const FrenzyUI = await import(`${basePath}lib/index.js`);
    
    // Initialize the library
    await FrenzyUI.initialize();
    
    // Make the library available globally
    window.FrenzyUI = FrenzyUI;
    
    // Remove the temporary style element as it's now managed by the library
    setTimeout(() => {
      styleEl.remove();
    }, 500); // Give components a moment to fully initialize
    
    // Dispatch event when ready
    window.dispatchEvent(new CustomEvent('frenzy-ui-ready'));
    
  } catch (error) {
    console.error('Failed to load Frenzy UI library:', error);
  }
})();
