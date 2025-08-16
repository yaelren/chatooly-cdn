/**
 * Chatooly CDN - Style Loader Module
 * Injects CDN styles into the page
 */

(function() {
    'use strict';
    
    // Style loader module
    window.Chatooly = window.Chatooly || {};
    
    Chatooly.styleLoader = {
        // CDN base URL
        cdnBase: 'https://yaelren.github.io/chatooly-cdn',
        
        // Development mode detection
        isDevelopment: function() {
            return location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1' || 
                   location.protocol === 'file:';
        },
        
        // Get CDN URL based on environment
        getCDNUrl: function(path) {
            // Check if we're actually developing the CDN itself (not just any localhost)
            const currentUrl = window.location.href;
            const isLocalCDNDevelopment = this.isDevelopment() && currentUrl.includes('chatooly-cdn');
            
            if (isLocalCDNDevelopment) {
                // Only use local paths when developing the CDN itself
                let cdnPath = currentUrl.substring(0, currentUrl.indexOf('chatooly-cdn') + 'chatooly-cdn'.length);
                
                // Remove any trailing slashes and add the path
                cdnPath = cdnPath.replace(/\/$/, '');
                const fullPath = cdnPath + path;
                console.log('Chatooly StyleLoader: Local CDN development mode, loading from:', fullPath);
                
                // For tests subfolder, ensure we go up one level
                if (currentUrl.includes('/tests/')) {
                    const testPath = cdnPath.replace('/tests', '') + path;
                    console.log('Chatooly StyleLoader: Test subfolder detected, using path:', testPath);
                    return testPath;
                }
                
                return fullPath;
            }
            
            // For all external tools (localhost or production), always use the CDN
            console.log('Chatooly StyleLoader: Loading from CDN:', this.cdnBase + path);
            return this.cdnBase + path;
        },
        
        // Inject styles into the page
        inject: function() {
            // Check if styles already loaded
            if (document.getElementById('chatooly-unified-styles')) {
                console.log('Chatooly: Styles already loaded');
                return;
            }
            
            // Create link element for unified CSS
            const link = document.createElement('link');
            link.id = 'chatooly-unified-styles';
            link.rel = 'stylesheet';
            link.href = this.getCDNUrl('/css/unified.min.css');
            
            // Handle load success
            link.onload = () => {
                console.log('Chatooly: Styles loaded successfully');
                this.onStylesLoaded();
            };
            
            // Handle load error
            link.onerror = () => {
                console.error('Chatooly: Failed to load styles');
                // Try fallback to individual files in development
                if (this.isDevelopment()) {
                    this.loadIndividualStyles();
                }
            };
            
            // Insert before any other styles to allow overrides
            const firstStyle = document.querySelector('link[rel="stylesheet"], style');
            if (firstStyle && firstStyle.parentNode) {
                firstStyle.parentNode.insertBefore(link, firstStyle);
            } else {
                document.head.appendChild(link);
            }
        },
        
        // Load individual CSS files (development fallback)
        loadIndividualStyles: function() {
            console.log('Chatooly: Loading individual CSS files (dev mode)');
            
            const cssFiles = [
                '/css/variables.css',
                '/css/base.css',
                '/css/components.css',
                '/css/layouts/sidebar.css',
                '/css/responsive.css'
            ];
            
            cssFiles.forEach((file, index) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.getCDNUrl(file);
                link.dataset.chatoolyStyle = 'individual';
                
                if (index === cssFiles.length - 1) {
                    link.onload = () => {
                        console.log('Chatooly: All individual styles loaded');
                        this.onStylesLoaded();
                    };
                }
                
                document.head.appendChild(link);
            });
        },
        
        // Called when styles are successfully loaded
        onStylesLoaded: function() {
            // Add loaded class to body
            document.body.classList.add('chatooly-styles-loaded');
            
            // Dispatch custom event
            const event = new CustomEvent('chatooly:styles-loaded', {
                detail: { version: Chatooly.version || '2.0.0' }
            });
            document.dispatchEvent(event);
            
            // Initialize layout if config exists
            if (window.ChatoolyConfig && window.ChatoolyConfig.layout) {
                this.applyLayout(window.ChatoolyConfig.layout);
            }
        },
        
        // Apply layout class to body
        applyLayout: function(layout) {
            const validLayouts = ['sidebar', 'tabs', 'modal', 'split', 'custom'];
            
            if (validLayouts.includes(layout)) {
                document.body.classList.add(`chatooly-layout-${layout}`);
                console.log(`Chatooly: Applied ${layout} layout`);
            }
        },
        
        // Check if styles are loaded
        isLoaded: function() {
            return document.getElementById('chatooly-unified-styles') !== null ||
                   document.querySelector('[data-chatooly-style="individual"]') !== null;
        },
        
        // Reload styles (for development)
        reload: function() {
            // Remove existing styles
            const existingStyles = document.querySelectorAll('#chatooly-unified-styles, [data-chatooly-style]');
            existingStyles.forEach(style => style.remove());
            
            // Remove loaded class
            document.body.classList.remove('chatooly-styles-loaded');
            
            // Reinject styles
            this.inject();
        },
        
        // Get computed style value using CSS variables
        getVariable: function(variableName) {
            const computed = getComputedStyle(document.documentElement);
            return computed.getPropertyValue(variableName).trim();
        },
        
        // Set CSS variable value
        setVariable: function(variableName, value) {
            document.documentElement.style.setProperty(variableName, value);
        },
        
        // Apply theme
        applyTheme: function(theme) {
            const validThemes = ['light', 'dark', 'auto'];
            
            if (validThemes.includes(theme)) {
                document.body.dataset.theme = theme;
                console.log(`Chatooly: Applied ${theme} theme`);
            }
        }
    };
    
    // Auto-inject styles when module loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Chatooly.styleLoader.inject();
        });
    } else {
        // DOM already loaded
        Chatooly.styleLoader.inject();
    }
    
})();