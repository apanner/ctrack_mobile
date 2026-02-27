# Building for Appetize.io

This guide explains how to build CineTrack Mobile for Appetize.io, a cloud-based mobile app testing platform that lets you run your app in a browser.

## Quick Start

```bash
# Install EAS CLI (one-time)
npm install -g eas-cli

# Build for Appetize
npm run build:appetize
```

## Prerequisites

### Required
- **Node.js 18+** and npm
- **EAS CLI**: `npm install -g eas-cli`
- **Expo Account**: Sign up at [expo.dev](https://expo.dev) (free)

### Platform-Specific
- **Android**: Android Studio with Android SDK installed
- **iOS**: macOS with Xcode installed (iOS builds automatically skip on Windows)

## Build Commands

### Build Android Only
```bash
npm run build:android
```

### Build iOS Only (macOS only)
```bash
npm run build:ios
```

### Build Both Platforms
```bash
npm run build:appetize
```

## Build Process

1. **Script Execution**: The build script (`scripts/build-appetize.js`) runs
2. **Timestamp Creation**: Creates a date-stamped folder: `builds/YYYY-MM-DD_HH-MM-SS/`
3. **Platform Builds**: For each platform:
   - Creates platform subdirectory (`android/` or `ios/`)
   - Runs EAS Build with the `appetize-*` profile
   - Outputs APK (Android) or .app bundle (iOS)
4. **Summary**: Displays build locations and next steps

## Build Output

After a successful build, you'll find:

```
builds/
└── 2025-11-20_14-32-15/
    ├── android/
    │   └── CineTrack-android.apk    ← Upload this to Appetize
    └── ios/
        └── CineTrack-ios.app        ← Upload this to Appetize (zip first)
```

## Uploading to Appetize

### Method 1: Web Upload (Recommended)

1. Navigate to [https://appetize.io/upload](https://appetize.io/upload)
2. Drag and drop your build file:
   - **Android**: `.apk` file from `builds/*/android/`
   - **iOS**: `.app` bundle (zip it first) from `builds/*/ios/`
3. Fill in metadata:
   - **App Name**: CineTrack Mobile
   - **Platform**: Android or iOS
   - **Notes**: Optional build notes
4. Click "Upload"
5. Wait for processing (usually 1-2 minutes)
6. Test your app in the browser!

### Method 2: REST API

You can automate uploads using Appetize's REST API. See their [documentation](https://docs.appetize.io/platform/app-management/uploading-apps).

## Build Profiles

Build profiles are configured in `eas.json`:

### `appetize-android`
- **Build Type**: APK (required for Appetize)
- **Distribution**: Internal
- **Gradle Command**: `:app:assembleRelease`

### `appetize-ios`
- **Simulator**: `true` (generates .app bundle)
- **Build Configuration**: Release
- **Distribution**: Internal

## Troubleshooting

### EAS CLI Not Found
```bash
npm install -g eas-cli
```

### Android Build Fails
- Ensure Android Studio is installed
- Set `ANDROID_HOME` environment variable
- Run `npx expo-doctor` to check setup

### iOS Build Fails (macOS)
- Ensure Xcode is installed and updated
- Run `sudo xcode-select --switch /Applications/Xcode.app`
- Accept Xcode license: `sudo xcodebuild -license accept`

### Build Takes Too Long
- First build downloads dependencies (can take 10-15 minutes)
- Subsequent builds are faster (2-5 minutes)
- Use `--local` flag for faster local builds (requires local setup)

### Windows Users
- iOS builds automatically skip on Windows
- Only Android builds will run
- For iOS, use a macOS machine or CI/CD service

## CI/CD Integration

You can integrate Appetize uploads into your CI/CD pipeline:

### GitHub Actions Example
```yaml
- name: Build and Upload to Appetize
  run: |
    npm run build:appetize
    # Upload using Appetize API
```

See [Appetize CI/CD docs](https://docs.appetize.io/platform/app-management/uploading-apps#with-cicd-and-third-party-integrations) for more examples.

## Best Practices

1. **Version Your Builds**: Include version numbers in build notes
2. **Test Before Upload**: Verify builds work locally first
3. **Clean Old Builds**: Periodically clean `builds/` directory
4. **Document Changes**: Add notes about what changed in each build
5. **Automate**: Set up CI/CD for automatic builds on commits

## Next Steps

After uploading to Appetize:
1. Test all major features
2. Share the test URL with stakeholders
3. Embed in documentation or demos
4. Use for QA testing before production releases

## Support

- **Appetize Docs**: [https://docs.appetize.io](https://docs.appetize.io)
- **EAS Build Docs**: [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **Expo Forums**: [https://forums.expo.dev](https://forums.expo.dev)

