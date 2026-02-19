# Financial Planning Advisory Website

A professional financial planning website for young professionals with integrated risk assessment and Firebase data storage.

## Features

- ✅ Discovery call form
- ✅ Comprehensive risk assessment questionnaire (25 MCQ questions)
- ✅ Firebase Firestore integration for secure data storage
- ✅ Email alerts for new submissions
- ✅ Responsive design
- ✅ Professional UI/UX

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Apps Script (serverless)
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Email**: Google Apps Script MailApp

## Project Structure

```
Website/
├── index.html              # Home page
├── about.html              # About page
├── services.html           # Services page
├── process.html            # Process page
├── discovery.html          # Discovery form
├── contact.html            # Contact page
├── disclosures.html        # Disclosures page
├── disclaimer.html         # Disclaimer page
├── grievances.html         # Grievances page
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   └── main.js            # Main JavaScript
├── Risk assessment/
│   └── public/            # Risk assessment tool
│       ├── index.html
│       ├── script.js
│       └── styles.css
├── config.example.js       # Configuration template
└── vercel.json            # Vercel configuration
```

## Setup

1. **Clone the repository**
2. **Copy configuration template:**
   ```bash
   cp config.example.js config.js
   ```
3. **Fill in `config.js`** with your Google Apps Script Web App URL
4. **Set up Firebase:**
   - Create a Firebase project
   - Enable Firestore Database
   - Generate a service account key
   - Update Google Apps Script with credentials (see `GOOGLE_SCRIPT_CODE.template.txt`)

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variable `GOOGLE_SCRIPT_URL` in Vercel Dashboard
3. Deploy automatically on push

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

## Security

- Sensitive configuration files are excluded from Git (see `.gitignore`)
- Use template files (`*.example.js`, `*.template.txt`) for reference
- Never commit `config.js` or files containing private keys

See `SECURITY.md` for security best practices.

## Documentation

- `VERCEL_DEPLOYMENT.md` - Vercel deployment guide
- `SECURITY.md` - Security guidelines
- `GOOGLE_SCRIPT_CODE.template.txt` - Google Apps Script template

---

Built for financial planning advisory services.
