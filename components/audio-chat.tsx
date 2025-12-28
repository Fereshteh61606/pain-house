"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { startSpeaking, stopSpeaking, getActiveSpeakers } from "@/lib/audio-actions"
import { createClient } from "@/lib/supabase/client"

interface AudioChatProps {
  roomId: string
  participantId: string
  myParticipantNumber: number
  participants: Array<{ participant_number: number }>
  onSpeakerChange: (speakerNumber: number | null) => void
  locale: "en" | "fa"
}

export function AudioChat({
  roomId,
  participantId,
  myParticipantNumber,
  participants,
  onSpeakerChange,
  locale,
}: AudioChatProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeSpeakers, setActiveSpeakers] = useState<number[]>([])
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    async function loadActiveSpeakers() {
      const speakers = await getActiveSpeakers(roomId)
      setActiveSpeakers(speakers)
      if (speakers.length > 0) {
        onSpeakerChange(speakers[0])
      }
    }
    loadActiveSpeakers()
  }, [roomId, onSpeakerChange])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`audio:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audio_sessions", filter: `room_id=eq.${roomId}` },
        async () => {
          const speakers = await getActiveSpeakers(roomId)
          setActiveSpeakers(speakers)
          if (speakers.length > 0) {
            onSpeakerChange(speakers[0])
          } else {
            onSpeakerChange(null)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      stopAudio()
    }
  }, [roomId, onSpeakerChange])

  async function requestMicPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setMicPermission("granted")

      // Setup audio context for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      return true
    } catch (error) {
      console.error("[v0] Microphone permission denied:", error)
      setMicPermission("denied")
      return false
    }
  }

  function stopAudio() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  async function toggleSpeaking() {
    if (!isSpeaking) {
      // Start speaking
      if (micPermission !== "granted") {
        const granted = await requestMicPermission()
        if (!granted) return
      }

      const success = await startSpeaking(participantId, roomId)
      if (success) {
        setIsSpeaking(true)
      }
    } else {
      // Stop speaking
      const success = await stopSpeaking(participantId, roomId)
      if (success) {
        setIsSpeaking(false)
      }
    }
  }

  const otherSpeakers = activeSpeakers.filter((num) => num !== myParticipantNumber)

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-1 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <Volume2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            {locale === "en" ? "Audio Room" : "اتاق صوتی"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {locale === "en"
              ? "Tap the microphone to speak"
              : "برای صحبت روی میکروفون ضربه بزنید"}
          </p>
        </div>

        {/* Microphone permission */}
        {micPermission === "denied" && (
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm text-center">
            {locale === "en"
              ? "Microphone access denied. Please enable microphone permissions in your browser settings."
              : "دسترسی به میکروفون رد شد. لطفاً مجوزهای میکروفون را در تنظیمات مرورگر خود فعال کنید."}
          </div>
        )}

        {/* Microphone control */}
        <div className="flex flex-col items-center gap-4 flex-1 justify-center">
          <Button
            size="lg"
            variant={isSpeaking ? "destructive" : "default"}
            className="h-24 w-24 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={toggleSpeaking}
            disabled={activeSpeakers.length > 0 && !isSpeaking}
          >
            {isSpeaking ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </Button>

          <div className="text-center">
            {isSpeaking ? (
              <Badge variant="destructive" className="text-sm">
                {locale === "en" ? "You are speaking" : "شما در حال صحبت هستید"}
              </Badge>
            ) : activeSpeakers.includes(myParticipantNumber) ? (
              <Badge variant="default" className="text-sm">
                {locale === "en" ? "You are speaking" : "شما در حال صحبت هستید"}
              </Badge>
            ) : activeSpeakers.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {locale === "en"
                  ? `Participant #${activeSpeakers[0]} is speaking`
                  : `شرکت کننده ${activeSpeakers[0]} در حال صحبت است`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {locale === "en" ? "No one is speaking" : "هیچ کس صحبت نمی کند"}
              </p>
            )}
          </div>
        </div>

        {/* Active speakers list */}
        {otherSpeakers.length > 0 && (
          <div className="space-y-2 flex-shrink-0">
            <p className="text-sm font-medium text-center text-slate-700 dark:text-slate-300">
              {locale === "en" ? "Currently speaking:" : "در حال حاضر صحبت می کنند:"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {otherSpeakers.map((speakerNum) => (
                <Badge key={speakerNum} variant="secondary" className="animate-pulse text-base px-3 py-1">
                  {locale === "en" ? `#${speakerNum}` : `${speakerNum}#`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2 flex-shrink-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {locale === "en" ? "Audio Guidelines:" : "دستورالعمل های صوتی:"}
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1" dir={locale === "fa" ? "rtl" : "ltr"}>
            <li>{locale === "en" ? "• Speak one at a time for clarity" : "• برای وضوح یک نفر در یک زمان صحبت کنید"}</li>
            <li>
              {locale === "en"
                ? "• Be respectful and supportive of others"
                : "• نسبت به دیگران محترم و حمایت کننده باشید"}
            </li>
            <li>{locale === "en" ? "• Your voice is anonymous" : "• صدای شما ناشناس است"}</li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500 text-center text-pretty">
          {locale === "en"
            ? "🔒 Audio is not recorded. This is a live, anonymous conversation."
            : "🔒 صدا ضبط نمی شود. این یک مکالمه زنده و ناشناس است."}
        </p>
    </div>
  )
}
