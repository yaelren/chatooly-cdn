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
    
})(window.Chatooly);