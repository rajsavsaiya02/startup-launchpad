const path = require('path');
// Add server/node_modules to module search path
module.paths.push(path.join(__dirname, '../../server/node_modules'));

const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const runCrudTest = async () => {
    const client = await pool.connect();
    const tableName = 'test_crud_table';

    console.log('🚀 Starting CRUD Operations Test...');

    try {
        // 1. CREATE TABLE
        console.log(`\n1️⃣  Creating table '${tableName}'...`);
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                value INTEGER
            );
        `);
        console.log('✅ Table created successfully.');

        // 2. INSERT (Create)
        console.log(`\n2️⃣  Inserting dummy data...`);
        const insertRes = await client.query(
            `INSERT INTO ${tableName} (name, value) VALUES ($1, $2) RETURNING *`,
            ['Test Item', 100]
        );
        const insertedId = insertRes.rows[0].id;
        console.log('✅ Data inserted:', insertRes.rows[0]);

        // 3. SELECT (Read)
        console.log(`\n3️⃣  Fetching data...`);
        const selectRes = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [insertedId]);
        if (selectRes.rows.length > 0 && selectRes.rows[0].name === 'Test Item') {
            console.log('✅ Data fetched and verified:', selectRes.rows[0]);
        } else {
            throw new Error('❌ Data verification failed during Fetch.');
        }

        // 4. UPDATE
        console.log(`\n4️⃣  Updating data...`);
        const updateRes = await client.query(
            `UPDATE ${tableName} SET value = $1 WHERE id = $2 RETURNING *`,
            [200, insertedId]
        );
        if (updateRes.rows[0].value === 200) {
            console.log('✅ Data updated:', updateRes.rows[0]);
        } else {
            throw new Error('❌ Data update failed.');
        }

        // 5. DELETE
        console.log(`\n5️⃣  Deleting data...`);
        await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [insertedId]);
        const checkDelete = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [insertedId]);
        if (checkDelete.rows.length === 0) {
            console.log('✅ Data deleted successfully.');
        } else {
            throw new Error('❌ Delete operation failed.');
        }

        // 6. DROP TABLE
        console.log(`\n6️⃣  Cleaning up (Dropping table)...`);
        await client.query(`DROP TABLE ${tableName}`);
        console.log('✅ Table dropped successfully.');

        console.log('\n🎉 ALL CRUD TESTS PASSED SAFELY!');
    } catch (err) {
        console.error('\n❌ CRUD Test Failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
};

runCrudTest();
