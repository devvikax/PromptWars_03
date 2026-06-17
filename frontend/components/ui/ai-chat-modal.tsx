"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Send, CornerDownLeft, Sparkles } from "lucide-react"
import { useAiCoachStore } from "@/store/ai-coach-store"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const { chatHistory, askCoach, coachEmotion } = useAiCoachStore()
  const [inputValue, setInputValue] = React.useState("")
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  const suggestedQuestions = [
    "Why is my ecosystem growing slowly?",
    "How can I save electricity at home?",
    "What mission should I do today?",
    "How can I improve my streak?",
  ]

  // Auto-scroll to the bottom of the chat list
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, coachEmotion])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    setInputValue("")
    await askCoach(text)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(inputValue)
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI Sustainability Coach"
      className="max-w-lg h-[80vh] flex flex-col justify-between"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto px-1 py-4 flex flex-col gap-3 min-h-0 border-b border-border-light dark:border-border-dark">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted-light dark:text-text-muted-dark">
              <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h5 className="font-extrabold mb-1">Your Green Guide</h5>
              <p className="text-xs max-w-xs leading-relaxed">
                Hi! I am your AI Coach. Ask me any questions about saving energy, reducing carbon, or optimizing your ecosystem growth!
              </p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => {
              const isCoach = msg.sender === "coach"
              return (
                <div
                  key={idx}
                  className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isCoach
                        ? "bg-slate-100 text-text-primary-light rounded-tl-none dark:bg-slate-800 dark:text-text-primary-dark"
                        : "bg-primaryGreen text-white rounded-tr-none dark:bg-emerald-600"
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 opacity-70 ${
                        isCoach ? "text-text-muted-light dark:text-text-muted-dark" : "text-emerald-100"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              )
            })
          )}

          {/* Typing Indicator */}
          {coachEmotion === "thinking" && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 dark:bg-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-text-muted-light rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-text-muted-light rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-text-muted-light rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="py-3 flex flex-wrap gap-2 flex-shrink-0">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={coachEmotion === "thinking"}
              onClick={() => handleSend(q)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-50 border border-border-light hover:bg-slate-100 text-text-primary-light dark:bg-cardbg-dark dark:border-border-dark dark:text-text-primary-dark dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primaryGreen"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center flex-shrink-0 pt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={coachEmotion === "thinking"}
            placeholder="Ask your coach a question..."
            className="flex-1 px-4 py-3 border-2 border-border-light rounded-button text-xs outline-none focus:border-primaryGreen dark:bg-slate-900 dark:border-slate-850 dark:text-text-primary-dark dark:focus:border-primaryGreen-dark"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || coachEmotion === "thinking"}
            className="h-10 w-10 p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Dialog>
  )
}
