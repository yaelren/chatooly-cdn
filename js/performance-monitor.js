/**
 * Chatooly CDN - Performance Monitor
 * Tracks library loading times and export performance
 */

(function() {
    'use strict';
    
    // Performance metrics
    const metrics = {
        libraryLoadTime: 0,
        html2canvasLoadTime: 0,
        exportTimes: [],
        fileSize: 0
    };
    
    // Mark library start time
    const libraryStartTime = performance.now();
    
    // Monitor library initialization
    const originalInit = window.Chatooly?.init;
    if (originalInit) {
        window.Chatooly.init = function(...args) {
            metrics.libraryLoadTime = performance.now() - libraryStartTime;
            console.log(`📊 Chatooly: Library initialized in ${metrics.libraryLoadTime.toFixed(2)}ms`);
            return originalInit.apply(this, args);
        };
    }
    
    // Monitor export performance
    const originalExport = window.Chatooly?.export;
    if (originalExport) {
        window.Chatooly.export = function(...args) {
            const exportStartTime = performance.now();
            const result = originalExport.apply(this, args);
            
            // Track export time (approximate)
            setTimeout(() => {
                const exportTime = performance.now() - exportStartTime;
                metrics.exportTimes.push(exportTime);
                console.log(`📊 Chatooly: Export completed in ${exportTime.toFixed(2)}ms`);
                
                // Log average export time every 5 exports
                if (metrics.exportTimes.length % 5 === 0) {
                    const avgTime = metrics.exportTimes.reduce((a, b) => a + b, 0) / metrics.exportTimes.length;
                    console.log(`📊 Chatooly: Average export time: ${avgTime.toFixed(2)}ms (${metrics.exportTimes.length} exports)`);
                }
            }, 100);
            
            return result;
        };
    }
    
    // Monitor html2canvas loading
    const originalLoadHtml2Canvas = window.Chatooly?._loadHtml2Canvas;
    if (originalLoadHtml2Canvas) {
        window.Chatooly._loadHtml2Canvas = function() {
            const loadStartTime = performance.now();
            return originalLoadHtml2Canvas.call(this).then(result => {
                metrics.html2canvasLoadTime = performance.now() - loadStartTime;
                console.log(`📊 Chatooly: html2canvas loaded in ${metrics.html2canvasLoadTime.toFixed(2)}ms`);
                return result;
            });
        };
    }
    
    // File size monitoring
    fetch(document.currentScript?.src || '/js/core.js', { method: 'HEAD' })
        .then(response => {
            metrics.fileSize = parseInt(response.headers.get('content-length') || '0');
            console.log(`📊 Chatooly: Library size: ${(metrics.fileSize / 1024).toFixed(1)}KB`);
        })
        .catch(() => {
            console.log('📊 Chatooly: Could not determine file size');
        });
    
    // Global performance report
    window.ChatoolyPerformance = {
        getMetrics: () => ({ ...metrics }),
        
        getReport: () => {
            const avgExportTime = metrics.exportTimes.length > 0 
                ? metrics.exportTimes.reduce((a, b) => a + b, 0) / metrics.exportTimes.length 
                : 0;
                
            return {
                librarySize: `${(metrics.fileSize / 1024).toFixed(1)}KB`,
                initTime: `${metrics.libraryLoadTime.toFixed(2)}ms`,
                html2canvasLoadTime: metrics.html2canvasLoadTime > 0 ? `${metrics.html2canvasLoadTime.toFixed(2)}ms` : 'Not loaded',
                averageExportTime: avgExportTime > 0 ? `${avgExportTime.toFixed(2)}ms` : 'No exports yet',
                totalExports: metrics.exportTimes.length
            };
        },
        
        logReport: () => {
            console.table(window.ChatoolyPerformance.getReport());
        }
    };
    
    // Auto-report after 30 seconds if there's activity
    setTimeout(() => {
        if (metrics.exportTimes.length > 0 || metrics.html2canvasLoadTime > 0) {
            console.log('📊 Chatooly Performance Report:');
            window.ChatoolyPerformance.logReport();
        }
    }, 30000);
    
})();