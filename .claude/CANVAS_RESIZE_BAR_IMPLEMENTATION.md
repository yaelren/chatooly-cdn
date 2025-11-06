# Canvas Resize Bar Implementation

> **Bottom-positioned horizontal control bar for canvas size management**
>
> **Created**: 2025-11-04
> **Figma Design**: Export Bar component
> **Status**: ✅ Implemented and integrated

---

## Overview

The Canvas Resize Bar is a new bottom-positioned UI component that replaces the old floating panel approach for canvas size controls. It provides a cleaner, more modern interface for managing canvas dimensions and applying preset aspect ratios.

### Key Features

- **Bottom-positioned horizontal bar** - Centered at bottom of screen
- **Width/Height inputs** - Direct numeric input for custom dimensions
- **Preset buttons** - Quick access to common aspect ratios
- **Active state indication** - Visual feedback for selected preset
- **Full integration** - Works seamlessly with existing `canvasResizer` and `canvasArea` modules
- **Responsive design** - Adapts to mobile screens

---

## Design Specifications

### Visual Design (from Figma)

**Component Structure**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Canvas Size │ [ W 800px ] [ H 800px ] Presets: [HD 16:9] [SQUARE 1:1] [4:3] [PORTRAIT 9:16] │
└─────────────────────────────────────────────────────────────────────┘
```

**Colors**:
- Background: `#232323` (dark gray)
- Border: `#343434` (medium gray)
- Control section: `#d9e5d7` (light green)
- Input boxes: `#aeb7ac` (gray-green)
- Active preset: `#000000` (black) with white text
- Inactive preset: `#6d736c` (gray) with `#d9e5d7` text
- Label text: `#8f8f8f` (medium gray)

**Typography**:
- Font: System font (via `var(--chatooly-font-family)`)
- Label: 12px, medium weight
- Input/preset text: 10px, medium weight

**Spacing**:
- Border radius: 10px (outer), 5px (inner elements)
- Padding: 5px (vertical), 15px (horizontal left), 5px (horizontal right)
- Gap between elements: 15px (major), 10px (minor), 5px (tight)

---

## File Location

**Module**: [`js/modules/canvas-resize-bar.js`](../js/modules/canvas-resize-bar.js)

**Build Order** (updated in [`build.js`](../build.js)):
```javascript
'canvas-area.js',        // Canvas area container
'canvas-resizer.js',     // Canvas resizing core
'canvas-resize-bar.js',  // ← NEW: Canvas resize bar UI
'canvas-zoom.js',        // Canvas zoom
```

---

## API Reference

### Initialization

```javascript
// Initialize the resize bar
Chatooly.canvasResizeBar.init();
```

**When to initialize**:
- After DOM is ready
- After `canvasResizer` and `canvasArea` are initialized
- Typically in tool's initialization sequence

### Configuration

**Presets** (built-in):
```javascript
Chatooly.canvasResizeBar.presets = {
    'HD (16:9)': { width: 1920, height: 1080 },
    'SQUARE (1:1)': { width: 1000, height: 1000 },
    '4:3': { width: 1024, height: 768 },
    'PORTRAIT (9:16)': { width: 1080, height: 1920 }
};
```

**Default active preset**: `'SQUARE (1:1)'`

### Public Methods

#### `init()`
Initialize and render the resize bar.

```javascript
Chatooly.canvasResizeBar.init();
```

#### `updateDimensions(width, height)`
Update displayed dimensions and detect matching preset.

```javascript
Chatooly.canvasResizeBar.updateDimensions(1920, 1080);
// Automatically detects and activates "HD (16:9)" preset
```

#### `show()`
Display the resize bar.

```javascript
Chatooly.canvasResizeBar.show();
```

#### `hide()`
Hide the resize bar.

```javascript
Chatooly.canvasResizeBar.hide();
```

#### `toggle()`
Toggle visibility of the resize bar.

```javascript
Chatooly.canvasResizeBar.toggle();
```

#### `destroy()`
Remove the resize bar and clean up.

```javascript
Chatooly.canvasResizeBar.destroy();
```

---

## Integration

### How It Works

The Canvas Resize Bar integrates with the existing canvas control system:

```
┌──────────────────────┐
│  Canvas Resize Bar   │ ← User interacts
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   canvasResizer      │ ← Updates exportWidth/exportHeight
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   canvasArea         │ ← Applies dimensions to canvas
└──────────────────────┘
```

**Key Integration Points**:

1. **Getting current dimensions**: Uses `Chatooly.canvasResizer.getCurrentDimensions()`
2. **Setting dimensions**: Updates `Chatooly.canvasResizer.exportWidth/exportHeight`
3. **Applying to canvas**: Calls `Chatooly.canvasArea.setExportResolution()`
4. **Legacy support**: Falls back to `canvasResizer.applyLegacyResize()` if no `canvasArea`

### Event System

**Emitted Events**:

```javascript
// When dimension is manually changed
document.dispatchEvent(new CustomEvent('chatooly:resize-bar:change', {
    detail: {
        dimension: 'width' | 'height',
        value: number,
        width: number,
        height: number
    }
}));

// When preset is applied
document.dispatchEvent(new CustomEvent('chatooly:resize-bar:preset', {
    detail: {
        presetName: string,
        width: number,
        height: number
    }
}));
```

**Listens For**:

```javascript
// External resize events (from other UI components)
document.addEventListener('chatooly:canvas:resized', (e) => {
    // e.detail: { width, height }
    // Auto-updates bar inputs and preset state
});
```

---

## Usage Examples

### Basic Setup

```javascript
// In your tool's initialization
window.ChatoolyConfig = {
    name: "My Tool",
    resolution: 2
};

// After DOM ready and Chatooly loaded
document.addEventListener('DOMContentLoaded', () => {
    // Chatooly.init() is called automatically

    // Initialize the resize bar
    Chatooly.canvasResizeBar.init();
});
```

### Custom Presets

```javascript
// Override default presets
Chatooly.canvasResizeBar.presets = {
    'Instagram Post': { width: 1080, height: 1080 },
    'Instagram Story': { width: 1080, height: 1920 },
    'Twitter Post': { width: 1200, height: 675 },
    'Facebook Cover': { width: 820, height: 312 }
};

// Set default active preset
Chatooly.canvasResizeBar.activePreset = 'Instagram Post';

// Re-initialize to apply changes
Chatooly.canvasResizeBar.destroy();
Chatooly.canvasResizeBar.init();
```

### Listen to Resize Events

```javascript
// Track when user changes canvas size
document.addEventListener('chatooly:resize-bar:change', (e) => {
    const { width, height, dimension, value } = e.detail;
    console.log(`Canvas resized: ${width}x${height}`);
    console.log(`Changed ${dimension} to ${value}`);

    // Update your tool's internal state
    myTool.updateCanvasSize(width, height);
});

// Track preset selections
document.addEventListener('chatooly:resize-bar:preset', (e) => {
    const { presetName, width, height } = e.detail;
    console.log(`Applied preset: ${presetName} (${width}x${height})`);
});
```

### Programmatic Control

```javascript
// Update from external source
const newWidth = 1920;
const newHeight = 1080;

Chatooly.canvasResizeBar.updateDimensions(newWidth, newHeight);
// Automatically activates "HD (16:9)" if dimensions match

// Toggle visibility based on user preference
document.getElementById('toggle-controls').addEventListener('click', () => {
    Chatooly.canvasResizeBar.toggle();
});
```

---

## Styling

All styles are injected automatically via `_injectCSS()` method. They use:

- **CSS Variables**: Integration with Chatooly design system (`var(--chatooly-font-family)`)
- **Responsive**: Mobile breakpoint at 768px
- **Scoped**: All classes prefixed with `chatooly-resize-`

**CSS Classes** (auto-generated):

```css
.chatooly-resize-bar              /* Main container */
.chatooly-resize-bar-content      /* Content wrapper */
.chatooly-resize-bar-label        /* "Canvas Size" label */
.chatooly-resize-bar-sections     /* Sections container */
.chatooly-resize-format           /* Green format section */
.chatooly-resize-inputs           /* W/H inputs group */
.chatooly-input-box               /* Input wrapper */
.chatooly-resize-presets          /* Presets group */
.chatooly-presets-label           /* "Presets" label */
.chatooly-preset-buttons          /* Buttons container */
.chatooly-preset-btn              /* Individual preset button */
.chatooly-preset-btn.active       /* Active preset state */
```

**Style Overrides** (if needed):

```html
<style>
/* Example: Change position */
.chatooly-resize-bar {
    bottom: 30px !important;
    /* or top: 30px for top positioning */
}

/* Example: Custom colors */
.chatooly-resize-format {
    background: #e5f0e3 !important;
}

/* Example: Wider bar */
.chatooly-resize-bar {
    padding: 8px 8px 8px 20px !important;
}
</style>
```

---

## Migration Guide

### From Old Floating Panel

**Old approach** (floating panel):
```javascript
// Size controls were in floating panel menu
Chatooly.ui.createExportButton();
// User clicks → panel opens → canvas size tab
```

**New approach** (bottom bar):
```javascript
// Always-visible bottom bar
Chatooly.canvasResizeBar.init();
// Direct access, no clicking needed
```

**Benefits**:
- ✅ Always visible - no need to open menu
- ✅ Faster workflow - direct input access
- ✅ Cleaner UI - dedicated horizontal space
- ✅ Better mobile - responsive design

### Coexistence Strategy

The resize bar can coexist with the old UI during transition:

```javascript
// Initialize both (for backward compatibility)
Chatooly.ui.createExportButton();     // Old floating panel
Chatooly.canvasResizeBar.init();      // New bottom bar

// Or hide old canvas size controls
const canvasSizeTab = document.querySelector('[data-tab="canvas-size"]');
if (canvasSizeTab) {
    canvasSizeTab.style.display = 'none';
}
```

---

## Testing

### Manual Testing Checklist

- [ ] **Initialization**: Bar appears at bottom center
- [ ] **Width input**: Changing value updates canvas
- [ ] **Height input**: Changing value updates canvas
- [ ] **Preset buttons**: Clicking applies correct dimensions
- [ ] **Active state**: Active preset shows black background
- [ ] **Manual input**: Typing custom size deactivates presets
- [ ] **Validation**: Values <100 or >4000 show alert
- [ ] **Integration**: Works with existing `canvasResizer`
- [ ] **Events**: Custom events fire correctly
- [ ] **Responsive**: Works on mobile (< 768px)
- [ ] **Destruction**: `destroy()` removes bar cleanly

### Test HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas Resize Bar Test</title>
    <link rel="stylesheet" href="../css/unified.css">
</head>
<body>
    <canvas id="chatooly-canvas" width="800" height="800"></canvas>

    <script src="../js/core.js"></script>
    <script>
        // Test initialization
        window.ChatoolyConfig = {
            name: "Resize Bar Test"
        };

        // Listen for events
        document.addEventListener('chatooly:resize-bar:change', (e) => {
            console.log('Resize change:', e.detail);
        });

        document.addEventListener('chatooly:resize-bar:preset', (e) => {
            console.log('Preset applied:', e.detail);
        });

        // Initialize after DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                Chatooly.canvasResizeBar.init();
                console.log('Resize bar initialized');
            }, 500);
        });
    </script>
</body>
</html>
```

---

## Build & Deploy

### Building

```bash
# Build the library with new module
npm run build

# This creates:
# - js/core.js (development, includes canvas-resize-bar.js)
# - js/core.min.js (production, minified)
```

### Verifying Module Inclusion

```bash
# Check if module is in build
grep -n "canvasResizeBar" js/core.js

# Should show the entire module concatenated
```

### CDN Deployment

After building and pushing to GitHub:

```html
<!-- Production -->
<script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>

<!-- Development -->
<script src="https://yaelren.github.io/chatooly-cdn/js/core.js"></script>
```

The resize bar will be available automatically in `window.Chatooly.canvasResizeBar`.

---

## Future Enhancements

### Potential Features

1. **Custom preset management**
   - Add/remove presets dynamically
   - Save user's custom presets to localStorage

2. **Lock aspect ratio**
   - Toggle to maintain aspect ratio when changing W/H
   - Visual chain icon indicator

3. **Unit selection**
   - Switch between px, %, inches
   - DPI/resolution selector

4. **Orientation toggle**
   - Quick swap W ⇄ H
   - Rotation icon button

5. **Keyboard shortcuts**
   - Alt+1, Alt+2, etc. for presets
   - Arrow keys for incremental changes

6. **Collapsible mode**
   - Minimize to icon only
   - Expand on hover or click

7. **Drag to reposition**
   - Allow user to move bar
   - Remember position in localStorage

---

## Troubleshooting

### Bar Doesn't Appear

**Check**:
1. Is `Chatooly.canvasResizeBar.init()` called?
2. Is it called after DOM ready?
3. Are there console errors?

**Solution**:
```javascript
// Ensure initialization after Chatooly loads
setTimeout(() => {
    if (Chatooly.canvasResizeBar) {
        Chatooly.canvasResizeBar.init();
    } else {
        console.error('canvasResizeBar module not loaded');
    }
}, 200);
```

### Dimensions Don't Update

**Check**:
1. Is `canvasResizer` module loaded?
2. Is `canvasArea` initialized?
3. Canvas element exists with id `chatooly-canvas`?

**Solution**:
```javascript
// Verify modules
console.log('canvasResizer:', Chatooly.canvasResizer);
console.log('canvasArea:', Chatooly.canvasArea);

// Check canvas
const canvas = document.getElementById('chatooly-canvas');
console.log('Canvas element:', canvas);
```

### Presets Not Working

**Check**:
1. Preset dimensions match exactly?
2. Active preset state updated?

**Debug**:
```javascript
// Log preset application
document.addEventListener('chatooly:resize-bar:preset', (e) => {
    console.log('Preset applied:', e.detail);
    console.log('Active preset:', Chatooly.canvasResizeBar.activePreset);
});
```

### Styles Look Wrong

**Check**:
1. Chatooly CSS variables loaded?
2. Style injection succeeded?

**Solution**:
```javascript
// Verify CSS injection
const styles = document.getElementById('chatooly-resize-bar-styles');
console.log('Styles injected:', !!styles);

// Re-inject if needed
if (!styles) {
    Chatooly.canvasResizeBar._injectCSS();
}
```

---

## Related Components

- **[canvasResizer](../js/modules/canvas-resizer.js)**: Core canvas resizing logic
- **[canvasArea](../js/modules/canvas-area.js)**: Canvas container management
- **[ui](../js/modules/ui.js)**: Old floating panel UI (being phased out)

---

## Change Log

### v1.0.0 (2025-11-04)
- ✨ Initial implementation
- ✅ Figma design conversion complete
- ✅ Full integration with `canvasResizer` and `canvasArea`
- ✅ 4 preset aspect ratios (HD, Square, 4:3, Portrait)
- ✅ Event system for external integration
- ✅ Responsive mobile support
- ✅ Build system updated

---

**Implementation Status**: ✅ Complete and Ready for Testing

**Next Steps**:
1. Build the library: `npm run build`
2. Test in a sample HTML file
3. Deploy to GitHub Pages CDN
4. Update documentation for tool developers
5. Consider phasing out old floating panel controls

---

**Generated**: 2025-11-04
**Component**: Canvas Resize Bar
**Figma Design**: Export Bar (Node ID: 512:517)
