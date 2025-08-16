/**
 * Chatooly CDN v2.0.0 - Complete Library
 * Built: 2025-08-16T12:03:08.103Z
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
                canvasAreaPosition: 'full'
            }, userConfig);
            
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
            
            this.ui.createExportButton();
            this.utils.logDevelopmentMode();
            
            // Initialize zoom if enabled
            if (this.config.enableZoom && this.canvasZoom) {
                setTimeout(() => {
                    this.canvasZoom.init();
                }, 200);
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


    // ===== UTILS MODULE =====
    
/**
 * Chatooly CDN - Utilities Module
 * Contains utility functions for target detection, environment checks, and helpers
 */

// Utility functions
    Chatooly.utils = {
        
        // Detect export target element with priority
        detectExportTarget: function() {
            // 1. Look for canvas#chatooly-canvas first (new direct canvas approach)
            const chatoolyCanvasElement = document.querySelector('canvas#chatooly-canvas');
            if (chatoolyCanvasElement) {
                return { type: 'canvas', element: chatoolyCanvasElement };
            }
            
            // 2. Look for div#chatooly-canvas (legacy wrapper approach)
            const chatoolyContainer = document.querySelector('div#chatooly-canvas');
            if (chatoolyContainer) {
                // Check if it contains a canvas that's managed by p5 or Three.js
                const innerCanvas = chatoolyContainer.querySelector('canvas');
                if (innerCanvas && (this._isP5Canvas(innerCanvas) || this._isThreeCanvas(innerCanvas))) {
                    // For p5/Three.js, export the canvas directly for better quality
                    return { type: 'canvas', element: innerCanvas };
                }
                // For HTML tools with regular canvas or DOM content, export the container
                return { type: 'dom', element: chatoolyContainer };
            }
            
            // 2. Look for standalone canvas elements (p5.js, Three.js, etc.)
            const canvases = document.querySelectorAll('canvas');
            if (canvases.length > 0) {
                // Use the largest canvas (likely the main one)
                let largestCanvas = canvases[0];
                for (let i = 1; i < canvases.length; i++) {
                    const canvas = canvases[i];
                    if (canvas.width * canvas.height > largestCanvas.width * largestCanvas.height) {
                        largestCanvas = canvas;
                    }
                }
                return { type: 'canvas', element: largestCanvas };
            }
            
            // 3. Look for common container IDs
            const containers = ['#app', '#canvas-container', 'main'];
            for (const selector of containers) {
                const element = document.querySelector(selector);
                if (element) {
                    return { type: 'dom', element: element };
                }
            }
            
            // 4. Fallback to body
            return { type: 'dom', element: document.body };
        },
        
        // Check if in development mode
        isDevelopment: function() {
            return location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1' || 
                   location.protocol === 'file:';
        },
        
        // Generate filename for exports
        generateFilename: function(config, format) {
            const toolName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const timestamp = new Date().toISOString().slice(0, 10);
            const extension = format || 'png';
            return `${toolName}-export-${timestamp}.${extension}`;
        },
        
        // Download helper
        downloadImage: function(dataURL, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        
        // Check if high-res re-rendering is possible
        canRerenderAtHighRes: function(canvas) {
            return window.p5 || window.THREE || canvas.id === 'defaultCanvas0';
        },
        
        // Log development mode status
        logDevelopmentMode: function() {
            if (this.isDevelopment()) {
                console.log('Chatooly: Development mode detected - publish functionality enabled');
            }
        },
        
        // Detect if canvas is from p5.js
        _isP5Canvas: function(canvas) {
            return window.p5 && (canvas.id === 'defaultCanvas0' || window.pixelDensity);
        },
        
        // Detect if canvas is from Three.js
        _isThreeCanvas: function(canvas) {
            return window.THREE && (window.renderer || window.threeRenderer);
        },
        
        // Get current canvas coordinate mapping
        getCanvasCoordinateMapping: function() {
            const target = this.detectExportTarget();
            if (!target.element || target.type !== 'canvas') {
                return null;
            }
            
            const canvas = target.element;
            const rect = canvas.getBoundingClientRect();
            
            // Canvas internal resolution
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // Display size
            const displayWidth = rect.width;
            const displayHeight = rect.height;
            
            return {
                canvas: { width: canvasWidth, height: canvasHeight },
                display: { width: displayWidth, height: displayHeight },
                scale: {
                    x: canvasWidth / displayWidth,
                    y: canvasHeight / displayHeight
                }
            };
        },
        
        // Map mouse event coordinates to canvas space
        mapMouseToCanvas: function(mouseEvent, canvas) {
            canvas = canvas || this.detectExportTarget().element;
            if (!canvas) return { x: 0, y: 0 };
            
            const rect = canvas.getBoundingClientRect();
            
            // Get display coordinates (relative to canvas element)
            const displayX = mouseEvent.clientX - rect.left;
            const displayY = mouseEvent.clientY - rect.top;
            
            // Get scale factors
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            // Map to canvas internal coordinates
            const canvasX = displayX * scaleX;
            const canvasY = displayY * scaleY;
            
            return {
                x: canvasX,
                y: canvasY,
                displayX: displayX,
                displayY: displayY,
                scaleX: scaleX,
                scaleY: scaleY
            };
        },
        
        // Map canvas coordinates back to display space
        mapCanvasToDisplay: function(canvasX, canvasY, canvas) {
            canvas = canvas || this.detectExportTarget().element;
            if (!canvas) return { x: 0, y: 0 };
            
            const rect = canvas.getBoundingClientRect();
            
            // Get scale factors
            const scaleX = rect.width / canvas.width;
            const scaleY = rect.height / canvas.height;
            
            return {
                x: canvasX * scaleX,
                y: canvasY * scaleY
            };
        }
    };
    



    // ===== STYLE-LOADER MODULE =====
    
/**
 * Chatooly CDN - Style Loader Module
 * Injects CDN styles into the page
 */

(function() {
    'use strict';
    
    // Style loader module
    window.Chatooly = window.Chatooly || {};
    
    Chatooly.styleLoader = {
        // CDN base URL
        cdnBase: 'https://yaelren.github.io/chatooly-cdn',
        
        // Development mode detection
        isDevelopment: function() {
            return location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1' || 
                   location.protocol === 'file:';
        },
        
        // Get CDN URL based on environment
        getCDNUrl: function(path) {
            // Check if we're actually developing the CDN itself (not just any localhost)
            const currentUrl = window.location.href;
            const isLocalCDNDevelopment = this.isDevelopment() && currentUrl.includes('chatooly-cdn');
            
            if (isLocalCDNDevelopment) {
                // Only use local paths when developing the CDN itself
                let cdnPath = currentUrl.substring(0, currentUrl.indexOf('chatooly-cdn') + 'chatooly-cdn'.length);
                
                // Remove any trailing slashes and add the path
                cdnPath = cdnPath.replace(/\/$/, '');
                const fullPath = cdnPath + path;
                console.log('Chatooly StyleLoader: Local CDN development mode, loading from:', fullPath);
                
                // For tests subfolder, ensure we go up one level
                if (currentUrl.includes('/tests/')) {
                    const testPath = cdnPath.replace('/tests', '') + path;
                    console.log('Chatooly StyleLoader: Test subfolder detected, using path:', testPath);
                    return testPath;
                }
                
                return fullPath;
            }
            
            // For all external tools (localhost or production), always use the CDN
            console.log('Chatooly StyleLoader: Loading from CDN:', this.cdnBase + path);
            return this.cdnBase + path;
        },
        
        // Inject styles into the page
        inject: function() {
            // Check if styles already loaded
            if (document.getElementById('chatooly-unified-styles')) {
                console.log('Chatooly: Styles already loaded');
                return;
            }
            
            // Create link element for unified CSS
            const link = document.createElement('link');
            link.id = 'chatooly-unified-styles';
            link.rel = 'stylesheet';
            link.href = this.getCDNUrl('/css/unified.min.css');
            
            // Handle load success
            link.onload = () => {
                console.log('Chatooly: Styles loaded successfully');
                this.onStylesLoaded();
            };
            
            // Handle load error
            link.onerror = () => {
                console.error('Chatooly: Failed to load styles');
                // Try fallback to individual files in development
                if (this.isDevelopment()) {
                    this.loadIndividualStyles();
                }
            };
            
            // Insert before any other styles to allow overrides
            const firstStyle = document.querySelector('link[rel="stylesheet"], style');
            if (firstStyle && firstStyle.parentNode) {
                firstStyle.parentNode.insertBefore(link, firstStyle);
            } else {
                document.head.appendChild(link);
            }
        },
        
        // Load individual CSS files (development fallback)
        loadIndividualStyles: function() {
            console.log('Chatooly: Loading individual CSS files (dev mode)');
            
            const cssFiles = [
                '/css/variables.css',
                '/css/base.css',
                '/css/components.css',
                '/css/layouts/sidebar.css',
                '/css/responsive.css'
            ];
            
            cssFiles.forEach((file, index) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.getCDNUrl(file);
                link.dataset.chatoolyStyle = 'individual';
                
                if (index === cssFiles.length - 1) {
                    link.onload = () => {
                        console.log('Chatooly: All individual styles loaded');
                        this.onStylesLoaded();
                    };
                }
                
                document.head.appendChild(link);
            });
        },
        
        // Called when styles are successfully loaded
        onStylesLoaded: function() {
            // Add loaded class to body
            document.body.classList.add('chatooly-styles-loaded');
            
            // Dispatch custom event
            const event = new CustomEvent('chatooly:styles-loaded', {
                detail: { version: Chatooly.version || '2.0.0' }
            });
            document.dispatchEvent(event);
            
            // Initialize layout if config exists
            if (window.ChatoolyConfig && window.ChatoolyConfig.layout) {
                this.applyLayout(window.ChatoolyConfig.layout);
            }
        },
        
        // Apply layout class to body
        applyLayout: function(layout) {
            const validLayouts = ['sidebar', 'tabs', 'modal', 'split', 'custom'];
            
            if (validLayouts.includes(layout)) {
                document.body.classList.add(`chatooly-layout-${layout}`);
                console.log(`Chatooly: Applied ${layout} layout`);
            }
        },
        
        // Check if styles are loaded
        isLoaded: function() {
            return document.getElementById('chatooly-unified-styles') !== null ||
                   document.querySelector('[data-chatooly-style="individual"]') !== null;
        },
        
        // Reload styles (for development)
        reload: function() {
            // Remove existing styles
            const existingStyles = document.querySelectorAll('#chatooly-unified-styles, [data-chatooly-style]');
            existingStyles.forEach(style => style.remove());
            
            // Remove loaded class
            document.body.classList.remove('chatooly-styles-loaded');
            
            // Reinject styles
            this.inject();
        },
        
        // Get computed style value using CSS variables
        getVariable: function(variableName) {
            const computed = getComputedStyle(document.documentElement);
            return computed.getPropertyValue(variableName).trim();
        },
        
        // Set CSS variable value
        setVariable: function(variableName, value) {
            document.documentElement.style.setProperty(variableName, value);
        },
        
        // Apply theme
        applyTheme: function(theme) {
            const validThemes = ['light', 'dark', 'auto'];
            
            if (validThemes.includes(theme)) {
                document.body.dataset.theme = theme;
                console.log(`Chatooly: Applied ${theme} theme`);
            }
        }
    };
    
    // Auto-inject styles when module loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Chatooly.styleLoader.inject();
        });
    } else {
        // DOM already loaded
        Chatooly.styleLoader.inject();
    }
    
})();


    // ===== CANVAS-HTML5 MODULE =====
    
/**
 * Chatooly CDN - HTML5 Canvas Export Module
 * Handles multiple export formats for standard HTML5 canvas elements
 */

// Initialize canvas exporters namespace
    if (!Chatooly.canvasExporters) {
        Chatooly.canvasExporters = {};
    }
    
    // HTML5 Canvas exporters for different formats
    Chatooly.canvasExporters.html5 = {
        
        // PNG export for HTML5 canvas
        png: {
            export: function(canvas, options) {
                const resolution = options.resolution || Chatooly.config.resolution || 2;
                const filename = options.filename || Chatooly.utils.generateFilename(Chatooly.config, 'png');
                
                try {
                    let dataURL;
                    
                    if (resolution > 1) {
                        // Check if the tool has a high-resolution render method
                        if (window.renderHighResolution && typeof window.renderHighResolution === 'function') {
                            // Use the tool's custom high-resolution render method
                            const scaledCanvas = document.createElement('canvas');
                            scaledCanvas.width = canvas.width * resolution;
                            scaledCanvas.height = canvas.height * resolution;
                            
                            // Call the custom render function with the scaled canvas
                            window.renderHighResolution(scaledCanvas, resolution);
                            dataURL = scaledCanvas.toDataURL('image/png');
                        } else if (window.Chatooly && window.Chatooly.renderHighRes && typeof window.Chatooly.renderHighRes === 'function') {
                            // Use Chatooly API for high-res rendering
                            const scaledCanvas = document.createElement('canvas');
                            scaledCanvas.width = canvas.width * resolution;
                            scaledCanvas.height = canvas.height * resolution;
                            
                            // Call the Chatooly high-res render function
                            window.Chatooly.renderHighRes(scaledCanvas, resolution);
                            dataURL = scaledCanvas.toDataURL('image/png');
                            
                            console.log('Chatooly: High-resolution export using Chatooly.renderHighRes API.');
                        } else {
                            // Fallback: Use high-quality bilinear interpolation
                            const scaledCanvas = document.createElement('canvas');
                            const scaledCtx = scaledCanvas.getContext('2d');
                            
                            scaledCanvas.width = canvas.width * resolution;
                            scaledCanvas.height = canvas.height * resolution;
                            
                            // Enable high-quality image smoothing
                            scaledCtx.imageSmoothingEnabled = true;
                            scaledCtx.imageSmoothingQuality = 'high';
                            
                            // Draw the canvas scaled up
                            scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                            
                            dataURL = scaledCanvas.toDataURL('image/png');
                            
                            console.warn('Chatooly: Using upscaling for export. For true high-resolution, implement window.renderHighResolution() or window.Chatooly.renderHighRes()');
                        }
                    } else {
                        dataURL = canvas.toDataURL('image/png');
                    }
                    
                    Chatooly.utils.downloadImage(dataURL, filename);
                    console.log('Chatooly: HTML5 Canvas PNG exported at ' + resolution + 'x resolution');
                    
                } catch (error) {
                    console.error('Chatooly: HTML5 Canvas PNG export failed:', error);
                    alert('PNG export failed. This might be due to CORS restrictions.');
                }
            }
        },
        
        // JPEG export for HTML5 canvas (future)
        jpeg: {
            export: function(canvas, options) {
                // TODO: Implement JPEG export
                console.warn('JPEG export not yet implemented for HTML5 canvas');
            }
        },
        
        // WebM video export for HTML5 canvas (future)
        webm: {
            export: function(canvas, options) {
                // TODO: Implement WebM video export using MediaRecorder API
                console.warn('WebM video export not yet implemented for HTML5 canvas');
            }
        },
        
        // GIF export for HTML5 canvas (future)
        gif: {
            export: function(canvas, options) {
                // TODO: Implement GIF export
                console.warn('GIF export not yet implemented for HTML5 canvas');
            }
        }
    };
    



    // ===== CANVAS-P5 MODULE =====
    
/**
 * Chatooly CDN - p5.js Canvas Export Module
 * Handles multiple export formats for p5.js canvas elements
 */

// Initialize canvas exporters namespace
    if (!Chatooly.canvasExporters) {
        Chatooly.canvasExporters = {};
    }
    
    // p5.js Canvas exporters for different formats
    Chatooly.canvasExporters.p5 = {
        
        // PNG export for p5.js canvas
        png: {
            export: function(canvas, options) {
                const resolution = options.resolution || Chatooly.config.resolution || 2;
                const filename = options.filename || Chatooly.utils.generateFilename(Chatooly.config, 'png');
                
                try {
                    let dataURL;
                    
                    if (resolution > 1 && window.p5 && window.pixelDensity) {
                        // Use p5.js native pixel density for true high-res
                        const originalDensity = window.pixelDensity();
                        window.pixelDensity(resolution);
                        window.redraw();
                        dataURL = canvas.toDataURL('image/png');
                        window.pixelDensity(originalDensity);
                    } else {
                        dataURL = canvas.toDataURL('image/png');
                    }
                    
                    Chatooly.utils.downloadImage(dataURL, filename);
                    console.log('Chatooly: p5.js Canvas PNG exported at ' + resolution + 'x resolution');
                    
                } catch (error) {
                    console.error('Chatooly: p5.js Canvas PNG export failed:', error);
                    alert('PNG export failed. This might be due to CORS restrictions.');
                }
            }
        },
        
        // Video export for p5.js canvas (future)
        webm: {
            export: function(canvas, options) {
                // TODO: Implement p5.js video export
                // Could use p5.js saveFrames() + MediaRecorder API
                console.warn('WebM video export not yet implemented for p5.js canvas');
            }
        },
        
        // GIF export for p5.js canvas (future)
        gif: {
            export: function(canvas, options) {
                // TODO: Implement p5.js GIF export
                // Could use p5.js saveGif() or custom frame capture
                console.warn('GIF export not yet implemented for p5.js canvas');
            }
        },
        
        // Frame sequence export for p5.js (future)
        frames: {
            export: function(canvas, options) {
                // TODO: Implement frame sequence export
                // Use p5.js saveFrames() functionality
                console.warn('Frame sequence export not yet implemented for p5.js canvas');
            }
        }
    };
    



    // ===== CANVAS-THREE MODULE =====
    
/**
 * Chatooly CDN - Three.js Canvas Export Module
 * Handles multiple export formats for Three.js canvas elements
 */

// Initialize canvas exporters namespace
    if (!Chatooly.canvasExporters) {
        Chatooly.canvasExporters = {};
    }
    
    // Three.js Canvas exporters for different formats
    Chatooly.canvasExporters.three = {
        
        // PNG export for Three.js canvas
        png: {
            export: function(canvas, options) {
                const resolution = options.resolution || Chatooly.config.resolution || 2;
                const filename = options.filename || Chatooly.utils.generateFilename(Chatooly.config, 'png');
                
                try {
                    let dataURL;
                    
                    if (resolution > 1 && window.THREE && (window.renderer || window.threeRenderer)) {
                        // Use Three.js native high-res rendering
                        dataURL = this._renderHighRes(canvas, resolution);
                    } else {
                        dataURL = canvas.toDataURL('image/png');
                    }
                    
                    Chatooly.utils.downloadImage(dataURL, filename);
                    console.log('Chatooly: Three.js Canvas PNG exported at ' + resolution + 'x resolution');
                    
                } catch (error) {
                    console.error('Chatooly: Three.js Canvas PNG export failed:', error);
                    alert('PNG export failed. This might be due to CORS restrictions.');
                }
            },
            
            // Three.js high-resolution rendering
            _renderHighRes: function(canvas, resolution) {
                const renderer = window.renderer || window.threeRenderer;
                const scene = window.scene || window.threeScene;
                const camera = window.camera || window.threeCamera;
                
                if (renderer && scene && camera) {
                    // Get the current renderer size
                    const originalSize = renderer.getSize(new THREE.Vector2());
                    const targetWidth = originalSize.x * resolution;
                    const targetHeight = originalSize.y * resolution;
                    
                    console.log(`Three.js high-res export: ${originalSize.x}x${originalSize.y} -> ${targetWidth}x${targetHeight} (${resolution}x)`);
                    
                    const tempCanvas = document.createElement('canvas');
                    const tempRenderer = new THREE.WebGLRenderer({ 
                        canvas: tempCanvas, 
                        antialias: true, 
                        preserveDrawingBuffer: true,
                        alpha: true // Support transparency
                    });
                    
                    // Set the high resolution size
                    tempRenderer.setSize(targetWidth, targetHeight, false);
                    tempRenderer.setPixelRatio(1); // Force pixel ratio to 1 for consistent output
                    tempRenderer.setClearColor(renderer.getClearColor(), renderer.getClearAlpha());
                    
                    // Copy renderer settings
                    tempRenderer.shadowMap.enabled = renderer.shadowMap.enabled;
                    tempRenderer.shadowMap.type = renderer.shadowMap.type;
                    tempRenderer.outputEncoding = renderer.outputEncoding;
                    tempRenderer.toneMapping = renderer.toneMapping;
                    tempRenderer.toneMappingExposure = renderer.toneMappingExposure;
                    
                    // Update camera aspect ratio for high-res render
                    const originalAspect = camera.aspect;
                    camera.aspect = targetWidth / targetHeight;
                    camera.updateProjectionMatrix();
                    
                    // Render at high resolution
                    tempRenderer.render(scene, camera);
                    
                    // Restore original camera aspect ratio
                    camera.aspect = originalAspect;
                    camera.updateProjectionMatrix();
                    
                    const dataURL = tempCanvas.toDataURL('image/png');
                    tempRenderer.dispose();
                    
                    console.log(`Three.js export completed: ${tempCanvas.width}x${tempCanvas.height}px`);
                    return dataURL;
                }
                
                // Fallback to canvas scaling
                console.warn('Three.js high-res export: falling back to canvas scaling');
                return this._fallbackScale(canvas, resolution);
            },
            
            // Fallback scaling method
            _fallbackScale: function(canvas, resolution) {
                const scaledCanvas = document.createElement('canvas');
                const ctx = scaledCanvas.getContext('2d');
                const targetWidth = canvas.width * resolution;
                const targetHeight = canvas.height * resolution;
                
                scaledCanvas.width = targetWidth;
                scaledCanvas.height = targetHeight;
                
                console.log(`Three.js fallback scaling: ${canvas.width}x${canvas.height} -> ${targetWidth}x${targetHeight} (${resolution}x)`);
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
                
                return scaledCanvas.toDataURL('image/png');
            }
        },
        
        // 360° panorama export for Three.js (future)
        panorama: {
            export: function(canvas, options) {
                // TODO: Implement 360° panorama export
                // Render 6 cube faces or equirectangular projection
                console.warn('360° panorama export not yet implemented for Three.js canvas');
            }
        },
        
        // WebM video export for Three.js (future)
        webm: {
            export: function(canvas, options) {
                // TODO: Implement Three.js video export
                // Use MediaRecorder API with Three.js animation loop
                console.warn('WebM video export not yet implemented for Three.js canvas');
            }
        },
        
        // GLB/GLTF 3D model export for Three.js (future)
        glb: {
            export: function(scene, options) {
                // TODO: Implement 3D model export
                // Use THREE.GLTFExporter
                console.warn('GLB model export not yet implemented for Three.js');
            }
        }
    };
    



    // ===== DOM-EXPORT MODULE =====
    
/**
 * Chatooly CDN - DOM Export Module
 * Handles multiple export formats for DOM elements using html2canvas
 */

// DOM export functionality
    Chatooly.domExport = {
        
        // Main DOM export function
        export: function(element, options) {
            const format = options.format || 'png';
            
            // Route to appropriate format handler
            if (this[format]) {
                this[format].export(element, options);
            } else {
                console.warn(`Chatooly: DOM export format '${format}' not supported`);
            }
        },
        
        // PNG export for DOM elements
        png: {
            export: function(element, options) {
                const filename = options.filename || Chatooly.utils.generateFilename(Chatooly.config, 'png');
                
                // Check if html2canvas is available, if not load it
                if (typeof html2canvas === 'undefined') {
                    Chatooly.domExport._loadHtml2Canvas().then(() => {
                        Chatooly.domExport.png._captureDOM(element, filename, options);
                    }).catch(error => {
                        console.error('Chatooly: Failed to load html2canvas:', error);
                        alert('PNG export failed: Could not load required library');
                    });
                } else {
                    this._captureDOM(element, filename, options);
                }
            },
            
            // Capture DOM element as PNG
            _captureDOM: function(element, filename, options) {
                const resolution = options.resolution || Chatooly.config.resolution || 2;
                
                html2canvas(element, {
                    scale: resolution,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: options.backgroundColor || null,
                    width: options.width,
                    height: options.height,
                    scrollX: 0,
                    scrollY: 0
                }).then(canvas => {
                    const dataURL = canvas.toDataURL('image/png');
                    Chatooly.utils.downloadImage(dataURL, filename);
                    console.log('Chatooly: DOM PNG exported successfully at ' + resolution + 'x resolution');
                }).catch(error => {
                    console.error('Chatooly: DOM PNG export failed:', error);
                    alert('PNG export failed. Try exporting a specific element.');
                });
            }
        },
        
        // JPEG export for DOM elements (future)
        jpeg: {
            export: function(element, options) {
                // TODO: Implement JPEG export with quality options
                console.warn('JPEG export not yet implemented for DOM elements');
            }
        },
        
        // PDF export for DOM elements (future)
        pdf: {
            export: function(element, options) {
                // TODO: Implement PDF export using libraries like jsPDF
                console.warn('PDF export not yet implemented for DOM elements');
            }
        },
        
        // SVG export for DOM elements (future)
        svg: {
            export: function(element, options) {
                // TODO: Implement SVG export for vector graphics
                console.warn('SVG export not yet implemented for DOM elements');
            }
        },
        
        // Load html2canvas library with multiple CDN fallbacks
        _loadHtml2Canvas: function() {
            // Check if already loading to avoid duplicate requests
            if (this._html2canvasPromise) {
                return this._html2canvasPromise;
            }
            
            this._html2canvasPromise = new Promise((resolve, reject) => {
                // Try multiple CDN sources for reliability
                const cdnSources = [
                    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
                    'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js',
                    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
                ];
                
                const tryLoad = (sourceIndex) => {
                    if (sourceIndex >= cdnSources.length) {
                        reject(new Error('All CDN sources failed'));
                        return;
                    }
                    
                    const script = document.createElement('script');
                    script.src = cdnSources[sourceIndex];
                    script.async = true;
                    script.crossOrigin = 'anonymous';
                    
                    const cleanup = () => {
                        document.head.removeChild(script);
                    };
                    
                    script.onload = () => {
                        cleanup();
                        resolve();
                    };
                    
                    script.onerror = () => {
                        cleanup();
                        console.warn(`Chatooly: Failed to load html2canvas from ${cdnSources[sourceIndex]}`);
                        tryLoad(sourceIndex + 1);
                    };
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        if (!window.html2canvas) {
                            cleanup();
                            tryLoad(sourceIndex + 1);
                        }
                    }, 10000);
                    
                    document.head.appendChild(script);
                };
                
                tryLoad(0);
            });
            
            return this._html2canvasPromise;
        }
    };
    



    // ===== EXPORT-PNG MODULE =====
    
/**
 * Chatooly CDN - PNG Export Module
 * Main PNG export orchestrator that delegates to specific export handlers
 */

// PNG export functionality
    Chatooly.pngExport = {
        
        // Main PNG export function
        export: function(target, options) {
            if (target.type === 'canvas') {
                this._exportCanvas(target.element, options);
            } else {
                this._exportDOM(target.element, options);
            }
        },
        
        // Route canvas export to appropriate handler
        _exportCanvas: function(canvas, options) {
            // Detect canvas type and route to appropriate PNG exporter
            if (this._isP5Canvas(canvas)) {
                Chatooly.canvasExporters.p5.png.export(canvas, options);
            } else if (this._isThreeCanvas(canvas)) {
                Chatooly.canvasExporters.three.png.export(canvas, options);
            } else {
                Chatooly.canvasExporters.html5.png.export(canvas, options);
            }
        },
        
        // Route DOM export
        _exportDOM: function(element, options) {
            Chatooly.domExport.export(element, options);
        },
        
        // Detect if canvas is from p5.js
        _isP5Canvas: function(canvas) {
            return window.p5 && (canvas.id === 'defaultCanvas0' || window.pixelDensity);
        },
        
        // Detect if canvas is from Three.js
        _isThreeCanvas: function(canvas) {
            return window.THREE && (window.renderer || window.threeRenderer);
        }
    };
    



    // ===== CANVAS-AREA MODULE =====
    
/**
 * Chatooly CDN - Canvas Area Module
 * Manages the dedicated canvas area container for consistent layout and scrolling
 */

Chatooly.canvasArea = {
        // Container references
        areaContainer: null,
        canvasElement: null,
        
        // Configuration
        config: {
            position: 'full', // Only 'full' is supported now
            padding: 20,
            backgroundColor: '#f5f5f5',
            borderColor: '#ddd'
        },
        
        // Drag state for canvas area scrolling
        dragState: {
            isDragging: false,
            startX: 0,
            startY: 0,
            scrollStartX: 0,
            scrollStartY: 0
        },
        
        // Initialize the canvas area
        init: function(userConfig) {
            // Merge user config
            if (userConfig) {
                Object.assign(this.config, userConfig);
            }
            
            // Create the canvas area container
            this.createContainer();
            
            // Find or wait for canvas
            this.detectCanvas();
            
            console.log('Chatooly: Canvas area initialized');
        },
        
        // Create the main canvas area container
        createContainer: function() {
            // Remove existing container if any
            const existing = document.getElementById('chatooly-canvas-area');
            if (existing) {
                existing.remove();
            }
            
            // Create new container
            this.areaContainer = document.createElement('div');
            this.areaContainer.id = 'chatooly-canvas-area';
            
            // Apply styles based on position
            this.applyContainerStyles();
            
            // Add to body
            document.body.appendChild(this.areaContainer);
            
            // Inject CSS for consistent styling
            this.injectStyles();
        },
        
        // Apply container styles based on configuration
        applyContainerStyles: function() {
            if (!this.areaContainer) return;
            
            let styles = {
                position: 'fixed',
                backgroundColor: this.config.backgroundColor,
                border: `1px solid ${this.config.borderColor}`,
                overflow: 'auto', // Enable scrolling when content exceeds bounds
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1'
            };
            
            // Check if there's a sidebar and leave space for it
            const sidebar = document.querySelector('.tools-sidebar');
            const sidebarWidth = sidebar ? sidebar.offsetWidth : 0;
            
            styles.top = '60px'; // Leave space for header/controls
            styles.left = sidebarWidth + 'px'; // Leave space for sidebar
            styles.right = '0';
            styles.bottom = '60px'; // Leave space for Chatooly button
            
            // Apply styles
            Object.assign(this.areaContainer.style, styles);
        },
        
        // Inject global styles for canvas area
        injectStyles: function() {
            if (document.getElementById('chatooly-canvas-area-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-canvas-area-styles';
            style.textContent = `
                /* Canvas area container */
                #chatooly-canvas-area {
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }
                
                /* Canvas inside the area */
                #chatooly-canvas-area canvas {
                    display: block;
                    margin: auto;
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    image-rendering: crisp-edges;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: -webkit-crisp-edges;
                    image-rendering: pixelated;
                }
                
                /* When zoomed, allow canvas to exceed container bounds */
                #chatooly-canvas-area.zoomed {
                    overflow: auto;
                    cursor: grab;
                }
                
                #chatooly-canvas-area.zoomed.dragging {
                    cursor: grabbing;
                    user-select: none;
                }
                
                /* Custom scrollbar for canvas area */
                #chatooly-canvas-area::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                
                #chatooly-canvas-area::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 6px;
                }
                
                #chatooly-canvas-area::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 6px;
                }
                
                #chatooly-canvas-area::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                
                /* Zoom indicator inside canvas area */
                #chatooly-canvas-area .zoom-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 10;
                }
                
                /* Canvas fit modes */
                #chatooly-canvas-area[data-fit="contain"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                #chatooly-canvas-area[data-fit="cover"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                #chatooly-canvas-area[data-fit="actual"] canvas {
                    width: auto;
                    height: auto;
                    max-width: none;
                    max-height: none;
                }
            `;
            
            document.head.appendChild(style);
        },
        
        // Detect canvas element inside the area
        detectCanvas: function() {
            // First check if canvas already exists in the area
            this.canvasElement = this.areaContainer.querySelector('canvas');
            
            if (this.canvasElement) {
                this.setupCanvas();
                return;
            }
            
            // Try to find existing canvas and move it
            const existingCanvas = document.querySelector('canvas#chatooly-canvas') || 
                                 document.querySelector('canvas');
            
            if (existingCanvas) {
                this.moveCanvasToArea(existingCanvas);
            } else {
                // Set up observer to wait for canvas creation
                this.observeForCanvas();
            }
        },
        
        // Move existing canvas into the canvas area
        moveCanvasToArea: function(canvas) {
            // Store canvas reference
            this.canvasElement = canvas;
            
            // Ensure canvas has ID for easy reference
            if (!canvas.id) {
                canvas.id = 'chatooly-canvas';
            }
            
            // Move canvas to area container
            this.areaContainer.appendChild(canvas);
            
            // Setup canvas properties
            this.setupCanvas();
            
            console.log('Chatooly: Canvas moved to canvas area');
        },
        
        // Setup canvas properties and events
        setupCanvas: function() {
            if (!this.canvasElement) return;
            
            // Reset any existing transforms or positioning
            this.canvasElement.style.position = 'relative';
            this.canvasElement.style.transform = '';
            this.canvasElement.style.left = '';
            this.canvasElement.style.top = '';
            
            // Store original dimensions
            this.originalWidth = this.canvasElement.width;
            this.originalHeight = this.canvasElement.height;
            
            // Fit canvas to area initially
            this.fitCanvasToArea();
            
            // Setup drag-to-scroll functionality
            this.setupDragToScroll();
            
            // Setup window resize listener to adjust for sidebar changes
            this.setupResizeListener();
            
            // Notify other modules
            if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.setCanvasArea(this.areaContainer, this.canvasElement);
            }
            
            console.log(`Chatooly: Canvas setup complete - ${this.originalWidth}x${this.originalHeight}`);
        },
        
        // Observe DOM for canvas creation
        observeForCanvas: function() {
            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (node.tagName === 'CANVAS') {
                            observer.disconnect();
                            this.moveCanvasToArea(node);
                            return;
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                observer.disconnect();
                console.warn('Chatooly: No canvas detected after 5 seconds');
            }, 5000);
        },
        
        // Fit canvas to area while maintaining aspect ratio
        fitCanvasToArea: function() {
            if (!this.canvasElement || !this.areaContainer) return;
            
            const areaRect = this.areaContainer.getBoundingClientRect();
            const padding = this.config.padding * 2;
            const availableWidth = areaRect.width - padding;
            const availableHeight = areaRect.height - padding;
            
            // Calculate scale to fit
            const scaleX = availableWidth / this.originalWidth;
            const scaleY = availableHeight / this.originalHeight;
            const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
            
            // Apply display dimensions
            const displayWidth = this.originalWidth * scale;
            const displayHeight = this.originalHeight * scale;
            
            this.canvasElement.style.width = displayWidth + 'px';
            this.canvasElement.style.height = displayHeight + 'px';
            
            // Store display dimensions
            this.displayWidth = displayWidth;
            this.displayHeight = displayHeight;
            
            console.log(`Chatooly: Canvas fitted to area - Display: ${Math.round(displayWidth)}x${Math.round(displayHeight)}`);
        },
        
        // Set canvas export resolution (different from display size)
        setExportResolution: function(width, height) {
            if (!this.canvasElement) return;
            
            // Update canvas internal resolution
            this.canvasElement.width = width;
            this.canvasElement.height = height;
            
            // Store as export dimensions
            this.exportWidth = width;
            this.exportHeight = height;
            
            // Update original dimensions for aspect ratio calculations
            this.originalWidth = width;
            this.originalHeight = height;
            
            // Refit to area with new aspect ratio
            this.fitCanvasToArea();
            
            // Trigger redraw
            this.triggerRedraw();
            
            console.log(`Chatooly: Export resolution set to ${width}x${height}`);
        },
        
        // Get current dimensions
        getDimensions: function() {
            return {
                display: {
                    width: this.displayWidth || 0,
                    height: this.displayHeight || 0
                },
                export: {
                    width: this.exportWidth || this.originalWidth || 0,
                    height: this.exportHeight || this.originalHeight || 0
                },
                canvas: {
                    width: this.canvasElement ? this.canvasElement.width : 0,
                    height: this.canvasElement ? this.canvasElement.height : 0
                }
            };
        },
        
        // Enable zoomed mode (shows scrollbars)
        enableZoomMode: function(enabled) {
            if (this.areaContainer) {
                if (enabled) {
                    this.areaContainer.classList.add('zoomed');
                } else {
                    this.areaContainer.classList.remove('zoomed');
                    // Reset scroll position
                    this.areaContainer.scrollLeft = 0;
                    this.areaContainer.scrollTop = 0;
                }
            }
        },
        
        // Center canvas in view (useful after zoom)
        centerCanvas: function() {
            if (!this.areaContainer || !this.canvasElement) return;
            
            // Get the actual dimensions
            const areaWidth = this.areaContainer.clientWidth;
            const areaHeight = this.areaContainer.clientHeight;
            const canvasWidth = this.canvasElement.offsetWidth;
            const canvasHeight = this.canvasElement.offsetHeight;
            
            // Calculate center position
            const scrollLeft = Math.max(0, (canvasWidth - areaWidth) / 2);
            const scrollTop = Math.max(0, (canvasHeight - areaHeight) / 2);
            
            // Smooth scroll to center
            this.areaContainer.scrollTo({
                left: scrollLeft,
                top: scrollTop,
                behavior: 'smooth'
            });
            
            console.log(`Chatooly: Canvas centered - scroll to ${Math.round(scrollLeft)}, ${Math.round(scrollTop)}`);
        },
        
        // Trigger redraw for various frameworks
        triggerRedraw: function() {
            // p5.js
            if (window.redraw && typeof window.redraw === 'function') {
                window.redraw();
            }
            
            // Three.js
            if (window.renderer && window.renderer.render && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            }
            
            // Custom redraw
            if (window.chatoolyRedraw && typeof window.chatoolyRedraw === 'function') {
                window.chatoolyRedraw();
            }
            
            // Dispatch event
            const event = new CustomEvent('chatooly:canvas-resized', {
                detail: this.getDimensions(),
                bubbles: true
            });
            document.dispatchEvent(event);
        },
        
        // Setup drag-to-scroll functionality for canvas area
        setupDragToScroll: function() {
            if (!this.areaContainer) return;
            
            // Mouse events for drag scrolling
            this.areaContainer.addEventListener('mousedown', (e) => {
                // Only start dragging if not clicking on canvas directly (let zoom handle that)
                if (e.target === this.areaContainer || e.target === this.canvasElement) {
                    this.startDrag(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.dragState.isDragging) {
                    this.updateDrag(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('mouseup', () => {
                this.endDrag();
            });
            
            // Touch events for mobile
            this.areaContainer.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    this.startDrag(touch.clientX, touch.clientY);
                }
            }, { passive: true });
            
            this.areaContainer.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && this.dragState.isDragging) {
                    e.preventDefault();
                    const touch = e.touches[0];
                    this.updateDrag(touch.clientX, touch.clientY);
                }
            }, { passive: false });
            
            this.areaContainer.addEventListener('touchend', () => {
                this.endDrag();
            });
        },
        
        // Start dragging
        startDrag: function(clientX, clientY) {
            this.dragState.isDragging = true;
            this.dragState.startX = clientX;
            this.dragState.startY = clientY;
            this.dragState.scrollStartX = this.areaContainer.scrollLeft;
            this.dragState.scrollStartY = this.areaContainer.scrollTop;
            
            this.areaContainer.classList.add('dragging');
        },
        
        // Update drag position
        updateDrag: function(clientX, clientY) {
            if (!this.dragState.isDragging) return;
            
            const deltaX = this.dragState.startX - clientX;
            const deltaY = this.dragState.startY - clientY;
            
            this.areaContainer.scrollLeft = this.dragState.scrollStartX + deltaX;
            this.areaContainer.scrollTop = this.dragState.scrollStartY + deltaY;
        },
        
        // End dragging
        endDrag: function() {
            if (this.dragState.isDragging) {
                this.dragState.isDragging = false;
                this.areaContainer.classList.remove('dragging');
            }
        },
        
        // Update configuration
        updateConfig: function(newConfig) {
            Object.assign(this.config, newConfig);
            this.applyContainerStyles();
        },
        
        // Setup window resize listener
        setupResizeListener: function() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                // Debounce resize events
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.applyContainerStyles(); // Recalculate sidebar space
                    this.fitCanvasToArea(); // Refit canvas to new area
                }, 250);
            });
        },
        
        // Add reset zoom and center function
        resetZoomAndCenter: function() {
            // Reset zoom first
            if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.resetZoom();
            }
            
            // Then center the canvas
            setTimeout(() => {
                this.centerCanvas();
            }, 100);
        },
        
        // Destroy and cleanup
        destroy: function() {
            if (this.areaContainer) {
                this.areaContainer.remove();
            }
            const styles = document.getElementById('chatooly-canvas-area-styles');
            if (styles) {
                styles.remove();
            }
            this.areaContainer = null;
            this.canvasElement = null;
        }
    };
    



    // ===== CANVAS-RESIZER MODULE =====
    
/**
 * Chatooly CDN - Canvas Resizer Module
 * Handles canvas and DOM element resizing for export
 */

Chatooly.canvasResizer = {
        // Export dimensions (what resolution the image exports at)
        exportWidth: 800,
        exportHeight: 600,
        
        // Set export resolution
        setExportSize: function(width, height) {
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;
            
            this.applyExportSize();
        },
        
        // Apply export size from input fields
        applyExportSize: function() {
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            
            if (!widthInput || !heightInput) {
                console.warn('Chatooly: Canvas size inputs not found');
                return;
            }
            
            const width = parseInt(widthInput.value) || 800;
            const height = parseInt(heightInput.value) || 600;
            
            // Validate dimensions
            if (width < 100 || width > 4000 || height < 100 || height > 4000) {
                alert('Export dimensions must be between 100 and 4000 pixels');
                return;
            }
            
            // Store export dimensions
            this.exportWidth = width;
            this.exportHeight = height;
            Chatooly.config.canvasWidth = width;
            Chatooly.config.canvasHeight = height;
            
            // If using canvas area, update its export resolution
            if (Chatooly.canvasArea) {
                Chatooly.canvasArea.setExportResolution(width, height);
            } else {
                // Legacy: apply to detected target
                const target = Chatooly.utils.detectExportTarget();
                if (target.element) {
                    this.applyLegacyResize(target, width, height);
                }
            }
            
            console.log(`Chatooly: Export resolution set to ${width}x${height}`);
            
            // Hide menu after applying
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && Chatooly.ui && Chatooly.ui._hideMenu) {
                Chatooly.ui._hideMenu(menu);
            }
        },
        
        // For backward compatibility - old applySize redirects to new method
        applySize: function() {
            this.applyExportSize();
        },
        
        // Legacy resize for backward compatibility
        applyLegacyResize: function(target, exportWidth, exportHeight) {
            const element = target.element;
            
            if (target.type === 'canvas') {
                this._resizeCanvasDirectly(element, exportWidth, exportHeight);
            } else {
                this._resizeDOMElement(element, exportWidth, exportHeight);
            }
        },
        
        // Resize canvas directly - new approach for canvas#chatooly-canvas
        _resizeCanvasDirectly: function(canvas, exportWidth, exportHeight) {
            // Check if canvas has a parent container for positioning
            const parent = canvas.parentElement;
            let useContainerPosition = false;
            
            // If canvas is in a container div, use that for positioning context
            if (parent && parent.tagName === 'DIV' && parent !== document.body) {
                useContainerPosition = true;
                // Make container the positioning context
                if (parent.style.position === '' || parent.style.position === 'static') {
                    parent.style.position = 'relative';
                }
            }
            
            // Calculate display dimensions based on available space
            let availableWidth, availableHeight;
            
            if (useContainerPosition && parent) {
                // Use parent container dimensions
                const parentRect = parent.getBoundingClientRect();
                availableWidth = parentRect.width || window.innerWidth - 100;
                availableHeight = parentRect.height || window.innerHeight - 200;
            } else {
                // Use viewport with UI offsets
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                const uiOffset = {
                    top: 60,
                    right: 100,
                    bottom: 60,
                    left: 60
                };
                
                availableWidth = viewportWidth - uiOffset.left - uiOffset.right;
                availableHeight = viewportHeight - uiOffset.top - uiOffset.bottom;
            }
            
            // Calculate scale to fit export dimensions within available space
            const scale = Math.min(
                availableWidth / exportWidth,
                availableHeight / exportHeight,
                1 // Don't scale up beyond 100%
            );
            
            const displayWidth = exportWidth * scale;
            const displayHeight = exportHeight * scale;
            
            // Position canvas based on context
            if (useContainerPosition) {
                // Position relative to parent container
                canvas.style.position = 'relative';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.margin = 'auto';
                canvas.style.display = 'block';
            } else {
                // Position fixed in viewport
                canvas.style.position = 'fixed';
                canvas.style.top = '50%';
                canvas.style.left = '50%';
                canvas.style.transform = 'translate(-50%, -50%)';
            }
            
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            canvas.style.zIndex = '1';
            
            // Set canvas resolution for export
            if (canvas.width !== exportWidth || canvas.height !== exportHeight) {
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                
                console.log(`Chatooly: Canvas resolution set to ${exportWidth}x${exportHeight}px (export quality)`);
                
                // Trigger redraw for frameworks
                this._triggerRedraw();
                this._dispatchResizeEvent(displayWidth, displayHeight);
                
                // Update zoom with new dimensions
                if (Chatooly.canvasZoom) {
                    Chatooly.canvasZoom.onCanvasResize(displayWidth, displayHeight);
                }
            }
            
            console.log(`Chatooly: Canvas display set to ${Math.round(displayWidth)}x${Math.round(displayHeight)}px, export at ${exportWidth}x${exportHeight}px`);
        },
        
        // Resize DOM element - legacy approach for div#chatooly-canvas
        _resizeDOMElement: function(element, exportWidth, exportHeight) {
            // Use legacy container-based approach for DOM elements
            let container = this._findContainer(element);
            
            if (!container) {
                console.log('Chatooly: No container found, using viewport for scaling');
                container = this._createOrGetViewportContainer(element);
            }
            
            this._maximizeContainer(container);
            
            requestAnimationFrame(() => {
                container.offsetHeight; // Force reflow
                
                const displayDimensions = this._calculateDisplayDimensions(
                    container, exportWidth, exportHeight
                );
                
                this._applyDomDimensions(element, displayDimensions, exportWidth, exportHeight);
                
                console.log(`Chatooly: DOM element scaled - Display: ${Math.round(displayDimensions.width)}x${Math.round(displayDimensions.height)}, Export: ${exportWidth}x${exportHeight}`);
            });
        },
        
        // Find the container element for scaling calculations
        _findContainer: function(element) {
            let container = element.parentElement;
            
            if (!container || container.id !== 'chatooly-canvas') {
                // Find the chatooly-canvas container
                while (container && container.id !== 'chatooly-canvas') {
                    container = container.parentElement;
                }
            }
            
            return container;
        },
        
        // Create or get a viewport-sized container
        _createOrGetViewportContainer: function(element) {
            // Check if we already have a fallback container
            let container = document.getElementById('chatooly-viewport-container');
            
            if (!container) {
                // Create a new viewport container
                container = document.createElement('div');
                container.id = 'chatooly-viewport-container';
                container.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                `;
                
                // If element has a parent, use it as reference
                if (element.parentElement) {
                    // Just use parent dimensions without creating new container
                    return element.parentElement;
                }
                
                // Otherwise append to body
                document.body.appendChild(container);
            }
            
            return container;
        },
        
        // Maximize container to fill available space
        _maximizeContainer: function(container) {
            // Skip if it's the viewport container or body
            if (container.id === 'chatooly-viewport-container' || container === document.body) {
                console.log('Chatooly: Skipping container maximization (viewport container or body)');
                return;
            }
            
            // If it's the chatooly-canvas container, maximize it
            if (container.id === 'chatooly-canvas') {
                // Get current dimensions before maximizing
                const beforeRect = container.getBoundingClientRect();
                
                // Account for UI elements (sidebar, menu button, etc.)
                const uiOffset = {
                    top: 20,
                    right: 100, // Account for Chatooly button
                    bottom: 100, // Account for Chatooly button
                    left: 20
                };
                
                // Check for any visible sidebars or panels
                const sidebar = document.querySelector('.chatooly-sidebar, .sidebar, aside');
                if (sidebar && sidebar.offsetWidth > 0) {
                    uiOffset.left = Math.max(sidebar.offsetWidth + 20, uiOffset.left);
                }
                
                // Apply maximized dimensions
                container.style.position = container.style.position || 'relative';
                container.style.width = `calc(100vw - ${uiOffset.left + uiOffset.right}px)`;
                container.style.height = `calc(100vh - ${uiOffset.top + uiOffset.bottom}px)`;
                container.style.maxWidth = '100%';
                container.style.maxHeight = '100%';
                container.style.margin = 'auto';
                
                console.log(`Chatooly: Container maximized from ${Math.round(beforeRect.width)}x${Math.round(beforeRect.height)} to viewport size`);
            } else {
                console.log(`Chatooly: Container maximization skipped (not chatooly-canvas): ${container.id || container.className}`);
            }
        },
        
        // Calculate display dimensions to fit as large as possible while maintaining aspect ratio
        _calculateDisplayDimensions: function(container, exportWidth, exportHeight) {
            // Get container dimensions with minimal padding
            const containerRect = container.getBoundingClientRect();
            const padding = 10; // Minimal padding
            const availableWidth = Math.max(containerRect.width - padding, 200);
            const availableHeight = Math.max(containerRect.height - padding, 200);
            
            console.log(`Chatooly: Container available space: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)} -> ${Math.round(availableWidth)}x${Math.round(availableHeight)} (after padding)`);
            
            // Calculate scale to fit as large as possible while maintaining export aspect ratio
            const scale = Math.min(
                availableWidth / exportWidth,
                availableHeight / exportHeight
            );
            
            // Canvas display size maintains aspect ratio of export dimensions
            const result = {
                width: exportWidth * scale,
                height: exportHeight * scale,
                scale: scale
            };
            
            console.log(`Chatooly: Canvas sized to maintain aspect ratio: ${Math.round(result.width)}x${Math.round(result.height)} display (${scale.toFixed(3)}x scale), ${exportWidth}x${exportHeight} export`);
            
            return result;
        },
        
        // Apply dimensions to canvas element
        _applyCanvasDimensions: function(canvas, displayDimensions, exportWidth, exportHeight) {
            // Set canvas display size to EXACTLY the calculated dimensions
            // This ensures perfect aspect ratio matching the export dimensions
            canvas.style.width = displayDimensions.width + 'px';
            canvas.style.height = displayDimensions.height + 'px';
            canvas.style.maxWidth = 'none'; // No constraints - use exact calculated size
            canvas.style.maxHeight = 'none'; // No constraints - use exact calculated size
            canvas.style.display = 'block';
            canvas.style.margin = '0'; // No margin - let container handle positioning
            canvas.style.objectFit = 'fill'; // Fill the exact dimensions we set
            
            console.log(`Chatooly: Canvas display set to EXACT size: ${displayDimensions.width}x${displayDimensions.height}px (perfect aspect ratio)`);
            
            // Set actual canvas resolution for export (different from display size)
            if (canvas.width !== exportWidth || canvas.height !== exportHeight) {
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                
                console.log(`Chatooly: Canvas resolution set to ${exportWidth}x${exportHeight}px (export quality)`);
                
                // Trigger redraw for different frameworks with DISPLAY dimensions
                // Frameworks need to know the display size, not export size
                this._triggerRedraw();
                
                // Dispatch resize event with DISPLAY dimensions for frameworks
                this._dispatchResizeEvent(displayDimensions.width, displayDimensions.height);
                
                // Initialize or update zoom for the new canvas size
                if (Chatooly.canvasZoom) {
                    Chatooly.canvasZoom.onCanvasResize(displayDimensions.width, displayDimensions.height);
                }
            }
            
            // Container centers the perfectly-sized canvas
            if (canvas.parentElement && canvas.parentElement.id === 'chatooly-canvas') {
                canvas.parentElement.style.display = 'flex';
                canvas.parentElement.style.alignItems = 'center';
                canvas.parentElement.style.justifyContent = 'center';
                canvas.parentElement.style.padding = '5px';
                canvas.parentElement.style.overflow = 'hidden';
            }
        },
        
        // Apply dimensions to DOM element
        _applyDomDimensions: function(element, displayDimensions, exportWidth, exportHeight) {
            // Set display size
            element.style.width = displayDimensions.width + 'px';
            element.style.height = displayDimensions.height + 'px';
            
            // Store dimensions for export
            element.dataset.exportWidth = exportWidth;
            element.dataset.exportHeight = exportHeight;
        },
        
        // Trigger redraw for various frameworks
        _triggerRedraw: function() {
            // p5.js
            if (window.redraw && typeof window.redraw === 'function') {
                window.redraw();
            }
            
            // Three.js
            if (window.renderer && window.renderer.render && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            }
            
            // Custom redraw function
            if (window.chatoolyRedraw && typeof window.chatoolyRedraw === 'function') {
                window.chatoolyRedraw();
            }
        },
        
        // Dispatch resize event for frameworks that need it
        _dispatchResizeEvent: function(displayWidth, displayHeight) {
            // Get the actual canvas element
            const target = Chatooly.utils.detectExportTarget();
            let canvasWidth = this.exportWidth;
            let canvasHeight = this.exportHeight;
            
            if (target.type === 'canvas' && target.element) {
                canvasWidth = target.element.width;
                canvasHeight = target.element.height;
            }
            
            const eventDetail = {
                display: {
                    width: displayWidth,
                    height: displayHeight
                },
                canvas: {
                    width: canvasWidth,
                    height: canvasHeight
                },
                scale: {
                    x: canvasWidth / displayWidth,
                    y: canvasHeight / displayHeight
                },
                // Helper function to convert mouse coordinates
                mapMouseEvent: function(mouseEvent) {
                    const rect = target.element ? target.element.getBoundingClientRect() : { left: 0, top: 0 };
                    const displayX = mouseEvent.clientX - rect.left;
                    const displayY = mouseEvent.clientY - rect.top;
                    
                    return {
                        canvasX: displayX * (canvasWidth / displayWidth),
                        canvasY: displayY * (canvasHeight / displayHeight),
                        displayX: displayX,
                        displayY: displayY
                    };
                }
            };
            
            const event = new CustomEvent('chatooly:canvas-resized', {
                detail: eventDetail,
                bubbles: true
            });
            document.dispatchEvent(event);
            console.log(`Chatooly: Canvas resized - Display: ${displayWidth}x${displayHeight}, Canvas: ${canvasWidth}x${canvasHeight}`);
        },
        
        // Get current export dimensions
        getCurrentDimensions: function() {
            // If canvas area is active, use its dimensions
            if (Chatooly.canvasArea) {
                const dims = Chatooly.canvasArea.getDimensions();
                return {
                    width: dims.export.width || this.exportWidth,
                    height: dims.export.height || this.exportHeight
                };
            }
            
            // Legacy: detect from element
            const target = Chatooly.utils.detectExportTarget();
            if (!target.element) return { width: this.exportWidth, height: this.exportHeight };
            
            if (target.type === 'canvas') {
                return {
                    width: target.element.width || this.exportWidth,
                    height: target.element.height || this.exportHeight
                };
            } else if (target.type === 'dom') {
                return {
                    width: parseInt(target.element.dataset.exportWidth) || this.exportWidth,
                    height: parseInt(target.element.dataset.exportHeight) || this.exportHeight
                };
            }
            
            return { width: this.exportWidth, height: this.exportHeight };
        },
        
        // Preset sizes for quick selection
        presets: {
            HD: { width: 1920, height: 1080 },
            Square: { width: 1200, height: 1200 },
            FourThree: { width: 800, height: 600 },
            Portrait: { width: 1080, height: 1920 },
            Instagram: { width: 1080, height: 1080 },
            TwitterCard: { width: 1200, height: 675 },
            FacebookCover: { width: 1200, height: 630 }
        },
        
        // Apply a preset size
        applyPreset: function(presetName) {
            const preset = this.presets[presetName];
            if (preset) {
                this.setExportSize(preset.width, preset.height);
            } else {
                console.warn(`Chatooly: Preset '${presetName}' not found`);
            }
        }
    };
    



    // ===== CANVAS-ZOOM MODULE =====
    
/**
 * Chatooly CDN - Canvas Zoom Module
 * Direct canvas zoom - works with <canvas id="chatooly-canvas"> without wrapper divs
 */

Chatooly.canvasZoom = {
        // Zoom state
        currentZoom: 1.0,
        minZoom: 0.1,
        maxZoom: 10.0,
        zoomStep: 0.1,
        
        // Pan state
        panX: 0,
        panY: 0,
        isPanning: false,
        lastPanPoint: null,
        
        // Canvas info
        canvasElement: null,
        canvasArea: null,
        baseWidth: 0,
        baseHeight: 0,
        centerX: 0,
        centerY: 0,
        
        // Initialize zoom functionality
        init: function() {
            console.log('Chatooly: Initializing canvas zoom');
            // Wait for canvas area to be ready
            if (Chatooly.canvasArea && Chatooly.canvasArea.canvasElement) {
                this.setCanvasArea(Chatooly.canvasArea.areaContainer, Chatooly.canvasArea.canvasElement);
            } else if (this.findCanvas()) {
                this.setupCanvasForZoom();
                this.setupZoomControls();
                console.log('Chatooly: Canvas zoom ready (legacy mode)');
            }
        },
        
        // Set canvas area and element (called by canvas-area module)
        setCanvasArea: function(areaContainer, canvasElement) {
            this.canvasArea = areaContainer;
            this.canvasElement = canvasElement;
            this.setupCanvasForZoom();
            this.setupZoomControls();
            console.log('Chatooly: Canvas zoom ready with canvas area');
        },
        
        // Find canvas - check canvas area first, then fallback
        findCanvas: function() {
            // First check if canvas area exists
            const canvasArea = document.getElementById('chatooly-canvas-area');
            if (canvasArea) {
                this.canvasArea = canvasArea;
                this.canvasElement = canvasArea.querySelector('canvas');
                if (this.canvasElement) {
                    console.log('Chatooly: Found canvas in canvas area');
                    return true;
                }
            }
            
            // Fallback: use detection system
            const target = Chatooly.utils.detectExportTarget();
            if (target && target.element && target.element.tagName === 'CANVAS') {
                this.canvasElement = target.element;
                console.log(`Chatooly: Using canvas for zoom:`, this.canvasElement.id || 'unnamed');
                return true;
            }
            
            console.warn('Chatooly: No canvas found for zoom');
            return false;
        },
        
        // Setup canvas for zoom functionality
        setupCanvasForZoom: function() {
            if (!this.canvasElement) return;
            
            // Store base dimensions
            const rect = this.canvasElement.getBoundingClientRect();
            this.baseWidth = rect.width;
            this.baseHeight = rect.height;
            this.centerX = this.baseWidth / 2;
            this.centerY = this.baseHeight / 2;
            
            // Store original position style
            this.originalPosition = this.canvasElement.style.position || 'relative';
            this.originalTransform = this.canvasElement.style.transform || '';
            
            // Set transform origin for zoom from center
            this.canvasElement.style.transformOrigin = 'center center';
            
            // Don't modify body overflow if using canvas area
            if (!this.canvasArea) {
                document.body.style.overflow = 'auto';
            }
            
            console.log(`Chatooly: Canvas zoom setup - ${this.baseWidth}x${this.baseHeight}`);
        },
        
        // Setup zoom control event listeners
        setupZoomControls: function() {
            // Global zoom controls (work anywhere on page)
            
            // Mouse wheel zoom (Ctrl + scroll)
            document.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
                    this.zoom(delta, e.clientX, e.clientY);
                }
            }, { passive: false });
            
            // Keyboard zoom
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === '=' || e.key === '+') {
                        e.preventDefault();
                        this.zoomToCenter(this.zoomStep);
                    } else if (e.key === '-') {
                        e.preventDefault();
                        this.zoomToCenter(-this.zoomStep);
                    } else if (e.key === '0') {
                        e.preventDefault();
                        this.resetZoom();
                    }
                } else if (e.key === 'r' || e.key === 'R') {
                    // R key for reset and center (without modifier)
                    e.preventDefault();
                    if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                        Chatooly.canvasArea.resetZoomAndCenter();
                    } else {
                        this.resetZoom();
                    }
                }
            });
            
            // Pan controls (drag canvas when zoomed)
            document.addEventListener('mousedown', (e) => {
                if (this.currentZoom > 1.0 && e.target === this.canvasElement) {
                    this.startPan(e.clientX, e.clientY);
                    e.preventDefault();
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.isPanning) {
                    this.updatePan(e.clientX, e.clientY);
                    e.preventDefault();
                }
            });
            
            document.addEventListener('mouseup', () => {
                this.endPan();
            });
            
            // Touch/trackpad support
            this.setupTouchControls();
            
            console.log('Chatooly: Zoom controls active');
        },
        
        // Touch and trackpad zoom
        setupTouchControls: function() {
            let initialDistance = 0;
            let initialZoom = 1;
            
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                    initialZoom = this.currentZoom;
                }
            }, { passive: false });
            
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                    const scale = currentDistance / initialDistance;
                    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialZoom * scale));
                    
                    // Get center point of pinch
                    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    
                    this.setZoom(newZoom, centerX, centerY);
                }
            }, { passive: false });
        },
        
        // Get distance between two touch points
        getTouchDistance: function(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        // Zoom toward specific point
        zoom: function(delta, clientX, clientY) {
            const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + delta));
            this.setZoom(newZoom, clientX, clientY);
        },
        
        // Zoom toward center of canvas
        zoomToCenter: function(delta) {
            const rect = this.canvasElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.zoom(delta, centerX, centerY);
        },
        
        // Set specific zoom level toward a point
        setZoom: function(zoom, clientX, clientY) {
            if (!this.canvasElement) return;
            
            const oldZoom = this.currentZoom;
            this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
            
            if (this.currentZoom === oldZoom) return;
            
            // If zoom point provided, adjust pan to zoom toward that point
            if (clientX !== undefined && clientY !== undefined) {
                const rect = this.canvasElement.getBoundingClientRect();
                const canvasX = clientX - rect.left;
                const canvasY = clientY - rect.top;
                
                // Calculate new pan to keep the point under cursor
                const zoomRatio = this.currentZoom / oldZoom;
                const deltaX = canvasX * (zoomRatio - 1);
                const deltaY = canvasY * (zoomRatio - 1);
                
                this.panX -= deltaX;
                this.panY -= deltaY;
            }
            
            this.applyTransform();
            this.updateBodySize();
            this.showZoomIndicator();
            
            console.log(`Chatooly: Zoom: ${(this.currentZoom * 100).toFixed(0)}%`);
        },
        
        // Reset zoom and pan
        resetZoom: function() {
            this.currentZoom = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.applyTransform();
            this.updateBodySize();
            this.showZoomIndicator();
            
            // Center canvas in canvas area if using canvas area
            if (this.canvasArea && Chatooly.canvasArea) {
                setTimeout(() => {
                    Chatooly.canvasArea.centerCanvas();
                }, 50);
            }
            
            console.log('Chatooly: Zoom reset to 100% and centered');
        },
        
        // Apply zoom and pan transform
        applyTransform: function() {
            if (!this.canvasElement) return;
            
            // Simple transform without preserving original (canvas area handles positioning)
            const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
            this.canvasElement.style.transform = transform;
            
            // Update cursor
            this.canvasElement.style.cursor = this.currentZoom > 1.0 ? 'grab' : 'default';
            
            // Update canvas area zoom mode
            if (this.canvasArea && Chatooly.canvasArea) {
                Chatooly.canvasArea.enableZoomMode(this.currentZoom > 1.0);
            }
        },
        
        // Update scrollable area size
        updateBodySize: function() {
            // If using canvas area, it handles scrolling
            if (this.canvasArea) {
                // Canvas area handles its own scrolling
                return;
            }
            
            // Legacy: update body size for scrolling
            const zoomedWidth = this.baseWidth * this.currentZoom;
            const zoomedHeight = this.baseHeight * this.currentZoom;
            
            const totalWidth = Math.max(window.innerWidth, zoomedWidth + Math.abs(this.panX) + 100);
            const totalHeight = Math.max(window.innerHeight, zoomedHeight + Math.abs(this.panY) + 100);
            
            document.body.style.minWidth = totalWidth + 'px';
            document.body.style.minHeight = totalHeight + 'px';
        },
        
        // Pan controls
        startPan: function(x, y) {
            this.isPanning = true;
            this.lastPanPoint = { x, y };
            this.canvasElement.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        },
        
        updatePan: function(x, y) {
            if (!this.isPanning || !this.lastPanPoint) return;
            
            const deltaX = x - this.lastPanPoint.x;
            const deltaY = y - this.lastPanPoint.y;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.applyTransform();
            this.updateBodySize();
            
            this.lastPanPoint = { x, y };
        },
        
        endPan: function() {
            if (this.isPanning) {
                this.isPanning = false;
                this.lastPanPoint = null;
                this.canvasElement.style.cursor = this.currentZoom > 1.0 ? 'grab' : 'default';
                document.body.style.userSelect = '';
            }
        },
        
        // Show zoom level indicator
        showZoomIndicator: function() {
            let indicator = document.getElementById('chatooly-zoom-indicator');
            const parent = this.canvasArea || document.body;
            
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'chatooly-zoom-indicator';
                indicator.className = 'zoom-indicator';
                
                // Different positioning based on parent
                if (this.canvasArea) {
                    indicator.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 14px;
                        pointer-events: none;
                        z-index: 10;
                        transition: opacity 0.3s ease;
                    `;
                } else {
                    indicator.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 14px;
                        pointer-events: none;
                        z-index: 1000;
                        transition: opacity 0.3s ease;
                    `;
                }
                
                parent.appendChild(indicator);
            }
            
            const zoomPercent = Math.round(this.currentZoom * 100);
            indicator.textContent = `${zoomPercent}%`;
            indicator.style.opacity = '1';
            
            // Hide at 100% after delay
            clearTimeout(this.indicatorTimeout);
            if (zoomPercent === 100) {
                this.indicatorTimeout = setTimeout(() => {
                    indicator.style.opacity = '0';
                }, 2000);
            }
        },
        
        // Update when canvas is resized by canvas-resizer
        onCanvasResize: function(width, height) {
            // Debounce rapid resize calls to prevent feedback loops
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                console.log(`Chatooly: Canvas resized to ${width}x${height} - updating zoom`);
                this.baseWidth = width;
                this.baseHeight = height;
                this.centerX = width / 2;
                this.centerY = height / 2;
                
                // Reset zoom and pan to avoid issues
                this.currentZoom = 1.0;
                this.panX = 0;
                this.panY = 0;
                this.applyTransform();
                this.updateBodySize();
            }, 150); // Debounce for 150ms
        },
        
        // Reinitialize for new canvas
        reinitialize: function() {
            console.log('Chatooly: Reinitializing zoom for new canvas');
            this.currentZoom = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.findCanvas();
            this.setupCanvasForZoom();
        }
    };
    



    // ===== PUBLISH MODULE =====
    
/**
 * Chatooly CDN - Publishing Module
 * Handles tool publishing functionality for development mode
 */

// Publishing functionality
    Chatooly.publish = {
        
        // Main publish function (development mode only)
        publish: async function(options) {
            if (!Chatooly.utils.isDevelopment()) {
                console.warn('Chatooly: Publishing only available in development mode');
                return;
            }
            
            options = options || {};
            
            // Check for config options or prompt user
            const toolName = options.name || Chatooly.config.name || prompt('Enter tool name for publishing:');
            if (!toolName) {
                console.log('Chatooly: Publishing cancelled');
                return;
            }
            
            // Read additional config from chatooly.config.js if exists
            const config = this._loadToolConfig(options);
            
            // Create tool slug (URL-safe name)
            const toolSlug = this._createToolSlug(toolName);
            
            console.log('Chatooly: Publishing tool "' + toolName + '" as "' + toolSlug + '"');
            
            // Validate tool before publishing
            const validation = this.validateTool();
            if (!validation.valid) {
                console.error('Chatooly: Tool validation failed:', validation.errors);
                alert('Publishing failed. Please fix these errors:\n' + validation.errors.join('\n'));
                return;
            }
            
            if (validation.warnings.length > 0) {
                console.warn('Chatooly: Publishing warnings:', validation.warnings);
            }
            
            // Show publishing progress early
            this._showPublishingProgress();
            
            try {
                // Gather tool files with dependency scanning
                const toolFiles = await this._gatherToolFiles();
                const metadata = {
                    name: toolName,
                    slug: toolSlug,
                    category: config.category || 'generators',
                    tags: config.tags || [],
                    description: config.description || '',
                    private: config.private || false,
                    version: config.version || '1.0.0',
                    author: config.author || 'Anonymous',
                    timestamp: new Date().toISOString()
                };
                
                // Upload to Chatooly Hub
                const result = await this._uploadToStaging(toolSlug, toolFiles, metadata);
                
                this._hidePublishingProgress();
                this._showPublishSuccess(result);
                
            } catch (error) {
                this._hidePublishingProgress();
                this._showPublishError(error);
            }
        },
        
        // Create URL-safe tool slug
        _createToolSlug: function(toolName) {
            return toolName.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-')         // Spaces to hyphens
                .replace(/-+/g, '-')          // Multiple hyphens to single
                .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
        },
        
        // Gather current tool files for publishing with full dependency scanning
        _gatherToolFiles: async function() {
            const files = {};
            const discovered = new Set();
            
            // Get current HTML (clean up for published version but keep CDN for export functionality)
            const htmlClone = document.documentElement.cloneNode(true);
            const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
            if (exportBtn) exportBtn.remove();
            
            // Remove any publishing popups that might be stuck
            const publishProgress = htmlClone.querySelector('#chatooly-publish-progress');
            if (publishProgress) publishProgress.remove();
            
            const publishSuccess = htmlClone.querySelector('div[style*="Published Successfully"]');
            if (publishSuccess) publishSuccess.remove();
            
            const publishError = htmlClone.querySelector('div[style*="Publishing Failed"]');
            if (publishError) publishError.remove();
            
            // Keep Chatooly CDN script for export functionality, but ensure it's the production version
            const chatoolyCdnScript = htmlClone.querySelector('script[src*="chatooly-cdn"]');
            if (chatoolyCdnScript) {
                // Update to production CDN URL
                chatoolyCdnScript.setAttribute('src', 'https://yaelren.github.io/chatooly-cdn/js/core.min.js');
            } else {
                // Add CDN script if not present
                const script = htmlClone.createElement('script');
                script.src = 'https://yaelren.github.io/chatooly-cdn/js/core.min.js';
                script.async = true;
                htmlClone.head.appendChild(script);
            }
            
            const htmlContent = '<!DOCTYPE html>' + htmlClone.outerHTML;
            files['index.html'] = htmlContent;
            discovered.add('index.html');
            
            // First, collect all external files referenced in HTML
            await this._collectExternalFiles(htmlContent, files, discovered);
            
            // Then scan for additional dependencies
            await this._scanFileDependencies(htmlContent, files, discovered);
            
            // Get inline styles and scripts
            const styles = Array.from(document.querySelectorAll('style:not(#chatooly-button-styles)')).map(s => s.textContent).join('\n');
            if (styles) {
                files['style.css'] = styles;
                discovered.add('style.css');
                // Scan CSS for dependencies
                await this._scanFileDependencies(styles, files, discovered, 'css');
            }
            
            // Get inline scripts (excluding CDN and system scripts)
            const scripts = Array.from(document.querySelectorAll('script:not([src]):not([id])')).map(s => s.textContent).join('\n');
            if (scripts) {
                files['tool.js'] = scripts;
                discovered.add('tool.js');
                // Scan JS for dependencies
                await this._scanFileDependencies(scripts, files, discovered, 'js');
            }
            
            console.log('Chatooly: Collected files:', Object.keys(files));
            return files;
        },
        
        // Collect external files directly referenced in HTML
        _collectExternalFiles: async function(htmlContent, files, discovered) {
            // Find all external script and stylesheet references
            const externalFiles = [
                // JavaScript files
                ...Array.from(document.querySelectorAll('script[src]:not([src*="http"]):not([src*="chatooly-cdn"])')).map(s => s.getAttribute('src')),
                // CSS files  
                ...Array.from(document.querySelectorAll('link[rel="stylesheet"][href]:not([href*="http"])')).map(l => l.getAttribute('href'))
            ];
            
            console.log('Chatooly: Found external files to collect:', externalFiles);
            
            // Download each external file
            for (const filePath of externalFiles) {
                if (filePath && !discovered.has(filePath)) {
                    discovered.add(filePath);
                    try {
                        const fileContent = await this._fetchLocalFile(filePath);
                        if (fileContent) {
                            files[filePath] = fileContent;
                            console.log(`Chatooly: Collected ${filePath} (${fileContent.length} chars)`);
                            
                            // Recursively scan collected files for more dependencies
                            const extension = filePath.split('.').pop().toLowerCase();
                            if (['html', 'css', 'js'].includes(extension)) {
                                await this._scanFileDependencies(fileContent, files, discovered, extension);
                            }
                        }
                    } catch (error) {
                        console.warn(`Chatooly: Could not collect ${filePath}:`, error);
                    }
                }
            }
        },
        
        // Scan file content for dependencies
        _scanFileDependencies: async function(content, files, discovered, fileType = 'html') {
            const dependencyPatterns = {
                html: [
                    /<script src="\.\/([^"]+)"/g,      // Local scripts
                    /<link href="\.\/([^"]+)"/g,       // Local stylesheets  
                    /<img src="\.\/([^"]+)"/g,         // Local images
                    /<source src="\.\/([^"]+)"/g,      // Audio/video
                    /<video src="\.\/([^"]+)"/g,       // Video sources
                    /<audio src="\.\/([^"]+)"/g        // Audio sources
                ],
                css: [
                    /url\(['"]?\.\/([^'")\s]+)['"]?\)/g,  // CSS assets
                    /@import ['"]\.\/([^'"]+)['"]/g        // CSS imports
                ],
                js: [
                    /fetch\(['"`]\.\/([^'"`]+)['"`]\)/g,     // Fetch calls
                    /import.*from ['"`]\.\/([^'"`]+)['"`]/g, // ES6 imports
                    /require\(['"`]\.\/([^'"`]+)['"`]\)/g,   // CommonJS requires
                    /loadJSON\(['"`]\.\/([^'"`]+)['"`]\)/g,  // p5.js loadJSON
                    /loadImage\(['"`]\.\/([^'"`]+)['"`]\)/g, // p5.js loadImage
                    /loadSound\(['"`]\.\/([^'"`]+)['"`]\)/g  // p5.js loadSound
                ]
            };
            
            const patterns = dependencyPatterns[fileType] || [];
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const filePath = match[1];
                    if (!discovered.has(filePath)) {
                        discovered.add(filePath);
                        try {
                            const fileContent = await this._fetchLocalFile(filePath);
                            if (fileContent) {
                                files[filePath] = fileContent;
                                
                                // Recursively scan discovered files
                                const extension = filePath.split('.').pop().toLowerCase();
                                if (['html', 'css', 'js'].includes(extension)) {
                                    await this._scanFileDependencies(fileContent, files, discovered, extension);
                                }
                            }
                        } catch (error) {
                            console.warn(`Chatooly: Could not load dependency: ${filePath}`, error);
                        }
                    }
                }
            }
        },
        
        // Fetch local file content
        _fetchLocalFile: async function(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                // Check if it's a binary file
                const contentType = response.headers.get('content-type') || '';
                if (contentType.startsWith('image/') || contentType.startsWith('audio/') || contentType.startsWith('video/')) {
                    // Convert binary files to base64
                    const arrayBuffer = await response.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    bytes.forEach(byte => binary += String.fromCharCode(byte));
                    return `data:${contentType};base64,${btoa(binary)}`;
                } else {
                    // Text files
                    return await response.text();
                }
            } catch (error) {
                console.warn(`Chatooly: Failed to fetch ${filePath}:`, error);
                return null;
            }
        },
        
        // Gather references to external resources
        _gatherResourceReferences: function() {
            const resources = {
                scripts: [],
                styles: [],
                images: [],
                fonts: []
            };
            
            // External scripts
            Array.from(document.querySelectorAll('script[src]')).forEach(script => {
                resources.scripts.push(script.src);
            });
            
            // External stylesheets
            Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
                resources.styles.push(link.href);
            });
            
            // Images
            Array.from(document.querySelectorAll('img[src]')).forEach(img => {
                resources.images.push(img.src);
            });
            
            return resources;
        },
        
        // Load tool configuration
        _loadToolConfig: function(options) {
            // Try to load from global ChatoolyConfig or passed options
            const config = window.ChatoolyConfig || {};
            
            // Merge with passed options
            return Object.assign({
                category: 'tools',
                tags: [],
                description: '',
                private: false,
                version: '1.0.0',
                author: 'Anonymous'
            }, config, options);
        },
        
        // Upload tool to Chatooly Hub
        _uploadToStaging: async function(toolSlug, files, metadata) {
            try {
                console.log('Chatooly: Uploading to Chatooly Hub...');
                
                // Prepare payload for Chatooly Hub API
                const payload = {
                    toolName: toolSlug,
                    metadata: metadata,
                    files: files
                };
                
                // Send to Chatooly Hub API
                const response = await fetch('https://studiovideotoolhub.vercel.app/api/publish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Chatooly-Source': 'cdn'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Publishing failed');
                }
                
                return result;
                
            } catch (error) {
                // If API fails, fall back to POC localStorage simulation
                console.warn('Chatooly: Hub API unavailable, using local simulation:', error);
                
                const result = {
                    success: true,
                    url: `https://tools.chatooly.com/${toolSlug}`,
                    actualName: toolSlug,
                    requestedName: metadata.name,
                    publishedAt: new Date().toISOString(),
                    metadata: metadata,
                    message: 'Tool published successfully! (Simulated - Hub not available)'
                };
                
                // Store in localStorage for POC
                localStorage.setItem(`chatooly-published-${toolSlug}`, JSON.stringify(result));
                
                return result;
            }
        },
        
        // Show publishing progress UI
        _showPublishingProgress: function() {
            const progressDiv = document.createElement('div');
            progressDiv.id = 'chatooly-publish-progress';
            progressDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #007bff;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        animation: chatooly-spin 1s linear infinite;
                    "></div>
                    <h3 style="margin: 0 0 10px;">Publishing to Chatooly...</h3>
                    <p style="margin: 0; color: #666;">Uploading tool files to staging server</p>
                </div>
                <style>
                    @keyframes chatooly-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(progressDiv);
        },
        
        // Hide publishing progress UI
        _hidePublishingProgress: function() {
            const progressDiv = document.getElementById('chatooly-publish-progress');
            if (progressDiv) {
                progressDiv.remove();
            }
        },
        
        // Show success message
        _showPublishSuccess: function(result) {
            const successDiv = document.createElement('div');
            const nameMessage = result.actualName !== result.requestedName 
                ? `<p style="margin: 10px 0; color: #666;">Tool published as "${result.actualName}" (name was adjusted)</p>`
                : '';
            
            successDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                    max-width: 500px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: #28a745;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 30px;
                    ">✓</div>
                    <h3 style="margin: 0 0 10px; color: #28a745;">Published Successfully!</h3>
                    <p style="margin: 10px 0; color: #666;">
                        ${result.message || 'Your tool has been published to Chatooly.'}
                    </p>
                    ${nameMessage}
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <p style="margin: 5px 0;"><strong>Live URL:</strong><br>
                            <a href="${result.url}" target="_blank" style="color: #007bff;">
                                ${result.url}
                            </a>
                        </p>
                        <p style="margin: 5px 0; font-size: 12px; color: #888;">
                            Published: ${new Date(result.publishedAt).toLocaleString()}
                        </p>
                    </div>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            document.body.appendChild(successDiv);
        },
        
        // Show error message
        _showPublishError: function(error) {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                    max-width: 500px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: #dc3545;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 30px;
                    ">✕</div>
                    <h3 style="margin: 0 0 10px; color: #dc3545;">Publishing Failed</h3>
                    <p style="margin: 10px 0; color: #666;">
                        ${error.message || 'An error occurred while publishing your tool.'}
                    </p>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        },
        
        // Validate tool before publishing
        validateTool: function() {
            const validation = {
                valid: true,
                warnings: [],
                errors: []
            };
            
            // Check for required elements
            if (!Chatooly.config.name || Chatooly.config.name === 'Untitled Tool') {
                validation.warnings.push('Tool name not set - using default');
            }
            
            // Check for export functionality
            const target = Chatooly.utils.detectExportTarget();
            if (!target.element) {
                validation.errors.push('No exportable content found');
                validation.valid = false;
            }
            
            // Check for external dependencies
            const scripts = document.querySelectorAll('script[src]');
            if (scripts.length === 0) {
                validation.warnings.push('No external libraries detected');
            }
            
            return validation;
        },
        
        // Programmatic publish method for CLI/Node.js
        publishFromCLI: function(configPath) {
            // This method is designed to be called from chatooly-cli
            // It reads the config file and publishes without prompts
            
            try {
                // In Node.js environment, this would read the config file
                // For browser environment, we simulate with a config object
                const config = window.ChatoolyPublishConfig || {
                    name: Chatooly.config.name,
                    category: 'tools',
                    tags: [],
                    description: '',
                    version: '1.0.0'
                };
                
                // Validate required fields
                if (!config.name) {
                    throw new Error('Tool name is required in config');
                }
                
                // Auto-publish without prompts
                this.publish(config);
                
            } catch (error) {
                console.error('Chatooly CLI: Publishing failed:', error);
                if (typeof process !== 'undefined' && process.exit) {
                    process.exit(1);
                }
            }
        },
        
        // Get auth token for API calls
        _getAuthToken: function() {
            // In real implementation, this would:
            // 1. Check for CHATOOLY_AUTH_TOKEN env variable
            // 2. Check for ~/.chatooly/auth.json file
            // 3. Prompt for login if needed
            
            // POC: Return placeholder token
            return 'poc-auth-token';
        }
    };
    



    // ===== UI MODULE =====
    
/**
 * Chatooly CDN - UI Module
 * Handles user interface components like export button and menus
 */

// UI functionality
    Chatooly.ui = {
        
        // Create and inject export button
        createExportButton: function() {
            // Remove existing button if any
            const existingButton = document.getElementById('chatooly-export-btn');
            if (existingButton) {
                existingButton.remove();
            }
            
            // Create export button
            const button = document.createElement('div');
            button.id = 'chatooly-export-btn';
            button.innerHTML = this._getButtonHTML();
            button.style.cssText = this._getButtonStyles();
            
            // Add CSS styles
            this._injectButtonCSS();
            
            // Add event handlers
            this._attachButtonEvents(button);
            
            document.body.appendChild(button);
        },
        
        // Generate button HTML with Chatooly branding
        _getButtonHTML: function() {
            const isDev = Chatooly.utils.isDevelopment();
            const publishButton = isDev ? '<button onclick="Chatooly.publish.publish()">📤 Publish</button>' : '';
            
            // Get current canvas size
            const dimensions = Chatooly.canvasResizer ? 
                Chatooly.canvasResizer.getCurrentDimensions() : 
                { width: 800, height: 600 };
            const currentWidth = dimensions.width;
            const currentHeight = dimensions.height;
            
            return `
                <div class="chatooly-btn-main">🎨 Chatooly</div>
                <div class="chatooly-btn-menu" style="display: none;">
                    <div class="chatooly-menu-section">
                        <h4>📥 Export</h4>
                        <button onclick="Chatooly.export('png', {resolution: 1})">1x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 2})">2x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 4})">4x PNG</button>
                    </div>
                    
                    <div class="chatooly-menu-section">
                        <h4>🎮 Canvas Controls</h4>
                        <div class="chatooly-canvas-controls">
                            <button onclick="Chatooly.ui.resetZoomAndCenter()" class="chatooly-control-btn">🎯 Reset & Center</button>
                            <button onclick="Chatooly.ui.centerCanvas()" class="chatooly-control-btn">📍 Center Canvas</button>
                        </div>
                        <div class="chatooly-canvas-help">
                            <small>💡 Drag canvas area to move around<br>
                            🎨 Press R to reset zoom & center<br>
                            🔍 Ctrl+scroll to zoom in/out</small>
                        </div>
                    </div>
                    
                    <div class="chatooly-menu-section">
                        <h4>📏 Canvas Size</h4>
                        <div class="chatooly-canvas-inputs">
                            <input type="number" id="chatooly-canvas-width" value="${currentWidth}" min="100" max="4000">
                            <span>×</span>
                            <input type="number" id="chatooly-canvas-height" value="${currentHeight}" min="100" max="4000">
                            <button onclick="Chatooly.canvasResizer.applyExportSize()" class="chatooly-apply-btn">🔄 Apply</button>
                        </div>
                        <div class="chatooly-canvas-presets">
                            <button onclick="Chatooly.canvasResizer.setExportSize(1920, 1080)">HD</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(1200, 1200)">Square</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(800, 600)">4:3</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(1080, 1920)">Portrait</button>
                        </div>
                    </div>
                    
                    ${publishButton}
                </div>
            `;
        },
        
        // Get button positioning styles
        _getButtonStyles: function() {
            const position = Chatooly.config.buttonPosition || 'bottom-right';
            
            const positions = {
                'bottom-right': 'position: fixed; bottom: 20px; right: 20px;',
                'bottom-left': 'position: fixed; bottom: 20px; left: 20px;',
                'top-right': 'position: fixed; top: 20px; right: 20px;',
                'top-left': 'position: fixed; top: 20px; left: 20px;'
            };
            
            return positions[position] + `
                z-index: 10000;
                font-family: 'Lucida Console', Monaco, monospace;
            `;
        },
        
        // Inject button CSS styles with dark theme
        _injectButtonCSS: function() {
            // Check if styles already exist
            if (document.getElementById('chatooly-button-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-button-styles';
            style.textContent = `
                #chatooly-export-btn .chatooly-btn-main {
                    min-width: 120px;
                    height: 50px;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    font-size: 14px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    font-weight: bold;
                    padding: 0 15px;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                
                #chatooly-export-btn .chatooly-btn-main:hover {
                    background: #3b3b3b;
                    border-color: #007bff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }
                
                #chatooly-export-btn .chatooly-btn-main:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                }
                
                #chatooly-export-btn .chatooly-btn-menu {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    padding: 12px;
                    min-width: 240px;
                    max-width: 280px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                }
                
                #chatooly-export-btn .chatooly-btn-menu.show {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid #ffffff;
                    background: #2b2b2b;
                    color: #ffffff;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 0px;
                    margin: 2px 0;
                    font-size: 14px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    transition: background 0.1s ease;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:hover {
                    background: #3b3b3b;
                    border-color: #007bff;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:active {
                    background: #1b1b1b;
                }
                
                /* Mobile responsive */
                @media (max-width: 768px) {
                    #chatooly-export-btn {
                        bottom: 10px !important;
                        right: 10px !important;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-main {
                        width: 45px;
                        height: 45px;
                        font-size: 18px;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu {
                        min-width: 110px;
                        padding: 6px;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu button {
                        padding: 6px 10px;
                        font-size: 13px;
                    }
                }
                
                /* Menu sections */
                #chatooly-export-btn .chatooly-menu-section {
                    border-bottom: 1px solid #ffffff;
                    padding: 8px 0;
                    margin: 8px 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section:first-child {
                    margin-top: 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section h4 {
                    font-size: 11px;
                    color: #ffffff;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                /* Canvas size inputs */
                #chatooly-export-btn .chatooly-canvas-inputs {
                    display: flex;
                    gap: 6px;
                    margin: 8px 0;
                    align-items: center;
                }
                
                #chatooly-export-btn .chatooly-canvas-inputs input[type="number"] {
                    flex: 1;
                    width: 70px;
                    padding: 6px 8px;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    background: #2b2b2b;
                    color: #ffffff;
                    font-size: 12px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    text-align: center;
                }
                
                #chatooly-export-btn .chatooly-canvas-inputs input[type="number"]:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
                
                #chatooly-export-btn .chatooly-apply-btn {
                    padding: 6px 10px !important;
                    background: #007bff !important;
                    color: white !important;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    min-width: 50px;
                }
                
                #chatooly-export-btn .chatooly-apply-btn:hover {
                    background: #0056b3 !important;
                }
                
                /* Canvas presets */
                #chatooly-export-btn .chatooly-canvas-presets {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-top: 8px;
                }
                
                #chatooly-export-btn .chatooly-canvas-presets button {
                    padding: 4px 8px !important;
                    font-size: 10px !important;
                    font-weight: 500;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    margin: 0 !important;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                #chatooly-export-btn .chatooly-canvas-presets button:hover {
                    background: #3b3b3b !important;
                    border-color: #007bff;
                }
                
                /* Canvas control buttons */
                #chatooly-export-btn .chatooly-canvas-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-bottom: 8px;
                }
                
                #chatooly-export-btn .chatooly-control-btn {
                    padding: 6px 8px !important;
                    font-size: 11px !important;
                    font-weight: 500;
                    background: #007bff !important;
                    color: white !important;
                    border: 2px solid #007bff !important;
                    border-radius: 4px;
                    margin: 0 !important;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                #chatooly-export-btn .chatooly-control-btn:hover {
                    background: #0056b3 !important;
                    border-color: #0056b3 !important;
                }
                
                #chatooly-export-btn .chatooly-canvas-help {
                    padding: 8px;
                    background: #1a1a1a;
                    border-radius: 4px;
                    border: 1px solid #333;
                }
                
                #chatooly-export-btn .chatooly-canvas-help small {
                    color: #ccc;
                    font-size: 10px;
                    line-height: 1.3;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
            `;
            document.head.appendChild(style);
        },
        
        // Attach button event handlers
        _attachButtonEvents: function(button) {
            const mainBtn = button.querySelector('.chatooly-btn-main');
            const menu = button.querySelector('.chatooly-btn-menu');
            
            // Main button click handler
            mainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = menu.classList.contains('show');
                
                if (isVisible) {
                    this._hideMenu(menu);
                } else {
                    this._showMenu(menu);
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!button.contains(e.target)) {
                    this._hideMenu(menu);
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._hideMenu(menu);
                }
            });
        },
        
        // Show menu with animation
        _showMenu: function(menu) {
            menu.style.display = 'block';
            // Force reflow for animation
            menu.offsetHeight;
            menu.classList.add('show');
        },
        
        // Hide menu with animation
        _hideMenu: function(menu) {
            menu.classList.remove('show');
            setTimeout(() => {
                if (!menu.classList.contains('show')) {
                    menu.style.display = 'none';
                }
            }, 200);
        },
        
        // Deprecated - use Chatooly.canvasResizer instead
        setCanvasSize: function(width, height) {
            console.warn('Chatooly.ui.setCanvasSize is deprecated. Use Chatooly.canvasResizer.setSize instead');
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.setSize(width, height);
            }
        },
        
        // Deprecated - use Chatooly.canvasResizer instead
        applyCanvasSize: function() {
            console.warn('Chatooly.ui.applyCanvasSize is deprecated. Use Chatooly.canvasResizer.applySize instead');
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.applySize();
            }
        },
        
        
        // Update button for different themes (future)
        setTheme: function(theme) {
            // TODO: Implement theme support (dark, light, custom colors)
            console.warn('Theme support not yet implemented');
        },
        
        // Add custom menu items
        addMenuItem: function(label, onClick, icon) {
            const menu = document.querySelector('.chatooly-btn-menu');
            if (!menu) return;
            
            const button = document.createElement('button');
            button.textContent = (icon ? icon + ' ' : '') + label;
            button.addEventListener('click', onClick);
            menu.appendChild(button);
        },
        
        // Remove button (cleanup)
        removeButton: function() {
            const button = document.getElementById('chatooly-export-btn');
            const styles = document.getElementById('chatooly-button-styles');
            
            if (button) button.remove();
            if (styles) styles.remove();
        },
        
        // Canvas control functions called from the menu
        resetZoomAndCenter: function() {
            if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                Chatooly.canvasArea.resetZoomAndCenter();
            } else if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.resetZoom();
            }
            
            // Hide menu after action
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && this._hideMenu) {
                this._hideMenu(menu);
            }
        },
        
        centerCanvas: function() {
            if (Chatooly.canvasArea && Chatooly.canvasArea.centerCanvas) {
                Chatooly.canvasArea.centerCanvas();
            }
            
            // Hide menu after action
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && this._hideMenu) {
                this._hideMenu(menu);
            }
        }
    };
    



    // Auto-initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            Chatooly.init();
        }
    });
    
})();