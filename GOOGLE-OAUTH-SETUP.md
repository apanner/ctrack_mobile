# ✅ Correct Google OAuth Setup for Mobile App

## 🎯 Important Discovery

**You DON'T need to add `cinetrack://auth/callback` to Google Cloud Console!**

Google OAuth for "Web application" type **only accepts HTTP/HTTPS URLs**, not deep links like `cinetrack://`.

**You also DON'T need to create a separate mobile OAuth client!** The existing web client works perfectly for both web and mobile.

## ✅ Correct Setup

### For Web Application OAuth Client (What You Have)

**Keep these URIs only:**
```
✅ https://zkuubxwhpnvogtoxxxib.supabase.co/auth/v1/callback
✅ http://localhost:8081/auth/callback
✅ http://localhost:19006/auth/callback
```

**Remove this (it won't work anyway):**
```
❌ cinetrack://auth/callback
```

### Why This Works

1. **Google OAuth Flow:**
   - User clicks "Sign in with Google"
   - App redirects to Supabase OAuth
   - Supabase redirects to Google
   - Google redirects to **Supabase callback** (the HTTPS URL)
   - Supabase processes OAuth

2. **Supabase to App Redirect:**
   - Supabase then redirects to your app using the `redirectTo` parameter
   - For web: Uses `http://localhost:8081/auth/callback` ✅
   - For native: Uses `cinetrack://auth/callback` (handled by Supabase, not Google) ✅

**The deep link is handled by Supabase, NOT by Google!**

---

## 🔧 Updated Configuration

### In Google Cloud Console:

**Authorized redirect URIs** (keep only these):
```
https://zkuubxwhpnvogtoxxxib.supabase.co/auth/v1/callback
http://localhost:8081/auth/callback
http://localhost:19006/auth/callback
```

**Remove:**
- `cinetrack://auth/callback` (not needed, won't work anyway)

### In Your App Code:

The `redirectTo` parameter in `mobile/lib/auth.ts` is correct:
- **Web**: `http://localhost:8081/auth/callback` ✅
- **Native**: `cinetrack://auth/callback` ✅

This tells Supabase where to redirect AFTER it processes the OAuth callback from Google.

---

## 🎯 How It Actually Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google" in mobile app      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. App calls supabase.auth.signInWithOAuth()           │
│    redirectTo: "cinetrack://auth/callback" (native)     │
│    OR "http://localhost:8081/auth/callback" (web)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Supabase redirects to Google OAuth                    │
│    Google sees: Supabase callback URL                   │
│    (https://zkuubxwhpnvogtoxxxib.supabase.co/...)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User signs in with Google                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Google redirects to Supabase callback                │
│    (This URL is registered in Google Cloud Console)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Supabase processes OAuth and gets user info          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Supabase redirects to YOUR app using redirectTo     │
│    - Web: http://localhost:8081/auth/callback          │
│    - Native: cinetrack://auth/callback (deep link)     │
│    (This is handled by Supabase, NOT Google!)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Your app receives callback and completes login ✅   │
└─────────────────────────────────────────────────────────┘
```

**Key Point:** Google only needs the Supabase callback URL. The deep link is used by Supabase to redirect back to your app.

---

## ✅ Action Items

1. **Remove** `cinetrack://auth/callback` from Google Cloud Console
2. **Keep** only the 3 HTTP/HTTPS URLs
3. **Save** the configuration
4. **Test** the login flow

---

## 🧪 Testing

### For Web (Browser):
1. Run: `npx expo start --web`
2. Click "Sign in with Google"
3. Should work! ✅

### For Native Mobile:
1. The deep link `cinetrack://auth/callback` is handled automatically by Supabase
2. No need to register it in Google Cloud Console
3. Just make sure your `app.json` has `"scheme": "cinetrack"` ✅

---

## 📝 Summary

- ✅ **Web OAuth client is correct** - no need to create a new one
- ✅ **Remove deep link from Google Cloud Console** - it's not needed there
- ✅ **Keep HTTP/HTTPS URLs only** - these are what Google needs
- ✅ **Deep link works automatically** - Supabase handles it

**You're all set! Just remove the deep link URI from Google Cloud Console and you're good to go!** 🎉

