'use client'

import { useState, useEffect } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { predict, predictBatch, getTestReport } from '@/lib/api'
import type { PredictResponse, TestReport } from '@/lib/types'

const EXAMPLE_POSTS = [
  "I feel so alone lately, even when I'm surrounded by people. No one seems to understand what I'm going through. I wish things were different.",
  "Just had the best day ever! Went out with friends, tried a new restaurant, and we laughed so hard. Grateful for these amazing people in my life.",
  'Sometimes I wonder if anyone would even notice if I stopped showing up. Been feeling disconnected for a while now.',
]

function DemoContent() {
  const [input, setInput] = useState('')
  const [testReport, setTestReport] = useState<TestReport | null>(null)
  const [results, setResults] = useState<PredictResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'single' | 'batch'>('single')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Fetch test report to get model info and threshold
        const report = await getTestReport()
        setTestReport(report)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model info')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePredict = async () => {
    if (!input.trim()) return

    try {
      setPredicting(true)
      setResults([])
      setError(null)

      if (mode === 'batch') {
        // Split by newlines and filter empty lines
        const texts = input
          .split('\n')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)

        if (texts.length === 0) {
          setError('Please enter at least one post')
          return
        }

        const batchResults = await predictBatch(texts)
        setResults(batchResults)
      } else {
        const result = await predict(input.trim())
        setResults([result])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
      setResults([])
    } finally {
      setPredicting(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
    setResults([])
    setMode('single')
  }

  if (error && !testReport) {
    return <ErrorState message={error} />
  }

  if (loading || !testReport) {
    return <LoadingState message="Loading model information..." />
  }

  return (
    <>
      {/* Info Callout */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex gap-3 pt-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-1">
              Using the best-performing model ({/* modelkey can be derived from testReport */}
              <span className="font-mono text-foreground">
                {testReport.representation} / {testReport.model}
              </span>
              ) with optimal threshold{' '}
              <span className="font-mono text-foreground">
                {testReport.roc_curve.optimal_threshold.toFixed(3)}
              </span>
            </p>
            <p>ROC-AUC: {testReport.roc_auc.toFixed(3)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Example Posts */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Try Example Posts</h3>
        <div className="space-y-2">
          {EXAMPLE_POSTS.map((post, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="justify-start h-auto text-left whitespace-normal"
              onClick={() => handleExampleClick(post)}
            >
              <span className="truncate line-clamp-2">{post}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Input Form */}
      <section className="space-y-4">
        <div className="flex gap-2 items-center">
          <h3 className="text-sm font-medium text-muted-foreground">Your Text</h3>
          <div className="flex gap-2">
            <Badge
              variant={mode === 'single' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMode('single')}
            >
              Single Post
            </Badge>
            <Badge
              variant={mode === 'batch' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMode('batch')}
            >
              Batch (Line-separated)
            </Badge>
          </div>
        </div>

        <Textarea
          placeholder={
            mode === 'batch'
              ? 'Enter multiple posts, one per line...'
              : 'Enter a post to analyze...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />

        <Button
          onClick={handlePredict}
          disabled={predicting || !input.trim()}
          className="w-full"
          size="lg"
        >
          {predicting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {predicting ? 'Predicting...' : 'Predict'}
        </Button>
      </section>

      {/* Error Display */}
      {error && (
        <Card className="border-[oklch(0.65_0.2_15)]/30 bg-[oklch(0.65_0.2_15)]/5">
          <CardContent className="pt-6">
            <p className="text-sm text-[oklch(0.65_0.2_15)]">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Results ({results.length})
          </h3>

          <div className="space-y-3">
            {results.map((result, idx) => {
              const isLonely = result.label === 1
              const bgColor = isLonely
                ? 'bg-[oklch(0.65_0.2_15)]/5 border-[oklch(0.65_0.2_15)]/30'
                : 'bg-[oklch(0.65_0.18_250)]/5 border-[oklch(0.65_0.18_250)]/30'
              const textColor = isLonely
                ? 'text-[oklch(0.65_0.2_15)]'
                : 'text-[oklch(0.65_0.18_250)]'

              return (
                <Card key={idx} className={`border ${bgColor}`}>
                  <CardContent className="pt-6 space-y-4">
                    {mode === 'batch' && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {result.input_text.substring(0, 100)}
                        {result.input_text.length > 100 ? '...' : ''}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={`${textColor} ${isLonely ? 'bg-[oklch(0.65_0.2_15)]/20' : 'bg-[oklch(0.65_0.18_250)]/20'}`}>
                          {result.label_name === 'lonely' ? 'Lonely' : 'Not Lonely'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Model: {result.model} | Threshold: {result.threshold_used.toFixed(3)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono font-bold tabular-nums">
                          {(result.confidence * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isLonely ? 'bg-[oklch(0.65_0.2_15)]' : 'bg-[oklch(0.65_0.18_250)]'
                          }`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Live Inference Demo"
        subtitle="Test the loneliness detection model with your own text"
      />

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <DemoContent />
        </div>
      </div>
    </div>
  )
}
