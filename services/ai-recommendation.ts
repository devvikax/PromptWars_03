import { Mission } from "@/types"
import { MISSION_CATALOG } from "@/store/mission-store"

interface UserBehaviorContext {
  ignoredMissionsCount: number
  categoryPreferences: Record<string, { completed: number; ignored: number; skipped: number }>
  travelType: string | null
  acUsage: string | null
  foodType: string | null
}

export function generatePersonalizedMissions(
  context: UserBehaviorContext,
  completedMissions: string[],
  level: number
): Mission[] {
  const scoredMissions = MISSION_CATALOG.map((mission) => {
    // 1. Impact Score Calculation
    let impactScore = 0.3
    if (mission.estimatedImpact === "high") impactScore = 1.0
    else if (mission.estimatedImpact === "medium") impactScore = 0.6

    // 2. Preference Match Calculation (based on onboarding answers)
    let preferenceMatch = 0.5

    if (mission.category === "transport") {
      if (context.travelType === "car") {
        preferenceMatch = 1.0 // High priority for car drivers to substitute trips
      } else if (context.travelType === "motorbike") {
        preferenceMatch = 0.85 // High priority for motorbike riders to substitute trips
      } else if (context.travelType === "bus" || context.travelType === "metro") {
        preferenceMatch = 0.7
      } else {
        preferenceMatch = 0.3 // Cycle/Walkers already have clean transport habits
      }
    } else if (mission.category === "energy") {
      if (context.acUsage === "often") {
        preferenceMatch = 1.0 // High priority for frequent AC users
      } else if (context.acUsage === "sometimes") {
        preferenceMatch = 0.7
      } else {
        preferenceMatch = 0.3
      }
    } else if (mission.category === "diet") {
      if (context.foodType === "mixed") {
        preferenceMatch = 1.0 // High priority for meat-eaters to reduce meat consumption
      } else if (context.foodType === "vegetarian") {
        preferenceMatch = 0.5
      } else {
        preferenceMatch = 0.2 // Vegans already have low dietary impact
      }
    }

    // Adjust preference based on historical completion rates
    const stats = context.categoryPreferences[mission.category]
    if (stats) {
      const totalCount = stats.completed + stats.ignored + stats.skipped
      if (totalCount > 0) {
        const ratio = stats.completed / totalCount
        preferenceMatch = (preferenceMatch + ratio) / 2
      }
    }

    // 3. Completion Probability (based on user history)
    let completionProbability = 0.7
    if (stats) {
      const totalAttempts = stats.completed + stats.ignored + stats.skipped
      if (totalAttempts > 0) {
        completionProbability = stats.completed / (totalAttempts + 1)
      }
    }

    // 4. Difficulty Score
    let difficultyScore = 0.3
    if (mission.difficulty === "medium") difficultyScore = 0.6
    else if (mission.difficulty === "hard") difficultyScore = 0.9

    // Adapt to Ignored Missions (If user has ignored many missions, penalize hard/medium difficulty)
    if (context.ignoredMissionsCount >= 2) {
      if (mission.difficulty === "hard") {
        difficultyScore += 1.5 // Heavily penalize hard tasks
      } else if (mission.difficulty === "medium") {
        difficultyScore += 0.8 // Penalize medium tasks
      }
    }

    // Level adaptation: penalize hard tasks for beginners
    if (level < 3 && mission.difficulty === "hard") {
      difficultyScore += 1.0
    }

    // Calculate final recommendation score
    // Weight breakdown: 30% Impact, 35% Onboarding Preferences, 35% Success probability, -20% Difficulty penalty
    const score =
      (0.3 * impactScore) +
      (0.35 * preferenceMatch) +
      (0.35 * completionProbability) -
      (0.2 * difficultyScore)

    return {
      mission,
      score,
    }
  })

  // Filter out already completed missions to avoid repeating completed challenges
  const uncompletedScored = scoredMissions.filter(
    (item) => !completedMissions.includes(item.mission.id)
  )

  // Sort by score in descending order
  uncompletedScored.sort((a, b) => b.score - a.score)

  // Pick top 3 recommended missions
  const recommended = uncompletedScored.slice(0, 3).map((item) => item.mission)

  // Fallback: If less than 3 remain (due to completing everything), return random uncompleted or catalog ones
  if (recommended.length < 3) {
    const ids = recommended.map((r) => r.id)
    const remaining = MISSION_CATALOG.filter(
      (m) => !ids.includes(m.id) && !completedMissions.includes(m.id)
    )
    const shuffled = remaining.sort(() => 0.5 - Math.random())
    recommended.push(...shuffled.slice(0, 3 - recommended.length))
  }

  return recommended
}
