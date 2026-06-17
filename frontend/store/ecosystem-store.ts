"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type WeatherType = "sunny" | "cloudy" | "rain" | "wind" | "night"
export type SeasonType = "spring" | "summer" | "autumn" | "winter"

interface EcosystemState {
  weather: WeatherType
  season: SeasonType
  activeDecorations: string[] // e.g. 'deco-lantern', 'wonder-crystal', 'wonder-pond', 'deco-lights'
  customLeavesEnabled: boolean // Earth protector golden leaves
  setWeather: (weather: WeatherType) => void
  setSeason: (season: SeasonType) => void
  toggleDecoration: (key: string) => void
  setCustomLeavesEnabled: (enabled: boolean) => void
  resetEcosystem: () => void
}

export const useEcosystemStore = create<EcosystemState>()(
  persist(
    (set) => ({
      weather: "sunny",
      season: "spring",
      activeDecorations: [],
      customLeavesEnabled: false,

      setWeather: (weather) => set({ weather }),
      setSeason: (season) => set({ season }),
      
      toggleDecoration: (key) =>
        set((state) => {
          const current = state.activeDecorations
          const updated = current.includes(key)
            ? current.filter((k) => k !== key)
            : [...current, key]
          return { activeDecorations: updated }
        }),

      setCustomLeavesEnabled: (customLeavesEnabled) => set({ customLeavesEnabled }),

      resetEcosystem: () =>
        set({
          weather: "sunny",
          season: "spring",
          activeDecorations: [],
          customLeavesEnabled: false,
        }),
    }),
    {
      name: "green-hero-ecosystem-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
