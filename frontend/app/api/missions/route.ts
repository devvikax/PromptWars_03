import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    const { searchParams } = new URL(request.url)
    const getCatalog = searchParams.get("catalog") === "true"
    const getCompleted = searchParams.get("completed") === "true"

    let catalog: any[] = []
    let completed: any[] = []

    // 1. Fetch catalog if requested or no specific param
    if (getCatalog || (!getCatalog && !getCompleted)) {
      const { data, error } = await client
        .from("missions")
        .select("*")
        .order("title")

      if (error) throw error
      catalog = (data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        xpReward: m.xp_reward,
        waterReward: m.water_reward,
        category: m.category,
      }))
    }

    // 2. Fetch completed user missions
    if (getCompleted || (!getCatalog && !getCompleted)) {
      const { data, error } = await client
        .from("user_missions")
        .select("*")
        .eq("user_id", userId)

      if (error) throw error
      completed = (data || []).map((um: any) => ({
        id: um.id,
        userId: um.user_id,
        missionId: um.mission_id,
        completedAt: um.completed_at,
      }))
    }

    if (getCatalog && !getCompleted) {
      return NextResponse.json(catalog)
    }
    if (getCompleted && !getCatalog) {
      return NextResponse.json(completed)
    }

    return NextResponse.json({ catalog, completed })
  } catch (error: any) {
    console.error("API /api/missions GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { missionId } = body
    if (!missionId) {
      return NextResponse.json({ error: "Missing missionId" }, { status: 400 })
    }

    const { data, error } = await client
      .from("user_missions")
      .insert([
        {
          user_id: userId,
          mission_id: missionId,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      missionId: data.mission_id,
      completedAt: data.completed_at,
    })
  } catch (error: any) {
    console.error("API /api/missions POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
