# Software Requirements Specification: Chatooly CDN

## 1. Introduction

### 1.1 Purpose
The Chatooly CDN provides a shared JavaScript library that delivers common functionality to all tools created on the platform. It handles exports, publishing, analytics, and UI components.

### 1.2 Repository Information
- **Repository Name**: chatooly-cdn
- **Primary File**: core.js
- **Hosting**: GitHub Pages
- **URL Pattern**: https://[username].github.io/chatooly-cdn/core.js

## 2. Functional Requirements

### 2.1 Core Initialization

#### FR-CDN-1.1: Auto-initialization
```javascript
// Tool developer adds to their HTML:
<script src="https://cdn.chatooly.com/core.js"></script>
<script>
  window.ChatoolyConfig = {
    name: "Tool Name",
    author: "Creator Name",
    version: "1.0.0"
  };
</script>
```

#### FR-CDN-1.2: Manual initialization
```javascript
// Alternative initialization
Chatooly.init({
  name: "Tool Name",
  container: "#app",
  exportFormats: ['png', 'svg']
});
```

### 2.2 Export System

#### FR-CDN-2.1: Export Button UI
- Auto-inject floating export button
- Position: bottom-right corner
- Dropdown menu with format options
- Responsive design for mobile

#### FR-CDN-2.2: PNG Export
```javascript
Chatooly.export('png', {
  element: document.querySelector('#canvas'),
  filename: 'my-design.png',
  scale: 2 // for retina
});
```

#### FR-CDN-2.3: SVG Export
- Extract SVG elements from DOM
- Clean and optimize SVG output
- Preserve animations and interactions

#### FR-CDN-2.4: CSS Export
- Extract computed styles
- Generate clean CSS output
- Copy to clipboard functionality

#### FR-CDN-2.5: GIF Export (Future)
- Record animations
- Configurable duration and FPS
- Optimization options

### 2.3 Development Features

#### FR-CDN-3.1: Environment Detection
```javascript
Chatooly.isDevelopment() // returns true if localhost/file://
```

#### FR-CDN-3.2: Publish Button
- Only visible in development mode
- Triggers publishing workflow
- Shows progress indicators

#### FR-CDN-3.3: Development Helpers
```javascript
// Console utilities
Chatooly.log('Debug message');
Chatooly.warn('Warning message');
Chatooly.error('Error message');
```

### 2.4 UI Components

#### FR-CDN-4.1: Control Helpers
```javascript
// Add slider
Chatooly.addSlider({
  container: '#controls',
  label: 'Speed',
  min: 0,
  max: 100,
  default: 50,
  onChange: (value) => updateSpeed(value)
});

// Add color picker
Chatooly.addColorPicker({
  container: '#controls',
  label: 'Background',
  default: '#ffffff',
  onChange: (color) => updateBackground(color)
});
```

#### FR-CDN-4.2: Layout Helpers
```javascript
// Create standard layout
Chatooly.createLayout({
  controls: 'left',  // left, right, top, bottom
  preview: 'center'
});
```

### 2.5 Analytics

#### FR-CDN-5.1: Automatic Tracking
- Page views
- Export usage
- Error tracking
- Performance metrics

#### FR-CDN-5.2: Custom Events
```javascript
Chatooly.track('custom_event', {
  category: 'interaction',
  action: 'click',
  label: 'reset_button'
});
```

## 3. Technical Specifications

### 3.1 File Structure
```
chatooly-cdn/
├── core.js          # Main library (minified)
├── core.dev.js      # Development version
├── core.css         # Core styles
├── utils/
│   ├── export-png.js
│   ├── export-svg.js
│   ├── export-css.js
│   └── analytics.js
├── package.json
├── README.md
└── examples/
    └── basic-integration.html
```

### 3.2 Dependencies
- html2canvas (dynamically loaded for PNG export)
- No other external dependencies
- Pure JavaScript (ES5 compatible)

### 3.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

### 3.4 Performance Requirements
- Core library: <50KB minified
- Load time: <100ms
- No render blocking
- Lazy load heavy features

## 4. API Reference

### 4.1 Global Object
```javascript
window.Chatooly = {
  version: String,
  config: Object,
  init: Function,
  export: Function,
  track: Function,
  utils: Object,
  ui: Object
}
```

### 4.2 Configuration Options
```javascript
{
  name: String,           // Tool name (required)
  author: String,         // Creator name
  version: String,        // Tool version
  container: String,      // Main container selector
  exportFormats: Array,   // Enabled export formats
  analytics: Boolean,     // Enable/disable analytics
  theme: String,         // UI theme (light/dark)
  position: Object       // UI element positions
}
```

### 4.3 Events
```javascript
// Listen to Chatooly events
window.addEventListener('chatooly:ready', (e) => {
  console.log('Chatooly initialized');
});

window.addEventListener('chatooly:export', (e) => {
  console.log('Export completed:', e.detail);
});

window.addEventListener('chatooly:error', (e) => {
  console.error('Chatooly error:', e.detail);
});
```

## 5. Security Considerations

### 5.1 XSS Prevention
- Sanitize all user inputs
- Use textContent instead of innerHTML
- Content Security Policy headers

### 5.2 CORS Configuration
- Allow cross-origin loading
- Restrict API access by origin
- Validate referrer headers

### 5.3 Data Privacy
- No personal data collection
- Anonymous analytics only
- Local storage for preferences

## 6. Deployment

### 6.1 Build Process
```bash
# Install dependencies
npm install

# Build minified version
npm run build

# Run tests
npm test

# Deploy to GitHub Pages
npm run deploy
```

### 6.2 CDN Setup
1. Enable GitHub Pages on repository
2. Configure custom domain (optional)
3. Set up CloudFlare for caching
4. Monitor uptime and performance

### 6.3 Versioning Strategy
- Semantic versioning (MAJOR.MINOR.PATCH)
- Maintain backwards compatibility
- Deprecation warnings for breaking changes
- Version-specific URLs available

## 7. Testing Requirements

### 7.1 Unit Tests
- Export functionality
- UI component creation
- Event handling
- Browser compatibility

### 7.2 Integration Tests
- Test with sample tools
- Cross-browser testing
- Performance benchmarks
- Mobile device testing

### 7.3 Manual Testing Checklist
- [ ] Export button appears correctly
- [ ] All export formats work
- [ ] Development mode detection
- [ ] Analytics tracking
- [ ] Error handling
- [ ] Mobile responsiveness

## 8. Documentation

### 8.1 Code Documentation
- JSDoc comments for all public methods
- Inline code examples
- Type definitions

### 8.2 User Documentation
- Integration guide
- API reference
- Example implementations
- Troubleshooting guide

## 9. Maintenance

### 9.1 Update Schedule
- Security patches: Immediate
- Bug fixes: Bi-weekly
- New features: Monthly
- Major versions: Quarterly

### 9.2 Support Channels
- GitHub Issues
- Documentation site
- Community Discord
- Email support

## 10. Future Enhancements

### 10.1 Version 2.0 Features
- WebGL export support
- Animation timeline
- Advanced color management
- Plugin system

### 10.2 Performance Optimizations
- Web Workers for exports
- WASM for image processing
- Progressive enhancement
- Modular loading