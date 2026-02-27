# Quick Start: Building for Appetize

## One-Time Setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo (if not already)
eas login
```

## Build Commands

```bash
# Build Android only
npm run build:android

# Build iOS only (macOS only)
npm run build:ios

# Build both platforms
npm run build:appetize
```

## Build Output

Builds are saved in date-stamped folders:
```
builds/2025-11-20_18-33-09/
├── android/
│   └── CineTrack-android.apk
└── ios/
    └── CineTrack-ios.app
```

## Upload to Appetize

1. Go to https://appetize.io/upload
2. Drag your `.apk` (Android) or `.app` (iOS) file
3. Wait for processing
4. Test in browser!

## Troubleshooting

**EAS not found?**
```bash
npm install -g eas-cli
```

**Build fails?**
- Check you're logged in: `eas whoami`
- Verify Android SDK is installed (for Android builds)
- iOS builds require macOS + Xcode

**Can't find build output?**
- Check `.eas-build/` directory in project root
- Check console output for exact file location
- Builds may be in `android/app/build/outputs/apk/release/` for Android

## Next Steps

See `BUILD-APPETIZE.md` for detailed documentation.

