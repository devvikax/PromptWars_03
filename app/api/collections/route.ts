import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

const VALID_COLLECTION_KEYS = [
  'flower-rose', 'flower-sun', 'flower-tulip', 'flower-cherry', 'flower-gold',
  'bird-blue', 'bird-sparrow', 'bird-owl',
  'butterfly-purple', 'butterfly-cyan',
  'wonder-waterfall', 'wonder-pond', 'wonder-crystal',
  'deco-nest', 'deco-lantern', 'deco-lights'
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const data = await dbRead<Record<string, boolean>>(`users/${userId}/unlockedCollections`)
    
    const keys = data ? Object.keys(data).filter(k => data[k] === true) : []
    return NextResponse.json(keys)
  } catch (error: any) {
    console.error("API /api/collections GET error:", error)
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

    if (!VALID_COLLECTION_KEYS.includes(key)) {
      return NextResponse.json({ error: "Collection key not found" }, { status: 404 })
    }

    // Set users/${userId}/unlockedCollections/${key} = true
    await dbWrite(`users/${userId}/unlockedCollections/${key}`, true)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/collections POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
