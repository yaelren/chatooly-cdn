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
            
            // Get current canvas size
            const dimensions = Chatooly.canvasResizer ? 
                Chatooly.canvasResizer.getCurrentDimensions() : 
                { width: 1920, height: 1080 };
            const currentWidth = dimensions.width;
            const currentHeight = dimensions.height;
            
            return `
                <!-- Minimized Floating Button -->
                <div class="chatooly-minimized-btn">
                    <div class="chatooly-minimized-icon">🌠</div>
                    <div class="chatooly-minimized-label">CHATOOLY</div>
                </div>

                <!-- Expanded Panel -->
                <div class="chatooly-export-panel" style="display: none;">
                    <!-- Sidebar Navigation -->
                    <div class="chatooly-sidebar">
                        <div class="chatooly-nav-item active" data-tab="canvas-size">
                            <span class="chatooly-nav-icon">📏</span>
                            <span class="chatooly-nav-label">Canvas Size</span>
                        </div>
                        <div class="chatooly-nav-item" data-tab="export">
                            <span class="chatooly-nav-icon">📥</span>
                            <span class="chatooly-nav-label">Export</span>
                        </div>
                        <div class="chatooly-nav-item" data-tab="publish">
                            <span class="chatooly-nav-icon">🚀</span>
                            <span class="chatooly-nav-label">Publish</span>
                        </div>
                        <div class="chatooly-nav-item" data-tab="info">
                            <span class="chatooly-nav-icon">❓</span>
                            <span class="chatooly-nav-label">Info</span>
                        </div>
                    </div>
                    
                    <!-- Settings Panel -->
                    <div class="chatooly-settings-panel">
                        <div class="chatooly-settings-content">
                            <!-- Canvas Size Tab Content -->
                            <div class="chatooly-tab-content" id="canvas-size-content">
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">Size</h4>
                                    <div class="chatooly-size-inputs">
                                        <div class="chatooly-input-group">
                                            <label>W</label>
                                            <input type="number" id="chatooly-canvas-width" value="${currentWidth}" min="100" max="4000" class="chatooly-size-input">
                                            <span class="chatooly-unit">px</span>
                                        </div>
                                        <div class="chatooly-input-group">
                                            <label>H</label>
                                            <input type="number" id="chatooly-canvas-height" value="${currentHeight}" min="100" max="4000" class="chatooly-size-input">
                                            <span class="chatooly-unit">px</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">Standard Ratios</h4>
                                    <div class="chatooly-ratio-buttons">
                                        <button class="chatooly-ratio-btn" data-width="1920" data-height="1080">HD (16:9)</button>
                                        <button class="chatooly-ratio-btn" data-width="1200" data-height="1200">Square (1:1)</button>
                                        <button class="chatooly-ratio-btn" data-width="800" data-height="600">4:3</button>
                                        <button class="chatooly-ratio-btn" data-width="1080" data-height="1920">Portrait (9:16)</button>
                                    </div>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <button class="chatooly-btn-primary chatooly-apply-btn">Apply</button>
                                </div>
                            </div>
                            
                            <!-- Export Tab Content -->
                            <div class="chatooly-tab-content" id="export-content" style="display: none;">
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">Export Type</h4>
                                    <div class="chatooly-export-type-buttons">
                                        <button class="chatooly-export-type-btn active" data-type="image">Image</button>
                                        <button class="chatooly-export-type-btn" data-type="video">Video</button>
                                    </div>
                                </div>
                                
                                <!-- Image Export Options -->
                                <div class="chatooly-export-options" id="image-export-options">
                                    <div class="chatooly-settings-section">
                                        <h4 class="chatooly-section-title">Scale</h4>
                                        <div class="chatooly-scale-buttons">
                                            <button class="chatooly-scale-btn" data-scale="0.5">0.5x</button>
                                            <button class="chatooly-scale-btn active" data-scale="1">1x</button>
                                            <button class="chatooly-scale-btn" data-scale="2">2x</button>
                                            <button class="chatooly-scale-btn" data-scale="3">3x</button>
                                            <button class="chatooly-scale-btn" data-scale="4">4x</button>
                                        </div>
                                    </div>
                                    
                                    <div class="chatooly-settings-section">
                                        <button class="chatooly-btn-primary chatooly-export-btn">Export Image</button>
                                    </div>
                                </div>
                                
                                <!-- Video Export Options -->
                                <div class="chatooly-export-options" id="video-export-options" style="display: none;">
                                    <div class="chatooly-settings-section">
                                        <div class="chatooly-compact-form">
                                            <div class="chatooly-compact-field">
                                                <label>Duration (s)</label>
                                                <input type="number" id="chatooly-video-duration" value="5" min="1" max="30" step="0.5" class="chatooly-compact-input">
                                            </div>

                                            <div class="chatooly-compact-field">
                                                <label>FPS</label>
                                                <select id="chatooly-video-fps" class="chatooly-compact-input">
                                                    <option value="24">24</option>
                                                    <option value="30" selected>30</option>
                                                    <option value="60">60</option>
                                                </select>
                                            </div>

                                            <div class="chatooly-compact-field chatooly-compact-field-wide">
                                                <label>Format</label>
                                                <select id="chatooly-video-format" class="chatooly-compact-input">
                                                    <option value="mp4">MP4</option>
                                                    <option value="webm-vp9" selected>WebM</option>
                                                    <option value="png-sequence">PNG Sequence</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="chatooly-settings-section">
                                        <button class="chatooly-btn-primary chatooly-video-export-btn">Export</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Publish Tab Content -->
                            <div class="chatooly-tab-content" id="publish-content" style="display: none;">
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">Publish to ToolHub</h4>
                                    <p class="chatooly-description">
                                        Publish this tool to our ToolHub so others can discover and use it. 
                                        Your tool will be available in our community gallery.
                                    </p>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <div class="chatooly-form-group">
                                        <label>Tool Name</label>
                                        <input type="text" id="chatooly-tool-name" placeholder="Enter tool name" class="chatooly-text-input">
                                    </div>
                                    
                                    <div class="chatooly-form-group">
                                        <label>Description</label>
                                        <textarea id="chatooly-tool-description" placeholder="Describe your tool..." class="chatooly-textarea"></textarea>
                                    </div>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <button class="chatooly-btn-primary chatooly-publish-btn">Publish</button>
                                </div>
                            </div>
                            
                            <!-- Info Tab Content -->
                            <div class="chatooly-tab-content" id="info-content" style="display: none;">
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">Canvas Controls</h4>
                                    <div class="chatooly-info-list">
                                        <div class="chatooly-info-item">
                                            <strong>Zoom:</strong> Ctrl + Scroll to zoom in/out
                                        </div>
                                        <div class="chatooly-info-item">
                                            <strong>Pan:</strong> Spacebar + Drag to pan when zoomed
                                        </div>
                                        <div class="chatooly-info-item">
                                            <strong>Reset:</strong> Press R to reset zoom & center
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <h4 class="chatooly-section-title">About Chatooly</h4>
                                    <p class="chatooly-description">
                                        Chatooly is a canvas-based design tool that helps you create, export, and share your creative projects.
                                    </p>
                                </div>
                                
                                <div class="chatooly-settings-section">
                                    <button class="chatooly-btn-secondary chatooly-reset-canvas-btn">Reset Canvas</button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                display: block;
            `;
        },
        
        // Inject button CSS styles with dark theme
        _injectButtonCSS: function() {
            // Always remove existing styles to ensure we get the latest
            const existingStyles = document.querySelectorAll('#chatooly-button-styles, #chatooly-new-button-styles');
            existingStyles.forEach(s => s.remove());
            
            const style = document.createElement('style');
            style.id = 'chatooly-new-button-styles';
            style.textContent = `
                /* Noto Emoji font for icons only */
                @import url('https://fonts.googleapis.com/css2?family=Noto+Emoji&display=swap');

                /* Hide old button styles completely */
                #chatooly-export-btn .chatooly-btn-main {
                    display: none !important;
                }

                /* Icon styling with Noto Emoji font and B&W filter */
                #chatooly-export-btn .chatooly-minimized-icon,
                #chatooly-export-btn .chatooly-nav-icon,
                #chatooly-export-btn .chatooly-emoji,
                .chatooly-export-indicator {
                    font-family: 'Noto Emoji', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    filter: grayscale(100%) contrast(1.2);
                }
                
                /* Minimized Floating Button - Override any cached styles */
                #chatooly-export-btn .chatooly-minimized-btn {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: var(--chatooly-spacing-2, 8px) !important;
                    background: var(--chatooly-color-surface, #ffffff) !important;
                    border: var(--chatooly-border-width-thin, 1px) solid var(--chatooly-color-border, #e5e7eb) !important;
                    border-radius: var(--chatooly-border-radius-lg, 12px) !important;
                    box-shadow: var(--chatooly-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15)) !important;
                    padding: var(--chatooly-spacing-3, 12px) var(--chatooly-spacing-4, 16px) !important;
                    cursor: pointer !important;
                    transition: all var(--chatooly-transition-normal, 0.2s ease) !important;
                    min-width: 120px !important;
                    font-family: var(--chatooly-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif) !important;
                    /* Hide any old button styles */
                    flex-direction: row !important;
                    height: auto !important;
                    width: auto !important;
                }
                
                #chatooly-export-btn .chatooly-minimized-btn:hover {
                    background: var(--chatooly-color-surface-hover, #f9fafb);
                    transform: translateY(-2px);
                    box-shadow: var(--chatooly-shadow-xl, 0 20px 40px rgba(0, 0, 0, 0.2));
                }
                
                #chatooly-export-btn .chatooly-minimized-icon {
                    font-size: var(--chatooly-font-size-md, 14px);
                }
                
                #chatooly-export-btn .chatooly-minimized-label {
                    font-size: var(--chatooly-font-size-sm, 12px);
                    color: var(--chatooly-color-text-muted, #6b7280);
                    font-weight: var(--chatooly-font-weight-semibold, 600);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* Main Export Panel */
                #chatooly-export-btn .chatooly-export-panel {
                    display: flex;
                    flex-direction: row;
                    background: var(--chatooly-color-surface);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius-lg);
                    box-shadow: var(--chatooly-shadow-lg);
                    overflow: hidden;
                    min-width: 500px;
                    max-width: 600px;
                    font-family: var(--chatooly-font-family);
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: var(--chatooly-spacing-2);
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-export-panel.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                /* Sidebar Navigation */
                #chatooly-export-btn .chatooly-sidebar {
                    display: flex;
                    flex-direction: column;
                    background: var(--chatooly-color-surface);
                    padding: var(--chatooly-spacing-4) 0;
                    border-right: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    width: 120px;
                    flex-shrink: 0;
                }
                
                #chatooly-export-btn .chatooly-nav-item {
                    display: flex;
                    align-items: center;
                    padding: var(--chatooly-spacing-3) var(--chatooly-spacing-5);
                    color: var(--chatooly-color-text-muted);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                    border-left: 3px solid transparent;
                }
                
                #chatooly-export-btn .chatooly-nav-item:hover {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-hover);
                }
                
                #chatooly-export-btn .chatooly-nav-item.active {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-active);
                    border-left-color: var(--chatooly-color-primary);
                }
                
                #chatooly-export-btn .chatooly-nav-icon {
                    margin-right: var(--chatooly-spacing-3);
                    font-size: var(--chatooly-font-size-md);
                }
                
                #chatooly-export-btn .chatooly-nav-label {
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-medium);
                }
                
                /* Settings Panel */
                #chatooly-export-btn .chatooly-settings-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--chatooly-color-surface);
                }
                
                #chatooly-export-btn .chatooly-settings-content {
                    flex: 1;
                    padding: var(--chatooly-spacing-6);
                }
                
                #chatooly-export-btn .chatooly-settings-section {
                    margin-bottom: var(--chatooly-spacing-6);
                }
                
                #chatooly-export-btn .chatooly-settings-section:last-child {
                    margin-bottom: 0;
                }
                
                #chatooly-export-btn .chatooly-section-title {
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-semibold);
                    color: var(--chatooly-color-text);
                    margin: 0 0 var(--chatooly-spacing-4) 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* Size Inputs */
                #chatooly-export-btn .chatooly-size-inputs {
                    display: flex;
                    gap: var(--chatooly-spacing-4);
                    align-items: center;
                }
                
                #chatooly-export-btn .chatooly-input-group {
                    display: flex;
                    align-items: center;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-input-group label {
                    font-size: var(--chatooly-font-size-sm);
                    color: var(--chatooly-color-text);
                    font-weight: var(--chatooly-font-weight-medium);
                    min-width: 20px;
                }
                
                #chatooly-export-btn .chatooly-size-input {
                    width: 80px;
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-3);
                    background: var(--chatooly-color-surface-hover);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text);
                    font-size: var(--chatooly-font-size-sm);
                    text-align: center;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-size-input:focus {
                    outline: none;
                    border-color: var(--chatooly-color-primary);
                    box-shadow: var(--chatooly-shadow-focus);
                }
                
                #chatooly-export-btn .chatooly-unit {
                    font-size: var(--chatooly-font-size-xs);
                    color: var(--chatooly-color-text-muted);
                }
                
                /* Scale Buttons */
                #chatooly-export-btn .chatooly-scale-buttons {
                    display: flex;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-scale-btn {
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-4);
                    background: transparent;
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text-muted);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-medium);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-scale-btn:hover {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-hover);
                }
                
                #chatooly-export-btn .chatooly-scale-btn.active {
                    background: var(--chatooly-color-surface-active);
                    color: var(--chatooly-color-text);
                    border-color: var(--chatooly-color-primary);
                }
                
                /* Format Buttons */
                #chatooly-export-btn .chatooly-format-buttons {
                    display: flex;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-format-btn {
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-4);
                    background: transparent;
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text-muted);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-medium);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-format-btn:hover {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-hover);
                }
                
                #chatooly-export-btn .chatooly-format-btn.active {
                    background: var(--chatooly-color-surface-active);
                    color: var(--chatooly-color-text);
                    border-color: var(--chatooly-color-primary);
                }
                
                /* Tab Content */
                #chatooly-export-btn .chatooly-tab-content {
                    display: block;
                }
                
                #chatooly-export-btn .chatooly-tab-content.hidden {
                    display: none;
                }
                
                /* Ratio Buttons */
                #chatooly-export-btn .chatooly-ratio-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-ratio-btn {
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-3);
                    background: transparent;
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text-muted);
                    font-size: var(--chatooly-font-size-xs);
                    font-weight: var(--chatooly-font-weight-medium);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-ratio-btn:hover {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-hover);
                }
                
                #chatooly-export-btn .chatooly-ratio-btn.active {
                    background: var(--chatooly-color-surface-active);
                    color: var(--chatooly-color-text);
                    border-color: var(--chatooly-color-primary);
                }
                
                /* Export Type Buttons */
                #chatooly-export-btn .chatooly-export-type-buttons {
                    display: flex;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-export-type-btn {
                    flex: 1;
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-4);
                    background: transparent;
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text-muted);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-medium);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-export-type-btn:hover {
                    color: var(--chatooly-color-text);
                    background: var(--chatooly-color-surface-hover);
                }
                
                #chatooly-export-btn .chatooly-export-type-btn.active {
                    background: var(--chatooly-color-surface-active);
                    color: var(--chatooly-color-text);
                    border-color: var(--chatooly-color-primary);
                }
                
                /* Form Elements */
                #chatooly-export-btn .chatooly-form-group {
                    margin-bottom: var(--chatooly-spacing-4);
                }
                
                #chatooly-export-btn .chatooly-form-group label {
                    display: block;
                    margin-bottom: var(--chatooly-spacing-2);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-medium);
                    color: var(--chatooly-color-text);
                }
                
                #chatooly-export-btn .chatooly-text-input {
                    width: 100%;
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-3);
                    background: var(--chatooly-color-surface-hover);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text);
                    font-size: var(--chatooly-font-size-sm);
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-text-input:focus {
                    outline: none;
                    border-color: var(--chatooly-color-primary);
                    box-shadow: var(--chatooly-shadow-focus);
                }
                
                #chatooly-export-btn .chatooly-textarea {
                    width: 100%;
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-3);
                    background: var(--chatooly-color-surface-hover);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text);
                    font-size: var(--chatooly-font-size-sm);
                    resize: vertical;
                    min-height: 80px;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-textarea:focus {
                    outline: none;
                    border-color: var(--chatooly-color-primary);
                    box-shadow: var(--chatooly-shadow-focus);
                }
                
                /* Description Text */
                #chatooly-export-btn .chatooly-description {
                    font-size: var(--chatooly-font-size-sm);
                    color: var(--chatooly-color-text-muted);
                    line-height: var(--chatooly-line-height-normal);
                    margin-bottom: var(--chatooly-spacing-4);
                }
                
                /* Info List */
                #chatooly-export-btn .chatooly-info-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--chatooly-spacing-2);
                }
                
                #chatooly-export-btn .chatooly-info-item {
                    font-size: var(--chatooly-font-size-sm);
                    color: var(--chatooly-color-text);
                    padding: var(--chatooly-spacing-2);
                    background: var(--chatooly-color-surface-hover);
                    border-radius: var(--chatooly-border-radius);
                }
                
                /* Export Options */
                #chatooly-export-btn .chatooly-export-options {
                    margin-top: var(--chatooly-spacing-4);
                }

                /* Compact Form Layout */
                #chatooly-export-btn .chatooly-compact-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--chatooly-spacing-3);
                    align-items: end;
                }

                #chatooly-export-btn .chatooly-compact-field {
                    display: flex;
                    flex-direction: column;
                    gap: var(--chatooly-spacing-2);
                }

                #chatooly-export-btn .chatooly-compact-field-wide {
                    grid-column: 1 / -1;
                }

                #chatooly-export-btn .chatooly-compact-field label {
                    font-size: var(--chatooly-font-size-xs);
                    font-weight: var(--chatooly-font-weight-medium);
                    color: var(--chatooly-color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                #chatooly-export-btn .chatooly-compact-input {
                    width: 100%;
                    padding: var(--chatooly-spacing-2) var(--chatooly-spacing-3);
                    background: var(--chatooly-color-surface-hover);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius);
                    color: var(--chatooly-color-text);
                    font-size: var(--chatooly-font-size-sm);
                    transition: all var(--chatooly-transition-normal);
                }

                #chatooly-export-btn .chatooly-compact-input:focus {
                    outline: none;
                    border-color: var(--chatooly-color-primary);
                    box-shadow: var(--chatooly-shadow-focus);
                }
                
                /* Info Box */
                #chatooly-export-btn .chatooly-info-box {
                    background: var(--chatooly-color-primary-light);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-primary);
                    border-radius: var(--chatooly-border-radius-md);
                    padding: var(--chatooly-spacing-3);
                    margin-top: var(--chatooly-spacing-2);
                }
                
                /* Buttons */
                #chatooly-export-btn .chatooly-btn-primary {
                    padding: var(--chatooly-spacing-3) var(--chatooly-spacing-6);
                    background: var(--chatooly-color-primary);
                    border: none;
                    border-radius: var(--chatooly-border-radius-lg);
                    color: var(--chatooly-color-text-inverse);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-semibold);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-btn-primary:hover {
                    background: var(--chatooly-color-primary-hover);
                    transform: translateY(-1px);
                }
                
                #chatooly-export-btn .chatooly-btn-secondary {
                    padding: var(--chatooly-spacing-3) var(--chatooly-spacing-6);
                    background: var(--chatooly-color-surface-active);
                    border: var(--chatooly-border-width-thin) solid var(--chatooly-color-border);
                    border-radius: var(--chatooly-border-radius-lg);
                    color: var(--chatooly-color-text);
                    font-size: var(--chatooly-font-size-sm);
                    font-weight: var(--chatooly-font-weight-semibold);
                    cursor: pointer;
                    transition: all var(--chatooly-transition-normal);
                }
                
                #chatooly-export-btn .chatooly-btn-secondary:hover {
                    background: var(--chatooly-color-surface-hover);
                    border-color: var(--chatooly-color-border-dark);
                }
                
                /* Mobile Responsive */
                @media (max-width: 768px) {
                    #chatooly-export-btn .chatooly-export-panel {
                        min-width: 320px;
                        max-width: 90vw;
                    }
                    
                    #chatooly-export-btn .chatooly-sidebar {
                        flex-direction: row;
                        overflow-x: auto;
                        padding: var(--chatooly-spacing-3) 0;
                    }
                    
                    #chatooly-export-btn .chatooly-nav-item {
                        flex-shrink: 0;
                        padding: var(--chatooly-spacing-2) var(--chatooly-spacing-4);
                        border-left: none;
                        border-bottom: 3px solid transparent;
                    }
                    
                    #chatooly-export-btn .chatooly-nav-item.active {
                        border-left: none;
                        border-bottom-color: var(--chatooly-color-primary);
                    }
                    
                    #chatooly-export-btn .chatooly-nav-label {
                        display: none;
                    }
                    
                    #chatooly-export-btn .chatooly-settings-content {
                        padding: var(--chatooly-spacing-4);
                    }
                    
                    #chatooly-export-btn .chatooly-size-inputs {
                        flex-direction: column;
                        gap: var(--chatooly-spacing-3);
                    }
                    
                    #chatooly-export-btn .chatooly-scale-buttons,
                    #chatooly-export-btn .chatooly-format-buttons {
                        flex-wrap: wrap;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        // Attach button event handlers
        _attachButtonEvents: function(button) {
            // Minimized button click handler
            const minimizedBtn = button.querySelector('.chatooly-minimized-btn');
            const panel = button.querySelector('.chatooly-export-panel');
            
            minimizedBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._togglePanel(panel);
            });
            
            // Navigation tab switching - each tab shows different content
            const navItems = button.querySelectorAll('.chatooly-nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Remove active class from all items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    // Add active class to clicked item
                    item.classList.add('active');
                    
                    // Show/hide tab content
                    this._showTabContent(item.dataset.tab);
                });
            });
            
            // Scale button selection
            const scaleButtons = button.querySelectorAll('.chatooly-scale-btn');
            scaleButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    scaleButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            
            
            // Ratio buttons
            const ratioButtons = button.querySelectorAll('.chatooly-ratio-btn');
            ratioButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const width = parseInt(btn.dataset.width);
                    const height = parseInt(btn.dataset.height);
                    this._setCanvasSize(width, height);
                    this._showRatioFeedback(btn);
                });
            });
            
            // Apply button
            const applyBtn = button.querySelector('.chatooly-apply-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._applyCanvasSize();
                });
            }
            
            // Enter key support for input fields
            const widthInput = button.querySelector('#chatooly-canvas-width');
            const heightInput = button.querySelector('#chatooly-canvas-height');
            
            if (widthInput) {
                widthInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.stopPropagation();
                        this._applyCanvasSize();
                    }
                });
            }
            
            if (heightInput) {
                heightInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.stopPropagation();
                        this._applyCanvasSize();
                    }
                });
            }
            
            // Export type buttons
            const exportTypeButtons = button.querySelectorAll('.chatooly-export-type-btn');
            exportTypeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    exportTypeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Show/hide appropriate export options
                    const exportType = btn.dataset.type;
                    const imageOptions = button.querySelector('#image-export-options');
                    const videoOptions = button.querySelector('#video-export-options');
                    
                    if (exportType === 'image') {
                        imageOptions.style.display = 'block';
                        videoOptions.style.display = 'none';
                    } else if (exportType === 'video') {
                        imageOptions.style.display = 'none';
                        videoOptions.style.display = 'block';
                    }
                });
            });
            
            // Export button
            const exportBtn = button.querySelector('.chatooly-export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleExport();
                });
            }
            
            // Video export button
            const videoExportBtn = button.querySelector('.chatooly-video-export-btn');
            if (videoExportBtn) {
                videoExportBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handleVideoExport();
                });
            }
            
            // Publish button
            const publishBtn = button.querySelector('.chatooly-publish-btn');
            if (publishBtn) {
                publishBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._handlePublish();
                });
            }
            
            // Reset canvas button
            const resetBtn = button.querySelector('.chatooly-reset-canvas-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._resetCanvas();
                });
            }
            
            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!button.contains(e.target)) {
                    this._hidePanel(panel);
                }
            });
            
            // Close panel on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._hidePanel(panel);
                }
            });
        },
        
        // Show tab content based on selected tab
        _showTabContent: function(tab) {
            // Hide all tab contents
            const allTabContents = document.querySelectorAll('.chatooly-tab-content');
            allTabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const selectedContent = document.getElementById(tab + '-content');
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        },
        
        // Set canvas size from ratio buttons
        _setCanvasSize: function(width, height) {
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;
        },
        
        // Show visual feedback when ratio button is clicked
        _showRatioFeedback: function(button) {
            // Remove active class from all ratio buttons
            const allRatioButtons = document.querySelectorAll('.chatooly-ratio-btn');
            allRatioButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Remove active class after 2 seconds
            setTimeout(() => {
                button.classList.remove('active');
            }, 2000);
        },
        
        // Apply canvas size
        _applyCanvasSize: function() {
            if (Chatooly.canvasResizer && Chatooly.canvasResizer.applyExportSize) {
                Chatooly.canvasResizer.applyExportSize();
            } else {
                console.warn('Chatooly: Canvas resizer not available');
            }
        },
        
        // Reset canvas
        _resetCanvas: function() {
            if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                Chatooly.canvasArea.resetZoomAndCenter();
            } else if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.resetZoom();
            }
        },
        
        // Handle publish
        _handlePublish: function() {
            const toolName = document.getElementById('chatooly-tool-name').value;
            const toolDescription = document.getElementById('chatooly-tool-description').value;
            
            if (!toolName.trim()) {
                alert('Please enter a tool name');
                return;
            }
            
            if (Chatooly.publish) {
                Chatooly.publish.publish({
                    name: toolName,
                    description: toolDescription
                });
            }
            
            // Hide panel after publish
            const panel = document.querySelector('.chatooly-export-panel');
            if (panel) {
                this._hidePanel(panel);
            }
        },
        
        // Handle export functionality
        _handleExport: function() {
            const exportTypeBtn = document.querySelector('.chatooly-export-type-btn.active');
            const exportType = exportTypeBtn ? exportTypeBtn.dataset.type : 'image';
            
            if (exportType === 'image') {
                this._exportImage();
            } else if (exportType === 'video') {
                this._exportVideo();
            }
            
            // Hide panel after export
            const panel = document.querySelector('.chatooly-export-panel');
            if (panel) {
                this._hidePanel(panel);
            }
        },
        
        // Export image functionality
        _exportImage: function() {
            const scaleBtn = document.querySelector('.chatooly-scale-btn.active');
            const scale = scaleBtn ? parseFloat(scaleBtn.dataset.scale) : 1;
            
            if (Chatooly.export) {
                Chatooly.export('png', { resolution: scale });
            }
        },
        
        // Export video functionality
        _exportVideo: function() {
            if (Chatooly.animationMediaRecorder) {
                Chatooly.animationMediaRecorder.showExportDialog();
            }
        },
        
        // Handle video export from panel
        _handleVideoExport: function() {
            const duration = parseFloat(document.querySelector('#chatooly-video-duration')?.value || 5);
            const fps = parseInt(document.querySelector('#chatooly-video-fps')?.value || 30);
            const format = document.querySelector('#chatooly-video-format')?.value || 'webm-vp9';

            // Always use high quality (12 Mbps)
            const quality = 'high';
            const customBitrate = 12;

            // Handle PNG sequence export
            if (format === 'png-sequence') {
                if (Chatooly.animationSequenceExport) {
                    Chatooly.animationSequenceExport.exportSequence(duration, fps);
                } else {
                    alert('PNG Sequence export module not loaded');
                }

                // Hide panel after starting export
                const panel = document.querySelector('.chatooly-export-panel');
                if (panel) {
                    this._hidePanel(panel);
                }
                return;
            }

            if (Chatooly.animationMediaRecorder) {
                // Re-detect tool type in case it changed
                Chatooly.animationMediaRecorder.toolInfo = Chatooly.animationMediaRecorder.detectToolType();
                
                // Check if we have a valid canvas
                if (!Chatooly.animationMediaRecorder.toolInfo.canvas) {
                    alert('No canvas found for video recording. Make sure your canvas has id="chatooly-canvas"');
                    return;
                }
                
                // Create temporary DOM elements that the media recorder expects
                const tempDuration = document.createElement('input');
                tempDuration.id = 'anim-duration';
                tempDuration.value = duration;
                document.body.appendChild(tempDuration);
                
                const tempFps = document.createElement('select');
                tempFps.id = 'anim-fps';
                const fpsOption = document.createElement('option');
                fpsOption.value = fps;
                fpsOption.selected = true;
                tempFps.appendChild(fpsOption);
                document.body.appendChild(tempFps);
                
                const tempFormat = document.createElement('select');
                tempFormat.id = 'anim-format';
                const formatOption = document.createElement('option');
                formatOption.value = format;
                formatOption.selected = true;
                tempFormat.appendChild(formatOption);
                document.body.appendChild(tempFormat);
                
                // Add quality controls with actual values from UI
                const tempQuality = document.createElement('select');
                tempQuality.id = 'anim-quality';
                const qualityOption = document.createElement('option');
                qualityOption.value = quality;
                qualityOption.selected = true;
                tempQuality.appendChild(qualityOption);
                document.body.appendChild(tempQuality);
                
                const tempBitrate = document.createElement('input');
                tempBitrate.id = 'anim-bitrate';
                tempBitrate.value = customBitrate;
                document.body.appendChild(tempBitrate);
                
                // Start recording using the existing method
                Chatooly.animationMediaRecorder.startRecording();
                
                // Clean up temporary elements
                setTimeout(() => {
                    tempDuration.remove();
                    tempFps.remove();
                    tempFormat.remove();
                    tempQuality.remove();
                    tempBitrate.remove();
                }, 100);
            }
            
            // Hide panel after starting export
            const panel = document.querySelector('.chatooly-export-panel');
            if (panel) {
                this._hidePanel(panel);
            }
        },
        
        // Toggle panel visibility
        _togglePanel: function(panel) {
            if (panel.classList.contains('show')) {
                this._hidePanel(panel);
            } else {
                this._showPanel(panel);
            }
        },
        
        // Show panel with animation
        _showPanel: function(panel) {
            panel.style.display = 'flex';
            // Force reflow for animation
            panel.offsetHeight;
            panel.classList.add('show');
        },
        
        // Hide panel with animation
        _hidePanel: function(panel) {
            panel.classList.remove('show');
            setTimeout(() => {
                if (!panel.classList.contains('show')) {
                    panel.style.display = 'none';
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