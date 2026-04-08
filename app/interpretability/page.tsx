'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Info, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PlotImage } from '@/components/shared/plot-image'
import { CoefficientChart } from '@/components/interpretability/coefficient-chart'
import { TradeoffScatter } from '@/components/interpretability/tradeoff-scatter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Mock data
const mockInterpretabilitySummary = [
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
