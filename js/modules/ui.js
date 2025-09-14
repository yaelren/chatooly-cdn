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
        
        // Generate button HTML with Chatooly branding
        _getButtonHTML: function() {
            const isDev = Chatooly.utils.isDevelopment();
            const publishButton = isDev ? '<button onclick="Chatooly.publish.publish()">📤 Publish</button>' : '';
            
            // Get current canvas size
            const dimensions = Chatooly.canvasResizer ? 
                Chatooly.canvasResizer.getCurrentDimensions() : 
                { width: 800, height: 600 };
            const currentWidth = dimensions.width;
            const currentHeight = dimensions.height;
            
            return `
                <div class="chatooly-btn-main">
                    <div style="font-size: 10px; opacity: 0.7;">CHATOOLY</div>
                    <div>Export & Controls</div>
                </div>
                <div class="chatooly-btn-menu" style="display: none;">
                    <div class="chatooly-menu-section">
                        <h4>📸 Images</h4>
                        <button onclick="Chatooly.export('png', {resolution: 1})">1x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 2})">2x PNG</button>
                        <button onclick="Chatooly.export('png', {resolution: 4})">4x PNG</button>
                    </div>
                    
                    <div class="chatooly-menu-section">
                        <h4>🎬 Animations</h4>
                        <button onclick="Chatooly.animationMediaRecorder.showExportDialog()">🎥 Video Export</button>
                        <button disabled style="opacity: 0.5;">📱 Mobile Optimized (Soon)</button>
                    </div>
                    
                    <div class="chatooly-menu-section">
                        <h4>🎮 Canvas Controls</h4>
                        <div class="chatooly-canvas-controls">
                            <button onclick="Chatooly.ui.resetZoomAndCenter()" class="chatooly-control-btn">🎯 Reset & Center</button>
                            <button onclick="Chatooly.ui.centerCanvas()" class="chatooly-control-btn">📍 Center Canvas</button>
                        </div>
                        <div class="chatooly-canvas-help">
                            <small>💡 Spacebar + drag to pan when zoomed<br>
                            🎨 Press R to reset zoom & center<br>
                            🔍 Ctrl+scroll to zoom in/out</small>
                        </div>
                    </div>
                    
                    <div class="chatooly-menu-section">
                        <h4>📏 Canvas Size</h4>
                        <div class="chatooly-canvas-inputs">
                            <input type="number" id="chatooly-canvas-width" value="${currentWidth}" min="100" max="4000">
                            <span>×</span>
                            <input type="number" id="chatooly-canvas-height" value="${currentHeight}" min="100" max="4000">
                            <button onclick="Chatooly.canvasResizer.applyExportSize()" class="chatooly-apply-btn">🔄 Apply</button>
                        </div>
                        <div class="chatooly-canvas-presets">
                            <button onclick="Chatooly.canvasResizer.setExportSize(1920, 1080)">HD</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(1200, 1200)">Square</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(800, 600)">4:3</button>
                            <button onclick="Chatooly.canvasResizer.setExportSize(1080, 1920)">Portrait</button>
                        </div>
                    </div>
                    
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
                font-family: 'Lucida Console', Monaco, monospace;
            `;
        },
        
        // Inject button CSS styles with dark theme
        _injectButtonCSS: function() {
            // Check if styles already exist
            if (document.getElementById('chatooly-button-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-button-styles';
            style.textContent = `
                #chatooly-export-btn .chatooly-btn-main {
                    min-width: 120px;
                    height: 50px;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    font-size: 14px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    font-weight: bold;
                    padding: 5px 15px;
                    transition: all 0.2s ease;
                    user-select: none;
                    text-align: center;
                }
                
                #chatooly-export-btn .chatooly-btn-main:hover {
                    background: #3b3b3b;
                    border-color: #007bff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }
                
                #chatooly-export-btn .chatooly-btn-main:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                }
                
                #chatooly-export-btn .chatooly-btn-menu {
                    position: absolute;
                    bottom: 60px;
                    right: 0;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    padding: 12px;
                    min-width: 240px;
                    max-width: 280px;
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
                    border: 2px solid #ffffff;
                    background: #2b2b2b;
                    color: #ffffff;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 0px;
                    margin: 2px 0;
                    font-size: 14px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    transition: background 0.1s ease;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:hover {
                    background: #3b3b3b;
                    border-color: #007bff;
                }
                
                #chatooly-export-btn .chatooly-btn-menu button:active {
                    background: #1b1b1b;
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
                
                /* Menu sections */
                #chatooly-export-btn .chatooly-menu-section {
                    border-bottom: 1px solid #ffffff;
                    padding: 8px 0;
                    margin: 8px 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section:first-child {
                    margin-top: 0;
                }
                
                #chatooly-export-btn .chatooly-menu-section h4 {
                    font-size: 11px;
                    color: #ffffff;
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                /* Canvas size inputs */
                #chatooly-export-btn .chatooly-canvas-inputs {
                    display: flex;
                    gap: 6px;
                    margin: 8px 0;
                    align-items: center;
                }
                
                #chatooly-export-btn .chatooly-canvas-inputs input[type="number"] {
                    flex: 1;
                    width: 70px;
                    padding: 6px 8px;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    background: #2b2b2b;
                    color: #ffffff;
                    font-size: 12px;
                    font-family: 'Lucida Console', Monaco, monospace;
                    text-align: center;
                }
                
                #chatooly-export-btn .chatooly-canvas-inputs input[type="number"]:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
                
                #chatooly-export-btn .chatooly-apply-btn {
                    padding: 6px 10px !important;
                    background: #007bff !important;
                    color: white !important;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    min-width: 50px;
                }
                
                #chatooly-export-btn .chatooly-apply-btn:hover {
                    background: #0056b3 !important;
                }
                
                /* Canvas presets */
                #chatooly-export-btn .chatooly-canvas-presets {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-top: 8px;
                }
                
                #chatooly-export-btn .chatooly-canvas-presets button {
                    padding: 4px 8px !important;
                    font-size: 10px !important;
                    font-weight: 500;
                    background: #2b2b2b;
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    border-radius: 0px;
                    margin: 0 !important;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                #chatooly-export-btn .chatooly-canvas-presets button:hover {
                    background: #3b3b3b !important;
                    border-color: #007bff;
                }
                
                /* Canvas control buttons */
                #chatooly-export-btn .chatooly-canvas-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-bottom: 8px;
                }
                
                #chatooly-export-btn .chatooly-control-btn {
                    padding: 6px 8px !important;
                    font-size: 11px !important;
                    font-weight: 500;
                    background: #007bff !important;
                    color: white !important;
                    border: 2px solid #007bff !important;
                    border-radius: 4px;
                    margin: 0 !important;
                    font-family: 'Lucida Console', Monaco, monospace;
                }
                
                #chatooly-export-btn .chatooly-control-btn:hover {
                    background: #0056b3 !important;
                    border-color: #0056b3 !important;
                }
                
                #chatooly-export-btn .chatooly-canvas-help {
                    padding: 8px;
                    background: #1a1a1a;
                    border-radius: 4px;
                    border: 1px solid #333;
                }
                
                #chatooly-export-btn .chatooly-canvas-help small {
                    color: #ccc;
                    font-size: 10px;
                    line-height: 1.3;
                    font-family: 'Lucida Console', Monaco, monospace;
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
        
        // Deprecated - use Chatooly.canvasResizer instead
        setCanvasSize: function(width, height) {
            console.warn('Chatooly.ui.setCanvasSize is deprecated. Use Chatooly.canvasResizer.setSize instead');
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.setSize(width, height);
            }
        },
        
        // Deprecated - use Chatooly.canvasResizer instead
        applyCanvasSize: function() {
            console.warn('Chatooly.ui.applyCanvasSize is deprecated. Use Chatooly.canvasResizer.applySize instead');
            if (Chatooly.canvasResizer) {
                Chatooly.canvasResizer.applySize();
            }
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
        },
        
        // Canvas control functions called from the menu
        resetZoomAndCenter: function() {
            if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                Chatooly.canvasArea.resetZoomAndCenter();
            } else if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.resetZoom();
            }
            
            // Hide menu after action
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && this._hideMenu) {
                this._hideMenu(menu);
            }
        },
        
        centerCanvas: function() {
            if (Chatooly.canvasArea && Chatooly.canvasArea.centerCanvas) {
                Chatooly.canvasArea.centerCanvas();
            }
            
            // Hide menu after action
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && this._hideMenu) {
                this._hideMenu(menu);
            }
        },
        
        
    };
    
})(window.Chatooly);