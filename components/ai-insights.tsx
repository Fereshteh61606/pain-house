"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"

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
  const [showModal, setShowModal] = useState(false)

  async function handleAnalyze() {
    if (messages.length < 3) return

    setIsAnalyzing(true)
    setShowModal(true)

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
    } catch (err) {
      console.error("AI analysis failed:", err)
      alert(locale === "en" ? "Failed to analyze. Please try again." : "تجزیه و تحلیل ناموفق بود. لطفا دوباره تلاش کنید.")
      setShowModal(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      {/* Tiny floating button */}
      <Button
        onClick={handleAnalyze}
        disabled={messages.length < 3 || isAnalyzing}
        size="sm"
        className="fixed bottom-20 right-4 z-40 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        title={locale === "en" ? "Get AI Insights" : "دریافت بینش هوش مصنوعی"}
      >
        <Sparkles className="w-5 h-5" />
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {locale === "en" ? "AI Insights" : "بینش های هوش مصنوعی"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {isAnalyzing ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {locale === "en" ? "Analyzing conversation..." : "در حال تجزیه و تحلیل..."}
                  </p>
                </div>
              ) : analysis ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {analysis}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
