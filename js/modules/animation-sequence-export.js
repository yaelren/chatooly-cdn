/**
 * Chatooly CDN - Animation Sequence Export Module
 * High-quality PNG sequence export with alpha channel support
 * Creates frame-by-frame captures for professional video editing workflows
 */

(function(Chatooly) {
    'use strict';

    Chatooly.animationSequenceExport = {
        // Export state
        isExporting: false,
        exportCanvas: null,
        exportCtx: null,
        captureInterval: null,

        /**
         * Export animation as PNG sequence
         * @param {number} duration - Duration in seconds
         * @param {number} fps - Frame rate (24, 30, or 60)
         */
        exportSequence: async function(duration, fps) {
            if (this.isExporting) {
                console.warn('🎬 Sequence export already in progress');
                return;
            }

            this.isExporting = true;

            try {
                // Get canvas from animationMediaRecorder detection
                const toolInfo = Chatooly.animationMediaRecorder
                    ? Chatooly.animationMediaRecorder.detectToolType()
                    : this._detectCanvas();

                const sourceCanvas = toolInfo.canvas || toolInfo.element;

                if (!sourceCanvas) {
                    throw new Error('No canvas found for sequence export');
                }

                console.log(`🎬 Starting PNG sequence export: ${duration}s at ${fps} FPS`);

                // Calculate frames
                const totalFrames = Math.ceil(duration * fps);
                const frameInterval = 1000 / fps; // ms between frames

                // Create export canvas for alpha preservation
                this.exportCanvas = document.createElement('canvas');
                this.exportCtx = this.exportCanvas.getContext('2d', { alpha: true });
                this.exportCanvas.width = sourceCanvas.width;
                this.exportCanvas.height = sourceCanvas.height;

                // Show export indicator
                this._showExportIndicator('Capturing frames...');

                // Capture frames using requestAnimationFrame for non-blocking capture
                const frames = await this._captureFramesNonBlocking(
                    sourceCanvas,
                    totalFrames,
                    frameInterval
                );

                // Create ZIP file
                this._updateExportIndicator('Creating ZIP...');

                await this._createZipArchive(frames, fps, duration, sourceCanvas.width, sourceCanvas.height);

                console.log(`✅ PNG sequence exported: ${totalFrames} frames`);

                this._hideExportIndicator();

                setTimeout(() => {
                    alert(`PNG sequence exported successfully!\n${totalFrames} frames at ${fps} FPS\nAlpha channel preserved for transparency.`);
                }, 100);

            } catch (error) {
                console.error('❌ PNG sequence export failed:', error);
                this._hideExportIndicator();
                alert(`PNG sequence export failed: ${error.message}\n\nTry using video export instead.`);
            } finally {
                // Cleanup
                this.exportCanvas = null;
                this.exportCtx = null;
                this.isExporting = false;
            }
        },

        /**
         * Capture frames using requestAnimationFrame for non-blocking operation
         * This allows mouse events and animations to continue smoothly during export
         */
        _captureFramesNonBlocking: function(sourceCanvas, totalFrames, frameInterval) {
            const self = this;
            const frames = [];
            let frameCount = 0;
            let lastCaptureTime = 0;
            const startTime = performance.now();

            return new Promise((resolve) => {
                function captureFrame(currentTime) {
                    // Check if we've captured enough frames
                    if (frameCount >= totalFrames) {
                        resolve(frames);
                        return;
                    }

                    // Calculate if it's time to capture based on elapsed time
                    const elapsedTime = currentTime - startTime;
                    const expectedFrame = Math.floor(elapsedTime / frameInterval);

                    // Capture frame if we're at or past the expected frame time
                    if (expectedFrame > frameCount || frameCount === 0) {
                        // Update progress indicator
                        self._updateExportIndicator(`Frame ${frameCount + 1}/${totalFrames}`);

                        // Clear with transparency
                        self.exportCtx.clearRect(0, 0, self.exportCanvas.width, self.exportCanvas.height);

                        // Copy current frame from source canvas
                        self.exportCtx.drawImage(sourceCanvas, 0, 0);

                        // Capture as PNG with alpha
                        const dataURL = self.exportCanvas.toDataURL('image/png');
                        frames.push(dataURL);

                        frameCount++;
                        lastCaptureTime = currentTime;
                    }

                    // Continue capturing on next animation frame
                    requestAnimationFrame(captureFrame);
                }

                // Start the capture loop
                requestAnimationFrame(captureFrame);
            });
        },

        /**
         * Create ZIP archive with frames and metadata
         */
        _createZipArchive: async function(frames, fps, duration, width, height) {
            // Load JSZip from CDN if not available
            if (typeof JSZip === 'undefined') {
                await this._loadJSZip();
            }

            const zip = new JSZip();
            const timestamp = Date.now();
            const folderName = `chatooly-sequence-${timestamp}`;
            const folder = zip.folder(folderName);

            // Add frames
            frames.forEach((frameData, index) => {
                const frameNumber = String(index + 1).padStart(4, '0');
                const fileName = `frame_${frameNumber}.png`;
                const base64Data = frameData.split(',')[1];
                folder.file(fileName, base64Data, { base64: true });
            });

            // Add README
            const readmeContent = `Chatooly PNG Sequence Export
Generated: ${new Date().toISOString()}
Frames: ${frames.length}
Duration: ${duration}s
Frame Rate: ${fps} FPS
Canvas Size: ${width} × ${height}px
Alpha Channel: Preserved

This sequence contains PNG files with full alpha transparency support.
Import into video editing software (After Effects, Premiere, etc.) as image sequence.

Frame naming: frame_0001.png, frame_0002.png, etc.
`;
            folder.file('README.txt', readmeContent);

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.download = `${folderName}.zip`;
            link.href = url;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },

        /**
         * Load JSZip library from CDN
         */
        _loadJSZip: function() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = () => {
                    console.log('✅ JSZip loaded from CDN');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load JSZip library'));
                };
                document.head.appendChild(script);
            });
        },

        /**
         * Detect canvas element (fallback if animationMediaRecorder not available)
         */
        _detectCanvas: function() {
            const canvas = document.getElementById('chatooly-canvas');
            if (canvas && canvas.tagName === 'CANVAS') {
                return { canvas: canvas, type: 'canvas' };
            }

            const canvases = document.querySelectorAll('canvas');
            if (canvases.length > 0) {
                return { canvas: canvases[0], type: 'canvas' };
            }

            return { canvas: null, type: 'none' };
        },

        /**
         * Delay helper
         */
        _delay: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Show export progress indicator
         */
        _showExportIndicator: function(message) {
            // Remove existing indicator if any
            this._hideExportIndicator();

            const indicator = document.createElement('div');
            indicator.className = 'chatooly-export-indicator';
            indicator.innerHTML = `
                <div style="font-family: 'VT323', monospace; font-size: 14px; color: #6D736C; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    PNG SEQUENCE
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="chatooly-record-dot"></div>
                    <span style="font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 500; color: #000000;" id="chatooly-progress-text">
                        ${message}
                    </span>
                </div>
            `;
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--chatooly-color-primary, #d9e5d7);
                border-radius: 5px;
                padding: 15px;
                min-width: 200px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 100000;
                animation: chatoolySlideIn 0.3s ease-out;
            `;

            // Add animation keyframes if not already added
            if (!document.querySelector('#chatooly-sequence-export-animation')) {
                const style = document.createElement('style');
                style.id = 'chatooly-sequence-export-animation';
                style.textContent = `
                    @keyframes chatoolySlideIn {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    @keyframes chatoolyRecordPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                    .chatooly-record-dot {
                        width: 8px;
                        height: 8px;
                        background: #dc3545;
                        border-radius: 50%;
                        animation: chatoolyRecordPulse 1.5s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(indicator);
        },

        /**
         * Update export indicator text
         */
        _updateExportIndicator: function(message) {
            const progressText = document.getElementById('chatooly-progress-text');
            if (progressText) {
                progressText.textContent = message;
            }
        },

        /**
         * Hide export indicator
         */
        _hideExportIndicator: function() {
            const indicator = document.querySelector('.chatooly-export-indicator');
            if (indicator) {
                indicator.style.animation = 'none';
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateX(100%)';
                indicator.style.transition = 'all 0.3s ease-out';
                setTimeout(() => indicator.remove(), 300);
            }
        }
    };

})(window.Chatooly);
