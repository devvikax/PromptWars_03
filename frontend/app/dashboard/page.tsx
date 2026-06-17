"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Trophy, RefreshCw, User } from "lucide-react"
import { useGameStore } from "@/store/game-store"
import { useMissionStore } from "@/store/mission-store"
import { Progress } from "@/components/ui/progress"
import { TreeWidget } from "@/components/ui/tree-widget"
import { MissionCard } from "@/components/ui/mission-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SparkleEmitter } from "@/components/ui/sparkle-emitter"
import { LevelUpModal } from "@/components/auth/level-up-modal"
import { AiCoachCompanion } from "@/components/ui/ai-coach-companion"

export default function DashboardPage() {
  const { level, xp, xpNeeded, streak, resetGame, completedMissionIds } = useGameStore()
  const { activeMissions, refreshDailyMissions } = useMissionStore()

  const [particleTrigger, setParticleTrigger] = React.useState(0)
  const completedCount = completedMissionIds.length

  // Whenever completedCount increases, trigger particle sparkles
  React.useEffect(() => {
    if (completedCount > 0) {
      setParticleTrigger((prev) => prev + 1)
    }
  }, [completedCount])

  // Generate missions on first mount if list is empty
  React.useEffect(() => {
    if (activeMissions.length === 0 && completedCount === 0) {
      refreshDailyMissions()
    }
  }, [activeMissions.length, completedCount, refreshDailyMissions])

  // Streak motivational labels
  let streakMotivation = "Complete a daily mission to start your streak fire! 🔥"
  if (streak >= 5) {
    streakMotivation = "Incredible effort! You are a certified Eco Champion! 🌍"
  } else if (streak >= 3) {
    streakMotivation = "You are on a roll! Keep the fire burning today! 💪"
  } else if (streak > 0) {
    streakMotivation = "Great start! Log in tomorrow to increase your streak."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full font-sans pb-10 relative overflow-visible"
    >
      {/* Dynamic sparkle emitter celebration trigger */}
      <SparkleEmitter trigger={particleTrigger} count={14} />

      {/* 1. Header Stats Row (Top Section) */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 bg-white border-2 border-border-light rounded-card shadow-tactile-card dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-primaryGreen/10 border-2 border-primaryGreen flex items-center justify-center text-xl select-none flex-shrink-0">
            👤
          </div>
          
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
              Green Hero
            </span>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-extrabold text-base text-text-primary-light dark:text-text-primary-dark leading-none">
                Eco Cadet
              </h2>
              <Badge variant="primary" className="text-[9px] font-black px-2 py-0.5">
                Level {level}
              </Badge>
            </div>
          </div>
        </div>

        {/* XP Progress Indicator */}
        <div className="flex-grow max-w-md flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-text-muted-light dark:text-text-muted-dark">
            <span className="text-[10px] uppercase font-bold">Progress to Level {level + 1}</span>
            <span className="flex items-center gap-1 font-extrabold text-primaryGreen dark:text-primaryGreen-dark">
              <Trophy className="w-3.5 h-3.5" /> {xp} / {xpNeeded} XP
            </span>
          </div>
          <Progress value={xp} max={xpNeeded} />
        </div>
      </section>

      {/* 2. Main Columns layout: Left (Tree Widget & Tip), Right (Missions & Streak) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Tree Widget & Daily tip */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          {/* Center Tree widget */}
          <TreeWidget />

          {/* AI Sustainability Coach */}
          <AiCoachCompanion />
        </section>

        {/* Right Side: Daily Missions & Streaks */}
        <section className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          {/* Streak Section */}
          <Card className="flex items-center justify-between gap-4 p-5 border-l-4 border-l-orange-500 bg-orange-50/25 dark:bg-cardbg-dark">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0 animate-pulse">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-orange-600 dark:text-orange-400">Streak counter</span>
                <h4 className="font-sans font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">
                  {streak} Days Active!
                </h4>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark max-w-sm">
                  {streakMotivation}
                </p>
              </div>
            </div>
          </Card>

          {/* Missions List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-xl md:text-2xl text-text-primary-light dark:text-text-primary-dark">
                Daily Missions
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshDailyMissions}
                  className="flex items-center gap-1 text-xs font-bold text-primaryGreen hover:underline transition-colors dark:text-primaryGreen-dark"
                  aria-label="Refresh mission cards list"
                  title="Refresh Missions"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-1 text-xs font-bold text-text-muted-light hover:text-text-primary-light transition-colors dark:text-text-muted-dark"
                  aria-label="Reset game levels and streak counter for testing"
                  title="Reset Game"
                >
                  Reset Game
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {activeMissions.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border-light dark:border-border-dark">
                  <div className="text-5xl mb-4 select-none">🎉</div>
                  <h4 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark mb-1">
                    All Missions Completed!
                  </h4>
                  <p className="text-sm text-text-muted-light dark:text-text-muted-dark max-w-xs mb-4">
                    Excellent work today, Hero! You&apos;ve watered your tree sprout. Click &quot;Refresh&quot; above to load new eco challenges.
                  </p>
                </Card>
              ) : (
                activeMissions.map((m) => (
                  <MissionCard
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    description={m.description}
                    xpReward={m.xpReward}
                    waterReward={m.waterReward}
                    category={m.category}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Level Up Celebration Modal */}
      <LevelUpModal />
    </motion.div>
  )
}
