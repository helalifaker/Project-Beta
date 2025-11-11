# Supabase Redirect URL Configuration

## Required Configuration

Your app uses Supabase project: `tgmaotsraszllavsnscg`

### Steps to Configure:

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/tgmaotsraszllavsnscg/auth/url-configuration
   - Or navigate: Dashboard → Authentication → URL Configuration

2. **Set Site URL:**
   - Development: `http://localhost:3000`
   - Production: Your production domain (when deployed)

3. **Add Redirect URLs:**
   Add these exact URLs (one per line):
   ```
   http://localhost:3000/auth/callback
   ```
   
   **Important:** Do NOT use wildcards like `/**` or `/*` - use the exact URL.

4. **Save the configuration**

## What the Code Does

The application code now:
- ✅ Handles hash fragments (`#access_token=...`) from magic links
- ✅ Cleans up wildcard paths (`/**`) if Supabase adds them
- ✅ Creates user profiles automatically after authentication
- ✅ Provides detailed error messages and debugging

## Testing

After configuring:
1. Request a new magic link (old links may be invalid)
2. Click the magic link in your email
3. You should be redirected to `/auth/callback` and then logged in
4. Check browser console (F12) for debug logs if issues persist

## Current Status

- ✅ Profile table created
- ✅ User migrated: `helalifaker@gmail.com` (ADMIN role)
- ✅ Callback page handles hash fragments
- ✅ Catch-all route handles wildcards
- ⚠️ **Action Required:** Configure redirect URLs in Supabase Dashboard

