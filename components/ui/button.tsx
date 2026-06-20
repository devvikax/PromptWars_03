"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "reward" | "outline" | "ghost"
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading = false, disabled, children, ...props }, ref) => {
    
    // Tactile CSS mapping
    const variantClasses = cn(
      "inline-flex items-center justify-center rounded-button font-sans font-bold text-sm uppercase tracking-wider px-7 py-3.5 cursor-pointer select-none transition-colors duration-100 outline-none focus-visible:ring-4 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
      {
        // Primary Green Button
        "bg-primaryGreen text-white border-2 border-primaryGreen-shadow shadow-tactile-green active:shadow-none hover:bg-opacity-90 dark:bg-primaryGreen-dark dark:border-primaryGreen-darkShadow dark:shadow-tactile-green-dark dark:text-canvas-dark":
          variant === "primary",
        // Amber Reward Button
        "bg-rewardGold text-white border-2 border-rewardGold-shadow shadow-tactile-gold active:shadow-none hover:bg-opacity-90 dark:bg-rewardGold-dark dark:border-rewardGold-darkShadow dark:shadow-tactile-gold-dark dark:text-canvas-dark":
          variant === "reward",
        // Standard Outline Card Button
        "bg-white text-text-primary-light border-2 border-border-light shadow-tactile-card hover:bg-canvas-light active:shadow-none dark:bg-cardbg-dark dark:border-border-dark dark:text-text-primary-dark dark:shadow-none":
          variant === "outline",
        // Simple Ghost Text Button
        "bg-transparent text-text-muted-light hover:text-text-primary-light dark:text-text-muted-dark dark:hover:text-text-primary-dark":
          variant === "ghost",
      }
    )

    // Framer Motion spring actions
    const buttonVariants = {
      idle: { scale: 1, y: 0 },
      hover: disabled || loading ? {} : { y: -2 },
      pressed: disabled || loading ? {} : { y: 4 }
    }

    return (
      <motion.button
        ref={ref as any}
        className={cn(variantClasses, className)}
        disabled={disabled || loading}
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="pressed"
        {...(props as any)}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spinner" />
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
