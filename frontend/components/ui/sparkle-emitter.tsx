"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: string
  emoji: string
  x: number
  y: number
  scale: number
  rotate: number
  delay: number
}

interface SparkleEmitterProps {
  trigger: boolean | number // Trigger a burst whenever this changes
  count?: number
}

const EMOJIS = ["✨", "⭐", "🌱", "💧", "🎉", "🔥"]

export function SparkleEmitter({ trigger, count = 12 }: SparkleEmitterProps) {
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    if (!trigger) return

    // Generate a new burst of particles
    const newParticles: Particle[] = Array.from({ length: count }).map((_, index) => {
      const angle = (index / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5
      const distance = 100 + Math.random() * 80
      
      return {
        id: `${trigger}-${index}-${Math.random()}`,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0.6 + Math.random() * 0.8,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.15,
      }
    })

    setParticles(newParticles)

    // Clear particles after animation completes
    const timer = setTimeout(() => {
      setParticles([])
    }, 1800)

    return () => clearTimeout(timer)
  }, [trigger, count])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: p.scale,
              x: p.x,
              y: p.y,
              rotate: p.rotate + 180,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
              delay: p.delay,
            }}
            className="absolute text-2xl select-none filter drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)]"
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
