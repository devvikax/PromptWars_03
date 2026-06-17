"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useAuthStore } from "./auth-store"
import { updateUserProfileOnDb } from "@/services/db-user"

export function getXpNeededForLevel(level: number): number {
  if (level === 1) return 100
  if (level === 2) return 150
  if (level === 3) return 250
  if (level === 4) return 500
  return 500
}

interface GameState {
  level: number
  xp: number
  xpNeeded: number
  streak: number
  waterDrops: number
  completedMissionIds: string[]
  completedAtDates: string[] // List of ISO date strings for streak validation
  showLevelUpCelebration: boolean
  
  // Actions
  addXp: (amount: number) => { levelUp: boolean }
  completeMissionLocal: (missionId: string, xpReward?: number, waterReward?: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  addWaterDrop: (amount: number) => void
  dismissLevelUpCelebration: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpNeeded: 100,
      streak: 5, // Starts at 5 based on mockups
      waterDrops: 2,
      completedMissionIds: [],
      completedAtDates: [],
      showLevelUpCelebration: false,

      addXp: (amount) => {
        const state = get()
        let newXp = state.xp + amount
        let newLevel = state.level
        let newXpNeeded = getXpNeededForLevel(newLevel)
        let levelUp = false

        while (newXp >= newXpNeeded) {
          levelUp = true
          newXp -= newXpNeeded
          newLevel += 1
          newXpNeeded = getXpNeededForLevel(newLevel)
        }

        set({
          xp: newXp,
          level: newLevel,
          xpNeeded: newXpNeeded,
          showLevelUpCelebration: levelUp,
        })

        // Sync to Supabase if authenticated
        const authUser = useAuthStore.getState().user
        if (authUser) {
          updateUserProfileOnDb(authUser.id, {
            level: newLevel,
            xp: newXp,
            isGuest: false,
          })
        }

        return { levelUp }
      },

      completeMissionLocal: (missionId, xpReward, waterReward) => {
        const today = new Date().toISOString().split("T")[0]
        const state = get()

        if (!state.completedMissionIds.includes(missionId)) {
          set({
            completedMissionIds: [...state.completedMissionIds, missionId],
            completedAtDates: [...state.completedAtDates, today]
          })
          
          // Complete reward triggers
          const xpAmt = xpReward !== undefined ? xpReward : 20
          const waterAmt = waterReward !== undefined ? waterReward : 1
          get().addXp(xpAmt)
          get().addWaterDrop(waterAmt)
        }
      },

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.streak + 1
          const authUser = useAuthStore.getState().user
          if (authUser) {
            updateUserProfileOnDb(authUser.id, {
              streak: newStreak,
              isGuest: false,
            })
          }
          return { streak: newStreak }
        })
      },

      resetStreak: () => {
        set({ streak: 0 })
        const authUser = useAuthStore.getState().user
        if (authUser) {
          updateUserProfileOnDb(authUser.id, {
            streak: 0,
            isGuest: false,
          })
        }
      },

      addWaterDrop: (amount) => {
        set((state) => {
          const newWater = state.waterDrops + amount
          const authUser = useAuthStore.getState().user
          if (authUser) {
            updateUserProfileOnDb(authUser.id, {
              waterDrops: newWater,
              isGuest: false,
            })
          }
          return { waterDrops: newWater }
        })
      },

      dismissLevelUpCelebration: () => {
        set({ showLevelUpCelebration: false })
      },

      resetGame: () => {
        set({
          level: 1,
          xp: 0,
          xpNeeded: 100,
          streak: 5,
          waterDrops: 2,
          completedMissionIds: [],
          completedAtDates: [],
          showLevelUpCelebration: false,
        })
        const authUser = useAuthStore.getState().user
        if (authUser) {
          updateUserProfileOnDb(authUser.id, {
            level: 1,
            xp: 0,
            streak: 5,
            waterDrops: 2,
            isGuest: false,
          })
        }
      }
    }),
    {
      name: "green-hero-game-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
