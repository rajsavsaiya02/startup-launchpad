const { pool } = require('../database/connection');

/**
 * Log an audit event
 * @param {Object} params
 * @param {string} params.event_type - Type of event (e.g., 'Login', 'Create', 'Error', 'System')
 * @param {string} params.action - Short description of the action
 * @param {string} params.description - Detailed description
 * @param {number|null} params.user_id - User ID if applicable
 * @param {number|null} params.admin_id - Admin ID if applicable
 * @param {string} params.ip_address - IP Address of the requester
 * @param {string} params.status - 'Success' or 'Failed'
 * @param {Object} params.details - Additional JSON metadata
 */
const logAudit = async ({
  event_type,
  action,
  description = '',
  user_id = null,
  admin_id = null,
  ip_address = null,
  status = 'Success',
  details = {}
}) => {
  try {
    const query = `
      INSERT INTO audit_logs 
      (event_type, action, description, user_id, admin_id, ip_address, status, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await pool.query(query, [
      event_type, 
      action, 
      description, 
      user_id, 
      admin_id, 
      ip_address, 
      status, 
      JSON.stringify(details)
    ]);
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't crash the app if logging fails
  }
};

module.exports = { logAudit };
