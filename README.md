# AI-Powered Phishing Detector Chrome Extension

A Chrome extension that uses Google's Gemini Flash 2.5 AI to detect phishing websites and analyze email headers in real-time.

## Features

### Page Analysis

- **Real-time Analysis**: Analyzes webpages as you browse
- **AI-Powered Detection**: Uses Gemini Flash 2.5 for intelligent phishing detection
- **Comprehensive Scanning**: Extracts URL, text content, forms, and suspicious elements
- **Risk Scoring**: Provides 0-10 risk score with detailed explanations
- **Caching**: Caches results to avoid repeated analysis of the same pages

### Email Header Analysis

- **DKIM Verification**: Checks DomainKeys Identified Mail signatures
- **SPF Validation**: Verifies Sender Policy Framework records
- **DMARC Compliance**: Analyzes Domain-based Message Authentication compliance
- **Sender Mismatch Detection**: Identifies mismatched sender addresses
- **Reply-To Analysis**: Detects suspicious Reply-To discrepancies
- **Spoofing Indicators**: Identifies suspicious headers and patterns
- **AI-Enhanced Analysis**: Provides intelligent assessment of email authenticity

## Setup Instructions

### 1. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension folder
4. The extension icon should appear in your toolbar

### 2. Usage

#### Page Analysis

1. Navigate to any website
2. Click the Phishing Detector extension icon
3. Click the "Page Analysis" tab
4. Click "Analyze Current Page"
5. View the AI-generated risk assessment

#### Email Header Analysis

1. Open the email you want to analyze
2. Access the email's raw headers:
   - **Gmail**: Click ⋮ (three dots) → "Show original"
   - **Outlook**: Click ... → "View message source"
   - **Yahoo**: Click "More" → "View raw message"
3. Copy all the header information
4. Click the Phishing Detector extension icon
5. Switch to the "Email Headers" tab
6. Paste the headers into the text area
7. Click "Analyze Email Headers"
8. Review the comprehensive security assessment including:
   - DKIM, SPF, and DMARC verification status
   - Sender address mismatches
   - Reply-To discrepancies
   - Suspicious header patterns
   - AI-generated security insights

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

## Email Header Analysis Details

### What Gets Checked

#### Authentication Protocols

- **DKIM (DomainKeys Identified Mail)**: Verifies the email hasn't been tampered with and confirms the sender domain
- **SPF (Sender Policy Framework)**: Checks if the sending server is authorized to send emails for the domain
- **DMARC (Domain-based Message Authentication)**: Ensures the email aligns with the domain's authentication policies

#### Sender Verification

- **From vs Return-Path**: Compares the visible sender with the actual return path
- **From vs Sender**: Checks for discrepancies between From and Sender headers
- **Reply-To Mismatches**: Detects when replies would go to a different address/domain

#### Suspicious Patterns

- **Automated Mailers**: Identifies bulk email tools used for seemingly personal emails
- **Message-ID Mismatches**: Detects when the message ID domain differs from the sender domain
- **Unusual Routing**: Flags emails with too few mail server hops
- **Date Anomalies**: Identifies future-dated or very old emails

### Risk Scoring

- **0-3**: Likely legitimate - all authentication checks passed
- **4-6**: Suspicious - some authentication issues or warnings
- **7-10**: High risk - multiple failures indicating possible spoofing

## Security Features

- Local caching to reduce API calls
- Content length limits to prevent abuse
- CORS protection on server endpoints
- No sensitive data storage in extension
- Secure header parsing and validation
