# Google Sheets Setup Guide

Follow these steps to set up Google Sheets as your database. This will allow you to view all client submissions from anywhere!

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it: **"Financial Planning Client Database"**
4. In Row 1 (the header row), add these column names:

```
A1: Name
B1: Age
C1: Email
D1: Phone
E1: Service
F1: Risk Capacity
G1: Risk Behaviour
H1: Risk Score
I1: Risk Bucket
J1: Equity Allocation
K1: Debt Allocation
L1: Alternatives Allocation
M1: Timestamp
```

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste this code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Handle discovery form submission
    if (data.type === 'discovery') {
      sheet.appendRow([
        data.name || '',
        data.age || '',
        data.email || '',
        data.phone || '',
        data.service || '',
        '', // Risk Capacity (empty for now)
        '', // Risk Behaviour (empty for now)
        '', // Risk Score (empty for now)
        '', // Risk Bucket (empty for now)
        '', // Equity Allocation (empty for now)
        '', // Debt Allocation (empty for now)
        '', // Alternatives Allocation (empty for now)
        data.timestamp || new Date()
      ]);
    }
    
    // Handle risk assessment submission
    if (data.type === 'assessment') {
      // Find the row with matching email
      const email = data.email;
      const lastRow = sheet.getLastRow();
      let rowToUpdate = null;
      
      // Search for existing row with this email
      for (let i = 2; i <= lastRow; i++) {
        if (sheet.getRange(i, 3).getValue() === email) {
          rowToUpdate = i;
          break;
        }
      }
      
      if (rowToUpdate) {
        // Update existing row with assessment data
        sheet.getRange(rowToUpdate, 1).setValue(data.name || '');
        sheet.getRange(rowToUpdate, 2).setValue(data.age || '');
        sheet.getRange(rowToUpdate, 3).setValue(data.email || '');
        sheet.getRange(rowToUpdate, 4).setValue(data.phone || '');
        sheet.getRange(rowToUpdate, 5).setValue(data.service || '');
        sheet.getRange(rowToUpdate, 6).setValue(data.riskCapacity || '');
        sheet.getRange(rowToUpdate, 7).setValue(data.riskBehaviour || '');
        sheet.getRange(rowToUpdate, 8).setValue(data.riskScore || '');
        sheet.getRange(rowToUpdate, 9).setValue(data.riskBucket || '');
        sheet.getRange(rowToUpdate, 10).setValue(data.equityAllocation || '');
        sheet.getRange(rowToUpdate, 11).setValue(data.debtAllocation || '');
        sheet.getRange(rowToUpdate, 12).setValue(data.alternativesAllocation || '');
        sheet.getRange(rowToUpdate, 13).setValue(data.timestamp || new Date());
      } else {
        // Create new row if email not found
        sheet.appendRow([
          data.name || '',
          data.age || '',
          data.email || '',
          data.phone || '',
          data.service || '',
          data.riskCapacity || '',
          data.riskBehaviour || '',
          data.riskScore || '',
          data.riskBucket || '',
          data.equityAllocation || '',
          data.debtAllocation || '',
          data.alternativesAllocation || '',
          data.timestamp || new Date()
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾 icon) or press `Cmd+S` (Mac) / `Ctrl+S` (Windows)
5. Give your project a name: **"Client Database Script"**

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **"Web app"**
3. Fill in the deployment settings:
   - **Description**: "Client Database API" (optional)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important!)
4. Click **Deploy**
5. You may be asked to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to Client Database Script (unsafe)**
   - Click **Allow**
6. **COPY THE WEB APP URL** - It will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
   ⚠️ **SAVE THIS URL - YOU'LL NEED IT!**

## Step 4: Update Your Website Files

You need to paste your Google Script URL into two files:

### File 1: `discovery.html`

1. Open `discovery.html` in your code editor
2. Find this line (around line 136):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_URL_HERE'` with your actual URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file

### File 2: `Risk assessment/public/script.js`

1. Open `Risk assessment/public/script.js` in your code editor
2. Find this line (near the top):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_URL_HERE'` with the same URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file

## Step 5: Test It!

1. Open your website locally
2. Fill out the discovery form
3. Complete the risk assessment
4. Check your Google Sheet - you should see the data appear!

## Step 6: Deploy to Netlify

1. Push your code to GitHub
2. Connect to Netlify
3. Deploy
4. Test the live site - data should still save to your Google Sheet!

## Viewing Your Data

- **From anywhere**: Just open your Google Sheet in a browser
- **On mobile**: Use the Google Sheets app
- **Share with others**: Click "Share" in Google Sheets (if needed)

## Troubleshooting

**Data not appearing?**
- Check that you pasted the URL correctly (with quotes)
- Make sure "Who has access" is set to "Anyone"
- Check the browser console (F12) for errors

**Permission errors?**
- Re-authorize the script in Apps Script
- Make sure you clicked "Allow" when prompted

**Need to update the script?**
- Go back to Apps Script
- Make changes
- Click Deploy → Manage deployments
- Click the pencil icon to edit
- Click Deploy (creates new version)

---

That's it! Your database is now in Google Sheets and accessible from anywhere! 🎉




