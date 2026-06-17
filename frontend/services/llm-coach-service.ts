/**
 * LLM Coach Service
 * 
 * Provides an intent-based router to simulate natural, friendly responses from the AI Coach.
 * Includes a latency delay to mimic API responses and documented placeholders for future LLM integration.
 */

import { askLlamaCoach } from "./llama-integration"
import { useAuthStore } from "@/store/auth-store"

export async function getCoachResponse(question: string): Promise<string> {
  // 1. Try to query live Llama API first if credentials are configured
  const userId = useAuthStore.getState().user?.id
  const llamaReply = await askLlamaCoach(question, userId)
  if (llamaReply) {
    return llamaReply
  }

  // 2. Fallback to local rule-based NLP coach response
  // Simulate network latency (600ms)
  await new Promise((resolve) => setTimeout(resolve, 600))

  const query = question.toLowerCase().trim()

  // 1. Growth Questions
  if (
    query.includes("slow") ||
    query.includes("grow") ||
    query.includes("growth") ||
    query.includes("ecosystem")
  ) {
    return "Your centerpiece ecosystem grows larger and healthier with every daily mission you log! If it feels slow, try completing a mix of easy and medium tasks. Consistency is the key to seeing those beautiful flowers bloom! 🌸"
  }

  // 2. Electricity / Energy Questions
  if (
    query.includes("electricity") ||
    query.includes("energy") ||
    query.includes("power") ||
    query.includes("ac") ||
    query.includes("cool")
  ) {
    return "Saving electricity is simple! A great way to start is by raising your AC temperature by 1°C, or turning off chargers at the wall when you are done. Even using a fan instead of AC for just one hour makes a huge difference. 💡"
  }

  // 3. Mission Queries
  if (
    query.includes("mission") ||
    query.includes("do today") ||
    query.includes("task") ||
    query.includes("challenge")
  ) {
    return "For a quick win today, I suggest starting with an easy task: choosing a plant-based snack or unplugging idle devices. These take less than a minute but still add drops to your ecosystem! 💧"
  }

  // 4. Streak Questions
  if (
    query.includes("streak") ||
    query.includes("fire") ||
    query.includes("keep going") ||
    query.includes("days active")
  ) {
    return "To maintain your streak, simply complete at least one sustainable action every 24 hours. If you are busy, pick an 'easy' mission in the collections. Keep that eco fire burning! 🔥"
  }

  // 5. Basic greetings
  if (
    query.startsWith("hi") ||
    query.startsWith("hello") ||
    query.startsWith("hey") ||
    query.startsWith("greet")
  ) {
    return "Hello there! I'm your botanical sustainability guide. Ask me anything about saving energy, reducing carbon, or growing your floating garden! 🌿"
  }

  // 6. Generic Fallback Response
  return "That is a wonderful question! Small changes in how we commute, eat, and use energy add up to a massive positive impact. Try logging your first daily mission to see how it affects your ecosystem! 🌍"
}

/**
 * ============================================================================
 * FUTURE LLM INTEGRATION ARCHITECTURE REFERENCE
 * ============================================================================
 * 
 * To connect to a live LLM (such as Google Gemini, OpenAI, or a custom API gateway), 
 * replace the implementation above with the following fetch structure:
 * 
 * ```typescript
 * import { supabase } from "./supabase"
 * 
 * export async function getCoachResponseFromLLM(
 *   question: string,
 *   userId: string,
 *   userContext: { level: number; streak: number; habits: string }
 * ): Promise<string> {
 *   try {
 *     const response = await fetch("https://api.your-backend.com/ai/coach", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
 *       },
 *       body: JSON.stringify({
 *         message: question,
 *         userId: userId,
 *         context: {
 *           level: userContext.level,
 *           streak: userContext.streak,
 *           habits: userContext.habits,
 *           systemPrompt: "You are Green Hero's AI Sustainability Coach. Speak in a friendly, encouraging, and human-like voice. Keep explanations under 2-3 sentences. Never judge the user."
 *         }
 *       })
 *     })
 * 
 *     const data = await response.json()
 *     return data.reply || "I am connected, but having trouble speaking. Let's try again in a bit!"
 *   } catch (error) {
 *     console.error("AI Coach API call failed:", error)
 *     return "Sorry, I lost connection to the cloud. Let's practice simple carbon savings offline for now!"
 *   }
 * }
 * ```
 */
