'use client'

import { useState } from 'react'
import { predict } from '@/lib/api'
import type { PredictResponse } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Sparkles } from 'lucide-react'

const examplePosts = [
  {
    label: 'Lonely Example',
    text: "I don't really have anyone to talk to anymore. My friends all moved away after graduation and I spend most of my time just scrolling through social media watching everyone else live their lives. Sometimes I wonder if anyone would even notice if I just disappeared.",
  },
  {
    label: 'Non-Lonely Example',
    text: "Just got back from an amazing trip with my college roommates! We've been doing this annual reunion for five years now and it's always the highlight of my summer. Already planning next year's adventure - thinking maybe hiking in Colorado!",
  },
  {
    label: 'Ambiguous Example',
    text: "Working from home has been weird. I enjoy not having to commute and I get more done, but I do miss the casual conversations with coworkers. Started going to a coffee shop just to be around people sometimes.",
  },
]

export function PredictForm() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || text.length < 10) {
      setError('Text must be at least 10 characters long')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await predict(text)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to classify text')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (exampleText: string) => {
    setText(exampleText)
    setResult(null)
    setError(null)
  }

  const isLonely = result?.label === 1
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classify Text</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a Reddit post here to classify it for loneliness self-disclosure..."
                className="min-h-[160px] resize-none pr-16"
                maxLength={2000}
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono tabular-nums">
                {text.length}/2000
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-[oklch(0.65_0.2_15)]">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || text.length < 10}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Classifying...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Classify
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className={cn(
          'border-2 transition-all duration-300',
          isLonely 
            ? 'border-[oklch(0.65_0.2_15)]/50 bg-[oklch(0.65_0.2_15)]/5' 
            : 'border-[oklch(0.65_0.18_250)]/50 bg-[oklch(0.65_0.18_250)]/5'
        )}>
          <CardContent className="pt-6 space-y-6">
            {/* Label Badge */}
            <div className="flex justify-center">
              <Badge
                className={cn(
                  'text-lg px-6 py-2 font-semibold',
                  isLonely
                    ? 'bg-[oklch(0.65_0.2_15)] hover:bg-[oklch(0.65_0.2_15)]'
                    : 'bg-[oklch(0.65_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]'
                )}
              >
                {isLonely ? 'LONELY' : 'NOT LONELY'}
              </Badge>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono tabular-nums text-foreground">{confidencePercent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isLonely ? 'bg-[oklch(0.65_0.2_15)]' : 'bg-[oklch(0.65_0.18_250)]'
                  )}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Decision Threshold</span>
                <span className="font-mono tabular-nums">{result.threshold_used.toFixed(3)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono text-xs">{result.representation}/{result.model}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Posts */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Try an example:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {examplePosts.map((example) => (
            <Button
              key={example.label}
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start"
              onClick={() => handleExampleClick(example.text)}
            >
              <span className="text-sm">{example.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
