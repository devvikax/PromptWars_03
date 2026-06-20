"use client"

import * as React from "react"
import { WifiOff, Download, X } from "lucide-react"
import { useGameStore } from "@/store/game-store"
import { scheduleStreakWarning } from "@/services/notification-service"

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Set initial offline status
    setIsOffline(!navigator.onLine)

    // Auto-schedule streak warning from the last completion date on startup
    const gameState = useGameStore.getState()
    if (gameState.completedAtDates && gameState.completedAtDates.length > 0) {
      const lastDate = gameState.completedAtDates[gameState.completedAtDates.length - 1]
      scheduleStreakWarning(lastDate)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 2. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully with scope:", reg.scope)
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err)
        })
    }

    // 3. Listen for Install Prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWA Installation outcome: ${outcome}`)
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-[#EF4444] text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold font-sans shadow-md animate-slide-down">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>You are currently browsing offline. Some data synchronizations are paused. 🍃</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[9998] p-4 bg-white/95 dark:bg-cardbg-dark/95 backdrop-blur border-2 border-primaryGreen/30 rounded-card shadow-2xl flex flex-col gap-3 font-sans transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <h5 className="font-extrabold text-sm text-text-primary-light dark:text-text-primary-dark">
                Install Green Hero
              </h5>
              <p className="text-xxs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                Add to your home screen for quick, offline-capable carbon tracking!
              </p>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full h-8 bg-primaryGreen text-white text-xs font-bold rounded-button flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        </div>
      )}

      {children}
    </>
  )
}
