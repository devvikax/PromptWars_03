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
  const { login, register, loginWithGoogle, isLoading, error } = useAuth()
  const addToast = useToastStore((state) => state.addToast)

  const handleGoogleSignIn = async () => {
    const ok = await loginWithGoogle()
    if (ok) {
      setSuccess(true)
      addToast("Successfully logged in with Google!", "success")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }
  }

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

              {/* Divider */}
              <div className="flex items-center my-1">
                <div className="flex-1 border-t border-border-light dark:border-border-dark"></div>
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Or continue with</span>
                <div className="flex-1 border-t border-border-light dark:border-border-dark"></div>
              </div>

              {/* Google Button */}
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 border-2 border-border-light hover:border-primaryGreen dark:border-border-dark dark:hover:border-primaryGreen text-xs font-bold"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </Button>
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
