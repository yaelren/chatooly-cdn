# Chatooly CDN - POC Implementation Tasks

Minimal JavaScript library for PNG export and publishing functionality.

## ✅ Completed Tasks

- [x] Create basic core.js structure
  - Global `Chatooly` object
  - PNG export function using html2canvas
  - Auto-inject export button (bottom-right)
  - Development mode detection
- [x] Implement PNG export functionality
  - Detect canvas elements (p5.js, Three.js, etc.)
  - Direct canvas.toDataURL() for canvas-based tools
  - Fallback to html2canvas for DOM-based tools
  - Download with proper filename
  - Support high-resolution export (2x, 4x scaling)
- [x] Create test files for validation
  - test-p5.html - p5.js animated sketch
  - test-three.html - Three.js 3D scene
  - test-dom.html - DOM-based gradient tool
- [x] Basic styling for export button
  - Floating button design
  - Resolution options menu
  - Responsive for mobile
- [x] Comprehensive README documentation

## 🚧 In Progress

- [ ] Create basic core.js structure
  - Global `Chatooly` object
  - PNG export function using html2canvas
  - Auto-inject export button (bottom-right)
  - Development mode detection

## 📋 Planned Tasks

- [ ] Implement PNG export functionality
  - Detect canvas elements (p5.js, Three.js, etc.)
  - Direct canvas.toDataURL() for canvas-based tools
  - Fallback to html2canvas for DOM-based tools
  - Download with proper filename
  - Support high-resolution export (2x, 4x scaling)
- [ ] Add publish function (dev mode only)
  - Simple upload to staging via API call
- [ ] GitHub Pages deployment
  - Create repository
  - Enable GitHub Pages
  - Test CDN URL access
- [ ] Basic styling for export button
  - Floating button design
  - Responsive for mobile

## 📁 Implementation Details

### File Structure
```
chatooly-cdn/
├── core.js          # Main library file (~5KB target)
├── README.md        # Basic usage instructions
└── index.html       # Test page for development
```

### Key Functions
- `Chatooly.export('png', options)` - PNG export
- `Chatooly.publish(files)` - Upload to staging
- Auto-initialization on script load

### Dependencies
- html2canvas (loaded dynamically)
- No other external dependencies

## 🔴 Critical Path
1. Core.js with PNG export
2. GitHub Pages deployment
3. Template integration testing