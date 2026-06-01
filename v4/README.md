# kaysting.dev UI Framework

A modern, versatile CSS and JS UI framework for building clean, responsive UIs with minimal bloat. Coming in at under 100 KB, this framework is ideal for mission-critical apps where load times are of the utmost importance.

## Loading the framework

Add these lines to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://src.kaysting.dev" crossorigin />
<link rel="stylesheet" href="https://src.kaysting.dev/v4/css/base.css" />
<link rel="stylesheet" href="https://src.kaysting.dev/v4/css/utils.css" />
<script src="https://src.kaysting.dev/v4/js/base.js" defer></script>
```

Load `utils.css` AFTER your other styles if you need the utility classes to override your other CSS.

## Browser support

This framework uses relatively modern technologies, but should be fully functional on any browser version dating back to 2022. The aim is not and will never be to support legacy browsers.

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

## Setting theme colors

This framework leans heavily into the configured base and accent colors, which are each configured with a hue and saturation percentage. Lightness is determined automatically based on the theme (dark or light).

- The **base** color is used for all backgrounds, surfaces, borders, and normal text.
- The **accent** color is used for links, buttons, and selected/active states.
- The **danger** color is used to signify dangerous or negative states or actions.
- The **success** color is used to signify successful or positive states or actions.

Configure the colors by placing this `<style>` block in your HTML `<head>`:

```css
:root {
    /* Base color */
    --c-base-hue: 340;
    --c-base-sat: 10%;

    /* Accent color */
    --c-accent-hue: 340;
    --c-accent-sat: 60%;

    /* Danger color */
    --c-danger-hue: 5;
    --c-danger-sat: 90%;

    /* Success color */
    --c-success-hue: 150;
    --c-success-sat: 60%;
}
```

You might prefer to only override the color properties you care about.

### Light/dark mode

Full palettes are created from these values with varying lightness values, meaning the framework can easily be switched between light and dark mode with minimal repetitive CSS.

The framework defaults to dark mode, but the mode can be overridden by setting `data-mode` on the `<html>` element to `light` or `dark`.

To change themes automatically or based on user settings, add a small script to your head to ensure the switch is made before the first draw.

```js
<script>
  (() => {
    // Set theme by checking the 'theme' local storage item or user device preference
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

## Symbols

The `symbol` class can be applied to an element (usually `<span>`) to convert it into a [Material Symbol](https://fonts.google.com/icons?query=poppins&icon.style=Rounded&icon.size=128&icon.color=%23ffe9ca&preview.script=Latn). These elements should have their text content set to either the text ID or code point of a Material Symbol and will render the symbol in its place.

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
<script src="https://src.kaysting.dev/lib/prism.min.js"></script>
<script src="https://src.kaysting.dev/lib/prism-autoloader.min.js"></script>
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
