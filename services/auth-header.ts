import { auth } from "@/lib/firebase"

export async function getAuthHeader(): Promise<Record<string, string>> {
  if (!auth) return {}
  
  const currentUser = auth.currentUser
  if (!currentUser) {
    // Attempt to get token from cookie as fallback, or just return empty
    // But since it's client-side, we can read the cookie if needed.
    if (typeof window !== "undefined") {
      const match = document.cookie.match(/(^| )fb-access-token=([^;]+)/)
      if (match && match[2]) {
        return {
          Authorization: `Bearer ${match[2]}`,
        }
      }

      // Check if guest user session is active as fallback
      const guestStateStr = localStorage.getItem("green-hero-guest-state")
      if (guestStateStr) {
        try {
          const guestState = JSON.parse(guestStateStr)
          const guestUserId = guestState.state?.guestUserId
          if (guestUserId) {
            return {
              Authorization: `Bearer mock-token-${guestUserId}`,
            }
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
    return {}
  }

  try {
    const token = await currentUser.getIdToken()
    return {
      Authorization: `Bearer ${token}`,
    }
  } catch (error) {
    console.error("Failed to get Firebase ID token:", error)
    return {}
  }
}
