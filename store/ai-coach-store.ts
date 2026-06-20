"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/auth-header"

export type CoachEmotion = "happy" | "encouraging" | "cheering" | "thinking"

export interface ChatMessage {
  id?: string
  sender: "user" | "coach"
  text: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
}

export interface AISuggestedMission {
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

interface CoachState {
  currentMessage: string
  dailyInsights: string[]
  chatHistory: ChatMessage[]
  coachEmotion: CoachEmotion
  conversations: Conversation[]
  activeConversationId: string
  loadingConversations: boolean
  generatingMissions: boolean
  suggestedMissions: AISuggestedMission[]
  feedbackState: Record<string, "up" | "down"> // keyed by message index or content

  // Actions
  triggerGreeting: (streak: number, level: number, completedCountToday: number, missedDays?: boolean) => void
  addChatMessage: (sender: "user" | "coach", text: string, id?: string) => void
  generateDailyInsights: (streak: number, completedThisWeek: number, flowersUnlocked: boolean, nestUnlocked: boolean) => void
  resetCoach: () => void

  // Extended AI Features
  loadConversations: () => Promise<void>
  selectConversation: (convId: string) => Promise<void>
  createNewConversation: (title?: string) => Promise<string>
  askCoach: (question: string, subAction?: string, additionalData?: Record<string, any>) => Promise<void>
  submitMessageFeedback: (messageText: string, rating: "up" | "down") => Promise<void>
  generateCustomMissions: () => Promise<void>
  triggerStreakRescue: () => Promise<void>
  triggerProgressReview: (interval: "weekly" | "monthly") => Promise<void>
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
      conversations: [],
      activeConversationId: "default_chat",
      loadingConversations: false,
      generatingMissions: false,
      suggestedMissions: [],
      feedbackState: {},

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

      addChatMessage: (sender, text, id) => {
        const newMessage: ChatMessage = {
          id: id || `${Date.now()}-${sender}`,
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
        insights.push("Your transport habits represent your biggest opportunity to cut carbon.")
        insights.push(
          completedThisWeek > 0
            ? `You completed ${completedThisWeek} mission${completedThisWeek > 1 ? "s" : ""} this week. Outstanding consistency!`
            : "No missions completed this week yet. Logging one quick action gets you back on track!"
        )

        if (!flowersUnlocked) {
          insights.push("Maintain a 7-day streak or reach Level 7 to unlock Blooming Flowers on your island base!")
        } else if (!nestUnlocked) {
          insights.push("You are close to unlocking a bird nest on your branches! Complete 30 missions.")
        } else {
          insights.push("Your island is thriving! Try activating the Golden Canopy once you unlock level 3 carbon savings.")
        }

        set({ dailyInsights: insights })
      },

      loadConversations: async () => {
        set({ loadingConversations: true })
        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/ai-coach?action=list-conversations", {
            method: "GET",
            headers,
          })
          if (res.ok) {
            const data = await res.json()
            set({ conversations: data.conversations || [] })
          }
        } catch (e) {
          console.error("Failed to load conversations:", e)
        } finally {
          set({ loadingConversations: false })
        }
      },

      selectConversation: async (convId) => {
        set({ activeConversationId: convId, coachEmotion: "thinking" })
        try {
          const headers = await getAuthHeader()
          const res = await fetch(`/api/ai-coach?action=get-messages&conversationId=${convId}`, {
            method: "GET",
            headers,
          })
          if (res.ok) {
            const data = await res.json()
            set({ chatHistory: data.messages || [] })
          }
        } catch (e) {
          console.error("Failed to load messages:", e)
        } finally {
          set({ coachEmotion: "happy" })
        }
      },

      createNewConversation: async (title) => {
        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/ai-coach", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              action: "create-conversation",
              title,
            })
          })
          if (res.ok) {
            const data = await res.json()
            const conv = data.conversation
            if (conv) {
              set((state) => ({
                conversations: [conv, ...state.conversations],
                activeConversationId: conv.id,
                chatHistory: [],
              }))
              return conv.id
            }
          }
        } catch (e) {
          console.error("Failed to create conversation:", e)
        }
        return "default_chat"
      },

      askCoach: async (question, subAction, additionalData) => {
        const activeConversationId = get().activeConversationId || "default_chat"
        get().addChatMessage("user", question)
        set({ coachEmotion: "thinking" })

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/ai-coach", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              question,
              history: get().chatHistory,
              conversationId: activeConversationId,
              subAction,
              ...additionalData,
            })
          })

          set({ coachEmotion: "happy" })

          if (res.ok) {
            const data = await res.json()
            get().addChatMessage("coach", data.reply)
          } else {
            get().addChatMessage("coach", "Oops! I encountered an error. Please try again.")
          }
        } catch (e) {
          console.error("Failed to ask AI Coach:", e)
          set({ coachEmotion: "happy" })
          get().addChatMessage("coach", "Network error. Please make sure the dev server is active!")
        }
      },

      submitMessageFeedback: async (messageText, rating) => {
        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/ai-coach", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              action: "submit-feedback",
              messageText,
              type: rating,
            })
          })
          if (res.ok) {
            set((state) => ({
              feedbackState: {
                ...state.feedbackState,
                [messageText]: rating
              }
            }))
          }
        } catch (e) {
          console.error("Failed to submit feedback:", e)
        }
      },

      generateCustomMissions: async () => {
        set({ generatingMissions: true })
        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/ai-coach", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              action: "generate-missions"
            })
          })
          if (res.ok) {
            const data = await res.json()
            set({ suggestedMissions: data.missions || [] })
          }
        } catch (e) {
          console.error("Failed to generate custom missions:", e)
        } finally {
          set({ generatingMissions: false })
        }
      },

      triggerStreakRescue: async () => {
        await get().askCoach("Help me rescue my streak! 🩹", "streak-rescue")
      },

      triggerProgressReview: async (interval) => {
        await get().askCoach(`Can you give me my ${interval} review? 📊`, "progress-review", { interval })
      },

      resetCoach: () => {
        set({
          currentMessage: "Welcome back, Hero! Let's work together to nurture your ecosystem today. 🌱",
          chatHistory: [],
          coachEmotion: "happy",
          conversations: [],
          activeConversationId: "default_chat",
          suggestedMissions: [],
          feedbackState: {},
        })
      }
    }),
    {
      name: "green-hero-ai-coach-state",
      storage: createJSONStorage(() => localStorage),
      // Persist conversations context
      partialize: (state) => ({
        currentMessage: state.currentMessage,
        dailyInsights: state.dailyInsights,
        activeConversationId: state.activeConversationId,
        conversations: state.conversations,
      })
    }
  )
)
