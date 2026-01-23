/**
 * Simple User-Agent Parser
 * Parses the User-Agent string to extract Browser, OS, and Device information.
 */
const parseUserAgent = (userAgent) => {
    if (!userAgent) {
        return {
            browser: 'Unknown',
            browser_version: '',
            os: 'Unknown',
            os_version: '',
            device_type: 'Unknown',
            device_model: '',
            user_agent_raw: ''
        };
    }

    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Desktop'; // Default to Desktop
    let browserVersion = '';
    let osVersion = '';

    // OS Detection
    if (/windows/i.test(userAgent)) {
        os = 'Windows';
        const match = userAgent.match(/Windows NT ([\d.]+)/);
        if (match) osVersion = match[1];
    } else if (/macintosh|mac os x/i.test(userAgent)) {
        os = 'macOS';
        const match = userAgent.match(/Mac OS X ([\d_]+)/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (/android/i.test(userAgent)) {
        os = 'Android';
        deviceType = 'Mobile';
        const match = userAgent.match(/Android ([\d.]+)/);
        if (match) osVersion = match[1];
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        os = 'iOS';
        deviceType = /ipad/i.test(userAgent) ? 'Tablet' : 'Mobile';
        const match = userAgent.match(/OS ([\d_]+) like Mac OS X/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (/linux/i.test(userAgent)) {
        os = 'Linux';
    }

    // Browser Detection
    if (/edg/i.test(userAgent)) {
        browser = 'Edge';
        const match = userAgent.match(/Edg\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (/chrome|crios/i.test(userAgent) && !/edg|opr|brave/i.test(userAgent)) {
        browser = 'Chrome';
        const match = userAgent.match(/(?:Chrome|CriOS)\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (/firefox|fxios/i.test(userAgent)) {
        browser = 'Firefox';
        const match = userAgent.match(/(?:Firefox|FxiOS)\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
        browser = 'Safari';
        const match = userAgent.match(/Version\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (/opr\//i.test(userAgent)) {
        browser = 'Opera';
        const match = userAgent.match(/Opr\/([\d.]+)/);
        if (match) browserVersion = match[1];
    }

    // Explicit Device Type overrides
    if (/mobile/i.test(userAgent) && deviceType === 'Desktop') {
        deviceType = 'Mobile';
    }
    if (/tablet/i.test(userAgent)) {
        deviceType = 'Tablet';
    }

    return {
        browser,
        browser_version: browserVersion,
        os,
        os_version: osVersion,
        device_type: deviceType,
        device_model: '', // Difficult to get model from UA reliably without a massive DB
        user_agent_raw: userAgent
    };
};

module.exports = { parseUserAgent };
