import { buildUserAIContext } from "./context"
import { buildMissionGenerationPrompt } from "./prompts"
import { getActiveProvider } from "./providers"

export interface AIMissionProposal {
  id: string
  title: string
  description: string
  category: "transport" | "energy" | "diet"
  difficulty: "easy" | "medium" | "advanced"
  estimatedImpact: "low" | "medium" | "high"
  xpReward: number
  waterReward: number
  successRate: number
}

/**
 * Invokes Llama/Ollama to generate three personalized missions (Easy, Medium, Advanced)
 * based on user context. Restructures and parses response with robust fallback defaults.
 */
export async function generateAIPersonalizedMissions(userId: string): Promise<AIMissionProposal[]> {
  try {
    const context = await buildUserAIContext(userId)
    const systemPrompt = buildMissionGenerationPrompt(context)
    const provider = getActiveProvider()

    const result = await provider.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate my 3 daily eco-missions now." },
    ])

    let rawReply = result.reply.trim()

    // Strip markdown JSON notation if returned by the model
    if (rawReply.includes("```")) {
      const parts = rawReply.split("```")
      const jsonCandidate = parts.find((p) => p.includes("[") || p.includes("{"))
      if (jsonCandidate) {
        rawReply = jsonCandidate.replace(/^json/i, "").trim()
      }
    }

    const parsedMissions: AIMissionProposal[] = JSON.parse(rawReply)
    if (Array.isArray(parsedMissions) && parsedMissions.length > 0) {
      // Return structured array (pad if less than 3, take top 3)
      return parsedMissions.slice(0, 3) as AIMissionProposal[]
    }
    throw new Error("Invalid array structure returned from LLM planner")
  } catch (error) {
    console.error("AI Mission Generation failed, serving fallback missions:", error)
    
    // Compile quick contextual parameters for default fallbacks
    let isCarOrMotorbike = false
    try {
      const context = await buildUserAIContext(userId)
      isCarOrMotorbike = context.travelType === "car" || context.travelType === "motorbike"
    } catch {
      // Ignored, fallback defaults apply
    }

    return [
      {
        id: "ai-fallback-easy",
        title: "Turn Off Wall Switches",
        description: "Turn off adapters and unused chargers at the socket.",
        category: "energy",
        difficulty: "easy",
        estimatedImpact: "low",
        xpReward: 15,
        waterReward: 1,
        successRate: 95
      },
      {
        id: "ai-fallback-medium",
        title: isCarOrMotorbike ? "Cycle or Walk Short Trip" : "Ditch Carbon Travel",
        description: isCarOrMotorbike 
          ? "Substitute a short drive under 2km by cycling or walking today." 
          : "Work or commute by public transit or foot today.",
        category: "transport",
        difficulty: "medium",
        estimatedImpact: "medium",
        xpReward: 25,
        waterReward: 1,
        successRate: 80
      },
      {
        id: "ai-fallback-advanced",
        title: "Zero Waste Plant Feast",
        description: "Consume only fresh, locally sourced vegetarian/vegan food today.",
        category: "diet",
        difficulty: "advanced",
        estimatedImpact: "high",
        xpReward: 40,
        waterReward: 2,
        successRate: 60
      }
    ]
  }
}
