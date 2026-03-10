const fs = require('fs');
const path = require('path');

// Simulate the path resolution in the controller
// Controller Path: server/src/controllers/systemController.js
// __dirname there would be /Volumes/.../server/src/controllers

// We are running this script from... let's assume we run with `node debug_logs.js` from `server/` root.
// Or we can just simulate the exact logic.

const controllerDir = path.resolve(__dirname, '../controllers'); // Assuming script is in server/src/scripts
const logDir = path.join(controllerDir, '../../logs');
const logPath = path.join(logDir, 'app.log');

console.log('Controller Dir (Simulated):', controllerDir);
console.log('Log Dir:', logDir);
console.log('Log Path:', logPath);

console.log('Checking if log path exists...');
if (fs.existsSync(logPath)) {
    console.log('✅ File exists!');
    const data = fs.readFileSync(logPath, 'utf8');
    const lines = data.trim().split('\n').filter(l => l.length > 0);
    console.log(`✅ File read successfully. Found ${lines.length} lines.`);
    console.log('--- Last 5 lines ---');
    console.log(lines.slice(-5).join('\n'));
} else {
    console.log('❌ File does NOT exist.');
    // Check where we are listing
    console.log('Listing contents of expected log dir:', logDir);
    try {
        console.log(fs.readdirSync(logDir));
    } catch (e) {
        console.log('Failed to read dir:', e.message);
    }
}
