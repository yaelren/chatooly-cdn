/**
 * Chatooly CDN - Core Library (POC Version) - Built from Modules
 * Provides PNG export functionality for canvas-based design tools
 * Supports p5.js, Three.js, and DOM-based tools
 * 
 * Built: 2025-08-10T15:32:54.744Z
 * Architecture: Modular components combined into single file
 */

(function() {
    'use strict';
    
    // ===== GLOBAL CHATOOLY OBJECT =====
    
    window.Chatooly = {
        version: '1.0.0-poc',
        config: {},
        
        // Initialize the library
        init: function(userConfig) {
            this.config = Object.assign({
                name: 'Untitled Tool',
                exportFormats: ['png'],
                resolution: 2,
                buttonPosition: 'bottom-right'
            }, userConfig);
            
            this.ui.createExportButton();
            this.utils.logDevelopmentMode();
        },
        
        // Main export function
        export: function(format, options) {
            format = format || 'png';
            options = options || {};
            
            if (format !== 'png') {
                console.warn('Chatooly POC: Only PNG export supported in this version');
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
                // 1. Look for Chatooly export container first (highest priority for HTML tools)
                const chatoolyCanvas = document.querySelector('#chatooly-canvas');
                if (chatoolyCanvas) {
                    // Check if it contains a canvas that's managed by p5 or Three.js
                    const innerCanvas = chatoolyCanvas.querySelector('canvas');
                    if (innerCanvas && (this._isP5Canvas(innerCanvas) || this._isThreeCanvas(innerCanvas))) {
                        // For p5/Three.js, export the canvas directly for better quality
                        return { type: 'canvas', element: innerCanvas };
                    }
                    // For HTML tools with regular canvas or DOM content, export the container
                    return { type: 'dom', element: chatoolyCanvas };
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
                        const originalSize = renderer.getSize(new THREE.Vector2());
                        const tempCanvas = document.createElement('canvas');
                        const tempRenderer = new THREE.WebGLRenderer({ 
                            canvas: tempCanvas, 
                            antialias: true, 
                            preserveDrawingBuffer: true 
                        });
                        
                        tempRenderer.setSize(originalSize.x * resolution, originalSize.y * resolution, false);
                        tempRenderer.setClearColor(renderer.getClearColor(), renderer.getClearAlpha());
                        tempRenderer.render(scene, camera);
                        
                        const dataURL = tempCanvas.toDataURL('image/png');
                        tempRenderer.dispose();
                        return dataURL;
                    }
                    
                    // Fallback to canvas scaling
                    return this._fallbackScale(canvas, resolution);
                },
                
                // Fallback scaling method
                _fallbackScale: function(canvas, resolution) {
                    const scaledCanvas = document.createElement('canvas');
                    const ctx = scaledCanvas.getContext('2d');
                    scaledCanvas.width = canvas.width * resolution;
                    scaledCanvas.height = canvas.height * resolution;
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
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
                
                // Get current HTML (remove Chatooly button and CDN script for published version)
                const htmlClone = document.documentElement.cloneNode(true);
                const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
                if (exportBtn) exportBtn.remove();
                
                // Remove Chatooly CDN script from published version
                const chatoolyCdnScript = htmlClone.querySelector('script[src*="chatooly-cdn"]');
                if (chatoolyCdnScript) chatoolyCdnScript.remove();
                
                const htmlContent = '<!DOCTYPE html>' + htmlClone.outerHTML;
                files['index.html'] = htmlContent;
                discovered.add('index.html');
                
                // Scan HTML for dependencies
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
            
            // Generate button HTML
            _getButtonHTML: function() {
                const isDev = Chatooly.utils.isDevelopment();
                const publishButton = isDev ? '<button onclick="Chatooly.publish.publish()">📤 Publish</button>' : '';
                
                return `
                    <div class="chatooly-btn-main">📥</div>
                    <div class="chatooly-btn-menu" style="display: none;">
                        <button onclick="Chatooly.export('png', {resolution: 1})">1x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 2})">2x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 4})">4x PNG</button>
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
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                `;
            },
            
            // Inject button CSS styles
            _injectButtonCSS: function() {
                // Check if styles already exist
                if (document.getElementById('chatooly-button-styles')) {
                    return;
                }
                
                const style = document.createElement('style');
                style.id = 'chatooly-button-styles';
                style.textContent = `
                    #chatooly-export-btn .chatooly-btn-main {
                        width: 50px;
                        height: 50px;
                        background: #007bff;
                        border-radius: 25px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                        font-size: 20px;
                        transition: all 0.2s ease;
                        user-select: none;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-main:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                    }
                    
                    #chatooly-export-btn .chatooly-btn-main:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu {
                        position: absolute;
                        bottom: 60px;
                        right: 0;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        padding: 8px;
                        min-width: 120px;
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
                        border: none;
                        background: none;
                        text-align: left;
                        cursor: pointer;
                        border-radius: 4px;
                        margin: 2px 0;
                        font-size: 14px;
                        transition: background 0.1s ease;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu button:hover {
                        background: #f8f9fa;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu button:active {
                        background: #e9ecef;
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
            }
        };

    // ===== AUTO-INITIALIZATION =====
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            Chatooly.init();
        }
    });
    
    // Also initialize immediately if DOM is already loaded
    if (document.readyState !== 'loading') {
        setTimeout(() => {
            if (window.ChatoolyConfig) {
                Chatooly.init(window.ChatoolyConfig);
            } else {
                Chatooly.init();
            }
        }, 100);
    }
    
})();