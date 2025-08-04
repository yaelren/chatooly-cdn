/**
 * Chatooly CDN - UI Module
 * Handles user interface components like export button and menus
 */

(function(Chatooly) {
    'use strict';
    
    // UI functionality
    Chatooly.ui = {
        
        // Create and inject export button
        createExportButton: function() {
            // Remove existing button if any
            const existingButton = document.getElementById('chatooly-export-btn');
            if (existingButton) {
                existingButton.remove();
            }
            
            // Create export button
            const button = document.createElement('div');
            button.id = 'chatooly-export-btn';
            button.innerHTML = this._getButtonHTML();
            button.style.cssText = this._getButtonStyles();
            
            // Add CSS styles
            this._injectButtonCSS();
            
            // Add event handlers
            this._attachButtonEvents(button);
            
            document.body.appendChild(button);
        },
        
        // Generate button HTML
        _getButtonHTML: function() {
            const isDev = Chatooly.utils.isDevelopment();
            const publishButton = isDev ? '<button onclick="Chatooly.publish.publish()">📤 Publish</button>' : '';
            
            return `
                <div class="chatooly-btn-main">📥</div>
                <div class="chatooly-btn-menu" style="display: none;">
                    <button onclick="Chatooly.export('png', {resolution: 1})">1x PNG</button>
                    <button onclick="Chatooly.export('png', {resolution: 2})">2x PNG</button>
                    <button onclick="Chatooly.export('png', {resolution: 4})">4x PNG</button>
                    ${publishButton}
                </div>
            `;
        },
        
        // Get button positioning styles
        _getButtonStyles: function() {
            const position = Chatooly.config.buttonPosition || 'bottom-right';
            
            const positions = {
                'bottom-right': 'position: fixed; bottom: 20px; right: 20px;',
                'bottom-left': 'position: fixed; bottom: 20px; left: 20px;',
                'top-right': 'position: fixed; top: 20px; right: 20px;',
                'top-left': 'position: fixed; top: 20px; left: 20px;'
            };
            
            return positions[position] + `
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            `;
        },
        
        // Inject button CSS styles
        _injectButtonCSS: function() {
            // Check if styles already exist
            if (document.getElementById('chatooly-button-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-button-styles';
            style.textContent = `
                #chatooly-export-btn .chatooly-btn-main {
                    width: 50px;
                    height: 50px;
                    background: #007bff;
                    border-radius: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                    font-size: 20px;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                
                #chatooly-export-btn .chatooly-btn-main:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                }
                
                #chatooly-export-btn .chatooly-btn-main:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                }
                
                #chatooly-export-btn .chatooly-btn-menu {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 8px;
                    min-width: 120px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                }
                
                #chatooly-export-btn .chatooly-btn-menu.show {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: none;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 4px;
                    margin: 2px 0;
                    font-size: 14px;
                    transition: background 0.1s ease;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:hover {
                    background: #f8f9fa;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:active {
                    background: #e9ecef;
                }
                
                /* Mobile responsive */
                @media (max-width: 768px) {
                    #chatooly-export-btn {
                        bottom: 10px !important;
                        right: 10px !important;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-main {
                        width: 45px;
                        height: 45px;
                        font-size: 18px;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu {
                        min-width: 110px;
                        padding: 6px;
                    }
                    
                    #chatooly-export-btn .chatooly-btn-menu button {
                        padding: 6px 10px;
                        font-size: 13px;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        // Attach button event handlers
        _attachButtonEvents: function(button) {
            const mainBtn = button.querySelector('.chatooly-btn-main');
            const menu = button.querySelector('.chatooly-btn-menu');
            
            // Main button click handler
            mainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = menu.classList.contains('show');
                
                if (isVisible) {
                    this._hideMenu(menu);
                } else {
                    this._showMenu(menu);
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!button.contains(e.target)) {
                    this._hideMenu(menu);
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._hideMenu(menu);
                }
            });
        },
        
        // Show menu with animation
        _showMenu: function(menu) {
            menu.style.display = 'block';
            // Force reflow for animation
            menu.offsetHeight;
            menu.classList.add('show');
        },
        
        // Hide menu with animation
        _hideMenu: function(menu) {
            menu.classList.remove('show');
            setTimeout(() => {
                if (!menu.classList.contains('show')) {
                    menu.style.display = 'none';
                }
            }, 200);
        },
        
        // Update button for different themes (future)
        setTheme: function(theme) {
            // TODO: Implement theme support (dark, light, custom colors)
            console.warn('Theme support not yet implemented');
        },
        
        // Add custom menu items
        addMenuItem: function(label, onClick, icon) {
            const menu = document.querySelector('.chatooly-btn-menu');
            if (!menu) return;
            
            const button = document.createElement('button');
            button.textContent = (icon ? icon + ' ' : '') + label;
            button.addEventListener('click', onClick);
            menu.appendChild(button);
        },
        
        // Remove button (cleanup)
        removeButton: function() {
            const button = document.getElementById('chatooly-export-btn');
            const styles = document.getElementById('chatooly-button-styles');
            
            if (button) button.remove();
            if (styles) styles.remove();
        }
    };
    
})(window.Chatooly);