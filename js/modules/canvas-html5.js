/**
 * Chatooly CDN - HTML5 Canvas Export Module
 * Handles multiple export formats for standard HTML5 canvas elements
 */

(function(Chatooly) {
    'use strict';
    
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
                        // Create scaled version for higher resolution
                        const scaledCanvas = document.createElement('canvas');
                        const ctx = scaledCanvas.getContext('2d');
                        
                        scaledCanvas.width = canvas.width * resolution;
                        scaledCanvas.height = canvas.height * resolution;
                        
                        // Use high-quality interpolation
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                        
                        dataURL = scaledCanvas.toDataURL('image/png');
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
    
})(window.Chatooly);