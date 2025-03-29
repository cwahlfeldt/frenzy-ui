// theme-loader.js - Loads the shared theme for all FZ components

// Keep track of whether the theme has been loaded
let themeLoaded = false;
const registeredComponents = new Set();

/**
 * Loads the theme CSS file and applies it to all components
 * @returns {Promise<CSSStyleSheet>} The loaded stylesheet
 */
async function loadTheme() {
  if (themeLoaded) {
    return Promise.resolve(document.adoptedStyleSheets[0]);
  }

  try {
    // Import the CSS file from the root of the project
    const themeStyleSheet = await fetch('/theme.css')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load theme: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(cssText => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cssText);
        return sheet;
      });

    // Mark as loaded
    themeLoaded = true;

    console.log('FZ Theme: Successfully loaded global theme');
    return themeStyleSheet;
  } catch (error) {
    console.error('FZ Theme: Error loading theme', error);
    // Return an empty stylesheet as fallback
    const emptySheet = new CSSStyleSheet();
    return emptySheet;
  }
}

/**
 * Register a component with the theme system
 * @param {string} componentName - The name of the component
 * @returns {Promise<CSSStyleSheet>} The theme stylesheet
 */
export async function registerComponent(componentName) {
  registeredComponents.add(componentName);
  console.log(`FZ Theme: Registered ${componentName}`);
  console.log(`FZ Theme: Currently ${registeredComponents.size} components using the theme system`);

  return loadTheme();
}

export default { registerComponent };