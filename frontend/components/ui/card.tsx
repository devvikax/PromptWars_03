import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  selected?: boolean
}

export function Card({ className, hoverable = false, selected = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-border-light shadow-tactile-card rounded-card p-6 dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none transition-all duration-150",
        {
          "hover:-translate-y-0.5 hover:shadow-tactile-card-hover cursor-pointer": hoverable && !selected,
          "border-primaryGreen bg-canvas-light shadow-tactile-green translate-y-0.5 dark:border-primaryGreen-dark dark:bg-cardbg-dark": selected,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
