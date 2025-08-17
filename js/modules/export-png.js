/**
 * Chatooly CDN - PNG Export Module
 * Main PNG export orchestrator that delegates to specific export handlers
 */

(function(Chatooly) {
    'use strict';
    
    // PNG export functionality
    Chatooly.pngExport = {
        
        // Main PNG export function
        export: function(target, options) {
            if (target.type === 'canvas') {
                this._exportCanvas(target.element, options);
            } else {
                this._exportDOM(target.element, options);
            }
        },
        
        // Route canvas export to appropriate handler
        _exportCanvas: function(canvas, options) {
            // Detect canvas type and route to appropriate PNG exporter
            if (Chatooly.utils._isP5Canvas(canvas)) {
                Chatooly.canvasExporters.p5.png.export(canvas, options);
            } else if (Chatooly.utils._isThreeCanvas(canvas)) {
                Chatooly.canvasExporters.three.png.export(canvas, options);
            } else {
                Chatooly.canvasExporters.html5.png.export(canvas, options);
            }
        },
        
        // Route DOM export
        _exportDOM: function(element, options) {
            Chatooly.domExport.export(element, options);
        }
    };
    
})(window.Chatooly);