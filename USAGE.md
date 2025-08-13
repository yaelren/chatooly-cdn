# Chatooly CDN v2.0.0 Usage

## Available JavaScript Files

### core.min.js (Recommended)
```html
<script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
```
- **Size**: ~30KB minified
- **Includes**: Export functionality + Automatic style injection
- **Best for**: All new tools (automatically gets design system)

### core-only.min.js (Legacy)
```html
<script src="https://yaelren.github.io/chatooly-cdn/js/core-only.min.js"></script>
```
- **Size**: ~25KB minified  
- **Includes**: Export functionality only
- **Best for**: Existing tools that don't want automatic styling

### style-injection.min.js (Standalone)
```html
<script src="https://yaelren.github.io/chatooly-cdn/js/style-injection.min.js"></script>
```
- **Size**: ~5KB minified
- **Includes**: Style injection only
- **Best for**: Adding design system to existing tools

## Automatic Style Injection

When using `core.min.js` or `style-injection.min.js`, the design system will automatically:

1. ✅ Inject unified.min.css from CDN
2. ✅ Apply consistent fonts, colors, spacing
3. ✅ Style all buttons, inputs, forms  
4. ✅ Work in development and production
5. ✅ Handle loading errors gracefully

## Configuration Options

```javascript
window.ChatoolyConfig = {
    name: "My Tool",
    layout: "sidebar",    // Optional: sidebar, tabs, modal, split, custom
    theme: "dark",        // Optional: light, dark, auto
    // ... other config
};
```

## Development Mode

In localhost/development:
- Uses local CSS files if available
- Enables Ctrl+Shift+R to reload styles
- Logs available CSS variables to console

## Manual Control

```javascript
// Check if styles are loaded
Chatooly.styleInjection.isLoaded()

// Reload styles (dev mode)
Chatooly.styleInjection.reload()

// Get/set CSS variables
Chatooly.styleInjection.getVariable('color-primary')
Chatooly.styleInjection.setVariable('color-primary', '#ff0000')
```

Built: 2025-08-13T10:15:12.662Z
