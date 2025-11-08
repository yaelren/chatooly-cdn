/**
 * Chatooly CDN - Canvas Area Module
 * Manages the dedicated canvas area container for consistent layout and scrolling
 */

(function(Chatooly) {
    'use strict';
    
    Chatooly.canvasArea = {
        // Container references
        areaContainer: null,
        canvasElement: null,
        
        // Configuration
        config: {
            position: 'full', // Only 'full' is supported now
            padding: 20,
            backgroundColor: '#f5f5f5',
            borderColor: '#ddd'
        },
        
        // Drag state for canvas area scrolling
        dragState: {
            isDragging: false,
            startX: 0,
            startY: 0,
            scrollStartX: 0,
            scrollStartY: 0
        },
        
        // Initialize the canvas area
        init: function(userConfig) {
            // Merge user config
            if (userConfig) {
                Object.assign(this.config, userConfig);
            }
            
            // Create the canvas area container
            this.createContainer();
            
            // Find or wait for canvas
            this.detectCanvas();
            
            console.log('Chatooly: Canvas area initialized');
        },
        
        // Create the main canvas area container
        createContainer: function() {
            // First, check if the template already has the correct structure
            const templateContainer = document.getElementById('chatooly-container');
            const previewPanel = document.querySelector('.chatooly-preview-panel');
            
            if (templateContainer) {
                // Use the existing container from the template
                this.areaContainer = templateContainer;
                
                // Store reference to the preview panel (the actual full-size container)
                this.previewPanel = previewPanel;
                
                console.log('Chatooly: Using template chatooly-container with preview panel');
            } else {
                // Template doesn't have the required structure - this shouldn't happen with new tools
                console.error('Chatooly: No chatooly-container found in template. Please use the correct template structure.');
                console.error('Required structure: <div id="chatooly-container"><canvas id="chatooly-canvas"></canvas></div>');
                
                // Don't create a fallback - this forces proper template usage
                this.areaContainer = null;
                return;
            }
            
            // Apply styles based on position
            this.applyContainerStyles();
            
            // Inject CSS for consistent styling
            this.injectStyles();
        },
        
        // Apply container styles based on configuration
        applyContainerStyles: function() {
            if (!this.areaContainer) return;
            
            // Check if we're working with the template structure
            if (this.previewPanel) {
                // Working with template - chatooly-container should be centered in preview panel
                let containerStyles = {
                    position: 'relative', // Not fixed since it's inside preview panel
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '100%',
                    overflow: 'auto' // Enable scrolling when content exceeds bounds
                };
                
                // Apply styles to the container
                Object.assign(this.areaContainer.style, containerStyles);
                
                // Ensure preview panel maintains proper flex centering
                if (this.previewPanel) {
                    this.previewPanel.style.display = 'flex';
                    this.previewPanel.style.alignItems = 'center';
                    this.previewPanel.style.justifyContent = 'center';
                }
            } else {
                // Legacy mode - full positioning (for older templates)
                let styles = {
                    position: 'fixed',
                    backgroundColor: this.config.backgroundColor,
                    border: `1px solid ${this.config.borderColor}`,
                    overflow: 'auto', // Enable scrolling when content exceeds bounds
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '1',
                    boxSizing: 'border-box' // Ensure padding/border don't affect size calculations
                };
                
                // Check if there's a sidebar and leave space for it
                const sidebar = document.querySelector('.chatooly-controls-panel') || document.querySelector('.tools-sidebar');
                let sidebarWidth = 0;
                if (sidebar) {
                    // Get the computed style to ensure we get the actual rendered width
                    const sidebarStyle = window.getComputedStyle(sidebar);
                    sidebarWidth = sidebar.offsetWidth + 
                                 parseInt(sidebarStyle.marginLeft || 0) + 
                                 parseInt(sidebarStyle.marginRight || 0);
                }
                
                styles.top = '60px'; // Leave space for header/controls
                styles.left = sidebarWidth + 'px'; // Leave space for sidebar
                styles.right = '0';
                styles.bottom = '60px'; // Leave space for Chatooly button
                
                // Apply styles
                Object.assign(this.areaContainer.style, styles);
            }
        },
        
        // Inject global styles for canvas area
        injectStyles: function() {
            if (document.getElementById('chatooly-canvas-area-styles')) {
                return;
            }
            
            const style = document.createElement('style');
            style.id = 'chatooly-canvas-area-styles';
            style.textContent = `
                /* Canvas area container - works with both template and legacy */
                #chatooly-container, #chatooly-canvas-area {
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                }
                
                /* Template structure - ensure proper centering */
                .chatooly-preview-panel {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                
                #chatooly-container {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100%;
                    height: 100%;
                }
                
                /* Canvas inside the area - universal rules */
                #chatooly-container canvas, #chatooly-canvas-area canvas {
                    display: block;
                    margin: 0; /* Remove auto margin - let flexbox handle centering */
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    image-rendering: crisp-edges;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: -webkit-crisp-edges;
                    image-rendering: pixelated;
                    /* Ensure canvas is centered by flexbox parent */
                    flex-shrink: 0;
                }
                
                /* When zoomed, allow canvas to exceed container bounds */
                #chatooly-container.zoomed, #chatooly-canvas-area.zoomed {
                    overflow: auto;
                    cursor: grab;
                }
                
                #chatooly-container.zoomed.dragging, #chatooly-canvas-area.zoomed.dragging {
                    cursor: grabbing;
                    user-select: none;
                }
                
                /* Custom scrollbar for canvas area */
                #chatooly-container::-webkit-scrollbar, #chatooly-canvas-area::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                
                #chatooly-container::-webkit-scrollbar-track, #chatooly-canvas-area::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 6px;
                }
                
                #chatooly-container::-webkit-scrollbar-thumb, #chatooly-canvas-area::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 6px;
                }
                
                #chatooly-container::-webkit-scrollbar-thumb:hover, #chatooly-canvas-area::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                
                /* Zoom indicator inside canvas area */
                #chatooly-container .zoom-indicator, #chatooly-canvas-area .zoom-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 10;
                }
                
                /* Canvas fit modes */
                #chatooly-container[data-fit="contain"] canvas, #chatooly-canvas-area[data-fit="contain"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                #chatooly-container[data-fit="cover"] canvas, #chatooly-canvas-area[data-fit="cover"] canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                #chatooly-container[data-fit="actual"] canvas, #chatooly-canvas-area[data-fit="actual"] canvas {
                    width: auto;
                    height: auto;
                    max-width: none;
                    max-height: none;
                }
            `;
            
            document.head.appendChild(style);
        },
        
        // Detect canvas element inside the area
        detectCanvas: function() {
            // First check if canvas already exists in the area
            this.canvasElement = this.areaContainer.querySelector('canvas');
            
            if (this.canvasElement) {
                this.setupCanvas();
                return;
            }
            
            // Try to find existing canvas and move it
            const existingCanvas = document.querySelector('canvas#chatooly-canvas') || 
                                 document.querySelector('canvas');
            
            if (existingCanvas) {
                this.moveCanvasToArea(existingCanvas);
            } else {
                // Set up observer to wait for canvas creation
                this.observeForCanvas();
            }
        },
        
        // Move existing canvas into the canvas area
        moveCanvasToArea: function(canvas) {
            // Store canvas reference
            this.canvasElement = canvas;
            
            // Ensure canvas has ID for easy reference
            if (!canvas.id) {
                canvas.id = 'chatooly-canvas';
            }
            
            // Check if canvas is already in the correct container
            if (canvas.parentElement === this.areaContainer) {
                console.log('Chatooly: Canvas already in correct container (no move needed)');
            } else {
                // Move canvas to area container
                this.areaContainer.appendChild(canvas);
                console.log('Chatooly: Canvas moved to canvas area');
            }
            
            // Setup canvas properties
            this.setupCanvas();
        },
        
        // Setup canvas properties and events
        setupCanvas: function() {
            if (!this.canvasElement) return;
            
            // Reset any existing transforms or positioning
            this.canvasElement.style.position = 'static'; // Use static for better flex behavior
            this.canvasElement.style.transform = '';
            this.canvasElement.style.left = '';
            this.canvasElement.style.top = '';
            this.canvasElement.style.margin = '0'; // Ensure no margin interferes with flexbox
            
            // Store original dimensions
            this.originalWidth = this.canvasElement.width;
            this.originalHeight = this.canvasElement.height;
            
            // Fit canvas to area initially
            this.fitCanvasToArea();
            
            // Setup drag-to-scroll functionality
            this.setupDragToScroll();
            
            // Setup window resize listener to adjust for sidebar changes
            this.setupResizeListener();
            
            // Notify other modules
            if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.setCanvasArea(this.areaContainer, this.canvasElement);
            }
            
            console.log(`Chatooly: Canvas setup complete - ${this.originalWidth}x${this.originalHeight}`);
        },
        
        // Observe DOM for canvas creation
        observeForCanvas: function() {
            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (node.tagName === 'CANVAS') {
                            observer.disconnect();
                            this.moveCanvasToArea(node);
                            return;
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                observer.disconnect();
                console.warn('Chatooly: No canvas detected after 5 seconds');
            }, 5000);
        },
        
        // Fit canvas to area while maintaining aspect ratio
        fitCanvasToArea: function() {
            if (!this.canvasElement || !this.areaContainer) return;
            
            const areaRect = this.areaContainer.getBoundingClientRect();
            const padding = this.config.padding * 2;
            const availableWidth = areaRect.width - padding;
            const availableHeight = areaRect.height - padding;
            
            // Calculate scale to fit
            const scaleX = availableWidth / this.originalWidth;
            const scaleY = availableHeight / this.originalHeight;
            const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
            
            // Apply display dimensions
            const displayWidth = this.originalWidth * scale;
            const displayHeight = this.originalHeight * scale;
            
            this.canvasElement.style.width = displayWidth + 'px';
            this.canvasElement.style.height = displayHeight + 'px';
            
            // Store display dimensions
            this.displayWidth = displayWidth;
            this.displayHeight = displayHeight;
            
            console.log(`Chatooly: Canvas fitted to area - Display: ${Math.round(displayWidth)}x${Math.round(displayHeight)}`);
        },
        
        // Set canvas export resolution (different from display size)
        setExportResolution: function(width, height) {
            if (!this.canvasElement) return;
            
            // Update canvas internal resolution
            this.canvasElement.width = width;
            this.canvasElement.height = height;
            
            // Store as export dimensions
            this.exportWidth = width;
            this.exportHeight = height;
            
            // Update original dimensions for aspect ratio calculations
            this.originalWidth = width;
            this.originalHeight = height;
            
            // NEW: Update canvas resize bar UI inputs if they exist
            const widthInput = document.getElementById('chatooly-canvas-width');
            const heightInput = document.getElementById('chatooly-canvas-height');
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;
            
            // Refit to area with new aspect ratio
            this.fitCanvasToArea();
            
            // Trigger redraw
            this.triggerRedraw();
            
            console.log(`Chatooly: Export resolution set to ${width}x${height}`);
        },
        
        // Get current dimensions
        getDimensions: function() {
            return {
                display: {
                    width: this.displayWidth || 0,
                    height: this.displayHeight || 0
                },
                export: {
                    width: this.exportWidth || this.originalWidth || 0,
                    height: this.exportHeight || this.originalHeight || 0
                },
                canvas: {
                    width: this.canvasElement ? this.canvasElement.width : 0,
                    height: this.canvasElement ? this.canvasElement.height : 0
                }
            };
        },
        
        // Enable zoomed mode (shows scrollbars)
        enableZoomMode: function(enabled) {
            if (this.areaContainer) {
                if (enabled) {
                    this.areaContainer.classList.add('zoomed');
                } else {
                    this.areaContainer.classList.remove('zoomed');
                    // Reset scroll position
                    this.areaContainer.scrollLeft = 0;
                    this.areaContainer.scrollTop = 0;
                }
            }
        },
        
        // Center canvas in view (useful after zoom)
        centerCanvas: function() {
            if (!this.areaContainer || !this.canvasElement) return;
            
            // Ensure proper flexbox centering for template structure
            if (this.previewPanel) {
                this.previewPanel.style.display = 'flex';
                this.previewPanel.style.alignItems = 'center';
                this.previewPanel.style.justifyContent = 'center';
            }
            
            this.areaContainer.style.display = 'flex';
            this.areaContainer.style.alignItems = 'center';
            this.areaContainer.style.justifyContent = 'center';
            
            // Get the actual dimensions
            const areaWidth = this.areaContainer.clientWidth;
            const areaHeight = this.areaContainer.clientHeight;
            const canvasWidth = this.canvasElement.offsetWidth;
            const canvasHeight = this.canvasElement.offsetHeight;
            
            // Only use scroll centering if canvas is larger than area (zoomed)
            if (canvasWidth > areaWidth || canvasHeight > areaHeight) {
                // Calculate center position
                const scrollLeft = Math.max(0, (canvasWidth - areaWidth) / 2);
                const scrollTop = Math.max(0, (canvasHeight - areaHeight) / 2);
                
                // Smooth scroll to center
                this.areaContainer.scrollTo({
                    left: scrollLeft,
                    top: scrollTop,
                    behavior: 'smooth'
                });
                
                console.log(`Chatooly: Canvas centered via scroll - ${Math.round(scrollLeft)}, ${Math.round(scrollTop)}`);
            } else {
                // Canvas fits in area - reset scroll to ensure flexbox centering works
                this.areaContainer.scrollTo({
                    left: 0,
                    top: 0,
                    behavior: 'smooth'
                });
                
                console.log('Chatooly: Canvas centered via flexbox (fits in area)');
            }
        },
        
        // Trigger redraw for various frameworks
        triggerRedraw: function() {
            // p5.js
            if (window.redraw && typeof window.redraw === 'function') {
                window.redraw();
            }
            
            // Three.js
            if (window.renderer && window.renderer.render && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            }
            
            // Custom redraw
            if (window.chatoolyRedraw && typeof window.chatoolyRedraw === 'function') {
                window.chatoolyRedraw();
            }
            
            // Dispatch event
            const event = new CustomEvent('chatooly:canvas-resized', {
                detail: this.getDimensions(),
                bubbles: true
            });
            document.dispatchEvent(event);
        },
        
        // Setup drag-to-scroll functionality for canvas area
        setupDragToScroll: function() {
            if (!this.areaContainer) return;
            
            // Mouse events for drag scrolling
            this.areaContainer.addEventListener('mousedown', (e) => {
                // Only start dragging if not clicking on canvas directly (let zoom handle that)
                if (e.target === this.areaContainer || e.target === this.canvasElement) {
                    this.startDrag(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.dragState.isDragging) {
                    this.updateDrag(e.clientX, e.clientY);
                }
            });
            
            document.addEventListener('mouseup', () => {
                this.endDrag();
            });
            
            // Touch events for mobile
            this.areaContainer.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    this.startDrag(touch.clientX, touch.clientY);
                }
            }, { passive: true });
            
            this.areaContainer.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && this.dragState.isDragging) {
                    e.preventDefault();
                    const touch = e.touches[0];
                    this.updateDrag(touch.clientX, touch.clientY);
                }
            }, { passive: false });
            
            this.areaContainer.addEventListener('touchend', () => {
                this.endDrag();
            });
        },
        
        // Start dragging
        startDrag: function(clientX, clientY) {
            this.dragState.isDragging = true;
            this.dragState.startX = clientX;
            this.dragState.startY = clientY;
            this.dragState.scrollStartX = this.areaContainer.scrollLeft;
            this.dragState.scrollStartY = this.areaContainer.scrollTop;
            
            this.areaContainer.classList.add('dragging');
        },
        
        // Update drag position
        updateDrag: function(clientX, clientY) {
            if (!this.dragState.isDragging) return;
            
            const deltaX = this.dragState.startX - clientX;
            const deltaY = this.dragState.startY - clientY;
            
            this.areaContainer.scrollLeft = this.dragState.scrollStartX + deltaX;
            this.areaContainer.scrollTop = this.dragState.scrollStartY + deltaY;
        },
        
        // End dragging
        endDrag: function() {
            if (this.dragState.isDragging) {
                this.dragState.isDragging = false;
                this.areaContainer.classList.remove('dragging');
            }
        },
        
        // Update configuration
        updateConfig: function(newConfig) {
            Object.assign(this.config, newConfig);
            this.applyContainerStyles();
        },
        
        // Setup window resize listener
        setupResizeListener: function() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                // Debounce resize events
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.applyContainerStyles(); // Recalculate sidebar space
                    this.fitCanvasToArea(); // Refit canvas to new area
                }, 250);
            });
        },
        
        // Add reset zoom and center function
        resetZoomAndCenter: function() {
            // Reset zoom first
            if (Chatooly.canvasZoom) {
                Chatooly.canvasZoom.resetZoom();
            }
            
            // Then center the canvas
            setTimeout(() => {
                this.centerCanvas();
            }, 100);
        },
        
        // Destroy and cleanup
        destroy: function() {
            if (this.areaContainer) {
                this.areaContainer.remove();
            }
            const styles = document.getElementById('chatooly-canvas-area-styles');
            if (styles) {
                styles.remove();
            }
            this.areaContainer = null;
            this.canvasElement = null;
        }
    };
    
})(window.Chatooly);