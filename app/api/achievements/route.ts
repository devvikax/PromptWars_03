import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

const CATALOG_ACHIEVEMENTS = [
  { id: 'first-mission', key: 'first-mission', title: 'First Steps', description: 'Logged your first sustainable carbon saving action.', iconSlug: '🌱', xpRequired: 15 },
  { id: 'first-level-up', key: 'first-level-up', title: 'Eco Sprout', description: 'Leveled up your ecosystem for the first time.', iconSlug: '🌿', xpRequired: 50 },
  { id: 'first-week', key: 'first-week', title: 'Eco Habit', description: 'Completed at least one action every day for a week.', iconSlug: '🗓️', xpRequired: 100 },
  { id: 'streak-3', key: 'streak-3', title: 'Habit Builder', description: 'Logged actions for 3 days in a row.', iconSlug: '🔥', xpRequired: 30 },
  { id: 'streak-7', key: 'streak-7', title: 'Eco Devotee', description: 'Logged actions for 7 days in a row.', iconSlug: '⚡', xpRequired: 70 },
  { id: 'streak-30', key: 'streak-30', title: 'Consistency Legend', description: 'Logged actions for 30 days in a row.', iconSlug: '🏆', xpRequired: 300 },
  { id: 'streak-100', key: 'streak-100', title: 'Carbon Slayer', description: 'Logged actions for 100 days in a row.', iconSlug: '👑', xpRequired: 1000 },
  { id: 'missions-10', key: 'missions-10', title: 'Green Apprentice', description: 'Completed 10 sustainable carbon missions.', iconSlug: '🌲', xpRequired: 100 },
  { id: 'missions-50', key: 'missions-50', title: 'Forest Guardian', description: 'Completed 50 sustainable carbon missions.', iconSlug: '🌳', xpRequired: 500 },
  { id: 'missions-100', key: 'missions-100', title: 'Ecosystem Savior', description: 'Completed 100 sustainable carbon missions.', iconSlug: '🌎', xpRequired: 1000 },
  { id: 'missions-500', key: 'missions-500', title: 'Planet Healer', description: 'Completed 500 sustainable carbon missions.', iconSlug: '🪐', xpRequired: 5000 },
  { id: 'earth-protector', key: 'earth-protector', title: 'Earth Protector', description: 'Unlocked Level 3 carbon savings.', iconSlug: '🌍', xpRequired: 250 },
  { id: 'eco-warrior', key: 'eco-warrior', title: 'Eco Warrior', description: 'Unlocked Level 7 carbon savings.', iconSlug: '🛡️', xpRequired: 750 },
  { id: 'green-champion', key: 'green-champion', title: 'Green Champion', description: 'Unlocked Level 15 carbon savings.', iconSlug: '🥇', xpRequired: 2000 }
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const { searchParams } = new URL(request.url)
    const getCatalog = searchParams.get("catalog") === "true"
    const getUnlocked = searchParams.get("unlocked") === "true"

    let catalog: any[] = []
    let unlocked: string[] = []

    if (getCatalog || (!getCatalog && !getUnlocked)) {
      catalog = CATALOG_ACHIEVEMENTS
    }

    if (getUnlocked || (!getCatalog && !getUnlocked)) {
      const data = await dbRead<Record<string, boolean>>(`users/${userId}/unlockedAchievements`)
      if (data) {
        unlocked = Object.keys(data).filter((k) => data[k] === true)
      }
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
    const body = await request.json()

    const { achievementId, key } = body
    let targetKey = key

    // Resolve key from achievementId if needed
    if (!targetKey && achievementId) {
      const found = CATALOG_ACHIEVEMENTS.find(a => a.id === achievementId || a.key === achievementId)
      if (found) {
        targetKey = found.key
      }
    }

    if (!targetKey) {
      return NextResponse.json({ error: "Missing achievementId or key" }, { status: 400 })
    }

    // Set users/${userId}/unlockedAchievements/${targetKey} = true
    await dbWrite(`users/${userId}/unlockedAchievements/${targetKey}`, true)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API /api/achievements POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
