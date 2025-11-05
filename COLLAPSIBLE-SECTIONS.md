# Collapsible Sections

The Chatooly CDN provides built-in collapsible/expandable functionality for section cards.

## Usage

### 1. Include the CSS (already in unified.css)

The collapsible styles are included in `css/unified.css` by default.

```html
<link rel="stylesheet" href="https://cdn.chatooly.com/css/unified.css">
```

### 2. Include the JavaScript Module

```html
<script src="https://cdn.chatooly.com/js/modules/collapsible-sections.js"></script>
```

### 3. HTML Structure

Wrap your section content in a `.chatooly-section-content` div:

```html
<div class="chatooly-section-card">
    <span class="chatooly-section-header" role="button" tabindex="0">
        YOUR SECTION TITLE
    </span>

    <div class="chatooly-section-content">
        <!-- Your section content goes here -->
        <div class="chatooly-input-group">
            <label class="chatooly-input-label">Example</label>
            <input type="text" class="chatooly-input">
        </div>
    </div>
</div>
```

## Features

- ✅ Click to collapse/expand sections
- ✅ Smooth animations (fade and slide)
- ✅ Arrow indicator that rotates when collapsed
- ✅ Hover effects on headers
- ✅ Full keyboard accessibility (Enter/Space keys)
- ✅ Automatic initialization on page load

## Customization

### Programmatic Control

You can manually initialize or reinitialize collapsible sections:

```javascript
// Reinitialize after dynamically adding sections
ChatoolyCollapsible.initCollapsibleSections();
```

### CSS Customization

Override the animation timing or appearance:

```css
.chatooly-section-content {
    transition: max-height 0.5s ease, opacity 0.5s ease; /* Slower animation */
}

.chatooly-section-header::after {
    content: '►'; /* Different arrow */
}
```

## Browser Support

Works in all modern browsers with CSS transitions and flexbox support.
