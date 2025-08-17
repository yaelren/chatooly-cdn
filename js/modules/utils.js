/**
 * Chatooly CDN - Utilities Module
 * Contains utility functions for target detection, environment checks, and helpers
 */

(function(Chatooly) {
    'use strict';
    
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
    
})(window.Chatooly);