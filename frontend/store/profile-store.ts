"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface ProfileState {
  travelType: string | null
  acUsage: string | null
  foodType: string | null
  earthHealth: string
  
  // Actions
  setPreferences: (prefs: { travelType: string; acUsage: string; foodType: string }) => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      travelType: null,
      acUsage: null,
      foodType: null,
      earthHealth: "Good 😊",

      setPreferences: (prefs) => {
        set({
          travelType: prefs.travelType,
          acUsage: prefs.acUsage,
          foodType: prefs.foodType,
          earthHealth: "Good 😊",
        })
      },

      resetProfile: () => {
        set({
          travelType: null,
          acUsage: null,
          foodType: null,
          earthHealth: "Good 😊",
        })
      },
    }),
    {
      name: "green-hero-profile-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
