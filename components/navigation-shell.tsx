"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "./sidebar-nav"
import { BottomNavBar } from "./bottom-nav-bar"
import { useAuthStore } from "@/store/auth-store"
import { useGuestStore } from "@/store/guest-store"
import { useGameStore } from "@/store/game-store"
import { ToastContainer } from "./ui/toast"
import { SaveProgressModal } from "./auth/save-progress-modal"
import { useProgressionEngine } from "@/hooks/use-progression-engine"
import { CelebrationOverlay } from "./ui/celebration-overlay"

interface NavigationShellProps {
  children: React.ReactNode
}

export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname()
  const isGuest = useAuthStore((state) => state.isGuest)
  
  // Run the background progression checks reactively!
  useProgressionEngine()
  
  const checkEngagement = useGuestStore((state) => state.checkEngagementMilestones)
  const completedCount = useGameStore((state) => state.completedMissionIds.length)
  const level = useGameStore((state) => state.level)
  const streak = useGameStore((state) => state.streak)

  // Do not show navigation on splash (/), auth (/auth), or onboarding (/onboarding) pages
  const noNavRoutes = ["/", "/auth", "/onboarding"]
  const hideNavigation = noNavRoutes.includes(pathname)

  React.useEffect(() => {
    if (isGuest && !hideNavigation) {
      checkEngagement()
    }
  }, [isGuest, hideNavigation, checkEngagement, completedCount, level, streak])

  if (hideNavigation) {
    return (
      <main className="min-h-screen w-full bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark">
        {children}
        <ToastContainer />
        <CelebrationOverlay />
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Desktop Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-grow p-4 md:p-8 lg:p-12 pb-[96px] md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNavBar />

      {/* Global notifications container */}
      <ToastContainer />

      {/* Celebration overlay */}
      <CelebrationOverlay />

      {/* Milestone progress backup prompt */}
      <SaveProgressModal />
    </div>
  )
}

