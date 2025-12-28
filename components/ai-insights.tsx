"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Brain, Lightbulb, AlertCircle } from "lucide-react"

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
  const [error, setError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  async function handleAnalyze(type: "realtime" | "summary") {
    if (messages.length < 3) {
      setError(locale === "en" ? "Need at least 3 messages to analyze" : "برای تجزیه و تحلیل حداقل 3 پیام نیاز است")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          sessionId,
          roomId,
          analysisType: type,
          roomName,
        }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setAnalysis(data.analysis)
      setShowAnalysis(true)
    } catch (err) {
      setError(locale === "en" ? "Failed to generate analysis" : "تولید تجزیه و تحلیل ناموفق بود")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!showAnalysis) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>{locale === "en" ? "AI Support Assistant" : "دستیار پشتیبانی هوش مصنوعی"}</CardTitle>
          </div>
          <CardDescription>
            {locale === "en"
              ? "Get personalized insights and suggestions based on your conversation"
              : "بینش ها و پیشنهادات شخصی سازی شده بر اساس مکالمه خود دریافت کنید"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handleAnalyze("realtime")}
              disabled={isAnalyzing || messages.length < 3}
              size="sm"
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              {locale === "en" ? "Get Quick Insight" : "دریافت بینش سریع"}
            </Button>
            <Button
              onClick={() => handleAnalyze("summary")}
              disabled={isAnalyzing || messages.length < 3}
              size="sm"
              variant="default"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {locale === "en" ? "Full Analysis" : "تجزیه و تحلیل کامل"}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="text-sm text-muted-foreground">
              {locale === "en" ? "Analyzing conversation..." : "در حال تجزیه و تحلیل مکالمه..."}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
            <p className="font-medium">
              {locale === "en" ? "AI Analysis includes:" : "تجزیه و تحلیل هوش مصنوعی شامل:"}
            </p>
            <ul className="space-y-1" dir={locale === "fa" ? "rtl" : "ltr"}>
              <li>
                {locale === "en" ? "• Empathetic understanding of your concerns" : "• درک همدلانه نگرانی های شما"}
              </li>
              <li>{locale === "en" ? "• Practical coping strategies" : "• استراتژی های عملی مقابله"}</li>
              <li>
                {locale === "en"
                  ? "• Suggestions for professional support when needed"
                  : "• پیشنهادات برای پشتیبانی حرفه ای در صورت نیاز"}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>{locale === "en" ? "AI Insights" : "بینش های هوش مصنوعی"}</CardTitle>
          </div>
          <Badge variant="secondary">{locale === "en" ? "Personalized" : "شخصی سازی شده"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none text-pretty">
          <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap" dir={locale === "fa" ? "rtl" : "ltr"}>
            {analysis}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowAnalysis(false)} variant="outline" size="sm">
            {locale === "en" ? "New Analysis" : "تجزیه و تحلیل جدید"}
          </Button>
          <Button onClick={() => handleAnalyze("summary")} disabled={isAnalyzing} variant="ghost" size="sm">
            {locale === "en" ? "Refresh" : "تازه سازی"}
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 text-xs text-muted-foreground text-center">
          {locale === "en"
            ? "This AI analysis is for informational purposes only and does not replace professional mental health care."
            : "این تجزیه و تحلیل هوش مصنوعی فقط برای اهداف اطلاعاتی است و جایگزین مراقبت های حرفه ای سلامت روان نمی شود."}
        </div>
      </CardContent>
    </Card>
  )
}
