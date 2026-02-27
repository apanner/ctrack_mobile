# Backend Connection Verification Guide

## ✅ Confirmed: Mobile App IS Connected

### Same Backend as Web App

**Supabase URL:** `https://zkuubxwhpnvogtoxxxib.supabase.co`
- ✅ Configured in `mobile/app.json` → `extra.supabaseUrl`
- ✅ Same as web app's `VITE_SUPABASE_URL`

**Anon Key:** Configured
- ✅ In `mobile/app.json` → `extra.supabaseAnonKey`
- ✅ Same as web app's `VITE_SUPABASE_ANON_KEY`

### Shared Database Tables

Both web and mobile use the same tables:

1. **`profiles`** - User accounts
   - Same users on both platforms
   - Same roles (artist, manager, admin)
   - Same authentication

2. **`projects`** - Projects
   - Same projects visible on both
   - Same project data

3. **`shots`** - Shots/Tasks
   - Same shots on both platforms
   - Updates sync between web and mobile

### How to Verify Connection

1. **Check Browser Console:**
   - Look for: `✅ Backend connected: {profiles: X, projects: Y, shots: Z}`
   - This confirms data is being fetched

2. **Test Data Sync:**
   - Create a project on web → Should appear on mobile
   - Create a shot on web → Should appear on mobile
   - Update shot status on mobile → Should reflect on web

3. **Check User Account:**
   - Login with same Google account on both
   - Should see same profile, same role
   - Should see same data

### Troubleshooting

If you see "Connection Error":

1. **Check Supabase URL:**
   - Open browser console
   - Look for connection test results
   - Verify URL matches web app

2. **Check RLS Policies:**
   - User must have read access to tables
   - Artists can only see their shots
   - Managers can see all shots

3. **Verify User Profile:**
   - User must exist in `profiles` table
   - Profile must be `is_active = true`
   - Role must be set correctly

### Connection Test

The dashboard automatically tests connection on load. Check console for:
- ✅ Success: Shows data counts
- ❌ Failure: Shows error message

### One Backend = One Source of Truth

✅ **Web and mobile share the same database**
✅ **All accounts are the same**
✅ **All projects are the same**
✅ **All shots are the same**
✅ **Real-time sync between platforms**

