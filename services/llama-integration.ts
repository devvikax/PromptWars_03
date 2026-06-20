import { getAuthHeader } from "./auth-header"

/**
 * Client-side proxy service for the AI Sustainability Coach.
 * Resolves all queries via the server-side /api/ai-coach endpoint,
 * preventing credentials exposure in the browser.
 */
export async function askLlamaCoach(
  question: string,
  userId?: string,
  history?: any[]
): Promise<string> {
  const query = question.trim()
  if (!query) return ""

  try {
    const headers = await getAuthHeader()
    const res = await fetch("/api/ai-coach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ question: query, history }),
    })

    if (!res.ok) {
      if (res.status === 503) {
        console.warn("AI Coach is offline (503 Service Unavailable).")
        return "" // Return empty response to fallback to local NLP coach
      }
      throw new Error(`AI Coach API error: ${res.statusText}`)
    }

    const data = await res.json()
    return data.reply || ""
  } catch (error) {
    console.error("Failed to ask Llama Coach via API:", error)
    return ""
  }
}
