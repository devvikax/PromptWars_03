"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Phone, ShieldCheck, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToastStore } from "@/store/toast-store"

export default function AuthPage() {
  const router = useRouter()
  const { sendOtp, verifyOtp, loginWithGoogle, isLoading, error } = useAuth()
  const addToast = useToastStore((state) => state.addToast)

  const [phone, setPhone] = React.useState("")
  const [code, setCode] = React.useState("")
  const [step, setStep] = React.useState<"phone" | "code" | "success">("phone")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 8) {
      addToast("Please enter a valid phone number.", "error")
      return
    }

    const success = await sendOtp(phone)
    if (success) {
      setStep("code")
      addToast("Verification code sent! (Use code 123456)", "info")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      addToast("Please enter a 6-digit code.", "error")
      return
    }

    const success = await verifyOtp(phone, code)
    if (success) {
      setStep("success")
      addToast("Successfully verified! Merging progress...", "success")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }
  }

  const handleGoogleLogin = async () => {
    await loginWithGoogle()
  }

  return (
    <div className="flex flex-col min-h-screen justify-between items-center p-6 bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Header back button */}
      <header className="w-full max-w-sm flex items-center justify-start py-4">
        {step !== "success" && (
          <button
            onClick={() => (step === "code" ? setStep("phone") : router.push("/"))}
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
          {step === "phone" && (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-4xl select-none" role="img" aria-hidden="true">
                  🔐
                </span>
                <h2 className="font-sans font-extrabold text-2xl">
                  Save Your Progress
                </h2>
                <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                  Log in or register using your phone number to secure your eco streaks.
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

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="phone"
                    className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark"
                  >
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-4 h-4 text-text-muted-light" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-border-light rounded-card text-sm font-bold text-text-primary-light placeholder:text-text-muted-light/35 focus:outline-none focus:border-primaryGreen dark:bg-canvas-dark dark:border-border-dark dark:text-text-primary-dark"
                    />
                  </div>
                </div>

                <Button variant="primary" loading={isLoading} type="submit" className="w-full mt-2">
                  Send SMS Code
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-grow h-[1px] bg-border-light dark:bg-border-dark" />
                <span className="font-sans text-[10px] uppercase font-bold text-text-muted-light">or</span>
                <div className="flex-grow h-[1px] bg-border-light dark:bg-border-dark" />
              </div>

              {/* Google login */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                loading={isLoading}
                className="flex items-center justify-center gap-2 w-full text-xs"
              >
                <Mail className="w-4 h-4 text-primaryGreen" />
                Continue with Google
              </Button>
            </motion.div>
          )}

          {step === "code" && (
            <motion.div
              key="code-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-4xl select-none" role="img" aria-hidden="true">
                  💬
                </span>
                <h2 className="font-sans font-extrabold text-2xl">
                  Verification Code
                </h2>
                <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                  We sent a 6-digit text code to <span className="font-bold">{phone}</span>. Please enter it below.
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

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="code"
                    className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark"
                  >
                    Enter 6-Digit Code
                  </label>
                  <div className="relative flex items-center">
                    <ShieldCheck className="absolute left-4 w-4 h-4 text-text-muted-light" />
                    <input
                      id="code"
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-border-light rounded-card text-sm font-bold text-text-primary-light placeholder:text-text-muted-light/35 tracking-widest text-center focus:outline-none focus:border-primaryGreen dark:bg-canvas-dark dark:border-border-dark dark:text-text-primary-dark"
                    />
                  </div>
                </div>

                <Button variant="primary" loading={isLoading} type="submit" className="w-full mt-2">
                  Verify & Continue
                </Button>
              </form>

              {/* Mock helper notice */}
              <div className="p-3 bg-canvas-light dark:bg-canvas-dark rounded-card border border-dashed border-border-light dark:border-border-dark text-center text-[10px] font-bold text-text-muted-light leading-relaxed">
                ℹ️ Test Code Notice: Type <span className="text-primaryGreen dark:text-primaryGreen-dark">123456</span> to complete registration and merge guest progress.
              </div>
            </motion.div>
          )}

          {step === "success" && (
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
                Hero Logged In!
              </h2>
              <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed max-w-[200px]">
                Your guest habits have been successfully backed up to your profile. Redirecting to dashboard...
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
