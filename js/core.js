/**
 * Chatooly CDN v2.0.0 - Complete Library
 * Built: 2025-11-06T09:54:48.563Z
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

            // Initialize canvas resizer (sets default 1000x1000 size)
            if (this.canvasResizer && this.canvasResizer.init) {
                this.canvasResizer.init();
            }

            // Auto-inject background controls
            if (this.ui && this.ui.injectBackgroundControls) {
                setTimeout(() => {
                    this.ui.injectBackgroundControls();
                }, 300);
            }

            // Initialize canvas resize bar (bottom control bar)
            if (this.canvasResizeBar && this.canvasResizeBar.init) {
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
                // Check if it contains any canvas element
                const innerCanvas = chatoolyContainer.querySelector('canvas');
                if (innerCanvas) {
                    // Export any canvas directly for better quality (p5, Three.js, or regular HTML5)
                    return { type: 'canvas', element: innerCanvas };
                }
                // For HTML tools with DOM content only, export the container
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
                   location.hostname === '::' ||
                   location.hostname === '[::1]' ||
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
            // Check for p5.js library
            if (!window.p5) return false;
            
            // Check for default p5.js canvas ID
            if (canvas.id === 'defaultCanvas0') return true;
            
            // Check for p5.js-specific functions
            if (typeof window.pixelDensity === 'function') return true;
            
            // Check if canvas has p5.js-specific properties
            if (canvas._pInst || canvas.drawingContext?._pInst) return true;
            
            // Check for p5.js canvas class
            if (canvas.classList && canvas.classList.contains('p5Canvas')) return true;
            
            return false;
        },
        
        // Detect if canvas is from Three.js
        _isThreeCanvas: function(canvas) {
            // Check for Three.js library
            if (!window.THREE) return false;
            
            // Check for common global renderer variables
            if (window.renderer || window.threeRenderer) return true;
            
            // Check if canvas has WebGL context (typical for Three.js)
            const context = canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
            if (!context) return false;
            
            // Check for Three.js-specific properties on canvas
            if (canvas._threeRenderer || canvas.threeRenderer) return true;
            
            // Check for Three.js renderer in canvas attributes or data
            if (canvas.dataset && canvas.dataset.threeRenderer) return true;
            
            // Heuristic: if WebGL context exists with Three.js loaded, likely Three.js canvas
            // This is less reliable but covers cases where renderer isn't globally accessible
            return true;
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
        
        // Development mode detection - delegates to utils
        isDevelopment: function() {
            return Chatooly.utils ? Chatooly.utils.isDevelopment() : 
                   (location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1' || 
                    location.hostname === '::' ||
                    location.hostname === '[::1]' ||
                    location.protocol === 'file:');
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


    // ===== BACKGROUND-MANAGER MODULE =====
    
/**
 * Chatooly CDN - Background Manager Module
 * Framework-agnostic background management for canvas tools
 * Handles: color, transparency, images, and fit modes
 */

Chatooly.backgroundManager = {
        // Background state
        state: {
            bgColor: '#FFFFFF',
            bgTransparent: false,
            bgImage: null,
            bgImageURL: null,
            bgFit: 'cover' // 'cover', 'contain', 'fill'
        },

        // Canvas element reference
        canvas: null,

        /**
         * Initialize background manager with canvas element
         * @param {HTMLCanvasElement|HTMLElement} canvasElement - The canvas to manage
         */
        init: function(canvasElement) {
            this.canvas = canvasElement;
            return this;
        },

        /**
         * Set background color
         * @param {string} color - Hex color code
         */
        setBackgroundColor: function(color) {
            this.state.bgColor = color;

            // Update checkered pattern if transparent
            if (this.state.bgTransparent && this.canvas) {
                this._updateCheckeredPattern();
            }

            return this;
        },

        /**
         * Set transparent background
         * @param {boolean} transparent - Enable/disable transparency
         */
        setTransparent: function(transparent) {
            this.state.bgTransparent = transparent;

            if (this.canvas) {
                if (transparent) {
                    this.canvas.classList.add('chatooly-canvas-transparent');
                } else {
                    this.canvas.classList.remove('chatooly-canvas-transparent');
                }
            }

            return this;
        },

        /**
         * Set background image from file
         * @param {File} file - Image file
         * @returns {Promise} Resolves with loaded image
         */
        setBackgroundImage: function(file) {
            return new Promise((resolve, reject) => {
                if (!file || !file.type.startsWith('image/')) {
                    reject(new Error('Invalid image file'));
                    return;
                }

                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();

                    img.onload = () => {
                        this.state.bgImage = img;
                        this.state.bgImageURL = e.target.result;
                        console.log(`🎨 Background image loaded: ${img.width}x${img.height}`);
                        resolve(img);
                    };

                    img.onerror = () => {
                        reject(new Error('Failed to load image'));
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read file'));
                };

                reader.readAsDataURL(file);
            });
        },

        /**
         * Clear background image
         */
        clearBackgroundImage: function() {
            this.state.bgImage = null;
            this.state.bgImageURL = null;
            console.log('🎨 Background image cleared');
            return this;
        },

        /**
         * Set background fit mode
         * @param {string} mode - 'cover', 'contain', or 'fill'
         */
        setFit: function(mode) {
            if (!['cover', 'contain', 'fill'].includes(mode)) {
                console.warn(`Invalid fit mode: ${mode}. Using 'cover'.`);
                mode = 'cover';
            }

            this.state.bgFit = mode;
            console.log(`🎨 Background fit mode: ${mode}`);
            return this;
        },

        /**
         * Get current background state
         * @returns {Object} Current background state
         */
        getBackgroundState: function() {
            return {
                bgColor: this.state.bgColor,
                bgTransparent: this.state.bgTransparent,
                bgImage: this.state.bgImage,
                bgImageURL: this.state.bgImageURL,
                bgFit: this.state.bgFit
            };
        },

        /**
         * Calculate background image dimensions for canvas
         * @param {number} canvasWidth - Canvas width
         * @param {number} canvasHeight - Canvas height
         * @returns {Object} { drawWidth, drawHeight, offsetX, offsetY }
         */
        calculateImageDimensions: function(canvasWidth, canvasHeight) {
            if (!this.state.bgImage) {
                return null;
            }

            const img = this.state.bgImage;
            const imgAspect = img.width / img.height;
            const canvasAspect = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            switch (this.state.bgFit) {
                case 'cover':
                    // Fill entire canvas, may crop image
                    if (imgAspect > canvasAspect) {
                        drawHeight = canvasHeight;
                        drawWidth = drawHeight * imgAspect;
                        offsetX = -(drawWidth - canvasWidth) / 2;
                        offsetY = 0;
                    } else {
                        drawWidth = canvasWidth;
                        drawHeight = drawWidth / imgAspect;
                        offsetX = 0;
                        offsetY = -(drawHeight - canvasHeight) / 2;
                    }
                    break;

                case 'contain':
                    // Fit entire image within canvas
                    if (imgAspect > canvasAspect) {
                        drawWidth = canvasWidth;
                        drawHeight = drawWidth / imgAspect;
                        offsetX = 0;
                        offsetY = (canvasHeight - drawHeight) / 2;
                    } else {
                        drawHeight = canvasHeight;
                        drawWidth = drawHeight * imgAspect;
                        offsetX = (canvasWidth - drawWidth) / 2;
                        offsetY = 0;
                    }
                    break;

                case 'fill':
                    // Stretch to fill canvas
                    drawWidth = canvasWidth;
                    drawHeight = canvasHeight;
                    offsetX = 0;
                    offsetY = 0;
                    break;

                default:
                    drawWidth = canvasWidth;
                    drawHeight = canvasHeight;
                    offsetX = 0;
                    offsetY = 0;
            }

            return {
                drawWidth,
                drawHeight,
                offsetX,
                offsetY
            };
        },

        /**
         * Draw background to canvas context (for Canvas API tools)
         * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
         * @param {number} canvasWidth - Canvas width
         * @param {number} canvasHeight - Canvas height
         */
        drawToCanvas: function(ctx, canvasWidth, canvasHeight) {
            if (this.state.bgTransparent) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                return;
            }

            // Draw image if present
            if (this.state.bgImage) {
                const dims = this.calculateImageDimensions(canvasWidth, canvasHeight);

                // Fill with color first if using 'contain' mode
                if (this.state.bgFit === 'contain') {
                    ctx.fillStyle = this.state.bgColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                }

                ctx.drawImage(
                    this.state.bgImage,
                    dims.offsetX,
                    dims.offsetY,
                    dims.drawWidth,
                    dims.drawHeight
                );
            } else {
                // Draw solid color
                ctx.fillStyle = this.state.bgColor;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
        },

        /**
         * Update checkered pattern (internal)
         */
        _updateCheckeredPattern: function() {
            if (!this.canvas) return;

            // Pattern is handled by CSS class, but we could add custom logic here
            // if needed for specific canvas types
        },

        /**
         * Generate background CSS for DOM-based tools
         * @returns {string} CSS background property value
         */
        getBackgroundCSS: function() {
            if (this.state.bgTransparent) {
                return 'transparent';
            }

            if (this.state.bgImage && this.state.bgImageURL) {
                let size;
                switch (this.state.bgFit) {
                    case 'cover': size = 'cover'; break;
                    case 'contain': size = 'contain'; break;
                    case 'fill': size = '100% 100%'; break;
                    default: size = 'cover';
                }

                return `${this.state.bgColor} url("${this.state.bgImageURL}") center/${size} no-repeat`;
            }

            return this.state.bgColor;
        },

        /**
         * Reset to default background
         */
        reset: function() {
            this.state.bgColor = '#FFFFFF';
            this.state.bgTransparent = false;
            this.state.bgImage = null;
            this.state.bgImageURL = null;
            this.state.bgFit = 'cover';

            if (this.canvas) {
                this.canvas.classList.remove('chatooly-canvas-transparent');
            }

            console.log('🎨 Background reset to defaults');
            return this;
        }
    };




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
                const scale = options.scale || options.resolution || Chatooly.config.resolution || 2;
                const filename = options.filename || Chatooly.utils.generateFilename(Chatooly.config, 'png');

                try {
                    let dataURL;

                    if (scale > 1) {
                        // Create high-res canvas by scaling current canvas content
                        const scaledCanvas = document.createElement('canvas');
                        const ctx = scaledCanvas.getContext('2d');

                        // Set scaled dimensions
                        scaledCanvas.width = canvas.width * scale;
                        scaledCanvas.height = canvas.height * scale;

                        // Disable image smoothing for crisp scaling
                        ctx.imageSmoothingEnabled = false;

                        // Scale and draw current canvas content (preserves current visual state)
                        ctx.scale(scale, scale);
                        ctx.drawImage(canvas, 0, 0);

                        dataURL = scaledCanvas.toDataURL('image/png');
                    } else {
                        // Direct export at 1x scale
                        dataURL = canvas.toDataURL('image/png');
                    }

                    Chatooly.utils.downloadImage(dataURL, filename);
                    console.log('Chatooly: p5.js Canvas PNG exported at ' + scale + 'x scale');

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
                // Check if running locally and show helpful warning
                const isLocalDev = Chatooly.utils ? Chatooly.utils.isDevelopment() :
                                 (window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' ||
                                  window.location.hostname === '::' ||
                                  window.location.hostname === '[::1]' ||
                                  window.location.protocol === 'file:');
                
                if (isLocalDev) {
                    console.warn('Chatooly: Running locally - html2canvas CDN may cause mixed content warnings. Consider serving over HTTPS.');
                }
                
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
            if (Chatooly.utils._isP5Canvas(canvas)) {
                Chatooly.canvasExporters.p5.png.export(canvas, options);
            } else if (Chatooly.utils._isThreeCanvas(canvas)) {
                Chatooly.canvasExporters.three.png.export(canvas, options);
            } else {
                Chatooly.canvasExporters.html5.png.export(canvas, options);
            }
        },
        
        // Route DOM export
        _exportDOM: function(element, options) {
            Chatooly.domExport.export(element, options);
        }
    };
    



    // ===== ANIMATION-MEDIARECORDER MODULE =====
    

/**
     * Chatooly CDN - MediaRecorder Animation Module
     * Client-side animation recording using MediaRecorder API
     * Replaces CCAPTURE functionality with native browser APIs
     * 
     */

    Chatooly.animationMediaRecorder = {
        // Animation state management
        mediaRecorder: null,
        recordedChunks: [],
        isRecording: false,
        recordingState: 'idle', // idle, starting, recording, stopping
        toolInfo: null,
        recordingCanvas: null,
        recordingCtx: null,
        drawingInterval: null,
        currentFileExtension: 'mp4',
        
        // Initialize animation detection and export capabilities
        init: function() {
            this.toolInfo = this.detectToolType();
            console.log('🎬 MediaRecorder Animation module initialized:', this.toolInfo);
        },
        
        // Smart tool type detection (same as CCAPTURE module)
        detectToolType: function() {
            const canvas = document.getElementById('chatooly-canvas');
            if (!canvas) {
                return { type: 'static', framework: 'none', reason: 'No chatooly-canvas found' };
            }
            
            // p5.js detection
            if (window.p5 && typeof window.setup === 'function' && typeof window.draw === 'function') {
                return { 
                    type: 'animated', 
                    framework: 'p5js',
                    canvas: canvas,
                    reason: 'p5.js globals and draw() function detected'
                };
            }
            
            // Three.js detection
            if (window.THREE) {
                return { 
                    type: 'animated', 
                    framework: 'threejs',
                    canvas: canvas,
                    reason: 'THREE.js library detected'
                };
            }
            
            // Canvas API animation detection
            if (canvas && canvas.getContext) {
                // Look for common animation patterns
                const hasRequestAnimationFrame = window.requestAnimationFrame && 
                    document.body.innerHTML.includes('requestAnimationFrame');
                
                if (hasRequestAnimationFrame) {
                    return { 
                        type: 'animated', 
                        framework: 'canvas',
                        canvas: canvas,
                        reason: 'Canvas with requestAnimationFrame detected'
                    };
                }
            }
            
            return { 
                type: 'static', 
                framework: 'none',
                canvas: canvas,
                reason: 'No animation framework detected'
            };
        },
        
        // Show animation export dialog (moved to UI module)
        showExportDialog: function() {
            // Delegate to UI module if available, otherwise start recording directly
            if (Chatooly.ui && Chatooly.ui.showVideoExportDialog) {
                Chatooly.ui.showVideoExportDialog();
            } else {
                // No dialog available, start recording with default settings
                console.log('No export dialog available, starting recording with defaults');
                this.startRecording();
            }
        },
        
        // Start recording
        startRecording: function() {
            // Initialize toolInfo if not already set
            if (!this.toolInfo) {
                this.toolInfo = this.detectToolType();
                console.log('🎬 Tool type detected:', this.toolInfo);
            }

            const duration = parseFloat(document.getElementById('anim-duration').value);
            const fps = parseInt(document.getElementById('anim-fps').value);
            const format = document.getElementById('anim-format').value;

            // Get quality settings with fallbacks
            const qualityElement = document.getElementById('anim-quality');
            const quality = qualityElement ? qualityElement.value : 'medium';

            const bitrateElement = document.getElementById('anim-bitrate');
            const customBitrate = bitrateElement ? parseFloat(bitrateElement.value) : 8;

            console.log(`🎬 Starting ${duration}s recording at ${fps} FPS in ${format} format with ${quality} quality`);

            try {
                this.initializeMediaRecorder(duration, fps, format, quality, customBitrate);
                this.beginRecording(duration);
            } catch (error) {
                console.error('Failed to start MediaRecorder:', error);
                alert('Failed to start recording. Please try again.');
            }
        },

        // Initialize MediaRecorder with settings
        initializeMediaRecorder: function(duration, fps, format, quality, customBitrate) {
            const canvas = this.toolInfo.canvas;
            if (!canvas) {
                throw new Error('No canvas found for recording');
            }
            
            // Create recording canvas
            this.recordingCanvas = document.createElement('canvas');
            this.recordingCtx = this.recordingCanvas.getContext('2d');
            
            // Set canvas size to match source canvas exactly (1:1 ratio for best quality)
            this.recordingCanvas.width = canvas.width;
            this.recordingCanvas.height = canvas.height;
            
            // Configure high-quality rendering settings
            this.recordingCtx.imageSmoothingEnabled = false; // Disable smoothing to prevent blur
            this.recordingCtx.globalCompositeOperation = 'source-over';
            
            // Set pixel-perfect rendering
            this.recordingCanvas.style.imageRendering = 'pixelated';
            this.recordingCanvas.style.imageRendering = '-moz-crisp-edges';
            this.recordingCanvas.style.imageRendering = 'crisp-edges';
            
            // Get stream from canvas at specified fps
            const stream = this.recordingCanvas.captureStream(fps);
            
            // Smart codec selection based on user choice
            let mimeType, fileExtension;
            
            if (format === 'auto') {
                // Auto-detect best available format (priority order)
                const formatPriority = [
                    { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4', name: 'MP4 H.264' },
                    { mime: 'video/webm;codecs=vp9', ext: 'webm', name: 'WebM VP9' },
                    { mime: 'video/webm;codecs=vp8', ext: 'webm', name: 'WebM VP8' },
                    { mime: 'video/webm', ext: 'webm', name: 'WebM Default' },
                    { mime: 'video/mp4', ext: 'mp4', name: 'MP4 Default' }
                ];
                
                for (const fmt of formatPriority) {
                    if (MediaRecorder.isTypeSupported(fmt.mime)) {
                        mimeType = fmt.mime;
                        fileExtension = fmt.ext;
                        console.log(`Auto-detected best format: ${fmt.name} (${fmt.mime})`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('No supported video formats found in this browser');
                }
                
            } else if (format === 'mp4') {
                // Try MP4 codecs first
                const compatibleMP4Codecs = [
                    'video/mp4;codecs=avc1.42E01E',
                    'video/mp4;codecs=avc1.42001E',
                    'video/mp4;codecs=h264,aac',
                    'video/mp4;codecs=h264',
                    'video/mp4'
                ];
                
                for (const codec of compatibleMP4Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'mp4';
                        console.log(`Using MP4 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('MP4 format not supported in this browser');
                }
                
            } else if (format === 'webm-vp9') {
                // Try WebM VP9 codecs
                const webmVP9Codecs = [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp9',
                    'video/webm'
                ];
                
                for (const codec of webmVP9Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM VP9 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM VP9 format not supported in this browser');
                }
                
            } else if (format === 'webm-vp8') {
                // Try WebM VP8 codecs
                const webmVP8Codecs = [
                    'video/webm;codecs=vp8,opus',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];
                
                for (const codec of webmVP8Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM VP8 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM VP8 format not supported in this browser');
                }
                
            } else if (format === 'webm-h264') {
                // Try WebM H.264 codecs (Chrome only)
                const webmH264Codecs = [
                    'video/webm;codecs=h264,opus',
                    'video/webm;codecs=h264',
                    'video/webm'
                ];
                
                for (const codec of webmH264Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM H.264 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM H.264 format not supported in this browser');
                }
                
            } else if (format === 'mkv') {
                // Try MKV/Matroska codecs (Chrome only)
                const mkvCodecs = [
                    'video/x-matroska;codecs=avc1',
                    'video/x-matroska'
                ];

                for (const codec of mkvCodecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'mkv';
                        console.log(`Using MKV codec: ${codec}`);
                        break;
                    }
                }

                if (!mimeType) {
                    throw new Error('MKV format not supported in this browser');
                }

            } else if (format === 'webm') {
                // Simple webm - use best available WebM codec
                const webmCodecs = [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp9',
                    'video/webm;codecs=vp8,opus',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];

                for (const codec of webmCodecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM codec: ${codec}`);
                        break;
                    }
                }

                if (!mimeType) {
                    throw new Error('WebM format not supported in this browser');
                }

            } else if (format === 'png-sequence') {
                // PNG Sequence export - delegate to sequence export module
                console.log('PNG Sequence export selected - delegating to animationSequenceExport');
                if (Chatooly.animationSequenceExport) {
                    Chatooly.animationSequenceExport.exportSequence(duration, fps);
                } else {
                    console.error('PNG sequence export module not available');
                    alert('PNG sequence export is not available. Please ensure all modules are loaded.');
                }
                return; // Exit early, PNG sequence uses different export path
            }
            
            this.currentFileExtension = fileExtension;
            
            // Calculate bitrate based on quality setting
            let bitrate;
            switch (quality) {
                case 'high':
                    bitrate = 12000000; // 12 Mbps
                    break;
                case 'medium':
                    bitrate = 8000000; // 8 Mbps
                    break;
                case 'standard':
                    bitrate = 6000000; // 6 Mbps
                    break;
                case 'low':
                    bitrate = 3000000; // 3 Mbps
                    break;
                case 'custom':
                    bitrate = (customBitrate || 8) * 1000000; // Convert Mbps to bps
                    break;
                default:
                    bitrate = 8000000; // Default to 8 Mbps
            }
            
            // Setup MediaRecorder
            const recordingOptions = {
                mimeType: mimeType,
                videoBitsPerSecond: bitrate
            };
            
            this.mediaRecorder = new MediaRecorder(stream, recordingOptions);
            this.recordedChunks = [];
            
            // Handle data available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            // Handle recording stop
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                this.cleanup();
            };
            
            console.log('📹 MediaRecorder initialized:', {
                format: fileExtension,
                framerate: fps,
                canvas: canvas,
                mimeType: mimeType,
                videoBitrate: bitrate,
                quality: quality,
                scaleFactor: 1
            });
        },
        
        // Begin the recording process
        beginRecording: function(duration) {
            if (!this.mediaRecorder) {
                console.error('MediaRecorder not initialized');
                return;
            }
            
            this.recordingState = 'starting';
            this.isRecording = true;
            
            // Start recording
            this.mediaRecorder.start();
            
            // Update UI to show recording state
            this.updateRecordingUI();
            
            // Set up frame capture based on framework
            this.setupFrameCapture();
            
            // Set up automatic stop after duration
            setTimeout(() => {
                this.stopRecording();
            }, duration * 1000);
            
            console.log('🎬 Recording started');
        },
        
        // Set up frame capture based on detected framework
        setupFrameCapture: function() {
            const framework = this.toolInfo.framework;
            
            if (framework === 'p5js') {
                this.setupP5Capture();
            } else if (framework === 'threejs') {
                this.setupThreeJSCapture();
            } else if (framework === 'canvas') {
                this.setupCanvasCapture();
            } else {
                console.warn('Unknown framework, using generic capture');
                this.setupGenericCapture();
            }
        },
        
        // Setup capture for p5.js
        setupP5Capture: function() {
            console.log('🎯 Setting up p5.js MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Setup capture for Three.js
        setupThreeJSCapture: function() {
            console.log('🎯 Setting up Three.js MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Setup capture for Canvas API
        setupCanvasCapture: function() {
            console.log('🎯 Setting up Canvas API MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Generic capture setup
        setupGenericCapture: function() {
            console.log('🎯 Setting up generic MediaRecorder capture');
            
            // Use a polling approach for unknown frameworks
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 30); // 30 FPS polling
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Capture canvas to recording canvas (unified approach)
        captureCanvasToRecordingCanvas: function() {
            try {
                const sourceCanvas = this.toolInfo.canvas;
                if (!sourceCanvas) return;
                
                // Save current context state
                this.recordingCtx.save();
                
                // Reset any transformations to ensure clean capture
                this.recordingCtx.setTransform(1, 0, 0, 1, 0, 0); // 1:1 pixel mapping
                
                // Clear recording canvas with exact background color
                this.recordingCtx.fillStyle = '#1a1a1a';
                this.recordingCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
                
                // Configure for pixel-perfect capture
                this.recordingCtx.imageSmoothingEnabled = false;
                this.recordingCtx.globalCompositeOperation = 'source-over';
                
                // Draw source canvas with exact pixel mapping
                if (sourceCanvas.width > 0 && sourceCanvas.height > 0) {
                    // Use integer coordinates and exact dimensions
                    this.recordingCtx.drawImage(
                        sourceCanvas,
                        0, 0, sourceCanvas.width, sourceCanvas.height,  // source
                        0, 0, sourceCanvas.width, sourceCanvas.height   // destination
                    );
                }
                
                // Restore context state
                this.recordingCtx.restore();
                
            } catch (error) {
                console.error('❌ Error capturing canvas:', error);
            }
        },
        
        // Stop recording and download
        stopRecording: function() {
            if (!this.mediaRecorder || !this.isRecording) {
                return;
            }
            
            this.recordingState = 'stopping';
            console.log('🛑 Stopping recording...');
            
            // Stop recording
            this.mediaRecorder.stop();
        },
        
        // Save the recorded animation
        saveRecording: function() {
            try {
                // Create blob with correct MIME type
                let blobMimeType;
                if (this.currentFileExtension === 'mp4') {
                    blobMimeType = 'video/mp4';
                } else if (this.currentFileExtension === 'webm') {
                    blobMimeType = 'video/webm';
                } else if (this.currentFileExtension === 'mkv') {
                    blobMimeType = 'video/x-matroska';
                } else {
                    blobMimeType = 'video/webm'; // fallback
                }
                
                const blob = new Blob(this.recordedChunks, { type: blobMimeType });
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animation-${Date.now()}.${this.currentFileExtension}`;
                
                // Trigger download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Clean up
                URL.revokeObjectURL(url);
                this.recordedChunks = [];
                
                console.log(`✅ Animation saved as ${this.currentFileExtension.toUpperCase()}`);
                
            } catch (error) {
                console.error('❌ Error saving recording:', error);
                alert('Error saving recording: ' + error.message);
            }
        },
        
        // Clean up after recording
        cleanup: function() {
            // Stop frame capture
            if (this.cleanupCapture) {
                this.cleanupCapture();
                this.cleanupCapture = null;
            }
            
            this.mediaRecorder = null;
            this.isRecording = false;
            this.recordingState = 'idle';
            this.recordingCanvas = null;
            this.recordingCtx = null;
            
            // Reset UI
            this.resetRecordingUI();
            
            console.log('🧹 Recording cleanup completed');
        },
        
        // Update UI during recording
        updateRecordingUI: function() {
            // Add recording indicator matching Chatooly section card design
            const indicator = document.createElement('div');
            indicator.className = 'chatooly-export-indicator';
            indicator.innerHTML = `
                <div style="font-family: 'VT323', monospace; font-size: 14px; color: #6D736C; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    RECORDING
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="chatooly-record-dot"></div>
                    <span style="font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 500; color: #000000;">
                        Capturing frames...
                    </span>
                </div>
            `;
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--chatooly-color-primary, #d9e5d7);
                border-radius: 5px;
                padding: 15px;
                min-width: 200px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 100000;
                animation: chatoolySlideIn 0.3s ease-out;
            `;

            // Add animations if not already added
            if (!document.querySelector('#chatooly-export-animation')) {
                const style = document.createElement('style');
                style.id = 'chatooly-export-animation';
                style.textContent = `
                    @keyframes chatoolySlideIn {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    @keyframes chatoolyRecordPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                    .chatooly-record-dot {
                        width: 8px;
                        height: 8px;
                        background: #dc3545;
                        border-radius: 50%;
                        animation: chatoolyRecordPulse 1.5s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(indicator);
        },

        // Reset UI after recording
        resetRecordingUI: function() {
            // Remove export indicator with animation
            const indicator = document.querySelector('.chatooly-export-indicator');
            if (indicator) {
                indicator.style.animation = 'none';
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateX(100%)';
                indicator.style.transition = 'all 0.3s ease-out';
                setTimeout(() => indicator.remove(), 300);
            }
        }
    };




    // ===== ANIMATION-SEQUENCE-EXPORT MODULE =====
    
/**
 * Chatooly CDN - Animation Sequence Export Module
 * High-quality PNG sequence export with alpha channel support
 * Creates frame-by-frame captures for professional video editing workflows
 */

Chatooly.animationSequenceExport = {
        // Export state
        isExporting: false,
        exportCanvas: null,
        exportCtx: null,
        captureInterval: null,

        /**
         * Export animation as PNG sequence
         * @param {number} duration - Duration in seconds
         * @param {number} fps - Frame rate (24, 30, or 60)
         */
        exportSequence: async function(duration, fps) {
            if (this.isExporting) {
                console.warn('🎬 Sequence export already in progress');
                return;
            }

            this.isExporting = true;

            try {
                // Get canvas from animationMediaRecorder detection
                const toolInfo = Chatooly.animationMediaRecorder
                    ? Chatooly.animationMediaRecorder.detectToolType()
                    : this._detectCanvas();

                const sourceCanvas = toolInfo.canvas || toolInfo.element;

                if (!sourceCanvas) {
                    throw new Error('No canvas found for sequence export');
                }

                console.log(`🎬 Starting PNG sequence export: ${duration}s at ${fps} FPS`);

                // Calculate frames
                const totalFrames = Math.ceil(duration * fps);
                const frameInterval = 1000 / fps; // ms between frames
                const frames = [];

                // Create export canvas for alpha preservation
                this.exportCanvas = document.createElement('canvas');
                this.exportCtx = this.exportCanvas.getContext('2d', { alpha: true });
                this.exportCanvas.width = sourceCanvas.width;
                this.exportCanvas.height = sourceCanvas.height;

                // Show export indicator
                this._showExportIndicator('Capturing frames...');

                // Capture frames
                for (let frame = 0; frame < totalFrames; frame++) {
                    this._updateExportIndicator(`Frame ${frame + 1}/${totalFrames}`);

                    // Clear with transparency
                    this.exportCtx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

                    // Copy current frame from source canvas
                    this.exportCtx.drawImage(sourceCanvas, 0, 0);

                    // Capture as PNG with alpha
                    const dataURL = this.exportCanvas.toDataURL('image/png');
                    frames.push(dataURL);

                    // Small delay for browser processing
                    await this._delay(frameInterval);
                }

                // Create ZIP file
                this._updateExportIndicator('Creating ZIP...');

                await this._createZipArchive(frames, fps, duration, sourceCanvas.width, sourceCanvas.height);

                console.log(`✅ PNG sequence exported: ${totalFrames} frames`);

                this._hideExportIndicator();

                setTimeout(() => {
                    alert(`PNG sequence exported successfully!\n${totalFrames} frames at ${fps} FPS\nAlpha channel preserved for transparency.`);
                }, 100);

            } catch (error) {
                console.error('❌ PNG sequence export failed:', error);
                this._hideExportIndicator();
                alert(`PNG sequence export failed: ${error.message}\n\nTry using video export instead.`);
            } finally {
                // Cleanup
                this.exportCanvas = null;
                this.exportCtx = null;
                this.isExporting = false;
            }
        },

        /**
         * Create ZIP archive with frames and metadata
         */
        _createZipArchive: async function(frames, fps, duration, width, height) {
            // Load JSZip from CDN if not available
            if (typeof JSZip === 'undefined') {
                await this._loadJSZip();
            }

            const zip = new JSZip();
            const timestamp = Date.now();
            const folderName = `chatooly-sequence-${timestamp}`;
            const folder = zip.folder(folderName);

            // Add frames
            frames.forEach((frameData, index) => {
                const frameNumber = String(index + 1).padStart(4, '0');
                const fileName = `frame_${frameNumber}.png`;
                const base64Data = frameData.split(',')[1];
                folder.file(fileName, base64Data, { base64: true });
            });

            // Add README
            const readmeContent = `Chatooly PNG Sequence Export
Generated: ${new Date().toISOString()}
Frames: ${frames.length}
Duration: ${duration}s
Frame Rate: ${fps} FPS
Canvas Size: ${width} × ${height}px
Alpha Channel: Preserved

This sequence contains PNG files with full alpha transparency support.
Import into video editing software (After Effects, Premiere, etc.) as image sequence.

Frame naming: frame_0001.png, frame_0002.png, etc.
`;
            folder.file('README.txt', readmeContent);

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.download = `${folderName}.zip`;
            link.href = url;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },

        /**
         * Load JSZip library from CDN
         */
        _loadJSZip: function() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = () => {
                    console.log('✅ JSZip loaded from CDN');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load JSZip library'));
                };
                document.head.appendChild(script);
            });
        },

        /**
         * Detect canvas element (fallback if animationMediaRecorder not available)
         */
        _detectCanvas: function() {
            const canvas = document.getElementById('chatooly-canvas');
            if (canvas && canvas.tagName === 'CANVAS') {
                return { canvas: canvas, type: 'canvas' };
            }

            const canvases = document.querySelectorAll('canvas');
            if (canvases.length > 0) {
                return { canvas: canvases[0], type: 'canvas' };
            }

            return { canvas: null, type: 'none' };
        },

        /**
         * Delay helper
         */
        _delay: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Show export progress indicator
         */
        _showExportIndicator: function(message) {
            // Remove existing indicator if any
            this._hideExportIndicator();

            const indicator = document.createElement('div');
            indicator.className = 'chatooly-export-indicator';
            indicator.innerHTML = `
                <div style="font-family: 'VT323', monospace; font-size: 14px; color: #6D736C; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    PNG SEQUENCE
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="chatooly-record-dot"></div>
                    <span style="font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 500; color: #000000;" id="chatooly-progress-text">
                        ${message}
                    </span>
                </div>
            `;
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--chatooly-color-primary, #d9e5d7);
                border-radius: 5px;
                padding: 15px;
                min-width: 200px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 100000;
                animation: chatoolySlideIn 0.3s ease-out;
            `;

            // Add animation keyframes if not already added
            if (!document.querySelector('#chatooly-sequence-export-animation')) {
                const style = document.createElement('style');
                style.id = 'chatooly-sequence-export-animation';
                style.textContent = `
                    @keyframes chatoolySlideIn {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    @keyframes chatoolyRecordPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                    .chatooly-record-dot {
                        width: 8px;
                        height: 8px;
                        background: #dc3545;
                        border-radius: 50%;
                        animation: chatoolyRecordPulse 1.5s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(indicator);
        },

        /**
         * Update export indicator text
         */
        _updateExportIndicator: function(message) {
            const progressText = document.getElementById('chatooly-progress-text');
            if (progressText) {
                progressText.textContent = message;
            }
        },

        /**
         * Hide export indicator
         */
        _hideExportIndicator: function() {
            const indicator = document.querySelector('.chatooly-export-indicator');
            if (indicator) {
                indicator.style.animation = 'none';
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateX(100%)';
                indicator.style.transition = 'all 0.3s ease-out';
                setTimeout(() => indicator.remove(), 300);
            }
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
            // First, check if the template already has the correct structure
            const templateContainer = document.getElementById('chatooly-container');
            const previewPanel = document.querySelector('.chatooly-preview-panel');
            
            if (templateContainer) {
                // Use the existing container from the template
                this.areaContainer = templateContainer;
                
                // Store reference to the preview panel (the actual full-size container)
                this.previewPanel = previewPanel;
                
                console.log('Chatooly: Using template chatooly-container with preview panel');
            } else {
                // Template doesn't have the required structure - this shouldn't happen with new tools
                console.error('Chatooly: No chatooly-container found in template. Please use the correct template structure.');
                console.error('Required structure: <div id="chatooly-container"><canvas id="chatooly-canvas"></canvas></div>');
                
                // Don't create a fallback - this forces proper template usage
                this.areaContainer = null;
                return;
            }
            
            // Apply styles based on position
            this.applyContainerStyles();
            
            // Inject CSS for consistent styling
            this.injectStyles();
        },
        
        // Apply container styles based on configuration
        applyContainerStyles: function() {
            if (!this.areaContainer) return;
            
            // Check if we're working with the template structure
            if (this.previewPanel) {
                // Working with template - chatooly-container should be centered in preview panel
                let containerStyles = {
                    position: 'relative', // Not fixed since it's inside preview panel
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '100%',
                    overflow: 'auto' // Enable scrolling when content exceeds bounds
                };
                
                // Apply styles to the container
                Object.assign(this.areaContainer.style, containerStyles);
                
                // Ensure preview panel maintains proper flex centering
                if (this.previewPanel) {
                    this.previewPanel.style.display = 'flex';
                    this.previewPanel.style.alignItems = 'center';
                    this.previewPanel.style.justifyContent = 'center';
                }
            } else {
                // Legacy mode - full positioning (for older templates)
                let styles = {
                    position: 'fixed',
                    backgroundColor: this.config.backgroundColor,
                    border: `1px solid ${this.config.borderColor}`,
                    overflow: 'auto', // Enable scrolling when content exceeds bounds
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '1',
                    boxSizing: 'border-box' // Ensure padding/border don't affect size calculations
                };
                
                // Check if there's a sidebar and leave space for it
                const sidebar = document.querySelector('.chatooly-controls-panel') || document.querySelector('.tools-sidebar');
                let sidebarWidth = 0;
                if (sidebar) {
                    // Get the computed style to ensure we get the actual rendered width
                    const sidebarStyle = window.getComputedStyle(sidebar);
                    sidebarWidth = sidebar.offsetWidth + 
                                 parseInt(sidebarStyle.marginLeft || 0) + 
                                 parseInt(sidebarStyle.marginRight || 0);
                }
                
                styles.top = '60px'; // Leave space for header/controls
                styles.left = sidebarWidth + 'px'; // Leave space for sidebar
                styles.right = '0';
                styles.bottom = '60px'; // Leave space for Chatooly button
                
                // Apply styles
                Object.assign(this.areaContainer.style, styles);
            }
        },
        
        // Inject global styles for canvas area
        injectStyles: function() {
            if (document.getElementById('chatooly-canvas-area-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-canvas-area-styles';
            style.textContent = `
                /* Canvas area container - works with both template and legacy */
                #chatooly-container, #chatooly-canvas-area {
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }
                
                /* Template structure - ensure proper centering */
                .chatooly-preview-panel {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                
                #chatooly-container {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100%;
                    height: 100%;
                }
                
                /* Canvas inside the area - universal rules */
                #chatooly-container canvas, #chatooly-canvas-area canvas {
                    display: block;
                    margin: 0; /* Remove auto margin - let flexbox handle centering */
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    image-rendering: crisp-edges;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: -webkit-crisp-edges;
                    image-rendering: pixelated;
                    /* Ensure canvas is centered by flexbox parent */
                    flex-shrink: 0;
                }
                
                /* When zoomed, allow canvas to exceed container bounds */
                #chatooly-container.zoomed, #chatooly-canvas-area.zoomed {
                    overflow: auto;
                    cursor: grab;
                }
                
                #chatooly-container.zoomed.dragging, #chatooly-canvas-area.zoomed.dragging {
                    cursor: grabbing;
                    user-select: none;
                }
                
                /* Custom scrollbar for canvas area */
                #chatooly-container::-webkit-scrollbar, #chatooly-canvas-area::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                
                #chatooly-container::-webkit-scrollbar-track, #chatooly-canvas-area::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 6px;
                }
                
                #chatooly-container::-webkit-scrollbar-thumb, #chatooly-canvas-area::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 6px;
                }
                
                #chatooly-container::-webkit-scrollbar-thumb:hover, #chatooly-canvas-area::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                
                /* Zoom indicator inside canvas area */
                #chatooly-container .zoom-indicator, #chatooly-canvas-area .zoom-indicator {
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
                #chatooly-container[data-fit="contain"] canvas, #chatooly-canvas-area[data-fit="contain"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                #chatooly-container[data-fit="cover"] canvas, #chatooly-canvas-area[data-fit="cover"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                #chatooly-container[data-fit="actual"] canvas, #chatooly-canvas-area[data-fit="actual"] canvas {
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
            
            // Check if canvas is already in the correct container
            if (canvas.parentElement === this.areaContainer) {
                console.log('Chatooly: Canvas already in correct container (no move needed)');
            } else {
                // Move canvas to area container
                this.areaContainer.appendChild(canvas);
                console.log('Chatooly: Canvas moved to canvas area');
            }
            
            // Setup canvas properties
            this.setupCanvas();
        },
        
        // Setup canvas properties and events
        setupCanvas: function() {
            if (!this.canvasElement) return;
            
            // Reset any existing transforms or positioning
            this.canvasElement.style.position = 'static'; // Use static for better flex behavior
            this.canvasElement.style.transform = '';
            this.canvasElement.style.left = '';
            this.canvasElement.style.top = '';
            this.canvasElement.style.margin = '0'; // Ensure no margin interferes with flexbox
            
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
            
            // Ensure proper flexbox centering for template structure
            if (this.previewPanel) {
                this.previewPanel.style.display = 'flex';
                this.previewPanel.style.alignItems = 'center';
                this.previewPanel.style.justifyContent = 'center';
            }
            
            this.areaContainer.style.display = 'flex';
            this.areaContainer.style.alignItems = 'center';
            this.areaContainer.style.justifyContent = 'center';
            
            // Get the actual dimensions
            const areaWidth = this.areaContainer.clientWidth;
            const areaHeight = this.areaContainer.clientHeight;
            const canvasWidth = this.canvasElement.offsetWidth;
            const canvasHeight = this.canvasElement.offsetHeight;
            
            // Only use scroll centering if canvas is larger than area (zoomed)
            if (canvasWidth > areaWidth || canvasHeight > areaHeight) {
                // Calculate center position
                const scrollLeft = Math.max(0, (canvasWidth - areaWidth) / 2);
                const scrollTop = Math.max(0, (canvasHeight - areaHeight) / 2);
                
                // Smooth scroll to center
                this.areaContainer.scrollTo({
                    left: scrollLeft,
                    top: scrollTop,
                    behavior: 'smooth'
                });
                
                console.log(`Chatooly: Canvas centered via scroll - ${Math.round(scrollLeft)}, ${Math.round(scrollTop)}`);
            } else {
                // Canvas fits in area - reset scroll to ensure flexbox centering works
                this.areaContainer.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'smooth'
                });
                
                console.log('Chatooly: Canvas centered via flexbox (fits in area)');
            }
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
        exportWidth: 1000,
        exportHeight: 1000,
        
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
            
            const width = parseInt(widthInput.value) || 1000;
            const height = parseInt(heightInput.value) || 1000;
            
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
            // p5.js - trigger resizeCanvas if available
            if (window.resizeCanvas && typeof window.resizeCanvas === 'function') {
                // Get current canvas dimensions
                const target = Chatooly.utils.detectExportTarget();
                if (target.element && target.type === 'canvas') {
                    window.resizeCanvas(target.element.width, target.element.height);
                }
            }
            
            // p5.js - trigger redraw
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
    



    // ===== CANVAS-RESIZE-BAR MODULE =====
    
/**
 * Chatooly CDN - Canvas Resize Bar Module
 * Bottom-positioned horizontal control bar for canvas size management
 * Integrates with existing canvasResizer and canvasArea modules
 */

Chatooly.canvasResizeBar = {

        // Preset configurations
        presets: {
            'HD (16:9)': { width: 1920, height: 1080, abbr: 'HD' },
            'SQUARE (1:1)': { width: 1000, height: 1000, abbr: 'SQ' },
            '4:3': { width: 1024, height: 768, abbr: '4:3' },
            'PORTRAIT (9:16)': { width: 1080, height: 1920, abbr: 'PT' }
        },

        // Current active preset
        activePreset: 'SQUARE (1:1)',

        // Initialization state
        initialized: false,

        // Initialize the resize bar
        init: function() {
            if (this.initialized) {
                console.warn('Chatooly: Canvas resize bar already initialized');
                return;
            }

            this._createResizeBar();
            this._attachEventListeners();
            this.initialized = true;

            console.log('Chatooly: Canvas resize bar initialized');
        },

        // Create and inject the resize bar into the DOM
        _createResizeBar: function() {
            // Remove existing bar if any
            const existingBar = document.getElementById('chatooly-resize-bar');
            if (existingBar) {
                existingBar.remove();
            }

            // Get current dimensions from canvasResizer
            const currentDimensions = this._getCurrentDimensions();

            // Create bar element
            const bar = document.createElement('div');
            bar.id = 'chatooly-resize-bar';
            bar.className = 'chatooly-resize-bar';
            bar.innerHTML = this._getBarHTML(currentDimensions);

            // Inject CSS
            this._injectCSS();

            // Find the preview panel to append to (for proper centering)
            const previewPanel = document.querySelector('.chatooly-preview-panel');
            if (previewPanel) {
                // Ensure preview panel has position relative for absolute positioning
                if (getComputedStyle(previewPanel).position === 'static') {
                    previewPanel.style.position = 'relative';
                }
                previewPanel.appendChild(bar);
            } else {
                // Fallback to body if preview panel doesn't exist
                document.body.appendChild(bar);
                // In this case, use fixed positioning
                bar.style.position = 'fixed';
            }
        },

        // Generate HTML for the resize bar
        _getBarHTML: function(dimensions) {
            const presetsHTML = Object.keys(this.presets).map(presetName => {
                const isActive = presetName === this.activePreset;
                const preset = this.presets[presetName];
                return `
                    <button class="chatooly-btn ${isActive ? 'active' : ''}"
                            data-preset="${presetName}"
                            data-abbr="${preset.abbr}">
                        <span class="chatooly-btn-full">${presetName}</span>
                        <span class="chatooly-btn-abbr">${preset.abbr}</span>
                    </button>
                `;
            }).join('');

            return `
                <span class="chatooly-resize-bar-label">Canvas Size</span>
                <div class="chatooly-resize-format">
                    <div class="chatooly-resize-inputs">
                        <label>W</label>
                        <div class="chatooly-input-box">
                            <input type="number"
                                   id="chatooly-bar-width"
                                   value="${dimensions.width}"
                                   min="100"
                                   max="4000">
                            <span>px</span>
                        </div>

                        <label>H</label>
                        <div class="chatooly-input-box">
                            <input type="number"
                                   id="chatooly-bar-height"
                                   value="${dimensions.height}"
                                   min="100"
                                   max="4000">
                            <span>px</span>
                        </div>
                    </div>

                    <span class="chatooly-presets-label">Presets</span>

                    <div class="chatooly-preset-buttons">
                        ${presetsHTML}
                    </div>
                </div>
            `;
        },

        // Attach event listeners
        _attachEventListeners: function() {
            // Width input - use debouncing for better performance
            const widthInput = document.getElementById('chatooly-bar-width');
            if (widthInput) {
                widthInput.addEventListener('change', (e) => {
                    this._handleDimensionChange('width', parseInt(e.target.value));
                });
            }

            // Height input - use debouncing for better performance
            const heightInput = document.getElementById('chatooly-bar-height');
            if (heightInput) {
                heightInput.addEventListener('change', (e) => {
                    this._handleDimensionChange('height', parseInt(e.target.value));
                });
            }

            // Preset buttons (using .chatooly-btn with data-preset)
            const presetButtons = document.querySelectorAll('.chatooly-btn[data-preset]');
            presetButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    // Use currentTarget (the button) instead of target (could be span)
                    const presetName = e.currentTarget.dataset.preset;
                    this._applyPreset(presetName);
                });
            });

            // Listen for external resize events
            document.addEventListener('chatooly:canvas:resized', (e) => {
                this._handleExternalResize(e.detail);
            });
        },

        // Handle dimension changes from user input
        _handleDimensionChange: function(dimension, value) {
            // Validate
            if (value < 100 || value > 4000 || isNaN(value)) {
                alert('Export dimensions must be between 100 and 4000 pixels');
                // Reset to current value
                const current = this._getCurrentDimensions();
                if (dimension === 'width') {
                    document.getElementById('chatooly-bar-width').value = current.width;
                } else {
                    document.getElementById('chatooly-bar-height').value = current.height;
                }
                return;
            }

            // Clear active preset when manual input
            this.activePreset = null;
            this._updatePresetButtons();

            // Get current dimensions
            const currentDimensions = this._getCurrentDimensions();
            const newWidth = dimension === 'width' ? value : currentDimensions.width;
            const newHeight = dimension === 'height' ? value : currentDimensions.height;

            // Update via canvasResizer (the central point for canvas sizing)
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.exportWidth = newWidth;
                Chatooly.canvasResizer.exportHeight = newHeight;

                // Apply to canvas area if it exists
                if (Chatooly.canvasArea) {
                    Chatooly.canvasArea.setExportResolution(newWidth, newHeight);
                } else {
                    // Legacy: apply directly
                    const target = Chatooly.utils.detectExportTarget();
                    if (target.element) {
                        Chatooly.canvasResizer.applyLegacyResize(target, newWidth, newHeight);
                    }
                }
            }

            // Emit custom event
            const event = new CustomEvent('chatooly:resize-bar:change', {
                detail: { dimension, value, width: newWidth, height: newHeight }
            });
            document.dispatchEvent(event);

            console.log(`Chatooly: Canvas size changed via bar to ${newWidth}x${newHeight}`);
        },

        // Apply a preset
        _applyPreset: function(presetName) {
            const preset = this.presets[presetName];
            if (!preset) {
                console.warn(`Chatooly: Unknown preset "${presetName}"`);
                return;
            }

            // Update active preset
            this.activePreset = presetName;
            this._updatePresetButtons();

            // Update input values
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = preset.width;
            if (heightInput) heightInput.value = preset.height;

            // Apply via canvasResizer (central point for canvas sizing)
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.exportWidth = preset.width;
                Chatooly.canvasResizer.exportHeight = preset.height;

                // Apply to canvas area if it exists
                if (Chatooly.canvasArea) {
                    Chatooly.canvasArea.setExportResolution(preset.width, preset.height);
                } else {
                    // Legacy: apply directly
                    const target = Chatooly.utils.detectExportTarget();
                    if (target.element) {
                        Chatooly.canvasResizer.applyLegacyResize(target, preset.width, preset.height);
                    }
                }
            }

            // Emit custom event
            const event = new CustomEvent('chatooly:resize-bar:preset', {
                detail: { presetName, ...preset }
            });
            document.dispatchEvent(event);

            console.log(`Chatooly: Applied preset "${presetName}" (${preset.width}x${preset.height})`);
        },

        // Update preset button states
        _updatePresetButtons: function() {
            const buttons = document.querySelectorAll('.chatooly-btn[data-preset]');
            buttons.forEach(button => {
                const presetName = button.dataset.preset;
                if (presetName === this.activePreset) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        },

        // Get current canvas dimensions from canvasResizer
        _getCurrentDimensions: function() {
            if (Chatooly.canvasResizer && Chatooly.canvasResizer.getCurrentDimensions) {
                return Chatooly.canvasResizer.getCurrentDimensions();
            }

            // Fallback to default
            return { width: 800, height: 800 };
        },

        // Handle external resize events (from other UI components)
        _handleExternalResize: function(detail) {
            if (!detail || !detail.width || !detail.height) return;

            // Update input values
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = detail.width;
            if (heightInput) heightInput.value = detail.height;

            // Check if it matches a preset
            this.activePreset = null;
            for (const [presetName, preset] of Object.entries(this.presets)) {
                if (preset.width === detail.width && preset.height === detail.height) {
                    this.activePreset = presetName;
                    break;
                }
            }

            this._updatePresetButtons();
        },

        // Public API: Update displayed dimensions
        updateDimensions: function(width, height) {
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;

            // Check if it matches a preset
            this.activePreset = null;
            for (const [presetName, preset] of Object.entries(this.presets)) {
                if (preset.width === width && preset.height === height) {
                    this.activePreset = presetName;
                    break;
                }
            }

            this._updatePresetButtons();
        },

        // Public API: Show the bar
        show: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.style.display = 'flex';
            }
        },

        // Public API: Hide the bar
        hide: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.style.display = 'none';
            }
        },

        // Public API: Toggle visibility
        toggle: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                const isHidden = bar.style.display === 'none';
                bar.style.display = isHidden ? 'flex' : 'none';
            }
        },

        // Public API: Remove the bar
        destroy: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.remove();
            }

            // Remove styles
            const styles = document.getElementById('chatooly-resize-bar-styles');
            if (styles) {
                styles.remove();
            }

            this.initialized = false;
            console.log('Chatooly: Canvas resize bar destroyed');
        },

        // Inject CSS styles
        _injectCSS: function() {
            // Check if styles already exist
            if (document.getElementById('chatooly-resize-bar-styles')) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'chatooly-resize-bar-styles';
            style.textContent = `
                .chatooly-resize-bar {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;

                    display: inline-flex;
                    padding: 5px 5px 5px 15px;
                    align-items: center;
                    gap: 15px;

                    border-radius: 10px;
                    border: 1px solid var(--chatooly-color-border);
                    background: var(--chatooly-color-surface);

                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    font-family: var(--chatooly-font-family);
                }

                .chatooly-resize-bar-label {
                    font-size: 12px;
                    color: var(--chatooly-color-text-muted);
                    font-weight: 500;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .chatooly-resize-format {
                    background: var(--chatooly-color-accent-bg);
                    border-radius: 5px;
                    padding: 5px 5px 5px 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .chatooly-resize-inputs {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .chatooly-resize-inputs label {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--chatooly-color-accent-text);
                    margin: 0;
                }

                .chatooly-input-box {
                    background: var(--chatooly-color-accent-input);
                    border-radius: 5px;
                    padding: 8px 10px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    width: 59px;
                }

                .chatooly-input-box input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: var(--chatooly-color-accent-input-text);
                    font-size: 10px;
                    font-weight: 500;
                    padding: 0;
                    text-align: center;
                    outline: none;

                    /* Remove spinner arrows */
                    -moz-appearance: textfield;
                }

                .chatooly-input-box input::-webkit-outer-spin-button,
                .chatooly-input-box input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .chatooly-input-box span {
                    font-size: 10px;
                    color: var(--chatooly-color-accent-input-text);
                    font-weight: 500;
                }

                .chatooly-presets-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--chatooly-color-accent-text);
                    flex-shrink: 0;
                }

                .chatooly-preset-buttons {
                    display: flex;
                    gap: 5px;
                    flex-wrap: nowrap;
                    align-items: center;
                }

                /* Buttons inherit from base .chatooly-btn in components.css */

                /* Button text visibility - show full text by default */
                .chatooly-btn-full {
                    display: inline;
                }

                .chatooly-btn-abbr {
                    display: none;
                }

                /* Responsive adjustments */
                @media (max-width: 1024px) {
                    .chatooly-resize-bar {
                        padding: 5px 10px;
                        gap: 10px;
                        max-width: calc(100vw - 40px);
                    }

                    .chatooly-resize-format {
                        padding: 5px 10px;
                        gap: 10px;
                    }

                    /* Keep buttons in single line, no wrapping */
                    .chatooly-preset-buttons {
                        flex-wrap: nowrap;
                        gap: 3px;
                    }

                    /* Switch to abbreviated text on tablet and below */
                    .chatooly-btn-full {
                        display: none;
                    }

                    .chatooly-btn-abbr {
                        display: inline;
                    }

                    /* Scale down preset buttons to fit in single line */
                    .chatooly-preset-buttons .chatooly-btn {
                        min-width: 28px;
                        padding: 6px 4px;
                        font-size: 8px;
                        text-align: center;
                        white-space: nowrap;
                    }
                }

                @media (max-width: 768px) {
                    .chatooly-resize-bar {
                        bottom: 10px;
                        left: 50%;
                        right: auto;
                        transform: translateX(-50%);
                        flex-wrap: wrap;
                        max-width: calc(100% - 20px);
                    }

                    .chatooly-resize-bar-label {
                        width: 100%;
                        margin-bottom: 5px;
                    }

                    .chatooly-resize-format {
                        flex-wrap: wrap;
                        width: 100%;
                    }

                    .chatooly-resize-inputs {
                        flex-wrap: wrap;
                    }

                    /* Further scale down buttons on mobile */
                    .chatooly-preset-buttons {
                        gap: 2px;
                    }

                    .chatooly-preset-buttons .chatooly-btn {
                        min-width: 24px;
                        padding: 5px 3px;
                        font-size: 7px;
                    }
                }
            `;

            document.head.appendChild(style);
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
        spacebarPressed: false,
        
        // Canvas info
        canvasElement: null,
        canvasArea: null,
        baseWidth: 0,
        baseHeight: 0,
        centerX: 0,
        centerY: 0,
        
        // Initialize zoom functionality
        init: function() {
            // Wait for canvas area to be ready
            if (Chatooly.canvasArea && Chatooly.canvasArea.canvasElement) {
                this.setCanvasArea(Chatooly.canvasArea.areaContainer, Chatooly.canvasArea.canvasElement);
            } else if (this.findCanvas()) {
                this.setupCanvasForZoom();
                this.setupZoomControls();
            }
        },
        
        // Set canvas area and element (called by canvas-area module)
        setCanvasArea: function(areaContainer, canvasElement) {
            this.canvasArea = areaContainer;
            this.canvasElement = canvasElement;
            this.setupCanvasForZoom();
            this.setupZoomControls();
        },
        
        // Find canvas - check canvas area first, then fallback
        findCanvas: function() {
            // First check if canvas area exists
            const canvasArea = document.getElementById('chatooly-canvas-area');
            if (canvasArea) {
                this.canvasArea = canvasArea;
                this.canvasElement = canvasArea.querySelector('canvas');
                if (this.canvasElement) {
                    return true;
                }
            }
            
            // Fallback: use detection system
            const target = Chatooly.utils.detectExportTarget();
            if (target && target.element && target.element.tagName === 'CANVAS') {
                this.canvasElement = target.element;
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
            
            // Keyboard zoom and spacebar tracking
            document.addEventListener('keydown', (e) => {
                // Track spacebar state for pan control
                if (e.code === 'Space') {
                    this.spacebarPressed = true;
                    this.updateCursor(); // Update cursor when spacebar is pressed
                    // Prevent default when hovering over canvas to enable panning
                    if (e.target === this.canvasElement || this.canvasElement?.contains(e.target)) {
                        e.preventDefault();
                    }
                }
                
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
                    // R key for reset and center (without modifier) - only if not typing
                    const activeElement = document.activeElement;
                    const isTyping = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.contentEditable === 'true' ||
                        activeElement.isContentEditable
                    );
                    
                    if (!isTyping) {
                        e.preventDefault();
                        if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                            Chatooly.canvasArea.resetZoomAndCenter();
                        } else {
                            this.resetZoom();
                        }
                    }
                }
            });
            
            // Track spacebar release
            document.addEventListener('keyup', (e) => {
                if (e.code === 'Space') {
                    this.spacebarPressed = false;
                    this.updateCursor(); // Update cursor when spacebar is released
                    // End any active panning when spacebar is released
                    this.endPan();
                }
            });
            
            // Pan controls (drag canvas when spacebar pressed at any zoom level)
            document.addEventListener('mousedown', (e) => {
                if (e.target === this.canvasElement && this.spacebarPressed) {
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
            
        },
        
        // Apply zoom and pan transform
        applyTransform: function() {
            if (!this.canvasElement) return;
            
            // Simple transform without preserving original (canvas area handles positioning)
            const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
            this.canvasElement.style.transform = transform;
            
            // Update cursor based on zoom and spacebar state
            this.updateCursor();
            
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
                this.updateCursor();
                document.body.style.userSelect = '';
            }
        },
        
        // Update cursor based on current state
        updateCursor: function() {
            if (!this.canvasElement) return;
            
            if (this.isPanning) {
                this.canvasElement.style.cursor = 'grabbing';
            } else if (this.spacebarPressed) {
                this.canvasElement.style.cursor = 'grab';
            } else {
                this.canvasElement.style.cursor = 'default';
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

            // Try to get tool name from multiple sources (in order of priority)
            // 1. Explicit option passed to publish()
            // 2. Chatooly config name
            // 3. Last published name from localStorage
            // 4. Prompt user
            let toolName = options.name || Chatooly.config.name;

            // If config name exists and is not empty, use it (enables easy republishing)
            if (toolName && toolName.trim()) {
                console.log('Chatooly: Using tool name from config: "' + toolName + '"');
            } else {
                // Try to get last published name for convenience
                const lastPublishedName = localStorage.getItem('chatooly_last_tool_name');
                const defaultName = lastPublishedName || '';

                toolName = prompt('Enter tool name for publishing:', defaultName);
                if (!toolName || !toolName.trim()) {
                    console.log('Chatooly: Publishing cancelled');
                    return;
                }

                // Save for next time
                localStorage.setItem('chatooly_last_tool_name', toolName);
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
            
            // Check for required template structure
            const chatoolyContainer = document.getElementById('chatooly-container');
            if (!chatoolyContainer) {
                validation.errors.push('Missing required template structure: <div id="chatooly-container"> not found');
                validation.valid = false;
            } else {
                const chatoolyCanvas = chatoolyContainer.querySelector('canvas#chatooly-canvas');
                if (!chatoolyCanvas) {
                    validation.errors.push('Missing required canvas: <canvas id="chatooly-canvas"> not found inside chatooly-container');
                    validation.valid = false;
                }
            }
            
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
 * Automatically injects export modal and handles export functionality
 */

// UI functionality
    Chatooly.ui = {

        // Create and inject export modal - called automatically by core
        createExportButton: function() {
            // Inject CSS first
            this._injectModalCSS();

            // Inject modal HTML
            this._injectModalHTML();

            // Setup event listeners
            this._setupModalEvents();

            // Inject export button in sidebar footer
            this._injectExportButton();

            // Auto-attach to any existing export buttons
            this._attachToExportButtons();
        },

        // Inject export button into sidebar footer
        _injectExportButton: function() {
            // Look for Chatooly controls panel (sidebar)
            const controlsPanel = document.querySelector('.chatooly-controls-panel');
            if (!controlsPanel) return;

            // Check if footer already exists
            let footer = controlsPanel.querySelector('.chatooly-controls-footer');

            if (!footer) {
                // Create footer if it doesn't exist
                footer = document.createElement('div');
                footer.className = 'chatooly-controls-footer';
                controlsPanel.appendChild(footer);
            }

            // Check if export button already exists
            if (footer.querySelector('.chatooly-btn-export')) return;

            // Create and inject export button
            const exportBtn = document.createElement('button');
            exportBtn.className = 'chatooly-btn chatooly-btn-export';
            exportBtn.textContent = 'Export';
            footer.appendChild(exportBtn);
        },

        // Inject modal CSS
        _injectModalCSS: function() {
            // Check if already injected
            if (document.getElementById('chatooly-modal-styles')) return;

            const style = document.createElement('style');
            style.id = 'chatooly-modal-styles';
            style.textContent = `
/* ========== EXPORT MODAL ========== */
.chatooly-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Chatooly.config.modalZIndex || 1050};
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.chatooly-modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.chatooly-modal-container {
  width: 350px;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.chatooly-modal-overlay.active .chatooly-modal-container {
  transform: scale(1);
}

.chatooly-modal-content {
  background: #232323;
  border: 1px solid #343434;
  border-radius: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chatooly-modal-header {
  background: #454545;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chatooly-modal-header span {
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  flex: 1;
}

.chatooly-modal-close {
  width: 12px;
  height: 12px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.chatooly-modal-close:hover {
  opacity: 1;
}

.chatooly-modal-body {
  padding: 0 10px;
}

.chatooly-export-section {
  background: #d9e5d7;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chatooly-export-toggle {
  display: flex;
  gap: 5px;
  width: 100%;
}

.chatooly-toggle-btn {
  flex: 1;
  padding: 5px 6px;
  background: #6d736c;
  color: #d9e5d7;
  border: none;
  border-radius: 3px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-toggle-btn:hover {
  background: #7d837c;
}

.chatooly-toggle-btn.active {
  background: #000000;
  color: #FFFFFF;
}

.chatooly-export-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chatooly-export-row {
  display: flex;
  gap: 5px;
}

.chatooly-export-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chatooly-export-field label {
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #000000;
}

.chatooly-multiplier-buttons {
  display: flex;
  gap: 5px;
  width: 100%;
}

.chatooly-multiplier-btn {
  flex: 1;
  padding: 8px 10px;
  background: #6d736c;
  color: #d9e5d7;
  border: none;
  border-radius: 5px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-multiplier-btn:hover {
  opacity: 0.85;
}

.chatooly-multiplier-btn.active {
  background: #000000;
  color: #FFFFFF;
}

.chatooly-modal-footer {
  display: flex;
  justify-content: center;
  padding: 0 10px;
}

.chatooly-modal-footer .chatooly-modal-export-btn {
  width: 100%;
  padding: 12px 15px;
  background: #F4E4A3;
  color: #000000;
  border: none;
  border-radius: 5px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-modal-footer .chatooly-modal-export-btn:hover {
  background: #FFF4C4;
}
            `;
            document.head.appendChild(style);
        },

        // Inject modal HTML
        _injectModalHTML: function() {
            // Check if already injected
            if (document.getElementById('chatooly-export-modal')) return;

            const modal = document.createElement('div');
            modal.id = 'chatooly-export-modal';
            modal.className = 'chatooly-modal-overlay';
            modal.innerHTML = `
                <div class="chatooly-modal-container">
                    <div class="chatooly-modal-content">
                        <!-- Header -->
                        <div class="chatooly-modal-header">
                            <span>Export</span>
                            <button class="chatooly-modal-close" aria-label="Close">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L11 11M1 11L11 1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="chatooly-modal-body">
                            <div class="chatooly-export-section">
                                <!-- Format Toggle -->
                                <div class="chatooly-export-toggle">
                                    <button class="chatooly-toggle-btn active" data-format="image">Image</button>
                                    <button class="chatooly-toggle-btn" data-format="video">Video</button>
                                </div>

                                <!-- Image Options -->
                                <div class="chatooly-export-options" data-type="image">
                                    <div class="chatooly-export-field">
                                        <label>Size</label>
                                        <div class="chatooly-multiplier-buttons">
                                            <button class="chatooly-multiplier-btn" data-multiplier="0.5">0.5X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="1">1X</button>
                                            <button class="chatooly-multiplier-btn active" data-multiplier="2">2X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="3">3X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="4">4X</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Video Options -->
                                <div class="chatooly-export-options" data-type="video" style="display: none;">
                                    <div class="chatooly-export-row">
                                        <div class="chatooly-input-group">
                                            <label class="chatooly-input-label">Duration</label>
                                            <input type="number" class="chatooly-input" value="5" id="anim-duration">
                                        </div>
                                        <div class="chatooly-input-group">
                                            <label class="chatooly-input-label">FPS</label>
                                            <input type="number" class="chatooly-input" value="30" id="anim-fps">
                                        </div>
                                    </div>

                                    <div class="chatooly-input-group">
                                        <label class="chatooly-input-label">Format</label>
                                        <select class="chatooly-select" id="anim-format">
                                            <option value="webm">WebM</option>
                                            <option value="mp4">MP4</option>
                                            <option value="png-sequence">PNG Sequence</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="chatooly-modal-footer">
                            <button class="chatooly-modal-export-btn">
                                Export Image
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        // Setup modal event listeners
        _setupModalEvents: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (!modal) return;

            // Close button
            const closeBtn = modal.querySelector('.chatooly-modal-close');
            closeBtn.addEventListener('click', () => this.hideModal());

            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });

            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.hideModal();
                }
            });

            // Format toggle buttons
            const toggleBtns = modal.querySelectorAll('.chatooly-toggle-btn');
            const exportBtn = modal.querySelector('.chatooly-modal-export-btn');
            const imageOptions = modal.querySelector('[data-type="image"]');
            const videoOptions = modal.querySelector('[data-type="video"]');

            toggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    toggleBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    const format = this.dataset.format;
                    if (format === 'image') {
                        imageOptions.style.display = 'block';
                        videoOptions.style.display = 'none';
                        exportBtn.textContent = 'Export Image';
                    } else {
                        imageOptions.style.display = 'none';
                        videoOptions.style.display = 'block';
                        exportBtn.textContent = 'Start Recording';
                    }
                });
            });

            // Multiplier button handlers
            const multiplierBtns = modal.querySelectorAll('.chatooly-multiplier-btn');
            multiplierBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active from siblings
                    const container = this.parentElement;
                    container.querySelectorAll('.chatooly-multiplier-btn').forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    this.classList.add('active');
                });
            });

            // Export button
            exportBtn.addEventListener('click', () => {
                const format = modal.querySelector('.chatooly-toggle-btn.active').dataset.format;
                const exportData = this._getExportData(format);

                // Call the appropriate export function
                if (format === 'image') {
                    this.exportImage(exportData);
                } else {
                    this.exportVideo(exportData);
                }

                this.hideModal();
            });
        },

        // Attach to export buttons
        _attachToExportButtons: function() {
            // Find all export buttons and attach click handler
            const exportButtons = document.querySelectorAll('.chatooly-btn-export');
            exportButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal();
                });
            });
        },

        // Get export data from form
        _getExportData: function(format) {
            const modal = document.getElementById('chatooly-export-modal');

            if (format === 'image') {
                const imageOptions = modal.querySelector('[data-type="image"]');
                const activeBtn = imageOptions.querySelector('.chatooly-multiplier-btn.active');
                const multiplier = parseFloat(activeBtn.dataset.multiplier);

                return {
                    type: 'image',
                    multiplier: multiplier,
                    scale: multiplier
                };
            } else {
                return {
                    type: 'video',
                    duration: parseInt(modal.querySelector('#anim-duration').value),
                    fps: parseInt(modal.querySelector('#anim-fps').value),
                    format: modal.querySelector('#anim-format').value
                };
            }
        },

        // Show modal
        showModal: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (modal) {
                modal.classList.add('active');
            }
        },

        // Hide modal
        hideModal: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        },

        // Export image - calls existing Chatooly export
        exportImage: function(options) {
            console.log('Exporting image with multiplier:', options.multiplier);

            // Call the existing Chatooly export function with scale multiplier
            if (Chatooly.export) {
                Chatooly.export('png', {
                    scale: options.scale
                });
            }
        },

        // Export video - calls existing Chatooly video export
        exportVideo: function(options) {
            console.log('Exporting video:', options);

            // Call the existing video export (it reads from DOM elements with IDs: anim-duration, anim-fps, anim-format)
            if (Chatooly.animationMediaRecorder && Chatooly.animationMediaRecorder.startRecording) {
                Chatooly.animationMediaRecorder.startRecording();
            } else {
                console.warn('Video export not available. Make sure animation modules are loaded.');
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