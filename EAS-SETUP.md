# EAS Setup Instructions

Before running builds, you need to initialize EAS for your project.

## One-Time Setup

### Step 1: Initialize EAS Project

Run this command in your terminal (it will ask interactive questions):

```bash
cd mobile
npx eas-cli init
```

**What it will ask:**
- "Would you like to create a project for @apanner/cinetrack-mobile?" → **Yes**
- It will create a project on Expo's servers and link it to your local project

### Step 2: Verify Setup

Check that your project is linked:

```bash
npx eas-cli whoami
npx eas-cli project:info
```

### Step 3: Run Build

Now you can run the build:

```bash
npm run build:appetize
```

## For Windows Users

Since you're on Windows, the build will use **EAS cloud builds** (not local). This means:

1. ✅ Build runs on Expo's servers (no local Android SDK needed)
2. ⏳ Build takes 10-15 minutes
3. 📥 You'll need to download the APK when complete

### After Build Completes

1. **Check build status:**
   ```bash
   npm run build:status
   ```

2. **Download the APK:**
   ```bash
   npm run build:download android
   ```
   
   Or manually:
   ```bash
   npx eas-cli build:download --platform android --latest
   ```

3. **Find your APK:**
   - Check `builds/latest/android/` directory
   - Or the location specified in the download output

4. **Upload to Appetize:**
   - Go to https://appetize.io/upload
   - Drag and drop your `.apk` file

## Troubleshooting

### "EAS project not configured"
→ Run `npx eas-cli init` first (see Step 1 above)

### "Not logged in"
→ Run `npx eas-cli login`

### Build takes too long
→ Cloud builds typically take 10-15 minutes. Check status with `npm run build:status`

### Can't find downloaded APK
→ Run `npm run build:download android` to download the latest build

