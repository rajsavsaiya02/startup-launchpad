const { pool } = require('../../../database');

const updateAdminSchema = async () => {
    try {
        console.log('Updating admins table schema...');

        const queries = [
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Administrator'",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS department VARCHAR(100)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS bio TEXT",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE"
        ];

        for (const query of queries) {
            await pool.query(query);
            console.log(`Executed: ${query}`);
        }

        console.log('Admins table schema updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
};

updateAdminSchema();
