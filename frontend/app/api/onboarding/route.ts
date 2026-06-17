import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { action, answers, mission } = body

    if (action === "save-profile") {
      if (!answers) {
        return NextResponse.json({ error: "Missing answers" }, { status: 400 })
      }

      const { error } = await client
        .from("users")
        .upsert({
          id: userId,
          travel_type: answers.travelType,
          ac_usage: answers.acUsage,
          food_type: answers.foodType,
          earth_health: "Good 😊",
          is_guest: false,
        })

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === "save-first-mission") {
      if (!mission) {
        return NextResponse.json({ error: "Missing mission" }, { status: 400 })
      }

      // Check if the mission exists in catalog
      const { data: existing, error: checkErr } = await client
        .from("missions")
        .select("id")
        .eq("id", mission.id)
        .maybeSingle()

      if (checkErr) throw checkErr

      if (!existing) {
        const { error: insErr } = await client
          .from("missions")
          .insert([
            {
              id: mission.id,
              title: mission.title,
              description: mission.description,
              xp_reward: mission.xpReward,
              water_reward: mission.waterReward,
              category: mission.category,
            },
          ])

        if (insErr) throw insErr
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("API /api/onboarding POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
