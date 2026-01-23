const https = require('https');

/**
 * Resolves IP Address to Location
 * Uses a free external API (ip-api.com) as a fallback.
 * In a real production app, you'd use a local MaxMind DB or a paid service.
 */
const getLocationFromIp = (ip) => {
    return new Promise((resolve) => {
        // Handle localhost or local network IPs
        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return resolve({
                city: 'Localhost',
                country: 'Local System',
                countryCode: 'LO',
                isp: 'Local Network'
            });
        }

        // Use ip-api.com (free for non-commercial, rate limited)
        const url = `http://ip-api.com/json/${ip}`;
        
        // Note using http because ip-api free endpoint is http.
        // For production, use https with a paid key or a different provider.
        // We use 'http' module.
        const http = require('http');

        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'success') {
                        resolve({
                            city: response.city,
                            country: response.country,
                            countryCode: response.countryCode,
                            isp: response.isp
                        });
                    } else {
                        resolve({
                            city: 'Unknown',
                            country: 'Unknown',
                            countryCode: 'UN',
                            isp: 'Unknown'
                        });
                    }
                } catch (e) {
                    resolve({
                        city: 'Unknown',
                        country: 'Unknown',
                        countryCode: 'UN',
                        isp: 'Unknown'
                    });
                }
            });
        });

        req.on('error', (e) => {
             resolve({
                city: 'Unknown',
                country: 'Unknown',
                countryCode: 'UN',
                isp: 'Unknown'
            });
        });
        
        req.end();
    });
};

module.exports = { getLocationFromIp };
