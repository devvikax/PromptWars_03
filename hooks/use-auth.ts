"use client"

import { useAuthStore } from "@/store/auth-store"
import { useSessionStore } from "@/store/session-store"
import {
  signInWithEmailPassword,
  registerWithEmailPassword,
  signOutUser,
} from "@/services/auth"

export function useAuth() {
  const { user, isGuest, isAuthenticated, loginAsGuest } = useAuthStore()
  const { isLoading, error, setError, clearError } = useSessionStore()

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    clearError()
    return await signInWithEmailPassword(email, password)
  }

  const handleRegister = async (email: string, password: string): Promise<boolean> => {
    clearError()
    return await registerWithEmailPassword(email, password)
  }

  const handleLogout = async (): Promise<void> => {
    clearError()
    await signOutUser()
  }

  return {
    user,
    isGuest,
    isAuthenticated,
    isLoading,
    error,
    loginAsGuest,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }
}
