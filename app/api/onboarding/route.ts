import { NextResponse } from "next/server"
import { getVerifiedUserId, dbUpdate } from "@/lib/firebase-server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const body = await request.json()

    const { action, answers } = body

    if (action === "save-profile") {
      if (!answers) {
        return NextResponse.json({ error: "Missing answers" }, { status: 400 })
      }

      await dbUpdate(`users/${userId}`, {
        travelType: answers.travelType,
        acUsage: answers.acUsage,
        foodType: answers.foodType,
        earthHealth: "Good 😊",
        isGuest: false,
      })

      return NextResponse.json({ success: true })
    }

    if (action === "save-first-mission") {
      // Catalog is hardcoded in the Next.js API, so we just acknowledge success
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("API /api/onboarding POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
