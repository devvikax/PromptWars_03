"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Lock, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToastStore } from "@/store/toast-store"

export default function AuthPage() {
  const router = useRouter()
  const { login, register, isLoading, error } = useAuth()
  const addToast = useToastStore((state) => state.addToast)

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [mode, setMode] = React.useState<"login" | "register">("login")
  const [success, setSuccess] = React.useState(false)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple checks
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      addToast("Please enter a valid email address.", "error")
      return
    }

    if (!password || password.length < 6) {
      addToast("Password must be at least 6 characters.", "error")
      return
    }

    let ok = false
    if (mode === "login") {
      ok = await login(trimmedEmail, password)
      if (ok) {
        setSuccess(true)
        addToast("Successfully logged in!", "success")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } else {
      ok = await register(trimmedEmail, password)
      if (ok) {
        setSuccess(true)
        addToast("Account successfully created!", "success")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen justify-between items-center p-6 bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Header back button */}
      <header className="w-full max-w-sm flex items-center justify-start py-4">
        {!success && (
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm font-bold text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen rounded-button"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      </header>

      {/* Main card */}
      <Card className="w-full max-w-sm flex flex-col gap-6 p-6">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="auth-form-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-4xl select-none" role="img" aria-hidden="true">
                  🌱
                </span>
                <h2 className="font-sans font-extrabold text-2xl">
                  {mode === "login" ? "Welcome Back" : "Create Eco Account"}
                </h2>
                <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                  {mode === "login"
                    ? "Log in to retrieve your carbon streaks and floating island progress."
                    : "Save your preferences, milestones, and virtual tree metrics."}
                </p>
              </div>

              {/* Error Box */}
              {error && (
                <div
                  className="flex items-start gap-2.5 p-3.5 bg-red-50 border-2 border-red-200 rounded-card text-xs font-bold text-dangerRed-light dark:bg-cardbg-dark dark:border-dangerRed-dark dark:text-dangerRed-dark"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Auth Mode Tabs Toggle */}
              <div className="flex bg-canvas-light dark:bg-canvas-dark p-1 rounded-card border border-border-light dark:border-border-dark">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-xs font-bold rounded-card transition-all ${
                    mode === "login"
                      ? "bg-white text-text-primary-light shadow-sm dark:bg-cardbg-dark dark:text-text-primary-dark"
                      : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light"
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-xs font-bold rounded-card transition-all ${
                    mode === "register"
                      ? "bg-white text-text-primary-light shadow-sm dark:bg-cardbg-dark dark:text-text-primary-dark"
                      : "text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-text-muted-light" />
                    <input
                      id="email"
                      type="email"
                      placeholder="hero@greenhero.app"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-border-light rounded-card text-sm font-bold text-text-primary-light placeholder:text-text-muted-light/35 focus:outline-none focus:border-primaryGreen dark:bg-canvas-dark dark:border-border-dark dark:text-text-primary-dark"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-4 h-4 text-text-muted-light" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-border-light rounded-card text-sm font-bold text-text-primary-light placeholder:text-text-muted-light/35 focus:outline-none focus:border-primaryGreen dark:bg-canvas-dark dark:border-border-dark dark:text-text-primary-dark"
                    />
                  </div>
                </div>

                <Button variant="primary" loading={isLoading} type="submit" className="w-full mt-2">
                  {mode === "login" ? "Log In & Continue" : "Create Account"}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-4 py-6"
            >
              <div className="w-20 h-20 rounded-full bg-primaryGreen/10 border-4 border-primaryGreen flex items-center justify-center text-4xl select-none animate-bounce">
                🎉
              </div>
              <h2 className="font-sans font-extrabold text-2xl text-text-primary-light dark:text-text-primary-dark">
                {mode === "login" ? "Hero Logged In!" : "Profile Registered!"}
              </h2>
              <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-[200px]">
                Your sustainability metrics are active and synced. Redirecting to dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Spacer */}
      <div className="h-4" />
    </div>
  )
}
