"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Mission } from "@/types"
import { useGameStore } from "./game-store"
import { useProfileStore } from "./profile-store"
import { useBehaviorStore } from "./behavior-store"
import { useAuthStore } from "./auth-store"
import { completeMissionOnDb } from "@/services/db-missions"
import { updateUserProfileOnDb } from "@/services/db-user"
import { generatePersonalizedMissions } from "@/services/ai-recommendation"

// Centralized Mission Catalog matching all requested Types & Difficulties
export const MISSION_CATALOG: Mission[] = [
  // 1. Transport
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400001",
    title: "Walk to the Store",
    description: "Walk instead of driving for short trips under 1 km today.",
    xpReward: 15,
    waterReward: 1,
    category: "transport",
    difficulty: "easy",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400002",
    title: "Cycle to Work / School",
    description: "Cycle to save travel carbon emissions today.",
    xpReward: 25,
    waterReward: 1,
    category: "transport",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400003",
    title: "No Car Day",
    description: "Ditch driving entirely today. Walk, cycle, or use public transit.",
    xpReward: 40,
    waterReward: 1,
    category: "transport",
    difficulty: "hard",
    estimatedImpact: "high",
  },

  // 2. Energy
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400004",
    title: "Unplug Idle Chargers",
    description: "Unplug phone chargers and home appliances when not in use.",
    xpReward: 15,
    waterReward: 1,
    category: "energy",
    difficulty: "easy",
    estimatedImpact: "low",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400005",
    title: "Wash Clothes in Cold Water",
    description: "Use cold water cycle on your laundry to save heating power.",
    xpReward: 25,
    waterReward: 1,
    category: "energy",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400006",
    title: "Hour of Darkness",
    description: "Turn off all optional lights and electronics for 1 hour tonight.",
    xpReward: 40,
    waterReward: 1,
    category: "energy",
    difficulty: "hard",
    estimatedImpact: "high",
  },

  // 3. Food
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400007",
    title: "Choose a Plant-Based Snack",
    description: "Eat fresh fruit or nuts instead of processed snacks.",
    xpReward: 15,
    waterReward: 1,
    category: "diet",
    difficulty: "easy",
    estimatedImpact: "low",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400008",
    title: "Try One Vegetarian Meal Today",
    description: "Swap meat for a delicious plant-based breakfast, lunch, or dinner.",
    xpReward: 25,
    waterReward: 1,
    category: "diet",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400009",
    title: "Fully Plant-Based Day",
    description: "Choose vegetarian or vegan meals for all food intakes today.",
    xpReward: 40,
    waterReward: 1,
    category: "diet",
    difficulty: "hard",
    estimatedImpact: "high",
  },

  // 4. Waste
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400010",
    title: "Sort Your Trash",
    description: "Correctly separate recyclables and compostables from landfill trash.",
    xpReward: 15,
    waterReward: 1,
    category: "diet",
    difficulty: "easy",
    estimatedImpact: "low",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400011",
    title: "No Single-Use Plastics",
    description: "Use a reusable bottle and canvas bags instead of plastic options today.",
    xpReward: 25,
    waterReward: 1,
    category: "energy",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400012",
    title: "Zero Waste Day",
    description: "Avoid producing any landfill waste for the next 24 hours.",
    xpReward: 40,
    waterReward: 1,
    category: "transport",
    difficulty: "hard",
    estimatedImpact: "high",
  },

  // 5. Water
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400013",
    title: "Turn Tap Off While Brushing",
    description: "Conserve water by turning off the tap while brushing teeth.",
    xpReward: 15,
    waterReward: 2,
    category: "energy",
    difficulty: "easy",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400014",
    title: "5-Minute Shower",
    description: "Conserve clean water by taking a quick shower in under 5 minutes.",
    xpReward: 25,
    waterReward: 2,
    category: "diet",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400015",
    title: "Bucket Wash Car/Cycle",
    description: "Use a bucket instead of running water hose to clean transport items.",
    xpReward: 40,
    waterReward: 3,
    category: "transport",
    difficulty: "hard",
    estimatedImpact: "high",
  },

  // 6. Community
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400016",
    title: "Share an Eco Tip",
    description: "Tell a family member about home energy saving habits today.",
    xpReward: 15,
    waterReward: 1,
    category: "energy",
    difficulty: "easy",
    estimatedImpact: "low",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400017",
    title: "Pick Up 3 Pieces of Litter",
    description: "Collect litter from your neighborhood street or local park.",
    xpReward: 25,
    waterReward: 1,
    category: "transport",
    difficulty: "medium",
    estimatedImpact: "medium",
  },
  {
    id: "595dbf41-0731-4171-8bc6-52c6f1400018",
    title: "Organize an Eco Challenge",
    description: "Invite 3 friends to join you in completing a Green Hero mission.",
    xpReward: 40,
    waterReward: 2,
    category: "diet",
    difficulty: "hard",
    estimatedImpact: "high",
  },
]

interface MissionState {
  activeMissions: Mission[]
  
  // Actions
  generateFirstMission: (answers: { travelType: string; acUsage: string; foodType: string }) => Mission
  completeActiveMission: (missionId: string) => void
  refreshDailyMissions: () => void
  resetMissions: () => void
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      activeMissions: [],

      generateFirstMission: (answers) => {
        let firstMission: Mission

        if (answers.travelType === "car") {
          firstMission = {
            id: "595dbf41-0731-4171-8bc6-52c6f1400002",
            title: "Cycle to Work / School",
            description: "Cycle to save travel carbon emissions today.",
            xpReward: 25,
            waterReward: 1,
            category: "transport",
            difficulty: "medium",
            estimatedImpact: "medium",
          }
        } else if (answers.acUsage === "often") {
          firstMission = {
            id: "595dbf41-0731-4171-8bc6-52c6f1400004",
            title: "Unplug Idle Chargers",
            description: "Unplug phone chargers and home appliances when not in use.",
            xpReward: 15,
            waterReward: 1,
            category: "energy",
            difficulty: "easy",
            estimatedImpact: "low",
          }
        } else if (answers.foodType === "mixed") {
          firstMission = {
            id: "595dbf41-0731-4171-8bc6-52c6f1400008",
            title: "Try One Vegetarian Meal Today",
            description: "Swap meat for a delicious plant-based breakfast, lunch, or dinner.",
            xpReward: 25,
            waterReward: 1,
            category: "diet",
            difficulty: "medium",
            estimatedImpact: "medium",
          }
        } else {
          firstMission = {
            id: "595dbf41-0731-4171-8bc6-52c6f1400004",
            title: "Unplug Idle Chargers",
            description: "Unplug phone chargers and home appliances when not in use.",
            xpReward: 15,
            waterReward: 1,
            category: "energy",
            difficulty: "easy",
            estimatedImpact: "low",
          }
        }

        set({ activeMissions: [firstMission] })
        return firstMission
      },

      completeActiveMission: (missionId) => {
        const missions = get().activeMissions
        const target = missions.find((m) => m.id === missionId)

        if (target) {
          const gameStore = useGameStore.getState()
          const behaviorStore = useBehaviorStore.getState()

          // Record completion in behavior store
          behaviorStore.recordMissionCompletion(target.category)
          
          // Add XP & Drops dynamically
          gameStore.addXp(target.xpReward)
          gameStore.addWaterDrop(target.waterReward)
          
          if (!gameStore.completedMissionIds.includes(missionId)) {
            const today = new Date().toISOString().split("T")[0]
            useGameStore.setState({
              completedMissionIds: [...gameStore.completedMissionIds, missionId],
              completedAtDates: [...gameStore.completedAtDates, today]
            })
          }

          // Sync to database if user is authenticated
          const authUser = useAuthStore.getState().user
          if (authUser) {
            completeMissionOnDb(authUser.id, missionId)
          }

          // Filter out completed active mission
          set({
            activeMissions: missions.filter((m) => m.id !== missionId),
          })
        }
      },

      refreshDailyMissions: () => {
        const gameStore = useGameStore.getState()
        const profileStore = useProfileStore.getState()
        const behaviorStore = useBehaviorStore.getState()

        // 1. Record ignored missions for any currently active uncompleted missions
        const currentActive = get().activeMissions
        if (currentActive.length > 0) {
          currentActive.forEach((m) => {
            behaviorStore.recordMissionIgnore(m.category)
          })
        }

        // 2. Fetch context
        const context = {
          ignoredMissionsCount: behaviorStore.ignoredMissionsCount,
          categoryPreferences: behaviorStore.categoryPreferences,
          travelType: profileStore.travelType,
          acUsage: profileStore.acUsage,
          foodType: profileStore.foodType,
        }

        // 3. Generate personalized missions
        const personalized = generatePersonalizedMissions(
          context,
          gameStore.completedMissionIds || [],
          gameStore.level
        )

        set({ activeMissions: personalized })
      },

      resetMissions: () => {
        set({ activeMissions: [] })
      },
    }),
    {
      name: "green-hero-mission-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
