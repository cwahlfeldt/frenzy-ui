// Frenzy UI Library Entry Point
// This file serves as the main entry point for using the library with a single script tag

// This is a self-executing function to create a module scope
(async function () {
  // Pre-emptively add style to hide uninitialized elements and reserve layout space
  const styleEl = document.createElement('style');
  styleEl.textContent = /*css*/`
    /* Hide custom elements while loading to prevent FOUC */
    @font-face {
      font-family: "Open Sans";
      src: url("./assets/OpenSans-VariableFont_wdth,wght.ttf") format("truetype");
      font-optical-sizing: auto;
      font-weight: 300 800;
      font-style: normal;
      font-variation-settings: "wdth" 100;
    }
    
    @font-face {
      font-family: "Open Sans Italic";
      src: url("./assets/OpenSans-Italic-VariableFont_wdth,wght.ttf") format("truetype");
      font-optical-sizing: auto;
      font-weight: 300 800;
      font-style: italic;
      font-variation-settings: "wdth" 100;
    }
    
    :not(:defined) {
      opacity: 0 !important;
      visibility: hidden;
    }
    
    /* Reserve space for navigator component */
    body {
      font-family: var(--font-family);
      padding-top: var(--fz-navigator-height, 67.5px);
      transition: padding-top 0.01s ease-out;
    }
    
    /* Hide navigator until it's defined */
    fz-navigator:not(:defined) {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--fz-navigator-height, 67.5px);
      z-index: 1000;
    }
  `;
  document.head.appendChild(styleEl);

  // Track loading state
  let componentsLoaded = false;

  // Pre-load fonts to prevent FOUC and text reflow
  const fontLoadPromise = Promise.all([
    // Load Open Sans Regular
    new FontFace('Open Sans', 'url("./assets/OpenSans-VariableFont_wdth,wght.ttf")', {
      style: 'normal',
      weight: '300 800',
    }).load(),

    // Load Open Sans Italic
    new FontFace('Open Sans Italic', 'url("./assets/OpenSans-Italic-VariableFont_wdth,wght.ttf")', {
      style: 'italic',
      weight: '300 800'
    }).load()
  ]).then(fonts => {
    // Add fonts to document
    fonts.forEach(font => document.fonts.add(font));
    console.debug('Fonts loaded successfully');
  }).catch(error => {
    console.warn('Error loading fonts:', error);
  });

  // Set a timeout to remove the style if loading takes too long
  const fallbackTimer = setTimeout(() => {
    if (!componentsLoaded) {
      console.warn('Frenzy UI components taking longer than expected to load. Removing placeholder styles.');
      styleEl.remove();
    }
  }, 2000);

  // Dynamic import the main library to ensure it's loaded as a module
  try {
    // Get the path to this script to calculate the base path
    const scriptPath = document.currentScript.src;
    const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);

    // Import the library using the base path
    const FrenzyUI = await import(`${basePath}lib/index.js`);

    // Wait for fonts to load before initializing
    await fontLoadPromise;

    // Initialize the library
    await FrenzyUI.initialize();

    // Make the library available globally
    window.FrenzyUI = FrenzyUI;

    // Set loading state
    componentsLoaded = true;

    // Remove the temporary style element as it's now managed by the library
    clearTimeout(fallbackTimer);
    setTimeout(() => {
      styleEl.remove();
    }, 300); // Give components a moment to fully initialize

    // Dispatch event when ready
    window.dispatchEvent(new CustomEvent('frenzy-ui-ready'));

  } catch (error) {
    console.error('Failed to load Frenzy UI library:', error);
    // Remove style element on error to prevent permanent styling issues
    styleEl.remove();
  }
})();
