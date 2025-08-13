/**
 * Simple JavaScript minifier for Chatooly CDN
 * Minifies core.js to create core.min.js
 */

const fs = require('fs');
const path = require('path');

function minifyJS(code) {
    // Simple minification - remove comments and extra whitespace
    return code
        // Remove single-line comments (but preserve URLs)
        .replace(/(?<!https?:)\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around operators
        .replace(/\s*([{}();,:])\s*/g, '$1')
        // Remove trailing semicolons before }
        .replace(/;\s*}/g, '}')
        // Trim
        .trim();
}

try {
    const inputPath = path.join(__dirname, 'core.js');
    const outputPath = path.join(__dirname, 'core.min.js');
    
    console.log('🗜️  Minifying Chatooly CDN core.js...');
    
    const sourceCode = fs.readFileSync(inputPath, 'utf8');
    const minifiedCode = minifyJS(sourceCode);
    
    // Add header comment
    const header = `/**
 * Chatooly CDN v2.0.0 - Minified Core Library
 * Auto-injects design system styles + Export functionality
 * Built: ${new Date().toISOString()}
 */
`;
    
    fs.writeFileSync(outputPath, header + minifiedCode);
    
    const originalSize = (sourceCode.length / 1024).toFixed(1);
    const minifiedSize = (minifiedCode.length / 1024).toFixed(1);
    const savings = (((sourceCode.length - minifiedCode.length) / sourceCode.length) * 100).toFixed(1);
    
    console.log(`✅ Minification complete:`);
    console.log(`   Original:  ${originalSize}KB`);
    console.log(`   Minified:  ${minifiedSize}KB`);
    console.log(`   Savings:   ${savings}%`);
    console.log(`   Output:    ${outputPath}`);
    
} catch (error) {
    console.error('❌ Minification failed:', error.message);
    process.exit(1);
}