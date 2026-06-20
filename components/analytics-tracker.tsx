"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { getAuthHeader } from "@/services/auth-header"

export function AnalyticsTracker() {
  const pathname = usePathname()

  React.useEffect(() => {
    if (!pathname) return

    const trackPageView = async () => {
      try {
        const headers = await getAuthHeader()
        // Skip analytics trigger if not logged in (reduces empty logs for guests)
        if (!headers.Authorization) return

        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            eventName: "page_view",
            metadata: {
              pathname,
              userAgent: navigator.userAgent,
            },
          }),
        })
      } catch (error) {
        console.warn("Analytics event tracking failed:", error)
      }
    }

    trackPageView()
  }, [pathname])

  return null
}
