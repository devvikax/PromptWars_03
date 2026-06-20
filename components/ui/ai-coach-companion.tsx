"use client"

import * as React from "react"
import { Sparkles, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AiChatModal } from "./ai-chat-modal"

export function AiCoachCompanion() {
  const [isChatOpen, setIsChatOpen] = React.useState(false)

  return (
    <>
      <Card className="group relative p-6 flex flex-col border border-primaryGreen/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg rounded-2xl transition-all duration-300 hover:shadow-primaryGreen/5 hover:translate-y-[-2px] hover:border-primaryGreen/40 text-left overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primaryGreen/10 rounded-full blur-2xl group-hover:bg-primaryGreen/15 transition-all duration-300 pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-primaryGreen/10 dark:bg-emerald-500/10 flex items-center justify-center text-primaryGreen dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-sans font-extrabold text-sm text-text-primary-light dark:text-text-primary-dark">
                AI Sustainability Coach
              </h4>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 uppercase">
                Active
              </span>
            </div>
            <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark">Llama Powered</span>
          </div>
        </div>
        
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-4.5">
          Chat with your personal sustainability mentor to rescue habit streaks, analyze carbon footprint progress, or formulate custom eco-missions.
        </p>

        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 bg-primaryGreen hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl shadow-md shadow-primaryGreen/10 hover:shadow-emerald-600/20 transition-all duration-300"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat with Coach</span>
        </button>
      </Card>

      <AiChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}
