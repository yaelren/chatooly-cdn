/**
 * Chatooly CDN - Style Injection Module
 * Automatically injects the unified design system into any page
 * This file can be loaded independently or included in the build
 */

(function() {
    'use strict';
    
    // Initialize Chatooly namespace if it doesn't exist
    window.Chatooly = window.Chatooly || {};
    
    // Style Injection Module
    Chatooly.styleInjection = {
        // CDN configuration
        cdnBase: 'https://yaelren.github.io/chatooly-cdn',
        version: '2.0.0',
        
        // Development mode detection - delegates to utils if available
        isDevelopment: function() {
            return (window.Chatooly && Chatooly.utils) ? Chatooly.utils.isDevelopment() : 
                   (location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1' || 
                    location.hostname === '::' ||
                    location.hostname === '[::1]' ||
                    location.protocol === 'file:' ||
                    location.search.includes('dev=true'));
        },
        
        // Get CDN URL based on environment
        getCDNUrl: function(path) {
            if (this.isDevelopment()) {
                // Use local path in development
                const baseUrl = window.location.origin + window.location.pathname;
                const cdnPath = baseUrl.includes('chatooly-cdn') ? 
                    baseUrl.substring(0, baseUrl.indexOf('chatooly-cdn') + 'chatooly-cdn'.length) :
                    baseUrl.replace(/\/[^\/]*$/, ''); // Remove filename from path
                return cdnPath + path;
            }
            return this.cdnBase + path;
        },
        
        // Main injection function
        inject: function(options) {
            options = options || {};
            
            // Check if styles already loaded
            if (document.getElementById('chatooly-unified-styles')) {
                console.log('Chatooly: Styles already loaded');
                return Promise.resolve();
            }
            
            console.log('Chatooly: Injecting CDN v2.0.0 design system...');
            
            return new Promise((resolve, reject) => {
                // Create link element for unified CSS
                const link = document.createElement('link');
                link.id = 'chatooly-unified-styles';
                link.rel = 'stylesheet';
                link.href = this.getCDNUrl('/css/unified.min.css');
                
                // Handle load success
                link.onload = () => {
                    console.log('Chatooly: Design system loaded successfully ✅');
                    this.onStylesLoaded(options);
                    resolve();
                };
                
                // Handle load error
                link.onerror = () => {
                    console.warn('Chatooly: Failed to load design system, continuing without ⚠️');
                    this.onStylesLoaded(options);
                    resolve(); // Don't reject - tool should still work
                };
                
                // Insert before any other styles to allow overrides
                const firstStyle = document.querySelector('link[rel="stylesheet"], style');
                if (firstStyle && firstStyle.parentNode) {
                    firstStyle.parentNode.insertBefore(link, firstStyle);
                } else {
                    document.head.appendChild(link);
                }
                
                // Timeout fallback (5 seconds)
                setTimeout(() => {
                    if (!document.getElementById('chatooly-unified-styles')) {
                        console.warn('Chatooly: Style loading timed out');
                        this.onStylesLoaded(options);
                        resolve();
                    }
                }, 5000);
            });
        },
        
        // Called when styles are loaded (or failed)
        onStylesLoaded: function(options) {
            options = options || {};
            
            // Add loaded class to body
            document.body.classList.add('chatooly-styles-loaded');
            
            // Apply version class
            document.body.classList.add(`chatooly-v${this.version.replace(/\./g, '-')}`);
            
            // Apply layout if specified
            if (options.layout) {
                this.applyLayout(options.layout);
            } else if (window.ChatoolyConfig && window.ChatoolyConfig.layout) {
                this.applyLayout(window.ChatoolyConfig.layout);
            }
            
            // Apply theme if specified
            if (options.theme) {
                this.applyTheme(options.theme);
            } else if (window.ChatoolyConfig && window.ChatoolyConfig.theme) {
                this.applyTheme(window.ChatoolyConfig.theme);
            }
            
            // Dispatch custom event for other scripts to listen to
            const event = new CustomEvent('chatooly:styles-loaded', {
                detail: { 
                    version: this.version,
                    options: options,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        },
        
        // Apply layout class to body
        applyLayout: function(layout) {
            const validLayouts = ['sidebar', 'tabs', 'modal', 'split', 'custom'];
            
            if (validLayouts.includes(layout)) {
                document.body.classList.add(`chatooly-layout-${layout}`);
                console.log(`Chatooly: Applied ${layout} layout`);
                return true;
            } else {
                console.warn(`Chatooly: Invalid layout "${layout}". Valid layouts:`, validLayouts);
                return false;
            }
        },
        
        // Apply theme
        applyTheme: function(theme) {
            const validThemes = ['light', 'dark', 'auto'];
            
            if (validThemes.includes(theme)) {
                document.body.dataset.theme = theme;
                document.body.classList.add(`chatooly-theme-${theme}`);
                console.log(`Chatooly: Applied ${theme} theme`);
                return true;
            } else {
                console.warn(`Chatooly: Invalid theme "${theme}". Valid themes:`, validThemes);
                return false;
            }
        },
        
        // Check if styles are loaded
        isLoaded: function() {
            return document.getElementById('chatooly-unified-styles') !== null ||
                   document.body.classList.contains('chatooly-styles-loaded');
        },
        
        // Reload styles (useful for development)
        reload: function() {
            console.log('Chatooly: Reloading styles...');
            
            // Remove existing styles
            const existingStyles = document.querySelectorAll('#chatooly-unified-styles');
            existingStyles.forEach(style => style.remove());
            
            // Remove loaded classes
            document.body.classList.remove('chatooly-styles-loaded');
            document.body.className = document.body.className.replace(/chatooly-v\d+-\d+-\d+/g, '');
            
            // Reinject styles
            return this.inject();
        },
        
        // Get CSS variable value
        getVariable: function(variableName) {
            // Ensure variable name starts with --
            if (!variableName.startsWith('--')) {
                variableName = '--chatooly-' + variableName;
            }
            
            const computed = getComputedStyle(document.documentElement);
            return computed.getPropertyValue(variableName).trim();
        },
        
        // Set CSS variable value
        setVariable: function(variableName, value) {
            // Ensure variable name starts with --
            if (!variableName.startsWith('--')) {
                variableName = '--chatooly-' + variableName;
            }
            
            document.documentElement.style.setProperty(variableName, value);
            console.log(`Chatooly: Set ${variableName} = ${value}`);
        },
        
        // Enable development mode features
        enableDevMode: function() {
            console.log('Chatooly: Development mode enabled');
            
            // Add dev mode class
            document.body.classList.add('chatooly-dev-mode');
            
            // Add keyboard shortcut to reload styles (Ctrl+Shift+R)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                    e.preventDefault();
                    this.reload();
                }
            });
            
            // Log available CSS variables
            this.logAvailableVariables();
        },
        
        // Log all available CSS variables (dev helper)
        logAvailableVariables: function() {
            const style = getComputedStyle(document.documentElement);
            const variables = [];
            
            for (let i = 0; i < style.length; i++) {
                const property = style[i];
                if (property.startsWith('--chatooly-')) {
                    variables.push({
                        name: property,
                        value: style.getPropertyValue(property).trim()
                    });
                }
            }
            
            if (variables.length > 0) {
                console.group('Chatooly: Available CSS Variables');
                variables.forEach(variable => {
                    console.log(`${variable.name}: ${variable.value}`);
                });
                console.groupEnd();
            }
        }
    };
    
    // Auto-inject if this script is loaded directly (not as part of build)
    if (!window.ChatoolyAutoInjected) {
        // Set flag to prevent double injection
        window.ChatoolyAutoInjected = true;
        
        // Auto-inject when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                Chatooly.styleInjection.inject();
                
                // Enable dev mode if in development
                if (Chatooly.styleInjection.isDevelopment()) {
                    Chatooly.styleInjection.enableDevMode();
                }
            });
        } else {
            // DOM already loaded
            Chatooly.styleInjection.inject();
            
            // Enable dev mode if in development
            if (Chatooly.styleInjection.isDevelopment()) {
                Chatooly.styleInjection.enableDevMode();
            }
        }
    }
    
})();