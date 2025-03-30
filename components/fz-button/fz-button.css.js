// Button component styles
export const buttonStyles = /*css*/`
/* FzButton Styles */
:host {
    display: inline-block;
    /* Ensure smoother opacity transitions */}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--fz-button-padding, 0.75rem 1.5rem);
    border-radius: var(--fz-button-border-radius, 4px);
    font-family: var(--fz-button-font-family, inherit);
    font-size: var(--fz-button-font-size, 1rem);
    font-weight: var(--fz-button-font-weight, 500);
    line-height: var(--fz-button-line-height, 1.5);
    text-decoration: none;
    cursor: pointer;
    border: var(--fz-button-border, none);
    transition: all 0.2s ease-in-out;
    outline: none;
    opacity: 1;
    position: relative;
    overflow: hidden;
}

/* Disabled state */
.button[disabled],
.button[aria-disabled="true"] {
    opacity: var(--fz-button-disabled-opacity, 0.65);
    cursor: not-allowed;
    pointer-events: none;
}

/* Focus state */
.button:focus-visible {
    box-shadow: 0 0 0 3px var(--fz-button-focus-ring-color, rgba(0, 123, 255, 0.25));
}

/* Icon styling */
.icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.icon svg,
.icon img {
    width: var(--fz-button-icon-size, 1em);
    height: var(--fz-button-icon-size, 1em);
}

/* Icon positioning */
:host([icon-position="left"]) .icon {
    margin-right: var(--fz-button-icon-spacing, 0.5rem);
}

:host([icon-position="right"]) .icon {
    margin-left: var(--fz-button-icon-spacing, 0.5rem);
}

/* Color schemes */
.primary {
    background-color: var(--fz-button-primary-bg, #0066cc);
    color: var(--fz-button-primary-text, white);
}

.primary:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-primary-hover-bg, #0052a3);
}

.secondary {
    background-color: var(--fz-button-secondary-bg, #6c757d);
    color: var(--fz-button-secondary-text, white);
}

.secondary:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-secondary-hover-bg, #5a6268);
}

.success {
    background-color: var(--fz-button-success-bg, #28a745);
    color: var(--fz-button-success-text, white);
}

.success:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-success-hover-bg, #218838);
}

.danger {
    background-color: var(--fz-button-danger-bg, #dc3545);
    color: var(--fz-button-danger-text, white);
}

.danger:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-danger-hover-bg, #c82333);
}

.outline {
    background-color: transparent;
    color: var(--fz-button-outline-text, #0066cc);
    border: 1px solid var(--fz-button-outline-border, currentColor);
}

.outline:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-outline-hover-bg, rgba(0, 102, 204, 0.1));
}

.ghost {
    background-color: transparent;
    color: var(--fz-button-ghost-text, #0066cc);
}

.ghost:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: var(--fz-button-ghost-hover-bg, rgba(0, 102, 204, 0.1));
}
`;

export default buttonStyles;