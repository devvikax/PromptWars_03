"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/supabase"

export interface AchievementData {
  key: string
  title: string
  category: "beginner" | "consistency" | "impact" | "special"
  description: string
  iconSlug: string
  unlockCondition: string
}

export const ALL_ACHIEVEMENTS: AchievementData[] = [
  // Beginner
  {
    key: "first-mission",
    title: "First Steps",
    category: "beginner",
    description: "Logged your first sustainable carbon saving action.",
    iconSlug: "🌱",
    unlockCondition: "Complete 1 mission",
  },
  {
    key: "first-level-up",
    title: "Eco Sprout",
    category: "beginner",
    description: "Leveled up your ecosystem for the first time.",
    iconSlug: "🌿",
    unlockCondition: "Reach level 2",
  },
  {
    key: "first-week",
    title: "Eco Habit",
    category: "beginner",
    description: "Completed at least one action every day for a week.",
    iconSlug: "🗓️",
    unlockCondition: "Reach 7-day streak",
  },
  // Consistency
  {
    key: "streak-3",
    title: "Habit Builder",
    category: "consistency",
    description: "Logged actions for 3 days in a row.",
    iconSlug: "🔥",
    unlockCondition: "Reach 3-day streak",
  },
  {
    key: "streak-7",
    title: "Eco Devotee",
    category: "consistency",
    description: "Logged actions for 7 days in a row.",
    iconSlug: "⚡",
    unlockCondition: "Reach 7-day streak",
  },
  {
    key: "streak-30",
    title: "Consistency Legend",
    category: "consistency",
    description: "Logged actions for 30 days in a row.",
    iconSlug: "🏆",
    unlockCondition: "Reach 30-day streak",
  },
  {
    key: "streak-100",
    title: "Carbon Slayer",
    category: "consistency",
    description: "Logged actions for 100 days in a row.",
    iconSlug: "👑",
    unlockCondition: "Reach 100-day streak",
  },
  // Impact
  {
    key: "missions-10",
    title: "Green Apprentice",
    category: "impact",
    description: "Completed 10 sustainable carbon missions.",
    iconSlug: "🌲",
    unlockCondition: "Complete 10 missions",
  },
  {
    key: "missions-50",
    title: "Forest Guardian",
    category: "impact",
    description: "Completed 50 sustainable carbon missions.",
    iconSlug: "🌳",
    unlockCondition: "Complete 50 missions",
  },
  {
    key: "missions-100",
    title: "Ecosystem Savior",
    category: "impact",
    description: "Completed 100 sustainable carbon missions.",
    iconSlug: "🌎",
    unlockCondition: "Complete 100 missions",
  },
  {
    key: "missions-500",
    title: "Planet Healer",
    category: "impact",
    description: "Completed 500 sustainable carbon missions.",
    iconSlug: "🪐",
    unlockCondition: "Complete 500 missions",
  },
  // Special
  {
    key: "earth-protector",
    title: "Earth Protector",
    category: "special",
    description: "Unlocked Level 3 carbon savings.",
    iconSlug: "🌍",
    unlockCondition: "Reach level 3",
  },
  {
    key: "eco-warrior",
    title: "Eco Warrior",
    category: "special",
    description: "Unlocked Level 7 carbon savings.",
    iconSlug: "🛡️",
    unlockCondition: "Reach level 7",
  },
  {
    key: "green-champion",
    title: "Green Champion",
    category: "special",
    description: "Unlocked Level 15 carbon savings.",
    iconSlug: "🥇",
    unlockCondition: "Reach level 15",
  },
]

interface AchievementState {
  unlockedAchievementKeys: string[]
  unlockAchievement: (key: string, userId?: string) => Promise<boolean>
  syncWithSupabase: (userId: string) => Promise<void>
  loadAchievements: (userId?: string) => Promise<void>
  resetAchievements: () => void
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedAchievementKeys: [],

      unlockAchievement: async (key, userId) => {
        const current = get().unlockedAchievementKeys
        if (current.includes(key)) return false

        const updated = [...current, key]
        set({ unlockedAchievementKeys: updated })

        if (userId) {
          try {
            const headers = await getAuthHeader()
            const res = await fetch("/api/achievements", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
            if (!res.ok) throw new Error("API error")
          } catch (e) {
            console.warn("Failed to sync achievement unlock to API, saved offline:", e)
          }
        }
        return true
      },

      syncWithSupabase: async (userId) => {
        const localKeys = get().unlockedAchievementKeys
        if (localKeys.length === 0) return

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/achievements?unlocked=true", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const dbKeys: string[] = await res.json()

          const combined = Array.from(new Set([...localKeys, ...dbKeys]))
          set({ unlockedAchievementKeys: combined })

          const unsyncedKeys = localKeys.filter((k) => !dbKeys.includes(k))
          for (const key of unsyncedKeys) {
            await fetch("/api/achievements", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
          }
        } catch (e) {
          console.error("Error syncing achievements to API:", e)
        }
      },

      loadAchievements: async (userId) => {
        if (!userId) return

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/achievements?unlocked=true", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const keys = await res.json()
          if (keys && keys.length > 0) {
            set({ unlockedAchievementKeys: keys })
          }
        } catch (e) {
          console.warn("Could not load user achievements from API, staying offline:", e)
        }
      },

      resetAchievements: () => {
        set({ unlockedAchievementKeys: [] })
      },
    }),
    {
      name: "green-hero-achievements",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
