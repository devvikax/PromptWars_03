import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationShell } from "@/components/navigation-shell"
import { PwaProvider } from "@/components/pwa-provider"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import "./globals.css"

export const metadata: Metadata = {
  title: "Green Hero - Small Actions, Big Impact",
  description: "Track, gamify, and reduce your carbon footprint with friendly habit streaks, a growing seedling, and tactile community goals.",
  keywords: ["sustainability", "carbon footprint", "green habit tracker", "gamified ecology", "climate action"],
  authors: [{ name: "Green Hero Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Green Hero",
    statusBarStyle: "default",
    capable: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider defaultTheme="light" storageKey="green-hero-theme">
          <PwaProvider>
            <AnalyticsTracker />
            <NavigationShell>{children}</NavigationShell>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
