"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Phone, Mail, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGuestStore } from "@/store/guest-store"
import { useAuth } from "@/hooks/use-auth"
import { useGameStore } from "@/store/game-store"

export function SaveProgressModal() {
  const router = useRouter()
  const { showSaveProgressModal, setSaveProgressModal, dismissSaveProgress } = useGuestStore()
  const { loginWithGoogle, isLoading } = useAuth()
  const { level, streak, completedMissionIds } = useGameStore()

  // Find which milestone was met for personal context
  let milestoneText = "You are doing great!"
  if (level >= 3) {
    milestoneText = `You reached Level ${level}: Carbon Cadet! 🌿`
  } else if (streak >= 3) {
    milestoneText = `You are on a ${streak}-day sustainable streak! 🔥`
  } else if (completedMissionIds.length >= 5) {
    milestoneText = `You completed ${completedMissionIds.length} green missions! 🚶`
  }

  const handlePhoneSignUp = () => {
    setSaveProgressModal(false)
    router.push("/auth")
  }

  const handleGoogleSignUp = async () => {
    await loginWithGoogle()
  }

  return (
    <Dialog
      isOpen={showSaveProgressModal}
      onClose={dismissSaveProgress}
      title="Save your progress?"
      className="max-w-sm"
    >
      <div className="flex flex-col gap-6 text-center">
        {/* Milestone badge chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] text-[#92400E] border-2 border-[#FCD34D] rounded-button text-xs font-extrabold uppercase tracking-wider animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Milestone Reached!</span>
          </div>
        </div>

        {/* Dynamic Detail Text */}
        <div className="flex flex-col gap-2">
          <h4 className="font-sans font-bold text-base text-text-primary-light dark:text-text-primary-dark">
            {milestoneText}
          </h4>
          <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
            Create an account using Phone SMS or Google to back up your stats, keep growing your seedling tree, and sync progress across devices!
          </p>
        </div>

        {/* Choice buttons */}
        <div className="flex flex-col gap-3">
          {/* Phone SMS signup */}
          <Button
            variant="primary"
            onClick={handlePhoneSignUp}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <Phone className="w-4 h-4" />
            Continue with Phone
          </Button>

          {/* Google OAuth signup */}
          <Button
            variant="outline"
            onClick={handleGoogleSignUp}
            loading={isLoading}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <Mail className="w-4 h-4 text-primaryGreen" />
            Continue with Google
          </Button>

          {/* Skip option */}
          <Button
            variant="ghost"
            onClick={dismissSaveProgress}
            className="w-full text-xs font-bold"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
