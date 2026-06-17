"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, ShieldAlert, Sparkles, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useGameStore } from "@/store/game-store"
import { useToastStore } from "@/store/toast-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isGuest, logout, isLoading } = useAuth()
  const { level, streak } = useGameStore()
  const addToast = useToastStore((state) => state.addToast)

  const handleLogout = async () => {
    await logout()
    addToast("Logged out successfully.", "info")
    router.push("/")
  }

  const handleSaveProgress = () => {
    router.push("/auth")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full font-sans pb-10"
    >
      {/* Title */}
      <div>
        <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-text-primary-light dark:text-text-primary-dark">
          Hero Profile
        </h2>
        <p className="font-sans text-sm text-text-muted-light dark:text-text-muted-dark">
          Manage your account settings and sync progress.
        </p>
      </div>

      {/* Profile Avatar Header */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-6">
        {/* Avatar badge */}
        <div className="w-24 h-24 rounded-full bg-primaryGreen/10 border-4 border-primaryGreen flex items-center justify-center text-4xl select-none shadow-inner">
          👤
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <h3 className="font-sans font-extrabold text-xl text-text-primary-light dark:text-text-primary-dark">
              {isGuest ? "Guest Hero" : "Authenticated Hero"}
            </h3>
            <Badge variant={isGuest ? "accent" : "primary"}>
              {isGuest ? "Local Guest" : "Synced"}
            </Badge>
          </div>
          <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark">
            {isGuest
              ? "Your stats are saved locally on this browser."
              : `Logged in via ${user?.phone || user?.email || "verified account"}`}
          </p>
          <div className="flex gap-2 mt-1">
            <Badge variant="primary">Lvl {level}</Badge>
            <Badge variant="reward">🔥 {streak} Day Streak</Badge>
          </div>
        </div>
      </Card>

      {/* Save Progress Card (Only for Guests) */}
      {isGuest && (
        <Card className="border-2 border-dangerRed-light/30 bg-red-50/20 dark:bg-cardbg-dark/40 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6 p-6">
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-red-500/10 rounded-full text-red-500 flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">
                Save Your Sustainable Progress
              </h4>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-lg">
                Guest accounts are stored in browser cookies. Create a free account using your Phone Number or Google login to back up your tree growth and streaks!
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={handleSaveProgress} className="whitespace-nowrap px-6">
            Register / Log In
          </Button>
        </Card>
      )}

      {/* AI Coach Container (Future Strategy spatial Coach preview) */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primaryGreen" />
          <h4 className="font-sans font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">
            Future Spatial AI Coach
          </h4>
        </div>
        <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">
          Soon you will be able to talk directly to your personal AI Coach using conversational audio. Ask questions like <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">&quot;What carbon saving habits are easy to start today?&quot;</span> or get real-time walkability suggestions for your route.
        </p>
        <div className="bg-canvas-light dark:bg-canvas-dark border border-dashed border-border-light dark:border-border-dark p-4 rounded-card text-center text-xs font-bold text-text-muted-light">
          🎙️ Feature Coming Soon in Phase 5
        </div>
      </Card>

      {/* Settings Options / Log out */}
      <div className="flex flex-col gap-4">
        {!isGuest && (
          <Button
            variant="outline"
            onClick={handleLogout}
            loading={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Log Out Account
          </Button>
        )}
      </div>
    </motion.div>
  )
}
