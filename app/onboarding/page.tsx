"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronRight, Sparkles, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useProfileStore } from "@/store/profile-store"
import { useMissionStore } from "@/store/mission-store"
import { useGameStore } from "@/store/game-store"
import { useToastStore } from "@/store/toast-store"

interface OnboardingQuestion {
  id: "travelType" | "acUsage" | "foodType"
  question: string
  description: string
  options: { value: string; label: string; emoji: string }[]
}

const QUESTIONS: OnboardingQuestion[] = [
  {
    id: "travelType",
    question: "How do you usually travel?",
    description: "Your daily commute is the biggest direct source of personal emissions.",
    options: [
      { value: "car", label: "Car", emoji: "🚗" },
      { value: "motorbike", label: "Motorbike", emoji: "🏍️" },
      { value: "bus", label: "Bus", emoji: "🚌" },
      { value: "metro", label: "Metro", emoji: "🚇" },
      { value: "cycle", label: "Cycle", emoji: "🚲" },
      { value: "walk", label: "Walk", emoji: "🚶" },
    ],
  },
  {
    id: "acUsage",
    question: "Do you use Air Conditioning?",
    description: "Cooling uses significant electrical power. Let's map your AC choices.",
    options: [
      { value: "often", label: "Often", emoji: "😊" },
      { value: "sometimes", label: "Sometimes", emoji: "😐" },
      { value: "rarely", label: "Rarely", emoji: "🙅" },
    ],
  },
  {
    id: "foodType",
    question: "Food Preference?",
    description: "Diets high in red meats have a high agricultural footprint.",
    options: [
      { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
      { value: "mixed", label: "Mixed", emoji: "🍗" },
      { value: "vegan", label: "Vegan", emoji: "🌱" },
    ],
  },
]

import { useAuth } from "@/hooks/use-auth"
import { saveOnboardingProfileDb, saveOnboardingFirstMissionDb } from "@/services/db-onboarding"

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const setPreferences = useProfileStore((state) => state.setPreferences)
  const generateFirstMission = useMissionStore((state) => state.generateFirstMission)
  const addXp = useGameStore((state) => state.addXp)
  const addToast = useToastStore((state) => state.addToast)

  const [activeStep, setActiveStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [xpAnimationValue, setXpAnimationValue] = React.useState(0)

  const isCelebrationStep = activeStep === QUESTIONS.length
  const currentQuestion = QUESTIONS[activeStep]

  const handleSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
  }

  const handleNext = () => {
    if (activeStep < QUESTIONS.length - 1) {
      setActiveStep((prev) => prev + 1)
    } else {
      // Complete answers: save preferences and generate mission
      const finalAnswers = {
        travelType: answers.travelType || "walk",
        acUsage: answers.acUsage || "sometimes",
        foodType: answers.foodType || "vegetarian",
      }
      
      setPreferences(finalAnswers)
      const firstMission = generateFirstMission(finalAnswers)

      // Sync onboarding preferences to Supabase if user is logged in
      if (user?.id) {
        saveOnboardingProfileDb(user.id, finalAnswers)
        saveOnboardingFirstMissionDb(user.id, firstMission)
      }
      
      // Navigate to celebration step
      setActiveStep(QUESTIONS.length)

      // Trigger XP bar filling animation (+50 XP) after a short delay
      setTimeout(() => {
        setXpAnimationValue(50)
        addXp(50) // Commit XP to game store
        addToast("Welcome Reward Unlocked! +50 XP", "success")
      }, 600)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    if (typeof document !== "undefined") {
      document.cookie = "green-hero-onboarded=true; path=/; max-age=31536000; SameSite=Lax"
    }
    router.push("/dashboard")
  }

  const activeValue = answers[currentQuestion?.id]

  // Spring transition presets
  const slideVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
    exit: { opacity: 0, x: -80, transition: { duration: 0.15 } },
  }

  return (
    <div className="flex flex-col min-h-screen justify-between p-6 bg-canvas-light dark:bg-canvas-dark text-text-primary-light dark:text-text-primary-dark max-w-lg mx-auto">
      {/* Header back button */}
      <header className="flex justify-between items-center w-full py-4 min-h-[48px]">
        {activeStep > 0 && !isCelebrationStep ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm font-bold text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen rounded-button"
            aria-label="Back to previous question"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div className="w-10" />
        )}

        {!isCelebrationStep && (
          <span className="text-xs font-sans font-extrabold text-text-muted-light dark:text-text-muted-dark">
            Question {activeStep + 1} of {QUESTIONS.length}
          </span>
        )}
      </header>

      {/* Main Flow */}
      <div className="flex-grow flex flex-col justify-center my-4">
        <AnimatePresence mode="wait">
          {!isCelebrationStep ? (
            <motion.div
              key={activeStep}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {/* Question Text */}
              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primaryGreen dark:text-primaryGreen-dark">
                  Eco Survey
                </span>
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl leading-tight">
                  {currentQuestion.question}
                </h2>
                <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark">
                  {currentQuestion.description}
                </p>
              </div>

              {/* Options lists */}
              <div
                className="flex flex-col gap-3"
                role="radiogroup"
                aria-label={currentQuestion.question}
              >
                {currentQuestion.options.map((opt) => {
                  const isSelected = activeValue === opt.value
                  return (
                    <Card
                      key={opt.value}
                      hoverable
                      selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className="flex items-center gap-4 p-4 font-sans select-none cursor-pointer border-2"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault()
                          handleSelect(opt.value)
                        }
                      }}
                    >
                      <span className="text-3xl filter drop-shadow-sm select-none" role="img" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <span className="font-extrabold text-sm text-text-primary-light dark:text-text-primary-dark">
                        {opt.label}
                      </span>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            // Step 4: Celebration welcome screen
            <motion.div
              key="celebration-step"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center text-center gap-8 py-6"
            >
              {/* Animated Floating Sparks particles */}
              <div className="relative flex items-center justify-center">
                {/* Floating Stars */}
                <motion.span
                  className="absolute text-2xl top-[-20px] left-[-20px]"
                  animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                >
                  ⭐
                </motion.span>
                <motion.span
                  className="absolute text-xl bottom-[-10px] right-[-30px]"
                  animate={{ y: [-5, -25], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.6 }}
                >
                  ✨
                </motion.span>

                {/* Tree Seed emerging 🌱 */}
                <motion.div
                  className="w-28 h-28 rounded-full bg-[#D1FAE5] border-4 border-primaryGreen flex items-center justify-center shadow-tactile-green select-none"
                  animate={{
                    scaleY: [1, 0.85, 1.15, 0.95, 1],
                    scaleX: [1, 1.1, 0.9, 1.05, 1],
                  }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <Leaf className="w-14 h-14 text-primaryGreen animate-pulse" />
                </motion.div>
              </div>

              {/* Celebration Headline */}
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rewardGold/10 border-2 border-rewardGold text-rewardGold rounded-button text-xs font-bold uppercase tracking-wider mx-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Green Journey Begins</span>
                </div>
                <h2 className="font-sans font-extrabold text-3xl mt-2">
                  Tree Seed Planted! 🌱
                </h2>
                <p className="font-sans text-xs text-text-muted-light dark:text-text-muted-dark max-w-xs leading-relaxed">
                  Congratulations! A tiny seed has been planted in your playground. Log daily habits to water it and grow your seedling!
                </p>
              </div>

              {/* Progress welcome XP animation */}
              <div className="w-full max-w-sm flex flex-col gap-2 bg-white border-2 border-border-light rounded-card p-4 shadow-tactile-card dark:bg-cardbg-dark dark:border-border-dark dark:shadow-none">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted-light dark:text-text-muted-dark">
                  <span>Level 1: Seedling</span>
                  <span className="font-extrabold text-primaryGreen dark:text-primaryGreen-dark">
                    +{xpAnimationValue} Welcome XP
                  </span>
                </div>
                <Progress value={xpAnimationValue} max={100} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <footer className="py-4">
        {!isCelebrationStep ? (
          <Button
            variant="primary"
            disabled={!activeValue}
            onClick={handleNext}
            className="w-full"
            aria-label={activeStep === QUESTIONS.length - 1 ? "Complete onboarding survey" : "Continue to next question"}
          >
            <span className="flex items-center gap-1">
              {activeStep === QUESTIONS.length - 1 ? "Plant My Seed 🌱" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        ) : (
          <Button variant="primary" onClick={handleFinish} className="w-full">
            Start Green Journey
          </Button>
        )}
      </footer>
    </div>
  )
}
