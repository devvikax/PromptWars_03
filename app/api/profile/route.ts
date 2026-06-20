import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite, dbUpdate } from "@/lib/firebase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const data = await dbRead<any>(`users/${userId}`)

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: userId,
      email: data.email,
      phone: data.phone,
      isGuest: data.isGuest ?? data.is_guest ?? false,
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      waterDrops: data.waterDrops ?? data.water_drops ?? 0,
      travelType: data.travelType ?? data.travel_type ?? null,
      acUsage: data.acUsage ?? data.ac_usage ?? null,
      foodType: data.foodType ?? data.food_type ?? null,
      earthHealth: data.earthHealth ?? data.earth_health ?? 100,
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
    const body = await request.json()

    // Handle merge action
    if (body.action === "merge") {
      const { guestId } = body
      if (!guestId) {
        return NextResponse.json({ error: "Missing guestId" }, { status: 400 })
      }

      const guestData = await dbRead<any>(`users/${guestId}`)
      if (guestData) {
        const authData = (await dbRead<any>(`users/${userId}`)) || {}
        
        // Merge profile metrics and credentials
        const mergedProfile = {
          ...guestData,
          ...authData,
          xp: Math.max(authData.xp ?? 0, guestData.xp ?? 0),
          level: Math.max(authData.level ?? 1, guestData.level ?? 1),
          streak: Math.max(authData.streak ?? 0, guestData.streak ?? 0),
          waterDrops: (authData.waterDrops ?? authData.water_drops ?? 0) + (guestData.waterDrops ?? guestData.water_drops ?? 0),
          isGuest: false,
        }

        // Merge lists / nested objects if any:
        if (guestData.completedMissions || authData.completedMissions) {
          mergedProfile.completedMissions = {
            ...(guestData.completedMissions || {}),
            ...(authData.completedMissions || {}),
          }
        }
        if (guestData.achievements || authData.achievements) {
          mergedProfile.achievements = {
            ...(guestData.achievements || {}),
            ...(authData.achievements || {}),
          }
        }
        if (guestData.rewards || authData.rewards) {
          mergedProfile.rewards = {
            ...(guestData.rewards || {}),
            ...(authData.rewards || {}),
          }
        }
        if (guestData.collections || authData.collections) {
          mergedProfile.collections = {
            ...(guestData.collections || {}),
            ...(authData.collections || {}),
          }
        }
        if (guestData.behavior || authData.behavior) {
          mergedProfile.behavior = {
            ...(guestData.behavior || {}),
            ...(authData.behavior || {}),
          }
        }

        await dbWrite(`users/${userId}`, mergedProfile)
        // Clean up guest profile
        await dbWrite(`users/${guestId}`, null)
      }

      return NextResponse.json({ success: true })
    }

    // Validate and build updates
    const dbUpdates: any = {}
    if (body.email !== undefined) dbUpdates.email = body.email
    if (body.phone !== undefined) dbUpdates.phone = body.phone
    if (body.isGuest !== undefined) dbUpdates.isGuest = body.isGuest
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
    if (body.waterDrops !== undefined) dbUpdates.waterDrops = body.waterDrops
    if (body.travelType !== undefined) dbUpdates.travelType = body.travelType
    if (body.acUsage !== undefined) dbUpdates.acUsage = body.acUsage
    if (body.foodType !== undefined) dbUpdates.foodType = body.foodType
    if (body.earthHealth !== undefined) dbUpdates.earthHealth = body.earthHealth

    // Update in RTDB (PATCH)
    await dbUpdate(`users/${userId}`, dbUpdates)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/profile POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
