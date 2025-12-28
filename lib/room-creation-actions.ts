"use server"

import { createClient } from "@/lib/supabase/server"

export async function createRoom(data: {
  name: string
  name_fa: string
  description: string
  description_fa: string
  room_type: "text" | "audio"
  capacity: number
}): Promise<{ success: boolean; roomId?: string; error?: string }> {
  const supabase = await createClient()

  // Validate input
  if (!data.name.trim() || !data.name_fa.trim()) {
    return { success: false, error: "Room name is required in both languages" }
  }

  if (!data.description.trim() || !data.description_fa.trim()) {
    return { success: false, error: "Room description is required in both languages" }
  }

  if (data.capacity < 2 || data.capacity > 50) {
    return { success: false, error: "Room capacity must be between 2 and 50" }
  }

  // Create the room
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name: data.name.trim(),
      name_fa: data.name_fa.trim(),
      description: data.description.trim(),
      description_fa: data.description_fa.trim(),
      room_type: data.room_type,
      capacity: data.capacity,
      is_ai_created: false,
    })
    .select()
    .single()

  if (error) {
    console.error("[RoomCreation] Failed to create room:", error)
    return { success: false, error: "Failed to create room. Please try again." }
  }

  return { success: true, roomId: room.id }
}
