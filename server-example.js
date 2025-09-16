const express = require('express');
const PuppeteerFFmpegExporter = require('./server/puppeteer-ffmpeg-server');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Initialize the exporter
const exporter = new PuppeteerFFmpegExporter({
    outputDir: './exports',
    tempDir: './temp',
    defaultResolution: 4,
    defaultFPS: 30,
    timeout: 30000
});

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Test endpoint
app.get('/api/puppeteer-export/test', (req, res) => {
    res.json({
        status: 'OK',
        server: 'Puppeteer FFmpeg Export Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Main export endpoint
app.post('/api/puppeteer-export', async (req, res) => {
    try {
        console.log('📥 Received export request:', req.body);
        
        const result = await exporter.handleExport(req.body);
        
        console.log('✅ Export completed:', result);
        res.json({
            success: true,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get export status
app.get('/api/puppeteer-export/status/:exportId', (req, res) => {
    const exportId = req.params.exportId;
    const status = exporter.getExportStatus(exportId);
    
    if (status) {
        res.json(status);
    } else {
        res.status(404).json({
            error: 'Export not found'
        });
    }
});

// Download export files
app.get('/api/puppeteer-export/download/:exportId', (req, res) => {
    const exportId = req.params.exportId;
    const exportDir = path.join(exporter.config.outputDir, exportId);
    
    if (fs.existsSync(exportDir)) {
        // Create a zip file or return individual files
        res.download(exportDir);
    } else {
        res.status(404).json({
            error: 'Export files not found'
        });
    }
});

// Cleanup old exports every hour
setInterval(() => {
    exporter.cleanup();
}, 60 * 60 * 1000);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Puppeteer FFmpeg Export Server running on port ${port}`);
    console.log(`📡 Test endpoint: http://localhost:${port}/api/puppeteer-export/test`);
    console.log(`📤 Export endpoint: http://localhost:${port}/api/puppeteer-export`);
    console.log(`📁 Test page: http://localhost:${port}/tests/test-puppeteer-ffmpeg.html`);
});

module.exports = app;
