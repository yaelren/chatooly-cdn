# Chatooly Tool Conversion - AI Agent Quick Reference

> **Purpose**: Fast reference for AI agents converting tools to Chatooly format
> **For Complete Guide**: See `CHATOOLY-CONVERSION-GUIDE.md`

---

## 🚀 Quick Start (5 Steps)

### 1. HTML Structure (Copy-Paste Template)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tool Name - Chatooly</title>
    <link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
    <!-- Add your libraries (p5.js, Three.js, etc.) -->
</head>
<body>
    <header class="chatooly-header">
        <div class="chatooly-header-title">Tool Name</div>
        <div class="chatooly-header-credit">MADE BY CHATOOLY</div>
    </header>

    <div class="chatooly-app-container">
        <div class="chatooly-controls-panel">
            <div class="chatooly-controls-header">
                <p>Tool description</p>
            </div>
            <div class="chatooly-controls-content">
                <!-- Controls here -->
            </div>
        </div>

        <div class="chatooly-preview-panel">
            <div id="chatooly-container">
                <!-- Canvas created here -->
            </div>
        </div>
    </div>

    <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
    <script>
        window.ChatoolyConfig = {
            name: "Tool Name",
            author: "Your Name",
            version: "1.0.0",
            description: "Brief description",
            resolution: 2
        };
    </script>
    <script>
        // Your tool code
    </script>
</body>
</html>
```

---

### 2. Canvas Setup (Choose Your Pattern)

#### ✨ p5.js
```javascript
function setup() {
    const container = document.getElementById('chatooly-container');
    let canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('chatooly-container');
    canvas.id('chatooly-canvas'); // CRITICAL!
    canvas.style('width', '100%');
    canvas.style('height', '100%');
}

function draw() {
    // Your drawing code
}

function windowResized() {
    const container = document.getElementById('chatooly-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
}

document.addEventListener('chatooly:canvas-resized', (e) => {
    resizeCanvas(e.detail.canvas.width, e.detail.canvas.height);
});
```

#### 🎮 Three.js
```javascript
const container = document.getElementById('chatooly-container');
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
});
renderer.setSize(container.clientWidth, container.clientHeight);

const canvas = renderer.domElement;
canvas.id = 'chatooly-canvas'; // CRITICAL!
container.appendChild(canvas);

document.addEventListener('chatooly:canvas-resized', (e) => {
    camera.aspect = e.detail.canvas.width / e.detail.canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(e.detail.canvas.width, e.detail.canvas.height);
});
```

#### 🎨 HTML5 Canvas
```javascript
const canvas = document.getElementById('chatooly-canvas') ||
               document.createElement('canvas');
canvas.id = 'chatooly-canvas'; // CRITICAL!

const container = document.getElementById('chatooly-container');
container.appendChild(canvas);

canvas.width = container.clientWidth;
canvas.height = container.clientHeight;

const ctx = canvas.getContext('2d');

document.addEventListener('chatooly:canvas-resized', (e) => {
    canvas.width = e.detail.canvas.width;
    canvas.height = e.detail.canvas.height;
});
```

---

### 3. Controls Setup

```html
<div class="chatooly-control-group">
    <label for="param1">Parameter Name</label>
    <input type="range" id="param1" min="0" max="100" value="50">
    <span id="param1-value">50</span>
</div>

<div class="chatooly-control-group">
    <label for="color1">Color</label>
    <input type="color" id="color1" value="#ff0000">
</div>

<div class="chatooly-control-group">
    <button id="reset-btn">🔄 Reset</button>
</div>
```

```javascript
document.getElementById('param1').addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('param1-value').textContent = value;
    // Update your visualization
});
```

---

### 4. Mouse Events (If Needed)

```javascript
const canvas = document.getElementById('chatooly-canvas');

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Handle mouse move
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Handle click
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    // Handle touch
}, { passive: false });
```

---

### 5. Optional: High-Res Export

```javascript
window.renderHighResolution = function(targetCanvas, scale) {
    const ctx = targetCanvas.getContext('2d');
    targetCanvas.width = originalWidth * scale;
    targetCanvas.height = originalHeight * scale;
    ctx.scale(scale, scale);
    // Re-render your scene at high quality
};
```

---

## ⚠️ Critical IDs & Classes (Do NOT Change)

| Element | ID/Class | Purpose |
|---------|----------|---------|
| Export container | `id="chatooly-container"` | Required for export system |
| Canvas element | `id="chatooly-canvas"` | Required for canvas detection |
| App wrapper | `class="chatooly-app-container"` | Layout structure |
| Controls panel | `class="chatooly-controls-panel"` | Left panel styling |
| Preview panel | `class="chatooly-preview-panel"` | Right panel styling |
| Control groups | `class="chatooly-control-group"` | Control spacing |

---

## 🎨 Common CSS Variables

```css
/* Colors */
--chatooly-color-primary: #e5e5e5;
--chatooly-color-text: #e5e5e5;
--chatooly-color-background: #121212;
--chatooly-color-surface: #0f0f0f;
--chatooly-color-border: #333333;

/* Fonts */
--chatooly-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--chatooly-font-family-mono: 'SF Mono', Consolas, monospace;

/* Spacing */
--chatooly-spacing-sm: 8px;
--chatooly-spacing-md: 16px;
--chatooly-spacing-lg: 24px;
```

---

## ✅ Conversion Checklist (Must Complete All)

```
Structure:
[ ] HTML follows template structure
[ ] unified.css is linked
[ ] core.min.js CDN script is loaded
[ ] window.ChatoolyConfig is defined

Canvas:
[ ] Canvas has id="chatooly-canvas"
[ ] Canvas is inside id="chatooly-container"
[ ] Canvas responds to container size
[ ] Window resize handler exists
[ ] chatooly:canvas-resized event listener added

Controls:
[ ] Controls use chatooly-control-group class
[ ] Event listeners update visualization
[ ] Values display correctly

Testing:
[ ] Tool loads without errors
[ ] Export button appears (bottom-right)
[ ] PNG export works
[ ] Video export works (if animated)
[ ] Canvas resize works
[ ] Controls work
[ ] Mouse/touch works (if applicable)
```

---

## 🚨 Common Mistakes & Fixes

### ❌ Export button doesn't appear
**Fix**: Ensure CDN script loads BEFORE `window.ChatoolyConfig`

### ❌ Canvas not detected
**Fix**: Set `canvas.id = 'chatooly-canvas'`

### ❌ Canvas not resizing
**Fix**: Add `chatooly:canvas-resized` event listener

### ❌ Styles look broken
**Fix**: Link to `unified.css` in `<head>`

### ❌ Video export not available
**Fix**: Ensure animation loop uses `requestAnimationFrame` or p5.js `draw()`

---

## 📚 Key Resources

| Resource | URL/Path |
|----------|----------|
| Complete Guide | `docs/CHATOOLY-CONVERSION-GUIDE.md` |
| p5.js Template | `tests/test-p5-mediarecorder.html` |
| Three.js Template | `tests/test-threejs-mediarecorder-template.html` |
| Canvas Template | `tests/test-canvas-mediarecorder-template.html` |
| CSS Variables | `css/variables.css` |
| CDN Script | `https://yaelren.github.io/chatooly-cdn/js/core.min.js` |
| CSS | `https://yaelren.github.io/chatooly-cdn/css/unified.css` |

---

## 🤖 Agent Decision Tree

```
Start
  ↓
Is it p5.js?
  Yes → Use p5.js Pattern
  No → ↓
Is it Three.js?
  Yes → Use Three.js Pattern
  No → ↓
Uses Canvas API?
  Yes → Use HTML5 Canvas Pattern
  No → DOM-based (no special canvas setup)
  ↓
Apply HTML Structure
  ↓
Add Controls
  ↓
Add Mouse Events (if needed)
  ↓
Test Checklist
  ↓
Done!
```

---

## 📊 Performance Tips

1. **Use `requestAnimationFrame`** for animations
2. **Clear canvas efficiently** - don't redraw everything
3. **Limit DOM updates** - batch control changes
4. **Optimize mouse events** - throttle if needed
5. **Use CSS transforms** for non-canvas animations

---

## 🎯 What Makes a Good Chatooly Tool?

✅ **Must Have**:
- Proper container structure
- Canvas with correct ID
- Working export functionality
- Responsive design
- Basic controls

✅ **Should Have**:
- Clear control labels
- Sensible default values
- Reset button
- Visual feedback
- Mobile-friendly

✅ **Nice to Have**:
- High-res export function
- Animation controls
- Multiple presets
- Keyboard shortcuts
- Help/info section

---

## 💡 Pro Tips

1. **Start with template** - Copy a template HTML and modify
2. **Test early** - Check export button appears immediately
3. **Console logging** - Use helpful logs for debugging
4. **Incremental testing** - Test each feature as you add it
5. **Reference examples** - Check `/tests/` for working examples

---

## 📞 When Stuck

1. Check conversion checklist - did you miss a step?
2. Look at template examples in `/tests/`
3. Check console for errors
4. Verify canvas ID is set correctly
5. Ensure CDN script loads successfully
6. Review complete guide for detailed explanations

---

## 🎬 Quick Convert Example (Full)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Circle Drawer - Chatooly</title>
    <link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
</head>
<body>
    <header class="chatooly-header">
        <div class="chatooly-header-title">Circle Drawer</div>
        <div class="chatooly-header-credit">MADE BY CHATOOLY</div>
    </header>

    <div class="chatooly-app-container">
        <div class="chatooly-controls-panel">
            <div class="chatooly-controls-header">
                <p>Draw circles on canvas</p>
            </div>
            <div class="chatooly-controls-content">
                <div class="chatooly-control-group">
                    <label for="circle-size">Circle Size</label>
                    <input type="range" id="circle-size" min="10" max="100" value="30">
                    <span id="circle-size-value">30</span>
                </div>
                <div class="chatooly-control-group">
                    <label for="circle-color">Color</label>
                    <input type="color" id="circle-color" value="#ff0000">
                </div>
                <div class="chatooly-control-group">
                    <button id="clear-btn">🗑️ Clear</button>
                </div>
            </div>
        </div>

        <div class="chatooly-preview-panel">
            <div id="chatooly-container">
                <canvas id="chatooly-canvas"></canvas>
            </div>
        </div>
    </div>

    <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
    <script>
        window.ChatoolyConfig = {
            name: "Circle Drawer",
            author: "Demo",
            version: "1.0.0",
            description: "Draw circles on canvas",
            resolution: 2
        };
    </script>
    <script>
        const canvas = document.getElementById('chatooly-canvas');
        const container = document.getElementById('chatooly-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ctx = canvas.getContext('2d');

        let circleSize = 30;
        let circleColor = '#ff0000';

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.fillStyle = circleColor;
            ctx.beginPath();
            ctx.arc(x, y, circleSize, 0, Math.PI * 2);
            ctx.fill();
        });

        document.getElementById('circle-size').addEventListener('input', (e) => {
            circleSize = parseInt(e.target.value);
            document.getElementById('circle-size-value').textContent = circleSize;
        });

        document.getElementById('circle-color').addEventListener('change', (e) => {
            circleColor = e.target.value;
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        document.addEventListener('chatooly:canvas-resized', (e) => {
            canvas.width = e.detail.canvas.width;
            canvas.height = e.detail.canvas.height;
        });
    </script>
</body>
</html>
```

**Result**: Fully working Chatooly tool in ~80 lines!

---

**End of Quick Reference**

✨ Now drag & drop this guide to Claude and say: *"Convert this tool to Chatooly"*
