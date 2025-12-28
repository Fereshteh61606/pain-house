"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

interface CaptchaVerificationProps {
  onVerified: () => void
  locale: "en" | "fa"
}

export function CaptchaVerification({ onVerified, locale }: CaptchaVerificationProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    generateChallenge()
  }, [])

  function generateChallenge() {
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setAnswer("")
    setError(false)
  }

  function handleVerify() {
    const userAnswer = Number.parseInt(answer)
    const correctAnswer = num1 + num2

    if (userAnswer === correctAnswer) {
      onVerified()
    } else {
      setError(true)
      generateChallenge()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>{locale === "en" ? "Verify You're Human" : "تأیید کنید که انسان هستید"}</CardTitle>
          <CardDescription>
            {locale === "en"
              ? "Please solve this simple math problem to continue"
              : "لطفاً این مسئله ریاضی ساده را برای ادامه حل کنید"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-muted rounded-lg text-center">
            <p className="text-4xl font-bold">
              {num1} + {num2} = ?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">{locale === "en" ? "Your Answer" : "پاسخ شما"}</Label>
            <Input
              id="answer"
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              placeholder={locale === "en" ? "Enter the sum" : "مجموع را وارد کنید"}
              className={error ? "border-destructive" : ""}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">
                {locale === "en" ? "Incorrect answer. Please try again." : "پاسخ نادرست. لطفا دوباره امتحان کنید."}
              </p>
            )}
          </div>

          <Button onClick={handleVerify} className="w-full" disabled={!answer}>
            {locale === "en" ? "Verify" : "تأیید"}
          </Button>

          <p className="text-xs text-muted-foreground text-center text-pretty">
            {locale === "en"
              ? "This helps us ensure a safe environment for everyone"
              : "این به ما کمک می کند محیط امنی برای همه تضمین کنیم"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
