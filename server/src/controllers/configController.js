const path = require('path');
const fs = require('fs');

const CONFIG_FILES = {
    caldav: 'caldav-startuplaunchpad@cyberinfospace.com.mobileconfig',
    carddav: 'carddav-startuplaunchpad@cyberinfospace.com.mobileconfig',
    email: 'email-startuplaunchpad@cyberinfospace.com.mobileconfig',
};

exports.serveConfig = (req, res) => {
    const { type } = req.params;
    const filename = CONFIG_FILES[type];

    if (!filename) {
        return res.status(404).json({ error: 'Configuration type not found' });
    }

    const filePath = path.join(__dirname, '../public/mobile-configs', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`Config file not found: ${filePath}`);
        return res.status(404).json({ error: 'Configuration file not found on server' });
    }

    // Set headers for mobileconfig
    res.setHeader('Content-Type', 'application/x-apple-aspen-config');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.sendFile(filePath);
};
