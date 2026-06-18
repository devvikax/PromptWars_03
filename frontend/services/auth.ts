import { supabase } from "./supabase"
import { auth } from "@/lib/firebase"
import {
  signInWithPopup,
  GoogleAuthProvider,
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

// Check if Supabase connection is unconfigured
const isPlaceholderMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url") ||
  !auth

let isBridging = false

// 1. Listen for Firebase auth changes and bridge them to Supabase
if (typeof window !== "undefined" && auth) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    const { setError, setLoading } = useSessionStore.getState()
    if (firebaseUser) {
      if (isBridging) return
      isBridging = true
      setLoading(true)
      try {
        // Prepare login credentials for Supabase
        const email = firebaseUser.email || `user_${firebaseUser.uid}@greenhero.app`
        const password = firebaseUser.uid // Use secret Firebase UID as password

        // Try to sign in to Supabase
        let { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        // If user not found, sign up in Supabase
        if (error && error.message.includes("Invalid login credentials")) {
          const signUpRes = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                firebase_uid: firebaseUser.uid,
              }
            }
          })
          if (signUpRes.error) throw signUpRes.error
          
          // Re-attempt sign-in
          const retryRes = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (retryRes.error) throw retryRes.error
          data = retryRes.data
        } else if (error) {
          throw error
        }

        // Establish the cookies and session
        if (data.session) {
          const session = data.session
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          
          const user = session.user
          useAuthStore.getState().setSessionUser({
            id: user.id,
            email: firebaseUser.email || undefined,
          })

          // Sync database profile and local stores
          const [profile, completedMissions] = await Promise.all([
            getUserProfile(user.id),
            getUserCompletedMissions(user.id)
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

            useAchievementStore.getState().loadAchievements(user.id)
            useRewardStore.getState().loadRewards(user.id)
            useCollectionStore.getState().loadCollections(user.id)
            useBehaviorStore.getState().loadBehavior(user.id)
          }
        }
      } catch (err: any) {
        console.error("Error bridging Firebase to Supabase:", err)
        setError(err.message || "Failed to sync authenticated profile.")
      } finally {
        isBridging = false
        setLoading(false)
      }
    } else {
      // Clear cookies and sign out from Supabase if signed in
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      
      await supabase.auth.signOut()
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
    document.cookie = `sb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
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
        if (currentUser && !currentUser.id.startsWith("usr_mock_")) {
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
    document.cookie = `sb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
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
        if (currentUser && !currentUser.id.startsWith("usr_mock_")) {
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

export async function signInWithGoogleOAuth(): Promise<void> {
  const { setError, setLoading } = useSessionStore.getState()
  setError(null)
  setLoading(true)

  if (isPlaceholderMode) {
    console.log("Mock Mode: Simulating Google login redirect...")
    const mockUserId = "usr_google_" + Math.random().toString(36).substring(2, 9)
    document.cookie = `sb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
    useAuthStore.getState().setSessionUser({
      id: mockUserId,
      email: "eco.hero@gmail.com",
    })
    
    await syncAndMergeGuestProgress(mockUserId)
    window.location.href = "/dashboard"
    return
  }

  try {
    if (!auth) throw new Error("Firebase Auth is not initialized.")
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    if (result.user) {
      // Wait for session user to resolve via bridge
      let retries = 0
      while (retries < 20) {
        const currentUser = useAuthStore.getState().user
        if (currentUser && !currentUser.id.startsWith("usr_mock_")) {
          await syncAndMergeGuestProgress(currentUser.id)
          window.location.href = "/dashboard"
          return
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        retries++
      }
      throw new Error("Sync timeout. Please try again.")
    }
  } catch (err: any) {
    console.error("Firebase Google Auth failed:", err)
    if (err.code === "auth/popup-closed-by-user") {
      setError("Google sign-in popup was closed before completion. Please try again.")
    } else {
      setError(err.message || "Could not initialize Google authentication.")
    }
  } finally {
    setLoading(false)
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (!isPlaceholderMode && auth) {
      await firebaseSignOut(auth)
    } else {
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
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
