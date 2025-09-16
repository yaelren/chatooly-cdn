# Puppeteer FFmpeg Export Module

This experimental module adds high-resolution export capabilities to Chatooly CDN using Puppeteer and FFmpeg. It provides transparent PNG sequences and high-quality MP4/WebM video exports without interfering with the existing MediaRecorder functionality.

## Features

- **High-Resolution Exports**: Up to 8x resolution multiplier
- **Transparent PNG Sequences**: Perfect for compositing
- **MP4/WebM Video Export**: High-quality video output
- **Server-Side Processing**: Uses Puppeteer for accurate rendering
- **Non-Intrusive**: Doesn't affect existing MediaRecorder functionality
- **Graceful Fallback**: Handles server unavailability gracefully

## Installation

The module is already integrated into the build system. To use it, you need:

1. **Dependencies** (already added to package.json):
   ```bash
   npm install puppeteer fluent-ffmpeg
   ```

2. **FFmpeg**: Install FFmpeg on your system
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt install ffmpeg`
   - Windows: Download from https://ffmpeg.org/

## Usage

### Client-Side (Browser)

The module is automatically available as `Chatooly.puppeteerFFmpeg`:

```javascript
// Test connection
Chatooly.puppeteerFFmpeg.testConnection('/api/puppeteer-export')
    .then(result => console.log('Connected:', result))
    .catch(error => console.error('Connection failed:', error));

// Export high-resolution PNG sequence
Chatooly.puppeteerFFmpeg.export({
    format: 'png-sequence',
    resolution: 4,
    duration: 5,
    fps: 30,
    transparent: true,
    serverEndpoint: '/api/puppeteer-export'
}).then(result => {
    console.log('Export completed:', result);
});
```

### Server-Side

Use the provided server example:

```bash
node server-example.js
```

Or integrate into your own Express server:

```javascript
const PuppeteerFFmpegExporter = require('./server/puppeteer-ffmpeg-server');

const exporter = new PuppeteerFFmpegExporter({
    outputDir: './exports',
    tempDir: './temp',
    defaultResolution: 4,
    defaultFPS: 30
});

app.post('/api/puppeteer-export', async (req, res) => {
    try {
        const result = await exporter.handleExport(req.body);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

## UI Integration

The module adds a new "High-Res (Experimental)" export option to the Chatooly UI:

1. Click the Chatooly button
2. Go to the Export tab
3. Select "High-Res (Experimental)"
4. Configure export settings:
   - Format: PNG Sequence, MP4, or WebM
   - Resolution: 2x to 8x multiplier
   - Duration: Animation length in seconds
   - Frame Rate: 24, 30, or 60 FPS
   - Server Endpoint: API endpoint URL

## Testing

Run the test page to verify functionality:

```bash
# Start the server
node server-example.js

# Open test page
open http://localhost:3000/tests/test-puppeteer-ffmpeg.html
```

The test page includes:
- Module status checking
- Connection testing
- Export functionality testing
- Comparison with regular exports

## API Reference

### Client Module (`Chatooly.puppeteerFFmpeg`)

#### Methods

- `init(options)` - Initialize the module
- `export(options)` - Start an export
- `testConnection(endpoint)` - Test server connection
- `getStatus()` - Get current export status
- `cancel()` - Cancel current export

#### Export Options

```javascript
{
    format: 'png-sequence' | 'mp4' | 'webm',
    resolution: number,        // 1-8x multiplier
    duration: number,          // seconds
    fps: number,              // frames per second
    transparent: boolean,      // PNG transparency
    quality: string,          // 'high' | 'medium' | 'low'
    serverEndpoint: string,   // API endpoint
    filename: string          // optional custom filename
}
```

### Server Module (`PuppeteerFFmpegExporter`)

#### Constructor Options

```javascript
{
    outputDir: string,        // Export output directory
    tempDir: string,          // Temporary files directory
    defaultResolution: number, // Default resolution multiplier
    defaultFPS: number,       // Default frame rate
    timeout: number,          // Request timeout in ms
    browserOptions: object    // Puppeteer browser options
}
```

#### Methods

- `handleExport(exportData)` - Process export request
- `getExportStatus(exportId)` - Get export status
- `cleanup(maxAge)` - Clean up old exports

## File Structure

```
chatooly-cdn/
├── js/modules/
│   └── puppeteer-ffmpeg.js          # Client-side module
├── server/
│   └── puppeteer-ffmpeg-server.js   # Server-side exporter
├── tests/
│   └── test-puppeteer-ffmpeg.html  # Test page
├── server-example.js                # Example server
└── package.json                     # Updated with dependencies
```

## Limitations

- **Server Required**: Needs a Node.js server with Puppeteer and FFmpeg
- **Processing Time**: High-resolution exports take longer than client-side exports
- **Resource Intensive**: Uses significant CPU and memory
- **Browser Compatibility**: Requires modern browsers for client-side functionality

## Troubleshooting

### Common Issues

1. **Module not loaded**: Check that the build includes the puppeteer-ffmpeg module
2. **Connection failed**: Ensure the server is running and accessible
3. **Export timeout**: Increase timeout or reduce resolution/duration
4. **FFmpeg not found**: Install FFmpeg and ensure it's in PATH
5. **Puppeteer issues**: Check browser installation and permissions

### Debug Mode

Enable debug logging:

```javascript
Chatooly.puppeteerFFmpeg.init({
    debug: true,
    serverEndpoint: '/api/puppeteer-export'
});
```

## Future Enhancements

- [ ] WebSocket support for real-time progress updates
- [ ] Batch export processing
- [ ] Custom export templates
- [ ] Cloud storage integration
- [ ] Export queue management
- [ ] Advanced video encoding options

## Contributing

This is an experimental feature. Contributions are welcome for:
- Bug fixes
- Performance improvements
- Additional export formats
- Better error handling
- Documentation improvements
