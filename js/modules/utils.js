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
            
            // 2. Look for Chatooly export container first
            const chatoolyCanvas = document.querySelector('#chatooly-canvas');
            if (chatoolyCanvas) {
                return { type: 'dom', element: chatoolyCanvas };
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
        }
    };
    
})(window.Chatooly);