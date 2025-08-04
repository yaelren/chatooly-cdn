/**
 * Chatooly CDN - DOM Export Module
 * Handles multiple export formats for DOM elements using html2canvas
 */

(function(Chatooly) {
    'use strict';
    
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
    
})(window.Chatooly);