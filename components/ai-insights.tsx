"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

interface AIInsightsProps {
  messages: any[]
  sessionId: string
  roomId: string
  roomName: string
  locale: "en" | "fa"
}

export function AIInsights({ messages, sessionId, roomId, roomName, locale }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  async function handleAnalyze() {
    if (messages.length < 3) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          sessionId,
          roomId,
          analysisType: "summary",
          roomName,
        }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setAnalysis(data.analysis)
      setIsExpanded(true)
    } catch (err) {
      console.error("AI analysis failed:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Minimal collapsed view
  if (!isExpanded) {
    return (
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <button
          onClick={() => messages.length >= 3 ? handleAnalyze() : setIsExpanded(true)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {locale === "en" ? "AI Support" : "پشتیبانی هوش مصنوعی"}
            </span>
            {messages.length >= 3 && !analysis && (
              <span className="text-xs text-purple-600 dark:text-purple-400">
                {locale === "en" ? "Tap for insights" : "برای بینش ضربه بزنید"}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    )
  }

  // Expanded view
  return (
    <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {locale === "en" ? "AI Insights" : "بینش های هوش مصنوعی"}
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded"
          >
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {isAnalyzing ? (
          <div className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
            {locale === "en" ? "Analyzing conversation..." : "در حال تجزیه و تحلیل..."}
          </div>
        ) : analysis ? (
          <div className="text-sm text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {analysis}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === "en"
                ? "Get AI-powered insights and support based on your conversation"
                : "بینش و پشتیبانی مبتنی بر هوش مصنوعی بر اساس مکالمه خود دریافت کنید"}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={messages.length < 3}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {messages.length < 3
                ? locale === "en"
                  ? "Need 3+ messages"
                  : "نیاز به 3+ پیام"
                : locale === "en"
                  ? "Get Insights"
                  : "دریافت بینش"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
