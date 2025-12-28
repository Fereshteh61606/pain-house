export interface Room {
  id: string
  name: string
  name_fa: string
  description: string | null
  description_fa: string | null
  room_type: "text" | "audio"
  capacity: number
  is_ai_created: boolean
  created_at: string
  updated_at: string
}

export interface AnonymousSession {
  id: string
  session_code: string
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null
  created_at: string
  last_active: string
  is_verified: boolean
  notifications_enabled?: boolean
}

export interface RoomParticipant {
  id: string
  room_id: string
  session_id: string
  participant_number: number
  joined_at: string
  left_at: string | null
  is_active: boolean
}

export interface TextMessage {
  id: string
  room_id: string
  participant_id: string
  message: string
  reply_to_message_id?: string | null
  created_at: string
}

export interface AIAnalysis {
  id: string
  session_id: string
  room_id: string
  analysis_type: "realtime" | "summary"
  content: string
  mental_health_assessment: string | null
  suggestions: string | null
  created_at: string
}
