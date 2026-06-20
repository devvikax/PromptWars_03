"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Badge } from "./badge"
import { useGameStore } from "@/store/game-store"
import { AnimatedTree } from "./animated-tree"

import { useEcosystemStore } from "@/store/ecosystem-store"

export function TreeWidget() {
  const level = useGameStore((state) => state.level)

  // Deduce ecosystem stage info based on level
  let stageName = "Seed Island"
  let description = "A tiny seed on a floating patch of land. Log actions to start growing!"
  let stageNum = 1
  
  if (level === 2) {
    stageName = "Sprout Island"
    description = "Grass and a tiny green sprout appear. Wildlife is showing interest!"
    stageNum = 2
  } else if (level >= 3 && level <= 4) {
    stageName = "Growing Island"
    description = "A young tree begins to form and flowers start blooming."
    stageNum = 3
  } else if (level >= 5 && level <= 6) {
    stageName = "Young Ecosystem"
    description = "The canopy expands and butterflies dance around your island."
    stageNum = 4
  } else if (level >= 7 && level <= 9) {
    stageName = "Healthy Ecosystem"
    description = "Birds arrive as a diverse, healthy habitat flourishes."
    stageNum = 5
  } else if (level >= 10 && level <= 14) {
    stageName = "Flourishing Ecosystem"
    description = "A majestic magical ecosystem filled with wildlife and flowers."
    stageNum = 6
  } else if (level >= 15) {
    stageName = "Legendary Ecosystem"
    description = "A legendary paradise with rare creatures and magical effects."
    stageNum = 7
  }

  // Animation variants for squash & stretch pop on level up
  const treeAnims = {
    idle: { scale: 1 },
    levelUp: {
      scaleY: [1, 0.82, 1.18, 0.92, 1],
      scaleX: [1, 1.08, 0.88, 1.04, 1],
      transition: { duration: 0.65, ease: "easeInOut" }
    }
  }

  // Active items & wildlife counts
  const activeDecorations = useEcosystemStore((state) => state.activeDecorations || [])
  const decorationsCount = activeDecorations.length

  let wildlifeCount = 0
  if (level >= 2) wildlifeCount += 1 // Butterfly
  if (level >= 5) wildlifeCount += 1 // Bluebird
  if (level >= 8) wildlifeCount += 1 // Bee
  if (level >= 12) wildlifeCount += 1 // Squirrel
  if (level >= 20) wildlifeCount += 1 // Owl

  // Dynamic health descriptor
  let healthText = "Healthy 🌱"
  if (level >= 15) healthText = "Vibrant 🌟"
  else if (level >= 10) healthText = "Flourishing ✨"
  else if (level >= 5) healthText = "Active 🍀"

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50/50 border-2 border-border-light shadow-tactile-card rounded-card p-6 w-full dark:from-cardbg-dark dark:to-[#17253B] dark:border-border-dark dark:shadow-none transition-all duration-300">
      {/* Decorative neon top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-cyan-500" />

      {/* Title & Badge Row */}
      <div className="w-full flex items-center justify-between mb-4 mt-2">
        <Badge variant="primary" className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 bg-primaryGreen/10 text-primaryGreen border border-primaryGreen/20">
          3D PROGRESSION
        </Badge>
        <span className="text-[10px] font-extrabold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
          Drag to Orbit 🔄
        </span>
      </div>
      
      {/* Ecosystem character stage illustration (Taller Viewport for 3D) */}
      <motion.div
        className="w-full h-80 md:h-[350px] relative mb-6 select-none cursor-grab active:cursor-grabbing rounded-2xl bg-gradient-to-b from-slate-100/30 to-slate-250/10 dark:from-slate-900/40 dark:to-slate-800/10 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner"
        variants={treeAnims}
        animate="levelUp"
        key={level} // Re-triggers animation when level changes
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      >
        <AnimatedTree level={level} />
      </motion.div>

      {/* Details Hub */}
      <div className="w-full flex flex-col gap-4 text-left">
        <div className="flex flex-col gap-1">
          <h4 className="font-sans font-black text-xl text-text-primary-light dark:text-text-primary-dark tracking-tight">
            {stageName}
          </h4>
          <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-1.5 w-full">
          {/* Growth Stage */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-border-light/40 dark:border-border-dark/30 flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold uppercase text-text-muted-light dark:text-text-muted-dark tracking-wider">Growth Stage</span>
            <span className="text-sm font-black text-primaryGreen dark:text-primaryGreen-dark">{stageNum} of 7</span>
          </div>

          {/* Active Wildlife */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-border-light/40 dark:border-border-dark/30 flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold uppercase text-text-muted-light dark:text-text-muted-dark tracking-wider">Fauna (Wildlife)</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{wildlifeCount} Active</span>
          </div>

          {/* Decor Unlocks */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-border-light/40 dark:border-border-dark/30 flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold uppercase text-text-muted-light dark:text-text-muted-dark tracking-wider">Ecosystem Decor</span>
            <span className="text-sm font-black text-purple-600 dark:text-purple-400">{decorationsCount} Unlocked</span>
          </div>

          {/* Ecosystem Health */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-border-light/40 dark:border-border-dark/30 flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold uppercase text-text-muted-light dark:text-text-muted-dark tracking-wider">Eco Health</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{healthText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

