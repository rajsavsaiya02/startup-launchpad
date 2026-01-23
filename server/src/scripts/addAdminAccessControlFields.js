const { pool } = require('../database');

const addAdminAccessControlFields = async () => {
    try {
        console.log('Adding access control fields to admins table...');

        // 1. Add status column
        await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'");
        console.log("Added 'status' column.");

        // 2. Standardize Roles
        // Update root_admin to super_admin
        const rootUpdate = await pool.query("UPDATE admins SET role = 'super_admin' WHERE username = 'root_admin'");
        console.log(`Updated root_admin role to super_admin: ${rootUpdate.rowCount} rows.`);

        // Update others to 'admin' if they are 'Administrator' or null
        const otherUpdate = await pool.query("UPDATE admins SET role = 'admin' WHERE role = 'Administrator' OR role IS NULL");
        console.log(`Updated other admins to 'admin': ${otherUpdate.rowCount} rows.`);

        console.log('Admin access control fields updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
};

addAdminAccessControlFields();
