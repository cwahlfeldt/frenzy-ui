// Global theme variables
export const themeStyles = /*css*/`
/* 
 * FZ Component Theme System
 * Global CSS variables for all FZ components
 */

/* Color System */
:root {
    /* Brand Colors */
    --fz-color-primary: #0066cc;
    --fz-color-primary-light: #4d94ff;
    --fz-color-primary-dark: #004c99;

    --fz-color-secondary: #6c757d;
    --fz-color-secondary-light: #a1a8ae;
    --fz-color-secondary-dark: #494f54;

    --fz-color-success: #28a745;
    --fz-color-success-light: #48d368;
    --fz-color-success-dark: #1e7e34;

    --fz-color-danger: #dc3545;
    --fz-color-danger-light: #e4606d;
    --fz-color-danger-dark: #bd2130;

    --fz-color-warning: #ffc107;
    --fz-color-warning-light: #ffda6a;
    --fz-color-warning-dark: #d39e00;

    --fz-color-info: #17a2b8;
    --fz-color-info-light: #4dcadc;
    --fz-color-info-dark: #117a8b;

    /* Neutral Colors */
    --fz-color-white: #ffffff;
    --fz-color-gray-100: #f8f9fa;
    --fz-color-gray-200: #e9ecef;
    --fz-color-gray-300: #dee2e6;
    --fz-color-gray-400: #ced4da;
    --fz-color-gray-500: #adb5bd;
    --fz-color-gray-600: #6c757d;
    --fz-color-gray-700: #495057;
    --fz-color-gray-800: #343a40;
    --fz-color-gray-900: #212529;
    --fz-color-black: #000000;

    /* Typography */
    --fz-font-family-base: "Open Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --fz-font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

    --fz-font-size-base: 1rem;
    --fz-font-size-sm: 0.875rem;
    --fz-font-size-lg: 1.25rem;
    --fz-font-size-xs: 0.75rem;
    --fz-font-size-xl: 1.5rem;

    --fz-font-weight-normal: 400;
    --fz-font-weight-medium: 500;
    --fz-font-weight-semibold: 600;
    --fz-font-weight-bold: 700;

    --fz-line-height-tight: 1.25;
    --fz-line-height-base: 1.5;
    --fz-line-height-loose: 1.75;

    /* Spacing */
    --fz-spacing-xs: 0.25rem;
    --fz-spacing-sm: 0.5rem;
    --fz-spacing-md: 1rem;
    --fz-spacing-lg: 1.5rem;
    --fz-spacing-xl: 2rem;
    --fz-spacing-2xl: 3rem;

    /* Border Radius */
    --fz-border-radius-sm: 0.125rem;
    --fz-border-radius: 0.25rem;
    --fz-border-radius-lg: 0.5rem;
    --fz-border-radius-pill: 50rem;

    /* Shadows */
    --fz-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --fz-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --fz-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);

    /* Focus */
    --fz-focus-ring-width: 0.2rem;
    --fz-focus-ring-opacity: 0.25;
    --fz-focus-ring-color: rgba(0, 123, 255, 0.25);

    /* Animation */
    --fz-transition-speed-fast: 150ms;
    --fz-transition-speed-normal: 300ms;
    --fz-transition-speed-slow: 500ms;
    --fz-transition-timing: ease-in-out;

    /* Z-index layers */
    --fz-z-index-dropdown: 1000;
    --fz-z-index-sticky: 1020;
    --fz-z-index-fixed: 1030;
    --fz-z-index-modal-backdrop: 1040;
    --fz-z-index-modal: 1050;
    --fz-z-index-popover: 1060;
    --fz-z-index-tooltip: 1070;
}

/* Button specific */
:root {
    --fz-button-padding-y: var(--fz-spacing-sm);
    --fz-button-padding-x: var(--fz-spacing-lg);
    --fz-button-padding: var(--fz-button-padding-y) var(--fz-button-padding-x);
    --fz-button-font-family: var(--fz-font-family-base);
    --fz-button-font-size: var(--fz-font-size-base);
    --fz-button-font-weight: var(--fz-font-weight-medium);
    --fz-button-line-height: var(--fz-line-height-base);
    --fz-button-border-radius: var(--fz-border-radius);
    --fz-button-transition: all var(--fz-transition-speed-fast) var(--fz-transition-timing);
    --fz-button-focus-ring-color: var(--fz-focus-ring-color);
    --fz-button-disabled-opacity: 0.65;
    --fz-button-icon-spacing: var(--fz-spacing-sm);
    --fz-button-icon-size: 1em;

    /* Color schemes for button */
    --fz-button-primary-bg: var(--fz-color-primary);
    --fz-button-primary-text: var(--fz-color-white);
    --fz-button-primary-hover-bg: var(--fz-color-primary-dark);

    --fz-button-secondary-bg: var(--fz-color-secondary);
    --fz-button-secondary-text: var(--fz-color-white);
    --fz-button-secondary-hover-bg: var(--fz-color-secondary-dark);

    --fz-button-success-bg: var(--fz-color-success);
    --fz-button-success-text: var(--fz-color-white);
    --fz-button-success-hover-bg: var(--fz-color-success-dark);

    --fz-button-danger-bg: var(--fz-color-danger);
    --fz-button-danger-text: var(--fz-color-white);
    --fz-button-danger-hover-bg: var(--fz-color-danger-dark);

    --fz-button-outline-text: var(--fz-color-primary);
    --fz-button-outline-border: currentColor;
    --fz-button-outline-hover-bg: rgba(0, 102, 204, 0.1);

    --fz-button-ghost-text: var(--fz-color-primary);
    --fz-button-ghost-hover-bg: rgba(0, 102, 204, 0.1);
}

/* Navigator specific */
:root {
    --fz-navigator-height: 60px;
    --fz-navigator-search-height: 56px;
    --fz-navigator-eyebrow-height: 36px;

    --fz-navigator-font-family: 'Open Sans', sans-serif;
    --fz-navigator-transition-speed: 0.3s;

    --fz-navigator-bg-color: #fab387;
    --fz-navigator-hamburger-color: #24273a;
    --fz-navigator-item-color: #24273a;
    --fz-navigator-item-hover-color: #000000;
    --fz-navigator-item-active-color: #000000;
  
    --fz-navigator-eyebrow-bg-color: #24273a;
    --fz-navigator-eyebrow-text-color: #ffffff;
    --fz-navigator-eyebrow-hover-color: #fab387;
}
`;

export default themeStyles;