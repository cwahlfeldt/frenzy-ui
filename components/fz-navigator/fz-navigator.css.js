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
    --eyebrow-height: 36px;
    --search-height: 56px;
    --nav-item-color: #24273a;
    --nav-item-hover-color: #000000;
    --nav-item-active-color: #000000;
    --eyebrow-bg-color: #24273a;
    --eyebrow-text-color: #ffffff;
    --eyebrow-hover-color: #fab387;
    
    /* Ensure smoother opacity transitions for FOUC prevention */
    display: block;
    opacity: 1;
}

.navigator-component {
    font-family: var(--font-family);
}

/* Eyebrow Menu */
.eyebrow-container {
    background-color: var(--eyebrow-bg-color);
    color: var(--eyebrow-text-color);
    padding: 0.5rem 1.5rem;
    font-size: 0.85rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
    height: var(--eyebrow-height);
}

.eyebrow-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: flex-end;
}

.eyebrow-menu li {
    margin-left: 1.5rem;
}

.eyebrow-menu a {
    color: var(--eyebrow-text-color);
    text-decoration: none;
    transition: color 0.2s ease;
}

.eyebrow-menu a:hover {
    color: var(--eyebrow-hover-color);
}

/* Main Navigation */
.navigator {
    background-color: var(--bg-color);
    padding: 0.5rem 1.5rem;
    position: fixed;
    top: var(--eyebrow-height);
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: var(--navigator-height);
}

:host([hide-eyebrow]) .navigator {
    top: 0;
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

/* Desktop Navigation */
.desktop-nav-container {
    display: none;
}

@media (min-width: 992px) {
    .desktop-nav-container {
        display: flex;
        align-items: center;
    }
    
    .desktop-nav-items {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    
    .desktop-nav-items li {
        margin: 0 0.75rem;
        position: relative;
    }
    
    .desktop-nav-items a {
        color: var(--nav-item-color);
        text-decoration: none;
        font-weight: 600;
        padding: 0.5rem 0;
        display: block;
        position: relative;
        transition: color 0.2s ease;
    }
    
    .desktop-nav-items a::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--nav-item-active-color);
        transition: width 0.3s ease;
    }
    
    .desktop-nav-items a:hover {
        color: var(--nav-item-hover-color);
    }
    
    .desktop-nav-items a:hover::after {
        width: 100%;
    }
    
    /* Dropdown handling for desktop */
    .desktop-nav-items .menu-item-has-children {
        position: relative;
    }
    
    .desktop-nav-items .menu-item-has-children .sub-menu {
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 200px;
        background-color: var(--bg-color);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        padding: 0.5rem 0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
        z-index: 100;
    }
    
    .desktop-nav-items .menu-item-has-children:hover .sub-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .desktop-nav-items .sub-menu li {
        margin: 0;
        width: 100%;
    }
    
    .desktop-nav-items .sub-menu a {
        padding: 0.5rem 1rem;
        display: block;
        border-bottom: none;
    }
    
    .desktop-nav-items .sub-menu a::after {
        display: none;
    }
}

:host([hide-desktop-nav]) .desktop-nav-container {
    display: none;
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

@media (min-width: 992px) {
    /* Smaller spacing on desktop */
    .menu-toggle {
        margin-left: 0.25rem;
    }
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

/* Menu Panel */
.navigator-wrapper {
    position: fixed;
    top: calc(var(--navigator-height) + var(--eyebrow-height));
    right: 0;
    width: 100%;
    height: calc(100vh - var(--navigator-height) - var(--eyebrow-height));
    background-color: var(--bg-color);
    transform: translateX(100%);
    transition: transform var(--transition-speed) ease;
    z-index: 999;
    pointer-events: none;
    overflow-y: auto;
}

:host([hide-eyebrow]) .navigator-wrapper {
    top: var(--navigator-height);
    height: calc(100vh - var(--navigator-height));
}

.navigator-wrapper.active {
    transform: translateX(0);
    pointer-events: auto;
}

@media (min-width: 992px) {
    .navigator-wrapper {
        width: 350px; /* Narrower on desktop */
    }
}

/* Drawer content styles */
.drawer-content {
    position: relative;
    height: 100%;
    padding: 1rem 0;
    overflow-y: auto;
}

/* Mobile version of desktop nav items */
/* Primary, Secondary, and Mobile Menu Styling */
.mobile-nav-items-container {
    padding: 0 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.secondary-menu-container {
    padding: 0 1.5rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 992px) {
    .mobile-nav-items-container {
        display: none; /* Hide on desktop as these items are in the top bar */
    }
}

.mobile-nav-items {
    padding-bottom: 1rem;
}

.secondary-menu {
    margin-top: 0;
}

/* Search Functionality */
.search-container {
    position: fixed;
    top: calc(var(--navigator-height) + var(--eyebrow-height));
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

:host([hide-eyebrow]) .search-container {
    top: var(--navigator-height);
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
.navigator-items {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
}

::slotted(.navigator-items li),
.navigator-items li {
    margin-bottom: 1rem;
}

/* Custom Menu Content */
.default-menu-content {
    padding: 0 1.5rem;
}

slot[name="menu-content"]::slotted(*) {
    padding: 0 1.5rem;
}

.default-menu-content a,
.mobile-nav-items a {
    display: block;
    color: var(--black);
    text-decoration: none;
    font-weight: 600;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--grey);
}

.default-menu-content .sub-menu,
.mobile-nav-items .sub-menu {
    list-style: none;
    padding-left: 1rem;
}

.logo-slot a {
    line-height: 0;
}

/* Slot styling */
::slotted([slot="nav-items"]) {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

::slotted([slot="nav-items"] li) {
    margin: 0 0.75rem;
}

::slotted([slot="nav-items"] a) {
    color: var(--nav-item-color);
    text-decoration: none;
    font-weight: 600;
    padding: 0.5rem 0;
    display: block;
    position: relative;
    transition: color 0.2s ease;
}

::slotted([slot="eyebrow-slot"]) {
    display: flex;
    justify-content: flex-end;
}
`;

export default navigatorStyles;