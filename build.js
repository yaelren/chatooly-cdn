#!/usr/bin/env node

/**
 * Unified Build Script for Chatooly CDN
 * Builds both JavaScript and CSS files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // JavaScript module order (dependencies first)
    jsModules: [
        'utils.js',           // Base utilities - no dependencies
        'style-loader.js',    // CSS injection - should load early
        'background-manager.js', // Background management - depends on utils (early load for tool initialization)
        'canvas-html5.js',    // Canvas exporters - depends on utils
        'canvas-p5.js',       // p5.js exporters - depends on utils
        'canvas-three.js',    // Three.js exporters - depends on utils
        'dom-export.js',      // DOM export - depends on utils
        'export-png.js',      // PNG orchestrator - depends on canvas exporters + dom-export
        'animation-mediarecorder.js', // MediaRecorder API client-side animation - depends on utils
        'animation-sequence-export.js', // PNG sequence export - depends on animation-mediarecorder
        'canvas-area.js',     // Canvas area container - depends on utils
        'canvas-resizer.js',  // Canvas resizing - depends on utils, canvas-area
        'canvas-resize-bar.js', // Canvas resize bar UI - depends on canvas-resizer, canvas-area
        'canvas-zoom.js',     // Canvas zoom functionality - depends on utils, canvas-area
        'publish.js',         // Publishing - depends on utils
        'ui.js',              // UI components - depends on utils, canvas-resizer, publish
        'core.js'             // Main entry point - depends on all modules
    ],
    
    // CSS files to combine
    cssFiles: [
        'variables.css',
        'base.css',
        'components.css',
        'layouts/sidebar.css',
        'responsive.css',
        'legacy-compat.css'  // Universal fallback: plain HTML elements = Chatooly styles
    ],
    
    // Build outputs
    outputs: {
        js: {
            'core.js': {
                description: 'Complete library with canvas area system',
                includes: ['all-modules']
            },
            'core.min.js': {
                description: 'Minified complete library (recommended)',
                includes: ['all-modules'],
                minify: true
            }
        },
        css: {
            'unified.css': {
                description: 'All CSS modules combined',
                includes: 'all'
            },
            'unified.min.css': {
                description: 'Minified CSS',
                includes: 'all',
                minify: true
            }
        }
    }
};

// Simple minifier for JavaScript
function minifyJS(code) {
    return code
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove single-line comments (but not URLs)
        .replace(/([^:])\/\/.*$/gm, '$1')
        // Compress multiple spaces/newlines into single space
        .replace(/\s+/g, ' ')
        // Trim
        .trim();
}

// Simple CSS minifier
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around selectors
        .replace(/\s*([{}:;,])\s*/g, '$1')
        // Remove trailing semicolons before }
        .replace(/;}/g, '}')
        // Remove quotes from url()
        .replace(/url\(['"]?([^'"]+)['"]?\)/g, 'url($1)')
        // Trim
        .trim();
}

// Build JavaScript files
function buildJavaScript() {
    console.log('\n📦 Building JavaScript files...\n');
    
    const jsDir = path.join(__dirname, 'js');
    
    // Build core.js (complete library)
    let coreContent = buildCoreJS();
    fs.writeFileSync(path.join(jsDir, 'core.js'), coreContent);
    console.log(`   ✅ js/core.js (${(coreContent.length / 1024).toFixed(1)}KB)`);
    
    // Build minified version (just copy for now - minifier has issues)
    const header = `/**
 * Chatooly CDN v2.0.0 - Complete library with canvas area system
 * Built: ${new Date().toISOString()}
 * Size: ${(coreContent.length / 1024).toFixed(1)}KB
 */
`;
    fs.writeFileSync(path.join(jsDir, 'core.min.js'), header + coreContent);
    console.log(`   ✅ js/core.min.js (${(coreContent.length / 1024).toFixed(1)}KB)`);
}

// Build core.js from modules
function buildCoreFromModules() {
    const modulesDir = path.join(__dirname, 'js', 'modules');
    
    // Read the actual core.js module to get initialization
    const corePath = path.join(modulesDir, 'core.js');
    const coreModule = fs.readFileSync(corePath, 'utf8');
    
    // Extract initialization from core module
    const coreInit = coreModule
        .replace(/^\(function\(Chatooly\)\s*{\s*['"]use strict['"];?\s*/m, '')
        .replace(/}\)\(window\.Chatooly\);?\s*$/, '');
    
    let combinedContent = `/**
 * Chatooly CDN - Core Library (Built from Modules)
 * Built: ${new Date().toISOString()}
 */

(function() {
    'use strict';
    
${coreInit}

`;

    // Add other modules (skip core.js since we already added it)
    for (const moduleFile of config.jsModules) {
        if (moduleFile === 'core.js') continue;
        
        const modulePath = path.join(modulesDir, moduleFile);
        if (!fs.existsSync(modulePath)) continue;
        
        let moduleContent = fs.readFileSync(modulePath, 'utf8');
        
        // Remove IIFE wrapper - handles both })(window.Chatooly); and })(window.Chatooly = window.Chatooly || {});
        moduleContent = moduleContent
            .replace(/^\(function\(Chatooly\)\s*{\s*['"]use strict['"];?\s*/m, '')
            .replace(/}\)\(window\.Chatooly(?:\s*=\s*window\.Chatooly\s*\|\|\s*{})?\);?\s*$/m, '');
        
        combinedContent += `
    // ===== ${moduleFile.toUpperCase().replace('.JS', '')} MODULE =====
    
${moduleContent}

`;
    }

    // Add auto-initialization
    combinedContent += `
    // Auto-initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            Chatooly.init();
        }
    });
    
    if (document.readyState !== 'loading') {
        setTimeout(() => {
            if (window.ChatoolyConfig) {
                Chatooly.init(window.ChatoolyConfig);
            } else {
                Chatooly.init();
            }
        }, 100);
    }
    
})();`;

    return combinedContent;
}

// Build core.js (simple version)
function buildCoreJS() {
    const modulesDir = path.join(__dirname, 'js', 'modules');
    
    let content = `/**
 * Chatooly CDN v2.0.0 - Complete Library
 * Built: ${new Date().toISOString()}
 * Includes all modules for canvas management, export, and UI
 */

(function() {
    'use strict';
    
    // Initialize Chatooly object
    window.Chatooly = {
        version: '2.0.0',
        config: {},
        
        init: function(userConfig) {
            this.config = Object.assign({
                name: 'Untitled Tool',
                exportFormats: ['png'],
                resolution: 2,
                buttonPosition: 'bottom-right',
                enableZoom: true,
                enableCanvasArea: true,
                canvasAreaPosition: 'full',
                // Feature opt-in/opt-out system
                features: {
                    exportButton: true,      // Export button in sidebar footer
                    exportModal: true,       // Export modal UI
                    publishButton: true,     // Publish to Hub button (dev mode only)
                    canvasResizeBar: true,   // Canvas resize bar UI
                    backgroundControls: true // Background color/gradient controls
                }
            }, userConfig);

            // Merge features separately to allow partial overrides
            if (userConfig && userConfig.features) {
                this.config.features = Object.assign({
                    exportButton: true,
                    exportModal: true,
                    publishButton: true,
                    canvasResizeBar: true,
                    backgroundControls: true
                }, userConfig.features);
            }
            
            // Inject CDN styles first
            if (this.styleLoader) {
                this.styleLoader.inject();
            }

            // Initialize canvas area if enabled
            if (this.config.enableCanvasArea && this.canvasArea) {
                this.canvasArea.init({
                    position: this.config.canvasAreaPosition
                });
            }

            // Initialize UI based on feature flags
            if (this.ui && this.ui.createExportButton) {
                this.ui.createExportButton();
            }

            this.utils.logDevelopmentMode();

            // Initialize zoom if enabled
            if (this.config.enableZoom && this.canvasZoom) {
                setTimeout(() => {
                    this.canvasZoom.init();
                }, 200);
            }

            // Initialize canvas resizer (sets default 1000x1000 size)
            if (this.canvasResizer && this.canvasResizer.init) {
                this.canvasResizer.init();
            }

            // Auto-inject background controls (respects features.backgroundControls)
            if (this.config.features.backgroundControls && this.ui && this.ui.injectBackgroundControls) {
                setTimeout(() => {
                    this.ui.injectBackgroundControls();
                }, 300);
            }

            // Initialize canvas resize bar (bottom control bar) (respects features.canvasResizeBar)
            if (this.config.features.canvasResizeBar && this.canvasResizeBar && this.canvasResizeBar.init) {
                setTimeout(() => {
                    this.canvasResizeBar.init();
                }, 400);
            }
        },
        
        export: function(format, options) {
            format = format || 'png';
            options = options || {};
            
            if (format !== 'png') {
                console.warn('Chatooly: Only PNG export supported in this version');
                return;
            }
            
            const target = this.utils.detectExportTarget();
            this.pngExport.export(target, options);
        }
    };

`;

    // Add all modules
    for (const moduleFile of config.jsModules) {
        if (moduleFile === 'core.js') continue; // Skip core.js itself
        
        const modulePath = path.join(modulesDir, moduleFile);
        if (!fs.existsSync(modulePath)) continue;
        
        let moduleContent = fs.readFileSync(modulePath, 'utf8');
        
        // Remove IIFE wrapper - handles both })(window.Chatooly); and })(window.Chatooly = window.Chatooly || {});
        moduleContent = moduleContent
            .replace(/^\(function\(Chatooly\)\s*{\s*['"]use strict['"];?\s*/m, '')
            .replace(/}\)\(window\.Chatooly(?:\s*=\s*window\.Chatooly\s*\|\|\s*{})?\);?\s*$/m, '');
        
        content += `
    // ===== ${moduleFile.toUpperCase().replace('.JS', '')} MODULE =====
    
${moduleContent}

`;
    }

    // Add auto-initialization
    content += `
    // Auto-initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            Chatooly.init();
        }
    });
    
})();`;

    return content;
}

// Build CSS files
function buildCSS() {
    console.log('\n🎨 Building CSS files...\n');
    
    const cssDir = path.join(__dirname, 'css');
    let combinedCSS = `/**
 * Chatooly CDN v2.0.0 - Unified Design System
 * Built: ${new Date().toISOString()}
 */

`;

    // Add each CSS file
    for (const cssFile of config.cssFiles) {
        const cssPath = path.join(cssDir, cssFile);
        
        if (fs.existsSync(cssPath)) {
            const content = fs.readFileSync(cssPath, 'utf8');
            combinedCSS += `
/* ===== ${cssFile.toUpperCase().replace('.CSS', '')} ===== */

${content}

`;
        }
    }

    // Write unified.css
    fs.writeFileSync(path.join(cssDir, 'unified.css'), combinedCSS);
    console.log(`   ✅ css/unified.css (${(combinedCSS.length / 1024).toFixed(1)}KB)`);
    
    // Write minified version
    const minified = minifyCSS(combinedCSS);
    const header = `/* Chatooly CDN v2.0.0 - Minified - Built: ${new Date().toISOString()} */\n`;
    fs.writeFileSync(path.join(cssDir, 'unified.min.css'), header + minified);
    console.log(`   ✅ css/unified.min.css (${(minified.length / 1024).toFixed(1)}KB)`);
}

// Main build function
function build(target = 'all') {
    console.log('🚀 Chatooly CDN Unified Build Script');
    console.log('=====================================');
    
    if (target === 'all' || target === 'js') {
        buildJavaScript();
    }
    
    if (target === 'all' || target === 'css') {
        buildCSS();
    }
    
    console.log('\n✨ Build completed successfully!\n');
    
    // Show usage
    console.log('📖 Usage in HTML:\n');
    console.log('   <!-- Recommended: Minified version -->');
    console.log('   <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>\n');
    console.log('   <!-- Or: Full version (development) -->');
    console.log('   <script src="https://yaelren.github.io/chatooly-cdn/js/core.js"></script>\n');
    console.log('   <!-- CSS is auto-injected, but you can override with: -->');
    console.log('   <link rel="stylesheet" href="https://yaelren.github.io/chatooly-cdn/css/unified.min.css">');
}

// Parse command line arguments
const args = process.argv.slice(2);
const target = args[0] || 'all';

if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node build-unified.js [target]');
    console.log('\nTargets:');
    console.log('  all  - Build both JS and CSS (default)');
    console.log('  js   - Build only JavaScript files');
    console.log('  css  - Build only CSS files');
    console.log('\nOptions:');
    console.log('  --help, -h  - Show this help message');
    process.exit(0);
}

// Run the build
build(target);