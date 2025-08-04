/**
 * Chatooly CDN - Three.js Canvas Export Module
 * Handles multiple export formats for Three.js canvas elements
 */

(function(Chatooly) {
    'use strict';
    
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
    
})(window.Chatooly);