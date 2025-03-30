// Frenzy UI Library Entry Point
// This file serves as the main entry point for using the library with a single script tag

// This is a self-executing function to create a module scope
(async function () {
  // Store the script path early, before entering async context
  const scriptPath = document.currentScript?.src || '';
  const basePath = scriptPath ? scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1) : './';

  // Pre-emptively add style to hide uninitialized elements and reserve layout space
  const styleEl = document.createElement('style');
  styleEl.textContent = /*css*/`
    /* Hide custom elements while loading to prevent FOUC */
    @font-face {
      font-family: "Open Sans";
      src: url("${basePath}assets/OpenSans-VariableFont_wdth,wght.ttf") format("truetype");
      font-optical-sizing: auto;
      font-weight: 300 800;
      font-style: normal;
      font-variation-settings: "wdth" 100;
    }
    
    @font-face {
      font-family: "Open Sans Italic";
      src: url("${basePath}assets/OpenSans-Italic-VariableFont_wdth,wght.ttf") format("truetype");
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
    }
    
    /* Add transition only when not in performance testing mode */
    html body {
      transition: padding-top 0.2s ease-out;
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

  // Simple parallel loading approach
  try {
    // Start loading fonts immediately
    const fontPromise = Promise.all([
      // Load Open Sans Regular
      new FontFace('Open Sans', `url("${basePath}assets/OpenSans-VariableFont_wdth,wght.ttf")`, {
        style: 'normal',
        weight: '300 800',
      }).load(),

      // Load Open Sans Italic
      new FontFace('Open Sans Italic', `url("${basePath}assets/OpenSans-Italic-VariableFont_wdth,wght.ttf")`, {
        style: 'italic',
        weight: '300 800'
      }).load()
    ]).then(fonts => {
      // Add fonts to document
      fonts.forEach(font => document.fonts.add(font));
      return fonts;
    });

    // Load the library in parallel with fonts
    const FrenzyUI = await import(`${basePath}lib/index.js`);

    // Ensure fonts are loaded before initializing
    await fontPromise;

    // Initialize the library - this is now faster with the optimized initialize() function
    await FrenzyUI.initialize();

    // Make the library available globally
    window.FrenzyUI = FrenzyUI;

    // No delays if transitions are disabled
    styleEl.remove();

    // Dispatch event when ready
    window.dispatchEvent(new CustomEvent('frenzy-ui-ready'));

  } catch (error) {
    console.error('Failed to load Frenzy UI library:', error);
    // Remove style element on error to prevent permanent styling issues
    styleEl.remove();
  }
})();