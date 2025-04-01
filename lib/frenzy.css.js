export const frenzyStyles = /*css*/`

:root,
:host {
  --fz-font-family-emoji: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --fz-font-family-sans-serif: system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, Helvetica, Arial, "Helvetica Neue", sans-serif, var(--fz-font-family-emoji);
  --fz-font-family-monospace: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace, var(--fz-font-family-emoji);
  --fz-font-family: var(--fz-font-family-sans-serif);
  --fz-line-height: 1.5;
  --fz-font-weight: 400;
  --fz-font-size: 100%;
  --fz-text-underline-offset: 0.1rem;
  --fz-border-radius: 0.25rem;
  --fz-border-width: 0.0625rem;
  --fz-outline-width: 0.125rem;
  --fz-transition: 0.2s ease-in-out;
  --fz-spacing: 1rem;
  --fz-typography-spacing-vertical: 1rem;
  --fz-block-spacing-vertical: var(--fz-spacing);
  --fz-block-spacing-horizontal: var(--fz-spacing);
  --fz-grid-column-gap: var(--fz-spacing);
  --fz-grid-row-gap: var(--fz-spacing);
  --fz-form-element-spacing-vertical: 0.75rem;
  --fz-form-element-spacing-horizontal: 1rem;
  --fz-group-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-group-box-shadow-focus-with-button: 0 0 0 var(--fz-outline-width) var(--fz-primary-focus);
  --fz-group-box-shadow-focus-with-input: 0 0 0 0.0625rem var(--fz-form-element-border-color);
  --fz-modal-overlay-backdrop-filter: blur(0.375rem);
  --fz-nav-element-spacing-vertical: 1rem;
  --fz-nav-element-spacing-horizontal: 0.5rem;
  --fz-nav-link-spacing-vertical: 0.5rem;
  --fz-nav-link-spacing-horizontal: 0.5rem;
  --fz-nav-breadcrumb-divider: ">";
  --fz-icon-checkbox: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  --fz-icon-minus: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E");
  --fz-icon-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  --fz-icon-date: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  --fz-icon-time: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
  --fz-icon-search: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
  --fz-icon-close: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");
  --fz-icon-loading: url("data:image/svg+xml,%3Csvg fill='none' height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' %3E%3Cstyle%3E g %7B animation: rotate 2s linear infinite; transform-origin: center center; %7D circle %7B stroke-dasharray: 75,100; stroke-dashoffset: -5; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; %7D @keyframes rotate %7B 0%25 %7B transform: rotate(0deg); %7D 100%25 %7B transform: rotate(360deg); %7D %7D @keyframes dash %7B 0%25 %7B stroke-dasharray: 1,100; stroke-dashoffset: 0; %7D 50%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -17.5; %7D 100%25 %7B stroke-dasharray: 44.5,100; stroke-dashoffset: -62; %7D %7D %3C/style%3E%3Cg%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='rgb(136, 145, 164)' stroke-width='4' /%3E%3C/g%3E%3C/svg%3E");
}
@media (min-width: 576px) {
  :root,
  :host {
    --fz-font-size: 106.25%;
  }
}
@media (min-width: 768px) {
  :root,
  :host {
    --fz-font-size: 112.5%;
  }
}
@media (min-width: 1024px) {
  :root,
  :host {
    --fz-font-size: 118.75%;
  }
}
@media (min-width: 1280px) {
  :root,
  :host {
    --fz-font-size: 125%;
  }
}
@media (min-width: 1536px) {
  :root,
  :host {
    --fz-font-size: 131.25%;
  }
}

a {
  --fz-text-decoration: underline;
}
a.secondary, a.contrast {
  --fz-text-decoration: underline;
}

small {
  --fz-font-size: 0.875em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  --fz-font-weight: 700;
}

h1 {
  --fz-font-size: 2rem;
  --fz-line-height: 1.125;
  --fz-typography-spacing-top: 3rem;
}

h2 {
  --fz-font-size: 1.75rem;
  --fz-line-height: 1.15;
  --fz-typography-spacing-top: 2.625rem;
}

h3 {
  --fz-font-size: 1.5rem;
  --fz-line-height: 1.175;
  --fz-typography-spacing-top: 2.25rem;
}

h4 {
  --fz-font-size: 1.25rem;
  --fz-line-height: 1.2;
  --fz-typography-spacing-top: 1.874rem;
}

h5 {
  --fz-font-size: 1.125rem;
  --fz-line-height: 1.225;
  --fz-typography-spacing-top: 1.6875rem;
}

h6 {
  --fz-font-size: 1rem;
  --fz-line-height: 1.25;
  --fz-typography-spacing-top: 1.5rem;
}

thead th,
thead td,
tfoot th,
tfoot td {
  --fz-font-weight: 600;
  --fz-border-width: 0.1875rem;
}

pre,
code,
kbd,
samp {
  --fz-font-family: var(--fz-font-family-monospace);
}

kbd {
  --fz-font-weight: bolder;
}

input:not([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[type=file]),
:where(select, textarea) {
  --fz-outline-width: 0.0625rem;
}

[type=search] {
  --fz-border-radius: 5rem;
}

[type=checkbox],
[type=radio] {
  --fz-border-width: 0.125rem;
}

[type=checkbox][role=switch] {
  --fz-border-width: 0.1875rem;
}

details.dropdown summary:not([role=button]) {
  --fz-outline-width: 0.0625rem;
}

nav details.dropdown summary:focus-visible {
  --fz-outline-width: 0.125rem;
}

[role=search] {
  --fz-border-radius: 5rem;
}

[role=search]:has(button.secondary:focus,
[type=submit].secondary:focus,
[type=button].secondary:focus,
[role=button].secondary:focus),
[role=group]:has(button.secondary:focus,
[type=submit].secondary:focus,
[type=button].secondary:focus,
[role=button].secondary:focus) {
  --fz-group-box-shadow-focus-with-button: 0 0 0 var(--fz-outline-width) var(--fz-secondary-focus);
}
[role=search]:has(button.contrast:focus,
[type=submit].contrast:focus,
[type=button].contrast:focus,
[role=button].contrast:focus),
[role=group]:has(button.contrast:focus,
[type=submit].contrast:focus,
[type=button].contrast:focus,
[role=button].contrast:focus) {
  --fz-group-box-shadow-focus-with-button: 0 0 0 var(--fz-outline-width) var(--fz-contrast-focus);
}
[role=search] button,
[role=search] [type=submit],
[role=search] [type=button],
[role=search] [role=button],
[role=group] button,
[role=group] [type=submit],
[role=group] [type=button],
[role=group] [role=button] {
  --fz-form-element-spacing-horizontal: 2rem;
}

details summary[role=button]:not(.outline)::after {
  filter: brightness(0) invert(1);
}

[aria-busy=true]:not(input, select, textarea):is(button, [type=submit], [type=button], [type=reset], [role=button]):not(.outline)::before {
  filter: brightness(0) invert(1);
}

/**
 * Color schemes
 */
[data-theme=light],
:root:not([data-theme=dark]),
:host(:not([data-theme=dark])) {
  color-scheme: light;
  --fz-background-color: #fff;
  --fz-color: #373c44;
  --fz-text-selection-color: rgba(2, 154, 232, 0.25);
  --fz-muted-color: #646b79;
  --fz-muted-border-color: rgb(231, 234, 239.5);
  --fz-primary: #0172ad;
  --fz-primary-background: #0172ad;
  --fz-primary-border: var(--fz-primary-background);
  --fz-primary-underline: rgba(1, 114, 173, 0.5);
  --fz-primary-hover: #015887;
  --fz-primary-hover-background: #02659a;
  --fz-primary-hover-border: var(--fz-primary-hover-background);
  --fz-primary-hover-underline: var(--fz-primary-hover);
  --fz-primary-focus: rgba(2, 154, 232, 0.5);
  --fz-primary-inverse: #fff;
  --fz-secondary: #5d6b89;
  --fz-secondary-background: #525f7a;
  --fz-secondary-border: var(--fz-secondary-background);
  --fz-secondary-underline: rgba(93, 107, 137, 0.5);
  --fz-secondary-hover: #48536b;
  --fz-secondary-hover-background: #48536b;
  --fz-secondary-hover-border: var(--fz-secondary-hover-background);
  --fz-secondary-hover-underline: var(--fz-secondary-hover);
  --fz-secondary-focus: rgba(93, 107, 137, 0.25);
  --fz-secondary-inverse: #fff;
  --fz-contrast: #181c25;
  --fz-contrast-background: #181c25;
  --fz-contrast-border: var(--fz-contrast-background);
  --fz-contrast-underline: rgba(24, 28, 37, 0.5);
  --fz-contrast-hover: #000;
  --fz-contrast-hover-background: #000;
  --fz-contrast-hover-border: var(--fz-contrast-hover-background);
  --fz-contrast-hover-underline: var(--fz-secondary-hover);
  --fz-contrast-focus: rgba(93, 107, 137, 0.25);
  --fz-contrast-inverse: #fff;
  --fz-box-shadow: 0.0145rem 0.029rem 0.174rem rgba(129, 145, 181, 0.01698), 0.0335rem 0.067rem 0.402rem rgba(129, 145, 181, 0.024), 0.0625rem 0.125rem 0.75rem rgba(129, 145, 181, 0.03), 0.1125rem 0.225rem 1.35rem rgba(129, 145, 181, 0.036), 0.2085rem 0.417rem 2.502rem rgba(129, 145, 181, 0.04302), 0.5rem 1rem 6rem rgba(129, 145, 181, 0.06), 0 0 0 0.0625rem rgba(129, 145, 181, 0.015);
  --fz-h1-color: #2d3138;
  --fz-h2-color: #373c44;
  --fz-h3-color: #424751;
  --fz-h4-color: #4d535e;
  --fz-h5-color: #5c6370;
  --fz-h6-color: #646b79;
  --fz-mark-background-color: rgb(252.5, 230.5, 191.5);
  --fz-mark-color: #0f1114;
  --fz-ins-color: rgb(28.5, 105.5, 84);
  --fz-del-color: rgb(136, 56.5, 53);
  --fz-blockquote-border-color: var(--fz-muted-border-color);
  --fz-blockquote-footer-color: var(--fz-muted-color);
  --fz-button-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-button-hover-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-table-border-color: var(--fz-muted-border-color);
  --fz-table-row-stripped-background-color: rgba(111, 120, 135, 0.0375);
  --fz-code-background-color: rgb(243, 244.5, 246.75);
  --fz-code-color: #646b79;
  --fz-code-kbd-background-color: var(--fz-color);
  --fz-code-kbd-color: var(--fz-background-color);
  --fz-form-element-background-color: rgb(251, 251.5, 252.25);
  --fz-form-element-selected-background-color: #dfe3eb;
  --fz-form-element-border-color: #cfd5e2;
  --fz-form-element-color: #23262c;
  --fz-form-element-placeholder-color: var(--fz-muted-color);
  --fz-form-element-active-background-color: #fff;
  --fz-form-element-active-border-color: var(--fz-primary-border);
  --fz-form-element-focus-color: var(--fz-primary-border);
  --fz-form-element-disabled-opacity: 0.5;
  --fz-form-element-invalid-border-color: rgb(183.5, 105.5, 106.5);
  --fz-form-element-invalid-active-border-color: rgb(200.25, 79.25, 72.25);
  --fz-form-element-invalid-focus-color: var(--fz-form-element-invalid-active-border-color);
  --fz-form-element-valid-border-color: rgb(76, 154.5, 137.5);
  --fz-form-element-valid-active-border-color: rgb(39, 152.75, 118.75);
  --fz-form-element-valid-focus-color: var(--fz-form-element-valid-active-border-color);
  --fz-switch-background-color: #bfc7d9;
  --fz-switch-checked-background-color: var(--fz-primary-background);
  --fz-switch-color: #fff;
  --fz-switch-thumb-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-range-border-color: #dfe3eb;
  --fz-range-active-border-color: #bfc7d9;
  --fz-range-thumb-border-color: var(--fz-background-color);
  --fz-range-thumb-color: var(--fz-secondary-background);
  --fz-range-thumb-active-color: var(--fz-primary-background);
  --fz-accordion-border-color: var(--fz-muted-border-color);
  --fz-accordion-active-summary-color: var(--fz-primary-hover);
  --fz-accordion-close-summary-color: var(--fz-color);
  --fz-accordion-open-summary-color: var(--fz-muted-color);
  --fz-card-background-color: var(--fz-background-color);
  --fz-card-border-color: var(--fz-muted-border-color);
  --fz-card-box-shadow: var(--fz-box-shadow);
  --fz-card-sectioning-background-color: rgb(251, 251.5, 252.25);
  --fz-dropdown-background-color: #fff;
  --fz-dropdown-border-color: #eff1f4;
  --fz-dropdown-box-shadow: var(--fz-box-shadow);
  --fz-dropdown-color: var(--fz-color);
  --fz-dropdown-hover-background-color: #eff1f4;
  --fz-loading-spinner-opacity: 0.5;
  --fz-modal-overlay-background-color: rgba(232, 234, 237, 0.75);
  --fz-progress-background-color: #dfe3eb;
  --fz-progress-color: var(--fz-primary-background);
  --fz-tooltip-background-color: var(--fz-contrast-background);
  --fz-tooltip-color: var(--fz-contrast-inverse);
  --fz-icon-valid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(76, 154.5, 137.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  --fz-icon-invalid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(200.25, 79.25, 72.25)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
}
[data-theme=light] input:is([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[type=file]),
:root:not([data-theme=dark]) input:is([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[type=file]),
:host(:not([data-theme=dark])) input:is([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[type=file]) {
  --fz-form-element-focus-color: var(--fz-primary-focus);
}

@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]),
  :host(:not([data-theme])) {
    color-scheme: dark;
    --fz-background-color: rgb(19, 22.5, 30.5);
    --fz-color: #c2c7d0;
    --fz-text-selection-color: rgba(1, 170, 255, 0.1875);
    --fz-muted-color: #7b8495;
    --fz-muted-border-color: #202632;
    --fz-primary: #01aaff;
    --fz-primary-background: #0172ad;
    --fz-primary-border: var(--fz-primary-background);
    --fz-primary-underline: rgba(1, 170, 255, 0.5);
    --fz-primary-hover: #79c0ff;
    --fz-primary-hover-background: #017fc0;
    --fz-primary-hover-border: var(--fz-primary-hover-background);
    --fz-primary-hover-underline: var(--fz-primary-hover);
    --fz-primary-focus: rgba(1, 170, 255, 0.375);
    --fz-primary-inverse: #fff;
    --fz-secondary: #969eaf;
    --fz-secondary-background: #525f7a;
    --fz-secondary-border: var(--fz-secondary-background);
    --fz-secondary-underline: rgba(150, 158, 175, 0.5);
    --fz-secondary-hover: #b3b9c5;
    --fz-secondary-hover-background: #5d6b89;
    --fz-secondary-hover-border: var(--fz-secondary-hover-background);
    --fz-secondary-hover-underline: var(--fz-secondary-hover);
    --fz-secondary-focus: rgba(144, 158, 190, 0.25);
    --fz-secondary-inverse: #fff;
    --fz-contrast: #dfe3eb;
    --fz-contrast-background: #eff1f4;
    --fz-contrast-border: var(--fz-contrast-background);
    --fz-contrast-underline: rgba(223, 227, 235, 0.5);
    --fz-contrast-hover: #fff;
    --fz-contrast-hover-background: #fff;
    --fz-contrast-hover-border: var(--fz-contrast-hover-background);
    --fz-contrast-hover-underline: var(--fz-contrast-hover);
    --fz-contrast-focus: rgba(207, 213, 226, 0.25);
    --fz-contrast-inverse: #000;
    --fz-box-shadow: 0.0145rem 0.029rem 0.174rem rgba(7, 8.5, 12, 0.01698), 0.0335rem 0.067rem 0.402rem rgba(7, 8.5, 12, 0.024), 0.0625rem 0.125rem 0.75rem rgba(7, 8.5, 12, 0.03), 0.1125rem 0.225rem 1.35rem rgba(7, 8.5, 12, 0.036), 0.2085rem 0.417rem 2.502rem rgba(7, 8.5, 12, 0.04302), 0.5rem 1rem 6rem rgba(7, 8.5, 12, 0.06), 0 0 0 0.0625rem rgba(7, 8.5, 12, 0.015);
    --fz-h1-color: #f0f1f3;
    --fz-h2-color: #e0e3e7;
    --fz-h3-color: #c2c7d0;
    --fz-h4-color: #b3b9c5;
    --fz-h5-color: #a4acba;
    --fz-h6-color: #8891a4;
    --fz-mark-background-color: #014063;
    --fz-mark-color: #fff;
    --fz-ins-color: #62af9a;
    --fz-del-color: rgb(205.5, 126, 123);
    --fz-blockquote-border-color: var(--fz-muted-border-color);
    --fz-blockquote-footer-color: var(--fz-muted-color);
    --fz-button-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    --fz-button-hover-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    --fz-table-border-color: var(--fz-muted-border-color);
    --fz-table-row-stripped-background-color: rgba(111, 120, 135, 0.0375);
    --fz-code-background-color: rgb(26, 30.5, 40.25);
    --fz-code-color: #8891a4;
    --fz-code-kbd-background-color: var(--fz-color);
    --fz-code-kbd-color: var(--fz-background-color);
    --fz-form-element-background-color: rgb(28, 33, 43.5);
    --fz-form-element-selected-background-color: #2a3140;
    --fz-form-element-border-color: #2a3140;
    --fz-form-element-color: #e0e3e7;
    --fz-form-element-placeholder-color: #8891a4;
    --fz-form-element-active-background-color: rgb(26, 30.5, 40.25);
    --fz-form-element-active-border-color: var(--fz-primary-border);
    --fz-form-element-focus-color: var(--fz-primary-border);
    --fz-form-element-disabled-opacity: 0.5;
    --fz-form-element-invalid-border-color: rgb(149.5, 74, 80);
    --fz-form-element-invalid-active-border-color: rgb(183.25, 63.5, 59);
    --fz-form-element-invalid-focus-color: var(--fz-form-element-invalid-active-border-color);
    --fz-form-element-valid-border-color: #2a7b6f;
    --fz-form-element-valid-active-border-color: rgb(22, 137, 105.5);
    --fz-form-element-valid-focus-color: var(--fz-form-element-valid-active-border-color);
    --fz-switch-background-color: #333c4e;
    --fz-switch-checked-background-color: var(--fz-primary-background);
    --fz-switch-color: #fff;
    --fz-switch-thumb-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    --fz-range-border-color: #202632;
    --fz-range-active-border-color: #2a3140;
    --fz-range-thumb-border-color: var(--fz-background-color);
    --fz-range-thumb-color: var(--fz-secondary-background);
    --fz-range-thumb-active-color: var(--fz-primary-background);
    --fz-accordion-border-color: var(--fz-muted-border-color);
    --fz-accordion-active-summary-color: var(--fz-primary-hover);
    --fz-accordion-close-summary-color: var(--fz-color);
    --fz-accordion-open-summary-color: var(--fz-muted-color);
    --fz-card-background-color: #181c25;
    --fz-card-border-color: var(--fz-card-background-color);
    --fz-card-box-shadow: var(--fz-box-shadow);
    --fz-card-sectioning-background-color: rgb(26, 30.5, 40.25);
    --fz-dropdown-background-color: #181c25;
    --fz-dropdown-border-color: #202632;
    --fz-dropdown-box-shadow: var(--fz-box-shadow);
    --fz-dropdown-color: var(--fz-color);
    --fz-dropdown-hover-background-color: #202632;
    --fz-loading-spinner-opacity: 0.5;
    --fz-modal-overlay-background-color: rgba(7.5, 8.5, 10, 0.75);
    --fz-progress-background-color: #202632;
    --fz-progress-color: var(--fz-primary-background);
    --fz-tooltip-background-color: var(--fz-contrast-background);
    --fz-tooltip-color: var(--fz-contrast-inverse);
    --fz-icon-valid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
    --fz-icon-invalid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
  }
  :root:not([data-theme]) input:is([type=submit],
  [type=button],
  [type=reset],
  [type=checkbox],
  [type=radio],
  [type=file]),
  :host(:not([data-theme])) input:is([type=submit],
  [type=button],
  [type=reset],
  [type=checkbox],
  [type=radio],
  [type=file]) {
    --fz-form-element-focus-color: var(--fz-primary-focus);
  }
  :root:not([data-theme]) details summary[role=button].contrast:not(.outline)::after,
  :host(:not([data-theme])) details summary[role=button].contrast:not(.outline)::after {
    filter: brightness(0);
  }
  :root:not([data-theme]) [aria-busy=true]:not(input, select, textarea).contrast:is(button,
  [type=submit],
  [type=button],
  [type=reset],
  [role=button]):not(.outline)::before,
  :host(:not([data-theme])) [aria-busy=true]:not(input, select, textarea).contrast:is(button,
  [type=submit],
  [type=button],
  [type=reset],
  [role=button]):not(.outline)::before {
    filter: brightness(0);
  }
}
[data-theme=dark] {
  color-scheme: dark;
  --fz-background-color: rgb(19, 22.5, 30.5);
  --fz-color: #c2c7d0;
  --fz-text-selection-color: rgba(1, 170, 255, 0.1875);
  --fz-muted-color: #7b8495;
  --fz-muted-border-color: #202632;
  --fz-primary: #01aaff;
  --fz-primary-background: #0172ad;
  --fz-primary-border: var(--fz-primary-background);
  --fz-primary-underline: rgba(1, 170, 255, 0.5);
  --fz-primary-hover: #79c0ff;
  --fz-primary-hover-background: #017fc0;
  --fz-primary-hover-border: var(--fz-primary-hover-background);
  --fz-primary-hover-underline: var(--fz-primary-hover);
  --fz-primary-focus: rgba(1, 170, 255, 0.375);
  --fz-primary-inverse: #fff;
  --fz-secondary: #969eaf;
  --fz-secondary-background: #525f7a;
  --fz-secondary-border: var(--fz-secondary-background);
  --fz-secondary-underline: rgba(150, 158, 175, 0.5);
  --fz-secondary-hover: #b3b9c5;
  --fz-secondary-hover-background: #5d6b89;
  --fz-secondary-hover-border: var(--fz-secondary-hover-background);
  --fz-secondary-hover-underline: var(--fz-secondary-hover);
  --fz-secondary-focus: rgba(144, 158, 190, 0.25);
  --fz-secondary-inverse: #fff;
  --fz-contrast: #dfe3eb;
  --fz-contrast-background: #eff1f4;
  --fz-contrast-border: var(--fz-contrast-background);
  --fz-contrast-underline: rgba(223, 227, 235, 0.5);
  --fz-contrast-hover: #fff;
  --fz-contrast-hover-background: #fff;
  --fz-contrast-hover-border: var(--fz-contrast-hover-background);
  --fz-contrast-hover-underline: var(--fz-contrast-hover);
  --fz-contrast-focus: rgba(207, 213, 226, 0.25);
  --fz-contrast-inverse: #000;
  --fz-box-shadow: 0.0145rem 0.029rem 0.174rem rgba(7, 8.5, 12, 0.01698), 0.0335rem 0.067rem 0.402rem rgba(7, 8.5, 12, 0.024), 0.0625rem 0.125rem 0.75rem rgba(7, 8.5, 12, 0.03), 0.1125rem 0.225rem 1.35rem rgba(7, 8.5, 12, 0.036), 0.2085rem 0.417rem 2.502rem rgba(7, 8.5, 12, 0.04302), 0.5rem 1rem 6rem rgba(7, 8.5, 12, 0.06), 0 0 0 0.0625rem rgba(7, 8.5, 12, 0.015);
  --fz-h1-color: #f0f1f3;
  --fz-h2-color: #e0e3e7;
  --fz-h3-color: #c2c7d0;
  --fz-h4-color: #b3b9c5;
  --fz-h5-color: #a4acba;
  --fz-h6-color: #8891a4;
  --fz-mark-background-color: #014063;
  --fz-mark-color: #fff;
  --fz-ins-color: #62af9a;
  --fz-del-color: rgb(205.5, 126, 123);
  --fz-blockquote-border-color: var(--fz-muted-border-color);
  --fz-blockquote-footer-color: var(--fz-muted-color);
  --fz-button-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-button-hover-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-table-border-color: var(--fz-muted-border-color);
  --fz-table-row-stripped-background-color: rgba(111, 120, 135, 0.0375);
  --fz-code-background-color: rgb(26, 30.5, 40.25);
  --fz-code-color: #8891a4;
  --fz-code-kbd-background-color: var(--fz-color);
  --fz-code-kbd-color: var(--fz-background-color);
  --fz-form-element-background-color: rgb(28, 33, 43.5);
  --fz-form-element-selected-background-color: #2a3140;
  --fz-form-element-border-color: #2a3140;
  --fz-form-element-color: #e0e3e7;
  --fz-form-element-placeholder-color: #8891a4;
  --fz-form-element-active-background-color: rgb(26, 30.5, 40.25);
  --fz-form-element-active-border-color: var(--fz-primary-border);
  --fz-form-element-focus-color: var(--fz-primary-border);
  --fz-form-element-disabled-opacity: 0.5;
  --fz-form-element-invalid-border-color: rgb(149.5, 74, 80);
  --fz-form-element-invalid-active-border-color: rgb(183.25, 63.5, 59);
  --fz-form-element-invalid-focus-color: var(--fz-form-element-invalid-active-border-color);
  --fz-form-element-valid-border-color: #2a7b6f;
  --fz-form-element-valid-active-border-color: rgb(22, 137, 105.5);
  --fz-form-element-valid-focus-color: var(--fz-form-element-valid-active-border-color);
  --fz-switch-background-color: #333c4e;
  --fz-switch-checked-background-color: var(--fz-primary-background);
  --fz-switch-color: #fff;
  --fz-switch-thumb-box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  --fz-range-border-color: #202632;
  --fz-range-active-border-color: #2a3140;
  --fz-range-thumb-border-color: var(--fz-background-color);
  --fz-range-thumb-color: var(--fz-secondary-background);
  --fz-range-thumb-active-color: var(--fz-primary-background);
  --fz-accordion-border-color: var(--fz-muted-border-color);
  --fz-accordion-active-summary-color: var(--fz-primary-hover);
  --fz-accordion-close-summary-color: var(--fz-color);
  --fz-accordion-open-summary-color: var(--fz-muted-color);
  --fz-card-background-color: #181c25;
  --fz-card-border-color: var(--fz-card-background-color);
  --fz-card-box-shadow: var(--fz-box-shadow);
  --fz-card-sectioning-background-color: rgb(26, 30.5, 40.25);
  --fz-dropdown-background-color: #181c25;
  --fz-dropdown-border-color: #202632;
  --fz-dropdown-box-shadow: var(--fz-box-shadow);
  --fz-dropdown-color: var(--fz-color);
  --fz-dropdown-hover-background-color: #202632;
  --fz-loading-spinner-opacity: 0.5;
  --fz-modal-overlay-background-color: rgba(7.5, 8.5, 10, 0.75);
  --fz-progress-background-color: #202632;
  --fz-progress-color: var(--fz-primary-background);
  --fz-tooltip-background-color: var(--fz-contrast-background);
  --fz-tooltip-color: var(--fz-contrast-inverse);
  --fz-icon-valid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(42, 123, 111)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  --fz-icon-invalid: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(149.5, 74, 80)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
}
[data-theme=dark] input:is([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[type=file]) {
  --fz-form-element-focus-color: var(--fz-primary-focus);
}
[data-theme=dark] details summary[role=button].contrast:not(.outline)::after {
  filter: brightness(0);
}
[data-theme=dark] [aria-busy=true]:not(input, select, textarea).contrast:is(button,
[type=submit],
[type=button],
[type=reset],
[role=button]):not(.outline)::before {
  filter: brightness(0);
}

progress,
[type=checkbox],
[type=radio],
[type=range] {
  accent-color: var(--fz-primary);
}

/**
 * Document
 * Content-box & Responsive typography
 */
*,
*::before,
*::after {
  box-sizing: border-box;
  background-repeat: no-repeat;
}

::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}

:where(:root),
:where(:host) {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  text-size-adjust: 100%;
  background-color: var(--fz-background-color);
  color: var(--fz-color);
  font-weight: var(--fz-font-weight);
  font-size: var(--fz-font-size);
  line-height: var(--fz-line-height);
  font-family: var(--fz-font-family);
  text-underline-offset: var(--fz-text-underline-offset);
  text-rendering: optimizeLegibility;
  overflow-wrap: break-word;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
}

/**
 * Landmarks
 */
body {
  width: 100%;
  margin: 0;
}

main {
  display: block;
}

body > header,
body > main,
body > footer {
  padding-block: var(--fz-block-spacing-vertical);
}

/**
 * Section
 */
section {
  margin-bottom: var(--fz-block-spacing-vertical);
}

/**
 * Container
 */
.container,
.container-fluid {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--fz-spacing);
  padding-left: var(--fz-spacing);
}

@media (min-width: 576px) {
  .container {
    max-width: 510px;
    padding-right: 0;
    padding-left: 0;
  }
}
@media (min-width: 768px) {
  .container {
    max-width: 700px;
  }
}
@media (min-width: 1024px) {
  .container {
    max-width: 950px;
  }
}
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
@media (min-width: 1536px) {
  .container {
    max-width: 1450px;
  }
}

/**
 * Grid
 * Minimal grid system with auto-layout columns
 */
.grid {
  grid-column-gap: var(--fz-grid-column-gap);
  grid-row-gap: var(--fz-grid-row-gap);
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(0%, 1fr));
  }
}
.grid > * {
  min-width: 0;
}

/**
 * Overflow auto
 */
.overflow-auto {
  overflow: auto;
}

/**
 * Typography
 */
b,
strong {
  font-weight: bolder;
}

sub,
sup {
  position: relative;
  font-size: 0.75em;
  line-height: 0;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

address,
blockquote,
dl,
ol,
p,
pre,
table,
ul {
  margin-top: 0;
  margin-bottom: var(--fz-typography-spacing-vertical);
  color: var(--fz-color);
  font-style: normal;
  font-weight: var(--fz-font-weight);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-top: 0;
  margin-bottom: var(--fz-typography-spacing-vertical);
  color: var(--fz-color);
  font-weight: var(--fz-font-weight);
  font-size: var(--fz-font-size);
  line-height: var(--fz-line-height);
  font-family: var(--fz-font-family);
}

h1 {
  --fz-color: var(--fz-h1-color);
}

h2 {
  --fz-color: var(--fz-h2-color);
}

h3 {
  --fz-color: var(--fz-h3-color);
}

h4 {
  --fz-color: var(--fz-h4-color);
}

h5 {
  --fz-color: var(--fz-h5-color);
}

h6 {
  --fz-color: var(--fz-h6-color);
}

:where(article, address, blockquote, dl, figure, form, ol, p, pre, table, ul) ~ :is(h1, h2, h3, h4, h5, h6) {
  margin-top: var(--fz-typography-spacing-top);
}

p {
  margin-bottom: var(--fz-typography-spacing-vertical);
}

hgroup {
  margin-bottom: var(--fz-typography-spacing-vertical);
}
hgroup > * {
  margin-top: 0;
  margin-bottom: 0;
}
hgroup > *:not(:first-child):last-child {
  --fz-color: var(--fz-muted-color);
  --fz-font-weight: unset;
  font-size: 1rem;
}

:where(ol, ul) li {
  margin-bottom: calc(var(--fz-typography-spacing-vertical) * 0.25);
}

:where(dl, ol, ul) :where(dl, ol, ul) {
  margin: 0;
  margin-top: calc(var(--fz-typography-spacing-vertical) * 0.25);
}

ul li {
  list-style: square;
}

mark {
  padding: 0.125rem 0.25rem;
  background-color: var(--fz-mark-background-color);
  color: var(--fz-mark-color);
  vertical-align: baseline;
}

blockquote {
  display: block;
  margin: var(--fz-typography-spacing-vertical) 0;
  padding: var(--fz-spacing);
  border-right: none;
  border-left: 0.25rem solid var(--fz-blockquote-border-color);
  border-inline-start: 0.25rem solid var(--fz-blockquote-border-color);
  border-inline-end: none;
}
blockquote footer {
  margin-top: calc(var(--fz-typography-spacing-vertical) * 0.5);
  color: var(--fz-blockquote-footer-color);
}

abbr[title] {
  border-bottom: 1px dotted;
  text-decoration: none;
  cursor: help;
}

ins {
  color: var(--fz-ins-color);
  text-decoration: none;
}

del {
  color: var(--fz-del-color);
}

::-moz-selection {
  background-color: var(--fz-text-selection-color);
}

::selection {
  background-color: var(--fz-text-selection-color);
}

/**
 * Link
 */
:where(a:not([role=button])),
[role=link] {
  --fz-color: var(--fz-primary);
  --fz-background-color: transparent;
  --fz-underline: var(--fz-primary-underline);
  outline: none;
  background-color: var(--fz-background-color);
  color: var(--fz-color);
  -webkit-text-decoration: var(--fz-text-decoration);
  text-decoration: var(--fz-text-decoration);
  text-decoration-color: var(--fz-underline);
  text-underline-offset: 0.125em;
  transition: background-color var(--fz-transition), color var(--fz-transition), box-shadow var(--fz-transition), -webkit-text-decoration var(--fz-transition);
  transition: background-color var(--fz-transition), color var(--fz-transition), text-decoration var(--fz-transition), box-shadow var(--fz-transition);
  transition: background-color var(--fz-transition), color var(--fz-transition), text-decoration var(--fz-transition), box-shadow var(--fz-transition), -webkit-text-decoration var(--fz-transition);
}
:where(a:not([role=button])):is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[role=link]:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-color: var(--fz-primary-hover);
  --fz-underline: var(--fz-primary-hover-underline);
  --fz-text-decoration: underline;
}
:where(a:not([role=button])):focus-visible,
[role=link]:focus-visible {
  box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-primary-focus);
}
:where(a:not([role=button])).secondary,
[role=link].secondary {
  --fz-color: var(--fz-secondary);
  --fz-underline: var(--fz-secondary-underline);
}
:where(a:not([role=button])).secondary:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[role=link].secondary:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-color: var(--fz-secondary-hover);
  --fz-underline: var(--fz-secondary-hover-underline);
}
:where(a:not([role=button])).contrast,
[role=link].contrast {
  --fz-color: var(--fz-contrast);
  --fz-underline: var(--fz-contrast-underline);
}
:where(a:not([role=button])).contrast:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[role=link].contrast:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-color: var(--fz-contrast-hover);
  --fz-underline: var(--fz-contrast-hover-underline);
}

a[role=button] {
  display: inline-block;
}

/**
 * Button
 */
button {
  margin: 0;
  overflow: visible;
  font-family: inherit;
  text-transform: none;
}

button,
[type=submit],
[type=reset],
[type=button] {
  -webkit-appearance: button;
}

button,
[type=submit],
[type=reset],
[type=button],
[type=file]::file-selector-button,
[role=button] {
  --fz-background-color: var(--fz-primary-background);
  --fz-border-color: var(--fz-primary-border);
  --fz-color: var(--fz-primary-inverse);
  --fz-box-shadow: var(--fz-button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
  padding: var(--fz-form-element-spacing-vertical) var(--fz-form-element-spacing-horizontal);
  border: var(--fz-border-width) solid var(--fz-border-color);
  border-radius: var(--fz-border-radius);
  outline: none;
  background-color: var(--fz-background-color);
  box-shadow: var(--fz-box-shadow);
  color: var(--fz-color);
  font-weight: var(--fz-font-weight);
  font-size: 1rem;
  line-height: var(--fz-line-height);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  transition: background-color var(--fz-transition), border-color var(--fz-transition), color var(--fz-transition), box-shadow var(--fz-transition);
}
button:is([aria-current]:not([aria-current=false])), button:is(:hover, :active, :focus),
[type=submit]:is([aria-current]:not([aria-current=false])),
[type=submit]:is(:hover, :active, :focus),
[type=reset]:is([aria-current]:not([aria-current=false])),
[type=reset]:is(:hover, :active, :focus),
[type=button]:is([aria-current]:not([aria-current=false])),
[type=button]:is(:hover, :active, :focus),
[type=file]::file-selector-button:is([aria-current]:not([aria-current=false])),
[type=file]::file-selector-button:is(:hover, :active, :focus),
[role=button]:is([aria-current]:not([aria-current=false])),
[role=button]:is(:hover, :active, :focus) {
  --fz-background-color: var(--fz-primary-hover-background);
  --fz-border-color: var(--fz-primary-hover-border);
  --fz-box-shadow: var(--fz-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
  --fz-color: var(--fz-primary-inverse);
}
button:focus, button:is([aria-current]:not([aria-current=false])):focus,
[type=submit]:focus,
[type=submit]:is([aria-current]:not([aria-current=false])):focus,
[type=reset]:focus,
[type=reset]:is([aria-current]:not([aria-current=false])):focus,
[type=button]:focus,
[type=button]:is([aria-current]:not([aria-current=false])):focus,
[type=file]::file-selector-button:focus,
[type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus,
[role=button]:focus,
[role=button]:is([aria-current]:not([aria-current=false])):focus {
  --fz-box-shadow: var(--fz-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)), 0 0 0 var(--fz-outline-width) var(--fz-primary-focus);
}

[type=submit],
[type=reset],
[type=button] {
  margin-bottom: var(--fz-spacing);
}

:is(button, [type=submit], [type=button], [role=button]).secondary,
[type=reset],
[type=file]::file-selector-button {
  --fz-background-color: var(--fz-secondary-background);
  --fz-border-color: var(--fz-secondary-border);
  --fz-color: var(--fz-secondary-inverse);
  cursor: pointer;
}
:is(button, [type=submit], [type=button], [role=button]).secondary:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[type=reset]:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[type=file]::file-selector-button:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-background-color: var(--fz-secondary-hover-background);
  --fz-border-color: var(--fz-secondary-hover-border);
  --fz-color: var(--fz-secondary-inverse);
}
:is(button, [type=submit], [type=button], [role=button]).secondary:focus, :is(button, [type=submit], [type=button], [role=button]).secondary:is([aria-current]:not([aria-current=false])):focus,
[type=reset]:focus,
[type=reset]:is([aria-current]:not([aria-current=false])):focus,
[type=file]::file-selector-button:focus,
[type=file]::file-selector-button:is([aria-current]:not([aria-current=false])):focus {
  --fz-box-shadow: var(--fz-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)), 0 0 0 var(--fz-outline-width) var(--fz-secondary-focus);
}

:is(button, [type=submit], [type=button], [role=button]).contrast {
  --fz-background-color: var(--fz-contrast-background);
  --fz-border-color: var(--fz-contrast-border);
  --fz-color: var(--fz-contrast-inverse);
}
:is(button, [type=submit], [type=button], [role=button]).contrast:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-background-color: var(--fz-contrast-hover-background);
  --fz-border-color: var(--fz-contrast-hover-border);
  --fz-color: var(--fz-contrast-inverse);
}
:is(button, [type=submit], [type=button], [role=button]).contrast:focus, :is(button, [type=submit], [type=button], [role=button]).contrast:is([aria-current]:not([aria-current=false])):focus {
  --fz-box-shadow: var(--fz-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)), 0 0 0 var(--fz-outline-width) var(--fz-contrast-focus);
}

:is(button, [type=submit], [type=button], [role=button]).outline,
[type=reset].outline {
  --fz-background-color: transparent;
  --fz-color: var(--fz-primary);
  --fz-border-color: var(--fz-primary);
}
:is(button, [type=submit], [type=button], [role=button]).outline:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[type=reset].outline:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-background-color: transparent;
  --fz-color: var(--fz-primary-hover);
  --fz-border-color: var(--fz-primary-hover);
}

:is(button, [type=submit], [type=button], [role=button]).outline.secondary,
[type=reset].outline {
  --fz-color: var(--fz-secondary);
  --fz-border-color: var(--fz-secondary);
}
:is(button, [type=submit], [type=button], [role=button]).outline.secondary:is([aria-current]:not([aria-current=false]), :hover, :active, :focus),
[type=reset].outline:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-color: var(--fz-secondary-hover);
  --fz-border-color: var(--fz-secondary-hover);
}

:is(button, [type=submit], [type=button], [role=button]).outline.contrast {
  --fz-color: var(--fz-contrast);
  --fz-border-color: var(--fz-contrast);
}
:is(button, [type=submit], [type=button], [role=button]).outline.contrast:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  --fz-color: var(--fz-contrast-hover);
  --fz-border-color: var(--fz-contrast-hover);
}

:where(button, [type=submit], [type=reset], [type=button], [role=button])[disabled],
:where(fieldset[disabled]) :is(button, [type=submit], [type=button], [type=reset], [role=button]) {
  opacity: 0.5;
  pointer-events: none;
}

/**
 * Table
 */
:where(table) {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  text-indent: 0;
}

th,
td {
  padding: calc(var(--fz-spacing) / 2) var(--fz-spacing);
  border-bottom: var(--fz-border-width) solid var(--fz-table-border-color);
  background-color: var(--fz-background-color);
  color: var(--fz-color);
  font-weight: var(--fz-font-weight);
  text-align: left;
  text-align: start;
}

tfoot th,
tfoot td {
  border-top: var(--fz-border-width) solid var(--fz-table-border-color);
  border-bottom: 0;
}

table.striped tbody tr:nth-child(odd) th,
table.striped tbody tr:nth-child(odd) td {
  background-color: var(--fz-table-row-stripped-background-color);
}

/**
 * Embedded content
 */
:where(audio, canvas, iframe, img, svg, video) {
  vertical-align: middle;
}

audio,
video {
  display: inline-block;
}

audio:not([controls]) {
  display: none;
  height: 0;
}

:where(iframe) {
  border-style: none;
}

img {
  max-width: 100%;
  height: auto;
  border-style: none;
}

:where(svg:not([fill])) {
  fill: currentColor;
}

svg:not(:root),
svg:not(:host) {
  overflow: hidden;
}

/**
 * Code
 */
pre,
code,
kbd,
samp {
  font-size: 0.875em;
  font-family: var(--fz-font-family);
}

pre code,
pre samp {
  font-size: inherit;
  font-family: inherit;
}

pre {
  -ms-overflow-style: scrollbar;
  overflow: auto;
}

pre,
code,
kbd,
samp {
  border-radius: var(--fz-border-radius);
  background: var(--fz-code-background-color);
  color: var(--fz-code-color);
  font-weight: var(--fz-font-weight);
  line-height: initial;
}

code,
kbd,
samp {
  display: inline-block;
  padding: 0.375rem;
}

pre {
  display: block;
  margin-bottom: var(--fz-spacing);
  overflow-x: auto;
}
pre > code,
pre > samp {
  display: block;
  padding: var(--fz-spacing);
  background: none;
  line-height: var(--fz-line-height);
}

kbd {
  background-color: var(--fz-code-kbd-background-color);
  color: var(--fz-code-kbd-color);
  vertical-align: baseline;
}

/**
 * Figure
 */
figure {
  display: block;
  margin: 0;
  padding: 0;
}
figure figcaption {
  padding: calc(var(--fz-spacing) * 0.5) 0;
  color: var(--fz-muted-color);
}

/**
 * Misc
 */
hr {
  height: 0;
  margin: var(--fz-typography-spacing-vertical) 0;
  border: 0;
  border-top: 1px solid var(--fz-muted-border-color);
  color: inherit;
}

[hidden],
template {
  display: none !important;
}

canvas {
  display: inline-block;
}

/**
 * Basics form elements
 */
input,
optgroup,
select,
textarea {
  margin: 0;
  font-size: 1rem;
  line-height: var(--fz-line-height);
  font-family: inherit;
  letter-spacing: inherit;
}

input {
  overflow: visible;
}

select {
  text-transform: none;
}

legend {
  max-width: 100%;
  padding: 0;
  color: inherit;
  white-space: normal;
}

textarea {
  overflow: auto;
}

[type=checkbox],
[type=radio] {
  padding: 0;
}

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

[type=search] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

[type=search]::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

::-moz-focus-inner {
  padding: 0;
  border-style: none;
}

:-moz-focusring {
  outline: none;
}

:-moz-ui-invalid {
  box-shadow: none;
}

::-ms-expand {
  display: none;
}

[type=file],
[type=range] {
  padding: 0;
  border-width: 0;
}

input:not([type=checkbox], [type=radio], [type=range]) {
  height: calc(1rem * var(--fz-line-height) + var(--fz-form-element-spacing-vertical) * 2 + var(--fz-border-width) * 2);
}

fieldset {
  width: 100%;
  margin: 0;
  margin-bottom: var(--fz-spacing);
  padding: 0;
  border: 0;
}

label,
fieldset legend {
  display: block;
  margin-bottom: calc(var(--fz-spacing) * 0.375);
  color: var(--fz-color);
  font-weight: var(--fz-form-label-font-weight, var(--fz-font-weight));
}

fieldset legend {
  margin-bottom: calc(var(--fz-spacing) * 0.5);
}

input:not([type=checkbox], [type=radio]),
button[type=submit],
select,
textarea {
  width: 100%;
}

input:not([type=checkbox], [type=radio], [type=range], [type=file]),
select,
textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: var(--fz-form-element-spacing-vertical) var(--fz-form-element-spacing-horizontal);
}

input,
select,
textarea {
  --fz-background-color: var(--fz-form-element-background-color);
  --fz-border-color: var(--fz-form-element-border-color);
  --fz-color: var(--fz-form-element-color);
  --fz-box-shadow: none;
  border: var(--fz-border-width) solid var(--fz-border-color);
  border-radius: var(--fz-border-radius);
  outline: none;
  background-color: var(--fz-background-color);
  box-shadow: var(--fz-box-shadow);
  color: var(--fz-color);
  font-weight: var(--fz-font-weight);
  transition: background-color var(--fz-transition), border-color var(--fz-transition), color var(--fz-transition), box-shadow var(--fz-transition);
}

input:not([type=submit],
[type=button],
[type=reset],
[type=checkbox],
[type=radio],
[readonly]):is(:active, :focus),
:where(select, textarea):not([readonly]):is(:active, :focus) {
  --fz-background-color: var(--fz-form-element-active-background-color);
}

input:not([type=submit], [type=button], [type=reset], [role=switch], [readonly]):is(:active, :focus),
:where(select, textarea):not([readonly]):is(:active, :focus) {
  --fz-border-color: var(--fz-form-element-active-border-color);
}

input:not([type=submit],
[type=button],
[type=reset],
[type=range],
[type=file],
[readonly]):focus,
:where(select, textarea):not([readonly]):focus {
  --fz-box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-form-element-focus-color);
}

input:not([type=submit], [type=button], [type=reset])[disabled],
select[disabled],
textarea[disabled],
label[aria-disabled=true],
:where(fieldset[disabled]) :is(input:not([type=submit], [type=button], [type=reset]), select, textarea) {
  opacity: var(--fz-form-element-disabled-opacity);
  pointer-events: none;
}

label[aria-disabled=true] input[disabled] {
  opacity: 1;
}

:where(input, select, textarea):not([type=checkbox],
[type=radio],
[type=date],
[type=datetime-local],
[type=month],
[type=time],
[type=week],
[type=range])[aria-invalid] {
  padding-right: calc(var(--fz-form-element-spacing-horizontal) + 1.5rem) !important;
  padding-left: var(--fz-form-element-spacing-horizontal);
  padding-inline-start: var(--fz-form-element-spacing-horizontal) !important;
  padding-inline-end: calc(var(--fz-form-element-spacing-horizontal) + 1.5rem) !important;
  background-position: center right 0.75rem;
  background-size: 1rem auto;
  background-repeat: no-repeat;
}
:where(input, select, textarea):not([type=checkbox],
[type=radio],
[type=date],
[type=datetime-local],
[type=month],
[type=time],
[type=week],
[type=range])[aria-invalid=false]:not(select) {
  background-image: var(--fz-icon-valid);
}
:where(input, select, textarea):not([type=checkbox],
[type=radio],
[type=date],
[type=datetime-local],
[type=month],
[type=time],
[type=week],
[type=range])[aria-invalid=true]:not(select) {
  background-image: var(--fz-icon-invalid);
}
:where(input, select, textarea)[aria-invalid=false] {
  --fz-border-color: var(--fz-form-element-valid-border-color);
}
:where(input, select, textarea)[aria-invalid=false]:is(:active, :focus) {
  --fz-border-color: var(--fz-form-element-valid-active-border-color) !important;
}
:where(input, select, textarea)[aria-invalid=false]:is(:active, :focus):not([type=checkbox], [type=radio]) {
  --fz-box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-form-element-valid-focus-color) !important;
}
:where(input, select, textarea)[aria-invalid=true] {
  --fz-border-color: var(--fz-form-element-invalid-border-color);
}
:where(input, select, textarea)[aria-invalid=true]:is(:active, :focus) {
  --fz-border-color: var(--fz-form-element-invalid-active-border-color) !important;
}
:where(input, select, textarea)[aria-invalid=true]:is(:active, :focus):not([type=checkbox], [type=radio]) {
  --fz-box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-form-element-invalid-focus-color) !important;
}

[dir=rtl] :where(input, select, textarea):not([type=checkbox], [type=radio]):is([aria-invalid], [aria-invalid=true], [aria-invalid=false]) {
  background-position: center left 0.75rem;
}

input::placeholder,
input::-webkit-input-placeholder,
textarea::placeholder,
textarea::-webkit-input-placeholder,
select:invalid {
  color: var(--fz-form-element-placeholder-color);
  opacity: 1;
}

input:not([type=checkbox], [type=radio]),
select,
textarea {
  margin-bottom: var(--fz-spacing);
}

select::-ms-expand {
  border: 0;
  background-color: transparent;
}
select:not([multiple], [size]) {
  padding-right: calc(var(--fz-form-element-spacing-horizontal) + 1.5rem);
  padding-left: var(--fz-form-element-spacing-horizontal);
  padding-inline-start: var(--fz-form-element-spacing-horizontal);
  padding-inline-end: calc(var(--fz-form-element-spacing-horizontal) + 1.5rem);
  background-image: var(--fz-icon-chevron);
  background-position: center right 0.75rem;
  background-size: 1rem auto;
  background-repeat: no-repeat;
}
select[multiple] option:checked {
  background: var(--fz-form-element-selected-background-color);
  color: var(--fz-form-element-color);
}

[dir=rtl] select:not([multiple], [size]) {
  background-position: center left 0.75rem;
}

textarea {
  display: block;
  resize: vertical;
}
textarea[aria-invalid] {
  --fz-icon-height: calc(1rem * var(--fz-line-height) + var(--fz-form-element-spacing-vertical) * 2 + var(--fz-border-width) * 2);
  background-position: top right 0.75rem !important;
  background-size: 1rem var(--fz-icon-height) !important;
}

:where(input, select, textarea, fieldset, .grid) + small {
  display: block;
  width: 100%;
  margin-top: calc(var(--fz-spacing) * -0.75);
  margin-bottom: var(--fz-spacing);
  color: var(--fz-muted-color);
}
:where(input, select, textarea, fieldset, .grid)[aria-invalid=false] + small {
  color: var(--fz-ins-color);
}
:where(input, select, textarea, fieldset, .grid)[aria-invalid=true] + small {
  color: var(--fz-del-color);
}

label > :where(input, select, textarea) {
  margin-top: calc(var(--fz-spacing) * 0.25);
}

/**
 * Checkboxes, Radios and Switches
 */
label:has([type=checkbox], [type=radio]) {
  width: -moz-fit-content;
  width: fit-content;
  cursor: pointer;
}

[type=checkbox],
[type=radio] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 1.25em;
  height: 1.25em;
  margin-top: -0.125em;
  margin-inline-end: 0.5em;
  border-width: var(--fz-border-width);
  vertical-align: middle;
  cursor: pointer;
}
[type=checkbox]::-ms-check,
[type=radio]::-ms-check {
  display: none;
}
[type=checkbox]:checked, [type=checkbox]:checked:active, [type=checkbox]:checked:focus,
[type=radio]:checked,
[type=radio]:checked:active,
[type=radio]:checked:focus {
  --fz-background-color: var(--fz-primary-background);
  --fz-border-color: var(--fz-primary-border);
  background-image: var(--fz-icon-checkbox);
  background-position: center;
  background-size: 0.75em auto;
  background-repeat: no-repeat;
}
[type=checkbox] ~ label,
[type=radio] ~ label {
  display: inline-block;
  margin-bottom: 0;
  cursor: pointer;
}
[type=checkbox] ~ label:not(:last-of-type),
[type=radio] ~ label:not(:last-of-type) {
  margin-inline-end: 1em;
}

[type=checkbox]:indeterminate {
  --fz-background-color: var(--fz-primary-background);
  --fz-border-color: var(--fz-primary-border);
  background-image: var(--fz-icon-minus);
  background-position: center;
  background-size: 0.75em auto;
  background-repeat: no-repeat;
}

[type=radio] {
  border-radius: 50%;
}
[type=radio]:checked, [type=radio]:checked:active, [type=radio]:checked:focus {
  --fz-background-color: var(--fz-primary-inverse);
  border-width: 0.35em;
  background-image: none;
}

[type=checkbox][role=switch] {
  --fz-background-color: var(--fz-switch-background-color);
  --fz-color: var(--fz-switch-color);
  width: 2.25em;
  height: 1.25em;
  border: var(--fz-border-width) solid var(--fz-border-color);
  border-radius: 1.25em;
  background-color: var(--fz-background-color);
  line-height: 1.25em;
}
[type=checkbox][role=switch]:not([aria-invalid]) {
  --fz-border-color: var(--fz-switch-background-color);
}
[type=checkbox][role=switch]:before {
  display: block;
  aspect-ratio: 1;
  height: 100%;
  border-radius: 50%;
  background-color: var(--fz-color);
  box-shadow: var(--fz-switch-thumb-box-shadow);
  content: "";
  transition: margin 0.1s ease-in-out;
}
[type=checkbox][role=switch]:focus {
  --fz-background-color: var(--fz-switch-background-color);
  --fz-border-color: var(--fz-switch-background-color);
}
[type=checkbox][role=switch]:checked {
  --fz-background-color: var(--fz-switch-checked-background-color);
  --fz-border-color: var(--fz-switch-checked-background-color);
  background-image: none;
}
[type=checkbox][role=switch]:checked::before {
  margin-inline-start: calc(2.25em - 1.25em);
}
[type=checkbox][role=switch][disabled] {
  --fz-background-color: var(--fz-border-color);
}

[type=checkbox][aria-invalid=false]:checked, [type=checkbox][aria-invalid=false]:checked:active, [type=checkbox][aria-invalid=false]:checked:focus,
[type=checkbox][role=switch][aria-invalid=false]:checked,
[type=checkbox][role=switch][aria-invalid=false]:checked:active,
[type=checkbox][role=switch][aria-invalid=false]:checked:focus {
  --fz-background-color: var(--fz-form-element-valid-border-color);
}
[type=checkbox]:checked[aria-invalid=true], [type=checkbox]:checked:active[aria-invalid=true], [type=checkbox]:checked:focus[aria-invalid=true],
[type=checkbox][role=switch]:checked[aria-invalid=true],
[type=checkbox][role=switch]:checked:active[aria-invalid=true],
[type=checkbox][role=switch]:checked:focus[aria-invalid=true] {
  --fz-background-color: var(--fz-form-element-invalid-border-color);
}

[type=checkbox][aria-invalid=false]:checked, [type=checkbox][aria-invalid=false]:checked:active, [type=checkbox][aria-invalid=false]:checked:focus,
[type=radio][aria-invalid=false]:checked,
[type=radio][aria-invalid=false]:checked:active,
[type=radio][aria-invalid=false]:checked:focus,
[type=checkbox][role=switch][aria-invalid=false]:checked,
[type=checkbox][role=switch][aria-invalid=false]:checked:active,
[type=checkbox][role=switch][aria-invalid=false]:checked:focus {
  --fz-border-color: var(--fz-form-element-valid-border-color);
}
[type=checkbox]:checked[aria-invalid=true], [type=checkbox]:checked:active[aria-invalid=true], [type=checkbox]:checked:focus[aria-invalid=true],
[type=radio]:checked[aria-invalid=true],
[type=radio]:checked:active[aria-invalid=true],
[type=radio]:checked:focus[aria-invalid=true],
[type=checkbox][role=switch]:checked[aria-invalid=true],
[type=checkbox][role=switch]:checked:active[aria-invalid=true],
[type=checkbox][role=switch]:checked:focus[aria-invalid=true] {
  --fz-border-color: var(--fz-form-element-invalid-border-color);
}

/**
 * Input type color
 */
[type=color]::-webkit-color-swatch-wrapper {
  padding: 0;
}
[type=color]::-moz-focus-inner {
  padding: 0;
}
[type=color]::-webkit-color-swatch {
  border: 0;
  border-radius: calc(var(--fz-border-radius) * 0.5);
}
[type=color]::-moz-color-swatch {
  border: 0;
  border-radius: calc(var(--fz-border-radius) * 0.5);
}

/**
 * Input type datetime
 */
input:not([type=checkbox], [type=radio], [type=range], [type=file]):is([type=date], [type=datetime-local], [type=month], [type=time], [type=week]) {
  --fz-icon-position: 0.75rem;
  --fz-icon-width: 1rem;
  padding-right: calc(var(--fz-icon-width) + var(--fz-icon-position));
  background-image: var(--fz-icon-date);
  background-position: center right var(--fz-icon-position);
  background-size: var(--fz-icon-width) auto;
  background-repeat: no-repeat;
}
input:not([type=checkbox], [type=radio], [type=range], [type=file])[type=time] {
  background-image: var(--fz-icon-time);
}

[type=date]::-webkit-calendar-picker-indicator,
[type=datetime-local]::-webkit-calendar-picker-indicator,
[type=month]::-webkit-calendar-picker-indicator,
[type=time]::-webkit-calendar-picker-indicator,
[type=week]::-webkit-calendar-picker-indicator {
  width: var(--fz-icon-width);
  margin-right: calc(var(--fz-icon-width) * -1);
  margin-left: var(--fz-icon-position);
  opacity: 0;
}

@-moz-document url-prefix() {
  [type=date],
  [type=datetime-local],
  [type=month],
  [type=time],
  [type=week] {
    padding-right: var(--fz-form-element-spacing-horizontal) !important;
    background-image: none !important;
  }
}
[dir=rtl] :is([type=date], [type=datetime-local], [type=month], [type=time], [type=week]) {
  text-align: right;
}

/**
 * Input type file
 */
[type=file] {
  --fz-color: var(--fz-muted-color);
  margin-left: calc(var(--fz-outline-width) * -1);
  padding: calc(var(--fz-form-element-spacing-vertical) * 0.5) 0;
  padding-left: var(--fz-outline-width);
  border: 0;
  border-radius: 0;
  background: none;
}
[type=file]::file-selector-button {
  margin-right: calc(var(--fz-spacing) / 2);
  padding: calc(var(--fz-form-element-spacing-vertical) * 0.5) var(--fz-form-element-spacing-horizontal);
}
[type=file]:is(:hover, :active, :focus)::file-selector-button {
  --fz-background-color: var(--fz-secondary-hover-background);
  --fz-border-color: var(--fz-secondary-hover-border);
}
[type=file]:focus::file-selector-button {
  --fz-box-shadow: var(--fz-button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)), 0 0 0 var(--fz-outline-width) var(--fz-secondary-focus);
}

/**
 * Input type range
 */
[type=range] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  height: 1.25rem;
  background: none;
}
[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 0.375rem;
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-range-border-color);
  -webkit-transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
  transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
}
[type=range]::-moz-range-track {
  width: 100%;
  height: 0.375rem;
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-range-border-color);
  -moz-transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
  transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
}
[type=range]::-ms-track {
  width: 100%;
  height: 0.375rem;
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-range-border-color);
  -ms-transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
  transition: background-color var(--fz-transition), box-shadow var(--fz-transition);
}
[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.4375rem;
  border: 2px solid var(--fz-range-thumb-border-color);
  border-radius: 50%;
  background-color: var(--fz-range-thumb-color);
  cursor: pointer;
  -webkit-transition: background-color var(--fz-transition), transform var(--fz-transition);
  transition: background-color var(--fz-transition), transform var(--fz-transition);
}
[type=range]::-moz-range-thumb {
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.4375rem;
  border: 2px solid var(--fz-range-thumb-border-color);
  border-radius: 50%;
  background-color: var(--fz-range-thumb-color);
  cursor: pointer;
  -moz-transition: background-color var(--fz-transition), transform var(--fz-transition);
  transition: background-color var(--fz-transition), transform var(--fz-transition);
}
[type=range]::-ms-thumb {
  -webkit-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.4375rem;
  border: 2px solid var(--fz-range-thumb-border-color);
  border-radius: 50%;
  background-color: var(--fz-range-thumb-color);
  cursor: pointer;
  -ms-transition: background-color var(--fz-transition), transform var(--fz-transition);
  transition: background-color var(--fz-transition), transform var(--fz-transition);
}
[type=range]:active, [type=range]:focus-within {
  --fz-range-border-color: var(--fz-range-active-border-color);
  --fz-range-thumb-color: var(--fz-range-thumb-active-color);
}
[type=range]:active::-webkit-slider-thumb {
  transform: scale(1.25);
}
[type=range]:active::-moz-range-thumb {
  transform: scale(1.25);
}
[type=range]:active::-ms-thumb {
  transform: scale(1.25);
}

/**
 * Input type search
 */
input:not([type=checkbox], [type=radio], [type=range], [type=file])[type=search] {
  padding-inline-start: calc(var(--fz-form-element-spacing-horizontal) + 1.75rem);
  background-image: var(--fz-icon-search);
  background-position: center left calc(var(--fz-form-element-spacing-horizontal) + 0.125rem);
  background-size: 1rem auto;
  background-repeat: no-repeat;
}
input:not([type=checkbox], [type=radio], [type=range], [type=file])[type=search][aria-invalid] {
  padding-inline-start: calc(var(--fz-form-element-spacing-horizontal) + 1.75rem) !important;
  background-position: center left 1.125rem, center right 0.75rem;
}
input:not([type=checkbox], [type=radio], [type=range], [type=file])[type=search][aria-invalid=false] {
  background-image: var(--fz-icon-search), var(--fz-icon-valid);
}
input:not([type=checkbox], [type=radio], [type=range], [type=file])[type=search][aria-invalid=true] {
  background-image: var(--fz-icon-search), var(--fz-icon-invalid);
}

[dir=rtl] :where(input):not([type=checkbox], [type=radio], [type=range], [type=file])[type=search] {
  background-position: center right 1.125rem;
}
[dir=rtl] :where(input):not([type=checkbox], [type=radio], [type=range], [type=file])[type=search][aria-invalid] {
  background-position: center right 1.125rem, center left 0.75rem;
}

/**
 * Accordion (<details>)
 */
details {
  display: block;
  margin-bottom: var(--fz-spacing);
}
details summary {
  line-height: 1rem;
  list-style-type: none;
  cursor: pointer;
  transition: color var(--fz-transition);
}
details summary:not([role]) {
  color: var(--fz-accordion-close-summary-color);
}
details summary::-webkit-details-marker {
  display: none;
}
details summary::marker {
  display: none;
}
details summary::-moz-list-bullet {
  list-style-type: none;
}
details summary::after {
  display: block;
  width: 1rem;
  height: 1rem;
  margin-inline-start: calc(var(--fz-spacing, 1rem) * 0.5);
  float: right;
  transform: rotate(-90deg);
  background-image: var(--fz-icon-chevron);
  background-position: right center;
  background-size: 1rem auto;
  background-repeat: no-repeat;
  content: "";
  transition: transform var(--fz-transition);
}
details summary:focus {
  outline: none;
}
details summary:focus:not([role]) {
  color: var(--fz-accordion-active-summary-color);
}
details summary:focus-visible:not([role]) {
  outline: var(--fz-outline-width) solid var(--fz-primary-focus);
  outline-offset: calc(var(--fz-spacing, 1rem) * 0.5);
  color: var(--fz-primary);
}
details summary[role=button] {
  width: 100%;
  text-align: left;
}
details summary[role=button]::after {
  height: calc(1rem * var(--fz-line-height, 1.5));
}
details[open] > summary {
  margin-bottom: var(--fz-spacing);
}
details[open] > summary:not([role]):not(:focus) {
  color: var(--fz-accordion-open-summary-color);
}
details[open] > summary::after {
  transform: rotate(0);
}

[dir=rtl] details summary {
  text-align: right;
}
[dir=rtl] details summary::after {
  float: left;
  background-position: left center;
}

/**
 * Card (<article>)
 */
article {
  margin-bottom: var(--fz-block-spacing-vertical);
  padding: var(--fz-block-spacing-vertical) var(--fz-block-spacing-horizontal);
  border-radius: var(--fz-border-radius);
  background: var(--fz-card-background-color);
  box-shadow: var(--fz-card-box-shadow);
}
article > header,
article > footer {
  margin-right: calc(var(--fz-block-spacing-horizontal) * -1);
  margin-left: calc(var(--fz-block-spacing-horizontal) * -1);
  padding: calc(var(--fz-block-spacing-vertical) * 0.66) var(--fz-block-spacing-horizontal);
  background-color: var(--fz-card-sectioning-background-color);
}
article > header {
  margin-top: calc(var(--fz-block-spacing-vertical) * -1);
  margin-bottom: var(--fz-block-spacing-vertical);
  border-bottom: var(--fz-border-width) solid var(--fz-card-border-color);
  border-top-right-radius: var(--fz-border-radius);
  border-top-left-radius: var(--fz-border-radius);
}
article > footer {
  margin-top: var(--fz-block-spacing-vertical);
  margin-bottom: calc(var(--fz-block-spacing-vertical) * -1);
  border-top: var(--fz-border-width) solid var(--fz-card-border-color);
  border-bottom-right-radius: var(--fz-border-radius);
  border-bottom-left-radius: var(--fz-border-radius);
}

/**
 * Dropdown (details.dropdown)
 */
details.dropdown {
  position: relative;
  border-bottom: none;
}
details.dropdown > summary::after,
details.dropdown > button::after,
details.dropdown > a::after {
  display: block;
  width: 1rem;
  height: calc(1rem * var(--fz-line-height, 1.5));
  margin-inline-start: 0.25rem;
  float: right;
  transform: rotate(0deg) translateX(0.2rem);
  background-image: var(--fz-icon-chevron);
  background-position: right center;
  background-size: 1rem auto;
  background-repeat: no-repeat;
  content: "";
}

nav details.dropdown {
  margin-bottom: 0;
}

details.dropdown > summary:not([role]) {
  height: calc(1rem * var(--fz-line-height) + var(--fz-form-element-spacing-vertical) * 2 + var(--fz-border-width) * 2);
  padding: var(--fz-form-element-spacing-vertical) var(--fz-form-element-spacing-horizontal);
  border: var(--fz-border-width) solid var(--fz-form-element-border-color);
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-form-element-background-color);
  color: var(--fz-form-element-placeholder-color);
  line-height: inherit;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  transition: background-color var(--fz-transition), border-color var(--fz-transition), color var(--fz-transition), box-shadow var(--fz-transition);
}
details.dropdown > summary:not([role]):active, details.dropdown > summary:not([role]):focus {
  border-color: var(--fz-form-element-active-border-color);
  background-color: var(--fz-form-element-active-background-color);
}
details.dropdown > summary:not([role]):focus {
  box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-form-element-focus-color);
}
details.dropdown > summary:not([role]):focus-visible {
  outline: none;
}
details.dropdown > summary:not([role])[aria-invalid=false] {
  --fz-form-element-border-color: var(--fz-form-element-valid-border-color);
  --fz-form-element-active-border-color: var(--fz-form-element-valid-focus-color);
  --fz-form-element-focus-color: var(--fz-form-element-valid-focus-color);
}
details.dropdown > summary:not([role])[aria-invalid=true] {
  --fz-form-element-border-color: var(--fz-form-element-invalid-border-color);
  --fz-form-element-active-border-color: var(--fz-form-element-invalid-focus-color);
  --fz-form-element-focus-color: var(--fz-form-element-invalid-focus-color);
}

nav details.dropdown {
  display: inline;
  margin: calc(var(--fz-nav-element-spacing-vertical) * -1) 0;
}
nav details.dropdown > summary::after {
  transform: rotate(0deg) translateX(0rem);
}
nav details.dropdown > summary:not([role]) {
  height: calc(1rem * var(--fz-line-height) + var(--fz-nav-link-spacing-vertical) * 2);
  padding: calc(var(--fz-nav-link-spacing-vertical) - var(--fz-border-width) * 2) var(--fz-nav-link-spacing-horizontal);
}
nav details.dropdown > summary:not([role]):focus-visible {
  box-shadow: 0 0 0 var(--fz-outline-width) var(--fz-primary-focus);
}

details.dropdown > summary + ul {
  display: flex;
  z-index: 99;
  position: absolute;
  left: 0;
  flex-direction: column;
  width: 100%;
  min-width: -moz-fit-content;
  min-width: fit-content;
  margin: 0;
  margin-top: var(--fz-outline-width);
  padding: 0;
  border: var(--fz-border-width) solid var(--fz-dropdown-border-color);
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-dropdown-background-color);
  box-shadow: var(--fz-dropdown-box-shadow);
  color: var(--fz-dropdown-color);
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--fz-transition), transform 0s ease-in-out 1s;
}
details.dropdown > summary + ul[dir=rtl] {
  right: 0;
  left: auto;
}
details.dropdown > summary + ul li {
  width: 100%;
  margin-bottom: 0;
  padding: calc(var(--fz-form-element-spacing-vertical) * 0.5) var(--fz-form-element-spacing-horizontal);
  list-style: none;
}
details.dropdown > summary + ul li:first-of-type {
  margin-top: calc(var(--fz-form-element-spacing-vertical) * 0.5);
}
details.dropdown > summary + ul li:last-of-type {
  margin-bottom: calc(var(--fz-form-element-spacing-vertical) * 0.5);
}
details.dropdown > summary + ul li a {
  display: block;
  margin: calc(var(--fz-form-element-spacing-vertical) * -0.5) calc(var(--fz-form-element-spacing-horizontal) * -1);
  padding: calc(var(--fz-form-element-spacing-vertical) * 0.5) var(--fz-form-element-spacing-horizontal);
  overflow: hidden;
  border-radius: 0;
  color: var(--fz-dropdown-color);
  text-decoration: none;
  text-overflow: ellipsis;
}
details.dropdown > summary + ul li a:hover, details.dropdown > summary + ul li a:focus, details.dropdown > summary + ul li a:active, details.dropdown > summary + ul li a:focus-visible, details.dropdown > summary + ul li a[aria-current]:not([aria-current=false]) {
  background-color: var(--fz-dropdown-hover-background-color);
}
details.dropdown > summary + ul li label {
  width: 100%;
}
details.dropdown > summary + ul li:has(label):hover {
  background-color: var(--fz-dropdown-hover-background-color);
}

details.dropdown[open] > summary {
  margin-bottom: 0;
}

details.dropdown[open] > summary + ul {
  transform: scaleY(1);
  opacity: 1;
  transition: opacity var(--fz-transition), transform 0s ease-in-out 0s;
}

details.dropdown[open] > summary::before {
  display: block;
  z-index: 1;
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background: none;
  content: "";
  cursor: default;
}

label > details.dropdown {
  margin-top: calc(var(--fz-spacing) * 0.25);
}

/**
 * Group ([role="group"], [role="search"])
 */
[role=search],
[role=group] {
  display: inline-flex;
  position: relative;
  width: 100%;
  margin-bottom: var(--fz-spacing);
  border-radius: var(--fz-border-radius);
  box-shadow: var(--fz-group-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
  vertical-align: middle;
  transition: box-shadow var(--fz-transition);
}
[role=search] > *,
[role=search] input:not([type=checkbox], [type=radio]),
[role=search] select,
[role=group] > *,
[role=group] input:not([type=checkbox], [type=radio]),
[role=group] select {
  position: relative;
  flex: 1 1 auto;
  margin-bottom: 0;
}
[role=search] > *:not(:first-child),
[role=search] input:not([type=checkbox], [type=radio]):not(:first-child),
[role=search] select:not(:first-child),
[role=group] > *:not(:first-child),
[role=group] input:not([type=checkbox], [type=radio]):not(:first-child),
[role=group] select:not(:first-child) {
  margin-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
[role=search] > *:not(:last-child),
[role=search] input:not([type=checkbox], [type=radio]):not(:last-child),
[role=search] select:not(:last-child),
[role=group] > *:not(:last-child),
[role=group] input:not([type=checkbox], [type=radio]):not(:last-child),
[role=group] select:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[role=search] > *:focus,
[role=search] input:not([type=checkbox], [type=radio]):focus,
[role=search] select:focus,
[role=group] > *:focus,
[role=group] input:not([type=checkbox], [type=radio]):focus,
[role=group] select:focus {
  z-index: 2;
}
[role=search] button:not(:first-child),
[role=search] [type=submit]:not(:first-child),
[role=search] [type=reset]:not(:first-child),
[role=search] [type=button]:not(:first-child),
[role=search] [role=button]:not(:first-child),
[role=search] input:not([type=checkbox], [type=radio]):not(:first-child),
[role=search] select:not(:first-child),
[role=group] button:not(:first-child),
[role=group] [type=submit]:not(:first-child),
[role=group] [type=reset]:not(:first-child),
[role=group] [type=button]:not(:first-child),
[role=group] [role=button]:not(:first-child),
[role=group] input:not([type=checkbox], [type=radio]):not(:first-child),
[role=group] select:not(:first-child) {
  margin-left: calc(var(--fz-border-width) * -1);
}
[role=search] button,
[role=search] [type=submit],
[role=search] [type=reset],
[role=search] [type=button],
[role=search] [role=button],
[role=group] button,
[role=group] [type=submit],
[role=group] [type=reset],
[role=group] [type=button],
[role=group] [role=button] {
  width: auto;
}
@supports selector(:has(*)) {
  [role=search]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus),
  [role=group]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus) {
    --fz-group-box-shadow: var(--fz-group-box-shadow-focus-with-button);
  }
  [role=search]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus) input:not([type=checkbox], [type=radio]),
  [role=search]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus) select,
  [role=group]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus) input:not([type=checkbox], [type=radio]),
  [role=group]:has(button:focus, [type=submit]:focus, [type=button]:focus, [role=button]:focus) select {
    border-color: transparent;
  }
  [role=search]:has(input:not([type=submit], [type=button]):focus, select:focus),
  [role=group]:has(input:not([type=submit], [type=button]):focus, select:focus) {
    --fz-group-box-shadow: var(--fz-group-box-shadow-focus-with-input);
  }
  [role=search]:has(input:not([type=submit], [type=button]):focus, select:focus) button,
  [role=search]:has(input:not([type=submit], [type=button]):focus, select:focus) [type=submit],
  [role=search]:has(input:not([type=submit], [type=button]):focus, select:focus) [type=button],
  [role=search]:has(input:not([type=submit], [type=button]):focus, select:focus) [role=button],
  [role=group]:has(input:not([type=submit], [type=button]):focus, select:focus) button,
  [role=group]:has(input:not([type=submit], [type=button]):focus, select:focus) [type=submit],
  [role=group]:has(input:not([type=submit], [type=button]):focus, select:focus) [type=button],
  [role=group]:has(input:not([type=submit], [type=button]):focus, select:focus) [role=button] {
    --fz-button-box-shadow: 0 0 0 var(--fz-border-width) var(--fz-primary-border);
    --fz-button-hover-box-shadow: 0 0 0 var(--fz-border-width) var(--fz-primary-hover-border);
  }
  [role=search] button:focus,
  [role=search] [type=submit]:focus,
  [role=search] [type=reset]:focus,
  [role=search] [type=button]:focus,
  [role=search] [role=button]:focus,
  [role=group] button:focus,
  [role=group] [type=submit]:focus,
  [role=group] [type=reset]:focus,
  [role=group] [type=button]:focus,
  [role=group] [role=button]:focus {
    box-shadow: none;
  }
}

[role=search] > *:first-child {
  border-top-left-radius: 5rem;
  border-bottom-left-radius: 5rem;
}
[role=search] > *:last-child {
  border-top-right-radius: 5rem;
  border-bottom-right-radius: 5rem;
}

/**
 * Loading ([aria-busy=true])
 */
[aria-busy=true]:not(input, select, textarea, html, form) {
  white-space: nowrap;
}
[aria-busy=true]:not(input, select, textarea, html, form)::before {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-image: var(--fz-icon-loading);
  background-size: 1em auto;
  background-repeat: no-repeat;
  content: "";
  vertical-align: -0.125em;
}
[aria-busy=true]:not(input, select, textarea, html, form):not(:empty)::before {
  margin-inline-end: calc(var(--fz-spacing) * 0.5);
}
[aria-busy=true]:not(input, select, textarea, html, form):empty {
  text-align: center;
}

button[aria-busy=true],
[type=submit][aria-busy=true],
[type=button][aria-busy=true],
[type=reset][aria-busy=true],
[role=button][aria-busy=true],
a[aria-busy=true] {
  pointer-events: none;
}

/**
 * Modal (<dialog>)
 */
:root,
:host {
  --fz-scrollbar-width: 0px;
}

dialog {
  display: flex;
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: inherit;
  min-width: 100%;
  height: inherit;
  min-height: 100%;
  padding: 0;
  border: 0;
  -webkit-backdrop-filter: var(--fz-modal-overlay-backdrop-filter);
  backdrop-filter: var(--fz-modal-overlay-backdrop-filter);
  background-color: var(--fz-modal-overlay-background-color);
  color: var(--fz-color);
}
dialog > article {
  width: 100%;
  max-height: calc(100vh - var(--fz-spacing) * 2);
  margin: var(--fz-spacing);
  overflow: auto;
}
@media (min-width: 576px) {
  dialog > article {
    max-width: 510px;
  }
}
@media (min-width: 768px) {
  dialog > article {
    max-width: 700px;
  }
}
dialog > article > header > * {
  margin-bottom: 0;
}
dialog > article > header .close, dialog > article > header :is(a, button)[rel=prev] {
  margin: 0;
  margin-left: var(--fz-spacing);
  padding: 0;
  float: right;
}
dialog > article > footer {
  text-align: right;
}
dialog > article > footer button,
dialog > article > footer [role=button] {
  margin-bottom: 0;
}
dialog > article > footer button:not(:first-of-type),
dialog > article > footer [role=button]:not(:first-of-type) {
  margin-left: calc(var(--fz-spacing) * 0.5);
}
dialog > article .close, dialog > article :is(a, button)[rel=prev] {
  display: block;
  width: 1rem;
  height: 1rem;
  margin-top: calc(var(--fz-spacing) * -1);
  margin-bottom: var(--fz-spacing);
  margin-left: auto;
  border: none;
  background-image: var(--fz-icon-close);
  background-position: center;
  background-size: auto 1rem;
  background-repeat: no-repeat;
  background-color: transparent;
  opacity: 0.5;
  transition: opacity var(--fz-transition);
}
dialog > article .close:is([aria-current]:not([aria-current=false]), :hover, :active, :focus), dialog > article :is(a, button)[rel=prev]:is([aria-current]:not([aria-current=false]), :hover, :active, :focus) {
  opacity: 1;
}
dialog:not([open]), dialog[open=false] {
  display: none;
}

.modal-is-open {
  padding-right: var(--fz-scrollbar-width, 0px);
  overflow: hidden;
  pointer-events: none;
  touch-action: none;
}
.modal-is-open dialog {
  pointer-events: auto;
  touch-action: auto;
}

:where(.modal-is-opening, .modal-is-closing) dialog,
:where(.modal-is-opening, .modal-is-closing) dialog > article {
  animation-duration: 0.2s;
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
}
:where(.modal-is-opening, .modal-is-closing) dialog {
  animation-duration: 0.8s;
  animation-name: modal-overlay;
}
:where(.modal-is-opening, .modal-is-closing) dialog > article {
  animation-delay: 0.2s;
  animation-name: modal;
}

.modal-is-closing dialog,
.modal-is-closing dialog > article {
  animation-delay: 0s;
  animation-direction: reverse;
}

@keyframes modal-overlay {
  from {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background-color: transparent;
  }
}
@keyframes modal {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
}
/**
 * Nav
 */
:where(nav li)::before {
  float: left;
  content: "​";
}

nav,
nav ul {
  display: flex;
}

nav {
  justify-content: space-between;
  overflow: visible;
}
nav ol,
nav ul {
  align-items: center;
  margin-bottom: 0;
  padding: 0;
  list-style: none;
}
nav ol:first-of-type,
nav ul:first-of-type {
  margin-left: calc(var(--fz-nav-element-spacing-horizontal) * -1);
}
nav ol:last-of-type,
nav ul:last-of-type {
  margin-right: calc(var(--fz-nav-element-spacing-horizontal) * -1);
}
nav li {
  display: inline-block;
  margin: 0;
  padding: var(--fz-nav-element-spacing-vertical) var(--fz-nav-element-spacing-horizontal);
}
nav li :where(a, [role=link]) {
  display: inline-block;
  margin: calc(var(--fz-nav-link-spacing-vertical) * -1) calc(var(--fz-nav-link-spacing-horizontal) * -1);
  padding: var(--fz-nav-link-spacing-vertical) var(--fz-nav-link-spacing-horizontal);
  border-radius: var(--fz-border-radius);
}
nav li :where(a, [role=link]):not(:hover) {
  text-decoration: none;
}
nav li button,
nav li [role=button],
nav li [type=button],
nav li input:not([type=checkbox], [type=radio], [type=range], [type=file]),
nav li select {
  height: auto;
  margin-right: inherit;
  margin-bottom: 0;
  margin-left: inherit;
  padding: calc(var(--fz-nav-link-spacing-vertical) - var(--fz-border-width) * 2) var(--fz-nav-link-spacing-horizontal);
}
nav[aria-label=breadcrumb] {
  align-items: center;
  justify-content: start;
}
nav[aria-label=breadcrumb] ul li:not(:first-child) {
  margin-inline-start: var(--fz-nav-link-spacing-horizontal);
}
nav[aria-label=breadcrumb] ul li a {
  margin: calc(var(--fz-nav-link-spacing-vertical) * -1) 0;
  margin-inline-start: calc(var(--fz-nav-link-spacing-horizontal) * -1);
}
nav[aria-label=breadcrumb] ul li:not(:last-child)::after {
  display: inline-block;
  position: absolute;
  width: calc(var(--fz-nav-link-spacing-horizontal) * 4);
  margin: 0 calc(var(--fz-nav-link-spacing-horizontal) * -1);
  content: var(--fz-nav-breadcrumb-divider);
  color: var(--fz-muted-color);
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}
nav[aria-label=breadcrumb] a[aria-current]:not([aria-current=false]) {
  background-color: transparent;
  color: inherit;
  text-decoration: none;
  pointer-events: none;
}

aside nav,
aside ol,
aside ul,
aside li {
  display: block;
}
aside li {
  padding: calc(var(--fz-nav-element-spacing-vertical) * 0.5) var(--fz-nav-element-spacing-horizontal);
}
aside li a {
  display: block;
}
aside li [role=button] {
  margin: inherit;
}

[dir=rtl] nav[aria-label=breadcrumb] ul li:not(:last-child) ::after {
  content: "\\";
}

/**
 * Progress
 */
progress {
  display: inline-block;
  vertical-align: baseline;
}

progress {
  -webkit-appearance: none;
  -moz-appearance: none;
  display: inline-block;
  appearance: none;
  width: 100%;
  height: 0.5rem;
  margin-bottom: calc(var(--fz-spacing) * 0.5);
  overflow: hidden;
  border: 0;
  border-radius: var(--fz-border-radius);
  background-color: var(--fz-progress-background-color);
  color: var(--fz-progress-color);
}
progress::-webkit-progress-bar {
  border-radius: var(--fz-border-radius);
  background: none;
}
progress[value]::-webkit-progress-value {
  background-color: var(--fz-progress-color);
  -webkit-transition: inline-size var(--fz-transition);
  transition: inline-size var(--fz-transition);
}
progress::-moz-progress-bar {
  background-color: var(--fz-progress-color);
}
@media (prefers-reduced-motion: no-preference) {
  progress:indeterminate {
    background: var(--fz-progress-background-color) linear-gradient(to right, var(--fz-progress-color) 30%, var(--fz-progress-background-color) 30%) top left/150% 150% no-repeat;
    animation: progress-indeterminate 1s linear infinite;
  }
  progress:indeterminate[value]::-webkit-progress-value {
    background-color: transparent;
  }
  progress:indeterminate::-moz-progress-bar {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: no-preference) {
  [dir=rtl] progress:indeterminate {
    animation-direction: reverse;
  }
}

@keyframes progress-indeterminate {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
/**
 * Tooltip ([data-tooltip])
 */
[data-tooltip] {
  position: relative;
}
[data-tooltip]:not(a, button, input, [role=button]) {
  border-bottom: 1px dotted;
  text-decoration: none;
  cursor: help;
}
[data-tooltip][data-placement=top]::before, [data-tooltip][data-placement=top]::after, [data-tooltip]::before, [data-tooltip]::after {
  display: block;
  z-index: 99;
  position: absolute;
  bottom: 100%;
  left: 50%;
  padding: 0.25rem 0.5rem;
  overflow: hidden;
  transform: translate(-50%, -0.25rem);
  border-radius: var(--fz-border-radius);
  background: var(--fz-tooltip-background-color);
  content: attr(data-tooltip);
  color: var(--fz-tooltip-color);
  font-style: normal;
  font-weight: var(--fz-font-weight);
  font-size: 0.875rem;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
}
[data-tooltip][data-placement=top]::after, [data-tooltip]::after {
  padding: 0;
  transform: translate(-50%, 0rem);
  border-top: 0.3rem solid;
  border-right: 0.3rem solid transparent;
  border-left: 0.3rem solid transparent;
  border-radius: 0;
  background-color: transparent;
  content: "";
  color: var(--fz-tooltip-background-color);
}
[data-tooltip][data-placement=bottom]::before, [data-tooltip][data-placement=bottom]::after {
  top: 100%;
  bottom: auto;
  transform: translate(-50%, 0.25rem);
}
[data-tooltip][data-placement=bottom]:after {
  transform: translate(-50%, -0.3rem);
  border: 0.3rem solid transparent;
  border-bottom: 0.3rem solid;
}
[data-tooltip][data-placement=left]::before, [data-tooltip][data-placement=left]::after {
  top: 50%;
  right: 100%;
  bottom: auto;
  left: auto;
  transform: translate(-0.25rem, -50%);
}
[data-tooltip][data-placement=left]:after {
  transform: translate(0.3rem, -50%);
  border: 0.3rem solid transparent;
  border-left: 0.3rem solid;
}
[data-tooltip][data-placement=right]::before, [data-tooltip][data-placement=right]::after {
  top: 50%;
  right: auto;
  bottom: auto;
  left: 100%;
  transform: translate(0.25rem, -50%);
}
[data-tooltip][data-placement=right]:after {
  transform: translate(-0.3rem, -50%);
  border: 0.3rem solid transparent;
  border-right: 0.3rem solid;
}
[data-tooltip]:focus::before, [data-tooltip]:focus::after, [data-tooltip]:hover::before, [data-tooltip]:hover::after {
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  [data-tooltip]:focus::before, [data-tooltip]:focus::after, [data-tooltip]:hover::before, [data-tooltip]:hover::after {
    --fz-tooltip-slide-to: translate(-50%, -0.25rem);
    transform: translate(-50%, 0.75rem);
    animation-duration: 0.2s;
    animation-fill-mode: forwards;
    animation-name: tooltip-slide;
    opacity: 0;
  }
  [data-tooltip]:focus::after, [data-tooltip]:hover::after {
    --fz-tooltip-caret-slide-to: translate(-50%, 0rem);
    transform: translate(-50%, -0.25rem);
    animation-name: tooltip-caret-slide;
  }
  [data-tooltip][data-placement=bottom]:focus::before, [data-tooltip][data-placement=bottom]:focus::after, [data-tooltip][data-placement=bottom]:hover::before, [data-tooltip][data-placement=bottom]:hover::after {
    --fz-tooltip-slide-to: translate(-50%, 0.25rem);
    transform: translate(-50%, -0.75rem);
    animation-name: tooltip-slide;
  }
  [data-tooltip][data-placement=bottom]:focus::after, [data-tooltip][data-placement=bottom]:hover::after {
    --fz-tooltip-caret-slide-to: translate(-50%, -0.3rem);
    transform: translate(-50%, -0.5rem);
    animation-name: tooltip-caret-slide;
  }
  [data-tooltip][data-placement=left]:focus::before, [data-tooltip][data-placement=left]:focus::after, [data-tooltip][data-placement=left]:hover::before, [data-tooltip][data-placement=left]:hover::after {
    --fz-tooltip-slide-to: translate(-0.25rem, -50%);
    transform: translate(0.75rem, -50%);
    animation-name: tooltip-slide;
  }
  [data-tooltip][data-placement=left]:focus::after, [data-tooltip][data-placement=left]:hover::after {
    --fz-tooltip-caret-slide-to: translate(0.3rem, -50%);
    transform: translate(0.05rem, -50%);
    animation-name: tooltip-caret-slide;
  }
  [data-tooltip][data-placement=right]:focus::before, [data-tooltip][data-placement=right]:focus::after, [data-tooltip][data-placement=right]:hover::before, [data-tooltip][data-placement=right]:hover::after {
    --fz-tooltip-slide-to: translate(0.25rem, -50%);
    transform: translate(-0.75rem, -50%);
    animation-name: tooltip-slide;
  }
  [data-tooltip][data-placement=right]:focus::after, [data-tooltip][data-placement=right]:hover::after {
    --fz-tooltip-caret-slide-to: translate(-0.3rem, -50%);
    transform: translate(-0.05rem, -50%);
    animation-name: tooltip-caret-slide;
  }
}
@keyframes tooltip-slide {
  to {
    transform: var(--fz-tooltip-slide-to);
    opacity: 1;
  }
}
@keyframes tooltip-caret-slide {
  50% {
    opacity: 0;
  }
  to {
    transform: var(--fz-tooltip-caret-slide-to);
    opacity: 1;
  }
}

/**
 * Accessibility & User interaction
 */
[aria-controls] {
  cursor: pointer;
}

[aria-disabled=true],
[disabled] {
  cursor: not-allowed;
}

[aria-hidden=false][hidden] {
  display: initial;
}

[aria-hidden=false][hidden]:not(:focus) {
  clip: rect(0, 0, 0, 0);
  position: absolute;
}

a,
area,
button,
input,
label,
select,
summary,
textarea,
[tabindex] {
  -ms-touch-action: manipulation;
}

[dir=rtl] {
  direction: rtl;
}

/**
 * Reduce Motion Features
 */
@media (prefers-reduced-motion: reduce) {
  *:not([aria-busy=true]),
  :not([aria-busy=true])::before,
  :not([aria-busy=true])::after {
    background-attachment: initial !important;
    animation-duration: 1ms !important;
    animation-delay: -1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
  }
}

`;