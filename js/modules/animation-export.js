/*
 * Chatooly CDN - Animation Export Module
 * Handles exporting animations to render service
 */

class AnimationExporter {
    constructor(config = {}) {
        this.renderServiceUrl = config.renderServiceUrl || 'https://chatooly-render-service.onrender.com';
        this.maxDuration = config.maxDuration || 15;
        this.defaultDuration = config.defaultDuration || 5;
        this.timeout = config.timeout || 300000; // 5 minutes
        
        // Library CDN URLs for inlining
        this.libraryUrls = {
            'three': 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
            'p5': 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js',
            'gsap': 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
        };
        
        // Cache for downloaded libraries
        this.libraryCache = new Map();
    }

    /**
     * Main export function
     */
    async exportAnimation(options = {}) {
        try {
            // Show export dialog to get user preferences
            const exportConfig = await this.showExportDialog(options);
            if (!exportConfig) return; // User cancelled

            // Show progress modal
            this.showProgressModal();
            this.updateProgress(0, 0, 0, 'Preparing animation...');

            // Capture and prepare HTML
            this.updateProgress(10, 0, 0, 'Capturing canvas and inlining libraries...');
            const { html, metadata } = await this.captureAnimationHTML(exportConfig);
            
            this.updateProgress(30, 0, 0, 'Submitting to render service...');

            // Submit to render service
            const downloadUrl = await this.submitRenderJob(html, exportConfig, metadata);

            // Trigger download
            this.downloadFile(downloadUrl);

            // Hide progress modal
            this.hideProgressModal();

        } catch (error) {
            console.error('Animation export failed:', error);
            this.hideProgressModal();
            this.showError(error.message);
        }
    }

    /**
     * Capture current page as animation-ready HTML
     */
    async captureAnimationHTML(config) {
        console.log('🔧 DEBUG: Starting captureAnimationHTML with config:', config);
        
        // Get canvas and container
        const canvas = document.getElementById('chatooly-canvas');
        const container = document.getElementById('chatooly-container');
        
        console.log('🔧 DEBUG: Found elements:', {
            canvas: canvas ? `${canvas.width}x${canvas.height}` : 'NOT FOUND',
            container: container ? 'FOUND' : 'NOT FOUND',
            containerHTML: container ? container.outerHTML.slice(0, 200) + '...' : 'N/A'
        });
        
        if (!canvas) {
            throw new Error('Canvas not found. Make sure your canvas has id="chatooly-canvas"');
        }

        // Auto-detect transparency
        const isTransparent = config.transparent !== undefined ? 
            config.transparent : 
            this.detectCanvasTransparency(canvas, container);

        // Get canvas dimensions
        const width = canvas.width || 800;
        const height = canvas.height || 600;

        console.log('🔧 DEBUG: Canvas info:', { width, height, isTransparent });

        // Build minimal HTML focusing only on the canvas container
        const minimalHTML = this.buildMinimalHTML(canvas, container, width, height, isTransparent);
        
        console.log('🔧 DEBUG: Minimal HTML generated:', {
            size: minimalHTML.length,
            preview: minimalHTML.slice(0, 500) + '...'
        });

        // Inline external libraries
        const inlinedHTML = await this.inlineExternalLibraries(minimalHTML);
        
        console.log('🔧 DEBUG: After inlining libraries:', {
            size: inlinedHTML.length,
            sizeIncrease: inlinedHTML.length - minimalHTML.length
        });

        // Compress HTML
        const compressedHTML = this.compressHTML(inlinedHTML);
        
        console.log('🔧 DEBUG: After compression:', {
            size: compressedHTML.length,
            compressionRatio: Math.round((1 - compressedHTML.length / inlinedHTML.length) * 100) + '%'
        });

        // Add render service integration script
        const finalHTML = this.addRenderServiceIntegration(compressedHTML, {
            canvasId: 'chatooly-canvas',
            transparent: isTransparent
        });

        console.log('🔧 DEBUG: Final HTML ready:', {
            size: finalHTML.length,
            preview: finalHTML.slice(0, 300) + '...'
        });

        return {
            html: finalHTML,
            metadata: {
                width,
                height,
                transparent: isTransparent,
                originalSize: minimalHTML.length,
                compressedSize: finalHTML.length
            }
        };
    }

    /**
     * Detect if canvas has transparent background
     */
    detectCanvasTransparency(canvas, container) {
        try {
            // Check CSS backgrounds
            if (container) {
                const containerBg = getComputedStyle(container).backgroundColor;
                if (containerBg === 'transparent' || containerBg === 'rgba(0, 0, 0, 0)') {
                    return true;
                }
            }

            const canvasBg = getComputedStyle(canvas).backgroundColor;
            if (canvasBg === 'transparent' || canvasBg === 'rgba(0, 0, 0, 0)') {
                return true;
            }

            // Sample canvas pixels for transparency
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, 1, 1);
            const alpha = imageData.data[3];
            return alpha < 255;
        } catch (e) {
            console.warn('Could not detect transparency:', e);
            return false; // Fallback to opaque
        }
    }

    /**
     * Build minimal HTML with only canvas element and necessary scripts
     */
    buildMinimalHTML(canvas, container, width, height, isTransparent) {
        console.log('🔧 DEBUG: buildMinimalHTML starting with:', { width, height, isTransparent });
        
        // Create a truly minimal container with ONLY the canvas
        const minimalContainer = document.createElement('div');
        minimalContainer.id = 'chatooly-container';
        
        // Clone ONLY the canvas, not any UI containers
        const canvasClone = canvas.cloneNode(true);
        canvasClone.id = 'chatooly-canvas';
        minimalContainer.appendChild(canvasClone);
        
        console.log('🔧 DEBUG: Created minimal container with only canvas');
        console.log('🔧 DEBUG: Minimal container HTML:', minimalContainer.outerHTML.slice(0, 300) + '...');
        
        // Get essential scripts (exclude UI-related scripts)
        const allScripts = Array.from(document.querySelectorAll('script'));
        console.log('🔧 DEBUG: Found total scripts:', allScripts.length);
        
        const scripts = allScripts
            .filter(script => {
                // Skip Chatooly CDN core (will be re-added if needed)
                if (script.src && script.src.includes('chatooly-cdn/js/core')) {
                    console.log('🔧 DEBUG: Skipping CDN core script:', script.src);
                    return false;
                }
                // Skip analytics, tracking, etc.
                if (script.src && (script.src.includes('analytics') || script.src.includes('gtag'))) {
                    console.log('🔧 DEBUG: Skipping analytics script:', script.src);
                    return false;
                }
                // Keep animation libraries and main logic
                console.log('🔧 DEBUG: Including script:', script.src || 'inline script');
                return true;
            })
            .map(script => {
                if (script.src) {
                    return `<script src="${script.src}"></script>`;
                } else {
                    return `<script>${script.innerHTML}</script>`;
                }
            })
            .join('\n');
        
        console.log('🔧 DEBUG: Filtered scripts count:', scripts.split('<script').length - 1);
        
        // Get essential styles (skip UI styles)
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .filter(style => {
                // Skip Chatooly unified styles (UI only)
                if (style.href && style.href.includes('unified.min.css')) return false;
                // Skip Chatooly component styles
                if (style.href && style.href.includes('chatooly-cdn/css/')) return false;
                return true;
            })
            .map(style => {
                if (style.href) {
                    return `<link rel="stylesheet" href="${style.href}">`;
                } else {
                    return `<style>${style.innerHTML}</style>`;
                }
            })
            .join('\n');
        
        // Build minimal HTML with only canvas, no UI
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animation Export</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: ${isTransparent ? 'transparent' : '#000'};
        }
        #chatooly-container {
            width: ${width}px;
            height: ${height}px;
            position: relative;
        }
        #chatooly-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    </style>
    ${styles}
</head>
<body>
    ${minimalContainer.outerHTML}
    ${scripts}
</body>
</html>`;
    }

    /**
     * Fetch and inline external libraries
     */
    async inlineExternalLibraries(html) {
        try {
            // Find all external script tags that we can inline
            const scriptPatterns = [
                {
                    pattern: /https:\/\/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/build\/three\.min\.js/g,
                    library: 'three'
                },
                {
                    pattern: /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/p5\.js\/[\d.]+\/p5\.min\.js/g,
                    library: 'p5'
                },
                {
                    pattern: /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/[\d.]+\/gsap\.min\.js/g,
                    library: 'gsap'
                }
            ];

            // Process each library pattern
            for (const { pattern, library } of scriptPatterns) {
                const matches = html.match(pattern);
                if (matches) {
                    console.log(`Found ${library} library, inlining...`);
                    
                    // Get library content (with caching)
                    const libraryContent = await this.fetchLibrary(library);
                    
                    // Replace script tags with inlined content
                    html = html.replace(
                        new RegExp(`<script src="${pattern.source}"><\/script>`, 'g'),
                        `<script>/* Inlined ${library} library */\n${libraryContent}</script>`
                    );
                }
            }

            return html;
        } catch (error) {
            console.warn('Failed to inline libraries, using original HTML:', error);
            return html; // Fallback to original HTML
        }
    }

    /**
     * Fetch library content with caching
     */
    async fetchLibrary(libraryName) {
        // Check cache first
        if (this.libraryCache.has(libraryName)) {
            console.log(`Using cached ${libraryName} library`);
            return this.libraryCache.get(libraryName);
        }

        const url = this.libraryUrls[libraryName];
        if (!url) {
            throw new Error(`Unknown library: ${libraryName}`);
        }

        console.log(`Fetching ${libraryName} from ${url}...`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${libraryName}: ${response.status}`);
            }
            
            const content = await response.text();
            
            // Cache the content
            this.libraryCache.set(libraryName, content);
            
            console.log(`Successfully fetched ${libraryName} (${Math.round(content.length / 1024)}KB)`);
            return content;
        } catch (error) {
            console.error(`Error fetching ${libraryName}:`, error);
            throw error;
        }
    }

    /**
     * Compress HTML by removing unnecessary content
     */
    compressHTML(html) {
        return html
            // Remove HTML comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove excessive whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove empty lines
            .replace(/^\s*\n/gm, '')
            .trim();
    }

    /**
     * Add render service integration hooks to HTML
     */
    addRenderServiceIntegration(html, config) {
        // Inject render service integration script before closing body tag
        const integrationScript = `
<script>
// Chatooly Render Service Integration
(function() {
    let animationStartTime = Date.now();
    
    // Override requestAnimationFrame for time control
    const originalRAF = window.requestAnimationFrame;
    let isControlledByRenderService = false;
    
    window.setAnimationTime = function(time) {
        isControlledByRenderService = true;
        animationStartTime = Date.now() - (time * 1000);
        
        // Trigger any existing animation loops
        if (window.updateAnimation) {
            window.updateAnimation(time);
        }
        
        // Trigger RAF callbacks with controlled time
        if (window.rafCallbacks && window.rafCallbacks.length > 0) {
            window.rafCallbacks.forEach(callback => {
                callback(time * 1000); // Convert to milliseconds
            });
        }
    };
    
    // Store RAF callbacks for controlled playback
    window.rafCallbacks = [];
    window.requestAnimationFrame = function(callback) {
        if (isControlledByRenderService) {
            window.rafCallbacks.push(callback);
            return Date.now(); // Return dummy timestamp
        } else {
            return originalRAF.call(window, callback);
        }
    };
    
    console.log('Chatooly Render Service integration loaded');
})();
</script>
</body>`;

        return html.replace('</body>', integrationScript);
    }

    /**
     * Submit render job to service
     */
    async submitRenderJob(html, config, metadata) {
        const payload = {
            html: html,
            duration: config.duration,
            fps: 30, // Fixed for MVP
            width: metadata.width,
            height: metadata.height,
            resolution: 1, // Fixed for MVP
            transparent: metadata.transparent,
            toolName: 'chatooly-cdn',
            exportFormat: config.format,
            videoQuality: 'high',
            animationSpeed: 1,
            perfectLoop: false,
            naturalPeriod: null
        };

        console.log('🔧 DEBUG: Submitting render job:', {
            format: payload.exportFormat,
            duration: payload.duration,
            size: `${metadata.width}x${metadata.height}`,
            transparent: payload.transparent,
            htmlSize: `${Math.round(html.length / 1024)}KB`
        });

        // First, send to debug endpoint for inspection
        try {
            console.log('🔧 DEBUG: Sending HTML to debug endpoint...');
            const debugResponse = await fetch(`${this.renderServiceUrl}/debug/html`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    html: html, 
                    metadata: { ...metadata, config }
                })
            });
            
            if (debugResponse.ok) {
                const debugResult = await debugResponse.json();
                console.log('🔧 DEBUG: HTML stored for inspection:', {
                    debugId: debugResult.debugId,
                    previewUrl: `${this.renderServiceUrl}${debugResult.previewUrl}`,
                    infoUrl: `${this.renderServiceUrl}/debug/info/${debugResult.debugId}`
                });
                console.log('🔧 DEBUG: You can inspect the HTML at:', `${this.renderServiceUrl}${debugResult.previewUrl}`);
            }
        } catch (debugError) {
            console.warn('🔧 DEBUG: Failed to store HTML for debugging:', debugError.message);
        }

        // Submit job
        const response = await fetch(`${this.renderServiceUrl}/render`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Render service error: ${response.status}`);
        }

        const { jobId, totalFrames } = await response.json();
        console.log(`Render job created: ${jobId} (${totalFrames} frames)`);

        // Poll for completion
        return this.pollJobStatus(jobId);
    }

    /**
     * Poll render job status until completion
     */
    async pollJobStatus(jobId) {
        const pollInterval = 1000; // 1 second
        const maxAttempts = this.timeout / pollInterval;
        
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`${this.renderServiceUrl}/status/${jobId}`);
            const status = await response.json();
            
            // Update progress
            this.updateProgress(status.progress || 0, status.currentFrame || 0, status.totalFrames || 0);
            
            if (status.status === 'completed') {
                console.log('Render completed:', status);
                return `${this.renderServiceUrl}/download/${jobId}`;
            }
            
            if (status.status === 'failed') {
                throw new Error(status.error || 'Rendering failed');
            }
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        throw new Error('Render timeout - job took too long to complete');
    }

    /**
     * Show export configuration dialog
     */
    async showExportDialog(initialOptions = {}) {
        return new Promise((resolve) => {
            const modal = this.createExportModal(initialOptions, resolve);
            document.body.appendChild(modal);
        });
    }

    /**
     * Create export dialog modal
     */
    createExportModal(initialOptions, onComplete) {
        const modal = document.createElement('div');
        modal.id = 'chatooly-export-modal';
        modal.className = 'chatooly-modal-overlay';
        modal.innerHTML = `
            <div class="chatooly-modal">
                <h3>Export Animation</h3>
                <div class="chatooly-modal-content">
                    <div class="chatooly-form-group">
                        <label for="export-duration">Duration (seconds)</label>
                        <input type="number" id="export-duration" min="1" max="${this.maxDuration}" value="${initialOptions.duration || this.defaultDuration}" />
                        <small>Maximum: ${this.maxDuration} seconds</small>
                    </div>
                    
                    <div class="chatooly-form-group">
                        <label for="export-format">Format</label>
                        <select id="export-format">
                            <option value="zip" selected>PNG Sequence (.zip)</option>
                            <option value="webm" disabled>WebM Video (Coming Soon)</option>
                            <option value="mov" disabled>MOV Video (Coming Soon)</option>
                        </select>
                    </div>
                    
                    <div class="chatooly-form-group">
                        <label>
                            <input type="checkbox" id="export-transparent" ${initialOptions.transparent !== false ? 'checked' : ''} />
                            Transparent Background
                        </label>
                        <small>Auto-detected from canvas</small>
                    </div>
                </div>
                
                <div class="chatooly-modal-actions">
                    <button type="button" class="chatooly-btn chatooly-btn-secondary" id="export-cancel-btn">Cancel</button>
                    <button type="button" class="chatooly-btn chatooly-btn-primary" id="export-confirm-btn">Export</button>
                </div>
            </div>
        `;

        // Add event handlers after modal is created
        const cancelBtn = modal.querySelector('#export-cancel-btn');
        const confirmBtn = modal.querySelector('#export-confirm-btn');
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            onComplete(null);
        });

        confirmBtn.addEventListener('click', () => {
            const durationInput = modal.querySelector('#export-duration');
            const formatInput = modal.querySelector('#export-format');
            const transparentInput = modal.querySelector('#export-transparent');
            
            if (!durationInput || !formatInput || !transparentInput) {
                console.error('Export form inputs not found');
                return;
            }
            
            const config = {
                duration: parseInt(durationInput.value) || 5,
                format: formatInput.value || 'zip',
                transparent: transparentInput.checked
            };
            
            modal.remove();
            onComplete(config);
        });

        // Position modal as centered popup with small background area
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '50%', 'important');
        modal.style.setProperty('left', '50%', 'important');
        modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.style.setProperty('background', 'rgba(0, 0, 0, 0.9)', 'important');
        modal.style.setProperty('padding', '40px', 'important');
        modal.style.setProperty('border-radius', '0px', 'important');
        
        return modal;
    }

    /**
     * Show progress modal
     */
    showProgressModal() {
        const modal = document.createElement('div');
        modal.id = 'chatooly-progress-modal';
        modal.className = 'chatooly-modal-overlay';
        modal.innerHTML = `
            <div class="chatooly-modal">
                <h3>Exporting Animation...</h3>
                <div class="chatooly-progress-container">
                    <div class="chatooly-progress-bar">
                        <div class="chatooly-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="chatooly-progress-text">Preparing...</div>
                </div>
                <div class="chatooly-modal-actions">
                    <button type="button" class="chatooly-btn chatooly-btn-secondary" id="progress-cancel-btn">Cancel</button>
                </div>
            </div>
        `;
        
        // Apply same background styling as export modal
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '50%', 'important');
        modal.style.setProperty('left', '50%', 'important');
        modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.style.setProperty('background', 'rgba(0, 0, 0, 0.9)', 'important');
        modal.style.setProperty('padding', '40px', 'important');
        modal.style.setProperty('border-radius', '0px', 'important');
        
        document.body.appendChild(modal);
        
        // Add cancel button handler
        const cancelBtn = modal.querySelector('#progress-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove();
                // Could add job cancellation logic here in the future
            });
        }
    }

    /**
     * Update progress display
     */
    updateProgress(percentage, currentFrame, totalFrames, statusMessage) {
        const modal = document.getElementById('chatooly-progress-modal');
        if (!modal) return;

        const progressFill = modal.querySelector('.chatooly-progress-fill');
        const progressText = modal.querySelector('.chatooly-progress-text');

        if (progressFill && progressText) {
            progressFill.style.width = percentage + '%';
            
            if (statusMessage) {
                progressText.textContent = statusMessage;
            } else if (currentFrame && totalFrames) {
                progressText.textContent = `Frame ${currentFrame}/${totalFrames} (${Math.round(percentage)}%)`;
            } else {
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        }
    }

    /**
     * Hide progress modal
     */
    hideProgressModal() {
        const modal = document.getElementById('chatooly-progress-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        alert(`Export failed: ${message}\n\nPlease try again or contact support if the problem persists.`);
    }

    /**
     * Trigger file download
     */
    downloadFile(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `chatooly-animation-${Date.now()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationExporter;
} else {
    window.AnimationExporter = AnimationExporter;
}