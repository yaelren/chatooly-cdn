/**
 * Chatooly CDN - Export Modal Module
 * Provides export functionality with format selection
 */

(function() {
  'use strict';

  /**
   * Create and show the export modal
   */
  function showExportModal() {
    // Check if modal already exists
    let modal = document.getElementById('chatooly-export-modal');

    if (!modal) {
      modal = createExportModal();
      document.body.appendChild(modal);
    }

    // Show modal with animation
    modal.classList.add('active');
  }

  /**
   * Hide the export modal
   */
  function hideExportModal() {
    const modal = document.getElementById('chatooly-export-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Create the export modal HTML structure
   */
  function createExportModal() {
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
                    <input type="number" class="chatooly-export-input" value="1920" id="export-width">
                  </div>
                  <div class="chatooly-export-field">
                    <label>Height</label>
                    <input type="number" class="chatooly-export-input" value="1080" id="export-height">
                  </div>
                </div>

                <div class="chatooly-export-field">
                  <label>Format</label>
                  <select class="chatooly-export-select" id="export-image-format">
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
                    <input type="number" class="chatooly-export-input" value="5" id="export-duration">
                  </div>
                  <div class="chatooly-export-field">
                    <label>FPS</label>
                    <input type="number" class="chatooly-export-input" value="30" id="export-fps">
                  </div>
                </div>

                <div class="chatooly-export-field">
                  <label>Format</label>
                  <select class="chatooly-export-select" id="export-video-format">
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
            <button class="chatooly-btn chatooly-btn-export" id="chatooly-export-button">
              Export Image
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    setupModalEventListeners(modal);

    return modal;
  }

  /**
   * Setup event listeners for the modal
   */
  function setupModalEventListeners(modal) {
    // Close button
    const closeBtn = modal.querySelector('.chatooly-modal-close');
    closeBtn.addEventListener('click', hideExportModal);

    // Click outside to close
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideExportModal();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideExportModal();
      }
    });

    // Format toggle buttons
    const toggleBtns = modal.querySelectorAll('.chatooly-toggle-btn');
    const exportBtn = modal.querySelector('#chatooly-export-button');
    const imageOptions = modal.querySelector('[data-type="image"]');
    const videoOptions = modal.querySelector('[data-type="video"]');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Update active state
        toggleBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Show/hide options
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
    exportBtn.addEventListener('click', function() {
      const format = modal.querySelector('.chatooly-toggle-btn.active').dataset.format;
      const exportData = getExportData(modal, format);

      // Trigger custom event that users can listen to
      const event = new CustomEvent('chatooly-export', {
        detail: exportData
      });
      document.dispatchEvent(event);

      // Hide modal
      hideExportModal();
    });
  }

  /**
   * Get export data from form
   */
  function getExportData(modal, format) {
    if (format === 'image') {
      return {
        type: 'image',
        width: parseInt(modal.querySelector('#export-width').value),
        height: parseInt(modal.querySelector('#export-height').value),
        format: modal.querySelector('#export-image-format').value
      };
    } else {
      return {
        type: 'video',
        duration: parseInt(modal.querySelector('#export-duration').value),
        fps: parseInt(modal.querySelector('#export-fps').value),
        format: modal.querySelector('#export-video-format').value
      };
    }
  }

  /**
   * Initialize export modal functionality
   * Attaches click handler to all export buttons
   */
  function initExportModal() {
    // Find all export buttons
    const exportButtons = document.querySelectorAll('.chatooly-btn-export');

    exportButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        // Don't trigger if this is the modal's export button
        if (this.id !== 'chatooly-export-button') {
          e.preventDefault();
          showExportModal();
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExportModal);
  } else {
    initExportModal();
  }

  // Export for use in other modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showExportModal, hideExportModal, initExportModal };
  }

  // Also expose globally for CDN usage
  window.ChatoolyExport = { showExportModal, hideExportModal, initExportModal };
})();
