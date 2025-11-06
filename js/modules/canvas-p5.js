/**
 * Chatooly CDN - p5.js Canvas Export Module
 * Handles multiple export formats for p5.js canvas elements
 */

(function(Chatooly) {
    'use strict';
    
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
    
})(window.Chatooly);