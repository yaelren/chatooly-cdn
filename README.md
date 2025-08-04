# Chatooly CDN - Core Library

JavaScript library providing export and publishing functionality for Chatooly design tools.

## Features (POC Version)

- **Smart PNG Export**: Automatically detects canvas elements (p5.js, Three.js) or falls back to DOM capture
- **Resolution Options**: Export at 1x, 2x, or 4x resolution for high-quality outputs
- **Canvas Library Support**: Optimized for p5.js, Three.js, and other canvas-based tools
- **Development Mode**: Publishing functionality when running locally
- **Zero Dependencies**: Dynamically loads html2canvas only when needed for DOM export

## Usage

### Basic Integration

```html
<script src="https://[username].github.io/chatooly-cdn/core.js"></script>
<script>
  window.ChatoolyConfig = {
    name: "My Design Tool"
  };
</script>
```

### Manual Initialization

```javascript
Chatooly.init({
  name: "My Tool",
  resolution: 2
});
```

### Export Functions

```javascript
// Export with default settings
Chatooly.export('png');

// Export with specific resolution
Chatooly.export('png', { resolution: 4 });

// Export with custom filename
Chatooly.export('png', { 
  filename: 'my-design.png',
  resolution: 2 
});
```

## Testing

Open the test files in a web browser:

- `test-p5.html` - Tests p5.js canvas export
- `test-three.html` - Tests Three.js WebGL export  
- `test-dom.html` - Tests DOM element export fallback

## Canvas Library Support

The library automatically detects:
- p5.js canvases
- Three.js WebGL contexts
- Standard HTML5 canvas elements
- Falls back to DOM capture for other content

## Export Button

A floating export button automatically appears in the bottom-right corner with:
- Main export button (📥)
- Resolution options menu (1x, 2x, 4x)
- Publish button (development mode only)

## Development Mode

When running on localhost or file://, additional features are enabled:
- Publishing functionality
- Development console messages
- Publish button in export menu

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+