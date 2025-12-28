"use server"

import { createClient } from "@/lib/supabase/server"
import type { Room, RoomParticipant } from "@/lib/types"

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to fetch rooms:", error)
    return []
  }

  return (data as Room[]) || []
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("rooms").select("*").eq("id", roomId).single()

  if (error) {
    console.error("[v0] Failed to fetch room:", error)
    return null
  }

  return data as Room
}

export async function getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", roomId)
    .eq("is_active", true)
    .order("participant_number", { ascending: true })

  if (error) {
    console.error("[v0] Failed to fetch participants:", error)
    return []
  }

  return (data as RoomParticipant[]) || []
}

export async function joinRoom(
  roomId: string,
  sessionId: string,
): Promise<{ success: boolean; participantNumber?: number; error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", roomId)
    .eq("session_id", sessionId)
    .eq("is_active", true)
    .maybeSingle()

  if (existing) {
    return { success: true, participantNumber: existing.participant_number }
  }

  // Get room capacity and current participants
  const { data: room } = await supabase.from("rooms").select("capacity").eq("id", roomId).single()

  if (!room) {
    return { success: false, error: "Room not found" }
  }

  const { data: participants } = await supabase
    .from("room_participants")
    .select("participant_number")
    .eq("room_id", roomId)
    .eq("is_active", true)

  if (participants && participants.length >= room.capacity) {
    return { success: false, error: "Room is full" }
  }

  // Find available participant number
  const usedNumbers = new Set(participants?.map((p) => p.participant_number) || [])
  let participantNumber = 1
  while (usedNumbers.has(participantNumber) && participantNumber <= room.capacity) {
    participantNumber++
  }

  // Join room
  const { error } = await supabase.from("room_participants").insert({
    room_id: roomId,
    session_id: sessionId,
    participant_number: participantNumber,
  })

  if (error) {
    console.error("[v0] Failed to join room:", error)
    return { success: false, error: "Failed to join room" }
  }

  return { success: true, participantNumber }
}

export async function leaveRoom(roomId: string, sessionId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from("room_participants").delete().eq("room_id", roomId).eq("session_id", sessionId)

  if (error) {
    console.error("[v0] Failed to leave room:", error)
    return false
  }

  return true
}
