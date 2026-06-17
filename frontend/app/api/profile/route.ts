import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGLIT") return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      throw error
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      phone: data.phone,
      isGuest: data.is_guest,
      level: data.level,
      xp: data.xp,
      streak: data.streak,
      waterDrops: data.water_drops,
      travelType: data.travel_type,
      acUsage: data.ac_usage,
      foodType: data.food_type,
      earthHealth: data.earth_health,
    })
  } catch (error: any) {
    console.error("API /api/profile GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    // Handle merge action
    if (body.action === "merge") {
      const { guestId } = body
      if (!guestId) {
        return NextResponse.json({ error: "Missing guestId" }, { status: 400 })
      }
      const { error } = await client.rpc("merge_guest_progress", {
        p_guest_id: guestId,
        p_auth_user_id: userId,
      })
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Validate inputs
    const dbUpdates: any = {}
    if (body.email !== undefined) dbUpdates.email = body.email
    if (body.phone !== undefined) dbUpdates.phone = body.phone
    if (body.isGuest !== undefined) dbUpdates.is_guest = body.isGuest
    if (body.level !== undefined) {
      if (typeof body.level !== "number" || body.level < 1) {
        return NextResponse.json({ error: "Invalid level value" }, { status: 400 })
      }
      dbUpdates.level = body.level
    }
    if (body.xp !== undefined) {
      if (typeof body.xp !== "number" || body.xp < 0) {
        return NextResponse.json({ error: "Invalid XP value" }, { status: 400 })
      }
      dbUpdates.xp = body.xp
    }
    if (body.streak !== undefined) dbUpdates.streak = body.streak
    if (body.waterDrops !== undefined) dbUpdates.water_drops = body.waterDrops
    if (body.travelType !== undefined) dbUpdates.travel_type = body.travelType
    if (body.acUsage !== undefined) dbUpdates.ac_usage = body.acUsage
    if (body.foodType !== undefined) dbUpdates.food_type = body.foodType
    if (body.earthHealth !== undefined) dbUpdates.earth_health = body.earthHealth

    const { error } = await client
      .from("users")
      .upsert({ id: userId, ...dbUpdates })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/profile POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
