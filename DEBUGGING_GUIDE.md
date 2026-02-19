# Step-by-Step Debugging Guide for Email Sending

## Step 1: Update Google Apps Script Code
1. Open your Google Apps Script project: https://script.google.com
2. Copy the ENTIRE code from `GOOGLE_SCRIPT_CODE.txt`
3. Paste it into your Google Apps Script editor (replace all existing code)
4. Click **Save** (Ctrl+S or Cmd+S)
5. Go to **Deploy** → **Manage deployments**
6. Click the **pencil icon** (Edit) next to your deployment
7. Click **New version**
8. Click **Deploy**

## Step 2: Test Email Sending Directly (Verify Email Works)
1. In Google Apps Script, select `testEmailSending` from the function dropdown (top)
2. Click the **Run** button (▶️)
3. If prompted, click **Review permissions** → **Allow**
4. Check your email inbox (Gautamkathuria0909@gmail.com)
5. **Expected result**: You should receive a test email
6. If you receive it, email sending works! The issue is with data transmission or checkbox.

## Step 3: Test Form Submission from Website

### A. Open Browser Developer Tools
1. Open your website in a browser
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab
4. Keep this open during testing

### B. Submit the Assessment Form
1. Go to your risk assessment page
2. Fill out the **Personal Information** form:
   - Enter your name
   - Enter your phone
   - Enter your email (use Gautamkathuria0909@gmail.com for testing)
   - **IMPORTANT**: Check the "Send me a copy" checkbox
3. Click "Continue to Assessment"
4. Answer all 12 questions
5. Click "Submit Assessment"

### C. Check Browser Console
Look for these messages in the console:
- `=== Sending Assessment Data ===`
- `sendCopy checkbox value: true` (or false)
- `Data being sent: { email: "...", sendCopy: true/false, ... }`
- `=== ABOUT TO SEND DATA TO GOOGLE SCRIPT ===`
- `✓ Fetch request completed`

**What to look for:**
- ✅ If you see `sendCopy checkbox value: true` → Checkbox is captured correctly
- ❌ If you see `sendCopy checkbox value: false` → Checkbox is NOT being captured
- ✅ If you see `✓ Fetch request completed` → Data was sent to Google Script
- ❌ If you see an error → Note the error message

## Step 4: Check Google Apps Script Logs

### A. Open Logs
1. Go back to Google Apps Script
2. Click **View** → **Logs** (or press Ctrl+Enter / Cmd+Enter)
3. OR go to **Executions** (left sidebar) → Click the most recent execution → **View logs**

### B. What to Look For

**Good signs (data received):**
```
=== doPost CALLED ===
Has postData: YES
✓ Post data received, parsing JSON...
✓ JSON parsed successfully
Data type: assessment
```

**Bad signs (no data):**
```
Has postData: NO
✗✗✗ ERROR: No post data received
```

**Email check section:**
```
=== EMAIL CHECK START ===
sendCopy value: true (or false)
email value: your-email@example.com
answers present: YES
```

**If email should be sent:**
```
DEBUG MODE: Sending email regardless of checkbox
✓✓✓ DEBUG: Email sent successfully to: your-email@example.com
```

## Step 5: Identify the Problem

### Problem 1: "Has postData: NO"
**Meaning**: Data is not reaching Google Apps Script
**Possible causes:**
- Google Script URL is wrong
- Form submission failed
- Network error

**Solution:**
- Check the Google Script URL in `Risk assessment/public/script.js` line 7
- Verify it matches your deployed script URL
- Check browser console for fetch errors

### Problem 2: "sendCopy value: false"
**Meaning**: Checkbox value is not being captured
**Possible causes:**
- Checkbox not checked
- Checkbox value not saved in personalInfo
- Form auto-submitted before checkbox could be checked

**Solution:**
- Make sure you check the checkbox BEFORE clicking "Continue to Assessment"
- Check browser console for `sendCopy checkbox value: false`
- Verify the checkbox element exists on the page

### Problem 3: "answers present: NO" or "answers is missing"
**Meaning**: Answers are not being sent
**Possible causes:**
- Form not fully submitted
- Answers object is empty

**Solution:**
- Make sure you answered ALL 12 questions
- Check browser console for answer keys

### Problem 4: Email not sent even though all conditions met
**Meaning**: Email sending code has an error
**Possible causes:**
- MailApp permission issue
- Email format issue
- Script error

**Solution:**
- Check logs for error messages
- Try running `testEmailSending` function again
- Check spam folder

## Step 6: Share the Results

Please share:
1. **Browser Console Output**: Copy all messages from the console
2. **Google Apps Script Logs**: Copy the log output
3. **What happened**: Did you receive the email? What errors did you see?

This will help identify the exact issue!



