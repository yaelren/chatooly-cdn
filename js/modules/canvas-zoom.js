/**
 * Chatooly CDN - Canvas Zoom Module
 * Direct canvas zoom - works with <canvas id="chatooly-canvas"> without wrapper divs
 */

(function(Chatooly) {
    'use strict';
    
    Chatooly.canvasZoom = {
        // Zoom state
        currentZoom: 1.0,
        minZoom: 0.1,
        maxZoom: 10.0,
        zoomStep: 0.1,
        
        // Pan state
        panX: 0,
        panY: 0,
        isPanning: false,
        lastPanPoint: null,
        spacebarPressed: false,
        
        // Canvas info
        canvasElement: null,
        canvasArea: null,
        baseWidth: 0,
        baseHeight: 0,
        centerX: 0,
        centerY: 0,
        
        // Initialize zoom functionality
        init: function() {
            // Wait for canvas area to be ready
            if (Chatooly.canvasArea && Chatooly.canvasArea.canvasElement) {
                this.setCanvasArea(Chatooly.canvasArea.areaContainer, Chatooly.canvasArea.canvasElement);
            } else if (this.findCanvas()) {
                this.setupCanvasForZoom();
                this.setupZoomControls();
            }
        },
        
        // Set canvas area and element (called by canvas-area module)
        setCanvasArea: function(areaContainer, canvasElement) {
            this.canvasArea = areaContainer;
            this.canvasElement = canvasElement;
            this.setupCanvasForZoom();
            this.setupZoomControls();
        },
        
        // Find canvas - check canvas area first, then fallback
        findCanvas: function() {
            // First check if canvas area exists
            const canvasArea = document.getElementById('chatooly-canvas-area');
            if (canvasArea) {
                this.canvasArea = canvasArea;
                this.canvasElement = canvasArea.querySelector('canvas');
                if (this.canvasElement) {
                    return true;
                }
            }
            
            // Fallback: use detection system
            const target = Chatooly.utils.detectExportTarget();
            if (target && target.element && target.element.tagName === 'CANVAS') {
                this.canvasElement = target.element;
                return true;
            }
            
            console.warn('Chatooly: No canvas found for zoom');
            return false;
        },
        
        // Setup canvas for zoom functionality
        setupCanvasForZoom: function() {
            if (!this.canvasElement) return;
            
            // Store base dimensions
            const rect = this.canvasElement.getBoundingClientRect();
            this.baseWidth = rect.width;
            this.baseHeight = rect.height;
            this.centerX = this.baseWidth / 2;
            this.centerY = this.baseHeight / 2;
            
            // Store original position style
            this.originalPosition = this.canvasElement.style.position || 'relative';
            this.originalTransform = this.canvasElement.style.transform || '';
            
            // Set transform origin for zoom from center
            this.canvasElement.style.transformOrigin = 'center center';
            
            // Don't modify body overflow if using canvas area
            if (!this.canvasArea) {
                document.body.style.overflow = 'auto';
            }
            
        },
        
        // Setup zoom control event listeners
        setupZoomControls: function() {
            // Global zoom controls (work anywhere on page)
            
            // Mouse wheel zoom (Ctrl + scroll)
            document.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
                    this.zoom(delta, e.clientX, e.clientY);
                }
            }, { passive: false });
            
            // Keyboard zoom and spacebar tracking
            document.addEventListener('keydown', (e) => {
                // Track spacebar state for pan control
                if (e.code === 'Space') {
                    this.spacebarPressed = true;
                    this.updateCursor(); // Update cursor when spacebar is pressed
                    // Prevent default when hovering over canvas to enable panning
                    if (e.target === this.canvasElement || this.canvasElement?.contains(e.target)) {
                        e.preventDefault();
                    }
                }
                
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === '=' || e.key === '+') {
                        e.preventDefault();
                        this.zoomToCenter(this.zoomStep);
                    } else if (e.key === '-') {
                        e.preventDefault();
                        this.zoomToCenter(-this.zoomStep);
                    } else if (e.key === '0') {
                        e.preventDefault();
                        this.resetZoom();
                    }
                } else if (e.key === 'r' || e.key === 'R') {
                    // R key for reset and center (without modifier) - only if not typing
                    const activeElement = document.activeElement;
                    const isTyping = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.contentEditable === 'true' ||
                        activeElement.isContentEditable
                    );
                    
                    if (!isTyping) {
                        e.preventDefault();
                        if (Chatooly.canvasArea && Chatooly.canvasArea.resetZoomAndCenter) {
                            Chatooly.canvasArea.resetZoomAndCenter();
                        } else {
                            this.resetZoom();
                        }
                    }
                }
            });
            
            // Track spacebar release
            document.addEventListener('keyup', (e) => {
                if (e.code === 'Space') {
                    this.spacebarPressed = false;
                    this.updateCursor(); // Update cursor when spacebar is released
                    // End any active panning when spacebar is released
                    this.endPan();
                }
            });
            
            // Pan controls (drag canvas when spacebar pressed at any zoom level)
            document.addEventListener('mousedown', (e) => {
                if (e.target === this.canvasElement && this.spacebarPressed) {
                    this.startPan(e.clientX, e.clientY);
                    e.preventDefault();
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.isPanning) {
                    this.updatePan(e.clientX, e.clientY);
                    e.preventDefault();
                }
            });
            
            document.addEventListener('mouseup', () => {
                this.endPan();
            });
            
            // Touch/trackpad support
            this.setupTouchControls();
            
        },
        
        // Touch and trackpad zoom
        setupTouchControls: function() {
            let initialDistance = 0;
            let initialZoom = 1;
            
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                    initialZoom = this.currentZoom;
                }
            }, { passive: false });
            
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                    const scale = currentDistance / initialDistance;
                    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialZoom * scale));
                    
                    // Get center point of pinch
                    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    
                    this.setZoom(newZoom, centerX, centerY);
                }
            }, { passive: false });
        },
        
        // Get distance between two touch points
        getTouchDistance: function(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        // Zoom toward specific point
        zoom: function(delta, clientX, clientY) {
            const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + delta));
            this.setZoom(newZoom, clientX, clientY);
        },
        
        // Zoom toward center of canvas
        zoomToCenter: function(delta) {
            const rect = this.canvasElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.zoom(delta, centerX, centerY);
        },
        
        // Set specific zoom level toward a point
        setZoom: function(zoom, clientX, clientY) {
            if (!this.canvasElement) return;
            
            const oldZoom = this.currentZoom;
            this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
            
            if (this.currentZoom === oldZoom) return;
            
            // If zoom point provided, adjust pan to zoom toward that point
            if (clientX !== undefined && clientY !== undefined) {
                const rect = this.canvasElement.getBoundingClientRect();
                const canvasX = clientX - rect.left;
                const canvasY = clientY - rect.top;
                
                // Calculate new pan to keep the point under cursor
                const zoomRatio = this.currentZoom / oldZoom;
                const deltaX = canvasX * (zoomRatio - 1);
                const deltaY = canvasY * (zoomRatio - 1);
                
                this.panX -= deltaX;
                this.panY -= deltaY;
            }
            
            this.applyTransform();
            this.updateBodySize();
            this.showZoomIndicator();
            
        },
        
        // Reset zoom and pan
        resetZoom: function() {
            this.currentZoom = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.applyTransform();
            this.updateBodySize();
            this.showZoomIndicator();
            
            // Center canvas in canvas area if using canvas area
            if (this.canvasArea && Chatooly.canvasArea) {
                setTimeout(() => {
                    Chatooly.canvasArea.centerCanvas();
                }, 50);
            }
            
        },
        
        // Apply zoom and pan transform
        applyTransform: function() {
            if (!this.canvasElement) return;
            
            // Simple transform without preserving original (canvas area handles positioning)
            const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
            this.canvasElement.style.transform = transform;
            
            // Update cursor based on zoom and spacebar state
            this.updateCursor();
            
            // Update canvas area zoom mode
            if (this.canvasArea && Chatooly.canvasArea) {
                Chatooly.canvasArea.enableZoomMode(this.currentZoom > 1.0);
            }
        },
        
        // Update scrollable area size
        updateBodySize: function() {
            // If using canvas area, it handles scrolling
            if (this.canvasArea) {
                // Canvas area handles its own scrolling
                return;
            }
            
            // Legacy: update body size for scrolling
            const zoomedWidth = this.baseWidth * this.currentZoom;
            const zoomedHeight = this.baseHeight * this.currentZoom;
            
            const totalWidth = Math.max(window.innerWidth, zoomedWidth + Math.abs(this.panX) + 100);
            const totalHeight = Math.max(window.innerHeight, zoomedHeight + Math.abs(this.panY) + 100);
            
            document.body.style.minWidth = totalWidth + 'px';
            document.body.style.minHeight = totalHeight + 'px';
        },
        
        // Pan controls
        startPan: function(x, y) {
            this.isPanning = true;
            this.lastPanPoint = { x, y };
            this.canvasElement.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        },
        
        updatePan: function(x, y) {
            if (!this.isPanning || !this.lastPanPoint) return;
            
            const deltaX = x - this.lastPanPoint.x;
            const deltaY = y - this.lastPanPoint.y;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.applyTransform();
            this.updateBodySize();
            
            this.lastPanPoint = { x, y };
        },
        
        endPan: function() {
            if (this.isPanning) {
                this.isPanning = false;
                this.lastPanPoint = null;
                this.updateCursor();
                document.body.style.userSelect = '';
            }
        },
        
        // Update cursor based on current state
        updateCursor: function() {
            if (!this.canvasElement) return;
            
            if (this.isPanning) {
                this.canvasElement.style.cursor = 'grabbing';
            } else if (this.spacebarPressed) {
                this.canvasElement.style.cursor = 'grab';
            } else {
                this.canvasElement.style.cursor = 'default';
            }
        },
        
        // Show zoom level indicator
        showZoomIndicator: function() {
            let indicator = document.getElementById('chatooly-zoom-indicator');
            const parent = this.canvasArea || document.body;
            
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'chatooly-zoom-indicator';
                indicator.className = 'zoom-indicator';
                
                // Different positioning based on parent
                if (this.canvasArea) {
                    indicator.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 14px;
                        pointer-events: none;
                        z-index: 10;
                        transition: opacity 0.3s ease;
                    `;
                } else {
                    indicator.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 14px;
                        pointer-events: none;
                        z-index: 1000;
                        transition: opacity 0.3s ease;
                    `;
                }
                
                parent.appendChild(indicator);
            }
            
            const zoomPercent = Math.round(this.currentZoom * 100);
            indicator.textContent = `${zoomPercent}%`;
            indicator.style.opacity = '1';
            
            // Hide at 100% after delay
            clearTimeout(this.indicatorTimeout);
            if (zoomPercent === 100) {
                this.indicatorTimeout = setTimeout(() => {
                    indicator.style.opacity = '0';
                }, 2000);
            }
        },
        
        // Update when canvas is resized by canvas-resizer
        onCanvasResize: function(width, height) {
            // Debounce rapid resize calls to prevent feedback loops
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                this.baseWidth = width;
                this.baseHeight = height;
                this.centerX = width / 2;
                this.centerY = height / 2;
                
                // Reset zoom and pan to avoid issues
                this.currentZoom = 1.0;
                this.panX = 0;
                this.panY = 0;
                this.applyTransform();
                this.updateBodySize();
            }, 150); // Debounce for 150ms
        },
        
        // Reinitialize for new canvas
        reinitialize: function() {
            this.currentZoom = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.findCanvas();
            this.setupCanvasForZoom();
        }
    };
    
})(window.Chatooly);