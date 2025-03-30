// Base styles for all components
export const baseStyles = /*css*/`
*,
*::before,
*::after {
    box-sizing: border-box;
}

:host {
    display: block;
    opacity: 1;
    transition: opacity 0.2s ease-in;
}

/* FOUC Prevention */
.fz-initializing {
    opacity: 0 !important;
}

.fz-initialized {
    opacity: 1 !important;
    transition: opacity 0.1s ease-in-out;
}
`;

export default baseStyles;