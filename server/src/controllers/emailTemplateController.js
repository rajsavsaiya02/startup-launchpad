const { pool } = require('../database');
const emailService = require('../services/emailService');


exports.getAllTemplates = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM email_templates ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get Templates Error:', err);
        res.status(500).json({ message: 'Server error fetching templates' });
    }
};

exports.getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM email_templates WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get Template Error:', err);
        res.status(500).json({ message: 'Server error fetching template' });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, body } = req.body;

        const result = await pool.query(
            `UPDATE email_templates 
             SET subject = $1, body = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [subject, body, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update Template Error:', err);
        res.status(500).json({ message: 'Server error updating template' });
    }
};

exports.createTemplate = async (req, res) => {
    try {
        const { name, type, subject, body, description, variables } = req.body;

        // Basic validation
        if (!name || !type || !subject || !body) {
            return res.status(400).json({ message: 'Name, Type, Subject, and Body are required' });
        }

        // Check if type exists
        const existing = await pool.query('SELECT id FROM email_templates WHERE type = $1', [type]);
        if (existing.rows.length > 0) {
             return res.status(409).json({ message: 'A template with this type code already exists.' });
        }

        const result = await pool.query(
            `INSERT INTO email_templates (name, type, subject, body, description, variables) 
             VALUES ($1, $2, $3, $4, $5, $6::jsonb) 
             RETURNING *`,
            [name, type, subject, body, description || '', JSON.stringify(variables || [])]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create Template Error:', err);
        res.status(500).json({ message: 'Server error creating template' });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM email_templates WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error('Delete Template Error:', err);
        res.status(500).json({ message: 'Server error deleting template' });
    }
};

exports.sendTestEmail = async (req, res) => {
    try {
        const { id } = req.params; // Template ID
        const { email, name, variables } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Recipient email is required' });
        }

        // 1. Fetch Template
        const tmplResult = await pool.query('SELECT * FROM email_templates WHERE id = $1', [id]);
        if (tmplResult.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }
        const template = tmplResult.rows[0];

        // 2. Prepare Variables
        // Combine provided variables with default test data
        // We'll use the 'variables' from request payload if specific test data is needed,
        // otherwise we fallback to some sensible defaults for "Name" and "OTP/Link".
        const testVariables = {
            name: name || 'Test User',
            platform_name: 'Startup LaunchPad', // Should ideally come from settings, but emailService might handle it or we pass it
            otp: '123456',
            link: 'http://localhost:5173/verify-example',
            ...variables // Allow overriding
        };

        // 3. Compile Content (Simple Replacement)
        // Note: In a real app, use a library like Handlebars or EJS. 
        // Here we'll do simple string replacement for {{key}}.
        let compiledSubject = template.subject;
        let compiledBody = template.body;

        Object.keys(testVariables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiledSubject = compiledSubject.replace(regex, testVariables[key]);
            compiledBody = compiledBody.replace(regex, testVariables[key]);
        });
        
        // Also cleanup any remaining unreplaced tags if you want, or leave them.
        
        // 4. Send Email
        // We reuse the basic sendEmail logic from emailService.
        // But emailService functions (sendVerificationEmail etc) are specific.
        // We need a generic 'sendRawEmail' or we just reuse the transporter logic here?
        // Better: Add a 'sendRawEmail' to emailService or expose transporter. 
        // Checking emailService.js, it doesn't expose a generic send. 
        // I should probably add one to emailService.js or standardise it.
        // For now, I'll rely on emailService to have a 'sendEmail' generic function if it exists,
        // OR I will interpret 'emailService' exports.
        // Looking at emailService.js view: it only exports specific functions like sendVerificationEmail.
        // I SHOULD ADD a generic `sendEmail` to emailService.js first.
        
        // Let's assume I will add `sendEmail` to emailService.js in the next step.
        await emailService.sendEmail({
            to: email,
            subject: compiledSubject,
            html: compiledBody
        });

        res.json({ message: 'Test email sent successfully' });

    } catch (err) {
        console.error('Send Test Email Error:', err);
        res.status(500).json({ message: 'Failed to send test email: ' + err.message });
    }
};
