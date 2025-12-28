"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CircleVisualization } from "@/components/circle-visualization"
import { TextChat } from "@/components/text-chat"
import { AudioChat } from "@/components/audio-chat"
import { CaptchaVerification } from "@/components/captcha-verification"
import { ArrowLeft, MessageCircle, Mic, Users } from "lucide-react"
import { getOrCreateSession } from "@/lib/session-manager"
import { joinRoom, leaveRoom, getRoomParticipants } from "@/lib/room-actions"
import { createClient } from "@/lib/supabase/client"
import type { Room, RoomParticipant, AnonymousSession } from "@/lib/types"

interface RoomClientProps {
  room: Room
  initialParticipants: RoomParticipant[]
}

export function RoomClient({ room, initialParticipants }: RoomClientProps) {
  const router = useRouter()
  const [session, setSession] = useState<AnonymousSession | null>(null)
  const [participants, setParticipants] = useState<RoomParticipant[]>(initialParticipants)
  const [myParticipantNumber, setMyParticipantNumber] = useState<number | null>(null)
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [locale, setLocale] = useState<"en" | "fa">("en")
  const [activeSpeaker, setActiveSpeaker] = useState<number | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [communicationMode, setCommunicationMode] = useState<"text" | "audio">("text")
  const channelRef = useRef<any>(null)
  const lastActivityRef = useRef<Date>(new Date())
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function init() {
      const currentSession = await getOrCreateSession()
      if (currentSession) {
        setSession(currentSession)

        const existing = initialParticipants.find((p) => p.session_id === currentSession.id)
        if (existing) {
          setMyParticipantNumber(existing.participant_number)
          setMyParticipantId(existing.id)
        }
      }
    }
    init()
  }, [initialParticipants])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`room-participants:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_participants",
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          const updated = await getRoomParticipants(room.id)
          setParticipants(updated)

          if (session && payload.eventType === "DELETE" && payload.old.session_id === session.id) {
            setMyParticipantNumber(null)
            setMyParticipantId(null)
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
  }, [room.id, session])

  useEffect(() => {
    if (!myParticipantId) return

    function resetInactivityTimer() {
      lastActivityRef.current = new Date()

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      inactivityTimerRef.current = setTimeout(
        async () => {
          await handleLeaveRoom()
        },
        5 * 60 * 1000,
      )
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer)
    })

    resetInactivityTimer()

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [myParticipantId])

  async function handleJoinRoom() {
    if (!session) return

    if (!session.is_verified) {
      setShowCaptcha(true)
      return
    }

    setIsJoining(true)

    const result = await joinRoom(room.id, session.id)
    if (result.success && result.participantNumber) {
      setMyParticipantNumber(result.participantNumber)
      const updated = await getRoomParticipants(room.id)
      setParticipants(updated)

      const myParticipant = updated.find((p) => p.session_id === session.id)
      if (myParticipant) {
        setMyParticipantId(myParticipant.id)
      }
    }

    setIsJoining(false)
  }

  async function handleCaptchaVerified() {
    if (!session) return

    const supabase = createClient()
    await supabase.from("anonymous_sessions").update({ is_verified: true }).eq("id", session.id)

    setSession({ ...session, is_verified: true })
    setShowCaptcha(false)

    handleJoinRoom()
  }

  async function handleLeaveRoom() {
    if (!session) return
    const success = await leaveRoom(room.id, session.id)
    if (success) {
      setMyParticipantNumber(null)
      setMyParticipantId(null)
      const updated = await getRoomParticipants(room.id)
      setParticipants(updated)
    }
  }

  const isInRoom = myParticipantNumber !== null

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {showCaptcha && <CaptchaVerification onVerified={handleCaptchaVerified} locale={locale} />}

      {/* Compact Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {locale === "en" ? "Back" : "بازگشت"}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {locale === "en" ? room.name : room.name_fa}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {participants.length}/{room.capacity} {locale === "en" ? "present" : "حاضر"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isInRoom && (
              <div className="flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  #{myParticipantNumber}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocale(locale === "en" ? "fa" : "en")}
            >
              {locale === "en" ? "فارسی" : "English"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 overflow-hidden">
        {!isInRoom ? (
          /* Join Screen */
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {locale === "en" ? "Join the Circle" : "به دایره بپیوندید"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {locale === "en" ? room.description : room.description_fa}
                </p>
              </div>
              <Button
                onClick={handleJoinRoom}
                disabled={isJoining || participants.length >= room.capacity}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
              >
                {isJoining
                  ? locale === "en"
                    ? "Joining..."
                    : "در حال پیوستن..."
                  : locale === "en"
                    ? "Join Circle"
                    : "پیوستن به دایره"}
              </Button>
              {participants.length >= room.capacity && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {locale === "en" ? "Room is full" : "اتاق پر است"}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* In Room - Split View */
          <div className="h-full flex">
            {/* LEFT: Circle Visualization */}
            <div className="w-[45%] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-[500px]">
                  <CircleVisualization
                    participants={participants}
                    capacity={room.capacity}
                    activeParticipant={activeSpeaker}
                    locale={locale}
                  />
                </div>
              </div>
              
              {/* Mode Switcher & Leave Button */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCommunicationMode("text")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      communicationMode === "text"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {locale === "en" ? "Text" : "متن"}
                  </button>
                  <button
                    onClick={() => setCommunicationMode("audio")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      communicationMode === "audio"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {locale === "en" ? "Voice" : "صدا"}
                  </button>
                </div>
                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {locale === "en" ? "Leave Circle" : "ترک دایره"}
                </Button>
              </div>
            </div>

            {/* RIGHT: Chat Area */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col">
              {communicationMode === "text" && myParticipantId && session ? (
                <TextChat
                  roomId={room.id}
                  participantId={myParticipantId}
                  myParticipantNumber={myParticipantNumber}
                  sessionId={session.id}
                  roomName={room.name}
                  locale={locale}
                  onSpeakerChange={setActiveSpeaker}
                />
              ) : communicationMode === "audio" && myParticipantId ? (
                <AudioChat
                  roomId={room.id}
                  participantId={myParticipantId}
                  myParticipantNumber={myParticipantNumber}
                  participants={participants}
                  onSpeakerChange={setActiveSpeaker}
                  locale={locale}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
