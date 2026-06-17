import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    const { searchParams } = new URL(request.url)
    const getCatalog = searchParams.get("catalog") === "true"
    const getUnlocked = searchParams.get("unlocked") === "true"

    let catalog: any[] = []
    let unlocked: string[] = []

    if (getCatalog || (!getCatalog && !getUnlocked)) {
      const { data, error } = await client
        .from("achievements")
        .select("*")
        .order("xp_required")

      if (error) throw error
      catalog = (data || []).map((a: any) => ({
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        iconSlug: a.icon_slug,
        xpRequired: a.xp_required,
      }))
    }

    if (getUnlocked || (!getCatalog && !getUnlocked)) {
      const { data, error } = await client
        .from("user_achievements")
        .select("achievements(key)")
        .eq("user_id", userId)

      if (error) throw error
      unlocked = (data || []).map((ua: any) => ua.achievements?.key).filter(Boolean)
    }

    if (getCatalog && !getUnlocked) {
      return NextResponse.json(catalog)
    }
    if (getUnlocked && !getCatalog) {
      return NextResponse.json(unlocked)
    }

    return NextResponse.json({ catalog, unlocked })
  } catch (error: any) {
    console.error("API /api/achievements GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { achievementId, key } = body
    let targetId = achievementId

    // If key is supplied, look up the ID first (handles direct catalog key mappings)
    if (!targetId && key) {
      const { data: ach, error: findError } = await client
        .from("achievements")
        .select("id")
        .eq("key", key)
        .single()

      if (findError || !ach) {
        return NextResponse.json({ error: "Achievement key not found" }, { status: 404 })
      }
      targetId = ach.id
    }

    if (!targetId) {
      return NextResponse.json({ error: "Missing achievementId or key" }, { status: 400 })
    }

    const { error } = await client
      .from("user_achievements")
      .insert([
        {
          user_id: userId,
          achievement_id: targetId,
          unlocked_at: new Date().toISOString(),
        },
      ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/achievements POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
