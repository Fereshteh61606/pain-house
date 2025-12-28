import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { theme, description } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 })
    }

    const systemPrompt = `You are an AI assistant helping create support group rooms for mental health. 
Based on emerging themes in conversations, suggest new support rooms that would benefit users.

Provide:
1. A clear, empathetic room name
2. A brief description (2-3 sentences)
3. Whether it should be text or audio format
4. Recommended capacity (15-30 people)

Be sensitive, specific, and focus on psychological safety.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: `Theme: ${theme}\nDescription: ${description}\n\nSuggest a new support room:`,
    })

    return NextResponse.json({ suggestion: text })
  } catch (error) {
    console.error("[v0] AI room suggestion error:", error)
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 })
  }
}
