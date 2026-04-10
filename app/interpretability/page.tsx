'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, Info } from 'lucide-react'
import { getInterpretabilitySummary, getLrCoefficients, getAttention } from '@/lib/api'
import type { InterpretabilitySummary, LrCoefficients, AttentionData } from '@/lib/types'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '8px' },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#ffffff' },
}

const representationKeys = ['linguistic', 'tfidf', 'tfidf_linguistic', 'word2vec', 'sbert', 'distilbert']

function InterpretabilityContent() {
  const [summary, setSummary] = useState<InterpretabilitySummary | null>(null)
  const [coefficients, setCoefficients] = useState<Record<string, LrCoefficients>>({})
  const [attention, setAttention] = useState<AttentionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCoeffTab, setActiveCoeffTab] = useState('linguistic')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [summaryData, attentionData] = await Promise.all([
          getInterpretabilitySummary(),
          getAttention(),
        ])
        setSummary(summaryData)
        setAttention(attentionData)

        // Fetch coefficients for each representation
        const coeffMap: Record<string, LrCoefficients> = {}
        for (const rep of representationKeys) {
          try {
            const coeffData = await getLrCoefficients(rep)
            coeffMap[rep] = coeffData
          } catch {
            // Skip if representation not available
          }
        }
        setCoefficients(coeffMap)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch interpretability data')
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return <ErrorState message={error} />
  }

  if (loading || !summary) {
    return <LoadingState message="Loading interpretability analysis..." />
  }

  // Prepare scatter data for trade-off chart
  const tradeoffData = representationKeys
    .map((rep) => {
      const item = summary[rep]
      if (!item) return null
      return {
        representation: rep,
        interpretability_score: item.interpretability_score,
        f1: item.best_f1,
      }
    })
    .filter((item) => item !== null)

  // Interpretability cards
  const repCards = representationKeys.map((rep) => {
    const item = summary[rep]
    if (!item) return null
    return {
      representation: rep,
      score: item.interpretability_score,
      rationale: item.interpretability_rationale,
      cost: item.computational_cost,
      f1: item.best_f1,
    }
  }).filter((card): card is NonNullable<typeof card> => card !== null)

  return (
    <>
      {/* Interpretability Scale Explainer */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex gap-3 pt-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Interpretability Scale (1-5)</p>
            <p>
              <strong>5</strong> = Fully interpretable (direct feature coefficients with semantic meaning)<br />
              <strong>4</strong> = Highly interpretable (individual features can be examined)<br />
              <strong>3</strong> = Moderately interpretable (requires visualization techniques)<br />
              <strong>2</strong> = Low interpretability (dense embeddings, limited insight)<br />
              <strong>1</strong> = Black-box (neural network internals not directly accessible)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trade-off Scatter Chart */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">F1 vs Interpretability Trade-off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    dataKey="interpretability_score"
                    domain={[0, 5]}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    label={{
                      value: 'Interpretability Score (1-5)',
                      position: 'insideBottom',
                      offset: -10,
                      style: { fill: 'var(--muted-foreground)', fontSize: 11 },
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="f1"
                    domain={[0, 1]}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    label={{
                      value: 'F1 Score',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'var(--muted-foreground)', fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(value: any) => [
                      typeof value === 'number' ? value.toFixed(3) : String(value),
                    ]}
                  />
                  <Scatter
                    data={tradeoffData}
                    fill="oklch(0.55 0.25 285)"
                    name="Representations"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Representation Cards */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Interpretability Scores by Representation
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {repCards.map((rep) => (
            <Card key={rep.representation} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium capitalize">
                    {rep.representation.replace(/_/g, ' ')}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {rep.score}/5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rationale</p>
                  <p className="text-sm text-foreground">{rep.rationale}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Computational Cost</span>
                    <span className="text-sm font-medium">{rep.cost}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">Best F1</span>
                    <span className="text-sm font-mono font-semibold">{rep.f1.toFixed(3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* LR Coefficients */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Coefficients (Logistic Regression)</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCoeffTab} onValueChange={setActiveCoeffTab}>
              <TabsList className="grid w-full grid-cols-3">
                {['linguistic', 'tfidf', 'sbert'].map((rep) => (
                  <TabsTrigger key={rep} value={rep} className="capitalize">
                    {rep.replace(/_/g, ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {['linguistic', 'tfidf', 'sbert'].map((rep) => {
                const coeff = coefficients[rep]
                if (!coeff) return null

                return (
                  <TabsContent key={rep} value={rep} className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Lonely Indicators */}
                      <div>
                        <h4 className="font-medium text-sm mb-3">Lonely Indicators (Positive)</h4>
                        <div className="space-y-2">
                          {coeff.lonely_indicators.slice(0, 5).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <span className="text-sm text-foreground truncate">
                                {item.feature}
                              </span>
                              <span className="text-sm font-mono font-semibold text-[oklch(0.65_0.2_15)]">
                                {item.coefficient.toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Non-Lonely Indicators */}
                      <div>
                        <h4 className="font-medium text-sm mb-3">Non-Lonely Indicators (Negative)</h4>
                        <div className="space-y-2">
                          {coeff.non_lonely_indicators.slice(0, 5).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <span className="text-sm text-foreground truncate">
                                {item.feature}
                              </span>
                              <span className="text-sm font-mono font-semibold text-[oklch(0.65_0.18_250)]">
                                {item.coefficient.toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* DistilBERT Attention */}
      {attention && (
        <section>
          <Card className="border-[oklch(0.65_0.18_250)]/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">DistilBERT Attention Analysis</CardTitle>
                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                  ⚠️ Caveat
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-foreground">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p>{attention.caveat}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Lonely Top Tokens */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Top Attended Tokens (Lonely)</h4>
                  <div className="space-y-2">
                    {attention.lonely_top_tokens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-mono text-foreground">
                          {item.token}
                        </span>
                        <span className="text-sm font-mono font-semibold text-[oklch(0.65_0.2_15)]">
                          {item.avg_attention.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Lonely Top Tokens */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Top Attended Tokens (Non-Lonely)</h4>
                  <div className="space-y-2">
                    {attention.non_lonely_top_tokens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-mono text-foreground">
                          {item.token}
                        </span>
                        <span className="text-sm font-mono font-semibold text-[oklch(0.65_0.18_250)]">
                          {item.avg_attention.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </>
  )
}

export default function InterpretabilityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Model Interpretability"
        subtitle="RQ4: Trade-offs between predictive power and interpretability"
      />

      <div className="flex-1 p-6 space-y-8">
        <InterpretabilityContent />
      </div>
    </div>
  )
}
