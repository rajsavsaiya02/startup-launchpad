const path = require('path');
// Add server/node_modules to module search path
module.paths.push(path.join(__dirname, '../../server/node_modules'));

const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const testConnection = async () => {
    console.log('Testing Database Connection...');
    console.log(`Connecting to ${process.env.DB_NAME} at ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER}`);

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current Database Time:', res.rows[0].now);
        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
};

testConnection();
