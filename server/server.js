import 'dotenv/config'
import express from "express"
import cors from "cors"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}))
app.use(express.json({ limit: "10mb" }))

// Add detailed logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  })
  next()
})

app.post("/api/analyze-phishing", async (req, res) => {
  try {
    const pageData = req.body
    const analysisPrompt = createAnalysisPrompt(pageData)

    // Generate analysis using Gemini
    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    const analysis = parseGeminiResponse(text)
    res.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    res.status(500).json({
      error: "Analysis failed",
      phishingScore: 5,
      explanation: "Unable to complete analysis due to server error.",
    })
  }
})

function createAnalysisPrompt(pageData) {
  return `You are a cybersecurity expert analyzing a webpage for phishing indicators. 

Analyze the following webpage data and provide a phishing risk assessment:

URL: ${pageData.url}
Domain: ${pageData.domain}
Title: ${pageData.title}

Page Content (first 1000 chars): ${pageData.textContent.substring(0, 1000)}

Forms Found: ${JSON.stringify(pageData.forms, null, 2)}

Links (sample): ${JSON.stringify(pageData.links.slice(0, 5), null, 2)}

Suspicious Elements:
- Has password field: ${pageData.suspiciousElements.hasPasswordField}
- Has login form: ${pageData.suspiciousElements.hasLoginForm}
- Has SSL indicators: ${pageData.suspiciousElements.hasSSLIndicators}
- Has urgent language: ${pageData.suspiciousElements.hasUrgentLanguage}
- Has external links: ${pageData.suspiciousElements.hasExternalLinks}

Please analyze this data and respond with EXACTLY this format:

SCORE: [number from 0-10, where 0 is completely safe and 10 is definitely phishing]
EXPLANATION: [2-3 sentence explanation of your assessment, focusing on specific indicators you found]

Consider these factors:
1. Domain legitimacy and spelling
2. Presence of login/payment forms on suspicious domains
3. Urgent or threatening language
4. SSL/security indicators
5. Overall content quality and professionalism
6. Suspicious form fields or data collection
7. External links and redirects

Be concise but specific about what made you assign this score.`
}

function parseGeminiResponse(text) {
  try {
    // Extract score and explanation from Gemini response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i)
    const explanationMatch = text.match(/EXPLANATION:\s*(.+)/is)

    const phishingScore = scoreMatch ? Number.parseInt(scoreMatch[1]) : 5
    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : "Analysis completed but response format was unexpected."

    return {
      phishingScore: Math.min(Math.max(phishingScore, 0), 10), // Ensure score is 0-10
      explanation: explanation.substring(0, 500), // Limit explanation length
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error)
    return {
      phishingScore: 5,
      explanation: "Analysis completed but there was an error processing the results.",
    }
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Phishing detection server running on port ${PORT}`)
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log("✅ GOOGLE_GENERATIVE_AI_API_KEY loaded successfully.")
  } else {
    console.error("❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY is not set! Make sure you have a .env file in the /server directory.")
  }
})
