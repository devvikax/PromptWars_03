import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite, dbUpdate } from "@/lib/firebase-server"
import { buildUserAIContext } from "@/services/ai-coach/context"
import { buildCoachingPrompt, buildStreakRescuePrompt, buildProgressReviewPrompt } from "@/services/ai-coach/prompts"
import { getActiveProvider } from "@/services/ai-coach/providers"
import { generateAIPersonalizedMissions } from "@/services/ai-coach/mission-engine"
import { getCoachResponse } from "@/services/llm-coach-service"

// 1. In-memory Cache layer for daily insights / repeated questions
interface CacheEntry {
  reply: string
  timestamp: number
}
const RESPONSE_CACHE: Record<string, CacheEntry> = {}
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 mins

// 2. In-memory Rate Limiter
const rateLimitMap: Record<string, number[]> = {}
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 10

// Verify rate limit helper
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  if (!rateLimitMap[userId]) {
    rateLimitMap[userId] = []
  }
  rateLimitMap[userId] = rateLimitMap[userId].filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
  if (rateLimitMap[userId].length >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  rateLimitMap[userId].push(now)
  return true
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "list-conversations") {
      const conversations = await dbRead<Record<string, any>>(`users/${userId}/ai_coach/conversations`)
      const list = conversations ? Object.values(conversations) : []
      return NextResponse.json({ conversations: list })
    }

    if (action === "get-messages") {
      const conversationId = searchParams.get("conversationId")
      if (!conversationId) {
        return NextResponse.json({ error: "Missing conversationId" }, { status: 400 })
      }
      const messages = await dbRead<Record<string, any>>(`users/${userId}/ai_coach/messages/${conversationId}`)
      const list = messages ? Object.values(messages) : []
      return NextResponse.json({ messages: list })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("API /api/ai-coach GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    
    const body = await request.json()
    const { action } = body

    // 1. Action: create-conversation
    if (action === "create-conversation") {
      const conversationId = Date.now().toString()
      const title = body.title || `Chat Thread ${new Date().toLocaleDateString()}`
      
      const newConv = {
        id: conversationId,
        title,
        createdAt: new Date().toISOString(),
      }
      await dbWrite(`users/${userId}/ai_coach/conversations/${conversationId}`, newConv)
      return NextResponse.json({ conversation: newConv })
    }

    // 2. Action: submit-feedback (Message Rating feedback)
    if (action === "submit-feedback") {
      const { messageText, type } = body
      if (!messageText || !type) {
        return NextResponse.json({ error: "Missing messageText or type" }, { status: 400 })
      }
      const feedbackId = Date.now().toString()
      const feedback = {
        id: feedbackId,
        messageText,
        type, // 'up' | 'down'
        timestamp: new Date().toISOString(),
      }
      await dbWrite(`users/${userId}/ai_coach/feedback/${feedbackId}`, feedback)
      return NextResponse.json({ success: true })
    }

    // 3. Action: generate-missions
    if (action === "generate-missions") {
      const latencyStart = Date.now()
      const proposals = await generateAIPersonalizedMissions(userId)
      const latencyMs = Date.now() - latencyStart

      // Write recommendations to DB
      const recId = Date.now().toString()
      await dbWrite(`users/${userId}/ai_coach/recommendations/${recId}`, {
        id: recId,
        missions: proposals,
        timestamp: new Date().toISOString()
      })

      // Log telemetry event
      await dbWrite(`users/${userId}/ai_coach/analytics/${recId}`, {
        id: recId,
        action: "generate-missions",
        latencyMs,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({ missions: proposals })
    }

    // 4. Action: sync-insights (legacy support)
    if (action === "sync-insights") {
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

    // Default Action: ask-coach
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a minute before retrying. 🍃" },
        { status: 429 }
      )
    }

    const { question, history, conversationId, subAction } = body
    const validQuestion = (question || "").trim()

    if (!validQuestion) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const activeConversationId = conversationId || "default_chat"
    const hasHistory = Array.isArray(history) && history.length > 0
    const now = Date.now()
    const cacheKey = `${userId}:${validQuestion}`

    // Cache Lookup for repeating questions
    if (!hasHistory && !subAction && RESPONSE_CACHE[cacheKey]) {
      const cached = RESPONSE_CACHE[cacheKey]!
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ reply: cached.reply, cached: true })
      }
    }

    // Fetch user context
    const context = await buildUserAIContext(userId)

    // Build Prompt based on subAction type
    let systemPrompt = ""
    if (subAction === "streak-rescue") {
      systemPrompt = buildStreakRescuePrompt(context)
    } else if (subAction === "progress-review") {
      systemPrompt = buildProgressReviewPrompt(context, body.interval || "weekly")
    } else {
      systemPrompt = buildCoachingPrompt(context)
    }

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

    let reply = ""
    let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    let latencyMs = 0
    
    // Check credentials configuration
    const apiKey = process.env.LLAMA_API_KEY
    const hasProviderConfig = !!apiKey && apiKey !== "your-groq-llama-api-key"

    if (hasProviderConfig) {
      const provider = getActiveProvider()
      const startTime = Date.now()
      try {
        const response = await provider.chat(messages)
        reply = response.reply
        tokenUsage = response.usage
        latencyMs = Date.now() - startTime
      } catch (err) {
        console.error("Provider chat failed, falling back to rule-based engine:", err)
        reply = await getCoachResponse(validQuestion, history)
      }
    } else {
      // Fallback directly to rule-based engine locally
      reply = await getCoachResponse(validQuestion, history)
    }

    if (!reply) {
      reply = "I'm having trouble speaking. Let's try again in a bit!"
    }

    // Cache response
    if (!hasHistory && !subAction) {
      RESPONSE_CACHE[cacheKey] = {
        reply,
        timestamp: now,
      }
    }

    // Save message history to DB
    const userMsgId = `${Date.now()}-user`
    const coachMsgId = `${Date.now()}-coach`

    await Promise.all([
      dbWrite(`users/${userId}/ai_coach/messages/${activeConversationId}/${userMsgId}`, {
        id: userMsgId,
        sender: "user",
        text: validQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }),
      dbWrite(`users/${userId}/ai_coach/messages/${activeConversationId}/${coachMsgId}`, {
        id: coachMsgId,
        sender: "coach",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    ])

    // Save Analytics Telemetry
    const analyticsId = Date.now().toString()
    await dbWrite(`users/${userId}/ai_coach/analytics/${analyticsId}`, {
      id: analyticsId,
      action: subAction || "chat",
      latencyMs,
      tokenUsage,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("API /api/ai-coach POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
