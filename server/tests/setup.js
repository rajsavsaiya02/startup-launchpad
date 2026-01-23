const { pool } = require('../src/database');

// Mock Database Pool
jest.mock('../src/database', () => {
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(),
        on: jest.fn(),
    };
    return { pool: mPool };
});

beforeEach(() => {
    jest.clearAllMocks();
});

// Mock Environment Variables
process.env.JWT_SECRET = 'test_secret';
process.env.GOOGLE_CLIENT_ID = 'mock_google_id';
process.env.GOOGLE_CLIENT_SECRET = 'mock_google_secret';
process.env.GITHUB_CLIENT_ID = 'mock_github_id';
process.env.GITHUB_CLIENT_SECRET = 'mock_github_secret';
process.env.LINKEDIN_CLIENT_ID = 'mock_linkedin_id';
process.env.LINKEDIN_CLIENT_SECRET = 'mock_linkedin_secret';
process.env.MICROSOFT_CLIENT_ID = 'mock_microsoft_id';
process.env.MICROSOFT_CLIENT_SECRET = 'mock_microsoft_secret';

// Mock uuid to prevent ESM issues
jest.mock('uuid', () => ({
    v4: () => 'mock-uuid-1234'
}));


// Suppress console.log/error during tests unless needed
global.console = {
    ...console,
    // log: jest.fn(), // uncomment to hide logs
    error: jest.fn(),
};
