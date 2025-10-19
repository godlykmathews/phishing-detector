import {
  analyzeEmailHeaders,
  generateEmailHeaderSummary,
} from "./emailHeaderAnalyzer.js";

console.log("🧪 Testing Email Header Analyzer\n");

// Test Case 1: Legitimate Email
console.log("Test 1: Legitimate Email with all auth passing");
const legitHeaders = {
  From: "support@github.com",
  To: "user@example.com",
  "Return-Path": "<bounce@github.com>",
  "Authentication-Results": "spf=pass; dkim=pass; dmarc=pass",
  "DKIM-Signature": "v=1; a=rsa-sha256; d=github.com;",
  "Message-ID": "<abc123@github.com>",
  Date: "Mon, 18 Oct 2025 10:30:00 +0000",
};
const result1 = analyzeEmailHeaders(legitHeaders);
console.log("Risk Score:", result1.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result1));
console.log("Issues:", result1.issues.length);
console.log("Warnings:", result1.warnings.length);
console.log("Passed:", result1.passed.length);
console.log("---\n");

// Test Case 2: SPF Failure
console.log("Test 2: Email with SPF failure");
const spfFailHeaders = {
  From: "admin@paypal.com",
  To: "victim@example.com",
  "Return-Path": "<noreply@suspicious-domain.com>",
  "Authentication-Results": "spf=fail; dkim=none; dmarc=none",
  "Received-SPF": "fail",
  "Message-ID": "<xyz789@paypal.com>",
  Date: "Mon, 18 Oct 2025 12:00:00 +0000",
};
const result2 = analyzeEmailHeaders(spfFailHeaders);
console.log("Risk Score:", result2.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result2));
console.log("Issues:", result2.issues.length);
console.log("Warnings:", result2.warnings.length);
console.log("---\n");

// Test Case 3: Sender Mismatch with Multiple Failures
console.log("Test 3: Multiple authentication failures with sender mismatch");
const mismatchHeaders = {
  From: "ceo@company.com",
  To: "employee@company.com",
  "Return-Path": "<bounce@phishing-site.com>",
  Sender: "automated@bulk-mailer.net",
  "Authentication-Results": "spf=fail; dkim=fail; dmarc=fail",
  "Message-ID": "<urgent@randomdomain.xyz>",
  Date: "Mon, 18 Oct 2025 14:30:00 +0000",
  "X-Mailer": "PHPMailer 6.0",
};
const result3 = analyzeEmailHeaders(mismatchHeaders);
console.log("Risk Score:", result3.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result3));
console.log("Issues:", result3.issues.length);
console.log("Warnings:", result3.warnings.length);
console.log("Sender Mismatch:", result3.details.senderMismatch);
console.log("---\n");

// Test Case 4: Reply-To Mismatch
console.log("Test 4: Reply-To address mismatch");
const replyToHeaders = {
  From: "support@amazon.com",
  To: "customer@example.com",
  "Reply-To": "payment-processor@totally-not-amazon.com",
  "Return-Path": "<bounce@amazon.com>",
  "Authentication-Results": "spf=pass; dkim=pass; dmarc=pass",
  "Message-ID": "<order123@amazon.com>",
  Date: "Mon, 18 Oct 2025 16:00:00 +0000",
};
const result4 = analyzeEmailHeaders(replyToHeaders);
console.log("Risk Score:", result4.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result4));
console.log("Reply-To Mismatch:", result4.details.replyToMismatch);
console.log("---\n");

// Test Case 5: Future Date
console.log("Test 5: Email with future date");
const futureDateHeaders = {
  From: "security@microsoft.com",
  To: "user@company.com",
  "Return-Path": "<bounce@not-microsoft.com>",
  "Authentication-Results": "spf=fail; dkim=fail; dmarc=fail",
  "Message-ID": "<alert@sketchy-site.xyz>",
  Date: "Wed, 20 Oct 2030 09:00:00 +0000",
};
const result5 = analyzeEmailHeaders(futureDateHeaders);
console.log("Risk Score:", result5.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result5));
console.log("Suspicious Headers:", result5.details.suspiciousHeaders);
console.log("---\n");

// Test Case 6: Missing Authentication
console.log("Test 6: Email with missing authentication headers");
const noAuthHeaders = {
  From: "newsletter@startup.com",
  To: "subscriber@example.com",
  "Return-Path": "<bounce@startup.com>",
  "Message-ID": "<newsletter@startup.com>",
  Date: "Mon, 18 Oct 2025 11:00:00 +0000",
};
const result6 = analyzeEmailHeaders(noAuthHeaders);
console.log("Risk Score:", result6.overallRisk, "/10");
console.log("Summary:", generateEmailHeaderSummary(result6));
console.log("Warnings:", result6.warnings.length);
console.log("---\n");

console.log("✅ All tests completed!");
console.log("\nTest Summary:");
console.log("- Test 1 (Legitimate): Risk should be 0-2");
console.log("- Test 2 (SPF Fail): Risk should be 3-5");
console.log("- Test 3 (Multiple Failures): Risk should be 7-10");
console.log("- Test 4 (Reply-To Mismatch): Risk should be 2-4");
console.log("- Test 5 (Future Date): Risk should be 7-10");
console.log("- Test 6 (No Auth): Risk should be 2-4");
