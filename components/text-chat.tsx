"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Reply, X, Bell, BellOff } from "lucide-react"
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
  reply_to?: {
    id: string
    message: string
    participant: { participant_number: number }
  } | null
}

// Consistent color palette for participants
const PARTICIPANT_COLORS = [
  { bg: "bg-blue-500", text: "text-white", bubble: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/30" },
  { bg: "bg-purple-500", text: "text-white", bubble: "bg-purple-500", light: "bg-purple-100 dark:bg-purple-900/30" },
  { bg: "bg-pink-500", text: "text-white", bubble: "bg-pink-500", light: "bg-pink-100 dark:bg-pink-900/30" },
  { bg: "bg-rose-500", text: "text-white", bubble: "bg-rose-500", light: "bg-rose-100 dark:bg-rose-900/30" },
  { bg: "bg-orange-500", text: "text-white", bubble: "bg-orange-500", light: "bg-orange-100 dark:bg-orange-900/30" },
  { bg: "bg-amber-500", text: "text-white", bubble: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-900/30" },
  { bg: "bg-lime-500", text: "text-white", bubble: "bg-lime-500", light: "bg-lime-100 dark:bg-lime-900/30" },
  { bg: "bg-emerald-500", text: "text-white", bubble: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/30" },
  { bg: "bg-cyan-500", text: "text-white", bubble: "bg-cyan-500", light: "bg-cyan-100 dark:bg-cyan-900/30" },
  { bg: "bg-indigo-500", text: "text-white", bubble: "bg-indigo-500", light: "bg-indigo-100 dark:bg-indigo-900/30" },
]

function getParticipantColor(participantNumber: number) {
  return PARTICIPANT_COLORS[(participantNumber - 1) % PARTICIPANT_COLORS.length]
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
  const [replyingTo, setReplyingTo] = useState<MessageWithParticipant | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const scrollRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  async function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === "granted") {
        setNotificationsEnabled(true)
        // Update session preference
        const supabase = createClient()
        await supabase
          .from("anonymous_sessions")
          .update({ notifications_enabled: true })
          .eq("id", sessionId)
      }
    } else if (Notification.permission === "granted") {
      setNotificationsEnabled(!notificationsEnabled)
      // Update session preference
      const supabase = createClient()
      await supabase
        .from("anonymous_sessions")
        .update({ notifications_enabled: !notificationsEnabled })
        .eq("id", sessionId)
    }
  }

  function showNotification(message: MessageWithParticipant) {
    if (!notificationsEnabled || Notification.permission !== "granted") return
    if (message.participant.participant_number === myParticipantNumber) return

    const isReply = message.reply_to_message_id
    const title = isReply
      ? locale === "en"
        ? `Participant #${message.participant.participant_number} replied to you`
        : `شرکت کننده ${message.participant.participant_number} به شما پاسخ داد`
      : locale === "en"
        ? `New message in ${roomName}`
        : `پیام جدید در ${roomName}`

    new Notification(title, {
      body: message.message.slice(0, 100),
      icon: "/icon-192.png",
      tag: message.id,
    })
  }

  useEffect(() => {
    async function loadMessages() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("text_messages")
        .select(
          `
          *,
          participant:room_participants!text_messages_participant_id_fkey(participant_number),
          reply_to:text_messages!text_messages_reply_to_message_id_fkey(
            id,
            message,
            participant:room_participants!text_messages_participant_id_fkey(participant_number)
          )
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setMessages(data as any)
      }
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
              participant:room_participants!text_messages_participant_id_fkey(participant_number),
              reply_to:text_messages!text_messages_reply_to_message_id_fkey(
                id,
                message,
                participant:room_participants!text_messages_participant_id_fkey(participant_number)
              )
            `
            )
            .eq("id", payload.new.id)
            .single()

          if (error) return

          if (data) {
            const newMsg = data as any as MessageWithParticipant
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            // Show notification
            showNotification(newMsg)

            const participantNum = newMsg.participant?.participant_number
            if (participantNum && onSpeakerChange) {
              onSpeakerChange(participantNum)
              setTimeout(() => onSpeakerChange(null), 2500)
            }
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [roomId, onSpeakerChange, notificationsEnabled, myParticipantNumber, roomName, locale])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || isSending) return

    const messageToSend = newMessage.trim()
    setIsSending(true)

    const result = await sendMessage(roomId, participantId, messageToSend, replyingTo?.id)

    if (result.success) {
      setNewMessage("")
      setReplyingTo(null)
    } else {
      alert(
        locale === "en"
          ? "Failed to send message. Please try again."
          : "ارسال پیام ناموفق بود. لطفا دوباره تلاش کنید."
      )
    }

    setIsSending(false)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      setReplyingTo(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area - Takes full space */}
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
              const color = getParticipantColor(msg.participant.participant_number)

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200 group`}
                >
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 px-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${color.bg} ${color.text}`}
                      >
                        {msg.participant.participant_number}
                      </div>
                      {isMe && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {locale === "en" ? "You" : "شما"}
                        </span>
                      )}
                      {!isMe && (
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          title={locale === "en" ? "Reply" : "پاسخ"}
                        >
                          <Reply className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? `${color.bubble} text-white rounded-tr-sm`
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                      } text-sm leading-relaxed`}
                    >
                      {/* Reply preview */}
                      {msg.reply_to && (
                        <div
                          className={`mb-2 pb-2 border-l-2 pl-2 text-xs opacity-70 ${
                            isMe ? "border-white/50" : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          <div className="font-semibold mb-0.5">
                            {locale === "en" ? "Replying to" : "پاسخ به"} #{msg.reply_to.participant.participant_number}
                          </div>
                          <div className="line-clamp-2">{msg.reply_to.message}</div>
                        </div>
                      )}
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

      {/* AI Insights Button */}
      <AIInsights messages={messages} sessionId={sessionId} roomId={roomId} roomName={roomName} locale={locale} />

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="flex-shrink-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Reply className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {locale === "en" ? "Replying to" : "پاسخ به"} #{replyingTo.participant.participant_number}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 truncate">{replyingTo.message}</div>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 items-center max-w-4xl mx-auto">
          <Button
            onClick={requestNotificationPermission}
            variant="outline"
            size="lg"
            className="h-12 px-3 flex-shrink-0"
            title={locale === "en" ? "Toggle notifications" : "تغییر وضعیت اعلان ها"}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-teal-600" />
            ) : (
              <BellOff className="h-5 w-5 text-slate-400" />
            )}
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              replyingTo
                ? locale === "en"
                  ? "Type your reply..."
                  : "پاسخ خود را بنویسید..."
                : locale === "en"
                  ? "Type your message..."
                  : "پیام خود را بنویسید..."
            }
            disabled={isSending}
            className="h-12 text-base rounded-lg border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500"
            dir={locale === "fa" ? "rtl" : "ltr"}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            size="lg"
            className="h-12 px-6 rounded-lg bg-teal-600 hover:bg-teal-700 flex-shrink-0"
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
