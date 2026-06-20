"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max: number
}

export function Progress({ className, value, max, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      className={cn(
        "relative w-full h-[18px] bg-[#E2F2E7] border-2 border-border-light rounded-button overflow-visible dark:bg-cardbg-dark dark:border-border-dark",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      {...props}
    >
      <motion.div
        className="h-full bg-primaryGreen rounded-button relative"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Star Handle Icon */}
        {percentage > 0 && (
          <motion.span
            className="absolute right-[-8px] top-[-6px] text-[18px] filter drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)] select-none"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            ⭐
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}
