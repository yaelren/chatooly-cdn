/**
 * Chatooly CDN - Canvas Resizer Module
 * Handles canvas and DOM element resizing for export
 */

(function(Chatooly) {
    'use strict';
    
    Chatooly.canvasResizer = {
        // Export dimensions (what resolution the image exports at)
        exportWidth: 800,
        exportHeight: 600,
        
        // Set export resolution
        setExportSize: function(width, height) {
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;
            
            this.applyExportSize();
        },
        
        // Apply export size from input fields
        applyExportSize: function() {
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            
            if (!widthInput || !heightInput) {
                console.warn('Chatooly: Canvas size inputs not found');
                return;
            }
            
            const width = parseInt(widthInput.value) || 800;
            const height = parseInt(heightInput.value) || 600;
            
            // Validate dimensions
            if (width < 100 || width > 4000 || height < 100 || height > 4000) {
                alert('Export dimensions must be between 100 and 4000 pixels');
                return;
            }
            
            // Store export dimensions
            this.exportWidth = width;
            this.exportHeight = height;
            Chatooly.config.canvasWidth = width;
            Chatooly.config.canvasHeight = height;
            
            // If using canvas area, update its export resolution
            if (Chatooly.canvasArea) {
                Chatooly.canvasArea.setExportResolution(width, height);
            } else {
                // Legacy: apply to detected target
                const target = Chatooly.utils.detectExportTarget();
                if (target.element) {
                    this.applyLegacyResize(target, width, height);
                }
            }
            
            console.log(`Chatooly: Export resolution set to ${width}x${height}`);
            
            // Hide menu after applying
            const menu = document.querySelector('.chatooly-btn-menu');
            if (menu && Chatooly.ui && Chatooly.ui._hideMenu) {
                Chatooly.ui._hideMenu(menu);
            }
        },
        
        // For backward compatibility - old applySize redirects to new method
        applySize: function() {
            this.applyExportSize();
        },
        
        // Legacy resize for backward compatibility
        applyLegacyResize: function(target, exportWidth, exportHeight) {
            const element = target.element;
            
            if (target.type === 'canvas') {
                this._resizeCanvasDirectly(element, exportWidth, exportHeight);
            } else {
                this._resizeDOMElement(element, exportWidth, exportHeight);
            }
        },
        
        // Resize canvas directly - new approach for canvas#chatooly-canvas
        _resizeCanvasDirectly: function(canvas, exportWidth, exportHeight) {
            // Check if canvas has a parent container for positioning
            const parent = canvas.parentElement;
            let useContainerPosition = false;
            
            // If canvas is in a container div, use that for positioning context
            if (parent && parent.tagName === 'DIV' && parent !== document.body) {
                useContainerPosition = true;
                // Make container the positioning context
                if (parent.style.position === '' || parent.style.position === 'static') {
                    parent.style.position = 'relative';
                }
            }
            
            // Calculate display dimensions based on available space
            let availableWidth, availableHeight;
            
            if (useContainerPosition && parent) {
                // Use parent container dimensions
                const parentRect = parent.getBoundingClientRect();
                availableWidth = parentRect.width || window.innerWidth - 100;
                availableHeight = parentRect.height || window.innerHeight - 200;
            } else {
                // Use viewport with UI offsets
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                const uiOffset = {
                    top: 60,
                    right: 100,
                    bottom: 60,
                    left: 60
                };
                
                availableWidth = viewportWidth - uiOffset.left - uiOffset.right;
                availableHeight = viewportHeight - uiOffset.top - uiOffset.bottom;
            }
            
            // Calculate scale to fit export dimensions within available space
            const scale = Math.min(
                availableWidth / exportWidth,
                availableHeight / exportHeight,
                1 // Don't scale up beyond 100%
            );
            
            const displayWidth = exportWidth * scale;
            const displayHeight = exportHeight * scale;
            
            // Position canvas based on context
            if (useContainerPosition) {
                // Position relative to parent container
                canvas.style.position = 'relative';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.margin = 'auto';
                canvas.style.display = 'block';
            } else {
                // Position fixed in viewport
                canvas.style.position = 'fixed';
                canvas.style.top = '50%';
                canvas.style.left = '50%';
                canvas.style.transform = 'translate(-50%, -50%)';
            }
            
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            canvas.style.zIndex = '1';
            
            // Set canvas resolution for export
            if (canvas.width !== exportWidth || canvas.height !== exportHeight) {
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                
                console.log(`Chatooly: Canvas resolution set to ${exportWidth}x${exportHeight}px (export quality)`);
                
                // Trigger redraw for frameworks
                this._triggerRedraw();
                this._dispatchResizeEvent(displayWidth, displayHeight);
                
                // Update zoom with new dimensions
                if (Chatooly.canvasZoom) {
                    Chatooly.canvasZoom.onCanvasResize(displayWidth, displayHeight);
                }
            }
            
            console.log(`Chatooly: Canvas display set to ${Math.round(displayWidth)}x${Math.round(displayHeight)}px, export at ${exportWidth}x${exportHeight}px`);
        },
        
        // Resize DOM element - legacy approach for div#chatooly-canvas
        _resizeDOMElement: function(element, exportWidth, exportHeight) {
            // Use legacy container-based approach for DOM elements
            let container = this._findContainer(element);
            
            if (!container) {
                console.log('Chatooly: No container found, using viewport for scaling');
                container = this._createOrGetViewportContainer(element);
            }
            
            this._maximizeContainer(container);
            
            requestAnimationFrame(() => {
                container.offsetHeight; // Force reflow
                
                const displayDimensions = this._calculateDisplayDimensions(
                    container, exportWidth, exportHeight
                );
                
                this._applyDomDimensions(element, displayDimensions, exportWidth, exportHeight);
                
                console.log(`Chatooly: DOM element scaled - Display: ${Math.round(displayDimensions.width)}x${Math.round(displayDimensions.height)}, Export: ${exportWidth}x${exportHeight}`);
            });
        },
        
        // Find the container element for scaling calculations
        _findContainer: function(element) {
            let container = element.parentElement;
            
            if (!container || container.id !== 'chatooly-canvas') {
                // Find the chatooly-canvas container
                while (container && container.id !== 'chatooly-canvas') {
                    container = container.parentElement;
                }
            }
            
            return container;
        },
        
        // Create or get a viewport-sized container
        _createOrGetViewportContainer: function(element) {
            // Check if we already have a fallback container
            let container = document.getElementById('chatooly-viewport-container');
            
            if (!container) {
                // Create a new viewport container
                container = document.createElement('div');
                container.id = 'chatooly-viewport-container';
                container.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                `;
                
                // If element has a parent, use it as reference
                if (element.parentElement) {
                    // Just use parent dimensions without creating new container
                    return element.parentElement;
                }
                
                // Otherwise append to body
                document.body.appendChild(container);
            }
            
            return container;
        },
        
        // Maximize container to fill available space
        _maximizeContainer: function(container) {
            // Skip if it's the viewport container or body
            if (container.id === 'chatooly-viewport-container' || container === document.body) {
                console.log('Chatooly: Skipping container maximization (viewport container or body)');
                return;
            }
            
            // If it's the chatooly-canvas container, maximize it
            if (container.id === 'chatooly-canvas') {
                // Get current dimensions before maximizing
                const beforeRect = container.getBoundingClientRect();
                
                // Account for UI elements (sidebar, menu button, etc.)
                const uiOffset = {
                    top: 20,
                    right: 100, // Account for Chatooly button
                    bottom: 100, // Account for Chatooly button
                    left: 20
                };
                
                // Check for any visible sidebars or panels
                const sidebar = document.querySelector('.chatooly-sidebar, .sidebar, aside');
                if (sidebar && sidebar.offsetWidth > 0) {
                    uiOffset.left = Math.max(sidebar.offsetWidth + 20, uiOffset.left);
                }
                
                // Apply maximized dimensions
                container.style.position = container.style.position || 'relative';
                container.style.width = `calc(100vw - ${uiOffset.left + uiOffset.right}px)`;
                container.style.height = `calc(100vh - ${uiOffset.top + uiOffset.bottom}px)`;
                container.style.maxWidth = '100%';
                container.style.maxHeight = '100%';
                container.style.margin = 'auto';
                
                console.log(`Chatooly: Container maximized from ${Math.round(beforeRect.width)}x${Math.round(beforeRect.height)} to viewport size`);
            } else {
                console.log(`Chatooly: Container maximization skipped (not chatooly-canvas): ${container.id || container.className}`);
            }
        },
        
        // Calculate display dimensions to fit as large as possible while maintaining aspect ratio
        _calculateDisplayDimensions: function(container, exportWidth, exportHeight) {
            // Get container dimensions with minimal padding
            const containerRect = container.getBoundingClientRect();
            const padding = 10; // Minimal padding
            const availableWidth = Math.max(containerRect.width - padding, 200);
            const availableHeight = Math.max(containerRect.height - padding, 200);
            
            console.log(`Chatooly: Container available space: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)} -> ${Math.round(availableWidth)}x${Math.round(availableHeight)} (after padding)`);
            
            // Calculate scale to fit as large as possible while maintaining export aspect ratio
            const scale = Math.min(
                availableWidth / exportWidth,
                availableHeight / exportHeight
            );
            
            // Canvas display size maintains aspect ratio of export dimensions
            const result = {
                width: exportWidth * scale,
                height: exportHeight * scale,
                scale: scale
            };
            
            console.log(`Chatooly: Canvas sized to maintain aspect ratio: ${Math.round(result.width)}x${Math.round(result.height)} display (${scale.toFixed(3)}x scale), ${exportWidth}x${exportHeight} export`);
            
            return result;
        },
        
        // Apply dimensions to canvas element
        _applyCanvasDimensions: function(canvas, displayDimensions, exportWidth, exportHeight) {
            // Set canvas display size to EXACTLY the calculated dimensions
            // This ensures perfect aspect ratio matching the export dimensions
            canvas.style.width = displayDimensions.width + 'px';
            canvas.style.height = displayDimensions.height + 'px';
            canvas.style.maxWidth = 'none'; // No constraints - use exact calculated size
            canvas.style.maxHeight = 'none'; // No constraints - use exact calculated size
            canvas.style.display = 'block';
            canvas.style.margin = '0'; // No margin - let container handle positioning
            canvas.style.objectFit = 'fill'; // Fill the exact dimensions we set
            
            console.log(`Chatooly: Canvas display set to EXACT size: ${displayDimensions.width}x${displayDimensions.height}px (perfect aspect ratio)`);
            
            // Set actual canvas resolution for export (different from display size)
            if (canvas.width !== exportWidth || canvas.height !== exportHeight) {
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                
                console.log(`Chatooly: Canvas resolution set to ${exportWidth}x${exportHeight}px (export quality)`);
                
                // Trigger redraw for different frameworks with DISPLAY dimensions
                // Frameworks need to know the display size, not export size
                this._triggerRedraw();
                
                // Dispatch resize event with DISPLAY dimensions for frameworks
                this._dispatchResizeEvent(displayDimensions.width, displayDimensions.height);
                
                // Initialize or update zoom for the new canvas size
                if (Chatooly.canvasZoom) {
                    Chatooly.canvasZoom.onCanvasResize(displayDimensions.width, displayDimensions.height);
                }
            }
            
            // Container centers the perfectly-sized canvas
            if (canvas.parentElement && canvas.parentElement.id === 'chatooly-canvas') {
                canvas.parentElement.style.display = 'flex';
                canvas.parentElement.style.alignItems = 'center';
                canvas.parentElement.style.justifyContent = 'center';
                canvas.parentElement.style.padding = '5px';
                canvas.parentElement.style.overflow = 'hidden';
            }
        },
        
        // Apply dimensions to DOM element
        _applyDomDimensions: function(element, displayDimensions, exportWidth, exportHeight) {
            // Set display size
            element.style.width = displayDimensions.width + 'px';
            element.style.height = displayDimensions.height + 'px';
            
            // Store dimensions for export
            element.dataset.exportWidth = exportWidth;
            element.dataset.exportHeight = exportHeight;
        },
        
        // Trigger redraw for various frameworks
        _triggerRedraw: function() {
            // p5.js
            if (window.redraw && typeof window.redraw === 'function') {
                window.redraw();
            }
            
            // Three.js
            if (window.renderer && window.renderer.render && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            }
            
            // Custom redraw function
            if (window.chatoolyRedraw && typeof window.chatoolyRedraw === 'function') {
                window.chatoolyRedraw();
            }
        },
        
        // Dispatch resize event for frameworks that need it
        _dispatchResizeEvent: function(displayWidth, displayHeight) {
            // Get the actual canvas element
            const target = Chatooly.utils.detectExportTarget();
            let canvasWidth = this.exportWidth;
            let canvasHeight = this.exportHeight;
            
            if (target.type === 'canvas' && target.element) {
                canvasWidth = target.element.width;
                canvasHeight = target.element.height;
            }
            
            const eventDetail = {
                display: {
                    width: displayWidth,
                    height: displayHeight
                },
                canvas: {
                    width: canvasWidth,
                    height: canvasHeight
                },
                scale: {
                    x: canvasWidth / displayWidth,
                    y: canvasHeight / displayHeight
                },
                // Helper function to convert mouse coordinates
                mapMouseEvent: function(mouseEvent) {
                    const rect = target.element ? target.element.getBoundingClientRect() : { left: 0, top: 0 };
                    const displayX = mouseEvent.clientX - rect.left;
                    const displayY = mouseEvent.clientY - rect.top;
                    
                    return {
                        canvasX: displayX * (canvasWidth / displayWidth),
                        canvasY: displayY * (canvasHeight / displayHeight),
                        displayX: displayX,
                        displayY: displayY
                    };
                }
            };
            
            const event = new CustomEvent('chatooly:canvas-resized', {
                detail: eventDetail,
                bubbles: true
            });
            document.dispatchEvent(event);
            console.log(`Chatooly: Canvas resized - Display: ${displayWidth}x${displayHeight}, Canvas: ${canvasWidth}x${canvasHeight}`);
        },
        
        // Get current export dimensions
        getCurrentDimensions: function() {
            // If canvas area is active, use its dimensions
            if (Chatooly.canvasArea) {
                const dims = Chatooly.canvasArea.getDimensions();
                return {
                    width: dims.export.width || this.exportWidth,
                    height: dims.export.height || this.exportHeight
                };
            }
            
            // Legacy: detect from element
            const target = Chatooly.utils.detectExportTarget();
            if (!target.element) return { width: this.exportWidth, height: this.exportHeight };
            
            if (target.type === 'canvas') {
                return {
                    width: target.element.width || this.exportWidth,
                    height: target.element.height || this.exportHeight
                };
            } else if (target.type === 'dom') {
                return {
                    width: parseInt(target.element.dataset.exportWidth) || this.exportWidth,
                    height: parseInt(target.element.dataset.exportHeight) || this.exportHeight
                };
            }
            
            return { width: this.exportWidth, height: this.exportHeight };
        },
        
        // Preset sizes for quick selection
        presets: {
            HD: { width: 1920, height: 1080 },
            Square: { width: 1200, height: 1200 },
            FourThree: { width: 800, height: 600 },
            Portrait: { width: 1080, height: 1920 },
            Instagram: { width: 1080, height: 1080 },
            TwitterCard: { width: 1200, height: 675 },
            FacebookCover: { width: 1200, height: 630 }
        },
        
        // Apply a preset size
        applyPreset: function(presetName) {
            const preset = this.presets[presetName];
            if (preset) {
                this.setExportSize(preset.width, preset.height);
            } else {
                console.warn(`Chatooly: Preset '${presetName}' not found`);
            }
        }
    };
    
})(window.Chatooly);