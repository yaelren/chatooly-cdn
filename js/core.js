/**
 * Chatooly CDN - Core Library (POC Version)
 * Provides PNG export functionality for canvas-based design tools
 * Supports p5.js, Three.js, and DOM-based tools
 */

(function() {
    'use strict';
    
    // Global Chatooly object
    window.Chatooly = {
        version: '1.0.0-poc',
        config: {},
        
        // Initialize the library
        init: function(userConfig) {
            this.config = Object.assign({
                name: 'Untitled Tool',
                exportFormats: ['png'],
                resolution: 2, // Default 2x for high quality
                buttonPosition: 'bottom-right'
            }, userConfig);
            
            this._createExportButton();
            this._detectDevelopmentMode();
        },
        
        // Smart export function - detects canvas vs DOM
        export: function(format, options) {
            format = format || 'png';
            options = options || {};
            
            if (format !== 'png') {
                console.warn('Chatooly POC: Only PNG export supported in this version');
                return;
            }
            
            const target = this._detectExportTarget();
            
            if (target.type === 'canvas') {
                this._exportCanvas(target.element, options);
            } else {
                this._exportDOM(target.element, options);
            }
        },
        
        // Publish function (development mode only)
        publish: function(options) {
            if (!this._isDevelopment()) {
                console.warn('Chatooly: Publishing only available in development mode');
                return;
            }
            
            options = options || {};
            const toolName = options.name || this.config.name || prompt('Enter tool name for publishing:');
            
            if (!toolName) {
                console.log('Chatooly: Publishing cancelled');
                return;
            }
            
            // Create tool slug (URL-safe name)
            const toolSlug = toolName.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-')         // Spaces to hyphens
                .replace(/-+/g, '-')          // Multiple hyphens to single
                .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
            
            console.log('Chatooly: Publishing tool "' + toolName + '" as "' + toolSlug + '"');
            
            // Check if .chatooly/publish.js exists and call it
            if (typeof window.publishTool === 'function') {
                // Template has custom publish function
                window.publishTool(toolSlug, this._gatherToolFiles());
            } else {
                // Fallback: show instructions
                this._showPublishInstructions(toolSlug);
            }
        },
        
        // Gather current tool files for publishing
        _gatherToolFiles: function() {
            const files = {};
            
            // Get current HTML (remove Chatooly button for published version)
            const htmlClone = document.documentElement.cloneNode(true);
            const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
            if (exportBtn) exportBtn.remove();
            
            files['index.html'] = '<!DOCTYPE html>' + htmlClone.outerHTML;
            
            // Get inline styles and scripts
            const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
            if (styles) files['style.css'] = styles;
            
            const scripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent).join('\n');
            if (scripts) files['tool.js'] = scripts;
            
            return files;
        },
        
        // Show publishing instructions if no custom publish function
        _showPublishInstructions: function(toolSlug) {
            const instructions = `
Publishing "${toolSlug}":

1. Run: npm run publish
   (This will call .chatooly/publish.js script)

2. Or manually upload to staging:
   - Tool will be available at: tools.chatooly.com/staging/${toolSlug}
   - Admin can promote to: tools.chatooly.com/${toolSlug}

3. Required files:
   - index.html (main tool file)
   - style.css (if using external styles)  
   - tool.js (if using external scripts)

See template documentation for setup details.
            `.trim();
            
            alert(instructions);
            console.log('Chatooly:', instructions);
        },
        
        // Private methods
        _detectExportTarget: function() {
            // 1. Look for canvas elements (p5.js, Three.js, etc.)
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
            
            // 2. Look for export-specific containers first
            const exportContainers = ['#gradient-display', '#preview', '.export-area'];
            for (const selector of exportContainers) {
                const element = document.querySelector(selector);
                if (element) {
                    return { type: 'dom', element: element };
                }
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
        
        _exportCanvas: function(canvas, options) {
            const resolution = options.resolution || this.config.resolution || 2;
            const filename = options.filename || this._generateFilename();
            
            try {
                let dataURL;
                
                if (resolution > 1 && this._canRerenderAtHighRes(canvas)) {
                    // Try to trigger high-res re-render for p5.js/Three.js
                    dataURL = this._getHighResCanvas(canvas, resolution);
                } else if (resolution > 1) {
                    // Fallback: vector-aware scaling for better quality
                    const scaledCanvas = document.createElement('canvas');
                    const ctx = scaledCanvas.getContext('2d');
                    
                    scaledCanvas.width = canvas.width * resolution;
                    scaledCanvas.height = canvas.height * resolution;
                    
                    // Use better interpolation
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                    
                    dataURL = scaledCanvas.toDataURL('image/png');
                } else {
                    dataURL = canvas.toDataURL('image/png');
                }
                
                this._downloadImage(dataURL, filename);
                console.log('Chatooly: Canvas exported at ' + resolution + 'x resolution');
                
            } catch (error) {
                console.error('Chatooly: Canvas export failed:', error);
                alert('Export failed. This might be due to CORS restrictions.');
            }
        },
        
        _canRerenderAtHighRes: function(canvas) {
            // Check if we can detect p5.js or Three.js for native high-res rendering
            return window.p5 || window.THREE || canvas.id === 'defaultCanvas0';
        },
        
        _getHighResCanvas: function(canvas, resolution) {
            // For p5.js: temporarily increase pixel density
            if (window.p5 && window.pixelDensity) {
                const originalDensity = window.pixelDensity();
                window.pixelDensity(resolution);
                window.redraw();
                const dataURL = canvas.toDataURL('image/png');
                window.pixelDensity(originalDensity);
                return dataURL;
            }
            
            // For Three.js: look for global renderer variables
            if (window.THREE && (window.renderer || window.threeRenderer)) {
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
            }
            
            // Fallback to scaling
            const scaledCanvas = document.createElement('canvas');
            const ctx = scaledCanvas.getContext('2d');
            scaledCanvas.width = canvas.width * resolution;
            scaledCanvas.height = canvas.height * resolution;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
            return scaledCanvas.toDataURL('image/png');
        },
        
        _exportDOM: function(element, options) {
            const filename = options.filename || this._generateFilename();
            
            // Check if html2canvas is available, if not load it
            if (typeof html2canvas === 'undefined') {
                this._loadHtml2Canvas().then(() => {
                    this._captureDOM(element, filename, options);
                }).catch(error => {
                    console.error('Chatooly: Failed to load html2canvas:', error);
                    alert('Export failed: Could not load required library');
                });
            } else {
                this._captureDOM(element, filename, options);
            }
        },
        
        _captureDOM: function(element, filename, options) {
            const resolution = options.resolution || this.config.resolution || 2;
            
            html2canvas(element, {
                scale: resolution,
                useCORS: true,
                allowTaint: false,
                backgroundColor: null
            }).then(canvas => {
                const dataURL = canvas.toDataURL('image/png');
                this._downloadImage(dataURL, filename);
                console.log('Chatooly: DOM exported successfully');
            }).catch(error => {
                console.error('Chatooly: DOM export failed:', error);
                alert('Export failed. Try exporting a specific element.');
            });
        },
        
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
        },
        
        _downloadImage: function(dataURL, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        
        _generateFilename: function() {
            const toolName = this.config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const timestamp = new Date().toISOString().slice(0, 10);
            return `${toolName}-export-${timestamp}.png`;
        },
        
        _createExportButton: function() {
            // Remove existing button if any
            const existingButton = document.getElementById('chatooly-export-btn');
            if (existingButton) {
                existingButton.remove();
            }
            
            // Create export button
            const button = document.createElement('div');
            button.id = 'chatooly-export-btn';
            button.innerHTML = `
                <div class="chatooly-btn-main">📥</div>
                <div class="chatooly-btn-menu" style="display: none;">
                    <button onclick="Chatooly.export('png', {resolution: 1})">1x PNG</button>
                    <button onclick="Chatooly.export('png', {resolution: 2})">2x PNG</button>
                    <button onclick="Chatooly.export('png', {resolution: 4})">4x PNG</button>
                    ${this._isDevelopment() ? '<button onclick="Chatooly.publish()">📤 Publish</button>' : ''}
                </div>
            `;
            
            // Add styles
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            `;
            
            // Add button styles
            const style = document.createElement('style');
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
                }
                
                #chatooly-export-btn .chatooly-btn-main:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
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
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:hover {
                    background: #f8f9fa;
                }
            `;
            document.head.appendChild(style);
            
            // Add click handlers
            const mainBtn = button.querySelector('.chatooly-btn-main');
            const menu = button.querySelector('.chatooly-btn-menu');
            
            mainBtn.addEventListener('click', () => {
                const isVisible = menu.style.display !== 'none';
                menu.style.display = isVisible ? 'none' : 'block';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!button.contains(e.target)) {
                    menu.style.display = 'none';
                }
            });
            
            document.body.appendChild(button);
        },
        
        _detectDevelopmentMode: function() {
            const isDev = this._isDevelopment();
            if (isDev) {
                console.log('Chatooly: Development mode detected - publish functionality enabled');
            }
        },
        
        _isDevelopment: function() {
            return location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1' || 
                   location.protocol === 'file:';
        }
    };
    
    // Auto-initialize if config is provided
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            // Initialize with defaults
            Chatooly.init();
        }
    });
    
    // Also try to initialize immediately if DOM is already loaded
    if (document.readyState === 'loading') {
        // DOM is still loading, wait for DOMContentLoaded
    } else {
        // DOM is already loaded
        setTimeout(() => {
            if (window.ChatoolyConfig) {
                Chatooly.init(window.ChatoolyConfig);
            } else {
                Chatooly.init();
            }
        }, 100);
    }
    
})();