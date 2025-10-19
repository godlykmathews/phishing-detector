# Email Header Analysis Test Cases

This file contains sample email headers for testing the email header analysis feature.

## Test Case 1: Legitimate Email (Should Score 0-2)

```
From: support@github.com
To: user@example.com
Subject: Your GitHub Security Alert
Date: Mon, 18 Oct 2025 10:30:00 +0000
Message-ID: <abc123@github.com>
Return-Path: <bounce@github.com>
Authentication-Results: spf=pass; dkim=pass; dmarc=pass
DKIM-Signature: v=1; a=rsa-sha256; d=github.com; s=selector1;
Received-SPF: pass
```

## Test Case 2: SPF Failure (Should Score 3-5)

```
From: admin@paypal.com
To: victim@example.com
Subject: Account Verification Required
Date: Mon, 18 Oct 2025 12:00:00 +0000
Message-ID: <xyz789@paypal.com>
Return-Path: <noreply@suspicious-domain.com>
Authentication-Results: spf=fail; dkim=none; dmarc=none
Received-SPF: fail
```

## Test Case 3: Sender Mismatch (Should Score 5-7)

```
From: ceo@company.com
To: employee@company.com
Subject: Urgent Wire Transfer Request
Date: Mon, 18 Oct 2025 14:30:00 +0000
Message-ID: <urgent@randomdomain.xyz>
Return-Path: <bounce@phishing-site.com>
Sender: automated@bulk-mailer.net
Authentication-Results: spf=softfail; dkim=none; dmarc=fail
```

## Test Case 4: Reply-To Mismatch (Should Score 3-5)

```
From: support@amazon.com
To: customer@example.com
Subject: Your Order Has Shipped
Date: Mon, 18 Oct 2025 16:00:00 +0000
Message-ID: <order123@amazon.com>
Reply-To: payment-processor@totally-not-amazon.com
Return-Path: <bounce@amazon.com>
Authentication-Results: spf=pass; dkim=pass; dmarc=pass
```

## Test Case 5: Multiple Authentication Failures (Should Score 7-10)

```
From: security@microsoft.com
To: user@company.com
Subject: URGENT: Account Will Be Closed
Date: Wed, 20 Oct 2030 09:00:00 +0000
Message-ID: <alert@sketchy-site.xyz>
Return-Path: <bounce@not-microsoft.com>
Reply-To: support@fake-microsoft.net
Sender: bulk@mass-mailer.com
Authentication-Results: spf=fail; dkim=fail; dmarc=fail
Received-SPF: fail
X-Mailer: PHPMailer
```

## Test Case 6: Missing Authentication (Should Score 2-4)

```
From: newsletter@startup.com
To: subscriber@example.com
Subject: Weekly Newsletter
Date: Mon, 18 Oct 2025 11:00:00 +0000
Message-ID: <newsletter@startup.com>
Return-Path: <bounce@startup.com>
```

## How to Use These Test Cases

1. Copy the headers from any test case above
2. Open the Phishing Detector extension
3. Click on the "Email Headers" tab
4. Paste the headers into the text area
5. Click "Analyze Email Headers"
6. Compare the results with the expected score range

## Real Email Header Extraction

### Gmail

1. Open the email
2. Click the three dots (⋮) next to the reply button
3. Select "Show original"
4. Copy everything from the opened window

### Outlook.com

1. Open the email
2. Click the three dots (...) menu
3. Select "View message source"
4. Copy the headers

### Yahoo Mail

1. Open the email
2. Click "More" (three dots)
3. Select "View raw message"
4. Copy the header section

### Apple Mail

1. Open the email
2. Go to View → Message → Raw Source
3. Copy the headers

### Thunderbird

1. Open the email
2. Press Ctrl+U (Cmd+U on Mac) or View → Message Source
3. Copy the header section

## What to Look For

### Good Signs ✅

- `spf=pass`
- `dkim=pass`
- `dmarc=pass`
- Matching From and Return-Path domains
- Recent, valid dates
- Professional Message-ID

### Warning Signs ⚠️

- `spf=softfail` or missing
- No DKIM signature
- No DMARC policy
- Reply-To differs from From
- Generic automated mailer

### Red Flags 🚨

- `spf=fail`
- `dkim=fail`
- `dmarc=fail`
- Completely different From and Return-Path domains
- Message-ID domain doesn't match From domain
- Future dates or very old dates
- Multiple mismatches
