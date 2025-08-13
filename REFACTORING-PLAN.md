# Chatooly Template & CDN Refactoring Plan

## Overview
Create a unified CDN system that provides:
1. **Universal Design System** - All tools get consistent styling (fonts, colors, components)
2. **Optional Layout Templates** - Tools can use pre-built layouts OR create custom layouts
3. **Automatic Updates** - All tools receive design updates when CDN is updated

**Core Philosophy**: Every tool gets everything. Use what you need, ignore what you don't.

## Current Architecture Analysis

### Template Structure (chatooly-template/)
```
index.html          - Base HTML structure with placeholders
styles.css          - Complete UI styling (300+ lines)
js/chatooly-config.js - Tool configuration
js/main.js          - Tool-specific logic (empty template)
```

### CDN Structure (chatooly-cdn/)
```
js/core.min.js      - Export functionality + UI components
js/modules/         - Modular components
tests/              - CDN testing files
```

### Current Issues
1. **Duplication**: Each tool copies the entire `styles.css` (lines 1-141 are identical)
2. **Manual Updates**: Styling changes require updating every published tool
3. **Inconsistency**: Tools can diverge from the design system
4. **Size**: Each tool carries ~8KB of repeated CSS

## Unified CDN Architecture

### Core Principle: One CDN Bundle, Total Flexibility

The CDN provides a complete design system and optional layouts. Tools can:
- **Option A**: Use pre-built layout templates (sidebar, tabs, etc.)
- **Option B**: Build custom layouts with consistent styling
- **Option C**: Mix both approaches

### What CDN Always Provides (Loaded for Every Tool):

#### 1. Universal Design System
```css
/* Always loaded - ensures visual consistency */
:root {
  /* Typography */
  --chatooly-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
  --chatooly-font-size-base: 14px;
  --chatooly-font-weight-normal: 400;
  --chatooly-font-weight-bold: 600;
  
  /* Colors */
  --chatooly-color-primary: #007bff;
  --chatooly-color-secondary: #6c757d;
  --chatooly-color-success: #28a745;
  --chatooly-color-danger: #dc3545;
  --chatooly-color-text: #333;
  --chatooly-color-text-muted: #666;
  --chatooly-color-background: #f5f5f5;
  --chatooly-color-surface: white;
  
  /* Spacing */
  --chatooly-spacing-xs: 4px;
  --chatooly-spacing-sm: 8px;
  --chatooly-spacing-md: 16px;
  --chatooly-spacing-lg: 24px;
  --chatooly-spacing-xl: 32px;
  
  /* Borders & Shadows */
  --chatooly-border-radius: 6px;
  --chatooly-border-width: 2px;
  --chatooly-border-color: #ddd;
  --chatooly-shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --chatooly-shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --chatooly-shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
  
  /* Transitions */
  --chatooly-transition-fast: 0.15s ease;
  --chatooly-transition-normal: 0.2s ease;
  --chatooly-transition-slow: 0.3s ease;
}

/* Universal base styles */
body {
  font-family: var(--chatooly-font-family);
  color: var(--chatooly-color-text);
  background: var(--chatooly-color-background);
}

/* All buttons get Chatooly styling */
button, .btn, .chatooly-btn {
  font-family: var(--chatooly-font-family);
  padding: 10px 20px;
  border-radius: var(--chatooly-border-radius);
  border: none;
  cursor: pointer;
  transition: all var(--chatooly-transition-normal);
}

/* All inputs get Chatooly styling */
input, select, textarea, .chatooly-input {
  font-family: var(--chatooly-font-family);
  padding: 8px 12px;
  border: var(--chatooly-border-width) solid var(--chatooly-border-color);
  border-radius: var(--chatooly-border-radius);
  transition: border-color var(--chatooly-transition-fast);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--chatooly-color-primary);
}
```

#### 2. Component Library (Always Available)
```css
/* Standard components - use if you want */
.chatooly-card { }
.chatooly-slider { }
.chatooly-toggle { }
.chatooly-dropdown { }
.chatooly-color-picker { }
.chatooly-control-group { }
```

#### 3. Layout Templates (Available but Optional)
```javascript
// Tool can choose to use pre-built layout
window.ChatoolyConfig = {
  layout: "sidebar", // Uses CDN layout template
  controls: [...]
};

// OR build completely custom layout
window.ChatoolyConfig = {
  layout: "custom", // No CDN layout, just styling
};
```

### Phase 1: Universal Design System Implementation

#### 1.1 HTML Template System
- **Revolutionary approach**: Move entire HTML layout to CDN
- **Template reduction**: 73 lines → 10-15 lines
- **CDN generates**: Complete app structure, panels, containers
- **Tools provide**: Only content, controls, and config

#### 1.2 CDN Template Injection
- **File**: `chatooly-cdn/js/modules/template.js`
- **Function**: Generate complete HTML layout from config
- **Usage**: Minimal HTML file calls CDN to build interface

### Phase 2: CDN Style Integration

#### 1.1 Create CDN Style Module
- **File**: `chatooly-cdn/css/template.css`
- **Content**: Move base styles from template
- **Sections to move**:
  ```css
  /* Base reset and typography */
  *, body, .app-container
  
  /* Layout system */
  .controls-panel, .preview-panel
  
  /* Export container */
  #chatooly-canvas
  
  /* Control components */
  .control-group, .control-group label
  .control-group input[type="color"]
  .control-group input[type="range"]
  .control-group input[type="text"]
  .control-group input[type="checkbox"]
  .control-group select
  .value-display
  
  /* Buttons */
  .btn, .btn-secondary, .btn:hover
  
  /* Responsive design */
  @media queries
  ```

#### 1.2 Create Minified Style Bundle
- **File**: `chatooly-cdn/css/template.min.css`
- **Process**: Minify and compress base styles
- **Size target**: <5KB compressed

#### 1.3 Update CDN Core to Inject Styles
- **File**: `chatooly-cdn/js/modules/ui.js`
- **Function**: Add `loadTemplateStyles()`
- **Implementation**:
  ```javascript
  loadTemplateStyles: function() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://yaelren.github.io/chatooly-cdn/css/template.min.css';
      document.head.appendChild(link);
  }
  ```

### Phase 2: Template Streamlining

#### 2.1 Update Base Template
- **File**: `chatooly-template/index.html`
- **Changes**:
  - Remove local `styles.css` link
  - Add version comment for tracking
  - Update CDN script to newer version

#### 2.2 Minimize Template Styles
- **File**: `chatooly-template/styles.css`
- **New content**: Only tool-specific placeholder styles
- **Size**: Reduce from ~8KB to ~500 bytes
- **Content**:
  ```css
  /* Tool-Specific Styles - Customize for your tool */
  /* Base styles loaded from CDN automatically */
  
  /* ========== EDIT BELOW: Add Your Custom Styles ========== */
  /* Add styles for your tool's specific elements here */
  
  /* Example tool customizations:
  #chatooly-canvas {
      background: linear-gradient(45deg, #667eea, #764ba2);
  }
  
  .my-custom-element {
      color: red;
  }
  */
  
  /* ========== END EDIT SECTION ========== */
  ```

### Phase 3: Enhanced Component System

#### 3.1 Create Component Library
- **File**: `chatooly-cdn/css/components.css`
- **Components**:
  ```css
  /* Pre-built control components */
  .control-group-enhanced
  .toggle-switch
  .slider-fancy
  .color-picker-advanced
  .button-group
  .tabs
  .accordion
  ```

#### 3.2 Add Theme Support
- **Files**: 
  - `chatooly-cdn/css/themes/light.css`
  - `chatooly-cdn/css/themes/dark.css`
  - `chatooly-cdn/css/themes/minimal.css`

#### 3.3 JavaScript Component API
- **Enhancement**: CDN JavaScript API for components
- **Usage**:
  ```javascript
  Chatooly.ui.createSlider('#my-slider', { min: 0, max: 100 });
  Chatooly.ui.setTheme('dark');
  Chatooly.ui.addCustomComponent('my-widget');
  ```

### Phase 2: Canvas Scaling System

#### 2.1 Photoshop-Like Canvas Behavior
```javascript
window.ChatoolyConfig = {
  canvas: {
    width: 1000,        // Export size in pixels
    height: 1000,       // Export size in pixels
    display: "fit",     // How to display: "fit", "fill", "actual"
    background: "white"
  }
};
```

#### 2.2 CDN Canvas Manager
```javascript
// CDN automatically handles:
// 1. Creates canvas at export size (1000x1000)
// 2. Scales display to fit screen (e.g., shows at 500x500)
// 3. Maintains full resolution for export
// 4. Works with all canvas types (p5.js, Three.js, regular canvas, DOM)

Chatooly.canvas = {
  // Set up display scaling
  setupScaling: function(exportWidth, exportHeight) {
    const container = document.getElementById('chatooly-canvas');
    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight;
    
    // Calculate scale to fit
    const scale = Math.min(
      availableWidth / exportWidth,
      availableHeight / exportHeight
    );
    
    // Apply CSS transform for display
    // But maintain full resolution for export
  },
  
  // Export at full resolution
  exportHighRes: function() {
    // Exports at original 1000x1000, not display size
  }
};
```

### Phase 3: Tool Workflow Options

#### 3.1 Ultra-Minimal Template
- **New template size**: 10-15 lines total
- **Structure**:
  ```html
  <!DOCTYPE html>
  <html><head><title>{{toolName}}</title></head>
  <body>
    <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
    <script src="js/chatooly-config.js"></script>
    <script src="js/main.js"></script>
  </body></html>
  ```

#### 3.2 Config-Driven UI Generation
- **Enhanced config**: Full UI definition in `chatooly-config.js`
- **Control definitions**: JSON-based control specification
- **Layout options**: Multiple layout templates (sidebar, tabs, modal)
- **Example**:
  ```javascript
  window.ChatoolyConfig = {
    name: "My Tool",
    layout: "sidebar",
    controls: [
      { type: "color", id: "bg-color", label: "Background", value: "#ff0000" },
      { type: "range", id: "size", label: "Size", min: 1, max: 100, value: 50 },
      { type: "text", id: "title", label: "Title", value: "Hello World" }
    ],
    canvas: {
      width: 800,
      height: 600,
      background: "white"
    }
  };
  ```

#### 3.3 CDN Template Engine
- **File**: `chatooly-cdn/js/modules/template-engine.js`
- **Capability**: Generate complete HTML from config
- **Features**:
  - Multiple layout templates
  - Control auto-generation
  - Event binding
  - Responsive design
  - Theme support

### Phase 4: Advanced Layout System

#### 4.1 Multiple Layout Templates
- **Sidebar Layout** (current): Controls left, canvas right
- **Tab Layout**: Controls in tabs above canvas
- **Modal Layout**: Controls in floating panels
- **Split Layout**: Controls above/below canvas
- **Custom Layout**: User-defined positioning

#### 4.2 Component Library Integration
- **Pre-built controls**: Slider, color picker, dropdown, toggle
- **Control groups**: Collapsible sections, tabs
- **Advanced widgets**: File upload, image picker, font selector
- **Custom components**: User-defined control types

#### 4.3 Layout Responsiveness
- **Auto-adaptation**: Layout changes based on screen size
- **Mobile-first**: Touch-optimized controls
- **PWA support**: Installable as mobile app

### Phase 4: Development Debug Panel

#### 4.1 Development-Only Features
```javascript
// Available when ?debug=true or localStorage.debug = true
Chatooly.debug = {
  panel: {
    cdnVersion: "v2.1.3",
    updateAvailable: "v2.1.4",
    currentTheme: "light",
    currentLayout: "sidebar",
    canvasInfo: "1000x1000 → 500x500 (50% scale)",
    
    actions: {
      updateCDN: function() { /* Force CDN update */ },
      switchTheme: function(theme) { /* Test themes */ },
      switchLayout: function(layout) { /* Test layouts */ },
      testExport: function() { /* Test PNG export */ },
      clearCache: function() { /* Clear CDN cache */ }
    }
  }
};
```

#### 4.2 Update Notification System
```javascript
// Simple, non-intrusive update check
Chatooly.updates = {
  checkOnLoad: function() {
    // Check CDN version vs cached version
    if (newVersionAvailable) {
      // Show small notification
      this.showUpdateButton();
    }
  },
  
  showUpdateButton: function() {
    // Small "🔄 Update Available" button near export button
    // Click to refresh and get latest CDN
  }
};
```

### Phase 5: Simplified Implementation Plan

#### 4.1 Implement CDN Versioning
- **URL structure**:
  ```
  https://yaelren.github.io/chatooly-cdn/v1/css/template.min.css
  https://yaelren.github.io/chatooly-cdn/v1/js/core.min.js
  https://yaelren.github.io/chatooly-cdn/v2/css/template.min.css
  ```

#### 4.2 Backwards Compatibility
- **Strategy**: Maintain v1 for existing tools
- **Default**: New templates use latest version
- **Migration**: Optional upgrade path for existing tools

#### 4.3 Auto-Update Configuration
- **Config option**:
  ```javascript
  window.ChatoolyConfig = {
      name: "My Tool",
      cdnVersion: "latest", // or "v1", "v2", etc.
      autoUpdate: true      // automatically get latest styles
  };
  ```

### Phase 5: Migration Strategy

#### 5.1 Existing Tools
1. **Gradual migration**: Tools continue working with current styles
2. **Opt-in updates**: Add CDN version parameter to config
3. **Style conflict detection**: Warn about conflicting local styles

#### 5.2 New Tools
1. **Streamlined template**: New tools automatically use CDN styles
2. **Minimal local styles**: Only tool-specific customizations
3. **Better performance**: Faster loading, cached styles

#### 5.3 Published Tools Update
1. **Re-publish existing tools**: Update to use CDN styles
2. **Migration script**: Automated tool to update published tools
3. **Compatibility check**: Ensure no breaking changes

## Implementation Priority

### High Priority ✅
1. Create base CDN stylesheet
2. Update CDN core to inject styles
3. Update template to use CDN styles
4. Test with existing tools

### Medium Priority 📋
1. Component library
2. Theme support
3. Version management
4. Migration tools

### Low Priority 🔄
1. Advanced components
2. Performance optimizations
3. Analytics and usage tracking

## Technical Specifications

## Revolutionary Impact

### Before vs After Comparison

#### Current Template (73 lines)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Design Tool - Chatooly</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app-container">
        <div class="controls-panel">
            <h1>My Design Tool</h1>
            <div class="controls">
                <!-- Tool controls here -->
            </div>
        </div>
        <div class="preview-panel">
            <div id="chatooly-canvas">
                <!-- Canvas content -->
            </div>
        </div>
    </div>
    <script src="https://yaelren.github.io/chatooly-cdn/js/core.js"></script>
    <script src="js/chatooly-config.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

#### Revolutionary Template (10 lines)
```html
<!DOCTYPE html>
<html><head><title>My Design Tool</title></head>
<body>
  <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>
  <script src="js/chatooly-config.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

#### Enhanced Config-Driven Approach
```javascript
window.ChatoolyConfig = {
  name: "Windy Text",
  layout: "sidebar",
  theme: "light",
  
  controls: [
    {
      type: "group",
      label: "Text Settings",
      controls: [
        { type: "text", id: "text-input", label: "Text to Animate", value: "Windy Text" },
        { type: "color", id: "text-color", label: "Text Color", value: "#ffffff" },
        { type: "range", id: "text-size", label: "Text Size", min: 20, max: 80, value: 40 }
      ]
    },
    {
      type: "group", 
      label: "Wind Effects",
      controls: [
        { type: "range", id: "wind-speed", label: "Wind Speed", min: 0, max: 10, value: 3, step: 0.1 },
        { type: "range", id: "wind-direction", label: "Wind Direction", min: 0, max: 360, value: 90 },
        { type: "checkbox", id: "turbulence-toggle", label: "Turbulence", value: false }
      ]
    }
  ],
  
  canvas: {
    width: 800,
    height: 600,
    background: "transparent"
  }
};
```

### File Structure After Revolutionary Refactor
```
chatooly-cdn/
├── css/
│   ├── template.css           # Source styles
│   ├── template.min.css       # Minified styles
│   ├── components.css         # Enhanced components
│   ├── layouts/
│   │   ├── sidebar.css        # Sidebar layout
│   │   ├── tabs.css           # Tab-based layout
│   │   ├── modal.css          # Modal-based layout
│   │   └── split.css          # Split layout
│   └── themes/
│       ├── light.css
│       ├── dark.css
│       └── minimal.css
├── js/
│   ├── core.js               # Enhanced with complete template system
│   ├── core.min.js           # Minified
│   └── modules/
│       ├── template-engine.js # HTML generation engine
│       ├── layout-manager.js  # Layout switching
│       ├── control-factory.js # Auto-generate controls
│       └── theme-manager.js   # Theme switching
├── html/
│   ├── layouts/
│   │   ├── sidebar.html       # Layout templates
│   │   ├── tabs.html
│   │   ├── modal.html
│   │   └── split.html
│   └── components/
│       ├── controls.html      # Control templates
│       └── panels.html        # Panel templates
└── versions/
    ├── v1/                   # Legacy support
    └── v2/                   # Current version

chatooly-template/
├── index.html                # Ultra-minimal (10 lines)
├── js/
│   ├── chatooly-config.js    # Enhanced with full UI definition
│   └── main.js               # Tool logic only
```

### Revolutionary Benefits

#### Template Size Reduction
- **Before**: 73 lines HTML + 141 lines CSS = 214 lines per tool
- **After**: 10 lines HTML + 0 lines CSS = 10 lines per tool  
- **Reduction**: 95% smaller template files

#### Development Speed
- **Before**: Copy entire template, customize HTML, CSS, and controls manually
- **After**: Define controls in JSON config, CDN generates complete UI
- **Time saving**: 80% faster tool creation

#### Maintenance
- **Before**: Update each tool individually for layout/style changes  
- **After**: Update CDN once, all tools get changes automatically
- **Update coverage**: 100% of tools updated instantly

#### Consistency 
- **Before**: Tools can diverge from design system over time
- **After**: All tools use identical CDN-generated layouts and components
- **Design consistency**: 100% guaranteed

#### Advanced Features
- **Layout switching**: Users can change between sidebar/tab/modal layouts
- **Theme switching**: Dark/light/minimal themes instantly  
- **Responsive design**: Mobile layouts automatically generated
- **Accessibility**: ARIA labels and keyboard navigation built-in

### Performance Impact
- **Before**: Each tool loads ~8KB CSS + ~4KB HTML structure
- **After**: 
  - First visit: ~6KB CDN assets (cached globally)
  - Return visits: 0KB (cached)  
  - Template: ~300 bytes minimal HTML
  - Config: ~1KB enhanced config
- **Total improvement**: 90% reduction in tool-specific files

### CDN Updates Flow
1. Update CDN styles
2. All tools using `"latest"` get updates immediately
3. Tools with fixed versions remain unchanged
4. Migration path available for breaking changes

## Testing Strategy

### Compatibility Testing
- Test current tools with new CDN styles
- Verify no visual regressions
- Check mobile responsiveness
- Cross-browser compatibility

### Performance Testing
- Measure load times before/after
- Test caching behavior
- Monitor CDN response times
- Validate compression ratios

### Migration Testing
- Test gradual migration path
- Verify backwards compatibility
- Check version switching
- Validate theme switching

## Rollout Plan

### Week 1: Foundation
- [ ] Create CDN stylesheet
- [ ] Update CDN core with style injection
- [ ] Test with one existing tool

### Week 2: Template Update
- [ ] Update base template
- [ ] Test new tool creation
- [ ] Update documentation

### Week 3: Migration Tools
- [ ] Create migration scripts
- [ ] Test with multiple published tools
- [ ] Performance validation

### Week 4: Full Deployment
- [ ] Update all templates
- [ ] Deploy new CDN version
- [ ] Monitor for issues

## How It All Works Together

### Example 1: Standard Tool with Sidebar Layout
```javascript
// chatooly-config.js
window.ChatoolyConfig = {
  name: "Windy Text",
  layout: "sidebar",        // Uses CDN sidebar layout
  canvas: {
    width: 1920,           // Export at 1920x1080
    height: 1080,
    display: "fit"         // Scale to fit screen
  },
  controls: [
    { type: "text", id: "text", label: "Text", value: "Hello" },
    { type: "range", id: "size", label: "Size", min: 10, max: 100 }
  ]
};

// Result:
// - CDN generates sidebar layout automatically
// - Canvas displays scaled to fit (e.g., 960x540 on smaller screen)
// - Export produces full 1920x1080 PNG
// - All controls have consistent Chatooly styling
```

### Example 2: Custom Tool with Unique Layout
```html
<!-- Custom tool HTML -->
<div class="my-crazy-layout">
  <div class="floating-controls">
    <button>My Button</button>
    <input type="range">
  </div>
  <canvas id="my-canvas"></canvas>
</div>
```
```javascript
// chatooly-config.js
window.ChatoolyConfig = {
  name: "Custom Tool",
  layout: "custom",        // No CDN layout, just styling
  canvas: {
    width: 1000,
    height: 1000
  }
};

// Result:
// - Tool keeps its custom HTML structure
// - BUT all buttons, inputs, etc. get Chatooly styling
// - Consistent fonts, colors, shadows across all elements
// - Canvas scaling still handled by CDN
```

### What Designers Get:
1. **Flexibility**: Use pre-built layouts OR create custom ones
2. **Consistency**: Everything looks like part of the same system
3. **Simplicity**: Most tools just need config, no HTML/CSS
4. **Power**: Can still build complex custom tools when needed
5. **Updates**: All tools get improvements automatically

## Success Metrics

### Developer Experience
- Reduced template complexity
- Faster tool creation
- Consistent styling across tools
- Easier maintenance

### User Experience
- Faster tool loading
- Consistent visual experience
- Better mobile experience
- Improved accessibility

### Technical Metrics
- 80% reduction in tool-specific CSS
- 50% faster initial load (cached CDN)
- 100% consistency across tools
- Zero manual updates needed

## Detailed Implementation Specifications

### 1. CSS Injection Architecture
```javascript
// chatooly-cdn/js/modules/style-loader.js
Chatooly.styles = {
  inject: function() {
    // Create link element for CDN styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://yaelren.github.io/chatooly-cdn/css/unified.min.css';
    link.id = 'chatooly-styles';
    
    // Insert before any other styles to allow overrides
    const firstStyle = document.querySelector('link[rel="stylesheet"], style');
    if (firstStyle) {
      firstStyle.parentNode.insertBefore(link, firstStyle);
    } else {
      document.head.appendChild(link);
    }
  }
};
```

### 2. Control Event Binding System
```javascript
// chatooly-cdn/js/modules/control-binder.js
Chatooly.controls = {
  bind: function(controlConfig) {
    const element = document.getElementById(controlConfig.id);
    if (!element) return;
    
    // Create getter/setter
    window.ChatoolyValues = window.ChatoolyValues || {};
    Object.defineProperty(window.ChatoolyValues, controlConfig.id, {
      get: () => element.value,
      set: (val) => { element.value = val; }
    });
    
    // Bind change event
    element.addEventListener('change', (e) => {
      // Call user's onChange if defined
      if (window.ChatoolyHandlers && window.ChatoolyHandlers[controlConfig.id]) {
        window.ChatoolyHandlers[controlConfig.id](e.target.value);
      }
    });
  }
};
```

### 3. Canvas Scaling Implementation
```javascript
// chatooly-cdn/js/modules/canvas-scaler.js
Chatooly.canvasScaler = {
  setup: function(config) {
    const container = document.getElementById('chatooly-canvas');
    const canvas = container.querySelector('canvas');
    
    if (canvas) {
      // Set internal resolution
      canvas.width = config.width * window.devicePixelRatio;
      canvas.height = config.height * window.devicePixelRatio;
      
      // Set display size
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      const scale = Math.min(
        maxWidth / config.width,
        maxHeight / config.height,
        1 // Never scale up beyond 100%
      );
      
      canvas.style.width = (config.width * scale) + 'px';
      canvas.style.height = (config.height * scale) + 'px';
      
      // Store for export
      canvas.dataset.exportWidth = config.width;
      canvas.dataset.exportHeight = config.height;
    }
  }
};
```

### 4. Build Process Configuration
```javascript
// chatooly-cdn/build-config.js
module.exports = {
  entry: {
    core: [
      './js/modules/core.js',
      './js/modules/style-loader.js',
      './js/modules/template-engine.js',
      './js/modules/canvas-scaler.js',
      './js/modules/control-factory.js',
      './js/modules/control-binder.js',
      './js/modules/export-png.js',
      './js/modules/debug-panel.js',
      './js/modules/update-checker.js'
    ]
  },
  output: {
    filename: 'core.min.js',
    path: './js/'
  },
  css: {
    entry: [
      './css/reset.css',
      './css/variables.css',
      './css/base.css',
      './css/components.css',
      './css/layouts/sidebar.css',
      './css/responsive.css'
    ],
    output: './css/unified.min.css'
  }
};
```

### 5. Control HTML Templates
```javascript
// chatooly-cdn/js/modules/control-templates.js
Chatooly.controlTemplates = {
  range: (config) => `
    <div class="chatooly-control-group" data-control-id="${config.id}">
      <label for="${config.id}">${config.label}</label>
      <div class="chatooly-range-wrapper">
        <input 
          type="range" 
          id="${config.id}" 
          min="${config.min || 0}" 
          max="${config.max || 100}" 
          value="${config.value || 50}"
          step="${config.step || 1}"
          class="chatooly-range"
          aria-label="${config.label}"
        >
        <span class="chatooly-range-value">${config.value || 50}</span>
      </div>
    </div>
  `,
  
  color: (config) => `
    <div class="chatooly-control-group" data-control-id="${config.id}">
      <label for="${config.id}">${config.label}</label>
      <input 
        type="color" 
        id="${config.id}" 
        value="${config.value || '#000000'}"
        class="chatooly-color-picker"
        aria-label="${config.label}"
      >
    </div>
  `,
  
  text: (config) => `
    <div class="chatooly-control-group" data-control-id="${config.id}">
      <label for="${config.id}">${config.label}</label>
      <input 
        type="text" 
        id="${config.id}" 
        value="${config.value || ''}"
        placeholder="${config.placeholder || ''}"
        class="chatooly-text-input"
        aria-label="${config.label}"
      >
    </div>
  `
};
```

### 6. Version Check System
```javascript
// chatooly-cdn/js/modules/update-checker.js
Chatooly.updateChecker = {
  currentVersion: '2.0.0',
  versionEndpoint: 'https://yaelren.github.io/chatooly-cdn/version.json',
  
  check: async function() {
    try {
      const response = await fetch(this.versionEndpoint + '?t=' + Date.now());
      const data = await response.json();
      
      if (this.compareVersions(data.version, this.currentVersion) > 0) {
        this.showUpdateNotification(data.version);
      }
    } catch (e) {
      console.log('Chatooly: Could not check for updates');
    }
  },
  
  compareVersions: function(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }
};
```

### 7. Error Handling Strategy
```javascript
// chatooly-cdn/js/modules/error-handler.js
Chatooly.errorHandler = {
  init: function() {
    window.addEventListener('error', this.handleError.bind(this));
  },
  
  handleError: function(event) {
    if (event.filename && event.filename.includes('chatooly-cdn')) {
      console.error('Chatooly CDN Error:', event.message);
      this.fallbackMode();
    }
  },
  
  validateConfig: function(config) {
    const errors = [];
    if (!config.name) errors.push('Tool name is required');
    if (config.canvas && !config.canvas.width) errors.push('Canvas width required');
    
    if (errors.length) {
      console.error('Chatooly Config Errors:', errors);
      return false;
    }
    return true;
  },
  
  fallbackMode: function() {
    // Provide minimal functionality if CDN fails
    console.warn('Chatooly: Running in fallback mode');
  }
};
```

## Risk Assessment

### Low Risk 🟢
- Breaking existing tools (backwards compatible)
- Performance degradation (CDN cached)

### Medium Risk 🟡
- CDN availability (GitHub Pages reliable)
- Migration complexity (gradual approach)

### High Risk 🔴
- Visual regressions (extensive testing needed)
- User adoption (opt-in migration)

## Testing Specifications

### 1. Canvas Type Testing
```javascript
// test/canvas-tests.js
const testCases = [
  {
    name: 'Regular Canvas 2D',
    setup: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      return canvas;
    }
  },
  {
    name: 'p5.js Canvas',
    setup: () => {
      // Test with p5.js instance
      new p5(sketch => {
        sketch.setup = () => {
          sketch.createCanvas(1000, 1000);
        };
      });
    }
  },
  {
    name: 'Three.js WebGL',
    setup: () => {
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(1000, 1000);
      return renderer.domElement;
    }
  },
  {
    name: 'DOM Elements',
    setup: () => {
      const div = document.createElement('div');
      div.style.width = '1000px';
      div.style.height = '1000px';
      return div;
    }
  }
];
```

### 2. Control Generation Testing
```javascript
// test/control-tests.js
const controlTests = [
  { type: 'range', id: 'test-range', min: 0, max: 100, value: 50 },
  { type: 'color', id: 'test-color', value: '#ff0000' },
  { type: 'text', id: 'test-text', value: 'Hello World' },
  { type: 'select', id: 'test-select', options: ['A', 'B', 'C'] },
  { type: 'checkbox', id: 'test-check', value: true }
];

// Test each control generates correctly
controlTests.forEach(config => {
  const html = Chatooly.controlTemplates[config.type](config);
  // Verify HTML structure
  // Test event binding
  // Check accessibility attributes
});
```

## Implementation Timeline

### Week 1: Foundation (Priority 1)
- [ ] Create CSS variable system and base styles
- [ ] Build style injection module
- [ ] Test with one existing tool
- [ ] Create unified.min.css bundle

### Week 2: Layout System (Priority 1)
- [ ] Build template engine for sidebar layout
- [ ] Create control factory for basic controls (range, color, text)
- [ ] Implement control event binding
- [ ] Test with windy-text tool

### Week 3: Canvas Scaling (Priority 1)
- [ ] Implement canvas scaling system
- [ ] Test with different canvas types
- [ ] Ensure export maintains full resolution
- [ ] Add retina display support

### Week 4: Advanced Features (Priority 2)
- [ ] Add debug panel
- [ ] Implement update checker
- [ ] Create additional control types
- [ ] Add responsive breakpoints

### Week 5: Testing & Polish (Priority 1)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance benchmarking
- [ ] Error handling improvements
- [ ] Documentation updates

### Week 6: Deployment (Priority 1)
- [ ] Deploy CDN v2.0.0
- [ ] Update template repository
- [ ] Migrate one published tool
- [ ] Monitor for issues

## Next Steps

1. **Create proof of concept**: Single tool with CDN styles
2. **Performance benchmarking**: Compare before/after
3. **Stakeholder review**: Validate approach
4. **Implementation timeline**: Detailed task breakdown
5. **Testing protocol**: Comprehensive test plan

---

*This refactoring will transform Chatooly from a template-based system to a true design system with centralized components and automatic updates.*