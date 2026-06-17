"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useGameStore } from "./game-store"

interface GuestState {
  guestUserId: string | null
  showSaveProgressModal: boolean
  hasDismissedSaveProgress: boolean
  
  // Actions
  initializeGuestSession: () => void
  setSaveProgressModal: (show: boolean) => void
  dismissSaveProgress: () => void
  checkEngagementMilestones: () => boolean // Returns true if any milestone is met
  resetGuestSession: () => void
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guestUserId: null,
      showSaveProgressModal: false,
      hasDismissedSaveProgress: false,

      initializeGuestSession: () => {
        if (!get().guestUserId) {
          const uuid = "guest_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          set({ guestUserId: uuid, hasDismissedSaveProgress: false })
          
          // Set guest cookie for Next.js Middleware route checking
          if (typeof document !== "undefined") {
            document.cookie = `green-hero-guest-active=true; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
          }
        }
      },

      setSaveProgressModal: (show) => {
        set({ showSaveProgressModal: show })
      },

      dismissSaveProgress: () => {
        set({ hasDismissedSaveProgress: true, showSaveProgressModal: false })
      },

      checkEngagementMilestones: () => {
        if (get().hasDismissedSaveProgress) return false

        const gameState = useGameStore.getState()
        const reachedLevel = gameState.level >= 3
        const reachedStreak = gameState.streak >= 3
        const completedMissionsCount = gameState.completedMissionIds.length >= 5

        const meetsMilestone = reachedLevel || reachedStreak || completedMissionsCount

        if (meetsMilestone && !get().showSaveProgressModal) {
          set({ showSaveProgressModal: true })
          return true
        }

        return false
      },

      resetGuestSession: () => {
        set({ guestUserId: null, showSaveProgressModal: false, hasDismissedSaveProgress: false })
        if (typeof document !== "undefined") {
          document.cookie = "green-hero-guest-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        }
      }
    }),
    {
      name: "green-hero-guest-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
