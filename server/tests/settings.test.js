const request = require('supertest');
const { pool } = require('../src/database');

// Mock Middleware: Bypass verifyAdminToken
jest.mock('../src/middleware/adminAuthMiddleware', () => (req, res, next) => {
    req.admin = { id: 1, role: 'admin' };
    next();
});

// Mock DB
jest.mock('../src/database', () => ({
    pool: {
        query: jest.fn()
    }
}));

// Mock System Settings Service (used by Maintenance Middleware)
jest.mock('../src/services/systemSettingsService', () => ({
    getSystemSettings: jest.fn().mockResolvedValue({ maintenance_mode: false })
}));

const app = require('../src/app');

describe('Settings API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/settings', () => {
        it('should return settings', async () => {
            const mockSettings = {
                id: 1,
                platform_name: 'Test Platform',
                branding_enabled: true
            };
            pool.query.mockResolvedValueOnce({ rows: [mockSettings] });

            const res = await request(app).get('/api/settings');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockSettings);
        });

        it('should return 404 if settings not found', async () => {
             pool.query.mockResolvedValueOnce({ rows: [] });

             const res = await request(app).get('/api/settings');
             
             expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/settings', () => {
        it('should update settings (branding fields)', async () => {
            const updatePayload = {
                platform_name: 'New Name',
                support_email: 'test@email.com',
                primary_color: '#000000',
                logo_url: '/logo.png'
            };

            const mockUpdatedSettings = { ...updatePayload, id: 1 };
            
            // Mock DB response for UPDATE
            pool.query.mockResolvedValueOnce({ rows: [mockUpdatedSettings] });

            const res = await request(app)
                .put('/api/settings')
                .send(updatePayload);

            expect(res.statusCode).toBe(200);
            expect(res.body.settings).toEqual(mockUpdatedSettings);
            // Verify DB call includes new fields
            const queryCall = pool.query.mock.calls[0];
            expect(queryCall[0]).toContain('logo_url');
            expect(queryCall[1]).toContain('#000000');
        });
    });
});
