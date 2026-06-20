import { auth } from "@/lib/firebase"
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth"
import { useAuthStore } from "@/store/auth-store"
import { useSessionStore } from "@/store/session-store"
import { useGameStore } from "@/store/game-store"
import { useGuestStore } from "@/store/guest-store"
import { useProfileStore } from "@/store/profile-store"
import { mergeGuestProgressDb, updateUserProfileOnDb, getUserProfile } from "./db-user"
import { useAchievementStore } from "@/store/achievement-store"
import { useRewardStore } from "@/store/reward-store"
import { useCollectionStore } from "@/store/collection-store"
import { useBehaviorStore } from "@/store/behavior-store"
import { completeMissionOnDb, getUserCompletedMissions } from "./db-missions"

// Check if Firebase is unconfigured
const isPlaceholderMode = !auth

let isBridging = false

// 1. Listen for Firebase auth changes and restore session
if (typeof window !== "undefined" && auth) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    const { setError, setLoading } = useSessionStore.getState()
    if (firebaseUser) {
      if (isBridging) return
      isBridging = true
      setLoading(true)
      try {
        const token = await firebaseUser.getIdToken()
        document.cookie = `fb-access-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        
        useAuthStore.getState().setSessionUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || undefined,
        })

        // Sync database profile and local stores
        const [profile, completedMissions] = await Promise.all([
          getUserProfile(firebaseUser.uid),
          getUserCompletedMissions(firebaseUser.uid)
        ])

        if (profile) {
          if (profile.travelType && profile.acUsage && profile.foodType) {
            useProfileStore.getState().setPreferences({
              travelType: profile.travelType,
              acUsage: profile.acUsage,
              foodType: profile.foodType,
            })
            document.cookie = "green-hero-onboarded=true; path=/; max-age=31536000; SameSite=Lax"
          }

          const completedMissionIds = completedMissions.map((cm) => cm.missionId)
          useGameStore.setState({
            level: profile.level,
            xp: profile.xp,
            streak: profile.streak,
            waterDrops: profile.waterDrops,
            completedMissionIds: completedMissionIds,
          })

          useAchievementStore.getState().loadAchievements(firebaseUser.uid)
          useRewardStore.getState().loadRewards(firebaseUser.uid)
          useCollectionStore.getState().loadCollections(firebaseUser.uid)
          useBehaviorStore.getState().loadBehavior(firebaseUser.uid)
        }
      } catch (err: any) {
        console.error("Error loading user profile:", err)
        setError(err.message || "Failed to load profile.")
      } finally {
        isBridging = false
        setLoading(false)
      }
    } else {
      document.cookie = "fb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      useAuthStore.getState().setSessionUser(null)
    }
  })
}

// 2. Email & Password Auth Actions
export async function registerWithEmailPassword(email: string, password: string): Promise<boolean> {
  const { setError, setLoading } = useSessionStore.getState()
  setLoading(true)
  setError(null)

  if (isPlaceholderMode) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockUserId = "usr_mock_" + Math.random().toString(36).substring(2, 9)
    document.cookie = `fb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
    useAuthStore.getState().setSessionUser({
      id: mockUserId,
      email,
    })

    await syncAndMergeGuestProgress(mockUserId)
    setLoading(false)
    return true
  }

  try {
    if (!auth) throw new Error("Firebase Auth is not initialized.")
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (result.user) {
      // Wait for session user to resolve via bridge
      let retries = 0
      while (retries < 20) {
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          await syncAndMergeGuestProgress(currentUser.id)
          return true
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        retries++
      }
      throw new Error("Sync timeout. Please refresh the page.")
    }
    return false
  } catch (err: any) {
    console.error("Firebase Registration failed:", err)
    let userMessage = err.message || "Failed to create account."
    if (err.code === "auth/email-already-in-use") {
      userMessage = "This email address is already in use."
    } else if (err.code === "auth/invalid-email") {
      userMessage = "Please enter a valid email address."
    } else if (err.code === "auth/weak-password") {
      userMessage = "Password should be at least 6 characters."
    }
    setError(userMessage)
    return false
  } finally {
    setLoading(false)
  }
}

export async function signInWithEmailPassword(email: string, password: string): Promise<boolean> {
  const { setError, setLoading } = useSessionStore.getState()
  setLoading(true)
  setError(null)

  if (isPlaceholderMode) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const mockUserId = "usr_mock_" + Math.random().toString(36).substring(2, 9)
    document.cookie = `fb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
    useAuthStore.getState().setSessionUser({
      id: mockUserId,
      email,
    })

    await syncAndMergeGuestProgress(mockUserId)
    setLoading(false)
    return true
  }

  try {
    if (!auth) throw new Error("Firebase Auth is not initialized.")
    const result = await signInWithEmailAndPassword(auth, email, password)
    if (result.user) {
      // Wait for session user to resolve via bridge
      let retries = 0
      while (retries < 20) {
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          await syncAndMergeGuestProgress(currentUser.id)
          return true
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        retries++
      }
      throw new Error("Sync timeout. Please refresh the page.")
    }
    return false
  } catch (err: any) {
    console.error("Firebase Login failed:", err)
    let userMessage = err.message || "Failed to log in."
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      userMessage = "Invalid email or password."
    }
    setError(userMessage)
    return false
  } finally {
    setLoading(false)
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (!isPlaceholderMode && auth) {
      await firebaseSignOut(auth)
    } else {
      document.cookie = "fb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      useAuthStore.getState().logout()
    }
  } catch (err) {
    console.error("Signout failed:", err)
  }
}

// 3. Merging logic: Guest profile progress -> Authenticated database profile
export async function syncAndMergeGuestProgress(authUserId: string): Promise<void> {
  const guestUserId = useGuestStore.getState().guestUserId
  
  if (guestUserId) {
    console.log(`Merging guest ${guestUserId} progress into user ${authUserId}`)
    const mergeOk = await mergeGuestProgressDb(guestUserId, authUserId)
    
    if (mergeOk) {
      const { level, xp, streak, waterDrops, completedMissionIds } = useGameStore.getState()
      const { travelType, acUsage, foodType } = useProfileStore.getState()
      
      await updateUserProfileOnDb(authUserId, {
        level,
        xp,
        streak,
        waterDrops,
        travelType: travelType || undefined,
        acUsage: acUsage || undefined,
        foodType: foodType || undefined,
        isGuest: false,
      })

      if (completedMissionIds.length > 0) {
        try {
          const existingCompletions = await getUserCompletedMissions(authUserId)
          const existingIds = existingCompletions.map((c) => c.missionId)
          
          for (const missionId of completedMissionIds) {
            if (!existingIds.includes(missionId)) {
              await completeMissionOnDb(authUserId, missionId)
            }
          }
        } catch (err) {
          console.error("Failed to sync completed missions during merge:", err)
        }
      }

      try {
        await useAchievementStore.getState().syncWithSupabase(authUserId)
        await useRewardStore.getState().syncWithSupabase(authUserId)
        await useCollectionStore.getState().syncWithSupabase(authUserId)
        await useBehaviorStore.getState().syncWithSupabase(authUserId)
      } catch (err) {
        console.error("Failed to sync stores during merge:", err)
      }

      console.log("Guest progress successfully merged and updated on database.")
    }
  }
  
  useGuestStore.getState().resetGuestSession()
}
