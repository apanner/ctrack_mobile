# CineTrack Mobile - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment:**
   
   Option A: Create `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Option B: Add to `app.json`:
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

3. **Start the app:**
   ```bash
   npm start
   ```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Google OAuth Setup (Optional)

If you want to use Google OAuth:

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your OAuth credentials
4. Add redirect URL: `cinetrack://auth/callback`

## Testing

- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal  
- **Physical Device**: Scan QR code with Expo Go app
- **Web**: Press `w` in terminal

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists or `app.json` has `extra` config
- Restart Expo dev server after adding variables

### Authentication not working
- Verify user exists in `profiles` table
- Check Supabase Auth settings
- Ensure OAuth redirect URLs match

### Build errors
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall
- Check Expo SDK version

## Next Steps

- Review the main [README.md](./README.md) for full documentation
- Check `app/` directory for screen implementations
- See `lib/api/` for API integration examples

