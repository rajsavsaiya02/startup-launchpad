const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/database/connection');
const jwt = require('jsonwebtoken');

describe('Audit Logs API', () => {
    let adminToken;

    beforeAll(async () => {
        // Create a mock admin user if needed or just sign a token
        // For integration tests, we usually want a real DB connection
        // Assuming the DB is up and running as per user context
        
        // Mock Admin Payload
        const adminPayload = {
            id: 'test-admin-id',
            role: 'super_admin',
            email: 'admin@test.com'
        };

        adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/admin/audit', () => {
        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/admin/audit');
            expect(res.statusCode).toEqual(401);
        });

        it('should return audit logs for authenticated admin', async () => {
            const res = await request(app)
                .get('/api/admin/audit')
                .set('Cookie', [`admin_token=${adminToken}`]);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('logs');
            expect(Array.isArray(res.body.logs)).toBe(true);
            expect(res.body).toHaveProperty('pagination');
        });

        it('should support pagination', async () => {
             const res = await request(app)
                .get('/api/admin/audit?page=1&limit=5')
                .set('Cookie', [`admin_token=${adminToken}`]);
            
             expect(res.statusCode).toEqual(200);
             expect(res.body.logs.length).toBeLessThanOrEqual(5);
             expect(res.body.pagination.page).toEqual(1);
        });

        it('should filter by event type', async () => {
            const res = await request(app)
                .get('/api/admin/audit?event_type=Security')
                .set('Cookie', [`admin_token=${adminToken}`]);
            
            expect(res.statusCode).toEqual(200);
            if (res.body.logs.length > 0) {
                expect(res.body.logs[0].event_type).toEqual('Security');
            }
        });
    });

    describe('GET /api/admin/audit/stats', () => {
        it('should return audit statistics', async () => {
            const res = await request(app)
                .get('/api/admin/audit/stats')
                .set('Cookie', [`admin_token=${adminToken}`]);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total_events');
            expect(res.body).toHaveProperty('security_events');
            expect(res.body).toHaveProperty('failed_events');
        });
    });
});
