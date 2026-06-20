"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getAuthHeader } from "@/services/auth-header"

export interface CollectionItemData {
  key: string
  title: string
  category: "flowers" | "birds" | "butterflies" | "natural_wonders" | "decorations" | "rare_creatures" | "seasonal"
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  iconSlug: string
}

export const ALL_COLLECTION_ITEMS: CollectionItemData[] = [
  // Flowers
  {
    key: "flower-rose",
    title: "Wild Rose",
    category: "flowers",
    description: "A fragrant pink rose that grows in small clusters.",
    rarity: "common",
    iconSlug: "🌹",
  },
  {
    key: "flower-sun",
    title: "Sunny Dandelion",
    category: "flowers",
    description: "Bright yellow flowers that cheer up the grassy base.",
    rarity: "common",
    iconSlug: "🌼",
  },
  {
    key: "flower-tulip",
    title: "Sweet Tulip",
    category: "flowers",
    description: "A rare pink tulip symbolizing renewal and growth.",
    rarity: "rare",
    iconSlug: "🌷",
  },
  {
    key: "flower-cherry",
    title: "Cherry Blossom",
    category: "flowers",
    description: "An epic pastel-pink petal cluster sitting on the tree twigs.",
    rarity: "epic",
    iconSlug: "🌸",
  },
  {
    key: "flower-gold",
    title: "Golden Cosmos",
    category: "flowers",
    description: "A legendary glowing gold flower radiating purity.",
    rarity: "legendary",
    iconSlug: "✨",
  },
  // Birds
  {
    key: "bird-blue",
    title: "Forest Bluebird",
    category: "birds",
    description: "A cheerful bluebird that perches on tree branches.",
    rarity: "common",
    iconSlug: "🐦",
  },
  {
    key: "bird-sparrow",
    title: "Field Sparrow",
    category: "birds",
    description: "A small brown bird that sings sweet morning songs.",
    rarity: "common",
    iconSlug: "🐤",
  },
  {
    key: "bird-owl",
    title: "Ancient Horned Owl",
    category: "birds",
    description: "An epic sage owl that rests in the high crown.",
    rarity: "epic",
    iconSlug: "🦉",
  },
  // Butterflies
  {
    key: "butterfly-purple",
    title: "Purple Monarch",
    category: "butterflies",
    description: "A beautiful purple butterfly flying in figure-eights.",
    rarity: "common",
    iconSlug: "🦋",
  },
  {
    key: "butterfly-cyan",
    title: "Cyan Emperor",
    category: "butterflies",
    description: "A rare glowing butterfly drifting in gentle paths.",
    rarity: "rare",
    iconSlug: "🦋",
  },
  // Natural Wonders
  {
    key: "wonder-waterfall",
    title: "Ecosystem Waterfall",
    category: "natural_wonders",
    description: "A legendary waterfall cascading down the cliff side.",
    rarity: "legendary",
    iconSlug: "🌊",
  },
  {
    key: "wonder-pond",
    title: "Zen Reflection Pond",
    category: "natural_wonders",
    description: "An epic pond reflecting light on the grass surface.",
    rarity: "epic",
    iconSlug: "⛲",
  },
  {
    key: "wonder-crystal",
    title: "Magical Amethyst",
    category: "natural_wonders",
    description: "A rare glowing purple crystal cluster.",
    rarity: "rare",
    iconSlug: "🔮",
  },
  // Decorations
  {
    key: "deco-nest",
    title: "Cozy Twig Nest",
    category: "decorations",
    description: "A small straw nest tucked safely on a branch.",
    rarity: "common",
    iconSlug: "🪺",
  },
  {
    key: "deco-lantern",
    title: "Solar Lantern",
    category: "decorations",
    description: "A warm solar lantern placed at the tree root base.",
    rarity: "rare",
    iconSlug: "🏮",
  },
  {
    key: "deco-lights",
    title: "Fairy Lights",
    category: "decorations",
    description: "Magical lights hanging around the foliage canopy.",
    rarity: "epic",
    iconSlug: "✨",
  },
]

interface CollectionState {
  unlockedCollectionKeys: string[]
  unlockCollectionItem: (key: string, userId?: string) => Promise<boolean>
  syncWithSupabase: (userId: string) => Promise<void>
  loadCollections: (userId?: string) => Promise<void>
  resetCollections: () => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      unlockedCollectionKeys: [],

      unlockCollectionItem: async (key, userId) => {
        const current = get().unlockedCollectionKeys
        if (current.includes(key)) return false

        const updated = [...current, key]
        set({ unlockedCollectionKeys: updated })

        if (userId) {
          try {
            const headers = await getAuthHeader()
            const res = await fetch("/api/collections", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
            if (!res.ok) throw new Error("API error")
          } catch (e) {
            console.warn("Failed to sync collection unlock to API, saved offline:", e)
          }
        }
        return true
      },

      syncWithSupabase: async (userId) => {
        const localKeys = get().unlockedCollectionKeys
        if (localKeys.length === 0) return

        try {
          const headers = await getAuthHeader()
          // First, load DB keys to avoid double insertion attempts
          const res = await fetch("/api/collections", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const dbKeys: string[] = await res.json()

          const combined = Array.from(new Set([...localKeys, ...dbKeys]))
          set({ unlockedCollectionKeys: combined })

          const unsyncedKeys = localKeys.filter((k) => !dbKeys.includes(k))
          for (const key of unsyncedKeys) {
            await fetch("/api/collections", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: JSON.stringify({ key }),
            })
          }
        } catch (e) {
          console.error("Error syncing collections to API:", e)
        }
      },

      loadCollections: async (userId) => {
        if (!userId) return

        try {
          const headers = await getAuthHeader()
          const res = await fetch("/api/collections", {
            method: "GET",
            headers,
          })
          if (!res.ok) throw new Error("API error")
          const keys = await res.json()
          if (keys && keys.length > 0) {
            set({ unlockedCollectionKeys: keys })
          }
        } catch (e) {
          console.warn("Could not load user collections from API, staying offline:", e)
        }
      },

      resetCollections: () => {
        set({ unlockedCollectionKeys: [] })
      },
    }),
    {
      name: "green-hero-collections",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
