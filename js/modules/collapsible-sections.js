/**
 * Chatooly CDN - Collapsible Sections Module
 * Provides collapse/expand functionality for section cards
 */

(function() {
  'use strict';

  /**
   * Initialize collapsible section functionality
   * Adds click handlers to all section headers with proper accessibility
   */
  function initCollapsibleSections() {
    // Find all section headers
    const headers = document.querySelectorAll('.chatooly-section-header');

    headers.forEach(header => {
      // Make header accessible if not already
      if (!header.hasAttribute('role')) {
        header.setAttribute('role', 'button');
      }
      if (!header.hasAttribute('tabindex')) {
        header.setAttribute('tabindex', '0');
      }

      // Add click handler
      header.addEventListener('click', function() {
        const card = this.closest('.chatooly-section-card');
        if (card) {
          card.classList.toggle('collapsed');
        }
      });

      // Add keyboard accessibility
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollapsibleSections);
  } else {
    initCollapsibleSections();
  }

  // Export for use in other modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCollapsibleSections };
  }

  // Also expose globally for CDN usage
  window.ChatoolyCollapsible = { initCollapsibleSections };
})();
