/**
 * Chatooly CDN - Publishing Module
 * Handles tool publishing functionality for development mode
 */

(function(Chatooly) {
    'use strict';
    
    // Publishing functionality
    Chatooly.publish = {
        
        // Main publish function (development mode only)
        publish: async function(options) {
            if (!Chatooly.utils.isDevelopment()) {
                console.warn('Chatooly: Publishing only available in development mode');
                return;
            }
            
            options = options || {};

            // Try to get tool name from multiple sources (in order of priority)
            // 1. Explicit option passed to publish()
            // 2. Chatooly config name
            // 3. Last published name from localStorage
            // 4. Prompt user
            let toolName = options.name || Chatooly.config.name;

            // If config name exists and is not empty, use it (enables easy republishing)
            if (toolName && toolName.trim()) {
                console.log('Chatooly: Using tool name from config: "' + toolName + '"');
            } else {
                // Try to get last published name for convenience
                const lastPublishedName = localStorage.getItem('chatooly_last_tool_name');
                const defaultName = lastPublishedName || '';

                toolName = prompt('Enter tool name for publishing:', defaultName);
                if (!toolName || !toolName.trim()) {
                    console.log('Chatooly: Publishing cancelled');
                    return;
                }

                // Save for next time
                localStorage.setItem('chatooly_last_tool_name', toolName);
            }
            
            // Read additional config from chatooly.config.js if exists
            const config = this._loadToolConfig(options);
            
            // Create tool slug (URL-safe name)
            const toolSlug = this._createToolSlug(toolName);
            
            console.log('Chatooly: Publishing tool "' + toolName + '" as "' + toolSlug + '"');
            
            // Validate tool before publishing
            const validation = this.validateTool();
            if (!validation.valid) {
                console.error('Chatooly: Tool validation failed:', validation.errors);
                alert('Publishing failed. Please fix these errors:\n' + validation.errors.join('\n'));
                return;
            }
            
            if (validation.warnings.length > 0) {
                console.warn('Chatooly: Publishing warnings:', validation.warnings);
            }
            
            // Show publishing progress early
            this._showPublishingProgress();
            
            try {
                // Gather tool files with dependency scanning
                const toolFiles = await this._gatherToolFiles();
                const metadata = {
                    name: toolName,
                    slug: toolSlug,
                    category: config.category || 'generators',
                    tags: config.tags || [],
                    description: config.description || '',
                    private: config.private || false,
                    version: config.version || '1.0.0',
                    author: config.author || 'Anonymous',
                    timestamp: new Date().toISOString()
                };
                
                // Upload to Chatooly Hub
                const result = await this._uploadToStaging(toolSlug, toolFiles, metadata);
                
                this._hidePublishingProgress();
                this._showPublishSuccess(result);
                
            } catch (error) {
                this._hidePublishingProgress();
                this._showPublishError(error);
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
        
        // Gather current tool files for publishing with full dependency scanning
        _gatherToolFiles: async function() {
            const files = {};
            const discovered = new Set();
            
            // Get current HTML (clean up for published version but keep CDN for export functionality)
            const htmlClone = document.documentElement.cloneNode(true);
            const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
            if (exportBtn) exportBtn.remove();
            
            // Remove any publishing popups that might be stuck
            const publishProgress = htmlClone.querySelector('#chatooly-publish-progress');
            if (publishProgress) publishProgress.remove();
            
            const publishSuccess = htmlClone.querySelector('div[style*="Published Successfully"]');
            if (publishSuccess) publishSuccess.remove();
            
            const publishError = htmlClone.querySelector('div[style*="Publishing Failed"]');
            if (publishError) publishError.remove();
            
            // Keep Chatooly CDN script for export functionality, but ensure it's the production version
            const chatoolyCdnScript = htmlClone.querySelector('script[src*="chatooly-cdn"]');
            if (chatoolyCdnScript) {
                // Update to production CDN URL
                chatoolyCdnScript.setAttribute('src', 'https://yaelren.github.io/chatooly-cdn/js/core.min.js');
            } else {
                // Add CDN script if not present
                const script = htmlClone.createElement('script');
                script.src = 'https://yaelren.github.io/chatooly-cdn/js/core.min.js';
                script.async = true;
                htmlClone.head.appendChild(script);
            }
            
            const htmlContent = '<!DOCTYPE html>' + htmlClone.outerHTML;
            files['index.html'] = htmlContent;
            discovered.add('index.html');
            
            // First, collect all external files referenced in HTML
            await this._collectExternalFiles(htmlContent, files, discovered);
            
            // Then scan for additional dependencies
            await this._scanFileDependencies(htmlContent, files, discovered);
            
            // Get inline styles and scripts
            const styles = Array.from(document.querySelectorAll('style:not(#chatooly-button-styles)')).map(s => s.textContent).join('\n');
            if (styles) {
                files['style.css'] = styles;
                discovered.add('style.css');
                // Scan CSS for dependencies
                await this._scanFileDependencies(styles, files, discovered, 'css');
            }
            
            // Get inline scripts (excluding CDN and system scripts)
            const scripts = Array.from(document.querySelectorAll('script:not([src]):not([id])')).map(s => s.textContent).join('\n');
            if (scripts) {
                files['tool.js'] = scripts;
                discovered.add('tool.js');
                // Scan JS for dependencies
                await this._scanFileDependencies(scripts, files, discovered, 'js');
            }
            
            console.log('Chatooly: Collected files:', Object.keys(files));
            return files;
        },
        
        // Collect external files directly referenced in HTML
        _collectExternalFiles: async function(htmlContent, files, discovered) {
            // Find all external script and stylesheet references
            const externalFiles = [
                // JavaScript files
                ...Array.from(document.querySelectorAll('script[src]:not([src*="http"]):not([src*="chatooly-cdn"])')).map(s => s.getAttribute('src')),
                // CSS files  
                ...Array.from(document.querySelectorAll('link[rel="stylesheet"][href]:not([href*="http"])')).map(l => l.getAttribute('href'))
            ];
            
            console.log('Chatooly: Found external files to collect:', externalFiles);
            
            // Download each external file
            for (const filePath of externalFiles) {
                if (filePath && !discovered.has(filePath)) {
                    discovered.add(filePath);
                    try {
                        const fileContent = await this._fetchLocalFile(filePath);
                        if (fileContent) {
                            files[filePath] = fileContent;
                            console.log(`Chatooly: Collected ${filePath} (${fileContent.length} chars)`);
                            
                            // Recursively scan collected files for more dependencies
                            const extension = filePath.split('.').pop().toLowerCase();
                            if (['html', 'css', 'js'].includes(extension)) {
                                await this._scanFileDependencies(fileContent, files, discovered, extension);
                            }
                        }
                    } catch (error) {
                        console.warn(`Chatooly: Could not collect ${filePath}:`, error);
                    }
                }
            }
        },
        
        // Scan file content for dependencies
        _scanFileDependencies: async function(content, files, discovered, fileType = 'html') {
            const dependencyPatterns = {
                html: [
                    /<script src="\.\/([^"]+)"/g,      // Local scripts
                    /<link href="\.\/([^"]+)"/g,       // Local stylesheets  
                    /<img src="\.\/([^"]+)"/g,         // Local images
                    /<source src="\.\/([^"]+)"/g,      // Audio/video
                    /<video src="\.\/([^"]+)"/g,       // Video sources
                    /<audio src="\.\/([^"]+)"/g        // Audio sources
                ],
                css: [
                    /url\(['"]?\.\/([^'")\s]+)['"]?\)/g,  // CSS assets
                    /@import ['"]\.\/([^'"]+)['"]/g        // CSS imports
                ],
                js: [
                    /fetch\(['"`]\.\/([^'"`]+)['"`]\)/g,     // Fetch calls
                    /import.*from ['"`]\.\/([^'"`]+)['"`]/g, // ES6 imports
                    /require\(['"`]\.\/([^'"`]+)['"`]\)/g,   // CommonJS requires
                    /loadJSON\(['"`]\.\/([^'"`]+)['"`]\)/g,  // p5.js loadJSON
                    /loadImage\(['"`]\.\/([^'"`]+)['"`]\)/g, // p5.js loadImage
                    /loadSound\(['"`]\.\/([^'"`]+)['"`]\)/g  // p5.js loadSound
                ]
            };
            
            const patterns = dependencyPatterns[fileType] || [];
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const filePath = match[1];
                    if (!discovered.has(filePath)) {
                        discovered.add(filePath);
                        try {
                            const fileContent = await this._fetchLocalFile(filePath);
                            if (fileContent) {
                                files[filePath] = fileContent;
                                
                                // Recursively scan discovered files
                                const extension = filePath.split('.').pop().toLowerCase();
                                if (['html', 'css', 'js'].includes(extension)) {
                                    await this._scanFileDependencies(fileContent, files, discovered, extension);
                                }
                            }
                        } catch (error) {
                            console.warn(`Chatooly: Could not load dependency: ${filePath}`, error);
                        }
                    }
                }
            }
        },
        
        // Fetch local file content
        _fetchLocalFile: async function(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                // Check if it's a binary file
                const contentType = response.headers.get('content-type') || '';
                if (contentType.startsWith('image/') || contentType.startsWith('audio/') || contentType.startsWith('video/')) {
                    // Convert binary files to base64
                    const arrayBuffer = await response.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    bytes.forEach(byte => binary += String.fromCharCode(byte));
                    return `data:${contentType};base64,${btoa(binary)}`;
                } else {
                    // Text files
                    return await response.text();
                }
            } catch (error) {
                console.warn(`Chatooly: Failed to fetch ${filePath}:`, error);
                return null;
            }
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
        
        // Load tool configuration
        _loadToolConfig: function(options) {
            // Try to load from global ChatoolyConfig or passed options
            const config = window.ChatoolyConfig || {};
            
            // Merge with passed options
            return Object.assign({
                category: 'tools',
                tags: [],
                description: '',
                private: false,
                version: '1.0.0',
                author: 'Anonymous'
            }, config, options);
        },
        
        // Upload tool to Chatooly Hub
        _uploadToStaging: async function(toolSlug, files, metadata) {
            try {
                console.log('Chatooly: Uploading to Chatooly Hub...');
                
                // Prepare payload for Chatooly Hub API
                const payload = {
                    toolName: toolSlug,
                    metadata: metadata,
                    files: files
                };
                
                // Send to Chatooly Hub API
                const response = await fetch('https://studiovideotoolhub.vercel.app/api/publish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Chatooly-Source': 'cdn'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Publishing failed');
                }
                
                return result;
                
            } catch (error) {
                // If API fails, fall back to POC localStorage simulation
                console.warn('Chatooly: Hub API unavailable, using local simulation:', error);
                
                const result = {
                    success: true,
                    url: `https://tools.chatooly.com/${toolSlug}`,
                    actualName: toolSlug,
                    requestedName: metadata.name,
                    publishedAt: new Date().toISOString(),
                    metadata: metadata,
                    message: 'Tool published successfully! (Simulated - Hub not available)'
                };
                
                // Store in localStorage for POC
                localStorage.setItem(`chatooly-published-${toolSlug}`, JSON.stringify(result));
                
                return result;
            }
        },
        
        // Show publishing progress UI
        _showPublishingProgress: function() {
            const progressDiv = document.createElement('div');
            progressDiv.id = 'chatooly-publish-progress';
            progressDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #007bff;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        animation: chatooly-spin 1s linear infinite;
                    "></div>
                    <h3 style="margin: 0 0 10px;">Publishing to Chatooly...</h3>
                    <p style="margin: 0; color: #666;">Uploading tool files to staging server</p>
                </div>
                <style>
                    @keyframes chatooly-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(progressDiv);
        },
        
        // Hide publishing progress UI
        _hidePublishingProgress: function() {
            const progressDiv = document.getElementById('chatooly-publish-progress');
            if (progressDiv) {
                progressDiv.remove();
            }
        },
        
        // Show success message
        _showPublishSuccess: function(result) {
            const successDiv = document.createElement('div');
            const nameMessage = result.actualName !== result.requestedName 
                ? `<p style="margin: 10px 0; color: #666;">Tool published as "${result.actualName}" (name was adjusted)</p>`
                : '';
            
            successDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                    max-width: 500px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: #28a745;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 30px;
                    ">✓</div>
                    <h3 style="margin: 0 0 10px; color: #28a745;">Published Successfully!</h3>
                    <p style="margin: 10px 0; color: #666;">
                        ${result.message || 'Your tool has been published to Chatooly.'}
                    </p>
                    ${nameMessage}
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <p style="margin: 5px 0;"><strong>Live URL:</strong><br>
                            <a href="${result.url}" target="_blank" style="color: #007bff;">
                                ${result.url}
                            </a>
                        </p>
                        <p style="margin: 5px 0; font-size: 12px; color: #888;">
                            Published: ${new Date(result.publishedAt).toLocaleString()}
                        </p>
                    </div>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            document.body.appendChild(successDiv);
        },
        
        // Show error message
        _showPublishError: function(error) {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 100000;
                    text-align: center;
                    font-family: -apple-system, system-ui, sans-serif;
                    max-width: 500px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: #dc3545;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 30px;
                    ">✕</div>
                    <h3 style="margin: 0 0 10px; color: #dc3545;">Publishing Failed</h3>
                    <p style="margin: 10px 0; color: #666;">
                        ${error.message || 'An error occurred while publishing your tool.'}
                    </p>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        },
        
        // Validate tool before publishing
        validateTool: function() {
            const validation = {
                valid: true,
                warnings: [],
                errors: []
            };
            
            // Check for required template structure
            const chatoolyContainer = document.getElementById('chatooly-container');
            if (!chatoolyContainer) {
                validation.errors.push('Missing required template structure: <div id="chatooly-container"> not found');
                validation.valid = false;
            } else {
                const chatoolyCanvas = chatoolyContainer.querySelector('canvas#chatooly-canvas');
                if (!chatoolyCanvas) {
                    validation.errors.push('Missing required canvas: <canvas id="chatooly-canvas"> not found inside chatooly-container');
                    validation.valid = false;
                }
            }
            
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
        },
        
        // Programmatic publish method for CLI/Node.js
        publishFromCLI: function(configPath) {
            // This method is designed to be called from chatooly-cli
            // It reads the config file and publishes without prompts
            
            try {
                // In Node.js environment, this would read the config file
                // For browser environment, we simulate with a config object
                const config = window.ChatoolyPublishConfig || {
                    name: Chatooly.config.name,
                    category: 'tools',
                    tags: [],
                    description: '',
                    version: '1.0.0'
                };
                
                // Validate required fields
                if (!config.name) {
                    throw new Error('Tool name is required in config');
                }
                
                // Auto-publish without prompts
                this.publish(config);
                
            } catch (error) {
                console.error('Chatooly CLI: Publishing failed:', error);
                if (typeof process !== 'undefined' && process.exit) {
                    process.exit(1);
                }
            }
        },
        
        // Get auth token for API calls
        _getAuthToken: function() {
            // In real implementation, this would:
            // 1. Check for CHATOOLY_AUTH_TOKEN env variable
            // 2. Check for ~/.chatooly/auth.json file
            // 3. Prompt for login if needed
            
            // POC: Return placeholder token
            return 'poc-auth-token';
        }
    };
    
})(window.Chatooly);