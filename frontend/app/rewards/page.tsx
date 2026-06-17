"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  Flame,
  Info,
  Leaf,
  Globe,
  Sparkles,
  Lock,
  CheckCircle2,
  Brush,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders
} from "lucide-react"

import { useGameStore } from "@/store/game-store"
import { useAchievementStore, ALL_ACHIEVEMENTS } from "@/store/achievement-store"
import { useCollectionStore, ALL_COLLECTION_ITEMS } from "@/store/collection-store"
import { useRewardStore } from "@/store/reward-store"
import { useEcosystemStore } from "@/store/ecosystem-store"

import { AchievementBadge } from "@/components/ui/achievement-badge"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedTree } from "@/components/ui/animated-tree"

export default function RewardsPage() {
  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"achievements" | "collection">("achievements")
  const [colFilter, setColFilter] = React.useState<string>("all")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Stores
  const { streak, completedMissionIds, level } = useGameStore()
  const unlockedAchievementKeys = useAchievementStore((state) => state.unlockedAchievementKeys || [])
  const unlockedCollectionKeys = useCollectionStore((state) => state.unlockedCollectionKeys || [])
  const unlockedRewardKeys = useRewardStore((state) => state.unlockedRewardKeys || [])
  
  const activeDecorations = useEcosystemStore((state) => state.activeDecorations || [])
  const customLeavesEnabled = useEcosystemStore((state) => state.customLeavesEnabled)
  const toggleDecoration = useEcosystemStore((state) => state.toggleDecoration)
  const setCustomLeavesEnabled = useEcosystemStore((state) => state.setCustomLeavesEnabled)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primaryGreen border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Statistics Computations
  const totalAchievementsCount = ALL_ACHIEVEMENTS.length
  const unlockedAchievementsCount = ALL_ACHIEVEMENTS.filter((a) => unlockedAchievementKeys.includes(a.key)).length
  const achievementPercentage = Math.round((unlockedAchievementsCount / totalAchievementsCount) * 100)

  const totalCollectionCount = ALL_COLLECTION_ITEMS.length
  const unlockedCollectionCount = ALL_COLLECTION_ITEMS.filter((item) => unlockedCollectionKeys.includes(item.key)).length
  const collectionPercentage = Math.round((unlockedCollectionCount / totalCollectionCount) * 100)

  // Evolution Roadmap Stage Details
  const evolutionStages = [
    { stage: 1, title: "Stage 1: Seed Island", level: 1, desc: "A tiny seed embedded in the soil, ready to grow.", rewards: "Base floating island" },
    { stage: 2, title: "Stage 2: Growing Sprout", level: 2, desc: "A tender stem rises with two vibrant green leaves.", rewards: "Butterfly unlocks & basic roots" },
    { stage: 3, title: "Stage 3: Young Sapling", level: 3, desc: "A woody trunk and primary branches establish stability.", rewards: "Extended root network" },
    { stage: 4, title: "Stage 4: Developing Canopy", level: 5, desc: "Secondary branches extend to build a rich organic structure.", rewards: "Secondary branches & cyan butterflies" },
    { stage: 5, title: "Stage 5: Healthy Ecosystem", level: 7, desc: "Dense foliage layers block wind and flowers bloom.", rewards: "Wild flowers, forest bluebirds" },
    { stage: 6, title: "Stage 6: Mature Forest", level: 10, desc: "Thick bark lines become visible; forest bees perch.", rewards: "Twig nest, ancient bark, forest bees" },
    { stage: 7, title: "Stage 7: Legendary Sanctuary", level: 15, desc: "A glowing crown radiating pure energy on a waterfall cliff.", rewards: "Waterfall, glowing flowers, golden foliage, horned owl" },
  ]

  // Achievement Categories
  const achCategories = [
    { id: "beginner", label: "🌱 Beginner", desc: "Your first steps into sustainability" },
    { id: "consistency", label: "🔥 Consistency", desc: "Building daily environmental habits" },
    { id: "impact", label: "⚡ Carbon Impact", desc: "Milestones in carbon savings" },
    { id: "special", label: "🌟 Special Milestones", desc: "Rare accomplishments & level unlocks" },
  ]

  // Collection Items category filter helper
  const filteredCollectionItems = ALL_COLLECTION_ITEMS.filter((item) => {
    if (colFilter === "all") return true
    if (colFilter === "birds") {
      return item.category === "birds" || item.category === "butterflies" || item.category === "rare_creatures"
    }
    return item.category === colFilter
  })

  // Helper for item rarity styling
  const getRarityStyles = (rarity: "common" | "rare" | "epic" | "legendary", isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        border: "border-slate-200 dark:border-slate-800 opacity-60",
        bg: "bg-slate-50/50 dark:bg-slate-900/50",
        text: "text-slate-400 dark:text-slate-500",
        badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        glow: ""
      }
    }
    switch (rarity) {
      case "common":
        return {
          border: "border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700",
          bg: "bg-blue-50/20 dark:bg-blue-950/10",
          text: "text-blue-700 dark:text-blue-400",
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
          glow: "shadow-[0_0_15px_rgba(59,130,246,0.08)]"
        }
      case "rare":
        return {
          border: "border-purple-200 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700",
          bg: "bg-purple-50/20 dark:bg-purple-950/10",
          text: "text-purple-700 dark:text-purple-400",
          badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.08)]"
        }
      case "epic":
        return {
          border: "border-pink-200 dark:border-pink-900/60 hover:border-pink-400 dark:hover:border-pink-700",
          bg: "bg-pink-50/20 dark:bg-pink-950/10",
          text: "text-pink-700 dark:text-pink-400",
          badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
          glow: "shadow-[0_0_15px_rgba(236,72,153,0.08)]"
        }
      case "legendary":
        return {
          border: "border-amber-300 dark:border-amber-900/60 hover:border-amber-500",
          bg: "bg-amber-50/30 dark:bg-amber-950/15",
          text: "text-amber-800 dark:text-amber-400",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.18)] animate-pulse-slow"
        }
    }
  }

  // Placeable items keys
  const PLACEABLE_KEYS = ["deco-lantern", "deco-lights", "wonder-crystal", "wonder-pond"]
  const isGoldenLeavesUnlocked = unlockedRewardKeys.includes("reward-golden-leaves")

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6 w-full font-sans pb-16"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-text-primary-light dark:text-text-primary-dark">
            Progression & Rewards
          </h2>
          <p className="font-sans text-sm text-text-muted-light dark:text-text-muted-dark">
            Nurture your centerpiece tree, unlock organic assets, and customize your floating ecosystem.
          </p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-orange-500/10 dark:from-orange-950/20 dark:to-slate-900/10 shadow-tactile-card">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark uppercase font-extrabold tracking-wider">Active Streak</p>
            <h4 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary-dark">{streak} Days</h4>
            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5">Keep logging missions daily</p>
          </div>
        </Card>

        {/* Achievements Found */}
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/10 dark:from-blue-950/20 dark:to-slate-900/10 shadow-tactile-card">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark uppercase font-extrabold tracking-wider">Achievements</p>
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary-dark">{unlockedAchievementsCount} / {totalAchievementsCount}</h4>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{achievementPercentage}%</span>
            </div>
            {/* Tiny Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${achievementPercentage}%` }} />
            </div>
          </div>
        </Card>

        {/* Collection Found */}
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/10 dark:from-emerald-950/20 dark:to-slate-900/10 shadow-tactile-card">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark uppercase font-extrabold tracking-wider">Ecosystem Catalog</p>
            <div className="flex items-baseline justify-between">
              <h4 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary-dark">{unlockedCollectionCount} / {totalCollectionCount}</h4>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{collectionPercentage}%</span>
            </div>
            {/* Tiny Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectionPercentage}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* TAB NAVIGATION BAR */}
      <div className="flex border-b border-border-light dark:border-border-dark mt-2">
        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wide border-b-2 transition-all focus:outline-none ${
            activeTab === "achievements"
              ? "border-primaryGreen text-primaryGreen"
              : "border-transparent text-text-muted-light hover:text-text-primary-light dark:text-text-muted-dark dark:hover:text-text-primary-dark"
          }`}
        >
          <Award className="w-4 h-4" />
          Achievements & Roadmap
        </button>
        <button
          onClick={() => setActiveTab("collection")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wide border-b-2 transition-all focus:outline-none ${
            activeTab === "collection"
              ? "border-primaryGreen text-primaryGreen"
              : "border-transparent text-text-muted-light hover:text-text-primary-light dark:text-text-muted-dark dark:hover:text-text-primary-dark"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Ecosystem Collection
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <AnimatePresence mode="wait">
        {activeTab === "achievements" ? (
          <motion.div
            key="tab-achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Achievements category grids */}
            <div className="flex flex-col gap-6 mt-2">
              {achCategories.map((cat) => {
                const catAchievements = ALL_ACHIEVEMENTS.filter((a) => a.category === cat.id)
                return (
                  <div key={cat.id} className="flex flex-col gap-3">
                    <div>
                      <h3 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">
                        {cat.label}
                      </h3>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {catAchievements.map((ach) => {
                        const isUnlocked = unlockedAchievementKeys.includes(ach.key)
                        return (
                          <AchievementBadge
                            key={ach.key}
                            title={ach.title}
                            description={ach.description}
                            emoji={<span className="text-2xl">{ach.iconSlug}</span>}
                            isUnlocked={isUnlocked}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tree growth roadmap timeline */}
            <div className="flex flex-col gap-4 border-t border-border-light dark:border-border-dark pt-6">
              <div>
                <h3 className="font-sans font-extrabold text-xl text-text-primary-light dark:text-text-primary-dark">
                  Tree Evolution Roadmap
                </h3>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                  Level milestones unlock new physical properties and animal life on your centerpiece island.
                </p>
              </div>

              <Card className="p-6 relative overflow-hidden bg-slate-50/50 dark:bg-cardbg-dark/50">
                <div className="flex flex-col gap-8 relative">
                  {/* Vertical connector line for timeline */}
                  <div className="absolute top-[40px] bottom-[40px] left-[32px] md:left-[48px] w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

                  {evolutionStages.map((stageItem) => {
                    const isPassed = level >= stageItem.level
                    const isActive = level >= stageItem.level && (
                      stageItem.stage === 7 || 
                      level < (evolutionStages[stageItem.stage]?.level || 99)
                    )

                    return (
                      <div
                        key={stageItem.stage}
                        className={`flex items-start gap-4 md:gap-6 z-10 transition-all ${
                          isActive 
                            ? "opacity-100" 
                            : isPassed 
                              ? "opacity-85" 
                              : "opacity-50"
                        }`}
                      >
                        {/* Interactive Preview Circle */}
                        <div
                          className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 transition-all relative overflow-hidden ${
                            isActive
                              ? "bg-white border-primaryGreen ring-4 ring-primaryGreen/15 dark:bg-slate-900 dark:border-primaryGreen-dark"
                              : isPassed
                                ? "bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                                : "bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-900"
                          }`}
                        >
                          <div className={`w-14 h-14 md:w-20 md:h-20 ${!isPassed ? "grayscale opacity-40" : ""}`}>
                            <AnimatedTree level={stageItem.level} isPreview={true} />
                          </div>
                          {isPassed && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                              ✓
                            </div>
                          )}
                        </div>

                        {/* Timeline Text Info */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm md:text-base text-text-primary-light dark:text-text-primary-dark">
                              {stageItem.title}
                            </span>
                            <Badge
                              variant="accent"
                              className={`text-[10px] font-bold ${
                                isPassed 
                                  ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              Level {stageItem.level}+
                            </Badge>
                            {isActive && (
                              <Badge variant="reward" className="text-[10px] font-bold">
                                Current Stage
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 leading-relaxed max-w-2xl">
                            {stageItem.desc}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-primaryGreen dark:text-emerald-400">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Unlocks: {stageItem.rewards}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab-collection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Filter Pill Row */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { id: "all", label: "All Items" },
                { id: "flowers", label: "🌹 Flowers" },
                { id: "birds", label: "🐦 Wildlife" },
                { id: "natural_wonders", label: "🌊 Wonders" },
                { id: "decorations", label: "🏮 Decorations" }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setColFilter(pill.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none ${
                    colFilter === pill.id
                      ? "bg-primaryGreen text-white shadow-sm"
                      : "bg-white border border-border-light hover:bg-slate-50 text-text-primary-light dark:bg-cardbg-dark dark:border-border-dark dark:text-text-primary-dark dark:hover:bg-slate-900"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Collection Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCollectionItems.map((item) => {
                const isUnlocked = unlockedCollectionKeys.includes(item.key)
                const styles = getRarityStyles(item.rarity, isUnlocked)
                const isPlaceable = PLACEABLE_KEYS.includes(item.key)
                const isPlaced = activeDecorations.includes(item.key)

                return (
                  <Card
                    key={item.key}
                    className={`relative p-5 border-2 rounded-2xl flex flex-col justify-between transition-all duration-300 overflow-hidden ${styles.border} ${styles.bg} ${styles.glow}`}
                  >
                    <div>
                      {/* Rarity & Icon Row */}
                      <div className="flex items-center justify-between mb-3.5">
                        <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-md ${styles.badge}`}>
                          {item.rarity}
                        </span>
                        {!isUnlocked && (
                          <div className="p-1 rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Display Icon box */}
                      <div className="flex justify-center mb-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl border-2 transition-transform duration-300 ${
                            isUnlocked
                              ? "bg-white dark:bg-slate-900 border-white/50 dark:border-slate-800 scale-100 hover:scale-110"
                              : "bg-slate-100 border-slate-200 grayscale filter opacity-50 dark:bg-slate-950 dark:border-slate-900"
                          }`}
                        >
                          {item.iconSlug}
                        </div>
                      </div>

                      {/* Details */}
                      <h4 className={`font-extrabold text-sm uppercase tracking-wide text-center ${isUnlocked ? "text-text-primary-light dark:text-text-primary-dark" : "text-slate-400 dark:text-slate-500"}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark text-center mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Footer Button */}
                    <div className="mt-5">
                      {isUnlocked ? (
                        isPlaceable ? (
                          <button
                            onClick={() => toggleDecoration(item.key)}
                            className={`w-full py-2 rounded-xl text-xs font-extrabold transition-all border focus:outline-none flex items-center justify-center gap-1.5 ${
                              isPlaced
                                ? "bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-text-primary-light dark:bg-slate-900 dark:border-slate-800 dark:text-text-primary-dark dark:hover:bg-slate-850"
                            }`}
                          >
                            {isPlaced ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Placed on Island
                              </>
                            ) : (
                              <>
                                <Sliders className="w-3.5 h-3.5" />
                                Place on Island
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="w-full py-2 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl text-xs font-bold text-center text-text-muted-light dark:text-text-muted-dark border border-dashed border-border-light dark:border-border-dark flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Active in Ecosystem
                          </div>
                        )
                      ) : (
                        <div className="w-full py-2 bg-slate-100/30 dark:bg-slate-900/10 rounded-xl text-xs font-extrabold text-center text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          Locked
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Tree Customization Section (Golden Leaves) */}
            <div className="border-t border-border-light dark:border-border-dark pt-6 mt-4">
              <h3 className="font-sans font-extrabold text-xl text-text-primary-light dark:text-text-primary-dark mb-4">
                Ecosystem Canopy Customize
              </h3>

              {isGoldenLeavesUnlocked ? (
                <Card className="p-6 border-2 border-amber-300 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-slate-900/10 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl flex-shrink-0 animate-pulse-slow">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-amber-900 dark:text-amber-300">
                        Golden Foliage Customization Unlocked!
                      </h4>
                      <p className="text-xs text-amber-700/80 dark:text-text-muted-dark max-w-xl leading-relaxed">
                        Congratulations, Earth Protector! You can override your centerpiece tree canopy with shimmering golden leaves to celebrate your sustainable commitment.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCustomLeavesEnabled(!customLeavesEnabled)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all border focus:outline-none flex items-center justify-center gap-1.5 ${
                      customLeavesEnabled
                        ? "bg-amber-50 border-amber-600 hover:bg-amber-600 text-white shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                        : "bg-white border-amber-200 hover:bg-amber-50 text-amber-700 dark:bg-slate-900 dark:border-slate-800 dark:text-amber-400 dark:hover:bg-slate-850"
                    }`}
                  >
                    {customLeavesEnabled ? (
                      <>
                        <Brush className="w-4 h-4 fill-current" />
                        Golden Leaves Active
                      </>
                    ) : (
                      <>
                        <Brush className="w-4 h-4" />
                        Activate Golden Leaves
                      </>
                    )}
                  </button>
                </Card>
              ) : (
                <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-cardbg-dark/40 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 flex items-center justify-center text-3xl flex-shrink-0">
                      🔒
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-slate-400 dark:text-slate-500">
                        Locked: Golden Foliage Customization
                      </h4>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark max-w-xl leading-relaxed">
                        Requires the legendary <span className="font-bold text-amber-600 dark:text-amber-500">Earth Protector</span> achievement (reached by unlocking level 3 carbon savings). Complete daily carbon saving missions to level up!
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-2.5 rounded-xl text-xs font-extrabold border border-slate-200 bg-slate-100 text-slate-400 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-600 flex items-center gap-1.5 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5" />
                    Locked Upgrades
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
