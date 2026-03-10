"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { PredictionResult } from "@/components/analyze/prediction-result"
import { SentimentGauge } from "@/components/analyze/sentiment-gauge"
import { LinguisticBreakdown } from "@/components/analyze/linguistic-breakdown"
import { HighlightedText } from "@/components/analyze/highlighted-text"

export default function AnalyzePage() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    prediction: "lonely" | "non-lonely"
    confidence: number
    sentiment: number
    features: {
      firstPerson: number
      socialRefs: number
      questions: number
      complexity: number
    }
  }>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple heuristic analysis (in production, this would call the Django backend)
    const lowerText = text.toLowerCase()
    const words = lowerText.split(/\s+/)
    const lonelyKeywords = ["alone", "lonely", "isolated", "nobody", "empty", "sad", "depressed"]
    const socialKeywords = ["friends", "family", "together", "love", "happy", "fun"]

    const lonelyScore = words.filter((w) => lonelyKeywords.some((k) => w.includes(k))).length
    const socialScore = words.filter((w) => socialKeywords.some((k) => w.includes(k))).length

    const firstPersonWords = ["i", "me", "my", "myself", "mine"]
    const firstPersonCount = words.filter((w) => firstPersonWords.includes(w)).length

    const isLonely = lonelyScore > socialScore || firstPersonCount / words.length > 0.15

    setResult({
      prediction: isLonely ? "lonely" : "non-lonely",
      confidence: 0.75 + Math.random() * 0.2,
      sentiment: isLonely ? -0.3 - Math.random() * 0.4 : 0.3 + Math.random() * 0.4,
      features: {
        firstPerson: Math.min(1, (firstPersonCount / words.length) * 5),
        socialRefs: Math.min(1, socialScore / 3),
        questions: Math.min(1, (text.match(/\?/g) || []).length / 3),
        complexity: Math.min(1, words.length / 100),
      },
    })

    setIsAnalyzing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Live Text Analysis Demo
          </h2>
          <p className="text-muted-foreground">
            Enter text to analyze loneliness signals using our trained models
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>
                Enter or paste text to analyze for loneliness indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to analyze loneliness signals... 

Example: 'I've been feeling so alone lately. Nobody seems to understand what I'm going through. I just want someone to talk to.'"
                className="min-h-[200px] resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {text.split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || isAnalyzing}
                  className="min-w-[140px]"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="mr-2 animate-spin">
                        <Sparkles className="size-4" />
                      </span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Analyze Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <PredictionResult result={result} isAnalyzing={isAnalyzing} />
        </div>

        {result && (
          <div className="grid gap-6 lg:grid-cols-2">
            <SentimentGauge sentiment={result.sentiment} />
            <LinguisticBreakdown features={result.features} />
          </div>
        )}

        {result && text && <HighlightedText text={text} />}
      </div>
    </DashboardLayout>
  )
}
