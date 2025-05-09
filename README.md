Frenzy UI
=========

Vanilla web components for things I and maybe you need.

Components
----------

Frenzy UI is a collection of lightweight, dependency-free web components designed for ease of use and flexibility.

Currently, the following components are available:

*   **`fz-carousel`**: A flexible and touch-friendly carousel/slider component.
*   **`fz-color-picker` (internally `ColorChanger`)**: A component to change the background color of its first slotted child element, with an interactive color picker button.
*   **`fz-edit-image`**: A component that wraps a slotted `<img>` element, allowing users to replace its source by selecting a new image file.
*   **`fz-edit-text`**: Enhances a slotted HTML element, making it directly editable inline, with an optional formatting toolbar.
*   **`fz-modal`**: A simple modal/dialog component.
*   **`fz-pager`**: A component for paginating slotted child elements.

Getting Started
---------------

### Installation

Since these are vanilla JavaScript web components, you can use them directly in your HTML files. Ensure the component's JavaScript file is imported as a module.

Example:

HTML

    <script type="module" src="/path/to/fz-carousel.js"></script>
    <script type="module" src="/path/to/fz-modal.js"></script>

### Basic Usage

Each component is used as a custom HTML tag. Content is typically provided via slots, and behavior is configured through HTML attributes.

**Example: `fz-carousel`**

HTML

    <fz-carousel loop autoplay autoplay-delay="3000" slide-gap="15px">
        <div>Slide 1</div>
        <div>Slide 2</div>
        <img src="image3.jpg" alt="Slide 3" />
    </fz-carousel>

**Example: `fz-edit-text`**

HTML

    <fz-edit-text toolbar persist id="editable-header">
        <h1>Edit this Header</h1>
    </fz-edit-text>

**Example: `fz-edit-image`**

HTML

    <fz-edit-image persist storage-key="profile-pic">
        <img src="default-avatar.png" alt="User Avatar" />
    </fz-edit-image>

Refer to the JSDoc comments at the top of each component's `.js` file for a detailed list of attributes, properties, events, CSS custom properties, and CSS parts.

Demo
----

A demonstration page (`index.html`) is included in this repository. To view the demo:

1.  Clone or download this repository.
2.  Serve the `index.html` file using a local web server. A simple way to do this is by using a tool like `live-server` (available via npm: `npm install -g live-server` and then run `live-server` in the project root) or Python's built-in HTTP server (`python -m http.server` in the project root).
3.  Open the served page in your web browser (e.g., `http://localhost:8080`).

The demo page showcases each component with interactive controls to modify their attributes and observe their behavior.

Component Details
-----------------

Below is a brief overview of each component. For comprehensive details, please refer to the JSDoc comments within each component's source file.

### 1\. `fz-carousel` (`fz-carousel.js`)

A versatile carousel component.

*   **Features**: Loop, centered slides, configurable slides per view (hint), autoplay with custom delay, hideable navigation arrows and dots, customizable slide gap, touch and pointer event support for dragging.
*   **Key Attributes**: `loop`, `centered-slides`, `slides-per-view`, `autoplay`, `autoplay-delay`, `hide-arrows`, `hide-dots`, `slide-gap`.
*   **CSS Parts**: `container`, `track`, `prev-button`, `next-button`, `dots-container`.

### 2\. `ColorChanger` (as `<color-changer>`) (`fz-color-picker.js`)

Allows changing the background color of its first slotted HTML element.

*   **Features**: Interactive color picker button (visible on hover/focus), automatic icon color contrast adjustment, optional color persistence to localStorage (requires `id`), sets a global CSS variable (`--color-changer-contrast-{id}`) with the contrast color.
*   **Key Attributes**: `color` (e.g., `#RRGGBB`), `disabled`, `persist`, `id`.
*   **Events**: `change`, `slotted-element-missing`.
*   **CSS Custom Properties**: `--color-changer-button-size`, `--color-changer-icon-color`, etc.
*   **CSS Parts**: `button`.

### 3\. `fz-edit-image` (`fz-edit-image.js`)

Wraps a slotted `<img>` element, allowing users to replace its source.

*   **Features**: Click-to-replace image, read-only/disabled states, preview mode, placeholder on error, optional persistence to localStorage (requires `id` or uses a generated `storage-key`).
*   **Key Attributes**: `src`, `alt`, `readonly`, `disabled`, `preview`, `persist`, `storage-key`.
*   **Events**: `input`, `change`.
*   **CSS Custom Properties**: `--fz-editimage-overlay-bg`, `--fz-editimage-icon-color`, `--fz-editimage-aspect-ratio`, etc.
*   **CSS Parts**: `container`, `image`, `overlay`, `edit-icon`.

### 4\. `fz-edit-text` (`fz-edit-text.js`)

Enhances a slotted HTML element for inline editing.

*   **Features**: Plain text or rich text editing (with optional toolbar), placeholder, max length (plain text only), read-only/disabled states, persistence of value, font family, and font weight (requires `id`), dynamic font loading (Google Fonts), auto-color for text based on CSS variable.
*   **Key Attributes**: `value`, `placeholder`, `maxlength`, `readonly`, `disabled`, `highlight`, `tabindex`, `persist`, `id`, `toolbar`, `auto-color`.
*   **Events**: `input`, `change`, `char-count`, `max-length`, `slotted-element-missing`, `font-load-error`, `reset`.
*   **CSS Custom Properties**: `--editable-focus-border-color`, `--editable-toolbar-background`, `--color-changer-icon-color` (read by component for `auto-color`), etc.
*   **Slot**: Expects a single HTML element (e.g., `<h1>`, `<p>`, `<div>`).
*   **Global CSS for Placeholder**: Requires a global CSS rule for placeholder visibility (see JSDoc in `fz-edit-text.js`).

### 5\. `fz-modal` (`fz-modal.js`)

A simple, accessible modal dialog component.

*   **Features**: Opens/closes via `open()`/`close()` methods or `open` attribute, closes on 'Escape' key or backdrop click, animated transitions.
*   **Key Attributes**: `open`.
*   **ARIA**: `role="dialog"`, `aria-modal="true"`.

### 6\. `fz-pager` (`fz-pager.js`)

Paginates slotted child elements.

*   **Features**: Configurable items per page, dynamically updates pagination controls.
*   **Key Attributes**: `items-per-page`.
*   **Events**: `pagechange`.
*   **CSS Parts**: `controls-container`, `page-info`, `button`, `button-prev`, `button-next`.

License
-------

This project is licensed under the MIT License. See the LICENSE.md file for details.

* * *

_Readme generated based on project structure and file contents._ _Author: cwahlfeldt_
