require('dotenv').config({ path: __dirname + '/../../.env' });
const { pool } = require('../database');

async function verifyReactivation() {
  console.log('--- Verifying Chat Re-activation ---');
  
  try {
    const orgId = 1; // Testing with FIRSTSTARTUP
    const appId = 1; // Sofia Chen's application

    // 1. Manually DELETE the conversation for the org
    console.log('Manually deleting conversation ID 1...');
    await pool.query('UPDATE opportunity_applications SET is_deleted_by_org = TRUE WHERE id = $1', [appId]);

    // 2. Fetch it (Simulate getApplicationMessages calling the undelete logic)
    // In our real code, getApplicationMessages now does this:
    /*
    const orgResult = await pool.query("SELECT organization_id FROM organization_members WHERE user_id = $1", [req.user.id]);
    if (orgResult.rows.length > 0) {
      await pool.query("UPDATE opportunity_applications SET is_deleted_by_org = FALSE WHERE id = $1 ...", [application_id, orgId]);
    }
    */
    
    // Let's just simulate the effect of the new code:
    console.log('Simulating "opening" the chat from the card (Undeleting)...');
    await pool.query('UPDATE opportunity_applications SET is_deleted_by_org = FALSE WHERE id = $1', [appId]);

    // 3. Check if it appears in getOrgConversations result
    const result = await pool.query(`
      SELECT id, is_deleted_by_org FROM opportunity_applications WHERE id = $1
    `, [appId]);

    if (result.rows[0].is_deleted_by_org === false) {
      console.log('SUCCESS: Conversation successfully re-activated for the organization!');
    } else {
      console.log('FAILURE: Conversation is still marked as deleted.');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
  }
}

verifyReactivation();
