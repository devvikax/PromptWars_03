import * as React from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AchievementBadgeProps {
  title: string
  description: string
  emoji: React.ReactNode
  isUnlocked: boolean
}

export function AchievementBadge({ title, description, emoji, isUnlocked }: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-5 bg-white border-2 rounded-card text-center relative overflow-hidden select-none transition-all duration-200 shadow-tactile-card dark:bg-cardbg-dark",
        {
          "border-border-light text-text-primary-light dark:border-border-dark dark:text-text-primary-dark":
            isUnlocked,
          "border-gray-200 text-gray-400 bg-gray-50/50 dark:border-border-dark dark:bg-cardbg-dark/40 dark:text-text-muted-dark":
            !isUnlocked,
        }
      )}
    >
      {/* Badge Icon Circle */}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 border-2 transition-transform duration-200",
          {
            "bg-canvas-light border-[#A7F3D0] filter-none scale-100 hover:scale-105": isUnlocked,
            "bg-gray-100 border-gray-200 filter grayscale scale-95 dark:bg-border-dark": !isUnlocked,
          }
        )}
      >
        {emoji}
      </div>

      {/* Info */}
      <h5 className="font-sans font-bold text-sm tracking-wide mb-1 uppercase">
        {title}
      </h5>
      <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark max-w-[140px] leading-relaxed">
        {description}
      </p>

      {/* Locked overlay lock icon */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full dark:bg-border-dark" aria-hidden="true">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}
    </div>
  )
}
