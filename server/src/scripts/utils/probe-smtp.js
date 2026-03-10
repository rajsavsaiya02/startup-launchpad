const nodemailer = require('nodemailer');

async function probe(secure) {
    console.log(`\nProbing Port 465 with secure: ${secure}...`);
    let transporter = nodemailer.createTransport({
        host: "mail.cyberinfospace.com",
        port: 465,
        secure: secure,
        auth: {
            user: "startuplaunchpad@cyberinfospace.com",
            pass: "@Startup2026",
        },
        tls: { rejectUnauthorized: false }, // Lenient on certs for probing
        debug: true // Enable debug output
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS with secure: ${secure}`);
    } catch (error) {
        console.log(`❌ FAILED with secure: ${secure}`);
        console.log(error.message);
    }
}

async function run() {
    // Try standard implicit SSL first
    await probe(true);
    // Try STARTTLS on 465
    await probe(false);
}

run();
