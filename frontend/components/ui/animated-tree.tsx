"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameStore } from "@/store/game-store"
import { useRewardStore } from "@/store/reward-store"
import { useEcosystemStore } from "@/store/ecosystem-store"
import { ThreeScene } from "./three-scene"

interface AnimatedTreeProps {
  level?: number
  isPreview?: boolean
}

export function AnimatedTree({ level: propLevel, isPreview = false }: AnimatedTreeProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Game store statistics
  const storeLevel = useGameStore((state) => state.level)
  const completedMissions = useGameStore((state) => state.completedMissionIds || [])

  const level = propLevel !== undefined ? propLevel : storeLevel
  const completedMissionCount = isPreview ? 100 : completedMissions.length

  // Ecosystem and Reward stores
  const unlockedRewardKeys = useRewardStore((state) => state.unlockedRewardKeys || [])
  const storeWeather = useEcosystemStore((state) => state.weather)
  const storeSeason = useEcosystemStore((state) => state.season)
  const activeDecorations = useEcosystemStore((state) => state.activeDecorations || [])
  const customLeavesEnabled = useEcosystemStore((state) => state.customLeavesEnabled)
  const setWeather = useEcosystemStore((state) => state.setWeather)
  const setSeason = useEcosystemStore((state) => state.setSeason)

  const weather = isPreview ? "sunny" : storeWeather
  const season = isPreview ? "spring" : storeSeason
  const [controlsOpen, setControlsOpen] = React.useState(false)

  // Weather Sky Colors (retained for CSS gradients behind transparent WebGL Canvas)
  const skyBackgrounds = {
    sunny: "from-sky-100 to-sky-300 dark:from-[#0c243c] dark:to-[#051120]",
    cloudy: "from-slate-200 to-slate-400 dark:from-[#1e293b] dark:to-[#0f172a]",
    rain: "from-slate-400 to-slate-600 dark:from-[#111827] dark:to-[#030712]",
    wind: "from-cyan-100 to-slate-300 dark:from-[#0d2e46] dark:to-[#071926]",
    night: "from-slate-950 to-blue-950"
  }

  return (
    <div className="w-full h-full relative rounded-card overflow-hidden bg-gradient-to-b shadow-inner border border-border-light/20 dark:border-border-dark/40 select-none">
      {/* Sky Canvas Background (CSS behind transparent Canvas for optimal performance) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${skyBackgrounds[weather]} transition-all duration-1000 -z-30`} />

      {/* Interactive controls panel */}
      {!isPreview && (
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className="p-1.5 rounded-full bg-white/70 hover:bg-white border border-border-light/40 shadow-sm backdrop-blur-md text-text-primary-light dark:bg-cardbg-dark/70 dark:border-border-dark/40 dark:text-text-primary-dark dark:hover:bg-cardbg-dark/95 transition-all focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            aria-label="Toggle weather and season controls"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.39.43 1.007.093 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.337.443.297 1.06-.093 1.45l-.773.773a1.125 1.125 0 0 1-1.449.093l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.448-.12l-.774-.774c-.39-.39-.43-1.007-.094-1.45l.527-.737c.251-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.093l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>

          <AnimatePresence>
            {controlsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 bg-white/90 dark:bg-[#1E293B]/95 p-3 rounded-2xl border border-border-light/30 shadow-lg backdrop-blur-md flex flex-col gap-2.5 z-50 w-44"
              >
                {/* Season selection */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Seasons</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: "spring", label: "🌸" },
                      { id: "summer", label: "☀️" },
                      { id: "autumn", label: "🍁" },
                      { id: "winter", label: "❄️" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSeason(s.id as any)}
                        className={`text-sm p-1 rounded-md transition-all ${season === s.id ? "bg-primaryGreen/20 scale-105 border border-primaryGreen/50" : "hover:bg-slate-200/50"}`}
                        title={s.id}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weather selection */}
                <div className="flex flex-col gap-1 border-t border-border-light/20 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Weather</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: "sunny", label: "☀️" },
                      { id: "cloudy", label: "☁️" },
                      { id: "rain", label: "🌧️" },
                      { id: "wind", label: "💨" },
                      { id: "night", label: "🌙" }
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setWeather(w.id as any)}
                        className={`text-sm p-1.5 rounded-md transition-all ${weather === w.id ? "bg-primaryGreen/20 scale-105 border border-primaryGreen/50" : "hover:bg-slate-200/50"}`}
                        title={w.id}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* R3F 3D Canvas guarded for Client-side SSR mounting safety */}
      {mounted ? (
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full text-slate-500 font-sans text-xs">
              Loading 3D Ecosystem...
            </div>
          }
        >
          <ThreeScene
            level={level}
            completedMissionCount={completedMissionCount}
            season={season}
            weather={weather}
            unlockedRewardKeys={unlockedRewardKeys}
            customLeavesEnabled={customLeavesEnabled}
            activeDecorations={activeDecorations}
          />
        </React.Suspense>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-500 font-sans text-xs">
          Loading 3D Ecosystem...
        </div>
      )}
    </div>
  )
}
export default AnimatedTree
