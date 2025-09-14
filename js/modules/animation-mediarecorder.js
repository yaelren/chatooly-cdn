
(function(Chatooly) {
    'use strict';

    /**
     * Chatooly CDN - MediaRecorder Animation Module
     * Client-side animation recording using MediaRecorder API
     * Replaces CCAPTURE functionality with native browser APIs
     * 
     */

    Chatooly.animationMediaRecorder = {
        // Animation state management
        mediaRecorder: null,
        recordedChunks: [],
        isRecording: false,
        recordingState: 'idle', // idle, starting, recording, stopping
        toolInfo: null,
        recordingCanvas: null,
        recordingCtx: null,
        drawingInterval: null,
        currentFileExtension: 'mp4',
        
        // Initialize animation detection and export capabilities
        init: function() {
            this.toolInfo = this.detectToolType();
            console.log('🎬 MediaRecorder Animation module initialized:', this.toolInfo);
        },
        
        // Smart tool type detection (same as CCAPTURE module)
        detectToolType: function() {
            const canvas = document.getElementById('chatooly-canvas');
            if (!canvas) {
                return { type: 'static', framework: 'none', reason: 'No chatooly-canvas found' };
            }
            
            // p5.js detection
            if (window.p5 && typeof window.setup === 'function' && typeof window.draw === 'function') {
                return { 
                    type: 'animated', 
                    framework: 'p5js',
                    canvas: canvas,
                    reason: 'p5.js globals and draw() function detected'
                };
            }
            
            // Three.js detection
            if (window.THREE) {
                return { 
                    type: 'animated', 
                    framework: 'threejs',
                    canvas: canvas,
                    reason: 'THREE.js library detected'
                };
            }
            
            // Canvas API animation detection
            if (canvas && canvas.getContext) {
                // Look for common animation patterns
                const hasRequestAnimationFrame = window.requestAnimationFrame && 
                    document.body.innerHTML.includes('requestAnimationFrame');
                
                if (hasRequestAnimationFrame) {
                    return { 
                        type: 'animated', 
                        framework: 'canvas',
                        canvas: canvas,
                        reason: 'Canvas with requestAnimationFrame detected'
                    };
                }
            }
            
            return { 
                type: 'static', 
                framework: 'none',
                canvas: canvas,
                reason: 'No animation framework detected'
            };
        },
        
        // Show animation export dialog (moved to UI module)
        showExportDialog: function() {
            // Delegate to UI module
            if (Chatooly.ui && Chatooly.ui.showVideoExportDialog) {
                Chatooly.ui.showVideoExportDialog();
            }
        },
        
        // Start recording
        startRecording: function() {
            const duration = parseFloat(document.getElementById('anim-duration').value);
            const fps = parseInt(document.getElementById('anim-fps').value);
            const format = document.getElementById('anim-format').value;
            
            // Get quality settings with fallbacks
            const qualityElement = document.getElementById('anim-quality');
            const quality = qualityElement ? qualityElement.value : 'medium';
            
            const bitrateElement = document.getElementById('anim-bitrate');
            const customBitrate = bitrateElement ? parseFloat(bitrateElement.value) : 8;
            
            console.log(`🎬 Starting ${duration}s recording at ${fps} FPS in ${format} format with ${quality} quality`);
            
            try {
                this.initializeMediaRecorder(fps, format, quality, customBitrate);
                this.beginRecording(duration);
            } catch (error) {
                console.error('Failed to start MediaRecorder:', error);
                alert('Failed to start recording. Please try again.');
            }
        },
        
        // Initialize MediaRecorder with settings
        initializeMediaRecorder: function(fps, format, quality, customBitrate) {
            const canvas = this.toolInfo.canvas;
            if (!canvas) {
                throw new Error('No canvas found for recording');
            }
            
            // Create recording canvas
            this.recordingCanvas = document.createElement('canvas');
            this.recordingCtx = this.recordingCanvas.getContext('2d');
            
            // Set canvas size to match source canvas with higher scale for quality
            const scaleFactor = 3; // Increased scale for better quality
            this.recordingCanvas.width = canvas.width * scaleFactor;
            this.recordingCanvas.height = canvas.height * scaleFactor;
            this.recordingCtx.scale(scaleFactor, scaleFactor);
            
            // Configure high-quality rendering settings
            this.recordingCtx.imageSmoothingEnabled = false; // Disable smoothing to prevent blur
            this.recordingCtx.globalCompositeOperation = 'source-over';
            
            // Set pixel-perfect rendering
            this.recordingCanvas.style.imageRendering = 'pixelated';
            this.recordingCanvas.style.imageRendering = '-moz-crisp-edges';
            this.recordingCanvas.style.imageRendering = 'crisp-edges';
            
            // Get stream from canvas at specified fps
            const stream = this.recordingCanvas.captureStream(fps);
            
            // Smart codec selection based on user choice
            let mimeType, fileExtension;
            
            if (format === 'auto') {
                // Auto-detect best available format (priority order)
                const formatPriority = [
                    { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4', name: 'MP4 H.264' },
                    { mime: 'video/webm;codecs=vp9', ext: 'webm', name: 'WebM VP9' },
                    { mime: 'video/webm;codecs=vp8', ext: 'webm', name: 'WebM VP8' },
                    { mime: 'video/webm', ext: 'webm', name: 'WebM Default' },
                    { mime: 'video/mp4', ext: 'mp4', name: 'MP4 Default' }
                ];
                
                for (const fmt of formatPriority) {
                    if (MediaRecorder.isTypeSupported(fmt.mime)) {
                        mimeType = fmt.mime;
                        fileExtension = fmt.ext;
                        console.log(`Auto-detected best format: ${fmt.name} (${fmt.mime})`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('No supported video formats found in this browser');
                }
                
            } else if (format === 'mp4') {
                // Try MP4 codecs first
                const compatibleMP4Codecs = [
                    'video/mp4;codecs=avc1.42E01E',
                    'video/mp4;codecs=avc1.42001E',
                    'video/mp4;codecs=h264,aac',
                    'video/mp4;codecs=h264',
                    'video/mp4'
                ];
                
                for (const codec of compatibleMP4Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'mp4';
                        console.log(`Using MP4 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('MP4 format not supported in this browser');
                }
                
            } else if (format === 'webm-vp9') {
                // Try WebM VP9 codecs
                const webmVP9Codecs = [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp9',
                    'video/webm'
                ];
                
                for (const codec of webmVP9Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM VP9 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM VP9 format not supported in this browser');
                }
                
            } else if (format === 'webm-vp8') {
                // Try WebM VP8 codecs
                const webmVP8Codecs = [
                    'video/webm;codecs=vp8,opus',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];
                
                for (const codec of webmVP8Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM VP8 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM VP8 format not supported in this browser');
                }
                
            } else if (format === 'webm-h264') {
                // Try WebM H.264 codecs (Chrome only)
                const webmH264Codecs = [
                    'video/webm;codecs=h264,opus',
                    'video/webm;codecs=h264',
                    'video/webm'
                ];
                
                for (const codec of webmH264Codecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'webm';
                        console.log(`Using WebM H.264 codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('WebM H.264 format not supported in this browser');
                }
                
            } else if (format === 'mkv') {
                // Try MKV/Matroska codecs (Chrome only)
                const mkvCodecs = [
                    'video/x-matroska;codecs=avc1',
                    'video/x-matroska'
                ];
                
                for (const codec of mkvCodecs) {
                    if (MediaRecorder.isTypeSupported(codec)) {
                        mimeType = codec;
                        fileExtension = 'mkv';
                        console.log(`Using MKV codec: ${codec}`);
                        break;
                    }
                }
                
                if (!mimeType) {
                    throw new Error('MKV format not supported in this browser');
                }
            }
            
            this.currentFileExtension = fileExtension;
            
            // Calculate bitrate based on quality setting
            let bitrate;
            switch (quality) {
                case 'high':
                    bitrate = 12000000; // 12 Mbps
                    break;
                case 'medium':
                    bitrate = 8000000; // 8 Mbps
                    break;
                case 'standard':
                    bitrate = 6000000; // 6 Mbps
                    break;
                case 'low':
                    bitrate = 3000000; // 3 Mbps
                    break;
                case 'custom':
                    bitrate = (customBitrate || 8) * 1000000; // Convert Mbps to bps
                    break;
                default:
                    bitrate = 8000000; // Default to 8 Mbps
            }
            
            // Setup MediaRecorder
            const recordingOptions = {
                mimeType: mimeType,
                videoBitsPerSecond: bitrate
            };
            
            this.mediaRecorder = new MediaRecorder(stream, recordingOptions);
            this.recordedChunks = [];
            
            // Handle data available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            // Handle recording stop
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                this.cleanup();
            };
            
            console.log('📹 MediaRecorder initialized:', {
                format: fileExtension,
                framerate: fps,
                canvas: canvas,
                mimeType: mimeType,
                videoBitrate: bitrate,
                quality: quality,
                scaleFactor: 3
            });
        },
        
        // Begin the recording process
        beginRecording: function(duration) {
            if (!this.mediaRecorder) {
                console.error('MediaRecorder not initialized');
                return;
            }
            
            this.recordingState = 'starting';
            this.isRecording = true;
            
            // Start recording
            this.mediaRecorder.start();
            
            // Update UI to show recording state
            this.updateRecordingUI();
            
            // Set up frame capture based on framework
            this.setupFrameCapture();
            
            // Set up automatic stop after duration
            setTimeout(() => {
                this.stopRecording();
            }, duration * 1000);
            
            console.log('🎬 Recording started');
        },
        
        // Set up frame capture based on detected framework
        setupFrameCapture: function() {
            const framework = this.toolInfo.framework;
            
            if (framework === 'p5js') {
                this.setupP5Capture();
            } else if (framework === 'threejs') {
                this.setupThreeJSCapture();
            } else if (framework === 'canvas') {
                this.setupCanvasCapture();
            } else {
                console.warn('Unknown framework, using generic capture');
                this.setupGenericCapture();
            }
        },
        
        // Setup capture for p5.js
        setupP5Capture: function() {
            console.log('🎯 Setting up p5.js MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Setup capture for Three.js
        setupThreeJSCapture: function() {
            console.log('🎯 Setting up Three.js MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Setup capture for Canvas API
        setupCanvasCapture: function() {
            console.log('🎯 Setting up Canvas API MediaRecorder capture');
            
            // Start canvas drawing loop at 60fps
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 60); // 60 FPS
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Generic capture setup
        setupGenericCapture: function() {
            console.log('🎯 Setting up generic MediaRecorder capture');
            
            // Use a polling approach for unknown frameworks
            this.drawingInterval = setInterval(() => {
                this.captureCanvasToRecordingCanvas();
            }, 1000 / 30); // 30 FPS polling
            
            // Store cleanup function
            this.cleanupCapture = () => {
                if (this.drawingInterval) {
                    clearInterval(this.drawingInterval);
                    this.drawingInterval = null;
                }
            };
        },
        
        // Capture canvas to recording canvas (unified approach)
        captureCanvasToRecordingCanvas: function() {
            try {
                const sourceCanvas = this.toolInfo.canvas;
                if (!sourceCanvas) return;
                
                // Save current context state
                this.recordingCtx.save();
                
                // Reset any transformations to ensure clean capture
                this.recordingCtx.setTransform(3, 0, 0, 3, 0, 0); // Apply scale directly
                
                // Clear recording canvas with exact background color
                this.recordingCtx.fillStyle = '#1a1a1a';
                this.recordingCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
                
                // Configure for pixel-perfect capture
                this.recordingCtx.imageSmoothingEnabled = false;
                this.recordingCtx.globalCompositeOperation = 'source-over';
                
                // Draw source canvas with exact pixel mapping
                if (sourceCanvas.width > 0 && sourceCanvas.height > 0) {
                    // Use integer coordinates and exact dimensions
                    this.recordingCtx.drawImage(
                        sourceCanvas,
                        0, 0, sourceCanvas.width, sourceCanvas.height,  // source
                        0, 0, sourceCanvas.width, sourceCanvas.height   // destination
                    );
                }
                
                // Restore context state
                this.recordingCtx.restore();
                
            } catch (error) {
                console.error('❌ Error capturing canvas:', error);
            }
        },
        
        // Stop recording and download
        stopRecording: function() {
            if (!this.mediaRecorder || !this.isRecording) {
                return;
            }
            
            this.recordingState = 'stopping';
            console.log('🛑 Stopping recording...');
            
            // Stop recording
            this.mediaRecorder.stop();
        },
        
        // Save the recorded animation
        saveRecording: function() {
            try {
                // Create blob with correct MIME type
                let blobMimeType;
                if (this.currentFileExtension === 'mp4') {
                    blobMimeType = 'video/mp4';
                } else if (this.currentFileExtension === 'webm') {
                    blobMimeType = 'video/webm';
                } else if (this.currentFileExtension === 'mkv') {
                    blobMimeType = 'video/x-matroska';
                } else {
                    blobMimeType = 'video/webm'; // fallback
                }
                
                const blob = new Blob(this.recordedChunks, { type: blobMimeType });
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animation-${Date.now()}.${this.currentFileExtension}`;
                
                // Trigger download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Clean up
                URL.revokeObjectURL(url);
                this.recordedChunks = [];
                
                console.log(`✅ Animation saved as ${this.currentFileExtension.toUpperCase()}`);
                
            } catch (error) {
                console.error('❌ Error saving recording:', error);
                alert('Error saving recording: ' + error.message);
            }
        },
        
        // Clean up after recording
        cleanup: function() {
            // Stop frame capture
            if (this.cleanupCapture) {
                this.cleanupCapture();
                this.cleanupCapture = null;
            }
            
            this.mediaRecorder = null;
            this.isRecording = false;
            this.recordingState = 'idle';
            this.recordingCanvas = null;
            this.recordingCtx = null;
            
            // Reset UI
            this.resetRecordingUI();
            this.closeExportDialog();
            
            console.log('🧹 Recording cleanup completed');
        },
        
        // Update UI during recording
        updateRecordingUI: function() {
            const startBtn = document.querySelector('.chatooly-btn-primary');
            if (startBtn) {
                startBtn.textContent = 'Exporting...';
                startBtn.disabled = true;
                startBtn.style.opacity = '0.6';
            }
            
            // Add recording indicator with Chatooly CSS styling
            const indicator = document.createElement('div');
            indicator.className = 'chatooly-export-indicator';
            indicator.innerHTML = '📤 Exporting...';
            indicator.style.cssText = `
                position: fixed;
                top: var(--chatooly-spacing-4, 20px);
                right: var(--chatooly-spacing-4, 20px);
                background: var(--chatooly-color-primary, #007acc);
                color: var(--chatooly-color-text-inverse, white);
                padding: var(--chatooly-spacing-3, 12px) var(--chatooly-spacing-4, 16px);
                border-radius: var(--chatooly-border-radius-lg, 20px);
                font-size: var(--chatooly-font-size-sm, 14px);
                font-weight: var(--chatooly-font-weight-semibold, 600);
                font-family: var(--chatooly-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
                box-shadow: var(--chatooly-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
                z-index: 100000;
                animation: chatooly-pulse 1.5s ease-in-out infinite;
            `;
            
            // Add pulse animation keyframes if not already added
            if (!document.querySelector('#chatooly-export-animation')) {
                const style = document.createElement('style');
                style.id = 'chatooly-export-animation';
                style.textContent = `
                    @keyframes chatooly-pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.05); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(indicator);
        },
        
        // Reset UI after recording
        resetRecordingUI: function() {
            const startBtn = document.querySelector('.chatooly-btn-primary');
            if (startBtn) {
                startBtn.textContent = 'Export';
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            }
            
            // Remove export indicator
            const indicator = document.querySelector('.chatooly-export-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    };

})(window.Chatooly);
