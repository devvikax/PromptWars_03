import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "reward" | "accent" | "danger"
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-button px-3.5 py-1 text-xs font-bold uppercase tracking-wide border-2",
        {
          "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] dark:bg-cardbg-dark dark:border-primaryGreen-dark dark:text-primaryGreen-dark":
            variant === "primary",
          "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] dark:bg-cardbg-dark dark:border-rewardGold-dark dark:text-rewardGold-dark":
            variant === "reward",
          "bg-canvas-light text-text-primary-light border-border-light dark:bg-cardbg-dark dark:border-border-dark dark:text-text-primary-dark":
            variant === "accent",
          "bg-red-50 text-dangerRed-light border-red-200 dark:bg-cardbg-dark dark:border-dangerRed-dark dark:text-dangerRed-dark":
            variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
