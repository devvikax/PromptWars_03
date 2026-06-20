"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface ProfileState {
  travelType: string | null
  acUsage: string | null
  foodType: string | null
  earthHealth: string
  streakRemindersEnabled: boolean
  dailyMotivationEnabled: boolean
  
  // Actions
  setPreferences: (prefs: { travelType: string; acUsage: string; foodType: string }) => void
  setNotificationPreferences: (prefs: { streakRemindersEnabled: boolean; dailyMotivationEnabled: boolean }) => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      travelType: null,
      acUsage: null,
      foodType: null,
      earthHealth: "Good 😊",
      streakRemindersEnabled: true,
      dailyMotivationEnabled: true,

      setPreferences: (prefs) => {
        set({
          travelType: prefs.travelType,
          acUsage: prefs.acUsage,
          foodType: prefs.foodType,
          earthHealth: "Good 😊",
        })
      },

      setNotificationPreferences: (prefs) => {
        set({
          streakRemindersEnabled: prefs.streakRemindersEnabled,
          dailyMotivationEnabled: prefs.dailyMotivationEnabled,
        })
      },

      resetProfile: () => {
        set({
          travelType: null,
          acUsage: null,
          foodType: null,
          earthHealth: "Good 😊",
          streakRemindersEnabled: true,
          dailyMotivationEnabled: true,
        })
      },
    }),
    {
      name: "green-hero-profile-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
