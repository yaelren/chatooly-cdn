/**
 * Chatooly CDN - Publishing Module
 * Handles tool publishing functionality for development mode
 */

(function(Chatooly) {
    'use strict';
    
    // Publishing functionality
    Chatooly.publish = {
        
        // Main publish function (development mode only)
        publish: function(options) {
            if (!Chatooly.utils.isDevelopment()) {
                console.warn('Chatooly: Publishing only available in development mode');
                return;
            }
            
            options = options || {};
            const toolName = options.name || Chatooly.config.name || prompt('Enter tool name for publishing:');
            
            if (!toolName) {
                console.log('Chatooly: Publishing cancelled');
                return;
            }
            
            // Create tool slug (URL-safe name)
            const toolSlug = this._createToolSlug(toolName);
            
            console.log('Chatooly: Publishing tool "' + toolName + '" as "' + toolSlug + '"');
            
            // Check if .chatooly/publish.js exists and call it
            if (typeof window.publishTool === 'function') {
                // Template has custom publish function
                window.publishTool(toolSlug, this._gatherToolFiles());
            } else {
                // Fallback: show instructions
                this._showPublishInstructions(toolSlug);
            }
        },
        
        // Create URL-safe tool slug
        _createToolSlug: function(toolName) {
            return toolName.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-')         // Spaces to hyphens
                .replace(/-+/g, '-')          // Multiple hyphens to single
                .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
        },
        
        // Gather current tool files for publishing
        _gatherToolFiles: function() {
            const files = {};
            
            // Get current HTML (remove Chatooly button for published version)
            const htmlClone = document.documentElement.cloneNode(true);
            const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
            if (exportBtn) exportBtn.remove();
            
            files['index.html'] = '<!DOCTYPE html>' + htmlClone.outerHTML;
            
            // Get inline styles and scripts
            const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
            if (styles) files['style.css'] = styles;
            
            const scripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent).join('\n');
            if (scripts) files['tool.js'] = scripts;
            
            // Get external resource references
            files['resources'] = this._gatherResourceReferences();
            
            return files;
        },
        
        // Gather references to external resources
        _gatherResourceReferences: function() {
            const resources = {
                scripts: [],
                styles: [],
                images: [],
                fonts: []
            };
            
            // External scripts
            Array.from(document.querySelectorAll('script[src]')).forEach(script => {
                resources.scripts.push(script.src);
            });
            
            // External stylesheets
            Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
                resources.styles.push(link.href);
            });
            
            // Images
            Array.from(document.querySelectorAll('img[src]')).forEach(img => {
                resources.images.push(img.src);
            });
            
            return resources;
        },
        
        // Show publishing instructions if no custom publish function
        _showPublishInstructions: function(toolSlug) {
            const instructions = `
Publishing "${toolSlug}":

1. Run: npm run publish
   (This will call .chatooly/publish.js script)

2. Or manually upload to staging:
   - Tool will be available at: tools.chatooly.com/staging/${toolSlug}
   - Admin can promote to: tools.chatooly.com/${toolSlug}

3. Required files:
   - index.html (main tool file)
   - style.css (if using external styles)  
   - tool.js (if using external scripts)

4. Publishing options:
   - Static hosting (Vercel, Netlify, GitHub Pages)
   - Chatooly Hub API integration
   - Custom deployment pipeline

See template documentation for setup details.
            `.trim();
            
            alert(instructions);
            console.log('Chatooly:', instructions);
        },
        
        // Validate tool before publishing
        validateTool: function() {
            const validation = {
                valid: true,
                warnings: [],
                errors: []
            };
            
            // Check for required elements
            if (!Chatooly.config.name || Chatooly.config.name === 'Untitled Tool') {
                validation.warnings.push('Tool name not set - using default');
            }
            
            // Check for export functionality
            const target = Chatooly.utils.detectExportTarget();
            if (!target.element) {
                validation.errors.push('No exportable content found');
                validation.valid = false;
            }
            
            // Check for external dependencies
            const scripts = document.querySelectorAll('script[src]');
            if (scripts.length === 0) {
                validation.warnings.push('No external libraries detected');
            }
            
            return validation;
        }
    };
    
})(window.Chatooly);