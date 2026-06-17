"use client"

import * as React from "react"
import { Sparkles, Trophy, ArrowRight } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/store/game-store"
import { SparkleEmitter } from "../ui/sparkle-emitter"

export function LevelUpModal() {
  const { level, showLevelUpCelebration, dismissLevelUpCelebration } = useGameStore()
  const [triggerEmitter, setTriggerEmitter] = React.useState(0)

  React.useEffect(() => {
    if (showLevelUpCelebration) {
      // Trigger a sparkle burst inside the modal
      setTriggerEmitter((prev) => prev + 1)
    }
  }, [showLevelUpCelebration])

  return (
    <Dialog
      isOpen={showLevelUpCelebration}
      onClose={dismissLevelUpCelebration}
      title="Level Up!"
      className="max-w-xs relative overflow-visible"
    >
      <div className="flex flex-col items-center gap-6 text-center relative">
        {/* Floating Sparkle particles inside the modal view */}
        <SparkleEmitter trigger={triggerEmitter} count={16} />

        {/* Level Up Badge circle */}
        <div className="w-20 h-20 rounded-full bg-[#FEF3C7] border-4 border-rewardGold flex items-center justify-center text-3xl select-none animate-bounce shadow-tactile-gold">
          🎉
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rewardGold/10 text-rewardGold border border-rewardGold rounded-button text-[10px] font-extrabold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Achievement Unlocked</span>
          </div>
          
          <h4 className="font-sans font-extrabold text-2xl text-text-primary-light dark:text-text-primary-dark mt-1">
            Level {level} reached!
          </h4>
          
          <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-[200px] mx-auto">
            You are officially a **Level {level} Carbon Cadet**! Your seedling tree is growing stronger.
          </p>
        </div>

        {/* Level comparison stats row */}
        <div className="flex items-center gap-4 bg-canvas-light dark:bg-canvas-dark p-3.5 rounded-card border-2 border-border-light dark:border-border-dark select-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide">Before</span>
            <span className="text-sm font-extrabold text-text-primary-light dark:text-text-primary-dark">Lvl {level - 1}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-primaryGreen" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide">After</span>
            <span className="text-sm font-extrabold text-primaryGreen dark:text-primaryGreen-dark">Lvl {level}</span>
          </div>
        </div>

        {/* Action button */}
        <Button
          variant="primary"
          onClick={dismissLevelUpCelebration}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <Trophy className="w-4 h-4" />
          Keep Growing!
        </Button>
      </div>
    </Dialog>
  )
}
