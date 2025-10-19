# Quick Reference - Email Header Analysis

## 🎯 Quick Start

### Get Email Headers

| Provider    | Steps                            |
| ----------- | -------------------------------- |
| **Gmail**   | ⋮ → Show original → Copy all     |
| **Outlook** | ... → View message source → Copy |
| **Yahoo**   | More → View raw message → Copy   |

### Analyze

1. Open Phishing Detector extension
2. Click "Email Headers" tab
3. Paste headers → Click "Analyze"

## 📊 Risk Score Guide

| Score | Icon | Meaning    | Action                   |
| ----- | ---- | ---------- | ------------------------ |
| 0-3   | ✅   | Safe       | Likely legitimate        |
| 4-6   | ⚠️   | Suspicious | Verify before acting     |
| 7-10  | 🚨   | High Risk  | Likely phishing - avoid! |

## 🔍 What Gets Checked

### Authentication (DKIM/SPF/DMARC)

- ✅ **Pass**: Email verified
- ⚠️ **Missing**: Can't verify
- ❌ **Fail**: Failed security check

### Sender Checks

- From vs Return-Path domains
- From vs Sender headers
- Reply-To consistency
- Message-ID domain match

### Suspicious Patterns

- Bulk mailers for personal emails
- Future-dated emails
- Unusually few mail hops
- Domain mismatches

## 🚩 Common Red Flags

### 🚨 Critical (7-10 Risk)

```
❌ SPF: fail
❌ DKIM: fail
❌ DMARC: fail
❌ From domain ≠ Return-Path domain
❌ Future date or very old
```

### ⚠️ Warning (4-6 Risk)

```
⚠️ No DKIM signature
⚠️ SPF softfail
⚠️ Reply-To differs from From
⚠️ Message-ID domain mismatch
⚠️ Automated mailer
```

### ✅ Safe (0-3 Risk)

```
✅ SPF: pass
✅ DKIM: pass
✅ DMARC: pass
✅ All domains consistent
✅ Recent valid date
```

## 💡 Real-World Examples

### Legitimate Email

```
From: security@github.com
Return-Path: bounce@github.com
Auth: spf=pass; dkim=pass; dmarc=pass
✅ Risk: 1/10 - Safe
```

### Phishing Email

```
From: ceo@company.com
Return-Path: attacker@evil.com
Auth: spf=fail; dkim=fail; dmarc=fail
🚨 Risk: 9/10 - DANGER!
```

### Suspicious Email

```
From: support@bank.com
Reply-To: verify@not-the-bank.xyz
Auth: spf=pass; dkim=missing
⚠️ Risk: 5/10 - Suspicious
```

## ⚡ Quick Tips

1. **Trust authentication** - If SPF/DKIM/DMARC all pass, likely safe
2. **Check domains** - From and Return-Path should match
3. **Beware Reply-To** - Different domain = suspicious
4. **Verify urgently** - "Urgent" emails deserve extra scrutiny
5. **Multiple failures** - More than 2 red flags = danger

## 🎓 Header Basics

### Essential Headers

- **From**: Who sent it (can be faked)
- **Return-Path**: Where bounces go (harder to fake)
- **Reply-To**: Where replies go (often abused)
- **Authentication-Results**: SPF/DKIM/DMARC status

### Authentication Explained

- **SPF**: "Is this server allowed to send for this domain?"
- **DKIM**: "Has this email been tampered with?"
- **DMARC**: "Does this meet the domain's policy?"

## 🛡️ Best Practices

### Before Clicking Links

1. Analyze headers first
2. Check risk score
3. Verify sender through official channels
4. Don't trust the display name alone

### If Score is 7+

- ❌ Don't click any links
- ❌ Don't download attachments
- ❌ Don't reply
- ✅ Report as phishing
- ✅ Delete the email

### If Score is 4-6

- ⚠️ Verify sender independently
- ⚠️ Contact through official website
- ⚠️ Look for other warning signs
- ⚠️ Trust your instinct

### If Score is 0-3

- ✅ Likely safe
- ✅ Still check content for typos/odd requests
- ✅ Verify unusual requests through other channels

## 📱 Mobile Access

Most mobile email apps don't show full headers. To analyze:

1. Forward to desktop/laptop
2. Or use webmail interface in browser
3. Then extract and analyze headers

## ⚙️ Server Setup (First Time)

```powershell
# Install dependencies
cd server
npm install

# Create .env file with:
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Start server
npm start
```

## 🔗 Resources

- Full Guide: `EMAIL_HEADER_GUIDE.md`
- Test Cases: `EMAIL_HEADER_TESTS.md`
- Setup Help: `SETUP_GUIDE.md`
- Main Docs: `README.md`

## ❓ FAQ

**Q: Why analyze headers instead of content?**  
A: Headers contain technical authentication data that's harder to fake than email content.

**Q: Can this catch all phishing?**  
A: No tool is perfect. Always use common sense and verify suspicious requests.

**Q: What if a legitimate email scores high?**  
A: Contact the sender through official channels to verify. Some legitimate emails may have configuration issues.

**Q: Is my data safe?**  
A: Headers are analyzed locally on your computer and by Google's Gemini AI. No data is stored permanently.

**Q: Do I need to keep the server running?**  
A: Yes, the Node.js server must be running for analysis to work.

---

🔒 **Remember**: When in doubt, verify through official channels before taking any action!
