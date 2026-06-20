import { dbRead } from "@/lib/firebase-server"

export interface UserAIContext {
  userId: string
  email: string
  level: number
  xp: number
  streak: number
  waterDrops: number
  travelType: string
  foodType: string
  acUsage: string
  completedMissionsCount: number
  completedMissionIds: string[]
  unlockedAchievementsCount: number
  unlockedAchievementsList: string[]
  unlockedCollectionsCount: number
  unlockedCollectionsList: string[]
  unlockedRewardsCount: number
  unlockedRewardsList: string[]
  ignoredMissionsCount: number
  lastActiveAt: string
  weatherState: string
  seasonState: string
}

/**
 * Query Firebase RTDB and aggregate all user metrics, settings, milestones, and behaviors
 * to construct a structured, comprehensive AI context payload.
 */
export async function buildUserAIContext(userId: string): Promise<UserAIContext> {
  const user = await dbRead<any>(`users/${userId}`)
  if (!user) {
    throw new Error(`User profile not found for context generation: ${userId}`)
  }

  const completedMissions = user.completedMissions || {}
  
  // Handle both string arrays and object mappings of completed missions
  let completedMissionIds: string[] = []
  if (Array.isArray(completedMissions)) {
    completedMissionIds = completedMissions
  } else {
    completedMissionIds = Object.values(completedMissions).map((m: any) => {
      if (typeof m === "string") return m
      return m.missionId || m.id || ""
    }).filter(Boolean)
  }
  const completedMissionsCount = completedMissionIds.length

  const unlockedAchievementsList = Object.keys(user.unlockedAchievements || {})
  const unlockedAchievementsCount = unlockedAchievementsList.length

  const unlockedCollectionsList = Object.keys(user.unlockedCollections || {})
  const unlockedCollectionsCount = unlockedCollectionsList.length

  const unlockedRewardsList = Object.keys(user.unlockedRewards || {})
  const unlockedRewardsCount = unlockedRewardsList.length

  const behavior = user.behavior || {}
  const ignoredMissionsCount = behavior.ignoredMissionsCount || 0
  const lastActiveAt = behavior.lastActiveAt || new Date().toISOString()

  // Dynamically determine season based on current month (June -> Summer)
  const currentMonth = new Date().getMonth()
  let seasonState = "Spring"
  if (currentMonth >= 2 && currentMonth <= 4) seasonState = "Spring"
  else if (currentMonth >= 5 && currentMonth <= 7) seasonState = "Summer"
  else if (currentMonth >= 8 && currentMonth <= 10) seasonState = "Autumn"
  else seasonState = "Winter"

  // Dynamically get a weather state
  const weatherStates = ["Sunny", "Breezy & Clean", "Overcast", "Clear & Mild"]
  const weatherState = weatherStates[currentMonth % weatherStates.length] || "Sunny"

  return {
    userId,
    email: user.email || "hero@greenhero.app",
    level: user.level || 1,
    xp: user.xp || 0,
    streak: user.streak || 0,
    waterDrops: user.waterDrops || 0,
    travelType: user.travelType || "not specified",
    foodType: user.foodType || "not specified",
    acUsage: user.acUsage || "not specified",
    completedMissionsCount,
    completedMissionIds,
    unlockedAchievementsCount,
    unlockedAchievementsList,
    unlockedCollectionsCount,
    unlockedCollectionsList,
    unlockedRewardsCount,
    unlockedRewardsList,
    ignoredMissionsCount,
    lastActiveAt,
    weatherState,
    seasonState,
  }
}
