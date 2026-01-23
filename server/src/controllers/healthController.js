const logger = require('../utils/logger');
const db = require('../database');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;
const packageJson = require('../../package.json'); 

exports.checkHealth = async (req, res) => {
    // Helper to get directory size recursively
    const getDirSize = async (dir) => {
        let size = 0;
        try {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = await fs.stat(filePath);
                if (stats.isDirectory()) {
                    size += await getDirSize(filePath);
                } else {
                    size += stats.size;
                }
            }
        } catch (err) {
            // Ignore errors for specific files, but return what we have
             logger.error(`Error calculating size for ${dir}: ${err.message}`);
        }
        return size;
    };

    const processMemory = process.memoryUsage();

    const healthData = {
        status: 'success',
        timestamp: new Date(),
        system: {
            uptime: process.uptime(),
            loadavg: os.loadavg(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: processMemory.rss, // Process Resident Set Size
                process: processMemory
            },
            cpus: os.cpus().length,
            platform: process.platform,
            release: os.release(),
            nodeVersion: process.version,
            backendVersion: packageJson.version
        },
        infrastructure: {
            database: {
                status: 'disconnected',
                latency: null
            },
            disk: {
                status: 'unknown',
                used: 0,
                path: 'unknown'
            }
        }
    };

    // Database Check
    const start = process.hrtime();
    try {
        await db.query('SELECT NOW()');
        const diff = process.hrtime(start);
        const latencyMs = (diff[0] * 1e9 + diff[1]) / 1e6;
        
        healthData.infrastructure.database.status = 'connected';
        healthData.infrastructure.database.latency = parseFloat(latencyMs.toFixed(2));
    } catch (error) {
        logger.error('Health check DB connection failed: ' + error.message);
        healthData.infrastructure.database.status = 'error';
        healthData.infrastructure.database.message = error.message;
        healthData.status = 'degraded'; // Downgrade overall status
    }

    // Storage Folder Check
    try {
        // Resolve absolute path to storage directory
        const storagePath = path.resolve(__dirname, '../../storage'); 
        
        // Check if directory exists and is accessible
        await fs.access(storagePath);

        const breakdown = [];
        let totalUsed = 0;

        const entries = await fs.readdir(storagePath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(storagePath, entry.name);
            let size = 0;

            if (entry.isDirectory()) {
                 size = await getDirSize(entryPath);
            } else {
                 const stats = await fs.stat(entryPath);
                 size = stats.size;
            }
            
            totalUsed += size;
            breakdown.push({
                name: entry.name,
                size: size,
                type: entry.isDirectory() ? 'directory' : 'file'
            });
        }

        // Sort largest first
        breakdown.sort((a, b) => b.size - a.size);

        // Get Quota from config
        let storageQuota = 5 * 1024 * 1024 * 1024; // Default 5GB
        try {
            const configPath = path.join(__dirname, '../config/storage-config.json');
            const configFile = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configFile);
            if (config.quotaBytes) {
                storageQuota = config.quotaBytes;
            }
        } catch (err) {
            // If file doesn't exist, use default. Log other errors.
            if (err.code !== 'ENOENT') {
                logger.error('Failed to read storage config: ' + err.message);
            }
        }

        const freeSpace = Math.max(0, storageQuota - totalUsed);
        const usagePercent = (totalUsed / storageQuota) * 100;

        let diskStatus = 'ok';
        if (usagePercent > 90) {
            diskStatus = 'critical';
        } else if (usagePercent > 75) {
            diskStatus = 'degraded'; // Warning
        }

        healthData.infrastructure.disk = {
            status: diskStatus,
            used: totalUsed,
            free: freeSpace,
            quota: storageQuota, 
            usagePercent: parseFloat(usagePercent.toFixed(2)),
            path: storagePath,
            breakdown: breakdown
        };

    } catch (error) {
        logger.error('Health check Storage access failed: ' + error.message);
        healthData.infrastructure.disk.status = 'error';
        healthData.infrastructure.disk.message = error.message;
    }

    // Determine overall status
    if (healthData.infrastructure.database.status !== 'connected') {
        healthData.status = 'critical';
    }

    res.status(200).json(healthData);
};

exports.updateQuota = async (req, res) => {
    try {
        const { quotaGB } = req.body;
        if (!quotaGB || isNaN(quotaGB) || quotaGB <= 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid quota value' });
        }

        const quotaBytes = quotaGB * 1024 * 1024 * 1024;
        const configPath = path.join(__dirname, '../config/storage-config.json');
        
        await fs.writeFile(configPath, JSON.stringify({ quotaBytes }, null, 2));
        
        res.status(200).json({ status: 'success', message: 'Quota updated', quotaBytes });
    } catch (error) {
        logger.error('Failed to update storage quota: ' + error.message);
        res.status(500).json({ status: 'error', message: 'Failed to update quota' });
    }
};
