"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Trophy, User, Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: "Home Dashboard", href: "/dashboard", icon: Home },
  { label: "Impact & Progress", href: "/progress", icon: TrendingUp },
  { label: "Rewards & Streaks", href: "/rewards", icon: Trophy },
  { label: "Hero Profile", href: "/profile", icon: User },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 left-0 bg-white border-r-2 border-border-light shadow-tactile-card dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none p-6"
      role="navigation"
      aria-label="Desktop Navigation"
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 mb-10 select-none">
        <span className="text-3xl" role="img" aria-label="Green Hero Seed Mascot">
          🌱
        </span>
        <div className="flex flex-col">
          <span className="font-sans font-extrabold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Green Hero
          </span>
          <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-primaryGreen dark:text-primaryGreen-dark">
            Small Actions, Big Impact
          </span>
        </div>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-grow flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-card text-sm font-bold transition-all border-2 outline-none focus-visible:ring-4 focus-visible:ring-primaryGreen",
                isActive
                  ? "bg-canvas-light text-primaryGreen border-primaryGreen dark:bg-primaryGreen-dark/10 dark:text-primaryGreen-dark dark:border-primaryGreen-dark"
                  : "bg-transparent text-text-muted-light border-transparent hover:bg-canvas-light hover:text-text-primary-light dark:text-text-muted-dark dark:hover:bg-border-dark dark:hover:text-text-primary-dark"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Switcher controls at bottom */}
      <div className="border-t-2 border-dashed border-border-light dark:border-border-dark pt-6 mt-auto">
        <div className="flex items-center justify-between bg-canvas-light dark:bg-canvas-dark p-1 rounded-button border-2 border-border-light dark:border-border-dark">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center justify-center p-2 rounded-full flex-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
              theme === "light"
                ? "bg-white text-rewardGold border-2 border-border-light dark:border-border-dark shadow-sm"
                : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light"
            )}
            aria-label="Set light theme"
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center justify-center p-2 rounded-full flex-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
              theme === "dark"
                ? "bg-cardbg-dark text-primaryGreen-dark border-2 border-border-dark shadow-sm"
                : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light"
            )}
            aria-label="Set dark theme"
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex items-center justify-center p-2 rounded-full flex-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
              theme === "system"
                ? "bg-white dark:bg-cardbg-dark text-text-primary-light dark:text-text-primary-dark border-2 border-border-light dark:border-border-dark shadow-sm"
                : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light"
            )}
            aria-label="Set system theme"
            title="System Theme"
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
