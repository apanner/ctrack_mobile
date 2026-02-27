# ✅ Google OAuth Mobile Setup - Complete Guide

## 🎯 Problem Solved

Your mobile app needs additional redirect URIs registered in Google Cloud Console to work with Google OAuth.

---

## 📋 What You Need to Do (5 Minutes)

### Quick Steps:

1. **Open Google Cloud Console**: https://console.cloud.google.com/
2. **Go to**: APIs & Services → Credentials
3. **Find**: OAuth 2.0 Client ID (`755837845083-4u9vu918d3uloldpghvioqh8ill63fai`)
4. **Click**: Edit (pencil icon)
5. **Add these 3 URIs** to "Authorized redirect URIs":
   - `http://localhost:8081/auth/callback`
   - `http://localhost:19006/auth/callback`
   - `cinetrack://auth/callback`
6. **Click**: Save
7. **Wait**: 2-3 minutes

---

## 🔍 Why This Is Needed

### Current Setup (Web Only):
- ✅ Google OAuth works for web app
- ❌ Google OAuth fails for mobile app

### The Issue:
Google OAuth requires **all redirect URIs** to be registered in Google Cloud Console. Your mobile app uses different URIs than the web app, so they need to be added.

### How OAuth Works:

```
1. User clicks "Sign in with Google" in mobile app
   ↓
2. App redirects to Supabase OAuth
   ↓
3. Supabase redirects to Google OAuth
   ↓
4. User signs in with Google
   ↓
5. Google redirects to Supabase callback
   (https://zkuubxwhpnvogtoxxxib.supabase.co/auth/v1/callback)
   ↓
6. Supabase processes OAuth
   ↓
7. Supabase redirects to YOUR app callback
   (http://localhost:8081/auth/callback - for web)
   (cinetrack://auth/callback - for native)
   ↓
8. Your app handles callback and completes login ✅
```

**Step 7 requires the redirect URI to be registered in Google Cloud Console!**

---

## 📝 All Redirect URIs You Need

### In Google Cloud Console, add these:

```
https://zkuubxwhpnvogtoxxxib.supabase.co/auth/v1/callback  (already added ✅)
http://localhost:8081/auth/callback                        (ADD THIS ➕)
http://localhost:19006/auth/callback                       (ADD THIS ➕)
cinetrack://auth/callback                                  (ADD THIS ➕)
```

### What Each URI Does:

1. **`https://zkuubxwhpnvogtoxxxib.supabase.co/auth/v1/callback`**
   - Where Google redirects after OAuth
   - Already configured ✅

2. **`http://localhost:8081/auth/callback`**
   - Where Supabase redirects back to your app (web browser)
   - Used when running `npx expo start --web`

3. **`http://localhost:19006/auth/callback`**
   - Backup port for Expo web
   - Used if port 8081 is busy

4. **`cinetrack://auth/callback`**
   - Deep link for native mobile apps
   - Defined in `app.json` as `"scheme": "cinetrack"`
   - Used on actual iOS/Android devices

---

## ✅ After Setup

Once you've added the URIs and waited 2-3 minutes:

1. **Run your app**: `npx expo start --web`
2. **Click**: "Sign in with Google"
3. **Complete**: Google sign-in
4. **Result**: Should redirect back to app successfully! ✅

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: URI not registered or typo
- **Fix**: Double-check all URIs are added exactly as shown

### Error: "OAuth error" or blank screen
- **Cause**: Changes haven't propagated
- **Fix**: Wait 2-3 more minutes and try again

### Still not working?
1. Check browser console (F12) for errors
2. Verify all 4 URIs are in Google Cloud Console
3. Make sure you clicked **Save**
4. Clear browser cache
5. Try incognito/private window

---

## 📚 Related Files

- **Setup Guide**: `mobile/ADD-MOBILE-TO-GOOGLE-OAUTH.md` (detailed steps)
- **Quick Fix**: `mobile/GOOGLE-OAUTH-MOBILE-FIX.md` (quick reference)
- **Auth Code**: `mobile/lib/auth.ts` (handles OAuth flow)

---

## 🎉 Summary

**What changed:**
- ✅ Updated `mobile/lib/auth.ts` to use correct redirect URLs
- ✅ Added logging for debugging
- ✅ Created setup guides

**What you need to do:**
- ➕ Add 3 redirect URIs to Google Cloud Console
- ⏱️ Wait 2-3 minutes
- 🧪 Test login

**Result:**
- ✅ Google OAuth will work for both web and mobile!

---

**Follow the steps in `ADD-MOBILE-TO-GOOGLE-OAUTH.md` to complete the setup!** 🚀

