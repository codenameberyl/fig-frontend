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
  }).filter(Boolean)

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
                    formatter={(value: number, name: string) => [
                      value.toFixed(3),
                      name === 'f1' ? 'F1 Score' : 'Interpretability',
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
  {
    representation: 'linguistic',
    interpretability_score: 5,
    computational_cost: 'Very Low',
    best_f1: 0.709,
    rationale: 'Direct feature importance from coefficients. Each feature has clear semantic meaning.',
    top_lonely_features: ['pronoun_ratio', 'first_person_ratio', 'negation_ratio', 'emotion_word_ratio', 'hedge_ratio'],
    top_non_lonely_features: ['social_word_ratio', 'certainty_ratio', 'exclamation_ratio', 'question_ratio', 'avg_word_length'],
  },
  {
    representation: 'tfidf',
    interpretability_score: 4,
    computational_cost: 'Low',
    best_f1: 0.855,
    rationale: 'Individual n-gram weights can be examined. Large feature space requires dimensionality reduction for visualization.',
    top_lonely_features: ['alone', 'lonely', 'no one', 'feel like', 'friends'],
    top_non_lonely_features: ['happy', 'great', 'love', 'today', 'fun'],
  },
  {
    representation: 'tfidf_linguistic',
    interpretability_score: 4,
    computational_cost: 'Low',
    best_f1: 0.862,
    rationale: 'Combines interpretable linguistic features with n-gram analysis.',
    top_lonely_features: ['alone', 'pronoun_ratio', 'lonely', 'feel like', 'no one'],
    top_non_lonely_features: ['happy', 'social_word_ratio', 'great', 'love', 'certainty_ratio'],
  },
  {
    representation: 'word2vec',
    interpretability_score: 2,
    computational_cost: 'Medium',
    best_f1: 0.789,
    rationale: 'Dense embeddings lack direct interpretability. Requires embedding visualization techniques.',
    top_lonely_features: [],
    top_non_lonely_features: [],
  },
  {
    representation: 'sbert',
    interpretability_score: 2,
    computational_cost: 'Medium-High',
    best_f1: 0.877,
    rationale: 'Contextual embeddings capture semantic meaning but are not directly interpretable.',
    top_lonely_features: [],
    top_non_lonely_features: [],
  },
  {
    representation: 'distilbert',
    interpretability_score: 1,
    computational_cost: 'High',
    best_f1: 0.909,
    rationale: 'Black-box neural network. Attention weights provide limited insight into decision-making.',
    top_lonely_features: [],
    top_non_lonely_features: [],
  },
]

const mockCoefficients = {
  linguistic: {
    lonely_indicators: [
      { feature: 'first_person_ratio', coefficient: 2.34 },
      { feature: 'pronoun_ratio', coefficient: 1.89 },
      { feature: 'negation_ratio', coefficient: 1.67 },
      { feature: 'emotion_word_ratio', coefficient: 1.45 },
      { feature: 'hedge_ratio', coefficient: 1.23 },
    ],
    non_lonely_indicators: [
      { feature: 'social_word_ratio', coefficient: -1.98 },
      { feature: 'certainty_ratio', coefficient: -1.56 },
      { feature: 'exclamation_ratio', coefficient: -1.34 },
      { feature: 'question_ratio', coefficient: -0.98 },
      { feature: 'avg_word_length', coefficient: -0.76 },
    ],
  },
  tfidf: {
    lonely_indicators: [
      { feature: 'alone', coefficient: 1.87 },
      { feature: 'lonely', coefficient: 1.76 },
      { feature: 'no one', coefficient: 1.54 },
      { feature: 'feel like', coefficient: 1.43 },
      { feature: 'anyone', coefficient: 1.32 },
      { feature: 'talk', coefficient: 1.21 },
      { feature: 'friends', coefficient: 0.98 },
      { feature: 'wish', coefficient: 0.87 },
      { feature: 'anymore', coefficient: 0.76 },
      { feature: 'depressed', coefficient: 0.65 },
    ],
    non_lonely_indicators: [
      { feature: 'happy', coefficient: -1.67 },
      { feature: 'great', coefficient: -1.54 },
      { feature: 'love', coefficient: -1.43 },
      { feature: 'today', coefficient: -1.32 },
      { feature: 'fun', coefficient: -1.21 },
      { feature: 'amazing', coefficient: -1.1 },
      { feature: 'excited', coefficient: -0.98 },
      { feature: 'best', coefficient: -0.87 },
      { feature: 'awesome', coefficient: -0.76 },
      { feature: 'wonderful', coefficient: -0.65 },
    ],
  },
}

const mockAttentionData = {
  lonely_tokens: [
    { token: 'alone', attention: 0.156 },
    { token: 'lonely', attention: 0.134 },
    { token: 'no', attention: 0.098 },
    { token: 'one', attention: 0.087 },
    { token: 'feel', attention: 0.076 },
    { token: 'anyone', attention: 0.065 },
    { token: 'talk', attention: 0.054 },
    { token: 'friends', attention: 0.043 },
    { token: 'wish', attention: 0.032 },
    { token: 'anymore', attention: 0.028 },
  ],
  non_lonely_tokens: [
    { token: 'happy', attention: 0.143 },
    { token: 'great', attention: 0.121 },
    { token: 'love', attention: 0.098 },
    { token: 'fun', attention: 0.087 },
    { token: 'amazing', attention: 0.076 },
    { token: 'excited', attention: 0.065 },
    { token: 'best', attention: 0.054 },
    { token: 'awesome', attention: 0.043 },
    { token: 'wonderful', attention: 0.032 },
    { token: 'beautiful', attention: 0.028 },
  ],
}

function InterpretabilityDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i <= score ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

export default function InterpretabilityPage() {
  const [coeffTab, setCoeffTab] = useState<'linguistic' | 'tfidf'>('linguistic')

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Interpretability Analysis"
        subtitle="RQ4: Trade-offs between performance and interpretability"
      />

      <div className="flex-1 p-6 space-y-8">
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

        {/* Trade-off Scatter Plot */}
        <section className="space-y-4">
          <TradeoffScatter data={mockInterpretabilitySummary} />
          <PlotImage
            section="models"
            plotName="interp_representation_tradeoff.png"
            alt="Interpretability vs performance trade-off"
          />
        </section>

        {/* Per-representation Cards */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Representation Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockInterpretabilitySummary.map((item) => (
              <Card key={item.representation}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {item.representation
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </CardTitle>
                    <InterpretabilityDots score={item.interpretability_score} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Best F1</span>
                    <span className="font-mono tabular-nums">{item.best_f1.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Compute Cost</span>
                    <Badge variant="outline">{item.computational_cost}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.rationale}</p>
                  {item.top_lonely_features && item.top_lonely_features.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[oklch(0.65_0.2_15)] font-medium">Top lonely: </span>
                      <span className="text-muted-foreground font-mono">
                        {item.top_lonely_features.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* LR Coefficients Viewer */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Logistic Regression Coefficients
          </h3>
          <Tabs value={coeffTab} onValueChange={(v) => setCoeffTab(v as 'linguistic' | 'tfidf')}>
            <TabsList>
              <TabsTrigger value="linguistic">Linguistic Only</TabsTrigger>
              <TabsTrigger value="tfidf">TF-IDF</TabsTrigger>
            </TabsList>
            <TabsContent value="linguistic" className="mt-4">
              <CoefficientChart
                lonelyIndicators={mockCoefficients.linguistic.lonely_indicators}
                nonLonelyIndicators={mockCoefficients.linguistic.non_lonely_indicators}
              />
            </TabsContent>
            <TabsContent value="tfidf" className="mt-4">
              <CoefficientChart
                lonelyIndicators={mockCoefficients.tfidf.lonely_indicators}
                nonLonelyIndicators={mockCoefficients.tfidf.non_lonely_indicators}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* DistilBERT Attention */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            DistilBERT Attention Analysis
          </h3>
          
          {/* Warning Callout */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="flex gap-3 pt-6">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Attention Weight Caveat</p>
                <p>
                  Attention weights indicate which tokens the model attends to but are not 
                  faithful attribution scores. They should be interpreted with caution and 
                  not used as the sole explanation for model decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[oklch(0.65_0.2_15)]">
                  Top Attended Tokens (Lonely)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockAttentionData.lonely_tokens.map((item) => (
                    <div key={item.token} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-mono">{item.token}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[oklch(0.65_0.2_15)] rounded-full"
                          style={{ width: `${item.attention * 100 * 5}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                        {item.attention.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[oklch(0.65_0.18_250)]">
                  Top Attended Tokens (Non-Lonely)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockAttentionData.non_lonely_tokens.map((item) => (
                    <div key={item.token} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-mono">{item.token}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[oklch(0.65_0.18_250)] rounded-full"
                          style={{ width: `${item.attention * 100 * 5}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                        {item.attention.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
