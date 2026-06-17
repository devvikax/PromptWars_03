"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react"
import { useToastStore, ToastMessage } from "@/store/toast-store"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-[360px] pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useToastStore((state) => state.removeToast)

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-primaryGreen dark:text-primaryGreen-dark" />,
    error: <AlertCircle className="w-5 h-5 text-dangerRed-light dark:text-dangerRed-dark" />,
    warning: <AlertTriangle className="w-5 h-5 text-rewardGold dark:text-rewardGold-dark" />,
    info: <Info className="w-5 h-5 text-waterBlue-light dark:text-waterBlue-dark" />,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "flex items-start gap-3 p-4 bg-white border-2 border-border-light rounded-card shadow-tactile-card pointer-events-auto dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none",
        {
          "border-primaryGreen dark:border-primaryGreen-dark": toast.type === "success",
          "border-dangerRed-light dark:border-dangerRed-dark": toast.type === "error",
          "border-rewardGold dark:border-rewardGold-dark": toast.type === "warning",
          "border-waterBlue-light dark:border-waterBlue-dark": toast.type === "info",
        }
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-grow font-sans text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-full hover:bg-canvas-light dark:hover:bg-border-dark text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
