"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/auth-header"

interface CategoryStats {
  completed: number
  ignored: number
  skipped: number
}

interface BehaviorState {
  ignoredMissionsCount: number
  categoryPreferences: Record<string, CategoryStats>
  
  // Actions
  recordMissionCompletion: (category: string) => void
  recordMissionIgnore: (category: string) => void
  recordMissionSkip: (category: string) => void
  resetBehavior: () => void
  syncWithSupabase: (userId: string) => Promise<void>
  loadBehavior: (userId?: string) => Promise<void>
}

const initialPreferences: Record<string, CategoryStats> = {
  transport: { completed: 0, ignored: 0, skipped: 0 },
  energy: { completed: 0, ignored: 0, skipped: 0 },
  diet: { completed: 0, ignored: 0, skipped: 0 },
}

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      ignoredMissionsCount: 0,
      categoryPreferences: { ...initialPreferences },

      recordMissionCompletion: (category) => {
        set((state) => {
          const prefs = { ...state.categoryPreferences }
          if (!prefs[category]) {
            prefs[category] = { completed: 0, ignored: 0, skipped: 0 }
          }
          prefs[category].completed += 1
          
          return {
            categoryPreferences: prefs,
            ignoredMissionsCount: 0, // Reset ignore count on any success!
          }
        })
      },

      recordMissionIgnore: (category) => {
        set((state) => {
          const prefs = { ...state.categoryPreferences }
          if (!prefs[category]) {
            prefs[category] = { completed: 0, ignored: 0, skipped: 0 }
          }
          prefs[category].ignored += 1

          return {
            categoryPreferences: prefs,
            ignoredMissionsCount: state.ignoredMissionsCount + 1,
          }
        })
      },

      recordMissionSkip: (category) => {
        set((state) => {
          const prefs = { ...state.categoryPreferences }
          if (!prefs[category]) {
            prefs[category] = { completed: 0, ignored: 0, skipped: 0 }
          }
          prefs[category].skipped += 1

          return {
            categoryPreferences: prefs,
            ignoredMissionsCount: state.ignoredMissionsCount + 1,
          }
        })
      },

      resetBehavior: () => {
        set({
          ignoredMissionsCount: 0,
          categoryPreferences: {
            transport: { completed: 0, ignored: 0, skipped: 0 },
            energy: { completed: 0, ignored: 0, skipped: 0 },
            diet: { completed: 0, ignored: 0, skipped: 0 },
          },
        })
      },

      syncWithSupabase: async (userId) => {
        try {
          const state = get()
          const headers = await getAuthHeader()
          const res = await fetch("/api/behavior", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({
              ignoredMissionsCount: state.ignoredMissionsCount,
              categoryPreferences: state.categoryPreferences,
            }),
          })
          if (!res.ok) throw new Error("API error")
        } catch (e) {
          console.warn("Failed to sync behavior state to API, saved offline:", e)
        }
      },

      loadBehavior: async (userId) => {
        if (!userId) return

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/behavior", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const data = await res.json()
          if (data) {
            set({
              ignoredMissionsCount: data.ignoredMissionsCount || 0,
              categoryPreferences: data.categoryPreferences || {},
            })
          }
        } catch (e) {
          console.warn("Failed to load behavior state from API, using local fallback:", e)
        }
      },
    }),
    {
      name: "green-hero-behavior-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
