import { getAuthHeader } from "./supabase"
import { Mission } from "@/types"

export async function saveOnboardingProfileDb(
  userId: string,
  answers: { travelType: string; acUsage: string; foodType: string }
): Promise<boolean> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        action: "save-profile",
        answers,
      }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to save onboarding profile via API:", error)
    return false
  }
}

export async function saveOnboardingFirstMissionDb(
  userId: string,
  mission: Mission
): Promise<boolean> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        action: "save-first-mission",
        mission,
      }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to sync generated first mission via API:", error)
    return false
  }
}
