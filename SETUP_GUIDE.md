# Setup Guide - Phishing Detector with Email Header Analysis

## Prerequisites

- Node.js (v14 or higher)
- Google Chrome browser
- Google Generative AI API Key (Gemini)

## Installation Steps

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you'll need it in step 3)

### 2. Set Up the Server

Open a terminal/command prompt and navigate to the project folder:

```powershell
cd "c:\Users\godly\OneDrive\Desktop\phishing-detector\server"
```

Install dependencies:

```powershell
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` folder:

```powershell
New-Item -Path .env -ItemType File
```

Open the `.env` file and add your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
PORT=3001
```

Replace `your_api_key_here` with your actual Google AI API key.

### 4. Start the Server

```powershell
npm start
```

You should see:

```
Phishing detection server running on port 3001
✅ GOOGLE_GENERATIVE_AI_API_KEY loaded successfully.
```

Keep this terminal window open. The server needs to run for the extension to work.

### 5. Install the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right corner)
3. Click "Load unpacked"
4. Navigate to `c:\Users\godly\OneDrive\Desktop\phishing-detector`
5. Select the folder and click "Select Folder"
6. The extension icon should appear in your Chrome toolbar

## Testing the Installation

### Test Page Analysis

1. Navigate to any website
2. Click the Phishing Detector extension icon
3. Click "Analyze Current Page"
4. You should see a risk assessment

### Test Email Header Analysis

1. Click the Phishing Detector extension icon
2. Switch to the "Email Headers" tab
3. Paste this sample header:

```
From: test@example.com
To: user@example.com
Subject: Test Email
Date: Mon, 18 Oct 2025 10:30:00 +0000
Authentication-Results: spf=pass; dkim=pass; dmarc=pass
Message-ID: <test@example.com>
Return-Path: <test@example.com>
```

4. Click "Analyze Email Headers"
5. You should see a low-risk assessment

## Running the Unit Tests

To verify the email header analyzer is working correctly:

```powershell
cd "c:\Users\godly\OneDrive\Desktop\phishing-detector\server"
node testEmailAnalyzer.js
```

You should see all 6 test cases pass with appropriate risk scores.

## Troubleshooting

### Server Issues

**Problem: "GOOGLE_GENERATIVE_AI_API_KEY is not set"**

- Solution: Make sure you created the `.env` file in the `server` folder with the API key

**Problem: "Port 3001 is already in use"**

- Solution: Change the PORT in your `.env` file to a different number (e.g., 3002)
- Also update the port in `popup.js` (search for `localhost:3001` and replace)

**Problem: "Cannot find module"**

- Solution: Run `npm install` again in the server folder

### Extension Issues

**Problem: "Extension error" or extension not loading**

- Solution: Make sure you selected the root project folder (phishing-detector), not a subfolder

**Problem: "Analysis failed" when clicking Analyze**

- Solution: Check that the server is running (`npm start` in the server folder)
- Check the browser console (F12) for error messages

**Problem: Email header analysis returns error**

- Solution: Make sure you're pasting valid email headers (see `EMAIL_HEADER_TESTS.md` for examples)
- Verify the server is running and responding

### API Issues

**Problem: "API quota exceeded"**

- Solution: Google AI has rate limits on free tier. Wait and try again later, or upgrade your plan

**Problem: "Invalid API key"**

- Solution: Verify your API key is correct in the `.env` file
- Make sure there are no extra spaces or quotes around the key

## Development Mode

To run the server with auto-restart on changes:

```powershell
npm run dev
```

This uses nodemon to automatically restart the server when you modify files.

## File Structure

```
phishing-detector/
├── manifest.json                 # Chrome extension manifest
├── popup.html                    # Extension popup UI
├── popup.js                      # Extension popup logic
├── content.js                    # Page content extraction
├── emailExtractor.js             # Email header extraction (for webmail)
├── background.js                 # Extension background service
├── README.md                     # Main documentation
├── EMAIL_HEADER_GUIDE.md         # Email analysis user guide
├── EMAIL_HEADER_TESTS.md         # Sample test cases
└── server/
    ├── server.js                 # Main server file
    ├── emailHeaderAnalyzer.js    # Email header analysis logic
    ├── testEmailAnalyzer.js      # Unit tests
    ├── package.json              # Node dependencies
    └── .env                      # Environment variables (create this)
```

## Next Steps

1. Read `EMAIL_HEADER_GUIDE.md` to understand how email header analysis works
2. Try the test cases in `EMAIL_HEADER_TESTS.md`
3. Test with real emails from your inbox
4. Share feedback and report issues

## Security Notes

- Never share your Google AI API key
- The extension runs locally and doesn't send data to third parties
- Email headers are sent to your local server and Google AI for analysis
- No email content or personal data is stored

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the test files to see expected behavior
3. Check server logs for error messages
4. Ensure all dependencies are installed correctly
