"use server"

import { createClient } from "@/lib/supabase/server"

export async function startSpeaking(participantId: string, roomId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("audio_sessions").insert({
    room_id: roomId,
    participant_id: participantId,
    is_speaking: true,
  })

  if (error) {
    console.error("[v0] Failed to start speaking:", error)
    return false
  }

  return true
}

export async function stopSpeaking(participantId: string, roomId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("audio_sessions")
    .update({
      ended_at: new Date().toISOString(),
      is_speaking: false,
    })
    .eq("participant_id", participantId)
    .eq("room_id", roomId)
    .is("ended_at", null)

  if (error) {
    console.error("[v0] Failed to stop speaking:", error)
    return false
  }

  return true
}

export async function getActiveSpeakers(roomId: string): Promise<number[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audio_sessions")
    .select(
      `
      participant:room_participants(participant_number)
    `,
    )
    .eq("room_id", roomId)
    .eq("is_speaking", true)
    .is("ended_at", null)

  if (error) {
    console.error("[v0] Failed to get active speakers:", error)
    return []
  }

  return (data as any[])?.map((item) => item.participant.participant_number) || []
}
