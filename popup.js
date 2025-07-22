document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn")
  const loading = document.getElementById("loading")
  const result = document.getElementById("result")
  const status = document.getElementById("status")
  const score = document.getElementById("score")
  const statusText = document.getElementById("status-text")
  const explanation = document.getElementById("explanation")

  // Check if we have cached results for current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url
    chrome.storage.local.get([currentUrl], (result) => {
      if (result[currentUrl]) {
        displayResult(result[currentUrl])
      }
    })
  })

  analyzeBtn.addEventListener("click", () => {
    analyzePage()
  })

  function analyzePage() {
    console.log("Starting analysis...")
    loading.style.display = "block"
    result.style.display = "none"
    analyzeBtn.disabled = true

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      console.log("Current tab:", tabs[0])

      // 1. Inject the content script into the active tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        // 2. After injection, send the message
        chrome.tabs.sendMessage(tabId, { action: "extractPageData" }, (response) => {
          console.log("Content script response:", response)
          if (chrome.runtime.lastError) {
            // This will catch the "receiving end does not exist" error
            console.error("Could not connect to content script:", chrome.runtime.lastError.message);
            displayError();
            loading.style.display = "none"
            analyzeBtn.disabled = false
            return;
          }

          if (response && response.success) {
            analyzeWithGemini(response.data)
              .then((analysisResult) => {
                console.log("Analysis result:", analysisResult)
                chrome.storage.local.set({ [tabs[0].url]: analysisResult })
                displayResult(analysisResult)
              })
              .catch((error) => {
                console.error("Analysis failed:", error)
                displayError()
              })
              .finally(() => {
                loading.style.display = "none"
                analyzeBtn.disabled = false
              })
          } else {
            console.error("Content script error:", response)
            loading.style.display = "none"
            analyzeBtn.disabled = false
            displayError()
          }
        });
      });
    });
  }

  async function analyzeWithGemini(pageData) {
    try {
      console.log('>>> [EXTENSION-DEBUG] Preparing to send request to server...');
      const response = await fetch("http://localhost:3001/api/analyze-phishing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      });

      console.log('<<< [EXTENSION-DEBUG] Received a response from the server.');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      return data;
    } catch (error) {
      console.error("XXX [EXTENSION-DEBUG] The request from the extension to the server FAILED. The server is likely offline or unreachable.", error.message);
      throw error;
    }
  }

  function displayResult(analysisResult) {
    result.style.display = "block"

    const phishingScore = analysisResult.phishingScore
    score.textContent = `${phishingScore}/10`
    explanation.textContent = analysisResult.explanation

    // Set status based on score
    status.className = "status"
    if (phishingScore <= 3) {
      status.classList.add("safe")
      statusText.textContent = "Likely Safe"
    } else if (phishingScore <= 6) {
      status.classList.add("warning")
      statusText.textContent = "Suspicious"
    } else {
      status.classList.add("danger")
      statusText.textContent = "High Risk"
    }
  }

  function displayError() {
    result.style.display = "block"
    status.className = "status warning"
    score.textContent = "?"
    statusText.textContent = "Analysis Failed"
    explanation.textContent = "Unable to analyze this page. Please check your connection and try again."
  }
})
