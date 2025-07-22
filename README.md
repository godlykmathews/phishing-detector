# AI-Powered Phishing Detector Chrome Extension

A Chrome extension that uses Google's Gemini Flash 2.5 AI to detect phishing websites in real-time.

## Features

- **Real-time Analysis**: Analyzes webpages as you browse
- **AI-Powered Detection**: Uses Gemini Flash 2.5 for intelligent phishing detection
- **Comprehensive Scanning**: Extracts URL, text content, forms, and suspicious elements
- **Risk Scoring**: Provides 0-10 risk score with detailed explanations
- **Caching**: Caches results to avoid repeated analysis of the same pages

## Setup Instructions

### 1. Server Setup

1. Navigate to the server directory:
   \`\`\`bash
   cd server
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up your Google AI API key:
   \`\`\`bash
   export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
   \`\`\`

4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

The server will run on `http://localhost:3001`

### 2. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension folder
4. The extension icon should appear in your toolbar

### 3. Usage

1. Navigate to any website
2. Click the Phishing Detector extension icon
3. Click "Analyze Current Page"
4. View the AI-generated risk assessment

## How It Works

1. **Content Extraction**: The extension extracts page URL, text content, forms, and links
2. **AI Analysis**: Data is sent to the Node.js server which uses Gemini Flash 2.5 to analyze for phishing indicators
3. **Risk Assessment**: The AI provides a 0-10 risk score with detailed explanation
4. **User Alert**: Results are displayed in the extension popup with color-coded warnings

## Risk Levels

- **0-3**: Likely Safe (Green)
- **4-6**: Suspicious (Yellow) 
- **7-10**: High Risk (Red)

## API Requirements

- Google Generative AI API key
- Gemini Flash 2.5 model access

## Security Features

- Local caching to reduce API calls
- Content length limits to prevent abuse
- CORS protection on server endpoints
- No sensitive data storage in extension
