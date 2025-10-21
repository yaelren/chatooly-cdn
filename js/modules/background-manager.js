/**
 * Chatooly CDN - Background Manager Module
 * Framework-agnostic background management for canvas tools
 * Handles: color, transparency, images, and fit modes
 */

(function(Chatooly) {
    'use strict';

    Chatooly.backgroundManager = {
        // Background state
        state: {
            bgColor: '#FFFFFF',
            bgTransparent: false,
            bgImage: null,
            bgImageURL: null,
            bgFit: 'cover' // 'cover', 'contain', 'fill'
        },

        // Canvas element reference
        canvas: null,

        /**
         * Initialize background manager with canvas element
         * @param {HTMLCanvasElement|HTMLElement} canvasElement - The canvas to manage
         */
        init: function(canvasElement) {
            this.canvas = canvasElement;
            return this;
        },

        /**
         * Set background color
         * @param {string} color - Hex color code
         */
        setBackgroundColor: function(color) {
            this.state.bgColor = color;

            // Update checkered pattern if transparent
            if (this.state.bgTransparent && this.canvas) {
                this._updateCheckeredPattern();
            }

            return this;
        },

        /**
         * Set transparent background
         * @param {boolean} transparent - Enable/disable transparency
         */
        setTransparent: function(transparent) {
            this.state.bgTransparent = transparent;

            if (this.canvas) {
                if (transparent) {
                    this.canvas.classList.add('chatooly-canvas-transparent');
                } else {
                    this.canvas.classList.remove('chatooly-canvas-transparent');
                }
            }

            return this;
        },

        /**
         * Set background image from file
         * @param {File} file - Image file
         * @returns {Promise} Resolves with loaded image
         */
        setBackgroundImage: function(file) {
            return new Promise((resolve, reject) => {
                if (!file || !file.type.startsWith('image/')) {
                    reject(new Error('Invalid image file'));
                    return;
                }

                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();

                    img.onload = () => {
                        this.state.bgImage = img;
                        this.state.bgImageURL = e.target.result;
                        console.log(`🎨 Background image loaded: ${img.width}x${img.height}`);
                        resolve(img);
                    };

                    img.onerror = () => {
                        reject(new Error('Failed to load image'));
                    };

                    img.src = e.target.result;
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read file'));
                };

                reader.readAsDataURL(file);
            });
        },

        /**
         * Clear background image
         */
        clearBackgroundImage: function() {
            this.state.bgImage = null;
            this.state.bgImageURL = null;
            console.log('🎨 Background image cleared');
            return this;
        },

        /**
         * Set background fit mode
         * @param {string} mode - 'cover', 'contain', or 'fill'
         */
        setFit: function(mode) {
            if (!['cover', 'contain', 'fill'].includes(mode)) {
                console.warn(`Invalid fit mode: ${mode}. Using 'cover'.`);
                mode = 'cover';
            }

            this.state.bgFit = mode;
            console.log(`🎨 Background fit mode: ${mode}`);
            return this;
        },

        /**
         * Get current background state
         * @returns {Object} Current background state
         */
        getBackgroundState: function() {
            return {
                bgColor: this.state.bgColor,
                bgTransparent: this.state.bgTransparent,
                bgImage: this.state.bgImage,
                bgImageURL: this.state.bgImageURL,
                bgFit: this.state.bgFit
            };
        },

        /**
         * Calculate background image dimensions for canvas
         * @param {number} canvasWidth - Canvas width
         * @param {number} canvasHeight - Canvas height
         * @returns {Object} { drawWidth, drawHeight, offsetX, offsetY }
         */
        calculateImageDimensions: function(canvasWidth, canvasHeight) {
            if (!this.state.bgImage) {
                return null;
            }

            const img = this.state.bgImage;
            const imgAspect = img.width / img.height;
            const canvasAspect = canvasWidth / canvasHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            switch (this.state.bgFit) {
                case 'cover':
                    // Fill entire canvas, may crop image
                    if (imgAspect > canvasAspect) {
                        drawHeight = canvasHeight;
                        drawWidth = drawHeight * imgAspect;
                        offsetX = -(drawWidth - canvasWidth) / 2;
                        offsetY = 0;
                    } else {
                        drawWidth = canvasWidth;
                        drawHeight = drawWidth / imgAspect;
                        offsetX = 0;
                        offsetY = -(drawHeight - canvasHeight) / 2;
                    }
                    break;

                case 'contain':
                    // Fit entire image within canvas
                    if (imgAspect > canvasAspect) {
                        drawWidth = canvasWidth;
                        drawHeight = drawWidth / imgAspect;
                        offsetX = 0;
                        offsetY = (canvasHeight - drawHeight) / 2;
                    } else {
                        drawHeight = canvasHeight;
                        drawWidth = drawHeight * imgAspect;
                        offsetX = (canvasWidth - drawWidth) / 2;
                        offsetY = 0;
                    }
                    break;

                case 'fill':
                    // Stretch to fill canvas
                    drawWidth = canvasWidth;
                    drawHeight = canvasHeight;
                    offsetX = 0;
                    offsetY = 0;
                    break;

                default:
                    drawWidth = canvasWidth;
                    drawHeight = canvasHeight;
                    offsetX = 0;
                    offsetY = 0;
            }

            return {
                drawWidth,
                drawHeight,
                offsetX,
                offsetY
            };
        },

        /**
         * Draw background to canvas context (for Canvas API tools)
         * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
         * @param {number} canvasWidth - Canvas width
         * @param {number} canvasHeight - Canvas height
         */
        drawToCanvas: function(ctx, canvasWidth, canvasHeight) {
            if (this.state.bgTransparent) {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                return;
            }

            // Draw image if present
            if (this.state.bgImage) {
                const dims = this.calculateImageDimensions(canvasWidth, canvasHeight);

                // Fill with color first if using 'contain' mode
                if (this.state.bgFit === 'contain') {
                    ctx.fillStyle = this.state.bgColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                }

                ctx.drawImage(
                    this.state.bgImage,
                    dims.offsetX,
                    dims.offsetY,
                    dims.drawWidth,
                    dims.drawHeight
                );
            } else {
                // Draw solid color
                ctx.fillStyle = this.state.bgColor;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
        },

        /**
         * Update checkered pattern (internal)
         */
        _updateCheckeredPattern: function() {
            if (!this.canvas) return;

            // Pattern is handled by CSS class, but we could add custom logic here
            // if needed for specific canvas types
        },

        /**
         * Generate background CSS for DOM-based tools
         * @returns {string} CSS background property value
         */
        getBackgroundCSS: function() {
            if (this.state.bgTransparent) {
                return 'transparent';
            }

            if (this.state.bgImage && this.state.bgImageURL) {
                let size;
                switch (this.state.bgFit) {
                    case 'cover': size = 'cover'; break;
                    case 'contain': size = 'contain'; break;
                    case 'fill': size = '100% 100%'; break;
                    default: size = 'cover';
                }

                return `${this.state.bgColor} url("${this.state.bgImageURL}") center/${size} no-repeat`;
            }

            return this.state.bgColor;
        },

        /**
         * Reset to default background
         */
        reset: function() {
            this.state.bgColor = '#FFFFFF';
            this.state.bgTransparent = false;
            this.state.bgImage = null;
            this.state.bgImageURL = null;
            this.state.bgFit = 'cover';

            if (this.canvas) {
                this.canvas.classList.remove('chatooly-canvas-transparent');
            }

            console.log('🎨 Background reset to defaults');
            return this;
        }
    };

})(window.Chatooly);
