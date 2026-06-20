export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Failed to request notification permission:", error)
    return false
  }
}

export async function sendLocalNotification(title: string, body: string, iconUrl: string = "/icon.svg") {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return

  try {
    // Standard service worker background notification if SW is active (supports background/PWA)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready
      reg.showNotification(title, {
        body,
        icon: iconUrl,
        badge: iconUrl,
        vibrate: [100, 50, 100],
      } as any)
    } else {
      // Fallback to standard web notification
      new Notification(title, {
        body,
        icon: iconUrl,
      })
    }
  } catch (error) {
    console.error("Failed to trigger local notification:", error)
  }
}

// Scheduled check for daily motivation and streak warning (checks local time and schedules alert)
export function scheduleStreakWarning(lastLoggedTimestamp: string | null) {
  if (!lastLoggedTimestamp || typeof window === "undefined") return
  
  const lastActive = new Date(lastLoggedTimestamp).getTime()
  const now = Date.now()
  const twentyHoursInMs = 20 * 60 * 60 * 1000 // 20 hours
  const targetTime = lastActive + twentyHoursInMs
  const delay = targetTime - now

  if (delay > 0) {
    console.log(`Streak reminder scheduled in ${Math.round(delay / 1000 / 60)} minutes.`)
    
    // Clear any previous timer if stored on window
    const win = window as any
    if (win.streakReminderTimer) {
      clearTimeout(win.streakReminderTimer)
    }

    win.streakReminderTimer = setTimeout(() => {
      sendLocalNotification(
        "🔥 Streak Warning!",
        "Your green streak is expiring in 4 hours! Log a carbon saving action today to keep it alive!"
      )
    }, delay)
  }
}
