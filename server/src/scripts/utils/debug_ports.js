const { exec } = require('child_process');

const PLATFORM_PORTS = {
    [process.env.PORT || 5000]: 'Backend API',
    [process.env.DB_PORT || 5432]: 'PostgreSQL Database',
    '5173': 'Frontend (Vite)', // Common dev port
    '3000': 'Frontend/Service',
    '6379': 'Redis Cache',
    [process.env.SMTP_PORT || 465]: 'SMTP Service'
};

console.log('PLATFORM_PORTS:', PLATFORM_PORTS);

exec('lsof -i -P -n', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    console.log('Raw Output:\n', stdout);

    const lines = stdout.trim().split('\n');
    const activePorts = [];

    lines.forEach(line => {
        if (!line.includes('(LISTEN)')) return;

        const parts = line.split(/\s+/);
        const addressPart = parts.find(p => p.includes(':') && !p.includes('->') && (p.match(/:\d+$/)));
        
        if (addressPart) {
            const port = addressPart.split(':').pop();
            console.log(`Found address: ${addressPart}, Port: ${port}, Service: ${PLATFORM_PORTS[port]}`);
            
            if (PLATFORM_PORTS[port]) {
                activePorts.push({
                    command: parts[0],
                    pid: parts[1],
                    user: parts[2],
                    protocol: parts[4] || 'TCP',
                    address: addressPart,
                    port: port,
                    service: PLATFORM_PORTS[port],
                    status: 'Secured'
                });
            } else {
                const isPublic = addressPart.startsWith('*:') || addressPart.startsWith('0.0.0.0:');
                if (isPublic) {
                        activePorts.push({
                        command: parts[0],
                        pid: parts[1],
                        user: parts[2],
                        protocol: parts[4] || 'TCP',
                        address: addressPart,
                        port: port,
                        service: 'Unknown Public Service',
                        status: 'Risk'
                    });
                }
            }
        }
    });

    // Deduplicate ports (sometimes multiple threads listen on same port)
    const uniquePorts = activePorts.reduce((acc, current) => {
        const x = acc.find(item => item.port === current.port);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    console.log('Final Active Ports:', uniquePorts);
});
