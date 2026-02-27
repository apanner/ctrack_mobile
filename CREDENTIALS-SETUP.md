# Android Credentials Setup

Before building for Android, you need to set up credentials (keystore). This is a one-time setup.

## Quick Setup

Run this command (it will be interactive):

```bash
npx eas-cli credentials
```

**When prompted:**
1. Select **Android**
2. Select **Set up new credentials** or **Use existing**
3. If setting up new, choose **Generate a new keystore** (EAS will manage it)
4. Follow the prompts

## After Credentials Setup

Once credentials are configured, you can run:

```bash
npm run build:appetize
```

The build will now work in non-interactive mode.

## Alternative: Manual Credential Setup

If you prefer to set up credentials manually:

```bash
# View current credentials
npx eas-cli credentials

# Or set up interactively
npx eas-cli credentials --platform android
```

## Troubleshooting

### "Generating a new Keystore is not supported in --non-interactive mode"
→ You need to set up credentials first. Run `npx eas-cli credentials` and follow the prompts.

### "No credentials found"
→ Run `npx eas-cli credentials` and create new credentials.

### Credentials already exist
→ Great! You can proceed with the build. The error might be a false positive - try running the build again.




