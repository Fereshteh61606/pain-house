import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { messages, sessionId, roomId, analysisType, roomName } = await request.json()

    if (!messages || !sessionId || !roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the analysis prompt
    const conversationText = messages.map((m: any) => `Participant ${m.participant_number}: ${m.message}`).join("\n")

    const systemPrompt = `You are a compassionate mental health AI assistant specialized in analyzing support group conversations. 
Your role is to provide empathetic, evidence-based insights and suggestions while maintaining professional boundaries.

IMPORTANT GUIDELINES:
- Be warm, supportive, and non-judgmental
- Recognize patterns in emotional expression
- Provide actionable coping strategies
- Suggest professional help when appropriate
- Acknowledge the courage it takes to share
- Never diagnose specific mental health conditions
- Focus on wellness and resilience

Analyze the following conversation from a ${roomName} support group and provide:
1. A brief empathetic summary of the emotional themes
2. Mental health insights (patterns, concerns, strengths)
3. Practical suggestions for coping and next steps
4. Encouragement and validation

Keep your response concise, warm, and actionable.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: `Conversation:\n${conversationText}\n\nProvide your analysis:`,
    })

    // Save analysis to database
    const supabase = await createClient()
    const { data: analysisData, error: dbError } = await supabase
      .from("ai_analyses")
      .insert({
        session_id: sessionId,
        room_id: roomId,
        analysis_type: analysisType,
        content: text,
        mental_health_assessment: extractSection(text, "insight"),
        suggestions: extractSection(text, "suggestion"),
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Failed to save analysis:", dbError)
    }

    return NextResponse.json({
      analysis: text,
      saved: !dbError,
      analysisId: analysisData?.id,
    })
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}

function extractSection(text: string, keyword: string): string {
  const lines = text.split("\n")
  const relevantLines = lines.filter((line) => line.toLowerCase().includes(keyword))
  return relevantLines.join(" ").slice(0, 500) || ""
}
