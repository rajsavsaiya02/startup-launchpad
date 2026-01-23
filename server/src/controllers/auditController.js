const { pool } = require('../database/connection');

exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      event_type, 
      user, 
      search, 
      start_date, 
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    // Base Query Construction
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Filters
    if (event_type && event_type !== 'All Events') {
      queryParams.push(event_type);
      whereClause += ` AND l.event_type = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      const i = queryParams.length;
      whereClause += ` AND (
        l.action ILIKE $${i} 
        OR l.description ILIKE $${i}
        OR l.event_type ILIKE $${i}
        OR l.ip_address ILIKE $${i}
        OR u.name ILIKE $${i}
        OR a.full_name ILIKE $${i}
      )`;
    }

    // Date range
    if (start_date) {
      queryParams.push(start_date);
      whereClause += ` AND l.created_at >= $${queryParams.length}`;
    }
    if (end_date) {
      queryParams.push(end_date);
      whereClause += ` AND l.created_at <= $${queryParams.length}`;
    }

    // 1. Get Total Count (Robustly)
    // We reuse exactly the same WHERE clause and params
    const countQuery = `
      SELECT COUNT(*) 
      FROM audit_logs l 
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN admins a ON l.admin_id = a.id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const totalEvents = parseInt(countResult.rows[0].count);

    // 2. Get Data
    // Clone params for the data query so we don't mess up if we needed them again (though we don't here)
    const dataParams = [...queryParams];
    
    let dataQuery = `
      SELECT 
        l.*,
        u.name as user_name, u.avatar as user_avatar,
        a.full_name as admin_name, a.avatar_url as admin_avatar
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN admins a ON l.admin_id = a.id
      ${whereClause}
      ORDER BY l.created_at DESC
    `;

    // Pagination
    dataParams.push(limit);
    dataQuery += ` LIMIT $${dataParams.length}`;
    
    dataParams.push(offset);
    dataQuery += ` OFFSET $${dataParams.length}`;

    const result = await pool.query(dataQuery, dataParams);

    res.json({
      logs: result.rows,
      pagination: {
        total: totalEvents,
        page: parseInt(page),
        pages: Math.ceil(totalEvents / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

exports.getAuditStats = async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT
                COUNT(*) as total_events,
                COUNT(CASE WHEN event_type = 'Security' THEN 1 END) as security_events,
                COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_events
            FROM audit_logs
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};
