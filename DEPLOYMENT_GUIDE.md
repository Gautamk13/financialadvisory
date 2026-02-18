# Netlify Deployment Guide

Follow these steps to deploy your website to Netlify so it's live on the internet!

## Step 1: Prepare Your Files

### Files to Deploy
Make sure these files are ready:
- ✅ All HTML files (index.html, about.html, services.html, etc.)
- ✅ CSS folder with styles.css
- ✅ JS folder with main.js
- ✅ Risk assessment folder (with public subfolder)
- ✅ All other pages (contact.html, process.html, etc.)

### Files NOT to Deploy (Optional - you can ignore these)
- ❌ node_modules folder (if any)
- ❌ GOOGLE_SHEETS_SETUP.md (documentation)
- ❌ GOOGLE_SCRIPT_CODE.txt (reference file)
- ❌ DEPLOYMENT_GUIDE.md (this file)
- ❌ Any .db files (database files)

## Step 2: Create a GitHub Repository (Recommended)

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop** (if you don't have it):
   - Go to https://desktop.github.com
   - Download and install

2. **Create Repository**:
   - Open GitHub Desktop
   - Click "File" → "New Repository"
   - Name: `financial-planning-website`
   - Local Path: Choose your Website folder
   - Click "Create Repository"

3. **Commit Files**:
   - You'll see all your files listed
   - At bottom, type: "Initial commit - Financial Planning Website"
   - Click "Commit to main"

4. **Publish to GitHub**:
   - Click "Publish repository"
   - Make it Public (or Private if you prefer)
   - Click "Publish repository"

### Option B: Using Command Line

1. **Open Terminal** in your Website folder:
   ```bash
   cd "/Users/16alpha/Desktop/Website"
   ```

2. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Financial Planning Website"
   ```

3. **Create Repository on GitHub**:
   - Go to https://github.com/new
   - Create a new repository (name it `financial-planning-website`)
   - Don't initialize with README

4. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/financial-planning-website.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

## Step 3: Deploy to Netlify

### Method 1: Deploy from GitHub (Recommended)

1. **Sign up/Login to Netlify**:
   - Go to https://www.netlify.com
   - Sign up with GitHub (easiest option)

2. **Add New Site**:
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access GitHub
   - Select your repository: `financial-planning-website`

3. **Configure Build Settings**:
   - **Base directory**: Leave empty (or put `.` if needed)
   - **Build command**: Leave empty (no build needed for static site)
   - **Publish directory**: Leave empty (or put `.` if needed)
   - Click "Deploy site"

4. **Wait for Deployment**:
   - Netlify will deploy your site
   - You'll get a URL like: `https://random-name-123.netlify.app`

### Method 2: Drag & Drop (Quick Test)

1. **Go to Netlify**:
   - Visit https://app.netlify.com/drop
   - Drag your entire Website folder onto the page
   - Wait for upload and deployment

2. **Get Your URL**:
   - You'll get a temporary URL
   - Note: This method doesn't auto-update when you make changes

## Step 4: Configure Your Site

### Set Custom Domain (Optional)

1. In Netlify dashboard, go to **Site settings**
2. Click **Domain management**
3. Click **Add custom domain**
4. Enter your domain name
5. Follow DNS setup instructions

### Update Site Name

1. Go to **Site settings** → **General**
2. Click **Change site name**
3. Choose a better name (e.g., `financial-planning-advisory`)

## Step 5: Test Your Live Site

1. **Visit your Netlify URL**
2. **Test the discovery form**:
   - Fill it out and submit
   - Check your Google Sheet - data should appear!

3. **Test the risk assessment**:
   - Complete the assessment
   - Check your Google Sheet - results should update!

## Important Notes

### ✅ What Works Automatically:
- All your HTML pages
- CSS styling
- JavaScript functionality
- Google Sheets integration (already configured!)

### ⚠️ Things to Check:
- Make sure all file paths are relative (not absolute)
- Test all links work correctly
- Verify Google Sheets URL is correct in both files

### 🔄 Updating Your Site:
- **If using GitHub**: Just push changes to GitHub, Netlify auto-deploys!
- **If using drag & drop**: Re-upload the folder

## Troubleshooting

**Site not loading?**
- Check Netlify deployment logs
- Make sure index.html is in the root folder

**Google Sheets not working?**
- Verify the Google Script URL is correct in both files
- Check browser console (F12) for errors
- Make sure Google Apps Script is deployed with "Anyone" access

**Links broken?**
- Make sure all paths are relative (e.g., `about.html` not `/about.html`)
- Check file names match exactly (case-sensitive)

## Your Site is Live! 🎉

Once deployed, share your Netlify URL with anyone. They can:
- View your website
- Fill out the discovery form
- Take the risk assessment
- All data saves to your Google Sheet automatically!

---

**Need help?** Check Netlify's documentation: https://docs.netlify.com




