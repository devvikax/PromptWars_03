"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, Search, MessageSquare, Plus, ThumbsUp, ThumbsDown, Award, Trash2, Menu, X } from "lucide-react"
import { useAiCoachStore, ChatMessage, Conversation } from "@/store/ai-coach-store"
import { useMissionStore } from "@/store/mission-store"
import { useToastStore } from "@/store/toast-store"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const {
    chatHistory,
    askCoach,
    coachEmotion,
    conversations,
    activeConversationId,
    loadingConversations,
    generatingMissions,
    suggestedMissions,
    feedbackState,
    loadConversations,
    selectConversation,
    createNewConversation,
    submitMessageFeedback,
    generateCustomMissions,
    triggerStreakRescue,
    triggerProgressReview,
  } = useAiCoachStore()

  const { activeMissions } = useMissionStore()
  const addToast = useToastStore((state) => state.addToast)

  const [inputValue, setInputValue] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  const [newChatTitle, setNewChatTitle] = React.useState("")
  const [isCreatingChat, setIsCreatingChat] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
  
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // Load conversations on mount
  React.useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen, loadConversations])

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

  const handleCreateNewChat = async () => {
    const title = newChatTitle.trim() || `Chat Thread ${new Date().toLocaleDateString()}`
    setNewChatTitle("")
    setIsCreatingChat(false)
    const newId = await createNewConversation(title)
    addToast("New conversation started!", "success")
  }

  const handleAcceptMission = (mission: any) => {
    const isAlreadyActive = activeMissions.some((m) => m.id === mission.id)
    if (isAlreadyActive) {
      addToast("This mission is already active on your dashboard!", "error")
      return
    }

    // Add to active missions
    const missionToAccept = {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      category: mission.category,
      difficulty: mission.difficulty,
      estimatedImpact: mission.estimatedImpact,
      xpReward: mission.xpReward,
      waterReward: mission.waterReward,
    }

    useMissionStore.setState({
      activeMissions: [...activeMissions, missionToAccept]
    })

    addToast(`Mission "${mission.title}" accepted! 🌿`, "success")
  }

  // Filter messages based on search query
  const filteredMessages = chatHistory.filter((msg) =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const suggestionChips = [
    { label: "🩹 Streak Rescue", action: () => triggerStreakRescue() },
    { label: "📊 Weekly Review", action: () => triggerProgressReview("weekly") },
    { label: "🎯 Custom Missions", action: () => generateCustomMissions() },
    { label: "💡 Energy Saving Tips", action: () => handleSend("How can I save energy at home?") },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI Sustainability Coach"
      className="max-w-3xl w-full h-[90vh] md:h-[80vh] flex flex-col justify-between"
    >
      <div className="flex h-full overflow-hidden gap-4 relative">
        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden rounded-2xl"
            />
          )}
        </AnimatePresence>

        {/* Left Side: Conversation Threads List (Sidebar) */}
        <div
          className={`
            absolute inset-y-0 left-0 z-40 w-64 bg-white dark:bg-cardbg-dark border-r border-border-light dark:border-border-dark p-4 flex flex-col gap-3 transition-transform duration-300 ease-in-out md:static md:w-60 md:translate-x-0 md:p-0 md:pr-4 md:z-auto
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex items-center justify-between">
            <h5 className="font-sans font-extrabold text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
              Chats
            </h5>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreatingChat(!isCreatingChat)}
                className="p-1 rounded bg-slate-50 border border-border-light hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-900 transition-colors text-text-primary-light dark:text-text-primary-dark"
                title="New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {/* Mobile Sidebar Close Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-1 rounded bg-slate-50 border border-border-light hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-900 transition-colors text-text-primary-light dark:text-text-primary-dark"
                title="Close sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Create Chat Input Field */}
          {isCreatingChat && (
            <div className="flex flex-col gap-2 p-2.5 bg-slate-50 border border-border-light rounded-2xl dark:bg-slate-900 dark:border-border-dark transition-all">
              <input
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Thread title..."
                className="w-full px-2.5 py-1.5 border border-border-light rounded-xl text-[11px] outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-text-primary-dark"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => setIsCreatingChat(false)}
                  className="px-2.5 py-1 text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewChat}
                  className="px-2.5 py-1 bg-primaryGreen hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Conversations Scroll Panel */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 scrollbar-thin">
            {loadingConversations ? (
              <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark text-center py-4">
                Loading conversations...
              </span>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-[10px] text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                No active chat threads.<br />Click &quot;+&quot; to start.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      selectConversation(conv.id)
                      setIsMobileSidebarOpen(false) // Auto close on select on mobile
                    }}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-primaryGreen/10 text-primaryGreen border border-primaryGreen/20"
                        : "hover:bg-slate-50 text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light border border-transparent dark:hover:bg-slate-850"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1">{conv.title}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Dialog Panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-2 mb-1.5">
            <div className="flex items-center gap-2">
              {/* Menu Toggle for Mobile */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-text-muted-light dark:text-text-muted-dark"
                title="Open Chats"
              >
                <Menu className="w-4 h-4" />
              </button>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] md:text-xs font-extrabold text-text-primary-light dark:text-text-primary-dark tracking-wide">
                Llama Eco-Assistant
              </span>
            </div>

            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="flex items-center bg-slate-50 border border-border-light rounded-full px-2.5 py-1 dark:bg-slate-900 dark:border-slate-800 transition-all">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-24 text-[10px] bg-transparent outline-none text-text-primary-light dark:text-text-primary-dark"
                  />
                  <button onClick={() => { setSearchQuery(""); setShowSearch(false); }}>
                    <X className="w-3 h-3 text-text-muted-light hover:text-text-primary-light" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-text-muted-light dark:text-text-muted-dark"
                  title="Search messages"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto px-1 py-3 flex flex-col gap-4 min-h-0 scrollbar-thin">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted-light dark:text-text-muted-dark">
                <div className="w-12 h-12 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen mb-3 animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h6 className="font-extrabold mb-1">Eco-Mentor</h6>
                <p className="text-[11px] max-w-xs leading-relaxed">
                  {searchQuery ? "No messages matching your search query." : "Ask me how to salvage your streak, generate customized missions, or upgrade your centerpiece garden!"}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const isCoach = msg.sender === "coach"
                const rating = feedbackState[msg.text]

                return (
                  <div
                    key={idx}
                    className={`flex gap-2.5 items-start ${isCoach ? "flex-row" : "flex-row-reverse animate-fade-in"}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs transition-transform duration-200 ${
                      isCoach 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-350"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300"
                    }`}>
                      {isCoach ? "🦙" : "👤"}
                    </div>

                    {/* Bubble Container */}
                    <div className={`flex flex-col max-w-[78%] ${isCoach ? "items-start" : "items-end"}`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm transition-all ${
                          isCoach
                            ? "bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800/80 text-text-primary-light dark:text-text-primary-dark rounded-tl-none text-left"
                            : "bg-gradient-to-br from-primaryGreen to-emerald-600 text-white rounded-tr-none text-left"
                        }`}
                      >
                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                        
                        <div className="flex items-center justify-between mt-1.5 opacity-70">
                          {/* Message Timestamp */}
                          <span className="text-[8px] tracking-wide font-mono">{msg.timestamp}</span>

                          {/* Thumbs Feedback for AI responses */}
                          {isCoach && (
                            <div className="flex items-center gap-1.5 ml-4 shrink-0">
                              <button
                                onClick={() => submitMessageFeedback(msg.text, "up")}
                                disabled={rating === "up"}
                                className={`p-0.5 rounded transition-all hover:bg-slate-200 dark:hover:bg-slate-750 ${
                                  rating === "up" ? "text-emerald-500 scale-110" : "text-text-muted-light dark:text-text-muted-dark"
                                }`}
                                title="Good response"
                              >
                                <ThumbsUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => submitMessageFeedback(msg.text, "down")}
                                disabled={rating === "down"}
                                className={`p-0.5 rounded transition-all hover:bg-slate-200 dark:hover:bg-slate-750 ${
                                  rating === "down" ? "text-red-500 scale-110" : "text-text-muted-light dark:text-text-muted-dark"
                                }`}
                                title="Bad response"
                              >
                                <ThumbsDown className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* Custom Suggested Missions UI Box */}
            {suggestedMissions.length > 0 && !generatingMissions && (
              <div className="my-3.5 flex flex-col gap-3 p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-2xl dark:bg-emerald-950/10 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primaryGreen" />
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wide">
                    Llama Suggested Missions
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {suggestedMissions.map((m) => (
                    <Card key={m.id} className="p-3.5 flex items-center justify-between gap-4 border border-emerald-100/50 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-transform duration-200 hover:scale-[1.005]">
                      <div className="flex-1 flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-text-primary-light dark:text-text-primary-dark">
                            {m.title}
                          </span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            m.difficulty === "easy" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" :
                            m.difficulty === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400" :
                            "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-450"
                          }`}>
                            {m.difficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                          {m.description}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-text-muted-light dark:text-text-muted-dark">
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">🌱 {m.xpReward} XP</span>
                          <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">💧 {m.waterReward} Drop</span>
                          <span className="opacity-80">⚡ Impact: {m.estimatedImpact}</span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={() => handleAcceptMission(m)}
                        className="py-1 px-3 text-[10px] font-bold shrink-0 h-7 rounded-lg"
                      >
                        Accept
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Typing Indicator */}
            {(coachEmotion === "thinking" || generatingMissions) && (
              <div className="flex justify-start items-start gap-2.5 animate-pulse">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-350 shrink-0 shadow-xs">
                  🦙
                </div>
                <div className="bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-text-muted-light/60 dark:bg-text-muted-dark/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-text-muted-light/60 dark:bg-text-muted-dark/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-text-muted-light/60 dark:bg-text-muted-dark/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="py-2.5 flex gap-2 overflow-x-auto shrink-0 scrollbar-none border-t border-border-light dark:border-border-dark">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                disabled={coachEmotion === "thinking" || generatingMissions}
                onClick={chip.action}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-50 border border-border-light hover:bg-slate-100 hover:-translate-y-0.5 text-text-primary-light shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-text-primary-dark dark:hover:bg-slate-900 transition-all duration-200 outline-none focus:ring-1 focus:ring-primaryGreen active:scale-95 shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center shrink-0 pt-2 border-t border-border-light dark:border-border-dark">
            <div className="relative flex-grow flex items-center bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-slate-800 rounded-full px-4 py-1.5 focus-within:border-primaryGreen focus-within:ring-2 focus-within:ring-primaryGreen/10 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={coachEmotion === "thinking" || generatingMissions}
                placeholder="Message your sustainability mentor..."
                className="flex-1 bg-transparent border-0 outline-none text-xs text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark py-1.5"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || coachEmotion === "thinking" || generatingMissions}
                className={`p-2 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  inputValue.trim() && coachEmotion !== "thinking" && !generatingMissions
                    ? "bg-primaryGreen text-white hover:bg-emerald-600 active:scale-90 shadow-sm"
                    : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-650"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}

