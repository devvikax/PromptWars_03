import { getAuthHeader } from "./auth-header"
import { UserProfile } from "@/types"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/profile", {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Failed to fetch user profile via API:", error)
    return null
  }
}

export async function updateUserProfileOnDb(
  userId: string,
  updates: Partial<Omit<UserProfile, "id">>
): Promise<boolean> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to update user profile via API:", error)
    return false
  }
}

export async function mergeGuestProgressDb(guestId: string, authUserId: string): Promise<boolean> {
  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        action: "merge",
        guestId,
      }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Failed to merge guest progress via API:", error)
    return false
  }
}
