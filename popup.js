document.addEventListener("DOMContentLoaded", () => {
  // Page Analysis Elements
  const analyzeBtn = document.getElementById("analyzeBtn");
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");
  const status = document.getElementById("status");
  const score = document.getElementById("score");
  const statusText = document.getElementById("status-text");
  const explanation = document.getElementById("explanation");

  // Email Header Analysis Elements
  const analyzeEmailBtn = document.getElementById("analyzeEmailBtn");
  const headerInput = document.getElementById("headerInput");
  const emailLoading = document.getElementById("email-loading");
  const emailResult = document.getElementById("email-result");
  const emailStatus = document.getElementById("email-status");
  const emailScore = document.getElementById("email-score");
  const emailStatusText = document.getElementById("email-status-text");
  const emailSummary = document.getElementById("email-summary");
  const emailDetails = document.getElementById("email-details");

  // Tab Switching
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active content
      tabContents.forEach((content) => content.classList.remove("active"));
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });

  // Check if we have cached results for current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    chrome.storage.local.get([currentUrl], (result) => {
      if (result[currentUrl]) {
        displayResult(result[currentUrl]);
      }
    });
  });

  // Page Analysis
  analyzeBtn.addEventListener("click", () => {
    analyzePage();
  });

  // Email Header Analysis
  analyzeEmailBtn.addEventListener("click", () => {
    analyzeEmailHeaders();
  });

  function analyzePage() {
    console.log("Starting analysis...");
    loading.style.display = "block";
    result.style.display = "none";
    analyzeBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      console.log("Current tab:", tabs[0]);

      // 1. Inject the content script into the active tab
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["content.js"],
        },
        () => {
          // 2. After injection, send the message
          chrome.tabs.sendMessage(
            tabId,
            { action: "extractPageData" },
            (response) => {
              console.log("Content script response:", response);
              if (chrome.runtime.lastError) {
                // This will catch the "receiving end does not exist" error
                console.error(
                  "Could not connect to content script:",
                  chrome.runtime.lastError.message
                );
                displayError();
                loading.style.display = "none";
                analyzeBtn.disabled = false;
                return;
              }

              if (response && response.success) {
                analyzeWithGemini(response.data)
                  .then((analysisResult) => {
                    console.log("Analysis result:", analysisResult);
                    chrome.storage.local.set({ [tabs[0].url]: analysisResult });
                    displayResult(analysisResult);
                  })
                  .catch((error) => {
                    console.error("Analysis failed:", error);
                    displayError();
                  })
                  .finally(() => {
                    loading.style.display = "none";
                    analyzeBtn.disabled = false;
                  });
              } else {
                console.error("Content script error:", response);
                loading.style.display = "none";
                analyzeBtn.disabled = false;
                displayError();
              }
            }
          );
        }
      );
    });
  }

  async function analyzeWithGemini(pageData) {
    try {
      console.log(
        ">>> [EXTENSION-DEBUG] Preparing to send request to server..."
      );
      const response = await fetch(
        "http://localhost:3001/api/analyze-phishing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pageData),
        }
      );

      console.log("<<< [EXTENSION-DEBUG] Received a response from the server.");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received response:", data);
      return data;
    } catch (error) {
      console.error(
        "XXX [EXTENSION-DEBUG] The request from the extension to the server FAILED. The server is likely offline or unreachable.",
        error.message
      );
      throw error;
    }
  }

  function displayResult(analysisResult) {
    result.style.display = "block";

    const phishingScore = analysisResult.phishingScore;
    score.textContent = `${phishingScore}/10`;
    explanation.textContent = analysisResult.explanation;

    // Set status based on score
    status.className = "status";
    if (phishingScore <= 3) {
      status.classList.add("safe");
      statusText.textContent = "Likely Safe";
    } else if (phishingScore <= 6) {
      status.classList.add("warning");
      statusText.textContent = "Suspicious";
    } else {
      status.classList.add("danger");
      statusText.textContent = "High Risk";
    }
  }

  function displayError() {
    result.style.display = "block";
    status.className = "status warning";
    score.textContent = "?";
    statusText.textContent = "Analysis Failed";
    explanation.textContent =
      "Unable to analyze this page. Please check your connection and try again.";
  }

  // Email Header Analysis Functions
  function analyzeEmailHeaders() {
    const headerText = headerInput.value.trim();

    if (!headerText) {
      alert("Please paste email headers to analyze");
      return;
    }

    emailLoading.style.display = "block";
    emailResult.style.display = "none";
    analyzeEmailBtn.disabled = true;

    // Parse headers from text input
    const headers = parseEmailHeaders(headerText);

    analyzeHeadersWithServer(headers)
      .then((analysisResult) => {
        console.log("Email header analysis result:", analysisResult);
        displayEmailResult(analysisResult);
      })
      .catch((error) => {
        console.error("Email header analysis failed:", error);
        displayEmailError();
      })
      .finally(() => {
        emailLoading.style.display = "none";
        analyzeEmailBtn.disabled = false;
      });
  }

  function parseEmailHeaders(headerText) {
    const headers = {};
    const lines = headerText.split("\n");
    let currentHeader = null;
    let currentValue = "";

    for (const line of lines) {
      // Check if line starts a new header (contains a colon not in a value)
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
        // Save previous header if exists
        if (currentHeader) {
          headers[currentHeader] = currentValue.trim();
        }
        // Start new header
        currentHeader = line.substring(0, colonIndex).trim();
        currentValue = line.substring(colonIndex + 1).trim();
      } else if (
        currentHeader &&
        (line.startsWith(" ") || line.startsWith("\t"))
      ) {
        // Continuation of previous header
        currentValue += " " + line.trim();
      } else if (currentHeader && line.trim()) {
        // Another line of the current header
        currentValue += " " + line.trim();
      }
    }

    // Save last header
    if (currentHeader) {
      headers[currentHeader] = currentValue.trim();
    }

    return headers;
  }

  async function analyzeHeadersWithServer(headers) {
    try {
      console.log(
        ">>> [EXTENSION-DEBUG] Sending headers to server for analysis..."
      );
      const response = await fetch(
        "http://localhost:3001/api/analyze-email-headers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ headers }),
        }
      );

      console.log("<<< [EXTENSION-DEBUG] Received response from server.");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Email header analysis response:", data);
      return data;
    } catch (error) {
      console.error(
        "XXX [EXTENSION-DEBUG] Email header analysis request failed:",
        error.message
      );
      throw error;
    }
  }

  function displayEmailResult(analysisResult) {
    emailResult.style.display = "block";

    const risk =
      analysisResult.overallRisk || analysisResult.headerAnalysis.overallRisk;
    emailScore.textContent = `${risk}/10`;
    emailSummary.textContent = analysisResult.summary || "Analysis completed";

    // Set status based on risk score
    emailStatus.className = "status";
    if (risk <= 3) {
      emailStatus.classList.add("safe");
      emailStatusText.textContent = "Likely Legitimate";
    } else if (risk <= 6) {
      emailStatus.classList.add("warning");
      emailStatusText.textContent = "Suspicious";
    } else {
      emailStatus.classList.add("danger");
      emailStatusText.textContent = "High Risk - Possible Spoofing";
    }

    // Display detailed results
    const details = analysisResult.headerAnalysis;
    let detailsHtml = "";

    // Authentication Results
    detailsHtml += '<div class="detail-item">';
    detailsHtml += '<div class="detail-label">🔐 Authentication Results</div>';
    detailsHtml += '<div class="detail-value">';

    if (details.details.dkim) {
      const dkimBadge =
        details.details.dkim.status === "pass"
          ? "badge-success"
          : details.details.dkim.status === "fail"
          ? "badge-danger"
          : "badge-warning";
      detailsHtml += `<span class="badge ${dkimBadge}">DKIM: ${details.details.dkim.status}</span>`;
    }

    if (details.details.spf) {
      const spfBadge =
        details.details.spf.status === "pass"
          ? "badge-success"
          : details.details.spf.status === "fail"
          ? "badge-danger"
          : "badge-warning";
      detailsHtml += `<span class="badge ${spfBadge}">SPF: ${details.details.spf.status}</span>`;
    }

    if (details.details.dmarc) {
      const dmarcBadge =
        details.details.dmarc.status === "pass"
          ? "badge-success"
          : details.details.dmarc.status === "fail"
          ? "badge-danger"
          : "badge-warning";
      detailsHtml += `<span class="badge ${dmarcBadge}">DMARC: ${details.details.dmarc.status}</span>`;
    }

    detailsHtml += "</div></div>";

    // Issues
    if (details.issues && details.issues.length > 0) {
      detailsHtml += '<div class="detail-item">';
      detailsHtml += '<div class="detail-label">❌ Issues Found</div>';
      detailsHtml += '<div class="detail-value">';
      details.issues.forEach((issue) => {
        detailsHtml += `<div>• ${issue}</div>`;
      });
      detailsHtml += "</div></div>";
    }

    // Warnings
    if (details.warnings && details.warnings.length > 0) {
      detailsHtml += '<div class="detail-item">';
      detailsHtml += '<div class="detail-label">⚠️ Warnings</div>';
      detailsHtml += '<div class="detail-value">';
      details.warnings.forEach((warning) => {
        detailsHtml += `<div>• ${warning}</div>`;
      });
      detailsHtml += "</div></div>";
    }

    // AI Insights
    if (analysisResult.aiInsights) {
      detailsHtml += '<div class="detail-item">';
      detailsHtml +=
        '<div class="detail-label">🤖 AI Security Assessment</div>';
      detailsHtml += `<div class="detail-value">${analysisResult.aiInsights}</div>`;
      detailsHtml += "</div>";
    }

    // Passed Checks
    if (details.passed && details.passed.length > 0) {
      detailsHtml += '<div class="detail-item">';
      detailsHtml += '<div class="detail-label">✅ Passed Checks</div>';
      detailsHtml += '<div class="detail-value">';
      details.passed.forEach((check) => {
        detailsHtml += `<div>• ${check}</div>`;
      });
      detailsHtml += "</div></div>";
    }

    emailDetails.innerHTML = detailsHtml;
  }

  function displayEmailError() {
    emailResult.style.display = "block";
    emailStatus.className = "status warning";
    emailScore.textContent = "?";
    emailStatusText.textContent = "Analysis Failed";
    emailSummary.textContent =
      "Unable to analyze email headers. Please check your connection and try again.";
    emailDetails.innerHTML = "";
  }
});
