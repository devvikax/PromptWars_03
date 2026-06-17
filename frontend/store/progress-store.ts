"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { ProgressLog } from "@/types"

interface ProgressState {
  totalCarbonSavedG: number
  totalWaterSavedL: number
  progressLogs: ProgressLog[]
  
  // Actions
  addProgress: (carbonG: number, waterL: number) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      totalCarbonSavedG: 0,
      totalWaterSavedL: 0,
      progressLogs: [],

      addProgress: (carbonG, waterL) => {
        const today = new Date().toISOString().split("T")[0]
        const logId = "log_" + Math.random().toString(36).substring(2, 9)

        set((state) => {
          const existingLogIndex = state.progressLogs.findIndex((log) => log.logDate === today)
          let updatedLogs = [...state.progressLogs]

          if (existingLogIndex !== -1) {
            // Update today's entry
            const log = updatedLogs[existingLogIndex]
            updatedLogs[existingLogIndex] = {
              ...log,
              carbonSavedG: log.carbonSavedG + carbonG,
              waterSavedL: log.waterSavedL + waterL,
            }
          } else {
            // Add new entry
            updatedLogs.push({
              id: logId,
              userId: "guest",
              carbonSavedG: carbonG,
              waterSavedL: waterL,
              logDate: today,
            })
          }

          return {
            totalCarbonSavedG: state.totalCarbonSavedG + carbonG,
            totalWaterSavedL: state.totalWaterSavedL + waterL,
            progressLogs: updatedLogs,
          }
        })
      },

      resetProgress: () => {
        set({
          totalCarbonSavedG: 0,
          totalWaterSavedL: 0,
          progressLogs: [],
        })
      },
    }),
    {
      name: "green-hero-progress-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
