const request = require('supertest');
const app = require('../app'); // Assuming app.js exports the express app
const { pool } = require('../database');
const bcrypt = require('bcrypt');

describe('Access Control API', () => {
  let superAdminToken;
  let normalAdminToken;
  let newAdminId;

  const superAdminUser = {
    username: 'root_admin',
    password: '@Startup2026'
  };

  const normalAdminUser = {
    username: 'test_admin_control',
    password: 'password123'
  };

  beforeAll(async () => {
    // Ensure root admin exists and has super_admin role (should be set by initDb/migration)
    // We login as root_admin to get token
    const res = await request(app)
      .post('/api/admin/login')
      .send(superAdminUser);
    
    // We need to extract token from cookie or body depending on implementation
    // The controller sets cookie 'admin_token'. Supertest handles cookies if we use an agent, or we can look at set-cookie header.
    // However, the controller creates a session and also returns admin object.
    // The middleware checks req.cookies.admin_token.
    // We'll use supertest agent to persist cookies.
  });

  // Use agent for session persistence
  const superAgent = request.agent(app);
  const normalAgent = request.agent(app);

  it('should login as super admin', async () => {
    const res = await superAgent
      .post('/api/admin/login')
      .send(superAdminUser)
      .expect(200);
    
    expect(res.body.admin.role).toBe('super_admin');
  });

  it('should create a new admin', async () => {
    // Delete if exists
    await pool.query('DELETE FROM admins WHERE username = $1', [normalAdminUser.username]);

    const res = await superAgent
      .post('/api/admin/users')
      .send({
        username: normalAdminUser.username,
        password: normalAdminUser.password,
        role: 'admin'
      })
      .expect(200);

    expect(res.body.message).toBe('New admin created successfully');
    
    // Get ID
    const dbRes = await pool.query('SELECT id FROM admins WHERE username = $1', [normalAdminUser.username]);
    newAdminId = dbRes.rows[0].id;
  });

  it('should login as normal admin', async () => {
    const res = await normalAgent
      .post('/api/admin/login')
      .send(normalAdminUser)
      .expect(200);
    
    expect(res.body.admin.role).toBe('admin');
  });

  it('normal admin should NOT be able to access access control list', async () => {
    await normalAgent
      .get('/api/admin/users')
      .expect(403);
  });

  it('super admin SHOULD be able to access access control list', async () => {
    const res = await superAgent
      .get('/api/admin/users')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(a => a.username === normalAdminUser.username)).toBe(true);
  });

  it('super admin should sustain/unsustain admin', async () => {
    // Suspend
    await superAgent
      .put(`/api/admin/users/${newAdminId}`)
      .send({ status: 'suspended' })
      .expect(200);

    // Verify login fails
    const failAgent = request.agent(app);
    await failAgent
      .post('/api/admin/login')
      .send(normalAdminUser)
      .expect(403); // "Account is suspended"

    // Reactivate
    await superAgent
      .put(`/api/admin/users/${newAdminId}`)
      .send({ status: 'active' })
      .expect(200);
    
    // Verify login works
    await normalAgent
      .post('/api/admin/login')
      .send(normalAdminUser)
      .expect(200);
  });
  
  it('should promote to super admin with security code', async () => {
      // Fail without code
      await superAgent
        .put(`/api/admin/users/${newAdminId}`)
        .send({ role: 'super_admin' })
        .expect(403);

      // Success with code
      await superAgent
        .put(`/api/admin/users/${newAdminId}`)
        .send({ role: 'super_admin', securityCode: '@Startup2026' })
        .expect(200);
        
      // Verify role update
      const res = await pool.query('SELECT role FROM admins WHERE id = $1', [newAdminId]);
      expect(res.rows[0].role).toBe('super_admin');
  });

  afterAll(async () => {
    // Cleanup
    if (newAdminId) {
        await pool.query('DELETE FROM admins WHERE id = $1', [newAdminId]);
    }
    await pool.end();
  });
});
