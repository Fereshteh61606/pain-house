"use client"

import { createClient } from "@/lib/supabase/client"
import type { AnonymousSession } from "@/lib/types"

const SESSION_KEY = "anonymous_session_id"

export function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getLocalSessionId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(SESSION_KEY)
}

export function setLocalSessionId(sessionId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, sessionId)
}

export async function getOrCreateSession(): Promise<AnonymousSession | null> {
  const supabase = createClient()
  const localSessionId = getLocalSessionId()

  if (localSessionId) {
    const { data, error } = await supabase.from("anonymous_sessions").select("*").eq("id", localSessionId).single()

    if (!error && data) {
      // Update last active
      await supabase
        .from("anonymous_sessions")
        .update({ last_active: new Date().toISOString() })
        .eq("id", localSessionId)
      return data as AnonymousSession
    }
  }

  // Create new session
  const sessionCode = generateSessionCode()
  const { data, error } = await supabase
    .from("anonymous_sessions")
    .insert({ session_code: sessionCode, is_verified: false })
    .select()
    .single()

  if (error || !data) {
    console.error("[v0] Failed to create session:", error)
    return null
  }

  setLocalSessionId(data.id)
  return data as AnonymousSession
}
