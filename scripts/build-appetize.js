#!/usr/bin/env node

/**
 * Build script for Appetize.io deployment
 * Creates date-stamped build folders and generates Android APK / iOS .app bundles
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get command line arguments
const platforms = process.argv.slice(2);
const requestedPlatforms = platforms.length > 0 ? platforms : ['android', 'ios'];

// Determine timestamp for build folder
const now = new Date();
const timestamp = now.toISOString().replace(/:/g, '-').split('.')[0].replace('T', '_');
const buildDir = path.join(__dirname, '..', 'builds', timestamp);

// Colors for console output
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

function checkPlatform(platform) {
  if (platform === 'ios' && os.platform() !== 'darwin') {
    log(`⚠️  iOS builds require macOS. Skipping iOS build.`, colors.yellow);
    return false;
  }
  return true;
}

function createBuildDirectory(platform) {
  const platformDir = path.join(buildDir, platform);
  if (!fs.existsSync(platformDir)) {
    fs.mkdirSync(platformDir, { recursive: true });
    log(`✓ Created build directory: ${platformDir}`, colors.green);
  }
  return platformDir;
}

function buildAndroid(outputDir) {
  log('\n📱 Building Android APK for Appetize...', colors.cyan);
  
  try {
    const projectDir = path.join(__dirname, '..');
    const originalCwd = process.cwd();
    process.chdir(projectDir);
    
    // Check if we're on Windows - use cloud build instead of local
    const isWindows = os.platform() === 'win32';
    const useCloudBuild = isWindows;
    
    let buildCommand;
    if (useCloudBuild) {
      log('ℹ️  Windows detected - using EAS cloud build (local builds require macOS/Linux)', colors.yellow);
      // First, try to ensure credentials exist
      log('🔐 Checking Android credentials...', colors.blue);
      try {
        execSync(`npx eas-cli credentials`, {
          stdio: 'pipe',
          cwd: projectDir,
          env: { ...process.env, EXPO_NO_DOTENV: '1' }
        });
      } catch (e) {
        // Credentials check might fail, that's okay
      }
      buildCommand = `npx eas-cli build --platform android --profile appetize-android --non-interactive`;
    } else {
      buildCommand = `npx eas-cli build --platform android --profile appetize-android --local --non-interactive`;
    }
    
    log(`Running: ${buildCommand}`, colors.blue);
    
    try {
      execSync(buildCommand, {
        stdio: 'inherit',
        env: { ...process.env, EXPO_NO_DOTENV: '1' }
      });
    } finally {
      process.chdir(originalCwd);
    }
    
    if (useCloudBuild) {
      log('✓ Android cloud build started successfully!', colors.green);
      log('⏳ Build is running on EAS servers...', colors.blue);
      log('📥 Once complete, download the APK from:', colors.blue);
      log('   https://expo.dev/accounts/apanner/projects/cinetrack-mobile/builds', colors.cyan);
      log('💡 Tip: Run "eas build:list" to check build status', colors.yellow);
      log('💡 Tip: Run "eas build:download" to download the latest build', colors.yellow);
      
      // For cloud builds, we can't automatically copy the file
      // But we can provide instructions
      log('\n📋 Next steps:', colors.bright);
      log('1. Wait for build to complete (check status with: eas build:list)', colors.blue);
      log('2. Download the APK: eas build:download --platform android --latest', colors.blue);
      log('3. Move the downloaded APK to:', colors.blue);
      log(`   ${outputDir}`, colors.cyan);
      
      return null; // Cloud builds need manual download
    }
    
    log('✓ Android build completed successfully!', colors.green);
    log('🔍 Searching for build artifact...', colors.blue);
    
    // EAS local builds typically output to: .eas-build/ or find in common locations
    const possibleLocations = [
      path.join(projectDir, '.eas-build'),
      path.join(projectDir, 'android', 'app', 'build', 'outputs', 'apk', 'release'),
      path.join(os.homedir(), '.expo', 'android-builds'),
    ];
    
    let apkPath = null;
    for (const location of possibleLocations) {
      if (fs.existsSync(location)) {
        const findApk = (dir) => {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              const found = findApk(fullPath);
              if (found) return found;
            } else if (file.name.endsWith('.apk')) {
              return fullPath;
            }
          }
          return null;
        };
        
        apkPath = findApk(location);
        if (apkPath) break;
      }
    }
    
    if (!apkPath) {
      // Try to find any .apk in the project directory
      const findInDir = (dir, maxDepth = 3, currentDepth = 0) => {
        if (currentDepth > maxDepth) return null;
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
              const found = findInDir(fullPath, maxDepth, currentDepth + 1);
              if (found) return found;
            } else if (file.name.endsWith('.apk')) {
              return fullPath;
            }
          }
        } catch (e) {
          // Ignore permission errors
        }
        return null;
      };
      
      apkPath = findInDir(projectDir);
    }
    
    if (apkPath && fs.existsSync(apkPath)) {
      // Copy to our output directory
      const apkName = path.basename(apkPath);
      const destPath = path.join(outputDir, apkName);
      fs.copyFileSync(apkPath, destPath);
      log(`✓ APK copied to: ${destPath}`, colors.green);
      return destPath;
    } else {
      log('⚠️  Could not automatically find APK. Please check EAS build output.', colors.yellow);
      log(`   Expected location: ${outputDir}`, colors.blue);
      return null;
    }
  } catch (error) {
    log(`✗ Android build failed: ${error.message}`, colors.red);
    throw error;
  }
}

function buildIOS(outputDir) {
  log('\n🍎 Building iOS .app bundle for Appetize...', colors.cyan);
  
  if (!checkPlatform('ios')) {
    return null;
  }
  
  try {
    const buildCommand = `npx eas-cli build --platform ios --profile appetize-ios --local --non-interactive`;
    
    log(`Running: ${buildCommand}`, colors.blue);
    
    const projectDir = path.join(__dirname, '..');
    const originalCwd = process.cwd();
    process.chdir(projectDir);
    
    try {
      execSync(buildCommand, {
        stdio: 'inherit',
        env: { ...process.env, EXPO_NO_DOTENV: '1' }
      });
    } finally {
      process.chdir(originalCwd);
    }
    
    log('✓ iOS build completed successfully!', colors.green);
    log('🔍 Searching for build artifact...', colors.blue);
    
    // EAS local builds typically output to: .eas-build/ or iOS build directories
    const possibleLocations = [
      path.join(projectDir, '.eas-build'),
      path.join(projectDir, 'ios', 'build'),
      path.join(os.homedir(), '.expo', 'ios-builds'),
    ];
    
    let appPath = null;
    for (const location of possibleLocations) {
      if (fs.existsSync(location)) {
        const findApp = (dir) => {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              const found = findApp(fullPath);
              if (found) return found;
            } else if (file.name.endsWith('.app') || file.name.endsWith('.tar.gz') || file.name.endsWith('.zip')) {
              return fullPath;
            }
          }
          return null;
        };
        
        appPath = findApp(location);
        if (appPath) break;
      }
    }
    
    if (!appPath) {
      // Try to find any .app or archive in the project directory
      const findInDir = (dir, maxDepth = 3, currentDepth = 0) => {
        if (currentDepth > maxDepth) return null;
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
              const found = findInDir(fullPath, maxDepth, currentDepth + 1);
              if (found) return found;
            } else if (file.name.endsWith('.app') || file.name.endsWith('.tar.gz') || file.name.endsWith('.zip')) {
              return fullPath;
            }
          }
        } catch (e) {
          // Ignore permission errors
        }
        return null;
      };
      
      appPath = findInDir(projectDir);
    }
    
    if (appPath && fs.existsSync(appPath)) {
      // Copy to our output directory
      const appName = path.basename(appPath);
      const destPath = path.join(outputDir, appName);
      fs.copyFileSync(appPath, destPath);
      log(`✓ iOS bundle copied to: ${destPath}`, colors.green);
      return destPath;
    } else {
      log('⚠️  Could not automatically find iOS bundle. Please check EAS build output.', colors.yellow);
      log(`   Expected location: ${outputDir}`, colors.blue);
      return null;
    }
  } catch (error) {
    log(`✗ iOS build failed: ${error.message}`, colors.red);
    throw error;
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

function main() {
  log('\n🚀 CineTrack Appetize Build Script', colors.bright);
  log(`📅 Build timestamp: ${timestamp}\n`, colors.blue);
  
  // Check if EAS CLI is available
  if (!checkEASInstalled()) {
    log('✗ EAS CLI not found. Installing...', colors.yellow);
    try {
      execSync('npm install -g eas-cli', { stdio: 'inherit' });
    } catch (error) {
      log('✗ Failed to install EAS CLI. Please install manually: npm install -g eas-cli', colors.red);
      process.exit(1);
    }
  }
  
  // Check if EAS project is configured
  if (!checkEASConfigured()) {
    log('\n⚠️  EAS project not configured!', colors.yellow);
    log('\n📋 Setup required (one-time):', colors.bright);
    log('   1. Run: npx eas-cli init', colors.blue);
    log('   2. When prompted, type "y" to create the project', colors.blue);
    log('   3. Then run this build script again', colors.blue);
    log('\n💡 This is required before building. EAS needs to link your project.', colors.cyan);
    log('\n');
    process.exit(1);
  }
  
  // Filter out unsupported platforms
  const validPlatforms = requestedPlatforms.filter(p => {
    if (p === 'ios' && os.platform() !== 'darwin') {
      log(`⚠️  Skipping iOS (requires macOS)`, colors.yellow);
      return false;
    }
    if (p !== 'android' && p !== 'ios') {
      log(`⚠️  Unknown platform: ${p}. Skipping.`, colors.yellow);
      return false;
    }
    return true;
  });
  
  if (validPlatforms.length === 0) {
    log('✗ No valid platforms to build.', colors.red);
    process.exit(1);
  }
  
  // Create main build directory
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  const results = {
    android: null,
    ios: null,
  };
  
  // Build each platform
  for (const platform of validPlatforms) {
    const outputDir = createBuildDirectory(platform);
    
    try {
      if (platform === 'android') {
        results.android = buildAndroid(outputDir);
      } else if (platform === 'ios') {
        results.ios = buildIOS(outputDir);
      }
    } catch (error) {
      log(`\n✗ Build process failed for ${platform}`, colors.red);
      process.exit(1);
    }
  }
  
  // Summary
  log('\n' + '='.repeat(60), colors.cyan);
  log('📦 Build Summary', colors.bright);
  log('='.repeat(60), colors.cyan);
  log(`📁 Build directory: ${buildDir}`, colors.blue);
  
  if (results.android) {
    log(`✓ Android: ${results.android}`, colors.green);
  }
  if (results.ios) {
    log(`✓ iOS: ${results.ios}`, colors.green);
  }
  
  log('\n📤 Next steps:', colors.bright);
  log('1. Go to https://appetize.io/upload', colors.blue);
  log('2. Upload the generated APK/.app files', colors.blue);
  log('3. Test your app in the browser!', colors.blue);
  log('\n');
}

// Run the script
main();

