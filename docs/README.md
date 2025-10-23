# Chatooly CDN - Documentation Hub

> **Complete documentation for converting tools to Chatooly format**

JavaScript library providing export and publishing functionality for Chatooly design tools.

---

## 📚 Documentation Files

### 🚀 Start Here: [HOW-TO-USE-THIS-DOCUMENTATION.md](HOW-TO-USE-THIS-DOCUMENTATION.md)
**Complete step-by-step instructions for using these docs**
- 6 detailed use cases with examples
- Quick lookup table
- Common mistakes and solutions
- Recommended learning paths
- **Start here if you're new!**

> **📍 Location**: These docs work anywhere! Use them in the template repo, your own project, or as a standalone download.

### 📖 Main Guides

#### [CHATOOLY-CONVERSION-GUIDE.md](CHATOOLY-CONVERSION-GUIDE.md) (1,625 lines)
**Comprehensive guide for converting any tool to Chatooly**
- Complete HTML structure requirements
- Canvas integration patterns (p5.js, Three.js, Canvas API, DOM-based)
- Background Management API (colors, transparency, images)
- Canvas Resizing API (custom presets, aspect ratios)
- Complete Event System reference
- Control panel integration
- Mouse/touch event handling
- Export system integration
- Common pitfalls & solutions
- **90% documentation completeness**

#### [AI-AGENT-QUICK-REFERENCE.md](AI-AGENT-QUICK-REFERENCE.md)
**Fast reference for AI-assisted conversions**
- 5-step quick start
- Copy-paste code templates
- Critical IDs & classes reference
- Canvas patterns for all frameworks
- Complete working example (80 lines)
- Decision tree for agents
- **Perfect for AI agent conversions**

### 📊 Reference

#### [DOCUMENTATION-GAPS.md](DOCUMENTATION-GAPS.md)
**Gap analysis and future roadmap**
- What's well documented (90%)
- Remaining gaps (10%)
- Priority matrix for improvements
- Documentation completeness score
- **For maintainers/contributors**

---

## 🎯 Quick Navigation

| I Want To... | Read This |
|--------------|-----------|
| **Convert a tool with AI** | [HOW-TO-USE](HOW-TO-USE-THIS-DOCUMENTATION.md#-use-case-1-ai-agent-converting-a-tool-most-common) → [QUICK-REF](AI-AGENT-QUICK-REFERENCE.md) |
| **Convert manually** | [HOW-TO-USE](HOW-TO-USE-THIS-DOCUMENTATION.md#-use-case-2-manual-conversion-youre-coding) → [CONVERSION-GUIDE](CHATOOLY-CONVERSION-GUIDE.md) |
| **Add background controls** | [CONVERSION-GUIDE](CHATOOLY-CONVERSION-GUIDE.md#-background-management-advanced) |
| **Add size presets** | [CONVERSION-GUIDE](CHATOOLY-CONVERSION-GUIDE.md#-canvas-resizing-api-advanced) |
| **Understand events** | [CONVERSION-GUIDE](CHATOOLY-CONVERSION-GUIDE.md#-event-system-reference) |
| **See working example** | [QUICK-REF](AI-AGENT-QUICK-REFERENCE.md#-quick-convert-example-full) |
| **Debug issues** | [HOW-TO-USE](HOW-TO-USE-THIS-DOCUMENTATION.md#-use-case-4-debugging-issues) |

---

## 🏃 Quick Start

### Option 1: AI-Assisted (Recommended)
```
1. Open AI chat (Claude, ChatGPT, etc.)
2. Drop: AI-AGENT-QUICK-REFERENCE.md + your tool files
3. Say: "Convert to Chatooly following the guide"
4. Test with the checklist
```

### Option 2: Manual Coding
```
1. Read: HOW-TO-USE-THIS-DOCUMENTATION.md (10 min)
2. Open: CHATOOLY-CONVERSION-GUIDE.md
3. Copy HTML structure + canvas pattern
4. Add controls and features
5. Test with checklist
```

---

## 📦 What's Included

| File | Lines | Purpose | Completeness |
|------|-------|---------|--------------|
| [CHATOOLY-CONVERSION-GUIDE.md](CHATOOLY-CONVERSION-GUIDE.md) | 1,625 | Complete conversion reference | 90% |
| [AI-AGENT-QUICK-REFERENCE.md](AI-AGENT-QUICK-REFERENCE.md) | 485 | Fast AI-assisted conversions | 100% |
| [HOW-TO-USE-THIS-DOCUMENTATION.md](HOW-TO-USE-THIS-DOCUMENTATION.md) | 650 | How to use these docs | 100% |
| [DOCUMENTATION-GAPS.md](DOCUMENTATION-GAPS.md) | 450 | Gap analysis | N/A |

**Total Documentation**: ~3,200 lines of comprehensive guides

---

## ✅ Documentation Coverage

### Complete (90%)
- ✅ HTML structure & templates
- ✅ Canvas integration (p5.js, Three.js, Canvas, DOM)
- ✅ Background Manager API
- ✅ Canvas Resizer API
- ✅ Event System
- ✅ Control panel integration
- ✅ Export system
- ✅ Common problems & solutions
- ✅ 36+ code examples

### Future Additions (10%)
- Performance optimization guide
- Mobile/touch interaction patterns
- Advanced animation export customization
- Complete API reference document

---

---

## 📖 Template Examples & References

### Working Examples
View complete working templates on GitHub:
- **p5.js Template**: [test-p5-mediarecorder.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-p5-mediarecorder.html)
- **Three.js Template**: [test-threejs-mediarecorder-template.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-threejs-mediarecorder-template.html)
- **Canvas API Template**: [test-canvas-mediarecorder-template.html](https://github.com/yaelren/chatooly-cdn/blob/main/tests/test-canvas-mediarecorder-template.html)

### CDN Integration
```html
<!-- Production (Minified) -->
<script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>

<!-- Unified CSS -->
<link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.css">
```

---

## 📖 Core Library Features

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