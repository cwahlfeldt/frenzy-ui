// Navigator component styles
export const navigatorStyles = /*css*/`
:host {
    --bg-color: #fab387;
    --black: #000000;
    --hamburger-color: #24273a;
    --grey: #e6e7e8;
    --font-family: 'Open Sans', sans-serif;
    --transition-speed: 0.3s;
    --navigator-height: 67.5px;
    --search-height: 56px;
    
    /* Ensure smoother opacity transitions for FOUC prevention */
    display: block;
    opacity: 1;
    transition: opacity 0.2s ease-in;
}

.navigator-component {
    font-family: var(--font-family);
}

/* Mobile Nav */
.navigator {
    background-color: var(--bg-color);
    padding: 0.5rem 1.5rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: var(--navigator-height);
}

.container {
    width: 100%;
    margin: 0 auto;
}

.navigator-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.navigator-actions {
    position: relative;
    right: 0;
    display: flex;
    align-items: center;
}

.logo-container {
    position: relative;
    display: inline-block;
    line-height: 0;
}

/* Default elements styling */
.default-logo {
    color: var(--hamburger-color);
    text-decoration: none;
    font-weight: bold;
    font-size: 1.5rem;
}

.default-search-btn {
    background: none;
    border: none;
    color: var(--hamburger-color);
    cursor: pointer;
    padding: 0.5rem;
    margin-bottom: -2px;
}

/* Hamburger Menu */
.menu-toggle {
    background: none;
    border: none;
    color: var(--hamburger-color);
    cursor: pointer;
    padding: 0.5rem;
    padding-right: 0;
    margin-left: 0.5rem;
}

.menu-toggle:focus {
    outline: none;
}

.hamburger {
    display: inline-block;
    position: relative;
    width: 24px;
    height: 24px;
}

.hamburger span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: var(--hamburger-color);
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
}

.hamburger span:nth-child(1) {
    top: 6px;
}

.hamburger span:nth-child(2),
.hamburger span:nth-child(3) {
    top: 12px;
}

.hamburger span:nth-child(4) {
    top: 18px;
}

.menu-toggle.active .hamburger span:nth-child(1) {
    top: 12px;
    width: 0%;
    left: 50%;
}

.menu-toggle.active .hamburger span:nth-child(2) {
    transform: rotate(45deg);
}

.menu-toggle.active .hamburger span:nth-child(3) {
    transform: rotate(-45deg);
}

.menu-toggle.active .hamburger span:nth-child(4) {
    top: 12px;
    width: 0%;
    left: 50%;
}

/* Mobile Menu */
.navigator-wrapper {
    position: fixed;
    top: var(--navigator-height);
    right: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    transform: translateX(100%);
    transition: transform var(--transition-speed) ease;
    z-index: 999;
    pointer-events: none;
}

.navigator-wrapper.active {
    transform: translateX(0);
    pointer-events: auto;
}

/* Search Functionality */
.search-container {
    position: fixed;
    top: var(--navigator-height);
    left: 0;
    width: 100%;
    background-color: var(--bg-color);
    transform: translateY(-100%);
    transition: transform var(--transition-speed) ease;
    z-index: 998;
    padding: 0.5rem 1.5rem;
    box-sizing: border-box;
    pointer-events: none;
}

.search-container.active {
    transform: translateY(0);
    pointer-events: auto;
}

.search-form {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
}

.search-input {
    flex: 1;
    height: var(--search-height);
    border: 1px solid var(--grey);
    border-radius: 4px;
    padding: 0.5rem 3rem 0.5rem 1rem;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
    background: white;
}

.search-submit {
    position: absolute;
    right: 0;
    top: 0;
    height: var(--search-height);
    background: none;
    border: none;
    color: var(--hamburger-color);
    cursor: pointer;
    padding: 0 1rem;
}

@media (min-width: 768px) {
    .search-container {
        position: absolute;
        top: 50%;
        right: 80px;
        left: auto;
        transform: translateY(-50%) scaleX(0);
        transform-origin: right center;
        width: 300px;
        padding: 0;
        background: transparent;
    }

    .search-container.active {
        transform: translateY(-50%) scaleX(1);
    }
}



/* Utility for slotted content and default content */
::slotted(.navigator-items),
.default-menu-content .navigator-items {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
}

::slotted(.navigator-items li),
.default-menu-content .navigator-items li {
    margin-bottom: 1rem;
}

.default-menu-content a {
    display: block;
    color: var(--black);
    text-decoration: none;
    font-weight: 600;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--grey);
}

.default-menu-content .sub-menu {
    list-style: none;
    padding-left: 1rem;
}

.logo-slot a {
    line-height: 0;
}
`;

export default navigatorStyles;