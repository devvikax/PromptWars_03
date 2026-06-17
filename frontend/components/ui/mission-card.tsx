"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Flame, Trophy, Compass, Droplet } from "lucide-react"
import { useGameStore } from "@/store/game-store"
import { useToastStore } from "@/store/toast-store"
import { Card } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

import { useMissionStore } from "@/store/mission-store"
import { useAuthStore } from "@/store/auth-store"
import { completeMissionOnDb } from "@/services/db-missions"

export interface MissionCardProps {
  id: string
  title: string
  description: string
  xpReward: number
  waterReward: number
  category: "transport" | "energy" | "diet"
}

export function MissionCard({
  id,
  title,
  description,
  xpReward,
  waterReward,
  category,
}: MissionCardProps) {
  const completedMissionIds = useGameStore((state) => state.completedMissionIds)
  const completeMission = useGameStore((state) => state.completeMissionLocal)
  const addToast = useToastStore((state) => state.addToast)

  const isCompleted = completedMissionIds.includes(id)

  const handleComplete = () => {
    if (isCompleted) return

    const missionStore = useMissionStore.getState()
    const isActive = missionStore.activeMissions.some((m) => m.id === id)

    if (isActive) {
      missionStore.completeActiveMission(id)
    } else {
      // Fallback/offline completing from catalog
      useGameStore.getState().completeMissionLocal(id, xpReward, waterReward)

      // If user is logged in, sync this completed fallback mission to the database too!
      const authUser = useAuthStore.getState().user
      if (authUser) {
        completeMissionOnDb(authUser.id, id)
      }
    }
    addToast(`Mission Completed! +${xpReward} XP, +${waterReward} Water Drop 💧`, "success")
  }

  const categoryEmojis = {
    transport: "🚶",
    energy: "🔌",
    diet: "🥗",
  }

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden border-2 transition-all duration-300",
        isCompleted
          ? "border-primaryGreen/50 bg-[#F4FBF7] shadow-none dark:border-primaryGreen-dark/40 dark:bg-cardbg-dark/60"
          : "border-border-light bg-white dark:border-border-dark dark:bg-cardbg-dark"
      )}
    >
      {/* Category Icon Badge & Status */}
      <div className="flex items-center justify-between">
        <Badge variant={isCompleted ? "primary" : "accent"} className="flex items-center gap-1.5">
          <span role="img" aria-label={`${category} category`}>
            {categoryEmojis[category] || "🌟"}
          </span>
          <span className="capitalize">{category}</span>
        </Badge>
        {isCompleted && (
          <Badge variant="primary" className="flex items-center gap-1">
            <Check className="w-3 h-3" /> Completed
          </Badge>
        )}
      </div>

      {/* Title and Description */}
      <div className="flex flex-col gap-1">
        <h4
          className={cn(
            "font-sans font-bold text-lg leading-tight transition-colors",
            isCompleted
              ? "text-text-primary-light/60 dark:text-text-primary-dark/60 line-through"
              : "text-text-primary-light dark:text-text-primary-dark"
          )}
        >
          {title}
        </h4>
        <p
          className={cn(
            "font-sans text-sm leading-relaxed",
            isCompleted
              ? "text-text-muted-light/60 dark:text-text-muted-dark/60"
              : "text-text-muted-light dark:text-text-muted-dark"
          )}
        >
          {description}
        </p>
      </div>

      {/* Rewards Row & Action Button */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-border-light dark:border-border-dark">
        {/* Rewards */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-extrabold text-rewardGold dark:text-rewardGold-dark">
            <Trophy className="w-4 h-4" />
            <span>+{xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-waterBlue-light dark:text-waterBlue-dark">
            <Droplet className="w-4 h-4 fill-current" />
            <span>+{waterReward} Drop</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant={isCompleted ? "outline" : "primary"}
          disabled={isCompleted}
          onClick={handleComplete}
          className="px-4 py-2 text-xs h-9"
          aria-label={isCompleted ? `Mission ${title} completed` : `Mark mission ${title} as completed`}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1 text-[#065F46] dark:text-[#A7F3D0]">
              Done <Check className="w-3.5 h-3.5" />
            </span>
          ) : (
            "Complete"
          )}
        </Button>
      </div>
    </Card>
  )
}
