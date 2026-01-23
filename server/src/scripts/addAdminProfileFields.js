const { pool } = require('../database');

const addAdminProfileFields = async () => {
    try {
        console.log('Adding new fields to admins table schema...');

        const queries = [
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS job_title VARCHAR(100)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS office_location VARCHAR(255)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(255)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS social_github VARCHAR(255)",
            "ALTER TABLE admins ADD COLUMN IF NOT EXISTS social_website VARCHAR(255)"
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

addAdminProfileFields();
