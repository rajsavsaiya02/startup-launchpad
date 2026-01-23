const request = require('supertest');
const { pool } = require('../src/database');

// Mock Middleware
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

// Mock System Settings Service
jest.mock('../src/services/systemSettingsService', () => ({
    getSystemSettings: jest.fn().mockResolvedValue({ maintenance_mode: false }),
    invalidateCache: jest.fn()
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-msg-id' })
    })
}));

const app = require('../src/app');
const systemSettingsService = require('../src/services/systemSettingsService');

describe('Email Settings API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PUT /api/settings (Email Config)', () => {
        it('should update email configuration settings', async () => {
             const updatePayload = {
                platform_name: 'Test Platform', // Required
                support_email: 'support@test.com', // Required
                email_provider: 'smtp',
                smtp_host: 'smtp.mailtrap.io',
                smtp_port: '2525',
                smtp_user: 'user',
                smtp_password: 'password',
                smtp_secure: false,
                system_email_address: 'no-reply@test.com'
            };

            const mockUpdatedSettings = { ...updatePayload, id: 1 };
            pool.query.mockResolvedValueOnce({ rows: [mockUpdatedSettings] });

            const res = await request(app)
                .put('/api/settings')
                .send(updatePayload);

            expect(res.statusCode).toBe(200);
            expect(res.body.settings.email_provider).toBe('smtp');
            
            // Verify DB call params count (we added 15 params, total 29 now check if it looks correct)
            const queryCall = pool.query.mock.calls[0];
            // The query string is the first arg, params array is second
            const params = queryCall[1];
            expect(params).toContain('smtp.mailtrap.io');
            expect(params).toContain('no-reply@test.com');
            
            // Verify Cache Invalidation
            expect(systemSettingsService.invalidateCache).toHaveBeenCalled();
        });
    });

    describe('POST /api/settings/email/test', () => {
        it('should verify SMTP connection successfully', async () => {
            const config = {
                email_provider: 'smtp',
                smtp_host: 'smtp.example.com',
                smtp_port: '587',
                smtp_user: 'user',
                smtp_password: 'pass',
                smtp_secure: false
            };

            const res = await request(app)
                .post('/api/settings/email/test')
                .send(config);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('SMTP connection established');
        });

        it('should return error if SMTP credentials missing', async () => {
            const config = {
                email_provider: 'smtp',
                smtp_host: 'smtp.example.com'
                // Missing user/pass
            };

            const res = await request(app)
                .post('/api/settings/email/test')
                .send(config);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Missing SMTP credentials');
        });
    });

    describe('Email Templates API', () => {
        describe('GET /api/settings/email/templates', () => {
            it('should return list of templates', async () => {
                const mockTemplates = [
                    { id: 1, name: 'Welcome Email', subject: 'Welcome' }
                ];
                pool.query.mockResolvedValueOnce({ rows: mockTemplates });

                const res = await request(app).get('/api/settings/email/templates');

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(mockTemplates);
                expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM email_templates'));
            });
        });

        describe('PUT /api/settings/email/templates/:id', () => {
            it('should update template content', async () => {
                const updatePayload = {
                    subject: 'New Subject',
                    body: '<p>New Body</p>'
                };
                const mockUpdatedTemplate = { id: 1, ...updatePayload };
                pool.query.mockResolvedValueOnce({ rows: [mockUpdatedTemplate] });

                const res = await request(app)
                    .put('/api/settings/email/templates/1')
                    .send(updatePayload);

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual(mockUpdatedTemplate);
                
                const queryCall = pool.query.mock.calls[0];
                expect(queryCall[1]).toEqual(['New Subject', '<p>New Body</p>', '1']);
            });

            it('should return 404 if template not found', async () => {
                pool.query.mockResolvedValueOnce({ rows: [] });

                const res = await request(app)
                    .put('/api/settings/email/templates/999')
                    .send({ subject: 'Test', body: 'Test' });

                expect(res.statusCode).toBe(404);
            });
        });

        describe('POST /api/settings/email/templates/:id/test', () => {
            it('should send a test email with replaced variables', async () => {
                const mockTemplate = {
                    id: 1,
                    name: 'Welcome Email',
                    subject: 'Welcome {{name}}',
                    body: '<p>Hello {{name}}, your code is {{otp}}</p>'
                };

                // Mock finding the template
                pool.query.mockResolvedValueOnce({ rows: [mockTemplate] });

                const testPayload = {
                    email: 'recipient@test.com',
                    name: 'Test Recipient',
                    variables: { otp: '999999' }
                };

                const res = await request(app)
                    .post('/api/settings/email/templates/1/test')
                    .send(testPayload);

                expect(res.statusCode).toBe(200);
                expect(res.body.message).toContain('Test email sent successfully');

                // Verify DB was called to get template
                expect(pool.query).toHaveBeenCalledWith(
                    expect.stringContaining('SELECT * FROM email_templates WHERE id = $1'),
                    ['1']
                );

                // Verify Email Service Logic (via Nodemailer usage)
                // Since we mock nodemailer, we check if sendMail was called
                // We need to access the mock instance returned by createTransport
                const transporterMock = require('nodemailer').createTransport();
                expect(transporterMock.sendMail).toHaveBeenCalled();
                
                const sendMailArgs = transporterMock.sendMail.mock.calls[0][0]; // First call, first arg (mailOptions)
                expect(sendMailArgs.to).toBe('recipient@test.com');
                // Verify variable replacement happen
                expect(sendMailArgs.subject).toContain('Welcome Test Recipient');
                expect(sendMailArgs.html).toContain('Hello Test Recipient');
                expect(sendMailArgs.html).toContain('your code is 999999');
            });

            it('should return 400 if recipient email missing', async () => {
                const res = await request(app)
                    .post('/api/settings/email/templates/1/test')
                    .send({ name: 'Bob' }); // No email

                expect(res.statusCode).toBe(400);
            });
        });
    });
});
