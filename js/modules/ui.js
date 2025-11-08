/**
 * Chatooly CDN - UI Module
 * Automatically injects export modal and handles export functionality
 */

(function(Chatooly) {
    'use strict';

    // UI functionality
    Chatooly.ui = {

        // Create and inject export modal - called automatically by core
        createExportButton: function() {
            // Check feature flags
            const features = Chatooly.config.features || {};

            // Only inject modal if exportModal feature is enabled
            if (features.exportModal !== false) {
                // Inject CSS first
                this._injectModalCSS();

                // Inject modal HTML
                this._injectModalHTML();

                // Setup event listeners
                this._setupModalEvents();
            }

            // Only inject export button if exportButton feature is enabled
            if (features.exportButton !== false) {
                // Inject export button in sidebar footer
                this._injectExportButton();

                // Auto-attach to any existing export buttons
                this._attachToExportButtons();
            }

            // Only inject publish button if publishButton feature is enabled
            if (features.publishButton !== false) {
                // Inject publish button (dev mode only)
                this._injectPublishButton();
            }
        },

        // Inject export button into sidebar footer
        _injectExportButton: function() {
            // Look for Chatooly controls panel (sidebar)
            const controlsPanel = document.querySelector('.chatooly-controls-panel');
            if (!controlsPanel) return;

            // Check if footer already exists
            let footer = controlsPanel.querySelector('.chatooly-controls-footer');

            if (!footer) {
                // Create footer if it doesn't exist
                footer = document.createElement('div');
                footer.className = 'chatooly-controls-footer';
                controlsPanel.appendChild(footer);
            }

            // Check if export button already exists
            if (footer.querySelector('.chatooly-btn-export')) return;

            // Create and inject export button
            const exportBtn = document.createElement('button');
            exportBtn.className = 'chatooly-btn chatooly-btn-export';
            exportBtn.textContent = 'Export';
            footer.appendChild(exportBtn);
        },

        // Inject publish button (floating, top-right, dev mode only)
        _injectPublishButton: function() {
            // Debug logging for publish button injection
            console.log('Chatooly: Checking publish button injection conditions:');
            console.log('  - Chatooly.utils exists:', !!Chatooly.utils);
            console.log('  - isDevelopment function exists:', !!(Chatooly.utils && Chatooly.utils.isDevelopment));
            console.log('  - hostname:', location.hostname);
            console.log('  - protocol:', location.protocol);

            // Only inject in development mode
            if (!Chatooly.utils || !Chatooly.utils.isDevelopment || !Chatooly.utils.isDevelopment()) {
                const reason = !Chatooly.utils ? 'utils not loaded' :
                              !Chatooly.utils.isDevelopment ? 'isDevelopment not found' :
                              'isDevelopment returned false';
                console.log('Chatooly: Publish button NOT injected -', reason);
                return;
            }

            console.log('Chatooly: Publish button WILL BE injected (development mode detected)');

            // Check if button already exists
            if (document.getElementById('chatooly-publish-button')) {
                console.log('Chatooly: Publish button already exists, skipping');
                return;
            }

            // Inject CSS first
            this._injectPublishButtonCSS();

            // Create publish button
            const publishBtn = document.createElement('button');
            publishBtn.id = 'chatooly-publish-button';
            publishBtn.className = 'chatooly-publish-button';
            publishBtn.innerHTML = `
                Publish to Hub
                <span class="chatooly-publish-badge">DEV</span>
            `;

            // Add click handler
            publishBtn.addEventListener('click', () => {
                if (Chatooly.publish && Chatooly.publish.publish) {
                    Chatooly.publish.publish();
                } else {
                    console.error('Chatooly: Publish module not loaded');
                }
            });

            // Append to body
            document.body.appendChild(publishBtn);
        },

        // Inject publish button CSS
        _injectPublishButtonCSS: function() {
            // Check if already injected
            if (document.getElementById('chatooly-publish-button-styles')) return;

            const style = document.createElement('style');
            style.id = 'chatooly-publish-button-styles';
            style.textContent = `
/* ========== PUBLISH BUTTON (DEV MODE) ========== */
.chatooly-publish-button {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1050;

    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;

    background: var(--chatooly-color-button-primary);
    color: var(--chatooly-color-button-primary-text);
    border: 1px solid var(--chatooly-color-border);
    border-radius: var(--chatooly-button-radius);

    font-family: var(--chatooly-font-family);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    cursor: pointer;
    transition: all var(--chatooly-transition-fast);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chatooly-publish-button:hover {
    background: var(--chatooly-color-button-hover);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
}

.chatooly-publish-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Dev badge */
.chatooly-publish-badge {
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    font-size: 8px;
    font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .chatooly-publish-button {
        top: 10px;
        right: 10px;
        padding: 6px 12px;
        font-size: 9px;
    }

    .chatooly-publish-badge {
        padding: 2px 4px;
        font-size: 7px;
    }
}
            `;
            document.head.appendChild(style);
        },

        // Inject modal CSS
        _injectModalCSS: function() {
            // Check if already injected
            if (document.getElementById('chatooly-modal-styles')) return;

            const style = document.createElement('style');
            style.id = 'chatooly-modal-styles';
            style.textContent = `
/* ========== EXPORT MODAL ========== */
.chatooly-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Chatooly.config.modalZIndex || 1050};
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.chatooly-modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.chatooly-modal-container {
  width: 350px;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.chatooly-modal-overlay.active .chatooly-modal-container {
  transform: scale(1);
}

.chatooly-modal-content {
  background: #232323;
  border: 1px solid #343434;
  border-radius: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chatooly-modal-header {
  background: #454545;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chatooly-modal-header span {
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  flex: 1;
}

.chatooly-modal-close {
  width: 12px;
  height: 12px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.chatooly-modal-close:hover {
  opacity: 1;
}

.chatooly-modal-body {
  padding: 0 10px;
}

.chatooly-export-section {
  background: #d9e5d7;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chatooly-export-toggle {
  display: flex;
  gap: 5px;
  width: 100%;
}

.chatooly-toggle-btn {
  flex: 1;
  padding: 5px 6px;
  background: #6d736c;
  color: #d9e5d7;
  border: none;
  border-radius: 3px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-toggle-btn:hover {
  background: #7d837c;
}

.chatooly-toggle-btn.active {
  background: #000000;
  color: #FFFFFF;
}

.chatooly-export-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chatooly-export-row {
  display: flex;
  gap: 5px;
}

.chatooly-export-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chatooly-export-field label {
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #000000;
}

.chatooly-multiplier-buttons {
  display: flex;
  gap: 5px;
  width: 100%;
}

.chatooly-multiplier-btn {
  flex: 1;
  padding: 8px 10px;
  background: #6d736c;
  color: #d9e5d7;
  border: none;
  border-radius: 5px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-multiplier-btn:hover {
  opacity: 0.85;
}

.chatooly-multiplier-btn.active {
  background: #000000;
  color: #FFFFFF;
}

.chatooly-modal-footer {
  display: flex;
  justify-content: center;
  padding: 0 10px;
}

.chatooly-modal-footer .chatooly-modal-export-btn {
  width: 100%;
  padding: 12px 15px;
  background: #F4E4A3;
  color: #000000;
  border: none;
  border-radius: 5px;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: center;
}

.chatooly-modal-footer .chatooly-modal-export-btn:hover {
  background: #FFF4C4;
}
            `;
            document.head.appendChild(style);
        },

        // Inject modal HTML
        _injectModalHTML: function() {
            // Check if already injected
            if (document.getElementById('chatooly-export-modal')) return;

            const modal = document.createElement('div');
            modal.id = 'chatooly-export-modal';
            modal.className = 'chatooly-modal-overlay';
            modal.innerHTML = `
                <div class="chatooly-modal-container">
                    <div class="chatooly-modal-content">
                        <!-- Header -->
                        <div class="chatooly-modal-header">
                            <span>Export</span>
                            <button class="chatooly-modal-close" aria-label="Close">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L11 11M1 11L11 1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="chatooly-modal-body">
                            <div class="chatooly-export-section">
                                <!-- Format Toggle -->
                                <div class="chatooly-export-toggle">
                                    <button class="chatooly-toggle-btn active" data-format="image">Image</button>
                                    <button class="chatooly-toggle-btn" data-format="video">Video</button>
                                </div>

                                <!-- Image Options -->
                                <div class="chatooly-export-options" data-type="image">
                                    <div class="chatooly-export-field">
                                        <label>Size</label>
                                        <div class="chatooly-multiplier-buttons">
                                            <button class="chatooly-multiplier-btn" data-multiplier="0.5">0.5X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="1">1X</button>
                                            <button class="chatooly-multiplier-btn active" data-multiplier="2">2X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="3">3X</button>
                                            <button class="chatooly-multiplier-btn" data-multiplier="4">4X</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Video Options -->
                                <div class="chatooly-export-options" data-type="video" style="display: none;">
                                    <div class="chatooly-export-row">
                                        <div class="chatooly-input-group">
                                            <label class="chatooly-input-label">Duration</label>
                                            <input type="number" class="chatooly-input" value="5" id="anim-duration">
                                        </div>
                                        <div class="chatooly-input-group">
                                            <label class="chatooly-input-label">FPS</label>
                                            <input type="number" class="chatooly-input" value="30" id="anim-fps">
                                        </div>
                                    </div>

                                    <div class="chatooly-input-group">
                                        <label class="chatooly-input-label">Format</label>
                                        <select class="chatooly-select" id="anim-format">
                                            <option value="webm">WebM</option>
                                            <option value="mp4">MP4</option>
                                            <option value="png-sequence">PNG Sequence</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="chatooly-modal-footer">
                            <button class="chatooly-modal-export-btn">
                                Export Image
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        // Setup modal event listeners
        _setupModalEvents: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (!modal) return;

            // Close button
            const closeBtn = modal.querySelector('.chatooly-modal-close');
            closeBtn.addEventListener('click', () => this.hideModal());

            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });

            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.hideModal();
                }
            });

            // Format toggle buttons
            const toggleBtns = modal.querySelectorAll('.chatooly-toggle-btn');
            const exportBtn = modal.querySelector('.chatooly-modal-export-btn');
            const imageOptions = modal.querySelector('[data-type="image"]');
            const videoOptions = modal.querySelector('[data-type="video"]');

            toggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    toggleBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    const format = this.dataset.format;
                    if (format === 'image') {
                        imageOptions.style.display = 'block';
                        videoOptions.style.display = 'none';
                        exportBtn.textContent = 'Export Image';
                    } else {
                        imageOptions.style.display = 'none';
                        videoOptions.style.display = 'block';
                        exportBtn.textContent = 'Start Recording';
                    }
                });
            });

            // Multiplier button handlers
            const multiplierBtns = modal.querySelectorAll('.chatooly-multiplier-btn');
            multiplierBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active from siblings
                    const container = this.parentElement;
                    container.querySelectorAll('.chatooly-multiplier-btn').forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    this.classList.add('active');
                });
            });

            // Export button
            exportBtn.addEventListener('click', () => {
                const format = modal.querySelector('.chatooly-toggle-btn.active').dataset.format;
                const exportData = this._getExportData(format);

                // Call the appropriate export function
                if (format === 'image') {
                    this.exportImage(exportData);
                } else {
                    this.exportVideo(exportData);
                }

                this.hideModal();
            });
        },

        // Attach to export buttons
        _attachToExportButtons: function() {
            // Find all export buttons and attach click handler
            const exportButtons = document.querySelectorAll('.chatooly-btn-export');
            exportButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal();
                });
            });
        },

        // Get export data from form
        _getExportData: function(format) {
            const modal = document.getElementById('chatooly-export-modal');

            if (format === 'image') {
                const imageOptions = modal.querySelector('[data-type="image"]');
                const activeBtn = imageOptions.querySelector('.chatooly-multiplier-btn.active');
                const multiplier = parseFloat(activeBtn.dataset.multiplier);

                return {
                    type: 'image',
                    multiplier: multiplier,
                    scale: multiplier
                };
            } else {
                return {
                    type: 'video',
                    duration: parseInt(modal.querySelector('#anim-duration').value),
                    fps: parseInt(modal.querySelector('#anim-fps').value),
                    format: modal.querySelector('#anim-format').value
                };
            }
        },

        // Show modal
        showModal: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (modal) {
                modal.classList.add('active');
            }
        },

        // Hide modal
        hideModal: function() {
            const modal = document.getElementById('chatooly-export-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        },

        // Export image - calls existing Chatooly export
        exportImage: function(options) {
            console.log('Exporting image with multiplier:', options.multiplier);

            // Call the existing Chatooly export function with scale multiplier
            if (Chatooly.export) {
                Chatooly.export('png', {
                    scale: options.scale
                });
            }
        },

        // Export video - calls existing Chatooly video export
        exportVideo: function(options) {
            console.log('Exporting video:', options);

            // Call the existing video export (it reads from DOM elements with IDs: anim-duration, anim-fps, anim-format)
            if (Chatooly.animationMediaRecorder && Chatooly.animationMediaRecorder.startRecording) {
                Chatooly.animationMediaRecorder.startRecording();
            } else {
                console.warn('Video export not available. Make sure animation modules are loaded.');
            }
        }
    };

})(window.Chatooly = window.Chatooly || {});
