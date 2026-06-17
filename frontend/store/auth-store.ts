"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useGuestStore } from "./guest-store"

interface AuthUser {
  id: string
  email?: string
  phone?: string
}

interface AuthState {
  user: AuthUser | null
  isGuest: boolean
  isAuthenticated: boolean
  
  // Actions
  loginAsGuest: () => void
  setSessionUser: (user: AuthUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: true,
      isAuthenticated: false,

      loginAsGuest: () => {
        // Initialize guest state & set guest active cookie
        useGuestStore.getState().initializeGuestSession()
        set({
          user: null,
          isGuest: true,
          isAuthenticated: false
        })
      },

      setSessionUser: (user) => {
        if (user) {
          // Clear guest cookies & reset guest session upon authentication success
          useGuestStore.getState().resetGuestSession()
          set({
            user,
            isGuest: false,
            isAuthenticated: true
          })
        } else {
          set({
            user: null,
            isGuest: true,
            isAuthenticated: false
          })
        }
      },

      logout: () => {
        // Clear all cookies
        if (typeof document !== "undefined") {
          document.cookie = "green-hero-guest-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
          document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
          document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
          document.cookie = "green-hero-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        }
        
        useGuestStore.getState().resetGuestSession()
        set({
          user: null,
          isGuest: true,
          isAuthenticated: false
        })
      }
    }),
    {
      name: "green-hero-auth-state",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
