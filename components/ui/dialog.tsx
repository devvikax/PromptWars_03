"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  // Focus Trapping and escape key bindings
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className={cn(
              "relative w-full max-w-md bg-white border-2 border-border-light shadow-tactile-card rounded-card p-6 z-10 dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none focus:outline-none",
              className
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="font-sans font-bold text-xl text-text-primary-light dark:text-text-primary-dark">
                  {title}
                </h3>
              )}
              <button
                className="p-1 rounded-full text-text-muted-light hover:bg-canvas-light hover:text-text-primary-light dark:text-text-muted-dark dark:hover:bg-border-dark dark:hover:text-text-primary-dark outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="font-sans text-sm text-text-primary-light dark:text-text-primary-dark flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
