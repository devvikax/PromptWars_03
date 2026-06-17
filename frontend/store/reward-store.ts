"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/supabase"

export interface RewardData {
  key: string
  title: string
  description: string
  rewardType: "ecosystem_upgrade" | "collection_item" | "xp_boost"
  category: "flower" | "nest" | "creature" | "wonder" | "decoration"
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockCondition: string
}

export const ALL_REWARDS: RewardData[] = [
  {
    key: "reward-flowers",
    title: "Blooming Flowers",
    description: "Ecosystem flowers begin blooming on the island base.",
    rewardType: "ecosystem_upgrade",
    category: "flower",
    rarity: "common",
    unlockCondition: "Reach 7-day streak or Stage 5",
  },
  {
    key: "reward-nest",
    title: "Cozy Nest",
    description: "Unlock a cozy bird nest on the tree branch.",
    rewardType: "ecosystem_upgrade",
    category: "nest",
    rarity: "common",
    unlockCondition: "Complete 30 missions",
  },
  {
    key: "reward-fireflies",
    title: "Magical Fireflies",
    description: "Unlock glowing fireflies floating around at night.",
    rewardType: "ecosystem_upgrade",
    category: "creature",
    rarity: "rare",
    unlockCondition: "Complete 100 missions",
  },
  {
    key: "reward-waterfall",
    title: "Ecosystem Waterfall",
    description: "Unlock the cascading waterfall flowing off the island edge.",
    rewardType: "ecosystem_upgrade",
    category: "wonder",
    rarity: "legendary",
    unlockCondition: "Complete 200 missions",
  },
  {
    key: "reward-golden-leaves",
    title: "Rare Golden Leaves",
    description: "Unlock the legendary golden leaves for your centerpiece tree.",
    rewardType: "ecosystem_upgrade",
    category: "flower",
    rarity: "legendary",
    unlockCondition: "Unlock the Earth Protector achievement",
  },
]

export interface CelebrationUnlock {
  id: string
  type: "achievement" | "collection_item" | "reward"
  title: string
  description?: string
  rarity?: "common" | "rare" | "epic" | "legendary"
  icon: string
}

interface RewardState {
  unlockedRewardKeys: string[]
  pendingUnlocks: CelebrationUnlock[]
  currentCelebration: CelebrationUnlock | null
  unlockReward: (key: string, userId?: string) => Promise<boolean>
  addPendingUnlock: (unlock: Omit<CelebrationUnlock, "id">) => void
  nextCelebration: () => void
  syncWithSupabase: (userId: string) => Promise<void>
  loadRewards: (userId?: string) => Promise<void>
  resetRewards: () => void
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      unlockedRewardKeys: [],
      pendingUnlocks: [],
      currentCelebration: null,

      unlockReward: async (key, userId) => {
        const current = get().unlockedRewardKeys
        if (current.includes(key)) return false

        const updated = [...current, key]
        set({ unlockedRewardKeys: updated })

        if (userId) {
          try {
            const headers = await getAuthHeader()
            const res = await fetch("/api/rewards", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
            if (!res.ok) throw new Error("API error")
          } catch (e) {
            console.warn("Failed to sync reward unlock to API, saved offline:", e)
          }
        }
        return true
      },

      addPendingUnlock: (unlock) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newUnlock = { ...unlock, id }
        
        set((state) => {
          const queue = [...state.pendingUnlocks, newUnlock]
          const active = state.currentCelebration ? state.currentCelebration : queue[0]
          const remainingQueue = state.currentCelebration ? queue : queue.slice(1)
          
          return {
            pendingUnlocks: remainingQueue,
            currentCelebration: active,
          }
        })
      },

      nextCelebration: () => {
        set((state) => {
          if (state.pendingUnlocks.length === 0) {
            return { currentCelebration: null }
          }
          const next = state.pendingUnlocks[0]
          return {
            currentCelebration: next,
            pendingUnlocks: state.pendingUnlocks.slice(1),
          }
        })
      },

      syncWithSupabase: async (userId) => {
        // Simple offline sync
        const localKeys = get().unlockedRewardKeys
        if (localKeys.length === 0) return
        try {
          const headers = await getAuthHeader()
          for (const key of localKeys) {
            await fetch("/api/rewards", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
          }
        } catch (e) {
          console.error("Error syncing rewards to API:", e)
        }
      },

      loadRewards: async (userId) => {
        if (!userId) return

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/rewards", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const keys = await res.json()
          if (keys && keys.length > 0) {
            set({ unlockedRewardKeys: keys })
          }
        } catch (e) {
          console.warn("Could not load user rewards from API:", e)
        }
      },

      resetRewards: () => {
        set({ unlockedRewardKeys: [], pendingUnlocks: [], currentCelebration: null })
      },
    }),
    {
      name: "green-hero-rewards-unlocks",
      storage: createJSONStorage(() => localStorage),
      // Prevent popups state from being persisted
      partialize: (state) => ({
        unlockedRewardKeys: state.unlockedRewardKeys,
      }),
    }
  )
)
