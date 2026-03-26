require('dotenv').config({ path: __dirname + '/../../.env' });
const { pool } = require('../database');

async function verifyFix() {
  console.log('--- Starting Access Control Verification ---');
  
  try {
    // 1. Identify a project and its owner organization
    const projectRes = await pool.query('SELECT id, title, owner_org_id FROM projects WHERE owner_org_id IS NOT NULL LIMIT 1');
    if (projectRes.rows.length === 0) {
      console.log('No org-owned projects found to test.');
      return;
    }
    const project = projectRes.rows[0];
    console.log(`Testing with Project: ${project.title} (ID: ${project.id}, Org: ${project.owner_org_id})`);

    // 2. Identify a user who is a member of that organization but NOT a member of the project
    const userRes = await pool.query(`
      SELECT om.user_id, om.org_role 
      FROM organization_members om
      WHERE om.organization_id = $1 
      AND om.is_active = true
      AND om.user_id NOT IN (SELECT user_id FROM project_members WHERE project_id = $2)
      LIMIT 1
    `, [project.owner_org_id, project.id]);

    if (userRes.rows.length === 0) {
      console.log('No suitable test user found (org member but not project member).');
      // Fallback: Just print the SQL logic we would use
      console.log('Verification skipped: No project-non-member found in org.');
      return;
    }

    const testUser = userRes.rows[0];
    console.log(`Testing with User ID: ${testUser.user_id} (Org Role: ${testUser.org_role})`);

    // 3. Simulate the new logic for getProjectById
    console.log('\n--- Simulating getProjectById logic ---');
    
    // Check project membership (should be 0)
    const memCheck = await pool.query('SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2', [project.id, testUser.user_id]);
    console.log(`Direct Project Membership: ${memCheck.rows.length > 0 ? 'YES (Expected NO)' : 'NO (Expected)'}`);

    // Check Org membership (should be 1)
    const orgMemCheck = await pool.query(
      'SELECT org_role FROM organization_members WHERE organization_id = $1 AND user_id = $2 AND is_active = true',
      [project.owner_org_id, testUser.user_id]
    );
    console.log(`Organization Membership: ${orgMemCheck.rows.length > 0 ? 'YES (Expected)' : 'NO (Expected YES)'}`);
    
    if (orgMemCheck.rows.length > 0) {
      const role = orgMemCheck.rows[0].org_role;
      const allowed = ["FOUNDER", "CO-FOUNDER", "ADMIN", "MEMBER"].includes(role);
      console.log(`Org Role: ${role}, Access Allowed: ${allowed ? 'YES' : 'NO'}`);
    }

    console.log('\n--- Verification Script Completed Successfully ---');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
  }
}

verifyFix();
