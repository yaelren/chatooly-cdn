# Chatooly Conversion Guide

> **Complete reference for converting tools to Chatooly format**
>
> For quick start, see [AI-AGENT-QUICK-REFERENCE.md](AI-AGENT-QUICK-REFERENCE.md)

---

## 📋 Table of Contents

1. [Essential HTML Structure](#essential-html-structure)
2. [Canvas Integration Patterns](#canvas-integration-patterns)
3. [Background Manager API](#background-manager-api)
4. [Canvas Resizer API](#canvas-resizer-api)
5. [Event System](#event-system)
6. [Common Pitfalls](#common-pitfalls)

---

## Essential HTML Structure

Every Chatooly tool requires this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tool Name - Chatooly</title>

    <!-- REQUIRED: Chatooly CSS -->
    <link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
</head>
<body>
    <!-- Optional: Header -->
    <header class="chatooly-header">
        <div class="chatooly-header-title">Tool Name</div>
        <div class="chatooly-header-credit">MADE BY CHATOOLY</div>
    </header>

    <!-- REQUIRED: Main Container -->
    <div class="chatooly-app-container">

        <!-- Left Panel: Controls -->
        <div class="chatooly-controls-panel">
            <div class="chatooly-controls-header">
                <p>Tool description</p>
            </div>
            <div class="chatooly-controls-content">
                <!-- Your controls here -->
                <div class="chatooly-control-group">
                    <label for="param1">Parameter</label>
                    <input type="range" id="param1" min="0" max="100" value="50">
                    <span id="param1-value">50</span>
                </div>
            </div>
        </div>

        <!-- Right Panel: Canvas Area -->
        <div class="chatooly-preview-panel">
            <!-- CRITICAL: Export container -->
            <div id="chatooly-container">
                <!-- Canvas created here with id="chatooly-canvas" -->
            </div>
        </div>
    </div>

    <!-- REQUIRED: Chatooly CDN -->
    <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>

    <!-- REQUIRED: Configuration -->
    <script>
        window.ChatoolyConfig = {
            name: "Tool Name",
            author: "Your Name",
            version: "1.0.0",
            resolution: 2
        };
    </script>

    <!-- Your tool code -->
    <script>
        // Your implementation
    </script>
</body>
</html>
```

### Critical Elements

| Element | ID/Class | Required | Purpose |
|---------|----------|----------|---------|
| Container | `id="chatooly-container"` | ✅ Yes | Export detection |
| Canvas | `id="chatooly-canvas"` | ✅ Yes | Canvas detection |
| App wrapper | `class="chatooly-app-container"` | ✅ Yes | Layout |
| Controls panel | `class="chatooly-controls-panel"` | ✅ Yes | Left sidebar |
| Preview panel | `class="chatooly-preview-panel"` | ✅ Yes | Right area |

---

## Canvas Integration Patterns

### Pattern 1: p5.js

```javascript
function setup() {
    // Get container for responsive sizing
    const container = document.getElementById('chatooly-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Create canvas with proper parenting and ID
    let canvas = createCanvas(containerWidth, containerHeight);
    canvas.parent('chatooly-container');  // CRITICAL
    canvas.id('chatooly-canvas');          // CRITICAL

    canvas.style('width', '100%');
    canvas.style('height', '100%');
}

function draw() {
    // Your drawing code
    background(220);
}

// REQUIRED: Resize handler
function windowResized() {
    const container = document.getElementById('chatooly-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
}

// REQUIRED: Canvas resize event
document.addEventListener('chatooly:canvas-resized', (e) => {
    resizeCanvas(e.detail.canvas.width, e.detail.canvas.height);
});
```

### Pattern 2: Three.js

```javascript
const container = document.getElementById('chatooly-container');
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true  // REQUIRED for export
});

renderer.setSize(container.clientWidth, container.clientHeight);

// Set canvas ID
const canvas = renderer.domElement;
canvas.id = 'chatooly-canvas';  // CRITICAL
container.appendChild(canvas);

// REQUIRED: Canvas resize event
document.addEventListener('chatooly:canvas-resized', (e) => {
    const { width, height } = e.detail.canvas;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
```

### Pattern 3: HTML5 Canvas

```javascript
const canvas = document.getElementById('chatooly-canvas') ||
               document.createElement('canvas');
canvas.id = 'chatooly-canvas';  // CRITICAL

const container = document.getElementById('chatooly-container');
container.appendChild(canvas);

canvas.width = container.clientWidth;
canvas.height = container.clientHeight;

const ctx = canvas.getContext('2d');

// REQUIRED: Canvas resize event
document.addEventListener('chatooly:canvas-resized', (e) => {
    canvas.width = e.detail.canvas.width;
    canvas.height = e.detail.canvas.height;
});
```

---

## Background Manager API

Control canvas backgrounds (colors, transparency, images).

### Initialize

```javascript
const canvas = document.getElementById('chatooly-canvas');
Chatooly.backgroundManager.init(canvas);
```

### Methods

```javascript
// Set background color
Chatooly.backgroundManager.setBackgroundColor('#FFFFFF');

// Enable/disable transparency (for PNG exports with alpha)
Chatooly.backgroundManager.setTransparent(true);
Chatooly.backgroundManager.setTransparent(false);

// Load background image
const file = e.target.files[0];  // From file input
await Chatooly.backgroundManager.setBackgroundImage(file);

// Clear background image
Chatooly.backgroundManager.clearBackgroundImage();

// Set image fit mode
Chatooly.backgroundManager.setFit('cover');   // Fill canvas, may crop
Chatooly.backgroundManager.setFit('contain'); // Fit entirely, may have gaps
Chatooly.backgroundManager.setFit('fill');    // Stretch to fill

// Get current state
const state = Chatooly.backgroundManager.getBackgroundState();
// Returns: { bgColor, bgTransparent, bgImage, bgImageURL, bgFit }

// Draw background to canvas (Canvas API)
Chatooly.backgroundManager.drawToCanvas(ctx, canvas.width, canvas.height);

// Reset to defaults
Chatooly.backgroundManager.reset();
```

### Integration Example: Canvas API

```javascript
const canvas = document.getElementById('chatooly-canvas');
const ctx = canvas.getContext('2d');

Chatooly.backgroundManager.init(canvas);
Chatooly.backgroundManager.setBackgroundColor('#1a1a1a');

function draw() {
    // Draw background first
    Chatooly.backgroundManager.drawToCanvas(ctx, canvas.width, canvas.height);

    // Your drawing code
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(100, 100, 200, 200);

    requestAnimationFrame(draw);
}

draw();
```

### Integration Example: p5.js

```javascript
function setup() {
    const container = document.getElementById('chatooly-container');
    let canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('chatooly-container');
    canvas.id('chatooly-canvas');

    // Initialize background manager
    Chatooly.backgroundManager.init(canvas.elt);  // Use .elt for p5.js
    Chatooly.backgroundManager.setBackgroundColor('#000000');
}

function draw() {
    // Draw background first
    const canvas = document.getElementById('chatooly-canvas');
    const ctx = canvas.getContext('2d');
    Chatooly.backgroundManager.drawToCanvas(ctx, width, height);

    // Your p5.js drawing
    noStroke();
    fill(255, 0, 0);
    ellipse(mouseX, mouseY, 50, 50);
}
```

### Adding Background Controls

```html
<div class="chatooly-controls-content">
    <!-- Background Color -->
    <div class="chatooly-control-group">
        <label for="bg-color">Background Color</label>
        <input type="color" id="bg-color" value="#ffffff">
    </div>

    <!-- Transparent Toggle -->
    <div class="chatooly-control-group">
        <label>
            <input type="checkbox" id="bg-transparent">
            Transparent Background
        </label>
    </div>

    <!-- Background Image -->
    <div class="chatooly-control-group">
        <label for="bg-image">Background Image</label>
        <input type="file" id="bg-image" accept="image/*">
    </div>

    <!-- Image Fit -->
    <div class="chatooly-control-group">
        <label for="bg-fit">Image Fit</label>
        <select id="bg-fit">
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
        </select>
    </div>
</div>

<script>
function setupBackgroundControls() {
    const canvas = document.getElementById('chatooly-canvas');
    Chatooly.backgroundManager.init(canvas);

    document.getElementById('bg-color').addEventListener('change', (e) => {
        Chatooly.backgroundManager.setBackgroundColor(e.target.value);
        redrawCanvas();  // Your redraw function
    });

    document.getElementById('bg-transparent').addEventListener('change', (e) => {
        Chatooly.backgroundManager.setTransparent(e.target.checked);
        redrawCanvas();
    });

    document.getElementById('bg-image').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await Chatooly.backgroundManager.setBackgroundImage(file);
            redrawCanvas();
        }
    });

    document.getElementById('bg-fit').addEventListener('change', (e) => {
        Chatooly.backgroundManager.setFit(e.target.value);
        redrawCanvas();
    });
}

setupBackgroundControls();
</script>
```

---

## Canvas Resizer API

Control canvas dimensions programmatically.

### Concepts

**Display Size**: How canvas appears on screen (CSS pixels)
**Export Size**: Resolution of exported images (canvas pixels)

### Methods

```javascript
// Set export resolution
Chatooly.canvasResizer.setExportSize(1920, 1080);

// Get current dimensions
const width = Chatooly.canvasResizer.exportWidth;   // e.g., 1000
const height = Chatooly.canvasResizer.exportHeight; // e.g., 1000
```

### Custom Size Presets

```javascript
const presets = {
    instagram: { width: 1080, height: 1080 },
    youtube: { width: 1920, height: 1080 },
    twitter: { width: 1200, height: 675 },
    poster: { width: 2480, height: 3508 }
};

function applyPreset(name) {
    const preset = presets[name];
    if (preset) {
        Chatooly.canvasResizer.setExportSize(preset.width, preset.height);
    }
}

// Usage
applyPreset('instagram');
```

### Adding Size Controls

```html
<div class="chatooly-control-group">
    <label>Quick Sizes</label>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="size-preset" data-width="1080" data-height="1080">
            Square
        </button>
        <button class="size-preset" data-width="1920" data-height="1080">
            HD
        </button>
        <button class="size-preset" data-width="1080" data-height="1920">
            Story
        </button>
        <button class="size-preset" data-width="3840" data-height="2160">
            4K
        </button>
    </div>
</div>

<script>
document.querySelectorAll('.size-preset').forEach(button => {
    button.addEventListener('click', (e) => {
        const width = parseInt(e.target.dataset.width);
        const height = parseInt(e.target.dataset.height);
        Chatooly.canvasResizer.setExportSize(width, height);
    });
});
</script>
```

### Aspect Ratio Lock Example

```javascript
let aspectRatioLocked = false;
let aspectRatio = 1;

document.getElementById('lock-aspect').addEventListener('change', (e) => {
    aspectRatioLocked = e.target.checked;
    if (aspectRatioLocked) {
        const width = Chatooly.canvasResizer.exportWidth;
        const height = Chatooly.canvasResizer.exportHeight;
        aspectRatio = width / height;
    }
});

document.getElementById('width-input').addEventListener('input', (e) => {
    const width = parseInt(e.target.value);

    if (aspectRatioLocked) {
        const height = Math.round(width / aspectRatio);
        document.getElementById('height-input').value = height;
        Chatooly.canvasResizer.setExportSize(width, height);
    }
});
```

---

## Event System

### chatooly:canvas-resized

Fired when canvas dimensions change.

```javascript
document.addEventListener('chatooly:canvas-resized', (event) => {
    const { width, height } = event.detail.canvas;

    // For p5.js
    resizeCanvas(width, height);

    // For Three.js
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // For Canvas API
    const canvas = document.getElementById('chatooly-canvas');
    canvas.width = width;
    canvas.height = height;
});
```

**Payload**:
```javascript
{
    canvas: {
        width: number,   // Export resolution
        height: number
    },
    displayWidth: number,   // CSS display size
    displayHeight: number
}
```

### chatooly:styles-loaded

Fired when CSS is loaded.

```javascript
document.addEventListener('chatooly:styles-loaded', (event) => {
    console.log('Styles loaded from:', event.detail.source);
    // Safe to access CSS variables now
});
```

**Payload**:
```javascript
{
    source: string  // 'cdn' or 'local'
}
```

### Event Lifecycle

```
Page Load
    ↓
CDN Script Loads
    ↓
ChatoolyConfig Parsed
    ↓
[chatooly:styles-loaded]
    ↓
Your Tool Initializes
    ↓
Canvas Created
    ↓
User Resizes Canvas
    ↓
[chatooly:canvas-resized]
    ↓
User Exports
    ↓
Export Complete
```

### Debugging Events

```javascript
// Log all Chatooly events during development
function debugChatoolyEvents() {
    ['chatooly:canvas-resized', 'chatooly:styles-loaded'].forEach(eventName => {
        document.addEventListener(eventName, (event) => {
            console.log(`[EVENT] ${eventName}`, event.detail);
        });
    });
}

if (window.location.hostname === 'localhost') {
    debugChatoolyEvents();
}
```

---

## Common Pitfalls

### ❌ Export button doesn't appear

**Cause**: CDN script not loaded or config not defined
**Fix**:
```html
<!-- Correct order -->
<script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
<script>
    window.ChatoolyConfig = { name: "Tool Name" };
</script>
```

### ❌ Canvas not detected for export

**Cause**: Canvas missing ID or wrong container
**Fix**:
```javascript
// Ensure these two things
canvas.id = 'chatooly-canvas';                    // 1. Canvas has ID
document.getElementById('chatooly-container')     // 2. Container exists
    .appendChild(canvas);
```

### ❌ Canvas doesn't resize

**Cause**: Missing resize event listener
**Fix**:
```javascript
document.addEventListener('chatooly:canvas-resized', (e) => {
    // Update your canvas size here
    resizeCanvas(e.detail.canvas.width, e.detail.canvas.height);
});
```

### ❌ Video export not available

**Cause**: No animation loop detected
**Fix**:
```javascript
// Ensure you have a render loop
function animate() {
    requestAnimationFrame(animate);  // CRITICAL for animation detection
    // Your render code
}
animate();
```

### ❌ Styles look broken

**Cause**: Missing CSS link
**Fix**:
```html
<link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
```

### ❌ Mouse events not working

**Cause**: Canvas not initialized before adding listeners
**Fix**:
```javascript
// Add listeners AFTER canvas is created
function setup() {
    createCanvas(400, 400);
    // NOW safe to add listeners
    setupMouseInteraction();
}
```

---

## Conversion Checklist

Use this to verify your conversion:

### Structure
- [ ] HTML follows template structure
- [ ] `chatooly-container` div exists
- [ ] `chatooly-canvas` ID set on canvas
- [ ] unified.css linked
- [ ] core.min.js loaded
- [ ] `window.ChatoolyConfig` defined

### Canvas
- [ ] Canvas created inside container
- [ ] Canvas responds to container size
- [ ] `chatooly:canvas-resized` listener added
- [ ] Window resize handler exists
- [ ] Animation loop (if animated)

### Controls
- [ ] Controls use `chatooly-control-group`
- [ ] Event listeners update visualization
- [ ] Values display correctly

### Testing
- [ ] Tool loads without errors
- [ ] Export button appears
- [ ] PNG export works
- [ ] Video export works (if animated)
- [ ] Canvas resize works
- [ ] Controls work
- [ ] Responsive on mobile

---

## External Resources

### CDN Links
```html
<!-- JavaScript -->
<script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>

<!-- CSS -->
<link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
```

### Templates
- [p5.js Template](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-p5-mediarecorder.html)
- [Three.js Template](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-threejs-mediarecorder-template.html)
- [Canvas Template](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-canvas-mediarecorder-template.html)

### CSS References
- [variables.css](https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/variables.css)
- [components.css](https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/components.css)
- [base.css](https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/base.css)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Completeness**: Reference for core APIs and patterns

For complete workflows and AI conversion instructions, see:
- [AI-AGENT-QUICK-REFERENCE.md](AI-AGENT-QUICK-REFERENCE.md) - Fast AI conversions
- [HOW-TO-USE-THIS-DOCUMENTATION.md](HOW-TO-USE-THIS-DOCUMENTATION.md) - Complete guide
