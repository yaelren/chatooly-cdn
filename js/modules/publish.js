/**
 * Chatooly CDN - Publishing Module
 * Handles tool publishing functionality for development mode
 */

(function(Chatooly) {
    'use strict';
    
    // Publishing functionality
    Chatooly.publish = {
        
        // Main publish function (development mode only)
        publish: function(options) {
            if (!Chatooly.utils.isDevelopment()) {
                console.warn('Chatooly: Publishing only available in development mode');
                return;
            }
            
            options = options || {};
            
            // Check for config options or prompt user
            const toolName = options.name || Chatooly.config.name || prompt('Enter tool name for publishing:');
            if (!toolName) {
                console.log('Chatooly: Publishing cancelled');
                return;
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
            
            // Gather tool files
            const toolFiles = this._gatherToolFiles();
            const metadata = {
                name: toolName,
                slug: toolSlug,
                category: config.category || 'uncategorized',
                tags: config.tags || [],
                description: config.description || '',
                private: config.private || false,
                version: config.version || '1.0.0',
                author: config.author || 'Anonymous',
                timestamp: new Date().toISOString()
            };
            
            // Show publishing progress
            this._showPublishingProgress();
            
            // Upload to staging
            this._uploadToStaging(toolSlug, toolFiles, metadata)
                .then(result => {
                    this._hidePublishingProgress();
                    this._showPublishSuccess(result);
                })
                .catch(error => {
                    this._hidePublishingProgress();
                    this._showPublishError(error);
                });
        },
        
        // Create URL-safe tool slug
        _createToolSlug: function(toolName) {
            return toolName.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-')         // Spaces to hyphens
                .replace(/-+/g, '-')          // Multiple hyphens to single
                .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
        },
        
        // Gather current tool files for publishing
        _gatherToolFiles: function() {
            const files = {};
            
            // Get current HTML (remove Chatooly button for published version)
            const htmlClone = document.documentElement.cloneNode(true);
            const exportBtn = htmlClone.querySelector('#chatooly-export-btn');
            if (exportBtn) exportBtn.remove();
            
            files['index.html'] = '<!DOCTYPE html>' + htmlClone.outerHTML;
            
            // Get inline styles and scripts
            const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
            if (styles) files['style.css'] = styles;
            
            const scripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent).join('\n');
            if (scripts) files['tool.js'] = scripts;
            
            // Get external resource references
            files['resources'] = this._gatherResourceReferences();
            
            return files;
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
        
        // Upload tool to staging server
        _uploadToStaging: function(toolSlug, files, metadata) {
            return new Promise((resolve, reject) => {
                // POC: For now, simulate upload with localStorage
                // TODO: Replace with actual API call to tools.chatooly.com/api/publish
                
                try {
                    // Simulate API call
                    console.log('Chatooly: Uploading to staging...');
                    
                    // In real implementation:
                    // const formData = new FormData();
                    // formData.append('metadata', JSON.stringify(metadata));
                    // Object.keys(files).forEach(filename => {
                    //     formData.append(filename, files[filename]);
                    // });
                    
                    // fetch('https://tools.chatooly.com/api/publish/staging', {
                    //     method: 'POST',
                    //     body: formData,
                    //     headers: {
                    //         'X-Chatooly-Auth': this._getAuthToken()
                    //     }
                    // })
                    
                    // POC simulation
                    setTimeout(() => {
                        const result = {
                            success: true,
                            stagingUrl: `https://tools.chatooly.com/staging/${toolSlug}`,
                            productionUrl: `https://tools.chatooly.com/${toolSlug}`,
                            publishedAt: new Date().toISOString(),
                            metadata: metadata
                        };
                        
                        // Store in localStorage for POC
                        localStorage.setItem(`chatooly-published-${toolSlug}`, JSON.stringify(result));
                        
                        resolve(result);
                    }, 2000); // Simulate network delay
                    
                } catch (error) {
                    reject(error);
                }
            });
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
                        Your tool has been uploaded to staging for review.
                    </p>
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: left;
                    ">
                        <p style="margin: 5px 0;"><strong>Staging URL:</strong><br>
                            <a href="${result.stagingUrl}" target="_blank" style="color: #007bff;">
                                ${result.stagingUrl}
                            </a>
                        </p>
                        <p style="margin: 5px 0;"><strong>Production URL:</strong><br>
                            <span style="color: #666;">${result.productionUrl}</span>
                            <br><small>(Available after admin approval)</small>
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