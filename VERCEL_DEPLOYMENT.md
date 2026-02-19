# Vercel Deployment Guide

## Configuration Setup

Since your website is deployed on Vercel, you have two options for managing sensitive configuration:

### Option 1: Use config.js (Current Setup) ✅

1. **Create `config.js` in your project root:**
   ```javascript
   const CONFIG = {
     googleScriptUrl: 'https://script.google.com/macros/s/YOUR_URL/exec'
   };
   ```

2. **Add to Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables" (optional, if you want to use env vars instead)
   - OR: Upload `config.js` directly through Vercel's file upload (if supported)
   - OR: Add `config.js` to your Git repository temporarily, deploy, then remove it (not recommended)

3. **Best Practice for Vercel:**
   - Since `config.js` is in `.gitignore`, you need to manually add it to Vercel
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Or use Vercel CLI to upload the file

### Option 2: Use Vercel Environment Variables (Recommended) 🌟

For better security on Vercel, use environment variables:

1. **Update your code to use environment variables:**

   In `discovery.html` and `Risk assessment/public/script.js`, replace:
   ```javascript
   const GOOGLE_SCRIPT_URL = (typeof CONFIG !== 'undefined' && CONFIG.googleScriptUrl) ? CONFIG.googleScriptUrl : '';
   ```
   
   With:
   ```javascript
   // Try environment variable first (Vercel), then config.js, then empty
   const GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || 
                             (typeof CONFIG !== 'undefined' && CONFIG.googleScriptUrl) || 
                             '';
   ```

2. **Set in Vercel Dashboard:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GOOGLE_SCRIPT_URL` = `https://script.google.com/macros/s/YOUR_URL/exec`
   - Redeploy your site

3. **Update HTML to inject env var:**
   Add this script tag in your HTML files (before other scripts):
   ```html
   <script>
     window.GOOGLE_SCRIPT_URL = '%GOOGLE_SCRIPT_URL%';
   </script>
   ```

### Current Status

Your website is currently set up to use `config.js`. To deploy on Vercel:

1. **Manual Upload Method:**
   - Create `config.js` locally with your actual URL
   - Use Vercel CLI or Dashboard to upload it
   - Or temporarily commit it, deploy, then remove from Git

2. **Environment Variable Method (Better):**
   - Set `GOOGLE_SCRIPT_URL` in Vercel environment variables
   - Update code to read from `window.GOOGLE_SCRIPT_URL`
   - No need to commit sensitive files

## Quick Fix for Vercel

Since `config.js` is gitignored, you have two options:

**Option A: Temporarily commit config.js for deployment**
```bash
# Add config.js temporarily
git add -f config.js
git commit -m "Add config for Vercel deployment"
git push
# Then immediately remove it
git rm --cached config.js
git commit -m "Remove config from Git"
```

**Option B: Use Vercel Environment Variables (Recommended)**
- Set the URL in Vercel Dashboard
- Update code to read from environment variable
- No files need to be committed

## Testing

After deployment, test:
1. Discovery form submission
2. Risk assessment submission
3. Check Firebase Console for data
4. Verify email alerts are working

