#!/usr/bin/env node

/**
 * Helper script to check EAS setup status
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEASInstalled() {
  try {
    execSync('npx eas-cli --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkEASConfigured() {
  try {
    const projectDir = path.join(__dirname, '..');
    const appJsonPath = path.join(projectDir, 'app.json');
    
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      const projectId = appJson?.expo?.extra?.eas?.projectId;
      return !!projectId;
    }
    return false;
  } catch (error) {
    return false;
  }
}

function checkLoggedIn() {
  try {
    const result = execSync('npx eas-cli whoami', { encoding: 'utf8', stdio: 'pipe' });
    return !result.includes('Not logged in');
  } catch (error) {
    return false;
  }
}

log('\n🔍 Checking EAS Setup Status...\n', colors.bright);

// Check EAS CLI
if (!checkEASInstalled()) {
  log('✗ EAS CLI not installed', colors.red);
  log('   Run: npm install -g eas-cli', colors.blue);
  process.exit(1);
} else {
  log('✓ EAS CLI installed', colors.green);
}

// Check login
if (!checkLoggedIn()) {
  log('✗ Not logged in to Expo', colors.red);
  log('   Run: npx eas-cli login', colors.blue);
  process.exit(1);
} else {
  log('✓ Logged in to Expo', colors.green);
}

// Check project configuration
if (!checkEASConfigured()) {
  log('✗ EAS project not configured', colors.red);
  log('\n📋 Next step:', colors.bright);
  log('   Run: npx eas-cli init', colors.blue);
  log('   When prompted, type "y" to create the project', colors.yellow);
  log('\n');
  process.exit(1);
} else {
  log('✓ EAS project configured', colors.green);
  log('\n✅ All set! You can now run:', colors.bright);
  log('   npm run build:appetize', colors.cyan);
  log('\n');
}

