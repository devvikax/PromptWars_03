import { getAuthHeader } from "./auth-header"
import { Achievement } from "@/types"

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/achievements?catalog=true", {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.warn("API getAchievements failed, using local offline fallback:", error)
    return getOfflineFallbackAchievements()
  }
}

export async function getUserAchievements(userId: string): Promise<string[]> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/achievements?unlocked=true", {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Failed to fetch user achievements via API:", error)
    return []
  }
}

export async function unlockUserAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/achievements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ achievementId }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to unlock user achievement via API:", error)
    return false
  }
}

function getOfflineFallbackAchievements(): Achievement[] {
  return [
    {
      id: "ach-1",
      key: "first-step",
      title: "First Step",
      description: "Complete your very first daily mission.",
      iconSlug: "🌱",
      xpRequired: 20,
    },
    {
      id: "ach-2",
      key: "streak-master",
      title: "Streak Master",
      description: "Reach a 5-day streak of sustainable habits.",
      iconSlug: "🔥",
      xpRequired: 100,
    },
    {
      id: "ach-3",
      key: "earth-protector",
      title: "Earth Protector",
      description: "Accumulate 300 XP in total carbon actions.",
      iconSlug: "🌍",
      xpRequired: 300,
    },
  ]
}
