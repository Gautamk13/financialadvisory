# Security Guide

## Protecting Sensitive Keys

This project contains sensitive configuration files that should **NEVER** be committed to Git.

### Files to Keep Private:

1. **`config.js`** - Contains Google Apps Script Web App URL
2. **`firebase.config.js`** - Contains Firebase credentials (if created)
3. **`GOOGLE_SCRIPT_CODE.txt`** - Contains Firebase private key

### Setup Instructions:

1. **For Website Configuration:**
   - Copy `config.example.js` to `config.js`
   - Fill in your actual Google Apps Script Web App URL
   - `config.js` is automatically excluded from Git via `.gitignore`

2. **For Google Apps Script:**
   - Use `GOOGLE_SCRIPT_CODE.template.txt` as a template
   - Copy the template to Google Apps Script
   - Replace placeholder values with your actual Firebase credentials
   - **Never commit** the actual `GOOGLE_SCRIPT_CODE.txt` file

### What's Safe to Commit:

✅ `config.example.js` - Template file (no real values)  
✅ `GOOGLE_SCRIPT_CODE.template.txt` - Template file (no real values)  
✅ `firebase.config.example.js` - Template file (no real values)

### What's NOT Safe to Commit:

❌ `config.js` - Contains real URLs  
❌ `firebase.config.js` - Contains real credentials  
❌ `GOOGLE_SCRIPT_CODE.txt` - Contains private keys  
❌ Any `.key`, `.pem`, or `.env` files

### If You Accidentally Committed Sensitive Data:

1. **Immediately rotate your keys:**
   - Generate new Firebase service account keys
   - Update Google Apps Script with new credentials
   - Update your website config files

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.js GOOGLE_SCRIPT_CODE.txt" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (if already pushed):**
   ```bash
   git push origin --force --all
   ```

### Best Practices:

- Always use `.gitignore` to exclude sensitive files
- Use template/example files for documentation
- Never share private keys in screenshots or messages
- Rotate keys periodically
- Use environment variables in production (if using a build system)

