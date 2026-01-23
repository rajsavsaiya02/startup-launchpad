const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

describe('System Health API', () => {
  
  // Clean up after tests
  afterAll(async () => {
    // If you have a disconnect method in your db module, call it here.
    // Otherwise, Jest might warn about open handles.
    // await db.end(); 
  });

  describe('GET /api/health', () => {
    it('should return 200 and health metrics', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      
      // Check System Metrics
      expect(res.body.system).toBeDefined();
      expect(res.body.system.uptime).toBeGreaterThan(0);
      expect(res.body.system.memory).toBeDefined();
      expect(res.body.system.cpus).toBeGreaterThan(0);
      expect(res.body.system.backendVersion).toBeDefined(); // New field
      expect(res.body.system.release).toBeDefined(); // New field
      
      // Check Infrastructure Metrics
      expect(res.body.infrastructure).toBeDefined();
      expect(res.body.infrastructure.database).toBeDefined();
      // We expect 'connected' since test environment usually has DB access, 
      // but 'disconnected' is also a valid state if external deps are mocked/missing.
      expect(['connected', 'disconnected', 'error']).toContain(res.body.infrastructure.database.status);
      
      expect(res.body.infrastructure.disk).toBeDefined();
      expect(res.body.infrastructure.disk.used).toBeDefined(); 
      expect(res.body.infrastructure.disk.free).toBeDefined(); // New: against quota
      expect(res.body.infrastructure.disk.quota).toBeGreaterThan(0); // 5GB default, but can change
      expect(res.body.infrastructure.disk.usagePercent).toBeDefined();
      expect(res.body.infrastructure.disk.path).toBeDefined(); 
      expect(Array.isArray(res.body.infrastructure.disk.breakdown)).toBe(true);
    });
  });

  describe('POST /api/health/quota', () => {
    it('should update storage quota', async () => {
        const res = await request(app)
            .post('/api/health/quota')
            .send({ quotaGB: 10 });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.quotaBytes).toBe(10 * 1024 * 1024 * 1024);
    });

    it('should reflect new quota in health check', async () => {
         const res = await request(app).get('/api/health');
         expect(res.body.infrastructure.disk.quota).toBe(10 * 1024 * 1024 * 1024);
    });
  });
});
