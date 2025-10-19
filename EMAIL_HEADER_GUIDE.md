# Email Header Analysis Feature

## Overview

The Email Header Analysis feature helps you identify phishing and spoofed emails by analyzing technical email headers for authentication failures and suspicious patterns.

## What It Checks

### 🔐 Email Authentication (DKIM, SPF, DMARC)

These are industry-standard protocols that verify:

- **DKIM**: The email hasn't been tampered with and comes from the claimed domain
- **SPF**: The sending server is authorized to send emails for that domain
- **DMARC**: The email meets the domain owner's authentication policies

### 📧 Sender Verification

- **From vs Return-Path**: Are they from the same domain?
- **From vs Sender**: Do they match?
- **Reply-To**: Would replies go to a different domain?

### 🚩 Suspicious Patterns

- Automated mailers used for personal-looking emails
- Mismatched Message-ID domains
- Unusual email routing (too few server hops)
- Future-dated or very old emails

## How to Use

### Step 1: Get Email Headers

Different email providers have different methods:

**Gmail:**

1. Open the email
2. Click ⋮ (three dots) → "Show original"
3. Copy all the text

**Outlook/Hotmail:**

1. Open the email
2. Click ... → "View message source"
3. Copy the headers

**Yahoo Mail:**

1. Open the email
2. Click "More" → "View raw message"
3. Copy the headers

### Step 2: Analyze

1. Open the Phishing Detector extension
2. Click the "Email Headers" tab
3. Paste the headers
4. Click "Analyze Email Headers"

### Step 3: Review Results

The analysis provides:

- **Risk Score (0-10)**: Overall assessment
- **Authentication Status**: DKIM, SPF, DMARC results
- **Issues**: Critical security problems
- **Warnings**: Suspicious but not definitive indicators
- **AI Insights**: Gemini AI's security assessment

## Understanding Risk Scores

| Score | Level         | Meaning                                                  |
| ----- | ------------- | -------------------------------------------------------- |
| 0-3   | ✅ Safe       | All authentication checks passed, no suspicious patterns |
| 4-6   | ⚠️ Suspicious | Some authentication issues or warnings detected          |
| 7-10  | 🚨 High Risk  | Multiple failures indicating likely spoofing/phishing    |

## Examples

### ✅ Legitimate Email

```
Risk Score: 1/10
✅ DKIM: pass
✅ SPF: pass
✅ DMARC: pass
✅ Sender addresses consistent
```

### ⚠️ Suspicious Email

```
Risk Score: 5/10
⚠️ DKIM: missing
⚠️ SPF: softfail
⚠️ Reply-To differs from sender
```

### 🚨 Likely Phishing

```
Risk Score: 9/10
❌ DKIM: fail
❌ SPF: fail
❌ DMARC: fail
❌ From domain differs from Return-Path
❌ Message-ID domain mismatch
```

## Common Phishing Tactics

### Domain Spoofing

Attacker makes the "From" address look legitimate, but:

- Return-Path shows different domain
- SPF/DKIM/DMARC checks fail

**Example:**

- From: `ceo@company.com` (looks legitimate)
- Return-Path: `attacker@evil.com` (real sender)
- Risk: 🚨 High

### Reply Redirection

Email looks legitimate, but replies go elsewhere:

- From: `support@amazon.com`
- Reply-To: `payment@totally-not-amazon.xyz`
- Risk: ⚠️ Suspicious

### Authentication Bypass

Legitimate-looking email bypasses security:

- All authentication checks missing or failed
- Automated mailer for "personal" message
- Risk: 🚨 High

## Best Practices

1. **Always check suspicious emails**: If an email requests urgent action, money transfer, or password reset, analyze the headers first

2. **Don't rely on display names**: The "From" name can be faked. Look at the actual email address and authentication results

3. **Verify through official channels**: If you receive a suspicious email from a company, contact them directly through their official website

4. **Look for multiple red flags**: One warning might be innocent, but multiple failures indicate danger

5. **Trust the authentication**: If SPF, DKIM, and DMARC all pass, the email is likely legitimate

## Limitations

- Headers can only be analyzed if you can access them (not always available on mobile apps)
- Some legitimate emails may have minor warnings (e.g., no DKIM on small businesses)
- The tool analyzes technical indicators but can't evaluate email content or links
- Always use common sense in addition to technical analysis

## Need Help?

If you're unsure about an email:

1. Don't click any links or download attachments
2. Analyze the headers using this tool
3. Contact the sender through official channels to verify
4. Report suspicious emails to your IT department or email provider

## Technical Details

The analyzer checks:

- Authentication-Results header
- DKIM-Signature
- Received-SPF / SPF results
- From, Return-Path, Sender headers
- Reply-To header
- Message-ID domain
- Date validity
- X-Mailer patterns
- Received header chain

Results are combined with AI analysis from Google's Gemini for comprehensive assessment.
