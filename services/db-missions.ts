import { getAuthHeader } from "./auth-header"
import { Mission, UserMission } from "@/types"

export async function getMissions(): Promise<Mission[]> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/missions?catalog=true", {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.warn("API getMissions failed, using local offline fallback:", error)
    return getOfflineFallbackMissions()
  }
}

export async function getUserCompletedMissions(userId: string): Promise<UserMission[]> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/missions?completed=true", {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Failed to fetch user completed missions via API:", error)
    return []
  }
}

export async function completeMissionOnDb(userId: string, missionId: string): Promise<UserMission | null> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/missions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ missionId }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Failed to save mission completion via API:", error)
    return null
  }
}

function getOfflineFallbackMissions(): Mission[] {
  return [
    {
      id: "mission-1",
      title: "Walk or Cycle to Work/Store",
      description: "Ditch the car keys for short trips. Reduce emissions directly.",
      xpReward: 20,
      waterReward: 1,
      category: "transport",
    },
    {
      id: "mission-2",
      title: "Unplug Idle Chargers",
      description: "Unplug phone chargers and appliances not in use to cut vampire energy.",
      xpReward: 15,
      waterReward: 1,
      category: "energy",
    },
    {
      id: "mission-3",
      title: "Choose a Plant-Based Meal",
      description: "Opt for a vegetarian or vegan breakfast, lunch, or dinner.",
      xpReward: 20,
      waterReward: 1,
      category: "diet",
    },
  ]
}
