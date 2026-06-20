"use client"

import * as React from "react"
import { useGameStore } from "@/store/game-store"
import { useAchievementStore, ALL_ACHIEVEMENTS } from "@/store/achievement-store"
import { useRewardStore, ALL_REWARDS } from "@/store/reward-store"
import { useCollectionStore, ALL_COLLECTION_ITEMS } from "@/store/collection-store"
import { useEcosystemStore } from "@/store/ecosystem-store"
import { useAuth } from "@/hooks/use-auth"
import { useBehaviorStore } from "@/store/behavior-store"

export function useProgressionEngine() {
  const { user } = useAuth()
  const userId = user?.id

  // Game state
  const { completedMissionIds, streak, level } = useGameStore()
  const completedMissionsCount = completedMissionIds.length

  // Progression Stores
  const { unlockedAchievementKeys, unlockAchievement, syncWithSupabase: syncAch } = useAchievementStore()
  const { unlockedRewardKeys, unlockReward, addPendingUnlock, syncWithSupabase: syncRew } = useRewardStore()
  const { unlockedCollectionKeys, unlockCollectionItem, syncWithSupabase: syncCol } = useCollectionStore()
  const { toggleDecoration, setCustomLeavesEnabled } = useEcosystemStore()

  // Track previous level, streak and mission count to only trigger unlocks on active gameplay events
  const prevMissionsCountRef = React.useRef(completedMissionsCount)
  const prevLevelRef = React.useRef(level)
  const prevStreakRef = React.useRef(streak)

  // Sync stores on user login
  React.useEffect(() => {
    if (userId) {
      syncAch(userId)
      syncRew(userId)
      syncCol(userId)
      useBehaviorStore.getState().syncWithSupabase(userId)
    }
  }, [userId, syncAch, syncRew, syncCol])

  // Core Evaluation Loop
  React.useEffect(() => {
    const prevCount = prevMissionsCountRef.current

    const isGameplayEvent =
      completedMissionsCount > prevCount ||
      level > prevLevelRef.current ||
      streak > prevStreakRef.current

    if (!isGameplayEvent) {
      prevMissionsCountRef.current = completedMissionsCount
      prevLevelRef.current = level
      prevStreakRef.current = streak
      return
    }

    prevMissionsCountRef.current = completedMissionsCount
    prevLevelRef.current = level
    prevStreakRef.current = streak

    const evaluateProgression = async () => {
      // 1. EVALUATE ACHIEVEMENTS & DIRECT REWARDS
      
      // A. "First Steps" (Beginner)
      if (completedMissionsCount >= 1 && !unlockedAchievementKeys.includes("first-mission")) {
        const ok = await unlockAchievement("first-mission", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "First Steps Unlocked!",
            description: "You've taken your first action for the planet. Proud of you!",
            icon: "🌱",
          })
          // Also unlock a common flower
          unlockCollectionItem("flower-sun", userId)
          addPendingUnlock({
            type: "collection_item",
            title: "Sunny Dandelion Found!",
            description: "A bright yellow bloom has appeared on your island base.",
            rarity: "common",
            icon: "🌼",
          })
        }
      }

      // B. "Eco Sprout" (Level 2)
      if (level >= 2 && !unlockedAchievementKeys.includes("first-level-up")) {
        const ok = await unlockAchievement("first-level-up", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Eco Sprout Unlocked!",
            description: "Your island has sprouted its first green stem!",
            icon: "🌿",
          })
        }
      }

      // C. "Habit Builder" (3-Day Streak)
      if (streak >= 3 && !unlockedAchievementKeys.includes("streak-3")) {
        const ok = await unlockAchievement("streak-3", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Habit Builder Unlocked!",
            description: "3 days of consistent green choices. Keep it going!",
            icon: "🔥",
          })
        }
      }

      // D. "Eco Devotee" & "Blooming Flowers" (7-Day Streak)
      if (streak >= 7 && !unlockedAchievementKeys.includes("streak-7")) {
        const ok = await unlockAchievement("streak-7", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Eco Devotee Unlocked!",
            description: "7 days of pure climate actions. Phenomenal consistency!",
            icon: "⚡",
          })
          
          // Unlock flowers reward
          unlockReward("reward-flowers", userId)
          addPendingUnlock({
            type: "reward",
            title: "Ecosystem Upgrade: Blooming Flowers!",
            description: "Wild roses and dandelions now blossom on the grassy island base.",
            rarity: "common",
            icon: "🌸",
          })

          // Unlock Rose collection item
          unlockCollectionItem("flower-rose", userId)
        }
      }

      // E. "Green Apprentice" (10 Missions)
      if (completedMissionsCount >= 10 && !unlockedAchievementKeys.includes("missions-10")) {
        const ok = await unlockAchievement("missions-10", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Green Apprentice Unlocked!",
            description: "Completed 10 sustainable choices. You're starting to make a dent!",
            icon: "🌲",
          })

          // Unlock sparrow bird item
          unlockCollectionItem("bird-sparrow", userId)
          addPendingUnlock({
            type: "collection_item",
            title: "Field Sparrow Arrived!",
            description: "A cute little sparrow is now chirping around your tree base.",
            rarity: "common",
            icon: "🐤",
          })
        }
      }

      // F. "Cozy Nest" (30 Missions Milestone)
      if (completedMissionsCount >= 30 && !unlockedRewardKeys.includes("reward-nest")) {
        unlockReward("reward-nest", userId)
        unlockCollectionItem("deco-nest", userId)
        addPendingUnlock({
          type: "reward",
          title: "Ecosystem Upgrade: Cozy Nest!",
          description: "A tiny straw nest has appeared safely nested inside your tree branch.",
          rarity: "common",
          icon: "🪺",
        })
      }

      // G. "Forest Guardian" & Purple Monarch (50 Missions)
      if (completedMissionsCount >= 50 && !unlockedAchievementKeys.includes("missions-50")) {
        const ok = await unlockAchievement("missions-50", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Forest Guardian Unlocked!",
            description: "50 missions logged! You are now a certified guardian of the forest.",
            icon: "🌳",
          })

          unlockCollectionItem("butterfly-purple", userId)
          addPendingUnlock({
            type: "collection_item",
            title: "Purple Monarch Unlocked!",
            description: "A gorgeous purple butterfly has arrived, dancing in figure-eights.",
            rarity: "common",
            icon: "🦋",
          })
        }
      }

      // H. "Ecosystem Savior" & Fireflies/Bluebird (100 Missions)
      if (completedMissionsCount >= 100 && !unlockedAchievementKeys.includes("missions-100")) {
        const ok = await unlockAchievement("missions-100", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Ecosystem Savior Unlocked!",
            description: "100 actions! Your environment is thriving with abundant life.",
            icon: "🌎",
          })

          unlockReward("reward-fireflies", userId)
          addPendingUnlock({
            type: "reward",
            title: "Ecosystem Upgrade: Magical Fireflies!",
            description: "Magical glowing fireflies now float around your island at night.",
            rarity: "rare",
            icon: "✨",
          })

          unlockCollectionItem("bird-blue", userId)
          addPendingUnlock({
            type: "collection_item",
            title: "Forest Bluebird Arrived!",
            description: "A bright bluebird has nested on your tree branch, flapping its wings.",
            rarity: "common",
            icon: "🐦",
          })
        }
      }

      // I. "Ecosystem Waterfall" (200 Missions Milestone)
      if (completedMissionsCount >= 200 && !unlockedRewardKeys.includes("reward-waterfall")) {
        unlockReward("reward-waterfall", userId)
        unlockCollectionItem("wonder-waterfall", userId)
        addPendingUnlock({
          type: "reward",
          title: "Ecosystem Upgrade: Legendary Waterfall!",
          description: "A majestic stream flows off the island edge. Absolutely stunning!",
          rarity: "legendary",
          icon: "🌊",
        })
      }

      // J. "Earth Protector" & Golden Leaves (Level 3+)
      if (level >= 3 && !unlockedAchievementKeys.includes("earth-protector")) {
        const ok = await unlockAchievement("earth-protector", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Earth Protector Unlocked!",
            description: "Reached Level 3. You are shielding our atmosphere with actions.",
            icon: "🌍",
          })

          unlockReward("reward-golden-leaves", userId)
          setCustomLeavesEnabled(true) // Activate golden leaves!
          addPendingUnlock({
            type: "reward",
            title: "Ecosystem Upgrade: Golden Leaves!",
            description: "Your tree now sways with legendary gold-leaf gradients.",
            rarity: "legendary",
            icon: "✨",
          })

          unlockCollectionItem("flower-gold", userId)
        }
      }

      // K. "Eco Warrior" & Owl/Lantern (Level 7+)
      if (level >= 7 && !unlockedAchievementKeys.includes("eco-warrior")) {
        const ok = await unlockAchievement("eco-warrior", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Eco Warrior Unlocked!",
            description: "Reached Level 7. A true force of nature in our community.",
            icon: "🛡️",
          })

          unlockCollectionItem("bird-owl", userId)
          addPendingUnlock({
            type: "collection_item",
            title: "Ancient Horned Owl Arrived!",
            description: "An epic horned owl has nested on your top branch, watching the stars.",
            rarity: "epic",
            icon: "🦉",
          })

          unlockCollectionItem("deco-lantern", userId)
          toggleDecoration("deco-lantern") // Auto-place lantern
        }
      }

      // L. "Green Champion" & Fairy Lights (Level 15+)
      if (level >= 15 && !unlockedAchievementKeys.includes("green-champion")) {
        const ok = await unlockAchievement("green-champion", userId)
        if (ok) {
          addPendingUnlock({
            type: "achievement",
            title: "Green Champion Unlocked!",
            description: "Level 15 reached! A legendary steward of green habit progress.",
            icon: "🥇",
          })

          unlockCollectionItem("deco-lights", userId)
          toggleDecoration("deco-lights") // Auto-place fairy lights
          addPendingUnlock({
            type: "collection_item",
            title: "Fairy Lights Unlocked!",
            description: "Delicate glowing fairy lights are now hung around your tree canopy.",
            rarity: "epic",
            icon: "✨",
          })
        }
      }

      // 2. SURPRISE UNLOCK ON NEW MISSION COMPLETIONS
      if (completedMissionsCount > prevCount) {
        const countDiff = completedMissionsCount - prevCount

        // Standard 35% chance per mission completed to find a surprise item!
        const roll = Math.random()
        if (roll < 0.35 * countDiff) {
          // Find locked items that are not unlocked yet
          const lockedItems = ALL_COLLECTION_ITEMS.filter(
            (item) => !unlockedCollectionKeys.includes(item.key)
          )

          if (lockedItems.length > 0) {
            // Select one at random
            const randomIndex = Math.floor(Math.random() * lockedItems.length)
            const selectedItem = lockedItems[randomIndex]
            
            await unlockCollectionItem(selectedItem.key, userId)
            addPendingUnlock({
              type: "collection_item",
              title: `Surprise Found: ${selectedItem.title}!`,
              description: `You discovered a surprise ${selectedItem.rarity} item: ${selectedItem.description}`,
              rarity: selectedItem.rarity,
              icon: selectedItem.iconSlug,
            })
          }
        }
      }
    }

    evaluateProgression()
  }, [
    completedMissionsCount,
    streak,
    level,
    unlockedAchievementKeys,
    unlockedRewardKeys,
    unlockedCollectionKeys,
    unlockAchievement,
    unlockReward,
    unlockCollectionItem,
    addPendingUnlock,
    toggleDecoration,
    setCustomLeavesEnabled,
    userId,
  ])
}
