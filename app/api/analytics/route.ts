import { NextResponse } from "next/server"
import { getVerifiedUserId, dbWrite } from "@/lib/firebase-server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const body = await request.json()

    const { eventName, metadata } = body
    if (!eventName) {
      return NextResponse.json({ error: "Missing eventName" }, { status: 400 })
    }

    const timestamp = Date.now().toString()
    await dbWrite(`users/${userId}/analyticsEvents/${timestamp}`, {
      eventName,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/analytics POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
