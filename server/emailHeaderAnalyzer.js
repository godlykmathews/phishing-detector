/**
 * Email Header Analysis Module
 * Analyzes email headers for spoofing indicators and security issues
 */

/**
 * Analyzes email headers for phishing indicators
 * @param {Object} headers - Email header data
 * @returns {Object} Analysis results with risk indicators
 */
export function analyzeEmailHeaders(headers) {
  const results = {
    overallRisk: 0,
    issues: [],
    warnings: [],
    passed: [],
    details: {
      dkim: null,
      spf: null,
      dmarc: null,
      senderMismatch: null,
      replyToMismatch: null,
      suspiciousHeaders: [],
    },
  };

  // Analyze DKIM
  const dkimResult = analyzeDKIM(headers);
  results.details.dkim = dkimResult;
  if (dkimResult.status === "fail") {
    results.issues.push(`DKIM verification failed: ${dkimResult.message}`);
    results.overallRisk += 3;
  } else if (dkimResult.status === "pass") {
    results.passed.push("DKIM signature verified successfully");
  } else if (dkimResult.status === "missing") {
    results.warnings.push("No DKIM signature found");
    results.overallRisk += 1;
  }

  // Analyze SPF
  const spfResult = analyzeSPF(headers);
  results.details.spf = spfResult;
  if (spfResult.status === "fail") {
    results.issues.push(`SPF check failed: ${spfResult.message}`);
    results.overallRisk += 3;
  } else if (spfResult.status === "pass") {
    results.passed.push("SPF check passed");
  } else if (spfResult.status === "missing") {
    results.warnings.push("No SPF record found");
    results.overallRisk += 1;
  }

  // Analyze DMARC
  const dmarcResult = analyzeDMARC(headers);
  results.details.dmarc = dmarcResult;
  if (dmarcResult.status === "fail") {
    results.issues.push(`DMARC check failed: ${dmarcResult.message}`);
    results.overallRisk += 2;
  } else if (dmarcResult.status === "pass") {
    results.passed.push("DMARC policy satisfied");
  } else if (dmarcResult.status === "missing") {
    results.warnings.push("No DMARC policy found");
    results.overallRisk += 1;
  }

  // Check for sender address mismatches
  const senderMismatch = checkSenderMismatch(headers);
  results.details.senderMismatch = senderMismatch;
  if (senderMismatch.hasMismatch) {
    results.issues.push(`Sender address mismatch: ${senderMismatch.message}`);
    results.overallRisk += 4;
  } else {
    results.passed.push("Sender addresses are consistent");
  }

  // Check for Reply-To discrepancies
  const replyToMismatch = checkReplyToMismatch(headers);
  results.details.replyToMismatch = replyToMismatch;
  if (replyToMismatch.hasMismatch) {
    results.warnings.push(
      `Reply-To address differs from sender: ${replyToMismatch.message}`
    );
    results.overallRisk += 2;
  }

  // Check for suspicious headers
  const suspiciousHeaders = detectSuspiciousHeaders(headers);
  results.details.suspiciousHeaders = suspiciousHeaders;
  if (suspiciousHeaders.length > 0) {
    suspiciousHeaders.forEach((sh) => {
      results.warnings.push(
        `Suspicious header detected: ${sh.header} - ${sh.reason}`
      );
      results.overallRisk += 1;
    });
  }

  // Cap overall risk at 10
  results.overallRisk = Math.min(results.overallRisk, 10);

  return results;
}

/**
 * Analyzes DKIM (DomainKeys Identified Mail) signature
 */
function analyzeDKIM(headers) {
  const dkimSignature = headers["dkim-signature"] || headers["DKIM-Signature"];
  const authResults =
    headers["authentication-results"] || headers["Authentication-Results"];

  if (!dkimSignature && !authResults) {
    return {
      status: "missing",
      message: "No DKIM signature found in headers",
    };
  }

  // Check authentication-results header for DKIM status
  if (authResults) {
    const dkimMatch = authResults.match(/dkim=(\w+)/i);
    if (dkimMatch) {
      const status = dkimMatch[1].toLowerCase();
      if (status === "pass") {
        return {
          status: "pass",
          message: "DKIM signature verified",
        };
      } else if (status === "fail") {
        return {
          status: "fail",
          message: "DKIM signature verification failed",
        };
      } else if (status === "none") {
        return {
          status: "missing",
          message: "No DKIM signature present",
        };
      }
    }
  }

  // If we have a DKIM signature but no auth results, we can't verify it
  if (dkimSignature) {
    return {
      status: "unknown",
      message: "DKIM signature present but verification status unknown",
      signature: dkimSignature,
    };
  }

  return {
    status: "missing",
    message: "No DKIM information available",
  };
}

/**
 * Analyzes SPF (Sender Policy Framework) record
 */
function analyzeSPF(headers) {
  const received = headers["received"] || headers["Received"];
  const authResults =
    headers["authentication-results"] || headers["Authentication-Results"];
  const receivedSpf = headers["received-spf"] || headers["Received-SPF"];

  if (!authResults && !receivedSpf) {
    return {
      status: "missing",
      message: "No SPF information found in headers",
    };
  }

  // Check received-spf header
  if (receivedSpf) {
    const spfLower = receivedSpf.toLowerCase();
    if (spfLower.includes("pass")) {
      return {
        status: "pass",
        message: "SPF check passed",
      };
    } else if (spfLower.includes("fail")) {
      return {
        status: "fail",
        message: "SPF check failed - sender not authorized",
      };
    } else if (spfLower.includes("softfail")) {
      return {
        status: "fail",
        message: "SPF soft fail - sender possibly not authorized",
      };
    }
  }

  // Check authentication-results header for SPF status
  if (authResults) {
    const spfMatch = authResults.match(/spf=(\w+)/i);
    if (spfMatch) {
      const status = spfMatch[1].toLowerCase();
      if (status === "pass") {
        return {
          status: "pass",
          message: "SPF verification passed",
        };
      } else if (status === "fail" || status === "softfail") {
        return {
          status: "fail",
          message: "SPF verification failed",
        };
      } else if (status === "none") {
        return {
          status: "missing",
          message: "No SPF record found",
        };
      }
    }
  }

  return {
    status: "unknown",
    message: "SPF status could not be determined",
  };
}

/**
 * Analyzes DMARC (Domain-based Message Authentication, Reporting & Conformance) policy
 */
function analyzeDMARC(headers) {
  const authResults =
    headers["authentication-results"] || headers["Authentication-Results"];

  if (!authResults) {
    return {
      status: "missing",
      message: "No DMARC information found in headers",
    };
  }

  // Check authentication-results header for DMARC status
  const dmarcMatch = authResults.match(/dmarc=(\w+)/i);
  if (dmarcMatch) {
    const status = dmarcMatch[1].toLowerCase();
    if (status === "pass") {
      return {
        status: "pass",
        message: "DMARC policy satisfied",
      };
    } else if (status === "fail") {
      return {
        status: "fail",
        message: "DMARC policy not satisfied",
      };
    } else if (status === "none") {
      return {
        status: "missing",
        message: "No DMARC policy found",
      };
    }
  }

  return {
    status: "unknown",
    message: "DMARC status could not be determined",
  };
}

/**
 * Checks for mismatched sender addresses
 */
function checkSenderMismatch(headers) {
  const from = headers["from"] || headers["From"];
  const returnPath = headers["return-path"] || headers["Return-Path"];
  const sender = headers["sender"] || headers["Sender"];

  if (!from) {
    return {
      hasMismatch: false,
      message: "No From header found",
    };
  }

  const fromEmail = extractEmail(from);
  const fromDomain = extractDomain(fromEmail);

  const mismatches = [];

  // Check Return-Path mismatch
  if (returnPath) {
    const returnEmail = extractEmail(returnPath);
    const returnDomain = extractDomain(returnEmail);

    if (returnDomain && fromDomain && returnDomain !== fromDomain) {
      mismatches.push(
        `From domain (${fromDomain}) differs from Return-Path domain (${returnDomain})`
      );
    }
  }

  // Check Sender header mismatch
  if (sender) {
    const senderEmail = extractEmail(sender);
    const senderDomain = extractDomain(senderEmail);

    if (senderDomain && fromDomain && senderDomain !== fromDomain) {
      mismatches.push(
        `From domain (${fromDomain}) differs from Sender domain (${senderDomain})`
      );
    }
  }

  if (mismatches.length > 0) {
    return {
      hasMismatch: true,
      message: mismatches.join("; "),
      fromEmail,
      returnPath: returnPath ? extractEmail(returnPath) : null,
      sender: sender ? extractEmail(sender) : null,
    };
  }

  return {
    hasMismatch: false,
    message: "Sender addresses are consistent",
    fromEmail,
  };
}

/**
 * Checks for Reply-To header discrepancies
 */
function checkReplyToMismatch(headers) {
  const from = headers["from"] || headers["From"];
  const replyTo = headers["reply-to"] || headers["Reply-To"];

  if (!from || !replyTo) {
    return {
      hasMismatch: false,
      message: "No Reply-To header or missing From header",
    };
  }

  const fromEmail = extractEmail(from);
  const replyToEmail = extractEmail(replyTo);

  const fromDomain = extractDomain(fromEmail);
  const replyToDomain = extractDomain(replyToEmail);

  if (fromDomain && replyToDomain && fromDomain !== replyToDomain) {
    return {
      hasMismatch: true,
      message: `From (${fromEmail}) and Reply-To (${replyToEmail}) domains differ`,
      fromEmail,
      replyToEmail,
      severity: "medium",
    };
  }

  if (fromEmail !== replyToEmail) {
    return {
      hasMismatch: true,
      message: `From (${fromEmail}) and Reply-To (${replyToEmail}) addresses differ`,
      fromEmail,
      replyToEmail,
      severity: "low",
    };
  }

  return {
    hasMismatch: false,
    message: "From and Reply-To addresses match",
  };
}

/**
 * Detects suspicious headers that might indicate spoofing
 */
function detectSuspiciousHeaders(headers) {
  const suspicious = [];

  // Check for X-Mailer spoofing
  const xMailer = headers["x-mailer"] || headers["X-Mailer"];
  if (xMailer && /phpmailer|mailgun|sendgrid/i.test(xMailer)) {
    const from = headers["from"] || headers["From"];
    if (from && !/(automated|noreply|no-reply)/i.test(from)) {
      suspicious.push({
        header: "X-Mailer",
        value: xMailer,
        reason: "Automated mailer used for apparently personal email",
      });
    }
  }

  // Check for suspicious Received headers (too few hops)
  const received = headers["received"] || headers["Received"];
  if (received) {
    const receivedArray = Array.isArray(received) ? received : [received];
    if (receivedArray.length < 2) {
      suspicious.push({
        header: "Received",
        value: receivedArray.length,
        reason: "Unusually few mail server hops detected",
      });
    }
  }

  // Check for mismatched Message-ID domain
  const messageId = headers["message-id"] || headers["Message-ID"];
  const from = headers["from"] || headers["From"];
  if (messageId && from) {
    const messageIdDomain = extractDomain(messageId);
    const fromDomain = extractDomain(from);

    if (messageIdDomain && fromDomain && messageIdDomain !== fromDomain) {
      suspicious.push({
        header: "Message-ID",
        value: messageId,
        reason: `Message-ID domain (${messageIdDomain}) differs from From domain (${fromDomain})`,
      });
    }
  }

  // Check for suspicious Date headers (future dates or very old)
  const date = headers["date"] || headers["Date"];
  if (date) {
    const emailDate = new Date(date);
    const now = new Date();
    const daysDiff = (now - emailDate) / (1000 * 60 * 60 * 24);

    if (emailDate > now) {
      suspicious.push({
        header: "Date",
        value: date,
        reason: "Email date is in the future",
      });
    } else if (daysDiff > 30) {
      suspicious.push({
        header: "Date",
        value: date,
        reason: "Email is unusually old (>30 days)",
      });
    }
  }

  return suspicious;
}

/**
 * Extracts email address from a header string
 */
function extractEmail(headerValue) {
  if (!headerValue) return null;

  // Match email in angle brackets or standalone
  const match = headerValue.match(/<([^>]+)>|([^\s<>]+@[^\s<>]+)/);
  return match ? match[1] || match[2] : headerValue.trim();
}

/**
 * Extracts domain from an email address
 */
function extractDomain(email) {
  if (!email) return null;

  const match = email.match(/@([^\s>]+)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Generates a human-readable summary of the analysis
 */
export function generateEmailHeaderSummary(analysisResult) {
  const { overallRisk, issues, warnings, passed } = analysisResult;

  let summary = "";

  if (overallRisk >= 7) {
    summary =
      "🚨 HIGH RISK: This email shows multiple signs of potential spoofing or phishing. ";
  } else if (overallRisk >= 4) {
    summary =
      "⚠️ SUSPICIOUS: This email has some concerning authentication issues. ";
  } else if (overallRisk >= 2) {
    summary = "⚡ CAUTION: Some authentication checks could not be verified. ";
  } else {
    summary = "✅ LOOKS SAFE: Email authentication checks passed. ";
  }

  if (issues.length > 0) {
    summary += `Issues found: ${issues.length}. `;
  }
  if (warnings.length > 0) {
    summary += `Warnings: ${warnings.length}. `;
  }
  if (passed.length > 0) {
    summary += `Passed checks: ${passed.length}.`;
  }

  return summary;
}
