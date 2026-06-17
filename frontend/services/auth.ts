import { supabase } from "./supabase"
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
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url")

// 1. Listen for auth changes and write cookies for Next.js Middleware route checking
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      // Set Supabase auth token cookies
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      
      const user = session.user
      useAuthStore.getState().setSessionUser({
        id: user.id,
        email: user.email,
        phone: user.phone,
      })

      // Fetch user profile and completed missions from Supabase and sync local stores
      Promise.all([
        getUserProfile(user.id),
        getUserCompletedMissions(user.id)
      ]).then(([profile, completedMissions]) => {
        if (profile) {
          // If onboarding answers exist in db, restore them and set cookie
          if (profile.travelType && profile.acUsage && profile.foodType) {
            useProfileStore.getState().setPreferences({
              travelType: profile.travelType,
              acUsage: profile.acUsage,
              foodType: profile.foodType,
            })
            // Write green-hero-onboarded cookie!
            document.cookie = "green-hero-onboarded=true; path=/; max-age=31536000; SameSite=Lax"
          }

          // Restore game stats and completed mission IDs
          const completedMissionIds = completedMissions.map((cm) => cm.missionId)
          useGameStore.setState({
            level: profile.level,
            xp: profile.xp,
            streak: profile.streak,
            waterDrops: profile.waterDrops,
            completedMissionIds: completedMissionIds,
          })

          // Load achievements, rewards, collections, behavior from DB
          useAchievementStore.getState().loadAchievements(user.id)
          useRewardStore.getState().loadRewards(user.id)
          useCollectionStore.getState().loadCollections(user.id)
          useBehaviorStore.getState().loadBehavior(user.id)
        }
      }).catch((err) => console.error("Error loading user profile on auth change:", err))
    } else {
      // Only clear standard user cookies (do not wipe guest cookie unless intended)
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      
      useAuthStore.getState().setSessionUser(null)
    }
  })
}

// 2. Auth Actions
export async function sendOtpCode(phone: string): Promise<boolean> {
  const { setError, setLoading } = useSessionStore.getState()
  setLoading(true)
  setError(null)
  
  if (isPlaceholderMode) {
    console.log("Mock Mode: Sending verification code 123456 to", phone)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setLoading(false)
    return true
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) throw error
    return true
  } catch (err: any) {
    console.error("Supabase OTP request failed:", err)
    if (err.status === 429) {
      setError("SMS rate limit reached. Please wait a minute before retrying.")
    } else {
      setError(err.message || "Failed to send verification SMS.")
    }
    return false
  } finally {
    setLoading(false)
  }
}

export async function verifyOtpCode(phone: string, token: string): Promise<boolean> {
  const { setError, setLoading } = useSessionStore.getState()
  setLoading(true)
  setError(null)

  if (isPlaceholderMode) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    if (token === "123456") {
      const mockUserId = "usr_mock_" + Math.random().toString(36).substring(2, 9)
      
      // Simulate active session cookies for middleware
      document.cookie = `sb-access-token=mock-token-${mockUserId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      
      // Set auth state
      useAuthStore.getState().setSessionUser({
        id: mockUserId,
        phone,
      })

      // Sync guest progress
      await syncAndMergeGuestProgress(mockUserId)
      setLoading(false)
      return true
    } else {
      setError("Invalid verification code. Please try 123456")
      setLoading(false)
      return false
    }
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })
    
    if (error) throw error
    if (data.session) {
      // Sync guest progress to verified database profile
      await syncAndMergeGuestProgress(data.session.user.id)
      return true
    }
    return false
  } catch (err: any) {
    console.error("Supabase OTP verification failed:", err)
    setError(err.message || "Invalid or expired verification code.")
    return false
  } finally {
    setLoading(false)
  }
}

export async function signInWithGoogleOAuth(): Promise<void> {
  const { setError } = useSessionStore.getState()
  setError(null)

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
  } catch (err: any) {
    console.error("Google OAuth initialization failed:", err)
    setError(err.message || "Could not initialize Google authentication.")
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (!isPlaceholderMode) {
      await supabase.auth.signOut()
    }
    useAuthStore.getState().logout()
  } catch (err) {
    console.error("Signout failed:", err)
  }
}

// 3. Merging logic: Guest profile progress -> Authenticated database profile
export async function syncAndMergeGuestProgress(authUserId: string): Promise<void> {
  const guestUserId = useGuestStore.getState().guestUserId
  
  if (guestUserId) {
    console.log(`Merging guest ${guestUserId} progress into user ${authUserId}`)
    // Call database RPC to change user_id on completions
    const mergeOk = await mergeGuestProgressDb(guestUserId, authUserId)
    
    if (mergeOk) {
      // Sync local game-store level, streak, drops, and XP into permanent table
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

      // Sync completed missions to DB user_missions table!
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

      // Sync achievements, rewards, collections, behavior to Supabase
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
  
  // Clean up guest local stores since session is now fully authenticated
  useGuestStore.getState().resetGuestSession()
}
