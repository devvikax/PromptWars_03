"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"

export default function SplashPage() {
  const router = useRouter()
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest)
  const isGuest = useAuthStore((state) => state.isGuest)

  const handleGetStarted = () => {
    loginAsGuest()
    router.push("/onboarding")
  }

  const handleLogIn = () => {
    router.push("/auth")
  }

  return (
    <div className="flex flex-col min-h-screen justify-between items-center p-6 bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Spacer */}
      <div className="h-4" />

      {/* Main Seed Mascot / Brand Content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="flex flex-col items-center text-center gap-6 max-w-sm"
      >
        {/* Animated Brand Emblem */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full bg-[#E2F2E7] border-4 border-primaryGreen flex items-center justify-center shadow-tactile-card select-none"
        >
          <Leaf className="w-16 h-16 text-primaryGreen" />
        </motion.div>

        {/* Brand Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-sans font-extrabold text-4xl tracking-tight leading-none">
            Green Hero
          </h1>
          <p className="font-sans font-semibold text-lg text-primaryGreen dark:text-primaryGreen-dark">
            Small Actions. Big Impact.
          </p>
          <p className="font-sans text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-2">
            Help protect the planet through simple daily routines, gamified challenges, and tracking.
          </p>
        </div>
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.15 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button variant="primary" onClick={handleGetStarted} className="w-full">
          Get Started
        </Button>
        <Button variant="outline" onClick={handleLogIn} className="w-full">
          I already have an account
        </Button>

        {/* Small Brand Footer */}
        <footer className="text-center mt-6 text-[10px] text-text-muted-light dark:text-text-muted-dark font-sans leading-relaxed">
          By getting started, you agree to our Terms and Privacy Policy. Emojis and visual stats are simplified carbon approximations.
        </footer>
      </motion.div>
    </div>
  )
}
