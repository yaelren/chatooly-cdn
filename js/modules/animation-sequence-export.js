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
                const frames = [];

                // Create export canvas for alpha preservation
                this.exportCanvas = document.createElement('canvas');
                this.exportCtx = this.exportCanvas.getContext('2d', { alpha: true });
                this.exportCanvas.width = sourceCanvas.width;
                this.exportCanvas.height = sourceCanvas.height;

                // Show export indicator
                this._showExportIndicator('Capturing frames...');

                // Capture frames
                for (let frame = 0; frame < totalFrames; frame++) {
                    this._updateExportIndicator(`Frame ${frame + 1}/${totalFrames}`);

                    // Clear with transparency
                    this.exportCtx.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

                    // Copy current frame from source canvas
                    this.exportCtx.drawImage(sourceCanvas, 0, 0);

                    // Capture as PNG with alpha
                    const dataURL = this.exportCanvas.toDataURL('image/png');
                    frames.push(dataURL);

                    // Small delay for browser processing
                    await this._delay(frameInterval);
                }

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
            indicator.innerHTML = `○ ${message}`;
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #000000;
                border: 2px solid #ffffff;
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
                    @keyframes chatoolyPulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.02); }
                    }
                    .chatooly-export-indicator {
                        animation: chatoolyPulse 2s ease-in-out infinite !important;
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
            const indicator = document.querySelector('.chatooly-export-indicator');
            if (indicator) {
                indicator.innerHTML = `○ ${message}`;
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
