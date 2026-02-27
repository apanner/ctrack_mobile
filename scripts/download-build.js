#!/usr/bin/env node

/**
 * Helper script to download the latest EAS build
 * Usage: node scripts/download-build.js [android|ios]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'android';
const buildDir = path.join(__dirname, '..', 'builds', 'latest');

if (!['android', 'ios'].includes(platform)) {
  console.error('Invalid platform. Use "android" or "ios"');
  process.exit(1);
}

// Create latest directory
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const platformDir = path.join(buildDir, platform);
if (!fs.existsSync(platformDir)) {
  fs.mkdirSync(platformDir, { recursive: true });
}

console.log(`📥 Downloading latest ${platform} build...`);

try {
  execSync(`npx eas-cli build:download --platform ${platform} --latest --output ${platformDir}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log(`\n✓ Build downloaded to: ${platformDir}`);
  console.log(`📤 Ready to upload to Appetize.io!`);
} catch (error) {
  console.error(`\n✗ Download failed: ${error.message}`);
  console.log(`\n💡 Try checking build status first:`);
  console.log(`   npx eas-cli build:list --platform ${platform}`);
  process.exit(1);
}

