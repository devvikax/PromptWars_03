export interface Mission {
  id: string
  title: string
  description: string
  xpReward: number
  waterReward: number
  category: "transport" | "energy" | "diet"
  difficulty?: "easy" | "medium" | "hard"
  estimatedImpact?: "low" | "medium" | "high"
}

export interface UserMission {
  id: string
  userId: string
  missionId: string
  completedAt: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  iconSlug: string
  xpRequired: number
}

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  isGuest: boolean
  level: number
  xp: number
  streak: number
  waterDrops: number
  travelType?: string
  acUsage?: string
  foodType?: string
  earthHealth?: string
}

export interface ProgressLog {
  id: string
  userId: string
  carbonSavedG: number
  waterSavedL: number
  logDate: string
}

export interface CollectionItem {
  id: string
  key: string
  title: string
  category: "flowers" | "birds" | "butterflies" | "natural_wonders" | "decorations" | "rare_creatures" | "seasonal"
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  iconSlug: string
}

export interface Reward {
  id: string
  key: string
  title: string
  description: string
  rewardType: "ecosystem_upgrade" | "collection_item" | "xp_boost"
  category?: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockCondition: string
}

export interface UnlockHistoryEntry {
  id: string
  itemType: "achievement" | "collection_item" | "reward"
  itemId: string
  unlockedAt: string
}

