import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const behavior = await dbRead<any>(`users/${userId}/behavior`)

    return NextResponse.json({
      ignoredMissionsCount: behavior?.ignoredMissionsCount ?? behavior?.ignored_missions_count ?? 0,
      categoryPreferences: behavior?.categoryPreferences ?? behavior?.category_preferences ?? {},
    })
  } catch (error: any) {
    console.error("API /api/behavior GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const body = await request.json()

    const { ignoredMissionsCount, categoryPreferences } = body

    const behaviorData = {
      ignoredMissionsCount: ignoredMissionsCount ?? 0,
      categoryPreferences: categoryPreferences ?? {},
      lastActiveAt: new Date().toISOString(),
    }

    await dbWrite(`users/${userId}/behavior`, behaviorData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/behavior POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
