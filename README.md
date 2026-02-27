# CTrack Mobile (ctrack_mobile)

**Path:** `d:/dev/track/ctrack_mobile`

A minimal and effective mobile app for VFX artists to manage shots, view projects, and collaborate.

## Features

- **Dashboard**: View assigned shots with status tracking
- **Projects**: Browse active projects with progress
- **Shot Management**: Update shot status (Not Started → In Progress → Completed)
- **Profile**: View user information and sign out
- **Dark Theme**: Beautiful dark UI optimized for artists

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: React Native StyleSheet API
- **Icons**: Lucide React Native

## Setup

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Physical device with Expo Go app (optional)

### Installation

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   # or
   bun install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the `mobile` directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Or add to `app.json` under `extra`:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "https://your-project-id.supabase.co",
         "supabaseAnonKey": "your-anon-key-here"
       }
     }
   }
   ```

3. **Start development server:**
   ```bash
   npm start
   # or
   bun start
   ```

4. **Run on device/simulator:**
   - **iOS**: Press `i` in terminal or scan QR code with Expo Go
   - **Android**: Press `a` in terminal or scan QR code with Expo Go
   - **Web**: Press `w` in terminal

## Project Structure

```
mobile/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout with providers
│   ├── (auth)/             # Authentication screens
│   │   ├── _layout.tsx
│   │   └── index.tsx       # Login screen with splash
│   ├── (tabs)/             # Tab navigation
│   │   ├── _layout.tsx     # Tab bar configuration
│   │   ├── index.tsx       # Dashboard
│   │   ├── projects.tsx    # Projects list
│   │   ├── chat.tsx        # Chat (placeholder)
│   │   └── profile.tsx     # User profile
│   └── shot/[id].tsx       # Shot detail screen
├── lib/                    # Utilities and API
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Authentication helpers
│   └── api/                # React Query hooks
│       ├── shots.ts        # Shots API
│       ├── projects.ts     # Projects API
│       └── profile.ts      # Profile API
├── constants/              # App constants
│   └── colors.ts          # Color palette
├── types/                  # TypeScript types
│   └── index.ts           # Type definitions
└── package.json
```

## Authentication

The app uses Supabase Auth with Google OAuth. Users must be created by an admin in the web app first. Only users with existing profiles can sign in.

## API Integration

The app connects to your Supabase backend and uses the following tables:
- `profiles` - User information
- `projects` - Project data
- `shots` - Shot/task data (treated as tasks for artists)

## Development

### Adding New Screens

1. Create a new file in `app/` directory
2. Use Expo Router's file-based routing
3. Add navigation in `_layout.tsx` if needed

### Styling

- Use the `colors` constant from `constants/colors.ts`
- Follow the dark theme design system
- Use StyleSheet API for all styles

### API Hooks

Create new hooks in `lib/api/` using React Query:
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export function useMyData() {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      return data;
    },
  });
}
```

## Building for Production

### Building for Appetize.io

Appetize.io allows you to test your mobile app in a browser without physical devices. The build script creates date-stamped build folders with Android APK and iOS .app bundles ready for upload.

#### Prerequisites

- **EAS CLI**: Install globally with `npm install -g eas-cli`
- **Android SDK**: Required for Android builds (via Android Studio)
- **macOS + Xcode**: Required for iOS builds (iOS builds skip automatically on Windows)

#### Build Commands

```bash
# Build Android APK only
npm run build:android

# Build iOS .app bundle only (macOS only)
npm run build:ios

# Build both platforms
npm run build:appetize
# or
npm run build:all
```

#### Build Output Structure

Builds are organized by timestamp in the `builds/` directory:

```
builds/
└── 2025-11-20_14-32-15/
    ├── android/
    │   └── CineTrack-android.apk
    └── ios/
        └── CineTrack-ios.app
```

#### Uploading to Appetize

1. Go to [https://appetize.io/upload](https://appetize.io/upload)
2. Drag and drop your `.apk` (Android) or `.app` (iOS) file
3. Fill in app metadata (name, platform, notes)
4. Click "Upload" - Appetize will process and provide a test URL
5. Share the URL or embed in your documentation

#### Build Profiles

The build script uses EAS Build profiles defined in `eas.json`:
- **appetize-android**: Generates APK for Android emulator
- **appetize-ios**: Generates simulator .app bundle for iOS

### Standard Production Builds

#### iOS
```bash
eas build --platform ios
```

#### Android
```bash
eas build --platform android
```

## Notes

- The app is optimized for artists (minimal UI, focused on tasks)
- Chat functionality is a placeholder for future implementation
- Shot status updates are real-time via Supabase
- All data is fetched from your Supabase backend

## Troubleshooting

### Environment Variables Not Working
- Make sure variables are prefixed with `EXPO_PUBLIC_`
- Restart the Expo dev server after adding variables
- Check `app.json` extra config as alternative

### Authentication Issues
- Ensure user exists in `profiles` table
- Check Supabase Auth settings
- Verify OAuth redirect URLs are configured

### Build Errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo SDK version compatibility

## License

Part of the CineTrack project.

