"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Rewards", href: "/rewards", icon: Trophy },
  { label: "Profile", href: "/profile", icon: User },
]

export function BottomNavBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-border-light shadow-lg md:hidden dark:bg-cardbg-dark dark:border-border-dark"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="flex justify-around items-center h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[56px] text-xs font-bold transition-all outline-none focus-visible:ring-4 focus-visible:ring-primaryGreen rounded-button",
                isActive
                  ? "text-primaryGreen dark:text-primaryGreen-dark scale-105"
                  : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive ? "bg-primaryGreen/10 dark:bg-primaryGreen-dark/10" : ""
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="sr-only md:not-sr-only text-[10px] mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
