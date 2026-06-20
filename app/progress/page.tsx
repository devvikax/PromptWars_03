"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BarChart3, TreePine, Droplet, Calendar, Compass } from "lucide-react"
import { useGameStore } from "@/store/game-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { MISSION_CATALOG } from "@/store/mission-store"

export default function ProgressPage() {
  const { completedMissionIds, completedAtDates, level, waterDrops } = useGameStore()

  // Calculate carbon & water stats
  // For each completed mission, let's map its rewards
  let totalCarbonSavedG = 0
  let totalWaterSavedL = waterDrops * 10 // Mock: 10 Liters per drop

  completedMissionIds.forEach((id) => {
    const catalogMission = MISSION_CATALOG.find((m) => m.id === id)
    const category = catalogMission?.category || "energy"
    if (category === "transport") totalCarbonSavedG += 1200 // 1.2kg
    else if (category === "energy") totalCarbonSavedG += 400 // 0.4kg
    else if (category === "diet") totalCarbonSavedG += 1500 // 1.5kg
  })

  // Carbon equivalent in trees (e.g. 1 tree = 12kg of CO2 saved = 12000g)
  const treeEquivalents = (totalCarbonSavedG / 12000).toFixed(2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full font-sans pb-10"
    >
      {/* Page Title */}
      <div>
        <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-text-primary-light dark:text-text-primary-dark">
          Your Ecological Impact
        </h2>
        <p className="font-sans text-sm text-text-muted-light dark:text-text-muted-dark">
          See the tangible difference your daily choices make over time.
        </p>
      </div>

      {/* Earth Health Banner */}
      <Card className="bg-[#D1FAE5] border-[#A7F3D0] p-5 dark:bg-cardbg-dark dark:border-border-dark flex items-start gap-4">
        <span className="text-3xl select-none" role="img" aria-label="Happy Earth icon">
          🌍😊
        </span>
        <div className="flex flex-col gap-1 text-left">
          <h4 className="font-bold text-[#065F46] dark:text-[#A7F3D0] text-base">
            Earth Health Status: Healthy & Good
          </h4>
          <p className="text-xs text-[#047857] dark:text-text-muted-dark leading-relaxed">
            Your current carbon offset rate is growing! By maintaining your {completedMissionIds.length > 0 ? "recent habit choices" : "streak"}, you are actively cooling your local neighborhood environment.
          </p>
        </div>
      </Card>

      {/* Impact Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon saved */}
        <Card className="flex flex-col gap-4 p-6 border-2 border-primaryGreen-shadow/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primaryGreen/10 rounded-card text-primaryGreen">
              <TreePine className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                Carbon Offset Saving
              </span>
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                Equivalent in trees grown
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
              {treeEquivalents} Trees
            </span>
            <span className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark">
              ({(totalCarbonSavedG / 1000).toFixed(2)} kg of CO₂ emissions avoided)
            </span>
          </div>
        </Card>

        {/* Water saved */}
        <Card className="flex flex-col gap-4 p-6 border-2 border-waterBlue-light/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-waterBlue-light/10 rounded-card text-waterBlue-light">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                Water Drops Accumulated
              </span>
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                Water droplets saved & stored
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
              {waterDrops} Drops
            </span>
            <span className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark">
              ({totalWaterSavedL} Liters of fresh water conserved)
            </span>
          </div>
        </Card>
      </section>

      {/* Completed History Section */}
      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-extrabold text-xl text-text-primary-light dark:text-text-primary-dark">
          Mission History
        </h3>

        {completedMissionIds.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border-light dark:border-border-dark">
            <div className="text-5xl mb-4 select-none">📭</div>
            <h4 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark mb-1">
              No Completed Missions Yet
            </h4>
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark max-w-sm mb-4">
              Your carbon actions log will appear here once you complete a mission on your dashboard.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {completedMissionIds.map((id, index) => {
              const catalogMission = MISSION_CATALOG.find((m) => m.id === id)
              const mission = catalogMission || {
                title: "Sustainable Habit logged",
                category: "energy",
                xpReward: 20,
              }
              const date = completedAtDates[index] || "Today"

              return (
                <Card
                  key={`${id}-${index}`}
                  className="flex items-center justify-between p-4 border-l-4 border-l-primaryGreen"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {mission.category === "transport" ? "🚶" : mission.category === "energy" ? "🔌" : "🥗"}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                        {mission.title}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark">
                        <Calendar className="w-3 h-3" /> {date}
                      </span>
                    </div>
                  </div>

                  <Badge variant="primary">+{mission.xpReward || (mission as any).xp || 20} XP</Badge>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </motion.div>
  )
}
