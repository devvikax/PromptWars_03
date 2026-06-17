import { NextResponse } from "next/server"
import { getSupabaseServerClient, getVerifiedUserId } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const client = getSupabaseServerClient(authHeader)

    const { data: behavior, error: behaviorError } = await client
      .from("user_behavior")
      .select("ignored_missions_count")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: performances, error: perfError } = await client
      .from("mission_performance")
      .select("category, completed_count, ignored_count, skipped_count")
      .eq("user_id", userId)

    if (behaviorError) throw behaviorError
    if (perfError) throw perfError

    const categoryPreferences: Record<string, any> = {}
    if (performances) {
      for (const perf of performances) {
        categoryPreferences[perf.category] = {
          completed: perf.completed_count || 0,
          ignored: perf.ignored_count || 0,
          skipped: perf.skipped_count || 0,
        }
      }
    }

    return NextResponse.json({
      ignoredMissionsCount: behavior?.ignored_missions_count || 0,
      categoryPreferences,
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
    const client = getSupabaseServerClient(authHeader)
    const body = await request.json()

    const { ignoredMissionsCount, categoryPreferences } = body

    // 1. Update user_behavior
    const { data: existingBehavior } = await client
      .from("user_behavior")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    const preferredCategory = categoryPreferences 
      ? Object.keys(categoryPreferences).reduce((a, b) => 
          (categoryPreferences[a]?.completed || 0) > (categoryPreferences[b]?.completed || 0) ? a : b
        , "energy")
      : "energy"

    if (existingBehavior) {
      const { error: updErr } = await client
        .from("user_behavior")
        .update({
          ignored_missions_count: ignoredMissionsCount || 0,
          preferred_category: preferredCategory,
          last_active_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updErr) throw updErr
    } else {
      const { error: insErr } = await client
        .from("user_behavior")
        .insert({
          user_id: userId,
          ignored_missions_count: ignoredMissionsCount || 0,
          preferred_category: preferredCategory,
          last_active_at: new Date().toISOString(),
        })

      if (insErr) throw insErr
    }

    // 2. Sync category statistics to mission_performance
    if (categoryPreferences) {
      for (const category of Object.keys(categoryPreferences)) {
        const stats = categoryPreferences[category]
        if (stats) {
          const { data: perf } = await client
            .from("mission_performance")
            .select("id")
            .eq("user_id", userId)
            .eq("category", category)
            .maybeSingle()

          if (perf) {
            const { error: updPerfErr } = await client
              .from("mission_performance")
              .update({
                completed_count: stats.completed || 0,
                ignored_count: stats.ignored || 0,
                skipped_count: stats.skipped || 0,
                last_updated_at: new Date().toISOString(),
              })
              .eq("id", perf.id)

            if (updPerfErr) throw updPerfErr
          } else {
            const { error: insPerfErr } = await client
              .from("mission_performance")
              .insert({
                user_id: userId,
                category,
                completed_count: stats.completed || 0,
                ignored_count: stats.ignored || 0,
                skipped_count: stats.skipped || 0,
              })

            if (insPerfErr) throw insPerfErr
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/behavior POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
