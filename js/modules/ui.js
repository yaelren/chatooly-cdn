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
            // Inject CSS first
            this._injectModalCSS();

            // Inject modal HTML
            this._injectModalHTML();

            // Setup event listeners
            this._setupModalEvents();

            // Auto-attach to any existing export buttons
            this._attachToExportButtons();
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

.chatooly-export-input,
.chatooly-export-select {
  width: 100%;
  padding: 8px 10px;
  background: #aeb7ac;
  border: none;
  border-radius: 5px;
  color: #454545;
  font-family: 'TASA Orbiter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10px;
  font-weight: 500;
  outline: none;
  transition: background 0.15s ease;
}

.chatooly-export-input:focus,
.chatooly-export-select:focus {
  background: #c0c9be;
}

.chatooly-export-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath fill='%23454545' d='M4 5L0 0h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 8px 5px;
  padding-right: 30px;
  cursor: pointer;
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
                                    <div class="chatooly-export-row">
                                        <div class="chatooly-export-field">
                                            <label>Width</label>
                                            <input type="number" class="chatooly-export-input" value="1920" id="chatooly-export-width">
                                        </div>
                                        <div class="chatooly-export-field">
                                            <label>Height</label>
                                            <input type="number" class="chatooly-export-input" value="1080" id="chatooly-export-height">
                                        </div>
                                    </div>

                                    <div class="chatooly-export-field">
                                        <label>Format</label>
                                        <select class="chatooly-export-select" id="chatooly-export-image-format">
                                            <option value="png">PNG</option>
                                            <option value="jpg">JPG</option>
                                            <option value="webp">WebP</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Video Options -->
                                <div class="chatooly-export-options" data-type="video" style="display: none;">
                                    <div class="chatooly-export-row">
                                        <div class="chatooly-export-field">
                                            <label>Duration</label>
                                            <input type="number" class="chatooly-export-input" value="5" id="chatooly-export-duration">
                                        </div>
                                        <div class="chatooly-export-field">
                                            <label>FPS</label>
                                            <input type="number" class="chatooly-export-input" value="30" id="chatooly-export-fps">
                                        </div>
                                    </div>

                                    <div class="chatooly-export-field">
                                        <label>Format</label>
                                        <select class="chatooly-export-select" id="chatooly-export-video-format">
                                            <option value="webm">WebM</option>
                                            <option value="mp4">MP4</option>
                                            <option value="gif">GIF</option>
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
                        exportBtn.textContent = 'Export Video';
                    }
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
                return {
                    type: 'image',
                    width: parseInt(modal.querySelector('#chatooly-export-width').value),
                    height: parseInt(modal.querySelector('#chatooly-export-height').value),
                    format: modal.querySelector('#chatooly-export-image-format').value
                };
            } else {
                return {
                    type: 'video',
                    duration: parseInt(modal.querySelector('#chatooly-export-duration').value),
                    fps: parseInt(modal.querySelector('#chatooly-export-fps').value),
                    format: modal.querySelector('#chatooly-export-video-format').value
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
            console.log('Exporting image:', options);

            // Call the existing Chatooly export function
            if (Chatooly.export) {
                Chatooly.export(options.format || 'png', {
                    width: options.width,
                    height: options.height,
                    scale: options.scale || 1
                });
            }
        },

        // Export video - calls existing Chatooly video export
        exportVideo: function(options) {
            console.log('Exporting video:', options);

            // Call the existing video export if available
            if (Chatooly.animationMediaRecorder && Chatooly.animationMediaRecorder.startRecording) {
                Chatooly.animationMediaRecorder.startRecording({
                    duration: options.duration * 1000,
                    fps: options.fps,
                    format: options.format
                });
            } else {
                console.warn('Video export not available. Make sure animation modules are loaded.');
            }
        }
    };

})(window.Chatooly = window.Chatooly || {});
