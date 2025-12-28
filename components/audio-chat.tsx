"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {locale === "en" ? "Audio Room" : "اتاق صوتی"}
        </CardTitle>
        <CardDescription>
          {locale === "en"
            ? "Click the microphone to speak. Only one person can speak at a time."
            : "برای صحبت کردن روی میکروفون کلیک کنید. فقط یک نفر می تواند در یک زمان صحبت کند."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Microphone permission */}
        {micPermission === "denied" && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {locale === "en"
              ? "Microphone access denied. Please enable microphone permissions in your browser settings."
              : "دسترسی به میکروفون رد شد. لطفاً مجوزهای میکروفون را در تنظیمات مرورگر خود فعال کنید."}
          </div>
        )}

        {/* Microphone control */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant={isSpeaking ? "destructive" : "default"}
            className="h-20 w-20 rounded-full"
            onClick={toggleSpeaking}
            disabled={activeSpeakers.length > 0 && !isSpeaking}
          >
            {isSpeaking ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
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
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {locale === "en" ? "Currently speaking:" : "در حال حاضر صحبت می کنند:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {otherSpeakers.map((speakerNum) => (
                <Badge key={speakerNum} variant="secondary" className="animate-pulse">
                  {locale === "en" ? `#${speakerNum}` : `${speakerNum}#`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <p className="text-sm font-medium">{locale === "en" ? "Audio Guidelines:" : "دستورالعمل های صوتی:"}</p>
          <ul className="text-xs text-muted-foreground space-y-1" dir={locale === "fa" ? "rtl" : "ltr"}>
            <li>{locale === "en" ? "• Speak one at a time for clarity" : "• برای وضوح یک نفر در یک زمان صحبت کنید"}</li>
            <li>
              {locale === "en"
                ? "• Be respectful and supportive of others"
                : "• نسبت به دیگران محترم و حمایت کننده باشید"}
            </li>
            <li>{locale === "en" ? "• Your voice is anonymous" : "• صدای شما ناشناس است"}</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground text-center text-pretty">
          {locale === "en"
            ? "Audio is not recorded. This is a live, anonymous conversation."
            : "صدا ضبط نمی شود. این یک مکالمه زنده و ناشناس است."}
        </p>
      </CardContent>
    </Card>
  )
}
