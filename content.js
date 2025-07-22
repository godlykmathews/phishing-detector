// Content script to extract page data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractPageData") {
    try {
      const pageData = extractPageData()
      sendResponse({ success: true, data: pageData })
    } catch (error) {
      console.error("Error extracting page data:", error)
      sendResponse({ success: false, error: error.message })
    }
  }
  return true // Required for async response
})

function extractPageData() {
  const url = window.location.href
  const title = document.title
  const domain = window.location.hostname

  // Extract visible text content
  const textContent = document.body.innerText.substring(0, 5000) // Limit to 5000 chars

  // Extract form details
  const forms = Array.from(document.querySelectorAll("form")).map((form) => {
    const inputs = Array.from(form.querySelectorAll("input, select, textarea")).map((input) => ({
      type: input.type || input.tagName.toLowerCase(),
      name: input.name || "",
      placeholder: input.placeholder || "",
      required: input.required || false,
    }))

    return {
      action: form.action || "",
      method: form.method || "get",
      inputs: inputs,
    }
  })

  // Extract links
  const links = Array.from(document.querySelectorAll("a[href]"))
    .slice(0, 20) // Limit to first 20 links
    .map((link) => ({
      href: link.href,
      text: link.textContent.trim().substring(0, 100),
    }))

  // Check for suspicious elements
  const suspiciousElements = {
    hasPasswordField: document.querySelector('input[type="password"]') !== null,
    hasLoginForm: document.querySelector('form input[type="password"]') !== null,
    hasSSLIndicators: document.querySelector('[class*="ssl"], [class*="secure"], [id*="ssl"], [id*="secure"]') !== null,
    hasUrgentLanguage: /urgent|immediate|expire|suspend|verify|confirm|update.*payment/i.test(textContent),
    hasExternalLinks: links.some((link) => !link.href.includes(domain)),
  }

  return {
    url,
    title,
    domain,
    textContent,
    forms,
    links,
    suspiciousElements,
    timestamp: Date.now(),
  }
}
