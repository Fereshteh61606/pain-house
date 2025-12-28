"use server"

import { createClient } from "@/lib/supabase/server"
import type { TextMessage } from "@/lib/types"

export async function getMessages(roomId: string): Promise<TextMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("text_messages")
    .select(
      `
      *,
      participant:room_participants(participant_number)
    `,
    )
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Failed to fetch messages:", error)
    return []
  }

  return (data as any[]) || []
}

export async function sendMessage(
  roomId: string,
  participantId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  if (!message.trim()) {
    return { success: false, error: "Message cannot be empty" }
  }

  const { error } = await supabase.from("text_messages").insert({
    room_id: roomId,
    participant_id: participantId,
    message: message.trim(),
  })

  if (error) {
    console.error("[v0] Failed to send message:", error)
    return { success: false, error: "Failed to send message" }
  }

  return { success: true }
}
