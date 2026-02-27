# Deploy & Git

## Vercel (done ✓)

- **Production:** https://ctrackmobile.vercel.app
- **Build:** Expo web export → `dist/` → Vercel static hosting
- **Env vars:** Set in [Vercel Dashboard](https://vercel.com/apanners-projects/ctrack_mobile/settings/environment-variables):
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Push to GitHub

1. Create a new repo on GitHub: https://github.com/new  
   - Name: `ctrack-mobile` (or any name)

2. Add remote and push:

```bash
cd ctrack_mobile
git remote add origin https://github.com/YOUR_USERNAME/ctrack-mobile.git
git push -u origin main
```

3. Connect to Vercel (optional, for auto-deploy on push):  
   Vercel Dashboard → Import Git Repository → Select your repo
