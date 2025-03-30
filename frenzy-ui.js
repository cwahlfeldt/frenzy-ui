// Frenzy UI Library Entry Point
// This file serves as the main entry point for using the library with a single script tag

// Add fade-in class to document immediately
document.documentElement.classList.add('frenzy-loading');

// Add critical styles for fade-in
(function () {
  const fadeStyle = document.createElement('style');

  fadeStyle.id = 'frenzy-fade-style';
  fadeStyle.textContent = /*css*/`
    /* Initial loading state - everything hidden */
    .frenzy-loading {
      opacity: 0;
      transition: none;
    }
    
    /* Fade-in transition when ready */
    .frenzy-ready {
      opacity: 1;
      transition: opacity 0.2s ease-out;
    }

    @font-face {
      font-family: "Open Sans";
      src: url("/assets/OpenSans-VariableFont_wdth,wght.ttf") format("truetype");
      font-optical-sizing: auto;
      font-weight: 300 800;
      font-style: normal;
      font-variation-settings: "wdth" 100;
      font-display: swap;
    }
    
    @font-face {
      font-family: "Open Sans Italic";
      src: url("/assets/OpenSans-Italic-VariableFont_wdth,wght.ttf") format("truetype");
      font-optical-sizing: auto;
      font-weight: 300 800;
      font-style: italic;
      font-variation-settings: "wdth" 100;
      font-display: swap;
    }
    
    /* Reserve space for navigator component */
    body {
      padding-top: var(--fz-navigator-height, 67.5px);
    }
    
    /* No transitions during initial load */
    html body {
      font-family: var(--fz-font-family-base);
    }
  `;
  document.head.insertBefore(fadeStyle, document.head.firstChild);
})();

// This is a self-executing function to create a module scope
(async function () {

  try {

    // Load and initialize the library
    const FrenzyUI = await import(`./lib/index.js`);
    await FrenzyUI.initialize();

    // Make the library available globally
    window.FrenzyUI = FrenzyUI;

    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Allow layout to stabilize
      setTimeout(() => {
        // Change from loading to ready state (this will trigger the fade-in)
        document.documentElement.classList.remove('frenzy-loading');
        document.documentElement.classList.add('frenzy-ready');

        // Dispatch the ready event
        window.dispatchEvent(new CustomEvent('frenzy-ui-ready'));
      }, 50); // Short delay to ensure components are rendered
    });

  } catch (error) {
    console.error('Failed to load Frenzy UI library:', error);

    // Show the page even if there's an error
    document.documentElement.classList.remove('frenzy-loading');
    document.documentElement.classList.add('frenzy-ready');
  }
})();