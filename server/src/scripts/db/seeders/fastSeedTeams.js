const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { pool } = require('../../../database');

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Fetching the organization "FIRSTSTARTUP"...');
        const orgRes = await client.query(`SELECT organization_id FROM organizations WHERE name ILIKE '%FIRSTSTARTUP%' LIMIT 1`);
        if (orgRes.rows.length === 0) {
            throw new Error('No organization found matching "FIRSTSTARTUP".');
        }
        const orgId = orgRes.rows[0].organization_id;
        console.log(`Working with organization_id: ${orgId}`);

        // 1. Setup Departments
        console.log('Setting up Departments...');
        const depts = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'];
        const departmentIds = {};
        for (const d of depts) {
            const res = await client.query(`
                INSERT INTO organization_departments (organization_id, name)
                VALUES ($1, $2)
                ON CONFLICT (organization_id, name) DO UPDATE SET name = EXCLUDED.name
                RETURNING department_id;
            `, [orgId, d]);
            departmentIds[d] = res.rows[0].department_id;
        }

        // 2. Setup Designations (Layers)
        console.log('Setting up Designations...');
        const designationsData = [
            { title: 'CTO', dept: 'Engineering', layer: 5 },
            { title: 'Engineering Manager', dept: 'Engineering', layer: 4 },
            { title: 'Senior Software Engineer', dept: 'Engineering', layer: 3 },
            { title: 'Software Engineer', dept: 'Engineering', layer: 2 },
            { title: 'Junior Software Engineer', dept: 'Engineering', layer: 1 },
            { title: 'Head of Design', dept: 'Design', layer: 4 },
            { title: 'Product Designer', dept: 'Design', layer: 2 },
            { title: 'Product Manager', dept: 'Product', layer: 3 },
            { title: 'Marketing Lead', dept: 'Marketing', layer: 3 },
            { title: 'Sales Representative', dept: 'Sales', layer: 2 }
        ];
        const designationIds = [];
        for (const des of designationsData) {
            const dRes = await client.query(`
                INSERT INTO organization_designations (organization_id, title, department_id, hierarchy_level)
                VALUES ($1, $2, $3, $4)
                RETURNING designation_id;
            `, [orgId, des.title, departmentIds[des.dept], des.layer]);
            designationIds.push({ ...des, id: dRes.rows[0].designation_id });
        }

        // 3. Setup Teams
        console.log('Setting up Teams...');
        const teamNames = ['Core Platform', 'Growth Pod', 'Enterprise Solutions'];
        const teamIds = [];
        for (const t of teamNames) {
            const tRes = await client.query(`
                INSERT INTO organization_teams (organization_id, name, category, description)
                VALUES ($1, $2, 'Engineering', 'Seeded testing team')
                RETURNING team_id;
            `, [orgId, t]);
            teamIds.push(tRes.rows[0].team_id);
        }

        // 4. Fetch Existing Users not already in this org
        console.log('Fetching existing users...');
        const usersRes = await client.query(`
            SELECT id FROM users 
            WHERE id NOT IN (
                SELECT user_id FROM organization_members WHERE organization_id = $1
            )
            LIMIT 50;
        `, [orgId]);
        
        const users = usersRes.rows;
        console.log(`Found ${users.length} available users to add to the organization.`);
        
        if (users.length === 0) {
            console.log('No existing users available to add. Please insert users first if needed.');
        } else {
            console.log('Adding users as organization members with varying roles, departments, teams, and designations...');
            
            for (let i = 0; i < users.length; i++) {
                const userId = users[i].id;
                
                // Randomize or cycle through designations & teams
                const desigIndex = i % designationIds.length;
                const desig = designationIds[desigIndex];
                
                // Distribute evenly across the 3 teams, but maybe leave some without teams to test isolation
                const teamId = (i % 5 !== 0) ? teamIds[i % teamIds.length] : null; 
                
                // Determine org role (mostly MEMBER, a few ADMINs)
                let orgRole = 'MEMBER';
                if (desig.layer >= 4) {
                    orgRole = 'ADMIN';
                }

                await client.query(`
                    INSERT INTO organization_members 
                    (organization_id, user_id, is_active, status, team_id, designation_id, org_role)
                    VALUES ($1, $2, true, 'On Work', $3, $4, $5)
                `, [orgId, userId, teamId, desig.id, orgRole]);
            }
        }
        
        await client.query('COMMIT');
        console.log('✅ Successfully structured FIRSTSTARTUP and added users.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error during seeding:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

main();
