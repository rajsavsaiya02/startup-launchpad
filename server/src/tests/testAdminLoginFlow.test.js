jest.unmock('pg');
jest.unmock('../database');
jest.unmock('../database/connection');

const request = require('supertest');
const app = require('../app');
const { pool } = require('../database');

describe('Admin Authentication Flow', () => {
    console.log('Pool Import:', pool);
    let cookie;

    afterAll(async () => {
        if (pool && typeof pool.end === 'function') {
            await pool.end();
        } else {
            console.error('Pool.end is not a function:', pool);
        }
    });

    test('Step 1: Admin Login', async () => {
        const response = await request(app)
            .post('/api/admin/login')
            .send({
                username: 'root_admin',
                password: '@Startup2026'
            });

        if (response.statusCode !== 200) {
            console.error('Login Failed Response:', response.body);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('admin');
        expect(response.body.admin).toHaveProperty('role', 'super_admin'); // initialized as super_admin

        // Capture Cookie
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        
        // Find admin_token
        const adminTokenCookie = cookies.find(c => c.startsWith('admin_token='));
        expect(adminTokenCookie).toBeDefined();
        
        cookie = cookies;
        console.log('Login Successful. Cookie received:', cookie);
    });

    test('Step 2: Access Protected Admin Route', async () => {
        expect(cookie).toBeDefined();

        const response = await request(app)
            .get('/api/admin/me')
            .set('Cookie', cookie);

        if (response.statusCode !== 200) {
            console.error('Protected Route Failed:', response.body);
        }

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('username', 'root_admin');
        console.log('Protected Route Access Successful:', response.body);
    });

    test('Step 3: Check Session (AuthContext)', async () => {
        const response = await request(app)
            .get('/api/auth/check-session')
            .set('Cookie', cookie);

        expect(response.statusCode).toBe(200);
        // This is expected to fail currently for super_admin
        if (response.body.isAuthenticated !== true) {
            console.log('Step 3 Failed as expected: isAuthenticated is false for super_admin');
        }
        expect(response.body).toHaveProperty('isAuthenticated', true);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('role', 'super_admin');
    });
});
