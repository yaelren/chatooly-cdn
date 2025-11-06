/**
 * Chatooly CDN - Canvas Resize Bar Module
 * Bottom-positioned horizontal control bar for canvas size management
 * Integrates with existing canvasResizer and canvasArea modules
 */

(function(Chatooly) {
    'use strict';

    Chatooly.canvasResizeBar = {

        // Preset configurations
        presets: {
            'HD (16:9)': { width: 1920, height: 1080, abbr: 'HD' },
            'SQUARE (1:1)': { width: 1000, height: 1000, abbr: 'SQ' },
            '4:3': { width: 1024, height: 768, abbr: '4:3' },
            'PORTRAIT (9:16)': { width: 1080, height: 1920, abbr: 'PT' }
        },

        // Current active preset
        activePreset: 'SQUARE (1:1)',

        // Initialization state
        initialized: false,

        // Initialize the resize bar
        init: function() {
            if (this.initialized) {
                console.warn('Chatooly: Canvas resize bar already initialized');
                return;
            }

            this._createResizeBar();
            this._attachEventListeners();
            this.initialized = true;

            console.log('Chatooly: Canvas resize bar initialized');
        },

        // Create and inject the resize bar into the DOM
        _createResizeBar: function() {
            // Remove existing bar if any
            const existingBar = document.getElementById('chatooly-resize-bar');
            if (existingBar) {
                existingBar.remove();
            }

            // Get current dimensions from canvasResizer
            const currentDimensions = this._getCurrentDimensions();

            // Create bar element
            const bar = document.createElement('div');
            bar.id = 'chatooly-resize-bar';
            bar.className = 'chatooly-resize-bar';
            bar.innerHTML = this._getBarHTML(currentDimensions);

            // Inject CSS
            this._injectCSS();

            // Find the preview panel to append to (for proper centering)
            const previewPanel = document.querySelector('.chatooly-preview-panel');
            if (previewPanel) {
                // Ensure preview panel has position relative for absolute positioning
                if (getComputedStyle(previewPanel).position === 'static') {
                    previewPanel.style.position = 'relative';
                }
                previewPanel.appendChild(bar);
            } else {
                // Fallback to body if preview panel doesn't exist
                document.body.appendChild(bar);
                // In this case, use fixed positioning
                bar.style.position = 'fixed';
            }
        },

        // Generate HTML for the resize bar
        _getBarHTML: function(dimensions) {
            const presetsHTML = Object.keys(this.presets).map(presetName => {
                const isActive = presetName === this.activePreset;
                const preset = this.presets[presetName];
                return `
                    <button class="chatooly-btn ${isActive ? 'active' : ''}"
                            data-preset="${presetName}"
                            data-abbr="${preset.abbr}">
                        <span class="chatooly-btn-full">${presetName}</span>
                        <span class="chatooly-btn-abbr">${preset.abbr}</span>
                    </button>
                `;
            }).join('');

            return `
                <span class="chatooly-resize-bar-label">Canvas Size</span>
                <div class="chatooly-resize-format">
                    <div class="chatooly-resize-inputs">
                        <label>W</label>
                        <div class="chatooly-input-box">
                            <input type="number"
                                   id="chatooly-bar-width"
                                   value="${dimensions.width}"
                                   min="100"
                                   max="4000">
                            <span>px</span>
                        </div>

                        <label>H</label>
                        <div class="chatooly-input-box">
                            <input type="number"
                                   id="chatooly-bar-height"
                                   value="${dimensions.height}"
                                   min="100"
                                   max="4000">
                            <span>px</span>
                        </div>
                    </div>

                    <span class="chatooly-presets-label">Presets</span>

                    <div class="chatooly-preset-buttons">
                        ${presetsHTML}
                    </div>
                </div>
            `;
        },

        // Attach event listeners
        _attachEventListeners: function() {
            // Width input - use debouncing for better performance
            const widthInput = document.getElementById('chatooly-bar-width');
            if (widthInput) {
                widthInput.addEventListener('change', (e) => {
                    this._handleDimensionChange('width', parseInt(e.target.value));
                });
            }

            // Height input - use debouncing for better performance
            const heightInput = document.getElementById('chatooly-bar-height');
            if (heightInput) {
                heightInput.addEventListener('change', (e) => {
                    this._handleDimensionChange('height', parseInt(e.target.value));
                });
            }

            // Preset buttons (using .chatooly-btn with data-preset)
            const presetButtons = document.querySelectorAll('.chatooly-btn[data-preset]');
            presetButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    // Use currentTarget (the button) instead of target (could be span)
                    const presetName = e.currentTarget.dataset.preset;
                    this._applyPreset(presetName);
                });
            });

            // Listen for external resize events
            document.addEventListener('chatooly:canvas:resized', (e) => {
                this._handleExternalResize(e.detail);
            });
        },

        // Handle dimension changes from user input
        _handleDimensionChange: function(dimension, value) {
            // Validate
            if (value < 100 || value > 4000 || isNaN(value)) {
                alert('Export dimensions must be between 100 and 4000 pixels');
                // Reset to current value
                const current = this._getCurrentDimensions();
                if (dimension === 'width') {
                    document.getElementById('chatooly-bar-width').value = current.width;
                } else {
                    document.getElementById('chatooly-bar-height').value = current.height;
                }
                return;
            }

            // Clear active preset when manual input
            this.activePreset = null;
            this._updatePresetButtons();

            // Get current dimensions
            const currentDimensions = this._getCurrentDimensions();
            const newWidth = dimension === 'width' ? value : currentDimensions.width;
            const newHeight = dimension === 'height' ? value : currentDimensions.height;

            // Update via canvasResizer (the central point for canvas sizing)
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.exportWidth = newWidth;
                Chatooly.canvasResizer.exportHeight = newHeight;

                // Apply to canvas area if it exists
                if (Chatooly.canvasArea) {
                    Chatooly.canvasArea.setExportResolution(newWidth, newHeight);
                } else {
                    // Legacy: apply directly
                    const target = Chatooly.utils.detectExportTarget();
                    if (target.element) {
                        Chatooly.canvasResizer.applyLegacyResize(target, newWidth, newHeight);
                    }
                }
            }

            // Emit custom event
            const event = new CustomEvent('chatooly:resize-bar:change', {
                detail: { dimension, value, width: newWidth, height: newHeight }
            });
            document.dispatchEvent(event);

            console.log(`Chatooly: Canvas size changed via bar to ${newWidth}x${newHeight}`);
        },

        // Apply a preset
        _applyPreset: function(presetName) {
            const preset = this.presets[presetName];
            if (!preset) {
                console.warn(`Chatooly: Unknown preset "${presetName}"`);
                return;
            }

            // Update active preset
            this.activePreset = presetName;
            this._updatePresetButtons();

            // Update input values
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = preset.width;
            if (heightInput) heightInput.value = preset.height;

            // Apply via canvasResizer (central point for canvas sizing)
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.exportWidth = preset.width;
                Chatooly.canvasResizer.exportHeight = preset.height;

                // Apply to canvas area if it exists
                if (Chatooly.canvasArea) {
                    Chatooly.canvasArea.setExportResolution(preset.width, preset.height);
                } else {
                    // Legacy: apply directly
                    const target = Chatooly.utils.detectExportTarget();
                    if (target.element) {
                        Chatooly.canvasResizer.applyLegacyResize(target, preset.width, preset.height);
                    }
                }
            }

            // Emit custom event
            const event = new CustomEvent('chatooly:resize-bar:preset', {
                detail: { presetName, ...preset }
            });
            document.dispatchEvent(event);

            console.log(`Chatooly: Applied preset "${presetName}" (${preset.width}x${preset.height})`);
        },

        // Update preset button states
        _updatePresetButtons: function() {
            const buttons = document.querySelectorAll('.chatooly-btn[data-preset]');
            buttons.forEach(button => {
                const presetName = button.dataset.preset;
                if (presetName === this.activePreset) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        },

        // Get current canvas dimensions from canvasResizer
        _getCurrentDimensions: function() {
            if (Chatooly.canvasResizer && Chatooly.canvasResizer.getCurrentDimensions) {
                return Chatooly.canvasResizer.getCurrentDimensions();
            }

            // Fallback to default
            return { width: 800, height: 800 };
        },

        // Handle external resize events (from other UI components)
        _handleExternalResize: function(detail) {
            if (!detail || !detail.width || !detail.height) return;

            // Update input values
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = detail.width;
            if (heightInput) heightInput.value = detail.height;

            // Check if it matches a preset
            this.activePreset = null;
            for (const [presetName, preset] of Object.entries(this.presets)) {
                if (preset.width === detail.width && preset.height === detail.height) {
                    this.activePreset = presetName;
                    break;
                }
            }

            this._updatePresetButtons();
        },

        // Public API: Update displayed dimensions
        updateDimensions: function(width, height) {
            const widthInput = document.getElementById('chatooly-bar-width');
            const heightInput = document.getElementById('chatooly-bar-height');

            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;

            // Check if it matches a preset
            this.activePreset = null;
            for (const [presetName, preset] of Object.entries(this.presets)) {
                if (preset.width === width && preset.height === height) {
                    this.activePreset = presetName;
                    break;
                }
            }

            this._updatePresetButtons();
        },

        // Public API: Show the bar
        show: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.style.display = 'flex';
            }
        },

        // Public API: Hide the bar
        hide: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.style.display = 'none';
            }
        },

        // Public API: Toggle visibility
        toggle: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                const isHidden = bar.style.display === 'none';
                bar.style.display = isHidden ? 'flex' : 'none';
            }
        },

        // Public API: Remove the bar
        destroy: function() {
            const bar = document.getElementById('chatooly-resize-bar');
            if (bar) {
                bar.remove();
            }

            // Remove styles
            const styles = document.getElementById('chatooly-resize-bar-styles');
            if (styles) {
                styles.remove();
            }

            this.initialized = false;
            console.log('Chatooly: Canvas resize bar destroyed');
        },

        // Inject CSS styles
        _injectCSS: function() {
            // Check if styles already exist
            if (document.getElementById('chatooly-resize-bar-styles')) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'chatooly-resize-bar-styles';
            style.textContent = `
                .chatooly-resize-bar {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;

                    display: inline-flex;
                    padding: 5px 5px 5px 15px;
                    align-items: center;
                    gap: 15px;

                    border-radius: 10px;
                    border: 1px solid var(--chatooly-color-border);
                    background: var(--chatooly-color-surface);

                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    font-family: var(--chatooly-font-family);
                }

                .chatooly-resize-bar-label {
                    font-size: 12px;
                    color: var(--chatooly-color-text-muted);
                    font-weight: 500;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .chatooly-resize-format {
                    background: var(--chatooly-color-accent-bg);
                    border-radius: 5px;
                    padding: 5px 5px 5px 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .chatooly-resize-inputs {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .chatooly-resize-inputs label {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--chatooly-color-accent-text);
                    margin: 0;
                }

                .chatooly-input-box {
                    background: var(--chatooly-color-accent-input);
                    border-radius: 5px;
                    padding: 8px 10px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    width: 59px;
                }

                .chatooly-input-box input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: var(--chatooly-color-accent-input-text);
                    font-size: 10px;
                    font-weight: 500;
                    padding: 0;
                    text-align: center;
                    outline: none;

                    /* Remove spinner arrows */
                    -moz-appearance: textfield;
                }

                .chatooly-input-box input::-webkit-outer-spin-button,
                .chatooly-input-box input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .chatooly-input-box span {
                    font-size: 10px;
                    color: var(--chatooly-color-accent-input-text);
                    font-weight: 500;
                }

                .chatooly-presets-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--chatooly-color-accent-text);
                    flex-shrink: 0;
                }

                .chatooly-preset-buttons {
                    display: flex;
                    gap: 5px;
                    flex-wrap: nowrap;
                    align-items: center;
                }

                /* Buttons inherit from base .chatooly-btn in components.css */

                /* Button text visibility - show full text by default */
                .chatooly-btn-full {
                    display: inline;
                }

                .chatooly-btn-abbr {
                    display: none;
                }

                /* Responsive adjustments */
                @media (max-width: 1024px) {
                    .chatooly-resize-bar {
                        padding: 5px 10px;
                        gap: 10px;
                        max-width: calc(100vw - 40px);
                    }

                    .chatooly-resize-format {
                        padding: 5px 10px;
                        gap: 10px;
                    }

                    /* Keep buttons in single line, no wrapping */
                    .chatooly-preset-buttons {
                        flex-wrap: nowrap;
                        gap: 3px;
                    }

                    /* Switch to abbreviated text on tablet and below */
                    .chatooly-btn-full {
                        display: none;
                    }

                    .chatooly-btn-abbr {
                        display: inline;
                    }

                    /* Scale down preset buttons to fit in single line */
                    .chatooly-preset-buttons .chatooly-btn {
                        min-width: 28px;
                        padding: 6px 4px;
                        font-size: 8px;
                        text-align: center;
                        white-space: nowrap;
                    }
                }

                @media (max-width: 768px) {
                    .chatooly-resize-bar {
                        bottom: 10px;
                        left: 50%;
                        right: auto;
                        transform: translateX(-50%);
                        flex-wrap: wrap;
                        max-width: calc(100% - 20px);
                    }

                    .chatooly-resize-bar-label {
                        width: 100%;
                        margin-bottom: 5px;
                    }

                    .chatooly-resize-format {
                        flex-wrap: wrap;
                        width: 100%;
                    }

                    .chatooly-resize-inputs {
                        flex-wrap: wrap;
                    }

                    /* Further scale down buttons on mobile */
                    .chatooly-preset-buttons {
                        gap: 2px;
                    }

                    .chatooly-preset-buttons .chatooly-btn {
                        min-width: 24px;
                        padding: 5px 3px;
                        font-size: 7px;
                    }
                }
            `;

            document.head.appendChild(style);
        }
    };

})(window.Chatooly);
