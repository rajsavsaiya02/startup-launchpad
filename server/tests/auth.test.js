const request = require('supertest');
const { pool } = require('../src/database');

// Mock index.js to prevent server starting during tests
// We need to import 'app' but often index.js starts server. 
// Ideally app should be exported separately.
// For now, let's assume we can mock the server start or create a test app instance if possible.
// Better approach: Test controllers/functions directly OR refactor index.js. 
// Assuming standard Express structure where app is exported.
// Let's create a temporary app wrapper if needed or rely on mocking.

// !IMPORTANT: Since we don't have a clean 'app' export separate from server.listen in index.js, 
// and `app.js` exports app, we use that.
const app = require('../src/app');

describe('Auth Endpoints', () => {
    
    describe('POST /api/admin/login', () => {
        it('should login successfully with valid credentials', async () => {
            // Mock DB response
            pool.query.mockResolvedValueOnce({ 
                rows: [{ 
                    id: 1, 
                    username: 'admin', 
                    password_hash: '$2b$10$abcdefg...', // Mock hash (bcrypt compare will fail if we don't mock bcrypt too or use valid hash)
                    role: 'admin' 
                }] 
            });
            
            // We need to mock bcrypt.compare to return true
            const bcrypt = require('bcrypt');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'admin', password: 'password' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('admin');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should fail with invalid credentials', async () => {
             pool.query.mockResolvedValueOnce({ rows: [] }); // User not found

             const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'wrong', password: 'password' });
            
             expect(res.statusCode).toEqual(401);
        });
    });
});
