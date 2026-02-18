const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Unmock the database to use real connection
jest.unmock('../src/database');
jest.unmock('pg');

// Restore console.error suppressed by setup.js
global.console.error = console.log;

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');
console.log('Require Database result:', db);
const pool = db.pool;

console.log('Extracted Pool:', pool);

describe('CMS API Endpoints', () => {
    let pageId;
    const testSlug = 'test-page-automation';

    beforeAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM cms_pages WHERE slug = $1', [testSlug]);
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM cms_pages WHERE slug = $1', [testSlug]);
        if (pool && typeof pool.end === 'function') await pool.end();
        else if (pool && pool.pool && typeof pool.pool.end === 'function') await pool.pool.end();
    });

    it('should create a new page', async () => {
        const res = await request(app)
            .post('/api/cms/pages')
            .send({
                title: 'Automation Test Page',
                slug: testSlug
            });
        
        if (res.statusCode !== 201) {
            console.error('Create Page Error:', res.body);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.slug).toEqual(testSlug);
        pageId = res.body.id;
    });

    it('should list pages', async () => {
        const res = await request(app).get('/api/cms/pages');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        const found = res.body.find(p => p.slug === testSlug);
        expect(found).toBeTruthy();
    });

    it('should update draft content', async () => {
        const res = await request(app)
            .put(`/api/cms/admin/${pageId}/draft`)
            .send({
                draft_content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }] },
                seo_title: 'Test SEO Title'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.seo_title).toEqual('Test SEO Title');
    });

    it('should publish the page', async () => {
        const res = await request(app).post(`/api/cms/admin/${pageId}/publish`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('published');
    });

    it('should retrieve published public content', async () => {
        const res = await request(app).get(`/api/cms/public/${testSlug}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.seo_title).toEqual('Test SEO Title');
        // Check if content matches what we published
        expect(res.body.published_content).toHaveProperty('type', 'doc');
    });

    it('should generate sitemap.xml', async () => {
        const res = await request(app).get('/sitemap.xml');
        expect(res.statusCode).toEqual(200);
        expect(res.type).toEqual('application/xml');
        const baseUrl = process.env.CLIENT_URL || 'https://startuplaunchpad.com';
        expect(res.text).toContain(`<loc>${baseUrl}/${testSlug}</loc>`);
    });

    it('should serve robots.txt', async () => {
        const res = await request(app).get('/robots.txt');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Disallow: /admin');
    });
});
