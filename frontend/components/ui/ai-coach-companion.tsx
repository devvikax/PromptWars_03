import * as React from "react"
import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AiCoachCompanion() {
  return (
    <Card className="p-5 flex flex-col border-2 border-border-light dark:border-border-dark shadow-tactile-card select-none text-left">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-text-muted-light" />
        <h4 className="font-sans font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">
          AI Sustainability Coach
        </h4>
        <Badge variant="accent">Offline</Badge>
      </div>
      
      <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-4">
        Our Llama-powered AI Coach companion is currently offline or unconfigured. Real-time sustainability coaching, custom walkability suggestions, and automated carbon insights will be available soon.
      </p>

      <div className="bg-canvas-light dark:bg-slate-900 border border-dashed border-border-light dark:border-border-dark p-4 rounded-card text-center text-xs font-bold text-text-muted-light">
        🎙️ AI Coach Coming Soon in Phase 5
      </div>
    </Card>
  )
}
