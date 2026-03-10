const nodemailer = require('nodemailer');

async function test(port, secure) {
    console.log(`Testing Port ${port} with secure: ${secure}...`);
    let transporter = nodemailer.createTransport({
        host: "mail.cyberinfospace.com",
        port: port,
        secure: secure,
        auth: {
            user: "startuplaunchpad@cyberinfospace.com",
            pass: "@Startup2026",
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS Port ${port} Secure ${secure}`);
    } catch (error) {
        console.log(`❌ FAILED Port ${port} Secure ${secure}`);
        console.log(error.message);
        if (error.code === 'ESOCKET') console.log('Code: ESOCKET');
    }
}

async function run() {
    // Hypothesis: The app is doing this (587 + True) which causes "wrong version number"
    await test(587, true); 
    
    // Control: This should work (465 + True)
    await test(465, true);
}

run();
