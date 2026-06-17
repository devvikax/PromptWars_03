import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    const { data, error } = await client
      .from("unlock_history")
      .select("item_id")
      .eq("user_id", userId)
      .eq("item_type", "reward")

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    const rewardIds = data.map((d: any) => d.item_id)

    const { data: rewardsData, error: rewardsError } = await client
      .from("rewards")
      .select("key")
      .in("id", rewardIds)

    if (rewardsError) throw rewardsError

    const keys = (rewardsData || []).map((r: any) => r.key).filter(Boolean)
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
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { key } = body
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 })
    }

    // Look up reward ID by key
    const { data: rew, error: findError } = await client
      .from("rewards")
      .select("id")
      .eq("key", key)
      .single()

    if (findError || !rew) {
      return NextResponse.json({ error: "Reward key not found" }, { status: 404 })
    }

    // Check if already in unlock_history
    const { data: existing } = await client
      .from("unlock_history")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", rew.id)
      .eq("item_type", "reward")
      .maybeSingle()

    if (!existing) {
      const { error } = await client
        .from("unlock_history")
        .insert([
          {
            user_id: userId,
            item_type: "reward",
            item_id: rew.id,
            unlocked_at: new Date().toISOString(),
          },
        ])

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/rewards POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
