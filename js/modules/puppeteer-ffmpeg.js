(function(Chatooly) {
    'use strict';

    /**
     * Chatooly CDN - Puppeteer FFmpeg Export Module
     * Server-side high-resolution export using Puppeteer and FFmpeg
     * Provides transparent PNG sequences and MP4 exports
     * 
     * This module is experimental and runs separately from MediaRecorder
     */

    Chatooly.puppeteerFFmpeg = {
        // Configuration
        config: {
            serverEndpoint: '/api/puppeteer-export', // Default endpoint
            defaultResolution: 4, // 4x resolution multiplier
            defaultFPS: 30,
            supportedFormats: ['png-sequence', 'mp4', 'webm'],
            timeout: 30000 // 30 seconds timeout
        },
        
        // Export state
        isExporting: false,
        currentExportId: null,
        
        // Initialize the module
        init: function(options) {
            if (options) {
                this.config = Object.assign(this.config, options);
            }
            console.log('🎬 Puppeteer FFmpeg module initialized:', this.config);
        },
        
        // Main export function
        export: function(options) {
            options = options || {};
            
            if (this.isExporting) {
                console.warn('Chatooly Puppeteer: Export already in progress');
                return Promise.reject(new Error('Export already in progress'));
            }
            
            // Validate options
            const exportOptions = this.validateOptions(options);
            
            // Generate unique export ID
            this.currentExportId = this.generateExportId();
            
            console.log('🎬 Starting Puppeteer FFmpeg export:', exportOptions);
            
            return this.performExport(exportOptions);
        },
        
        // Validate and set default options
        validateOptions: function(options) {
            const validated = {
                format: options.format || 'png-sequence',
                resolution: options.resolution || this.config.defaultResolution,
                fps: options.fps || this.config.defaultFPS,
                duration: options.duration || 5, // seconds
                quality: options.quality || 'high',
                transparent: options.transparent !== false, // default true
                filename: options.filename || this.generateFilename(),
                serverEndpoint: options.serverEndpoint || this.config.serverEndpoint
            };
            
            // Validate format
            if (!this.config.supportedFormats.includes(validated.format)) {
                throw new Error(`Unsupported format: ${validated.format}. Supported: ${this.config.supportedFormats.join(', ')}`);
            }
            
            // Validate resolution
            if (validated.resolution < 1 || validated.resolution > 8) {
                console.warn('Resolution should be between 1-8x, clamping to 4x');
                validated.resolution = Math.max(1, Math.min(8, validated.resolution));
            }
            
            return validated;
        },
        
        // Perform the actual export
        performExport: function(options) {
            this.isExporting = true;
            
            // Prepare export data
            const exportData = {
                id: this.currentExportId,
                format: options.format,
                resolution: options.resolution,
                fps: options.fps,
                duration: options.duration,
                quality: options.quality,
                transparent: options.transparent,
                filename: options.filename,
                canvasData: this.captureCanvasData(),
                pageUrl: window.location.href,
                timestamp: Date.now()
            };
            
            // Send to server
            return this.sendToServer(exportData, options.serverEndpoint)
                .then(response => {
                    this.isExporting = false;
                    this.currentExportId = null;
                    console.log('✅ Puppeteer FFmpeg export completed:', response);
                    return response;
                })
                .catch(error => {
                    this.isExporting = false;
                    this.currentExportId = null;
                    console.error('❌ Puppeteer FFmpeg export failed:', error);
                    throw error;
                });
        },
        
        // Capture current canvas state and page information
        captureCanvasData: function() {
            const target = Chatooly.utils.detectExportTarget();
            
            if (!target) {
                throw new Error('No export target found');
            }
            
            const canvasData = {
                type: target.type,
                elementId: target.element.id || 'chatooly-canvas',
                dimensions: {
                    width: target.element.width || target.element.offsetWidth,
                    height: target.element.height || target.element.offsetHeight
                },
                styles: this.getElementStyles(target.element),
                content: target.type === 'canvas' ? target.element.toDataURL('image/png') : null
            };
            
            // Add framework-specific data
            if (window.p5) {
                canvasData.framework = 'p5js';
                canvasData.p5Info = this.getP5Info();
            } else if (window.THREE) {
                canvasData.framework = 'threejs';
                canvasData.threeInfo = this.getThreeJSInfo();
            } else {
                canvasData.framework = 'html5';
            }
            
            return canvasData;
        },
        
        // Get element styles for accurate rendering
        getElementStyles: function(element) {
            const computedStyle = window.getComputedStyle(element);
            return {
                backgroundColor: computedStyle.backgroundColor,
                backgroundImage: computedStyle.backgroundImage,
                transform: computedStyle.transform,
                filter: computedStyle.filter,
                opacity: computedStyle.opacity,
                zIndex: computedStyle.zIndex
            };
        },
        
        // Get p5.js specific information
        getP5Info: function() {
            if (!window.p5 || !window.p5.instance) return null;
            
            const p5 = window.p5.instance;
            return {
                canvas: p5.canvas ? {
                    width: p5.canvas.width,
                    height: p5.canvas.height
                } : null,
                frameCount: p5.frameCount,
                frameRate: p5.frameRate(),
                isLooping: p5.isLooping()
            };
        },
        
        // Get Three.js specific information
        getThreeJSInfo: function() {
            if (!window.THREE) return null;
            
            // Try to find Three.js scene and renderer
            const canvas = document.querySelector('canvas');
            if (!canvas) return null;
            
            return {
                canvas: {
                    width: canvas.width,
                    height: canvas.height
                },
                hasWebGL: !!canvas.getContext('webgl') || !!canvas.getContext('webgl2')
            };
        },
        
        // Send export data to server
        sendToServer: function(exportData, endpoint) {
            return fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                return data;
            });
        },
        
        // Generate unique export ID
        generateExportId: function() {
            return 'export_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // Generate filename
        generateFilename: function() {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            return `chatooly-export-${timestamp}`;
        },
        
        // Check export status
        getStatus: function() {
            return {
                isExporting: this.isExporting,
                currentExportId: this.currentExportId,
                config: this.config
            };
        },
        
        // Cancel current export
        cancel: function() {
            if (!this.isExporting) {
                console.warn('No export in progress to cancel');
                return;
            }
            
            console.log('Cancelling Puppeteer FFmpeg export...');
            this.isExporting = false;
            this.currentExportId = null;
        },
        
        // Test server connection
        testConnection: function(endpoint) {
            endpoint = endpoint || this.config.serverEndpoint;
            
            return fetch(endpoint + '/test', {
                method: 'GET'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Connection test failed: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Puppeteer FFmpeg server connection successful:', data);
                return data;
            })
            .catch(error => {
                console.error('❌ Puppeteer FFmpeg server connection failed:', error);
                throw error;
            });
        }
    };

})(window.Chatooly);
