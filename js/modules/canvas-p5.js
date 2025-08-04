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
    
})(window.Chatooly);