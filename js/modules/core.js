/**
 * Chatooly CDN - Core Module
 * Main entry point and initialization for the modular library
 */

(function() {
    'use strict';
    
    // Initialize global Chatooly object
    window.Chatooly = {
        version: '1.0.0-poc',
        config: {},
        
        // Initialize the library
        init: function(userConfig) {
            this.config = Object.assign({
                name: 'Untitled Tool',
                exportFormats: ['png'],
                resolution: 2, // Default 2x for high quality
                buttonPosition: 'bottom-right'
            }, userConfig);
            
            // Initialize UI
            if (this.ui && this.ui.createExportButton) {
                this.ui.createExportButton();
            }
            
            // Log development mode
            if (this.utils && this.utils.logDevelopmentMode) {
                this.utils.logDevelopmentMode();
            }
        },
        
        // Main export function - detects target and format
        export: function(format, options) {
            format = format || 'png';
            options = options || {};
            
            if (format !== 'png') {
                console.warn('Chatooly POC: Only PNG export supported in this version');
                return;
            }
            
            // Detect export target
            if (!this.utils || !this.utils.detectExportTarget) {
                console.error('Chatooly: Utils module not loaded');
                return;
            }
            
            const target = this.utils.detectExportTarget();
            
            // Route to appropriate exporter
            if (this.pngExport && this.pngExport.export) {
                this.pngExport.export(target, options);
            } else {
                console.error('Chatooly: PNG export module not loaded');
            }
        },
        
        // Reinitialize with new config
        reinit: function(userConfig) {
            this.init(userConfig);
        },
        
        // Get current configuration
        getConfig: function() {
            return { ...this.config };
        },
        
        // Update configuration
        updateConfig: function(newConfig) {
            this.config = Object.assign(this.config, newConfig);
            
            // Reinitialize UI if button position changed
            if (newConfig.buttonPosition && this.ui && this.ui.createExportButton) {
                this.ui.createExportButton();
            }
        },
        
        // Get library info
        getInfo: function() {
            return {
                version: this.version,
                modules: this._getLoadedModules(),
                config: this.getConfig(),
                developmentMode: this.utils ? this.utils.isDevelopment() : false
            };
        },
        
        // Get list of loaded modules
        _getLoadedModules: function() {
            const modules = [];
            
            if (this.utils) modules.push('utils');
            if (this.pngExport) modules.push('export-png');
            if (this.canvasExporters) modules.push('canvas-exporters');
            if (this.domExport) modules.push('dom-export');
            if (this.publish) modules.push('publish');
            if (this.ui) modules.push('ui');
            
            return modules;
        },
        
        // Clean up and remove all Chatooly elements
        destroy: function() {
            // Remove UI elements
            if (this.ui && this.ui.removeButton) {
                this.ui.removeButton();
            }
            
            // Clear configuration
            this.config = {};
            
            console.log('Chatooly: Library destroyed and cleaned up');
        }
    };
    
    // Auto-initialize when DOM is ready
    function autoInit() {
        if (window.ChatoolyConfig) {
            window.Chatooly.init(window.ChatoolyConfig);
        } else {
            // Initialize with defaults
            window.Chatooly.init();
        }
    }
    
    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // DOM is already loaded, initialize after a short delay to ensure all modules are loaded
        setTimeout(autoInit, 100);
    }
    
    // Expose version for debugging
    console.log(`Chatooly CDN v${window.Chatooly.version} - Modular Architecture`);
    
})();