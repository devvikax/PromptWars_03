import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

const VALID_REWARD_KEYS = [
  'reward-flowers',
  'reward-nest',
  'reward-fireflies',
  'reward-waterfall',
  'reward-golden-leaves'
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const data = await dbRead<Record<string, boolean>>(`users/${userId}/unlockedRewards`)
    
    const keys = data ? Object.keys(data).filter(k => data[k] === true) : []
    return NextResponse.json(keys)
  } catch (error: any) {
    console.error("API /api/rewards GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const body = await request.json()

    const { key } = body
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 })
    }

    if (!VALID_REWARD_KEYS.includes(key)) {
      return NextResponse.json({ error: "Reward key not found" }, { status: 404 })
    }

    // Set users/${userId}/unlockedRewards/${key} = true
    await dbWrite(`users/${userId}/unlockedRewards/${key}`, true)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/rewards POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
