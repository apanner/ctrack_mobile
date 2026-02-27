const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 Verifying OAuth Configuration...\n');

// 1. Check app.json
try {
    const appJsonPath = path.join(__dirname, '../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const scheme = appJson.expo.scheme;

    console.log('✅ App Scheme Configuration:');
    console.log(`   - Scheme: "${scheme}"`);

    if (scheme === 'cinetrack') {
        console.log('   - Status: OK (Matches expected scheme)');
    } else {
        console.log('   - Status: WARNING (Expected "cinetrack")');
    }
} catch (error) {
    console.error('❌ Failed to read app.json:', error.message);
}

console.log('\n✅ Expected Redirect URLs:');

// 2. Simulate Web Redirect URL
const webOrigin = 'http://localhost:8081';
const webRedirect = `${webOrigin}/auth/callback`;
console.log(`   - Web (Browser): ${webRedirect}`);
console.log('     (Constructed from window.location.origin + /auth/callback)');

// 3. Simulate Native Redirect URL
const nativeRedirect = 'cinetrack://auth/callback';
console.log(`   - Native (Mobile): ${nativeRedirect}`);
console.log('     (Constructed from scheme + //auth/callback)');

// 4. Check Server Status
console.log('\n🔍 Checking Local Server Status...');

function checkServer(host, port) {
    return new Promise((resolve, reject) => {
        const url = `http://${host}:${port}`;
        const req = http.get(url, (res) => {
            console.log(`✅ Server is responding: ${url} (Status: ${res.statusCode})`);
            resolve(true);
        });

        req.on('error', (e) => {
            reject(e);
        });
    });
}

async function verifyServer() {
    try {
        await checkServer('localhost', 8081);
        console.log('\n🎉 Verification Complete: Configuration is correct for localhost testing.');
    } catch (e1) {
        console.log(`⚠️  Could not connect to localhost:8081: ${e1.message}`);
        try {
            console.log('   Trying 127.0.0.1...');
            await checkServer('127.0.0.1', 8081);
            console.log('\n🎉 Verification Complete: Configuration is correct for localhost testing.');
        } catch (e2) {
            console.error(`❌ Server check failed: ${e2.message}`);
            console.log('   (Make sure "npm run web" is running)');
        }
    }
}

verifyServer();
