import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

// 1. In-memory Server Cache (expires every 10 minutes)
interface CacheEntry {
  reply: string
  timestamp: number
}
const RESPONSE_CACHE: Record<string, CacheEntry> = {}
const CACHE_TTL_MS = 10 * 60 * 1000

// 2. In-memory Rate Limiter (Max 5 requests per minute per user)
const rateLimitMap: Record<string, number[]> = {}
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    
    const body = await request.json()

    // Handle sync-insights action
    if (body.action === "sync-insights") {
      const { insights } = body
      if (!insights || !Array.isArray(insights)) {
        return NextResponse.json({ error: "Missing insights array" }, { status: 400 })
      }
      
      const logId = Date.now().toString()
      await dbWrite(`users/${userId}/insightLogs/${logId}`, {
        content: insights.join(" | "),
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ success: true })
    }

    // Check credentials
    const apiKey = process.env.LLAMA_API_KEY
    const apiUrl = process.env.LLAMA_API_URL || "https://api.llama-provider.com/v1"

    if (!apiKey || apiUrl.includes("placeholder-url")) {
      return NextResponse.json(
        { error: "AI Coach is currently offline. Llama credentials are unconfigured." },
        { status: 503 }
      )
    }

    const { question, history } = body
    const validQuestion = (question || "").trim()

    if (!validQuestion) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Rate Limiting Check
    const now = Date.now()
    if (!rateLimitMap[userId]) {
      rateLimitMap[userId] = []
    }
    // Filter out timestamps outside the window
    rateLimitMap[userId] = rateLimitMap[userId].filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
    if (rateLimitMap[userId].length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a minute before retrying. 🍃" },
        { status: 429 }
      )
    }
    rateLimitMap[userId].push(now)

    // Cache Lookup (Only for single questions, skip cache if history context exists)
    const cacheKey = `${userId}:${validQuestion}`
    const hasHistory = Array.isArray(history) && history.length > 0
    if (!hasHistory && RESPONSE_CACHE[cacheKey]) {
      const cached = RESPONSE_CACHE[cacheKey]!
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ reply: cached.reply, cached: true })
      }
      delete RESPONSE_CACHE[cacheKey]
    }

    // Context Builder (Fetch user profile & completions from RTDB in a single query)
    const user = await dbRead<any>(`users/${userId}`)
    if (!user) {
      throw new Error("Failed to fetch user context for AI Coach.")
    }

    const completedCount = Object.keys(user.completedMissions || {}).length

    const userContext = {
      level: user.level || 1,
      streak: user.streak || 0,
      completedCount,
      travelHabit: user.travelType || user.travel_type || "not specified",
      acUsage: user.acUsage || user.ac_usage || "sometimes",
      dietPreference: user.foodType || user.food_type || "mixed",
    }

    // Prompt Builder Pipeline
    const systemPrompt = `You are Green Hero's AI Sustainability Coach. Speak in a friendly, encouraging, and human-like voice.
Your goal is to help users understand carbon saving, improve their daily routines, and stay motivated without feeling guilty.
Keep explanations extremely short and simple (under 2-3 sentences max). Use formatting like emojis where appropriate.
Avoid complex carbon reports and technical language.

User Profile Context:
- Current Level: ${userContext.level}
- Active Streak: ${userContext.streak} days
- Total Completed Missions: ${userContext.completedCount}
- Travel Habit: ${userContext.travelHabit}
- AC Usage: ${userContext.acUsage}
- Diet Preference: ${userContext.dietPreference}`

    // Map history turns to OpenAI format (Keep last 5 turns for context to fit token limit)
    const formattedHistory = hasHistory
      ? history.slice(-5).map((turn: any) => ({
          role: turn.sender === "user" ? "user" : "assistant",
          content: turn.text,
        }))
      : []

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: validQuestion }
    ]

    // Call Llama endpoint
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 1.0,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      throw new Error(`Llama API responded with status ${response.status}`)
    }

    const json = await response.json()
    const reply = json.choices?.[0]?.message?.content || "I'm having trouble speaking. Let's try again in a bit!"
    const usage = json.usage || {}

    // Cache the response if it was a single query without history
    if (!hasHistory) {
      RESPONSE_CACHE[cacheKey] = {
        reply,
        timestamp: now,
      }
    }

    // Response Storage (Sync/Save to Firebase insight logs with token usage tracking)
    const logId = Date.now().toString()
    await dbWrite(`users/${userId}/insightLogs/${logId}`, {
      content: `Chat Question: ${validQuestion} | Coach Answer: ${reply}`,
      timestamp: new Date().toISOString(),
      tokenUsage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      }
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("API /api/ai-coach POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
