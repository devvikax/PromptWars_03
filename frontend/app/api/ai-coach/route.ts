import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

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
    const client = getSupabaseServerClient(authHeader)
    
    const body = await request.json()

    // Handle sync-insights action (does not require Llama credentials)
    if (body.action === "sync-insights") {
      const { insights } = body
      if (!insights || !Array.isArray(insights)) {
        return NextResponse.json({ error: "Missing insights array" }, { status: 400 })
      }
      const { error } = await client.from("insight_logs").insert({
        user_id: userId,
        content: insights.join(" | ")
      })
      if (error) throw error
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

    const question = (body.question || "").trim()

    if (!question) {
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

    // Cache Lookup
    const cacheKey = `${userId}:${question}`
    if (RESPONSE_CACHE[cacheKey]) {
      const cached = RESPONSE_CACHE[cacheKey]!
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ reply: cached.reply, cached: true })
      }
      delete RESPONSE_CACHE[cacheKey]
    }

    // Context Builder (Fetch verified user profile & completions from DB)
    const { data: profile, error: profileErr } = await client
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    const { count: completedCount, error: countErr } = await client
      .from("user_missions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (profileErr || countErr) {
      throw new Error("Failed to fetch verified user context for AI Coach.")
    }

    const userContext = {
      level: profile.level || 1,
      streak: profile.streak || 0,
      completedCount: completedCount || 0,
      travelHabit: profile.travel_type || "not specified",
      acUsage: profile.ac_usage || "sometimes",
      dietPreference: profile.food_type || "mixed",
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

    // Call Llama endpoint
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 1.0,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      throw new Error(`Llama API responded with status ${response.status}`)
    }

    const json = await response.json()
    const reply = json.choices?.[0]?.message?.content || "I'm having trouble speaking. Let's try again in a bit!"

    // Cache the response
    RESPONSE_CACHE[cacheKey] = {
      reply,
      timestamp: now,
    }

    // Response Storage (Sync/Save to Supabase insight logs)
    await client.from("insight_logs").insert({
      user_id: userId,
      content: `Chat Question: ${question} | Coach Answer: ${reply}`
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("API /api/ai-coach POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
