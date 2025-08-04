#!/usr/bin/env node

/**
 * Chatooly CDN - Build Script
 * Combines all modules into a single core.js file for CDN distribution
 */

const fs = require('fs');
const path = require('path');

// Module loading order (dependencies first)
const moduleOrder = [
    'utils.js',           // Base utilities - no dependencies
    'canvas-html5.js',    // Canvas exporters - depends on utils
    'canvas-p5.js',       // p5.js exporters - depends on utils
    'canvas-three.js',    // Three.js exporters - depends on utils
    'dom-export.js',      // DOM export - depends on utils
    'export-png.js',      // PNG orchestrator - depends on canvas exporters + dom-export
    'publish.js',         // Publishing - depends on utils
    'ui.js',              // UI components - depends on utils, publish
    'core.js'             // Main entry point - depends on all modules
];

function buildCombinedFile() {
    console.log('🏗️  Building combined core.js from modules...');
    
    const modulesDir = path.join(__dirname, 'js', 'modules');
    const outputFile = path.join(__dirname, 'js', 'core.js');
    
    let combinedContent = '';
    
    // Add header comment
    combinedContent += `/**
 * Chatooly CDN - Core Library (POC Version) - Built from Modules
 * Provides PNG export functionality for canvas-based design tools
 * Supports p5.js, Three.js, and DOM-based tools
 * 
 * Built: ${new Date().toISOString()}
 * Architecture: Modular components combined into single file
 */

`;
    
    // Start the main IIFE wrapper
    combinedContent += `(function() {
    'use strict';
    
    // ===== GLOBAL CHATOOLY OBJECT =====
    
    window.Chatooly = {
        version: '1.0.0-poc',
        config: {},
        
        // Initialize the library
        init: function(userConfig) {
            this.config = Object.assign({
                name: 'Untitled Tool',
                exportFormats: ['png'],
                resolution: 2,
                buttonPosition: 'bottom-right'
            }, userConfig);
            
            this.ui.createExportButton();
            this.utils.logDevelopmentMode();
        },
        
        // Main export function
        export: function(format, options) {
            format = format || 'png';
            options = options || {};
            
            if (format !== 'png') {
                console.warn('Chatooly POC: Only PNG export supported in this version');
                return;
            }
            
            const target = this.utils.detectExportTarget();
            this.pngExport.export(target, options);
        }
    };

`;
    
    // Combine all modules (except core.js which we handle separately)
    for (const moduleFile of moduleOrder) {
        if (moduleFile === 'core.js') continue; // Skip core.js, we handle initialization above
        
        const modulePath = path.join(modulesDir, moduleFile);
        
        if (!fs.existsSync(modulePath)) {
            console.error(`❌ Module not found: ${moduleFile}`);
            process.exit(1);
        }
        
        console.log(`📦 Adding module: ${moduleFile}`);
        
        let moduleContent = fs.readFileSync(modulePath, 'utf8');
        
        // Remove the IIFE wrapper and just keep the inner content
        moduleContent = moduleContent
            // Remove opening IIFE and 'use strict'
            .replace(/^\s*\(function\(Chatooly\)\s*\{\s*['"]use strict['"];\s*/m, '')
            // Remove closing IIFE
            .replace(/\s*\}\)\(window\.Chatooly\);\s*$/m, '')
            // Clean up extra whitespace
            .trim();
        
        // Add module separator comment and content
        combinedContent += `    // ===== ${moduleFile.toUpperCase().replace('.JS', ' MODULE')} =====
    
${moduleContent.split('\n').map(line => '    ' + line).join('\n')}

`;
    }
    
    // Add auto-initialization at the end
    combinedContent += `    // ===== AUTO-INITIALIZATION =====
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChatoolyConfig) {
            Chatooly.init(window.ChatoolyConfig);
        } else {
            Chatooly.init();
        }
    });
    
    // Also initialize immediately if DOM is already loaded
    if (document.readyState !== 'loading') {
        setTimeout(() => {
            if (window.ChatoolyConfig) {
                Chatooly.init(window.ChatoolyConfig);
            } else {
                Chatooly.init();
            }
        }, 100);
    }
    
})();`;
    
    // Write combined file
    fs.writeFileSync(outputFile, combinedContent);
    
    const fileSize = fs.statSync(outputFile).size;
    console.log(`✅ Combined file created: ${outputFile}`);
    console.log(`📏 File size: ${(fileSize / 1024).toFixed(1)}KB`);
    
    return outputFile;
}

function buildMinifiedFile(inputFile) {
    console.log('🗜️  Creating minified version...');
    
    const { execSync } = require('child_process');
    const outputFile = path.join(__dirname, 'js', 'core.min.js');
    
    try {
        // Use terser to minify
        execSync(`npx terser "${inputFile}" -c -m --comments /Chatooly/ -o "${outputFile}"`, {
            stdio: 'inherit'
        });
        
        const originalSize = fs.statSync(inputFile).size;
        const minifiedSize = fs.statSync(outputFile).size;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ Minified file created: ${outputFile}`);
        console.log(`📏 Original: ${(originalSize / 1024).toFixed(1)}KB`);
        console.log(`📏 Minified: ${(minifiedSize / 1024).toFixed(1)}KB`);
        console.log(`💾 Savings: ${savings}%`);
        
        return outputFile;
        
    } catch (error) {
        console.error('❌ Minification failed:', error.message);
        console.log('ℹ️  Installing terser...');
        try {
            execSync('npm install terser', { stdio: 'inherit' });
            execSync(`npx terser "${inputFile}" -c -m --comments /Chatooly/ -o "${outputFile}"`, {
                stdio: 'inherit'
            });
            console.log('✅ Minification completed after installing terser');
            return outputFile;
        } catch (installError) {
            console.error('❌ Failed to install terser:', installError.message);
            return null;
        }
    }
}

function validateBuild(builtFile) {
    console.log('🔍 Validating build...');
    
    const content = fs.readFileSync(builtFile, 'utf8');
    
    // Check for required components
    const checks = [
        { name: 'Chatooly object', pattern: /window\.Chatooly\s*=/ },
        { name: 'Utils module', pattern: /Chatooly\.utils\s*=/ },
        { name: 'PNG export', pattern: /Chatooly\.pngExport\s*=/ },
        { name: 'Canvas exporters', pattern: /Chatooly\.canvasExporters/ },
        { name: 'DOM export', pattern: /Chatooly\.domExport\s*=/ },
        { name: 'Publish module', pattern: /Chatooly\.publish\s*=/ },
        { name: 'UI module', pattern: /Chatooly\.ui\s*=/ },
        { name: 'Auto-initialization', pattern: /DOMContentLoaded/ }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            allPassed = false;
        }
    }
    
    if (allPassed) {
        console.log('🎉 Build validation passed!');
    } else {
        console.log('⚠️  Build validation failed - some components missing');
    }
    
    return allPassed;
}

// Main build process
function main() {
    console.log('🚀 Starting Chatooly CDN build process...\n');
    
    try {
        // Build combined file
        const builtFile = buildCombinedFile();
        
        // Validate build
        if (!validateBuild(builtFile)) {
            console.error('❌ Build validation failed');
            process.exit(1);
        }
        
        // Create minified version
        const minifiedFile = buildMinifiedFile(builtFile);
        
        console.log('\n🎉 Build completed successfully!');
        console.log('📦 Files created:');
        console.log('   - js/core.js (combined)');
        if (minifiedFile) {
            console.log('   - js/core.min.js (minified)');
        }
        console.log('\n💡 Usage:');
        console.log('   <script src="https://yaelren.github.io/chatooly-cdn/js/core.js"></script>');
        console.log('   <script src="https://yaelren.github.io/chatooly-cdn/js/core.min.js"></script>');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { buildCombinedFile, buildMinifiedFile, validateBuild };