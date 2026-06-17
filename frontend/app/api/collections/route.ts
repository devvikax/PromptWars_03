import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    // Fetch user collections joining collections key
    const { data, error } = await client
      .from("user_collections")
      .select("collections(key)")
      .eq("user_id", userId)

    if (error) throw error

    const keys = (data || [])
      .map((item: any) => item.collections?.key)
      .filter(Boolean)

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
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { key } = body
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 })
    }

    // Look up collection ID by key
    const { data: col, error: findError } = await client
      .from("collections")
      .select("id")
      .eq("key", key)
      .single()

    if (findError || !col) {
      return NextResponse.json({ error: "Collection key not found" }, { status: 404 })
    }

    const { error } = await client
      .from("user_collections")
      .insert([
        {
          user_id: userId,
          collection_id: col.id,
          unlocked_at: new Date().toISOString(),
        },
      ])

    if (error && error.code !== "23505") { // Ignore unique constraint violation (already unlocked)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/collections POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
