# Web Build Instructions

If the web version isn't loading, try these steps:

## Option 1: Use Expo Web (Recommended)
```bash
cd mobile
npx expo start --web
```

Then open: http://localhost:8081

## Option 2: Build Static Web Version
```bash
cd mobile
npx expo export:web
npx serve web-build
```

## Option 3: Use Development Mode
```bash
cd mobile
EXPO_USE_WEBPACK=1 npx expo start --web
```

## Troubleshooting

1. **Clear all caches:**
   ```bash
   npx expo start --clear --web
   ```

2. **Check if webpack is working:**
   ```bash
   npx expo customize:web
   ```

3. **Verify dependencies:**
   ```bash
   npm install react-native-web react-dom @expo/webpack-config
   ```

## Access URLs

- Development: http://localhost:8081
- Webpack: http://localhost:19006
- Static build: http://localhost:3000 (after serve)

