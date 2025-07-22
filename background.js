// Background script for Chrome extension
const chrome = window.chrome // Declare the chrome variable

chrome.runtime.onInstalled.addListener(() => {
  console.log("Phishing Detector extension installed")
})

// Listen for tab updates to clear cache when navigating
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Clear old cached results (keep only last 10)
    chrome.storage.local.get(null, (items) => {
      const keys = Object.keys(items)
      if (keys.length > 10) {
        const oldKeys = keys.slice(0, keys.length - 10)
        chrome.storage.local.remove(oldKeys)
      }
    })
  }
})
