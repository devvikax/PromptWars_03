"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRewardStore } from "@/store/reward-store"
import { Sparkle } from "lucide-react"

export function CelebrationOverlay() {
  const currentCelebration = useRewardStore((state) => state.currentCelebration)
  const nextCelebration = useRewardStore((state) => state.nextCelebration)

  if (!currentCelebration) return null

  const { type, title, description, rarity, icon } = currentCelebration

  // Rarity styling config
  const rarityGlows = {
    common: "from-blue-400/20 to-sky-400/10 shadow-blue-500/20 text-sky-500 border-sky-300/30",
    rare: "from-indigo-400/20 to-purple-400/10 shadow-purple-500/20 text-indigo-500 border-purple-300/30",
    epic: "from-pink-400/20 to-rose-400/10 shadow-rose-500/20 text-pink-500 border-rose-300/30",
    legendary: "from-amber-400/25 to-yellow-400/15 shadow-amber-500/25 text-amber-500 border-amber-300/40 border-2 animate-pulse",
  }

  const badgeBorder = rarity ? rarityGlows[rarity] : "from-emerald-400/20 to-teal-400/10 text-primaryGreen border-primaryGreen/30"

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
        
        {/* Sparkle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-amber-300"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 0.8, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2.2 + Math.random() * 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <Sparkle className="w-6 h-6 fill-current" />
            </motion.div>
          ))}
        </div>

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white dark:bg-[#1E293B] border border-border-light/40 dark:border-border-dark/40 rounded-card shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden flex flex-col items-center gap-6"
        >
          {/* Subtle spinning rays behind badge */}
          <div className="absolute top-12 w-48 h-48 rounded-full bg-gradient-radial from-amber-400/15 to-transparent blur-xl pointer-events-none -z-10" />

          {/* Celebration Header */}
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primaryGreen dark:text-primaryGreen-dark">
              {type === "achievement" ? "🏆 Achievement Unlocked" : type === "reward" ? "🎁 Ecosystem Upgrade" : "🌟 Collection Found"}
            </span>
            <h3 className="font-sans font-extrabold text-2xl text-text-primary-light dark:text-text-primary-dark">
              Congratulations!
            </h3>
          </div>

          {/* Large Badge/Icon */}
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className={`w-28 h-28 rounded-full bg-gradient-to-br ${badgeBorder} flex items-center justify-center text-5xl shadow-lg border relative`}
          >
            {icon}

            {/* Glowing ring for legendary items */}
            {rarity === "legendary" && (
              <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-60" />
            )}
          </motion.div>

          {/* Details */}
          <div className="flex flex-col gap-2">
            {rarity && (
              <span className={`text-[10px] font-bold uppercase tracking-wider mx-auto px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${
                rarity === "legendary" ? "text-amber-500" : rarity === "epic" ? "text-pink-500" : rarity === "rare" ? "text-indigo-500" : "text-sky-500"
              }`}>
                {rarity} Item
              </span>
            )}
            <h4 className="font-sans font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark leading-snug">
              {title}
            </h4>
            <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          {/* Action button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextCelebration}
            className="w-full mt-2 py-3 px-5 rounded-full bg-primaryGreen text-white font-sans font-bold text-sm shadow-tactile hover:bg-primaryGreen-dark focus:outline-none focus:ring-2 focus:ring-primaryGreen transition-all"
          >
            Awesome! Collect & Continue
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
