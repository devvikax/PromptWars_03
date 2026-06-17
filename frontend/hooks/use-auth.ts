"use client"

import { useAuthStore } from "@/store/auth-store"
import { useSessionStore } from "@/store/session-store"
import {
  sendOtpCode,
  verifyOtpCode,
  signInWithGoogleOAuth,
  signOutUser,
} from "@/services/auth"

export function useAuth() {
  const { user, isGuest, isAuthenticated, loginAsGuest } = useAuthStore()
  const { isLoading, error, setError, clearError } = useSessionStore()

  const handleSendOtp = async (phone: string): Promise<boolean> => {
    clearError()
    return await sendOtpCode(phone)
  }

  const handleVerifyOtp = async (phone: string, token: string): Promise<boolean> => {
    clearError()
    return await verifyOtpCode(phone, token)
  }

  const handleGoogleLogin = async (): Promise<void> => {
    clearError()
    await signInWithGoogleOAuth()
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
    sendOtp: handleSendOtp,
    verifyOtp: handleVerifyOtp,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
  }
}
