import { NextResponse } from "next/server"
import { getVerifiedUserId, dbRead, dbWrite } from "@/lib/firebase-server"

const CATALOG_MISSIONS = [
  { id: '595dbf41-0731-4171-8bc6-52c6f1400001', title: 'Walk to the Store', description: 'Walk instead of driving for short trips under 1 km today.', xpReward: 15, waterReward: 1, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400002', title: 'Cycle to Work / School', description: 'Cycle to save travel carbon emissions today.', xpReward: 25, waterReward: 1, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400003', title: 'No Car Day', description: 'Ditch driving entirely today. Walk, cycle, or use public transit.', xpReward: 40, waterReward: 1, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400004', title: 'Unplug Idle Chargers', description: 'Unplug phone chargers and home appliances when not in use.', xpReward: 15, waterReward: 1, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400005', title: 'Wash Clothes in Cold Water', description: 'Use cold water cycle on your laundry to save heating power.', xpReward: 25, waterReward: 1, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400006', title: 'Hour of Darkness', description: 'Turn off all optional lights and electronics for 1 hour tonight.', xpReward: 40, waterReward: 1, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400007', title: 'Choose a Plant-Based Snack', description: 'Eat fresh fruit or nuts instead of processed snacks.', xpReward: 15, waterReward: 1, category: 'diet' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400008', title: 'Try One Vegetarian Meal Today', description: 'Swap meat for a delicious plant-based breakfast, lunch, or dinner.', xpReward: 25, waterReward: 1, category: 'diet' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400009', title: 'Fully Plant-Based Day', description: 'Choose vegetarian or vegan meals for all food intakes today.', xpReward: 40, waterReward: 1, category: 'diet' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400010', title: 'Sort Your Trash', description: 'Correctly separate recyclables and compostables from landfill trash.', xpReward: 15, waterReward: 1, category: 'diet' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400011', title: 'No Single-Use Plastics', description: 'Use a reusable bottle and canvas bags instead of plastic options today.', xpReward: 25, waterReward: 1, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400012', title: 'Zero Waste Day', description: 'Avoid producing any landfill waste for the next 24 hours.', xpReward: 40, waterReward: 1, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400013', title: 'Turn Tap Off While Brushing', description: 'Conserve water by turning off the tap while brushing teeth.', xpReward: 15, waterReward: 2, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400014', title: '5-Minute Shower', description: 'Conserve clean water by taking a quick shower in under 5 minutes.', xpReward: 25, waterReward: 2, category: 'diet' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400015', title: 'Bucket Wash Car/Cycle', description: 'Use a bucket instead of running water hose to clean transport items.', xpReward: 40, waterReward: 3, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400016', title: 'Share an Eco Tip', description: 'Tell a family member about home energy saving habits today.', xpReward: 15, waterReward: 1, category: 'energy' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400017', title: 'Pick Up 3 Pieces of Litter', description: 'Collect litter from your neighborhood street or local park.', xpReward: 25, waterReward: 1, category: 'transport' },
  { id: '595dbf41-0731-4171-8bc6-52c6f1400018', title: 'Organize an Eco Challenge', description: 'Invite 3 friends to join you in completing a Green Hero mission.', xpReward: 40, waterReward: 2, category: 'diet' }
]

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)

    const { searchParams } = new URL(request.url)
    const getCatalog = searchParams.get("catalog") === "true"
    const getCompleted = searchParams.get("completed") === "true"

    let catalog: any[] = []
    let completed: any[] = []

    // 1. Return catalog if requested
    if (getCatalog || (!getCatalog && !getCompleted)) {
      catalog = CATALOG_MISSIONS
    }

    // 2. Fetch completed user missions from Firebase RTDB
    if (getCompleted || (!getCatalog && !getCompleted)) {
      const data = await dbRead<Record<string, any>>(`users/${userId}/completedMissions`)
      if (data) {
        completed = Object.values(data).map((um: any) => ({
          id: um.id,
          userId: um.userId || um.user_id,
          missionId: um.missionId || um.mission_id,
          completedAt: um.completedAt || um.completed_at,
        }))
      }
    }

    if (getCatalog && !getCompleted) {
      return NextResponse.json(catalog)
    }
    if (getCompleted && !getCatalog) {
      return NextResponse.json(completed)
    }

    return NextResponse.json({ catalog, completed })
  } catch (error: any) {
    console.error("API /api/missions GET error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = await getVerifiedUserId(authHeader)
    const body = await request.json()

    const { missionId } = body
    if (!missionId) {
      return NextResponse.json({ error: "Missing missionId" }, { status: 400 })
    }

    const completedAt = new Date().toISOString()
    const record = {
      id: `${userId}_${missionId}`,
      userId,
      missionId,
      completedAt,
    }

    // Write to users/${userId}/completedMissions/${missionId}
    await dbWrite(`users/${userId}/completedMissions/${missionId}`, record)

    return NextResponse.json(record)
  } catch (error: any) {
    console.error("API /api/missions POST error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 401 })
  }
}
