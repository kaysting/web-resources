# UI Framework v4

A modern, versatile CSS and JS UI framework for building clean, responsive UIs with minimal bloat. The core CSS and JS comes in at under 100 KB, making it ideal for mission-critical apps or those where SEO and core web vitals are top priorities.

This documentation is in development, so many sections are yet to be written.

Check out the [UI test page](/v4/test.html) to see the framework's various components in action.

## Browser support

This framework uses relatively modern technologies, but should be fully functional on any browser version dating back to 2022. The aim is not and will never be to support legacy browsers.

## Loading the framework

Add these lines to your HTML `<head>`:

```html
<!-- List two preconnects for src.kaysting.dev to properly optimize fonts and css loading -->
<link rel="preconnect" href="https://src.kaysting.dev" />
<link rel="preconnect" href="https://src.kaysting.dev" crossorigin />
<!-- Load base framework styles -->
<link rel="stylesheet" href="https://src.kaysting.dev/v4/css/base.css" />
<link rel="stylesheet" href="https://src.kaysting.dev/v4/css/utils.css" />
<!-- Load fonts -->
<!-- Replace these fonts with your own and update the framework font variables if desired -->
<link rel="stylesheet" href="https://src.kaysting.dev/fonts/poppins.css" />
<link rel="stylesheet" href="https://src.kaysting.dev/fonts/fira-code.css" />
<link rel="stylesheet" href="https://src.kaysting.dev/fonts/material-symbols.css" />
<!-- Load framework js -->
<script src="https://src.kaysting.dev/v4/js/base.js" defer></script>
```

Load `utils.css` AFTER your other styles if you need the utility classes to override your other CSS.

## What's styled by default?

By default, this framework styles the following elements with no changes needed:

- Fonts and page colors
- Headings
- Paragraphs
- `<a>` links
- Ordered/unordered lists
- `<small>` text
- Tables
- Inline `<code>` elements
- Code blocks formatted as `<pre><code> ... code ... </code></pre>`
- Radio buttons and checkboxes

## Changing basic framework settings

This framework leans heavily into the configured base and accent colors, which are each configured with a hue and saturation percentage. Lightness is determined automatically based on the theme (dark or light).

- The **base** color is used for all backgrounds, surfaces, borders, and normal text.
- The **accent** color is used for links, buttons, and selected/active states.
- The **danger** color is used to signify dangerous or negative states or actions.
- The **success** color is used to signify successful or positive states or actions.

The framework also allows the customization of fonts used in various places as well as the roundness of components and thickness of component borders.

Configure these settings by overriding only the necessary properties in a `<style>` block in your HTML `<head>`:

```css
:root {
    /* Color category properties */
    --c-base-hue: 220;
    --c-base-sat: 10%;
    --c-accent-hue: 220;
    --c-accent-sat: 80%;
    --c-danger-hue: 0;
    --c-danger-sat: 90%;
    --c-success-hue: 150;
    --c-success-sat: 60%;
    --c-syntax-lit: 70%;

    /* Fonts */
    --font-default: 'Poppins';
    --font-headers: 'Poppins';
    --font-buttons: 'Poppins';
    --font-code: 'Fira Code';

    /* Appearance settings */
    --roundness-multiplier: 1;
    --border-thickness: 1px;
}
```

### Light/dark mode

Full palettes are created from these values with varying lightness values, meaning the framework can easily be switched between light and dark mode with minimal repetitive CSS.

The framework defaults to dark mode, but the mode can be overridden by setting `data-mode` on the `<html>` element to `light` or `dark`.

To change themes automatically or based on user settings, add a small script to your head to ensure the switch is made before the first draw.

```html
<script>
    (() => {
        // Set theme by checking the 'theme' local storage item or user device preference
        const theme =
            localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    })();
</script>
```

## Symbols

Provided `material-symbols.css` is loaded, the `symbol` class can be applied to an element (usually `<span>`) to convert it into a [Material Symbol](https://fonts.google.com/icons?query=poppins&icon.style=Rounded&icon.size=128&icon.color=%23ffe9ca&preview.script=Latn). These elements should have their text content set to either the text ID or code point of a Material Symbol and will render the symbol in its place.

This framework auto-loads Material Symbols CSS at weight 400 with the rounded style. Symbols default to filled, but can be made outlined by adding the `outlined` class.

Combined with text size and color utility classes, this becomes a powerful, HTML-only icon engine.

```html
<!-- A 32x32 circled checkmark in the accent color -->
<span class="symbol text-size-32 color-accent">check_circle</span>
```

## Buttons

### Size classes

### Style classes

### Adding icons

## Text boxes

### Adding icons

### Adding interior labels

## Checkboxes and radio buttons

### Button-style inputs

### Toggle switches

## Code blocks

### Syntax highlighting

This framework has styling for the syntax-highlighting classes applied by Prism.js, which automatically identifies and highlights code blocks.

Add Prism.js and its autoloader to your HTML `<head>`:

```html
<script src="https://src.kaysting.dev/lib/prism.min.js" defer></script>
<script src="https://src.kaysting.dev/lib/prism-autoloader.min.js" defer></script>
```

And to highlight code blocks added to the DOM after load:

```js
Prism.highlightAll();
```

## Popovers

### Dropdowns

## Modals

## CSS utility classes

### Display

### Grid layouts

### Text styles

### Positioning

### Misc

## JS utility functions
