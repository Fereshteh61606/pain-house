"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { getMessages, sendMessage } from "@/lib/chat-actions"
import { createClient } from "@/lib/supabase/client"
import { AIInsights } from "@/components/ai-insights"
import type { TextMessage } from "@/lib/types"

interface TextChatProps {
  roomId: string
  participantId: string
  myParticipantNumber: number
  sessionId: string
  roomName: string
  locale: "en" | "fa"
  onSpeakerChange?: (speakerNumber: number | null) => void
}

interface MessageWithParticipant extends TextMessage {
  participant: { participant_number: number }
}

export function TextChat({
  roomId,
  participantId,
  myParticipantNumber,
  sessionId,
  roomName,
  locale,
  onSpeakerChange,
}: TextChatProps) {
  const [messages, setMessages] = useState<MessageWithParticipant[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    async function loadMessages() {
      const msgs = await getMessages(roomId)
      setMessages(msgs as MessageWithParticipant[])
    }
    loadMessages()
  }, [roomId])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`text-messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "text_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("text_messages")
            .select(
              `
              *,
              participant:room_participants(participant_number)
            `,
            )
            .eq("id", payload.new.id)
            .single()

          if (error) return

          if (data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev
              return [...prev, data as MessageWithParticipant]
            })

            const participantNum = (data as any).participant?.participant_number
            if (participantNum && onSpeakerChange) {
              onSpeakerChange(participantNum)
              setTimeout(() => onSpeakerChange(null), 2500)
            }
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [roomId, onSpeakerChange])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || isSending) return

    const messageToSend = newMessage.trim()
    setIsSending(true)
    
    const result = await sendMessage(roomId, participantId, messageToSend)

    if (result.success) {
      setNewMessage("")
    } else {
      alert(
        locale === "en" ? "Failed to send message. Please try again." : "ارسال پیام ناموفق بود. لطفا دوباره تلاش کنید.",
      )
    }

    setIsSending(false)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* AI Insights - Collapsible at top */}
      <div className="flex-shrink-0">
        <AIInsights messages={messages} sessionId={sessionId} roomId={roomId} roomName={roomName} locale={locale} />
      </div>

      {/* Messages Area - Takes remaining space */}
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="space-y-3 pr-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-20">
                <div className="text-6xl">💭</div>
                <p className="text-slate-600 dark:text-slate-400 text-base max-w-sm leading-relaxed">
                  {locale === "en"
                    ? "Start the conversation. Share your thoughts. Others are here to listen."
                    : "گفتگو را شروع کنید. افکار خود را به اشتراک بگذارید. دیگران اینجا هستند تا گوش کنند."}
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.participant.participant_number === myParticipantNumber

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 px-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isMe
                            ? "bg-teal-600 text-white"
                            : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {msg.participant.participant_number}
                      </div>
                      {isMe && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {locale === "en" ? "You" : "شما"}
                        </span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? "bg-teal-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                      } text-sm leading-relaxed`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500 px-1">
                      {new Date(msg.created_at).toLocaleTimeString(locale === "en" ? "en-US" : "fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 items-center max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={locale === "en" ? "Type your message..." : "پیام خود را بنویسید..."}
            disabled={isSending}
            className="h-12 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
            dir={locale === "fa" ? "rtl" : "ltr"}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            size="lg"
            className="h-12 px-6 rounded-lg bg-teal-600 hover:bg-teal-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-slate-500 dark:text-slate-500 mt-2">
          {locale === "en"
            ? "🔒 Anonymous • Only your number is visible"
            : "🔒 ناشناس • فقط شماره شما قابل مشاهده است"}
        </p>
      </div>
    </div>
  )
}
