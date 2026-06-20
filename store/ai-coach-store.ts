"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/auth-header"
import { getCoachResponse } from "@/services/llm-coach-service"

export type CoachEmotion = "happy" | "encouraging" | "cheering" | "thinking"

export interface ChatMessage {
  sender: "user" | "coach"
  text: string
  timestamp: string
}

interface CoachState {
  currentMessage: string
  dailyInsights: string[]
  chatHistory: ChatMessage[]
  coachEmotion: CoachEmotion
  
  // Actions
  triggerGreeting: (streak: number, level: number, completedCountToday: number, missedDays?: boolean) => void
  askCoach: (question: string) => Promise<void>
  addChatMessage: (sender: "user" | "coach", text: string) => void
  generateDailyInsights: (streak: number, completedThisWeek: number, flowersUnlocked: boolean, nestUnlocked: boolean) => void
  syncInsightsWithSupabase: (userId: string) => Promise<void>
  resetCoach: () => void
}

export const useAiCoachStore = create<CoachState>()(
  persist(
    (set, get) => ({
      currentMessage: "Welcome back, Hero! Let's work together to nurture your ecosystem today. 🌱",
      dailyInsights: [
        "Your transport choices represent your biggest carbon reduction opportunity.",
        "You completed 0 missions this week. Doing even one easy action builds consistency!",
        "Your centerpiece tree is growing steadily. Let's make it flourish!"
      ],
      chatHistory: [],
      coachEmotion: "happy",

      triggerGreeting: (streak, level, completedCountToday, missedDays = false) => {
        let message = ""
        let emotion: CoachEmotion = "happy"

        if (missedDays) {
          message = "Welcome back! Don't worry about any missed days or broken streaks. Consistency is a journey, and every small action counts! Try a super easy mission today. 💚"
          emotion = "encouraging"
        } else if (completedCountToday > 0) {
          message = `Fabulous job! You completed ${completedCountToday} carbon saving action${completedCountToday > 1 ? "s" : ""} today. Your ecosystem feels much healthier! 🌸`
          emotion = "cheering"
        } else if (streak >= 7) {
          message = `You are on a spectacular ${streak}-day streak! Keep this wonderful momentum going, your tree is glowing! ✨`
          emotion = "cheering"
        } else if (streak >= 3) {
          message = `A ${streak}-day streak! You are solidifying green habits in your lifestyle. Keep up the high energy! 🔥`
          emotion = "happy"
        } else {
          // Standard rotation of friendly guidances
          const tips = [
            "Remember, setting your AC temperature just 1°C higher saves a significant amount of electricity. 💡",
            "Try walking a short distance today instead of driving. It's good for your health and the planet! 🚶",
            "Swapping meat for a plant-based meal today is one of the easiest ways to scale down carbon output. 🥗",
            "Every mission completed feeds your centerpiece tree and helps you unlock beautiful flowers! 🌺"
          ]
          message = tips[Math.floor(Math.random() * tips.length)] || "Let's explore simple ways to save carbon today!"
          emotion = "encouraging"
        }

        set({ currentMessage: message, coachEmotion: emotion })
      },

      askCoach: async (question) => {
        get().addChatMessage("user", question)
        set({ coachEmotion: "thinking" })

        const history = get().chatHistory
        // Retrieve response from Llama / rule-based NLP layer
        const responseText = await getCoachResponse(question, history)

        set({ coachEmotion: "happy" })
        get().addChatMessage("coach", responseText)
      },

      addChatMessage: (sender, text) => {
        const newMessage: ChatMessage = {
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        set((state) => ({
          chatHistory: [...state.chatHistory, newMessage].slice(-20) // Keep last 20 messages
        }))
      },

      generateDailyInsights: (streak, completedThisWeek, flowersUnlocked, nestUnlocked) => {
        const insights = []

        // Insight 1: Carbon stats / category advice
        insights.push("Your transport habits represent your biggest opportunity to cut carbon.")

        // Insight 2: Weekly summary
        insights.push(
          completedThisWeek > 0
            ? `You completed ${completedThisWeek} mission${completedThisWeek > 1 ? "s" : ""} this week. Outstanding consistency!`
            : "No missions completed this week yet. Logging one quick action gets you back on track!"
        )

        // Insight 3: Ecosystem milestones
        if (!flowersUnlocked) {
          insights.push("Maintain a 7-day streak or reach Level 7 to unlock Blooming Flowers on your island base!")
        } else if (!nestUnlocked) {
          insights.push("You are close to unlocking a bird nest on your branches! Complete 30 missions.")
        } else {
          insights.push("Your island is thriving! Try activating the Golden Canopy once you unlock level 3 carbon savings.")
        }

        set({ dailyInsights: insights })
      },

      syncInsightsWithSupabase: async (userId) => {
        try {
          const insights = get().dailyInsights
          // Sync the primary weekly insights to API
          if (insights.length > 0) {
            const headers = await getAuthHeader()
            const res = await fetch("/api/ai-coach", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({
                action: "sync-insights",
                insights,
              }),
            })
            if (!res.ok) throw new Error("API error")
          }
        } catch (e) {
          console.warn("Failed to sync insights via API:", e)
        }
      },

      resetCoach: () => {
        set({
          currentMessage: "Welcome back, Hero! Let's work together to nurture your ecosystem today. 🌱",
          chatHistory: [],
          coachEmotion: "happy",
        })
      }
    }),
    {
      name: "green-hero-ai-coach-state",
      storage: createJSONStorage(() => localStorage),
      // Avoid persisting the full live chat dialog history across separate sessions if preferred
      partialize: (state) => ({
        currentMessage: state.currentMessage,
        dailyInsights: state.dailyInsights,
      })
    }
  )
)
