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
      <Card className="p-5 flex flex-col border-2 border-border-light dark:border-border-dark shadow-tactile-card text-left">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primaryGreen" />
          <h4 className="font-sans font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">
            AI Sustainability Coach
          </h4>
          <Badge variant="primary">Active</Badge>
        </div>
        
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-4">
          Chat with your Llama-powered sustainability mentor to rescue streaks, review weekly carbon logs, or generate personalized eco-missions!
        </p>

        <Button
          variant="primary"
          onClick={() => setIsChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat with Coach</span>
        </Button>
      </Card>

      <AiChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}
