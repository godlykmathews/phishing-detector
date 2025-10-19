// Email header extractor for common webmail interfaces
// This content script extracts email headers from Gmail, Outlook, Yahoo Mail, etc.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractEmailHeaders") {
    try {
      const emailData = extractEmailHeaders();
      sendResponse({ success: true, data: emailData });
    } catch (error) {
      console.error("Error extracting email headers:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Required for async response
});

function extractEmailHeaders() {
  const url = window.location.href;
  const domain = window.location.hostname;

  // Detect email provider
  let provider = "unknown";
  let headers = {};
  let emailContent = {};

  if (domain.includes("mail.google.com")) {
    provider = "gmail";
    const result = extractGmailHeaders();
    headers = result.headers;
    emailContent = result.content;
  } else if (
    domain.includes("outlook.live.com") ||
    domain.includes("outlook.office.com")
  ) {
    provider = "outlook";
    const result = extractOutlookHeaders();
    headers = result.headers;
    emailContent = result.content;
  } else if (domain.includes("mail.yahoo.com")) {
    provider = "yahoo";
    const result = extractYahooHeaders();
    headers = result.headers;
    emailContent = result.content;
  } else {
    // Try generic extraction
    const result = extractGenericHeaders();
    headers = result.headers;
    emailContent = result.content;
  }

  return {
    provider,
    headers,
    emailContent,
    url,
    timestamp: Date.now(),
  };
}

function extractGmailHeaders() {
  const headers = {};
  const content = {};

  // Extract visible email information
  try {
    // From address - Gmail displays this prominently
    const fromElement = document.querySelector("[email]");
    if (fromElement) {
      const email = fromElement.getAttribute("email");
      const name =
        fromElement.getAttribute("name") || fromElement.textContent.trim();
      headers["From"] = name ? `${name} <${email}>` : email;
      content.fromEmail = email;
      content.fromName = name;
    }

    // Alternative: Look for email in span with email attribute
    if (!headers["From"]) {
      const emailSpan = document.querySelector("span[email]");
      if (emailSpan) {
        headers["From"] = emailSpan.getAttribute("email");
        content.fromEmail = emailSpan.getAttribute("email");
      }
    }

    // Subject
    const subjectElement = document.querySelector("h2[data-legacy-thread-id]");
    if (subjectElement) {
      headers["Subject"] = subjectElement.textContent.trim();
      content.subject = subjectElement.textContent.trim();
    }

    // Date
    const dateElement = document.querySelector("span[data-tooltip]");
    if (dateElement) {
      headers["Date"] =
        dateElement.getAttribute("data-tooltip") ||
        dateElement.textContent.trim();
      content.date =
        dateElement.getAttribute("data-tooltip") ||
        dateElement.textContent.trim();
    }

    // To address
    const toElement = document.querySelector(".g3[email]");
    if (toElement) {
      headers["To"] = toElement.getAttribute("email");
      content.toEmail = toElement.getAttribute("email");
    }

    // Try to get "Show original" data if available
    // Note: This requires user to click "Show original" first
    const originalTextElement = document.querySelector("pre");
    if (
      originalTextElement &&
      originalTextElement.textContent.includes("Received:")
    ) {
      parseRawHeaders(originalTextElement.textContent, headers);
    }
  } catch (error) {
    console.error("Error extracting Gmail headers:", error);
  }

  return { headers, content };
}

function extractOutlookHeaders() {
  const headers = {};
  const content = {};

  try {
    // From address
    const fromElement =
      document.querySelector('[aria-label*="From"]') ||
      document.querySelector(".ReadingPaneWrapper_SenderContainer");
    if (fromElement) {
      headers["From"] = fromElement.textContent.trim();
      content.fromEmail = extractEmailFromText(fromElement.textContent);
    }

    // Subject
    const subjectElement =
      document.querySelector('[aria-label*="Subject"]') ||
      document.querySelector(".ReadingPaneWrapper_SubjectContainer");
    if (subjectElement) {
      headers["Subject"] = subjectElement.textContent.trim();
      content.subject = subjectElement.textContent.trim();
    }

    // Date
    const dateElement = document.querySelector('[aria-label*="Sent"]');
    if (dateElement) {
      headers["Date"] = dateElement.textContent.trim();
      content.date = dateElement.textContent.trim();
    }

    // To address
    const toElement = document.querySelector('[aria-label*="To"]');
    if (toElement) {
      headers["To"] = toElement.textContent.trim();
      content.toEmail = extractEmailFromText(toElement.textContent);
    }
  } catch (error) {
    console.error("Error extracting Outlook headers:", error);
  }

  return { headers, content };
}

function extractYahooHeaders() {
  const headers = {};
  const content = {};

  try {
    // From address
    const fromElement = document.querySelector('[data-test-id="message-from"]');
    if (fromElement) {
      headers["From"] = fromElement.textContent.trim();
      content.fromEmail = extractEmailFromText(fromElement.textContent);
    }

    // Subject
    const subjectElement = document.querySelector(
      '[data-test-id="message-subject"]'
    );
    if (subjectElement) {
      headers["Subject"] = subjectElement.textContent.trim();
      content.subject = subjectElement.textContent.trim();
    }

    // Date
    const dateElement = document.querySelector('[data-test-id="message-date"]');
    if (dateElement) {
      headers["Date"] = dateElement.textContent.trim();
      content.date = dateElement.textContent.trim();
    }

    // To address
    const toElement = document.querySelector('[data-test-id="message-to"]');
    if (toElement) {
      headers["To"] = toElement.textContent.trim();
      content.toEmail = extractEmailFromText(toElement.textContent);
    }
  } catch (error) {
    console.error("Error extracting Yahoo headers:", error);
  }

  return { headers, content };
}

function extractGenericHeaders() {
  const headers = {};
  const content = {};

  try {
    // Try to find common patterns for email headers
    const text = document.body.innerText;

    // Look for From:
    const fromMatch = text.match(/From:\s*(.+?)(?:\n|$)/i);
    if (fromMatch) {
      headers["From"] = fromMatch[1].trim();
      content.fromEmail = extractEmailFromText(fromMatch[1]);
    }

    // Look for Subject:
    const subjectMatch = text.match(/Subject:\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      headers["Subject"] = subjectMatch[1].trim();
      content.subject = subjectMatch[1].trim();
    }

    // Look for Date:
    const dateMatch = text.match(/Date:\s*(.+?)(?:\n|$)/i);
    if (dateMatch) {
      headers["Date"] = dateMatch[1].trim();
      content.date = dateMatch[1].trim();
    }

    // Look for To:
    const toMatch = text.match(/To:\s*(.+?)(?:\n|$)/i);
    if (toMatch) {
      headers["To"] = toMatch[1].trim();
      content.toEmail = extractEmailFromText(toMatch[1]);
    }

    // Look for Reply-To:
    const replyToMatch = text.match(/Reply-To:\s*(.+?)(?:\n|$)/i);
    if (replyToMatch) {
      headers["Reply-To"] = replyToMatch[1].trim();
    }
  } catch (error) {
    console.error("Error extracting generic headers:", error);
  }

  return { headers, content };
}

function parseRawHeaders(rawText, headers) {
  // Parse raw email headers from "Show original" view
  const lines = rawText.split("\n");
  let currentHeader = null;

  for (const line of lines) {
    if (line.match(/^[A-Za-z-]+:/)) {
      // New header line
      const colonIndex = line.indexOf(":");
      const headerName = line.substring(0, colonIndex);
      const headerValue = line.substring(colonIndex + 1).trim();
      headers[headerName] = headerValue;
      currentHeader = headerName;
    } else if (
      (currentHeader && line.startsWith(" ")) ||
      line.startsWith("\t")
    ) {
      // Continuation of previous header
      headers[currentHeader] += " " + line.trim();
    }
  }
}

function extractEmailFromText(text) {
  const match = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1] : text;
}

// Provide instructions to users on how to access full headers
function getHeaderInstructions(provider) {
  const instructions = {
    gmail:
      "To view full email headers in Gmail:\n1. Open the email\n2. Click the three dots menu (⋮)\n3. Select 'Show original'\n4. Copy all the header information\n5. Use the 'Analyze Headers' feature",
    outlook:
      "To view full email headers in Outlook:\n1. Open the email\n2. Click the three dots menu (...)\n3. Select 'View message source'\n4. Copy the header information\n5. Use the 'Analyze Headers' feature",
    yahoo:
      "To view full email headers in Yahoo:\n1. Open the email\n2. Click 'More' (three dots)\n3. Select 'View raw message'\n4. Copy the header information\n5. Use the 'Analyze Headers' feature",
    unknown:
      "To analyze full email headers:\n1. Access your email's 'View Source' or 'Show Original' option\n2. Copy all header information\n3. Use the 'Analyze Headers' feature",
  };

  return instructions[provider] || instructions.unknown;
}
