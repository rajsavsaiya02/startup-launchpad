const request = require('supertest');
const jwt = require('jsonwebtoken');

// 1. Explicitly mock the database
jest.mock('../src/database', () => {
    const mPool = {
        query: jest.fn(),
        end: jest.fn(),
    };
    return { pool: mPool };
});

const { pool } = require('../src/database');
const app = require('../src/app');

describe('Session Management API', () => {
    let userToken;
    const userId = 1;
    const sessionId = 'uuid-session-123';

    beforeAll(() => {
        // Setup Token
        userToken = jwt.sign({ id: userId, role: 'normal_user', sessionId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/sessions should return active sessions', async () => {
        // Mock DB response for getActiveSessions
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: sessionId,
                browser: 'TestBrowser',
                os: 'TestOS', 
                device_type: 'Desktop',
                is_active: true,
                created_at: new Date(),
                last_active: new Date()
            }]
        });
        
        // Note: protect middleware also mocks DB checks...
        // Wait, 'protect' middleware calls `pool.query` to check session status!
        // So we need to mock THAT call too.
        // Middleware call AND Controller call.
        
        // Call 1: Middleware checkSession
        pool.query.mockResolvedValueOnce({
            rows: [{ is_active: true }]
        });
        
        // Call 2: Controller getActiveSessions (Wait, the first mock above was consumed? No, I stacked them wrongly)
        
        // Reset and stack correctly:
        pool.query.mockReset();
        
        pool.query
            .mockResolvedValueOnce({ rows: [{ is_active: true }] }) // Middleware
            .mockResolvedValueOnce({ rows: [] }) // Middleware update last_active (async, might not block response but safety)
            .mockResolvedValueOnce({ // Controller
                rows: [{
                    id: sessionId,
                    browser: 'TestBrowser',
                    os: 'TestOS', 
                    device_type: 'Desktop',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    last_active: new Date().toISOString()
                }]
            });

        const res = await request(app)
            .get('/api/sessions')
            .set('Cookie', `token=${userToken}`)
            .expect(200);

        expect(res.body.sessions).toBeDefined();
        expect(res.body.sessions[0].browser).toBe('TestBrowser');
    });

    it('DELETE /api/sessions/:id should revoke session', async () => {
        const targetSessionId = 'uuid-session-456';
        
        pool.query.mockReset();
        // 1. Middleware check active
        pool.query.mockResolvedValueOnce({ rows: [{ is_active: true }] });
        // 2. Middleware update (fire and forget)
        pool.query.mockResolvedValueOnce({}); 
        // 3. Controller ownership check
        pool.query.mockResolvedValueOnce({ rows: [{ id: targetSessionId }] });
        // 4. Controller update revoke
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        const res = await request(app)
            .delete(`/api/sessions/${targetSessionId}`)
            .set('Cookie', `token=${userToken}`)
            .expect(200);
            
        expect(res.body.message).toMatch(/revoked/);
    });

    it('GET /api/auth/check-session should return user data', async () => {
        pool.query.mockReset();
        // 1. checkSession Middleware
        pool.query.mockResolvedValueOnce({ rows: [{ is_active: true }] });
        // 2. checkSession Middleware update
        pool.query.mockResolvedValueOnce({});
        // 3. checkSession Controller (DB query for user)
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', role: 'normal_user' }] });
        
        const res = await request(app)
            .get('/api/auth/check-session')
            .set('Cookie', `token=${userToken}`)
            .expect(200);
            
        expect(res.body.user.email).toBe('test@example.com');
    });
});
