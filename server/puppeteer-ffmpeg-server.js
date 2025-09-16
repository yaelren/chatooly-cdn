const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Chatooly Puppeteer FFmpeg Export Server
 * Handles high-resolution exports using Puppeteer and FFmpeg
 */

class PuppeteerFFmpegExporter {
    constructor(options = {}) {
        this.config = {
            outputDir: options.outputDir || './exports',
            tempDir: options.tempDir || './temp',
            defaultResolution: options.defaultResolution || 4,
            defaultFPS: options.defaultFPS || 30,
            timeout: options.timeout || 30000,
            browserOptions: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        };
        
        this.activeExports = new Map();
        this.ensureDirectories();
    }
    
    // Ensure output and temp directories exist
    ensureDirectories() {
        [this.config.outputDir, this.config.tempDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    // Main export handler
    async handleExport(exportData) {
        const exportId = exportData.id || uuidv4();
        const startTime = Date.now();
        
        try {
            console.log(`🎬 Starting export ${exportId}:`, exportData.format);
            
            // Store export info
            this.activeExports.set(exportId, {
                id: exportId,
                status: 'starting',
                startTime,
                format: exportData.format,
                progress: 0
            });
            
            let result;
            
            switch (exportData.format) {
                case 'png-sequence':
                    result = await this.exportPNGSequence(exportId, exportData);
                    break;
                case 'mp4':
                    result = await this.exportMP4(exportId, exportData);
                    break;
                case 'webm':
                    result = await this.exportWebM(exportId, exportData);
                    break;
                default:
                    throw new Error(`Unsupported format: ${exportData.format}`);
            }
            
            // Update final status
            this.activeExports.set(exportId, {
                ...this.activeExports.get(exportId),
                status: 'completed',
                progress: 100,
                result,
                endTime: Date.now(),
                duration: Date.now() - startTime
            });
            
            console.log(`✅ Export ${exportId} completed in ${Date.now() - startTime}ms`);
            return result;
            
        } catch (error) {
            console.error(`❌ Export ${exportId} failed:`, error);
            
            // Update error status
            this.activeExports.set(exportId, {
                ...this.activeExports.get(exportId),
                status: 'error',
                error: error.message,
                endTime: Date.now(),
                duration: Date.now() - startTime
            });
            
            throw error;
        }
    }
    
    // Export PNG sequence
    async exportPNGSequence(exportId, exportData) {
        const browser = await puppeteer.launch(this.config.browserOptions);
        const page = await browser.newPage();
        
        try {
            // Set viewport based on resolution multiplier
            const baseWidth = exportData.canvasData.dimensions.width;
            const baseHeight = exportData.canvasData.dimensions.height;
            const multiplier = exportData.resolution || this.config.defaultResolution;
            
            await page.setViewport({
                width: Math.round(baseWidth * multiplier),
                height: Math.round(baseHeight * multiplier),
                deviceScaleFactor: 1
            });
            
            // Navigate to the page
            await page.goto(exportData.pageUrl, { 
                waitUntil: 'networkidle0',
                timeout: this.config.timeout 
            });
            
            // Wait for canvas to be ready
            await page.waitForSelector(`#${exportData.canvasData.elementId}`, { timeout: 10000 });
            
            // Inject export script
            await page.evaluate((canvasData) => {
                // Set up canvas for high-res rendering
                const canvas = document.getElementById(canvasData.elementId);
                if (canvas) {
                    canvas.width = canvasData.dimensions.width * canvasData.resolution;
                    canvas.height = canvasData.dimensions.height * canvasData.resolution;
                }
                
                // Trigger any necessary framework setup
                if (window.p5 && window.p5.instance) {
                    window.p5.instance.resizeCanvas(
                        canvasData.dimensions.width * canvasData.resolution,
                        canvasData.dimensions.height * canvasData.resolution
                    );
                }
            }, { ...exportData.canvasData, resolution: multiplier });
            
            // Wait a bit for rendering to stabilize
            await page.waitForTimeout(1000);
            
            // Create output directory for this export
            const outputDir = path.join(this.config.outputDir, exportId);
            fs.mkdirSync(outputDir, { recursive: true });
            
            // Capture frames
            const frameCount = Math.round(exportData.duration * exportData.fps);
            const frameDelay = 1000 / exportData.fps;
            
            for (let i = 0; i < frameCount; i++) {
                // Update progress
                const progress = Math.round((i / frameCount) * 100);
                this.activeExports.set(exportId, {
                    ...this.activeExports.get(exportId),
                    status: 'capturing',
                    progress
                });
                
                // Capture frame
                const framePath = path.join(outputDir, `frame_${i.toString().padStart(4, '0')}.png`);
                
                await page.screenshot({
                    path: framePath,
                    type: 'png',
                    omitBackground: exportData.transparent,
                    clip: {
                        x: 0,
                        y: 0,
                        width: Math.round(baseWidth * multiplier),
                        height: Math.round(baseHeight * multiplier)
                    }
                });
                
                // Wait for next frame
                if (i < frameCount - 1) {
                    await page.waitForTimeout(frameDelay);
                }
            }
            
            await browser.close();
            
            return {
                exportId,
                format: 'png-sequence',
                outputDir,
                frameCount,
                resolution: `${baseWidth * multiplier}x${baseHeight * multiplier}`,
                files: fs.readdirSync(outputDir).map(file => path.join(outputDir, file))
            };
            
        } catch (error) {
            await browser.close();
            throw error;
        }
    }
    
    // Export MP4 video
    async exportMP4(exportId, exportData) {
        // First export PNG sequence
        const pngResult = await this.exportPNGSequence(exportId, exportData);
        
        // Then convert to MP4 using FFmpeg
        const outputPath = path.join(this.config.outputDir, `${exportId}.mp4`);
        
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(path.join(pngResult.outputDir, 'frame_%04d.png'))
                .inputFPS(exportData.fps)
                .outputOptions([
                    '-c:v libx264',
                    '-pix_fmt yuv420p',
                    '-crf 18', // High quality
                    '-preset slow'
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log(`🎥 FFmpeg started: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    this.activeExports.set(exportId, {
                        ...this.activeExports.get(exportId),
                        status: 'encoding',
                        progress: percent
                    });
                })
                .on('end', () => {
                    console.log(`✅ MP4 export completed: ${outputPath}`);
                    resolve({
                        exportId,
                        format: 'mp4',
                        outputPath,
                        resolution: pngResult.resolution,
                        frameCount: pngResult.frameCount,
                        duration: exportData.duration
                    });
                })
                .on('error', (error) => {
                    console.error(`❌ FFmpeg error:`, error);
                    reject(error);
                })
                .run();
        });
    }
    
    // Export WebM video
    async exportWebM(exportId, exportData) {
        // First export PNG sequence
        const pngResult = await this.exportPNGSequence(exportId, exportData);
        
        // Then convert to WebM using FFmpeg
        const outputPath = path.join(this.config.outputDir, `${exportId}.webm`);
        
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(path.join(pngResult.outputDir, 'frame_%04d.png'))
                .inputFPS(exportData.fps)
                .outputOptions([
                    '-c:v libvpx-vp9',
                    '-crf 30', // Good quality
                    '-b:v 0', // Variable bitrate
                    '-deadline realtime'
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log(`🎥 FFmpeg WebM started: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    this.activeExports.set(exportId, {
                        ...this.activeExports.get(exportId),
                        status: 'encoding',
                        progress: percent
                    });
                })
                .on('end', () => {
                    console.log(`✅ WebM export completed: ${outputPath}`);
                    resolve({
                        exportId,
                        format: 'webm',
                        outputPath,
                        resolution: pngResult.resolution,
                        frameCount: pngResult.frameCount,
                        duration: exportData.duration
                    });
                })
                .on('error', (error) => {
                    console.error(`❌ FFmpeg WebM error:`, error);
                    reject(error);
                })
                .run();
        });
    }
    
    // Get export status
    getExportStatus(exportId) {
        return this.activeExports.get(exportId) || null;
    }
    
    // Clean up old exports
    cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
        const now = Date.now();
        const toDelete = [];
        
        this.activeExports.forEach((exportInfo, exportId) => {
            if (exportInfo.endTime && (now - exportInfo.endTime) > maxAge) {
                toDelete.push(exportId);
            }
        });
        
        toDelete.forEach(exportId => {
            this.activeExports.delete(exportId);
            
            // Clean up files
            const outputDir = path.join(this.config.outputDir, exportId);
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
            }
            
            const outputFile = path.join(this.config.outputDir, `${exportId}.mp4`);
            if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
            }
            
            const outputWebM = path.join(this.config.outputDir, `${exportId}.webm`);
            if (fs.existsSync(outputWebM)) {
                fs.unlinkSync(outputWebM);
            }
        });
        
        console.log(`🧹 Cleaned up ${toDelete.length} old exports`);
    }
}

module.exports = PuppeteerFFmpegExporter;
