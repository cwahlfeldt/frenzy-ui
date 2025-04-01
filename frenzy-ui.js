// Frenzy UI Library Entry Point
// This file serves as the main entry point for using the library with a single script tag

document.documentElement.classList.add('fz-loading');

(function () {
  const fadeStyle = document.createElement('style');

  fadeStyle.id = 'fz-fade-style';
  fadeStyle.textContent = /*css*/`
    .fz-loading {
      opacity: 0;
      transition: none;
    }

    .fz-ready {
      opacity: 1;
    }

    @-moz-document url-prefix() {
      .fz-ready {
        opacity: 1;
        transition: opacity 100ms ease-in;
      }
    }

    body {
      padding-top: var(--fz-navigator-height);
      font-family: "Open Sans", sans-serif;
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
        document.documentElement.classList.remove('fz-loading');
        document.documentElement.classList.add('fz-ready');

        // Dispatch the ready event
        window.dispatchEvent(new CustomEvent('fz-ui-ready'));
      }, 50); // Short delay to ensure components are rendered
    });

  } catch (error) {
    console.error('Failed to load Frenzy UI library:', error);

    // Show the page even if there's an error
    document.documentElement.classList.remove('fz-loading');
    document.documentElement.classList.add('fz-ready');
  }
})();