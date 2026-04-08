'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { PlotImage } from '@/components/shared/plot-image'
import { ErrorExampleCard } from '@/components/error-analysis/error-example-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LONELY_COLOR = 'oklch(0.65 0.2 15)'
const NON_LONELY_COLOR = 'oklch(0.65 0.18 250)'

// Mock data
const mockSummary = {
  best_model: 'distilbert_fine_tuned',
  total_test: 564,
  fp_count: 22,
  fn_count: 28,
  error_rate: 8.87,
}

const mockFpFnCounts = [
  { model: 'linguistic_svm', fp: 45, fn: 52 },
  { model: 'tfidf_svm', fp: 28, fn: 34 },
  { model: 'tfidf_linguistic_svm', fp: 26, fn: 32 },
  { model: 'word2vec_svm', fp: 38, fn: 44 },
  { model: 'sbert_svm', fp: 24, fn: 30 },
  { model: 'distilbert_fine_tuned', fp: 22, fn: 28 },
]

const mockObservations = [
  'False positives often contain loneliness-adjacent language (e.g., "alone time", "quiet weekend") without actual loneliness expression.',
  'False negatives frequently involve subtle or indirect loneliness expression, such as describing social situations without explicit emotional language.',
  'Posts with sarcasm or humor about loneliness are frequently misclassified.',
  'Very short posts (< 50 words) have higher error rates due to limited context.',
  'Posts discussing past loneliness that has been resolved are often misclassified as currently lonely.',
]

const mockErrorExamples = {
  false_positives: [
    {
      unique_id: 'fp_001',
      text: "Spent the weekend alone and it was exactly what I needed. Sometimes you just need some quiet time to recharge. Made some tea, read a book, and watched the rain. Perfect.",
      true_label: 0,
      predicted_label: 1,
      word_count: 34,
      pronoun_ratio: 0.088,
      emotion_word_ratio: 0.029,
      negation_ratio: 0,
    },
    {
      unique_id: 'fp_002',
      text: "No one showed up to my party... because I didn't throw one! Jokes aside, had a chill day gaming with online friends. We raided for 6 hours straight.",
      true_label: 0,
      predicted_label: 1,
      word_count: 31,
      pronoun_ratio: 0.065,
      emotion_word_ratio: 0.032,
      negation_ratio: 0.032,
    },
  ],
  false_negatives: [
    {
      unique_id: 'fn_001',
      text: "Another Friday night scrolling through everyone's stories. They all seem to be out having fun. I keep telling myself I'll make plans next weekend but I never do. It's fine though, I'm used to it.",
      true_label: 1,
      predicted_label: 0,
      word_count: 42,
      pronoun_ratio: 0.119,
      emotion_word_ratio: 0.024,
      negation_ratio: 0.024,
    },
    {
      unique_id: 'fn_002',
      text: "My coworkers invited me to lunch again today. I said I had work to do. I always say I have work to do. I don't know why I keep doing this to myself.",
      true_label: 1,
      predicted_label: 0,
      word_count: 33,
      pronoun_ratio: 0.182,
      emotion_word_ratio: 0,
      negation_ratio: 0.061,
    },
  ],
}

const mockModelKeys = [
  'distilbert_fine_tuned',
  'sbert_svm',
  'tfidf_linguistic_svm',
  'tfidf_svm',
  'word2vec_svm',
  'linguistic_svm',
]

export default function ErrorAnalysisPage() {
  const [selectedModel, setSelectedModel] = useState('distilbert_fine_tuned')
  const [fpPage, setFpPage] = useState(0)
  const [fnPage, setFnPage] = useState(0)
  const itemsPerPage = 5

  const chartData = mockFpFnCounts.map((item) => ({
    model: item.model.split('_').slice(-2).join(' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    'False Positives': item.fp,
    'False Negatives': item.fn,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Error Analysis"
        subtitle="Qualitative inspection of model misclassifications"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Summary Metrics */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Best Model Error Summary
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Test Samples"
              value={mockSummary.total_test}
              accentColor="violet"
            />
            <MetricCard
              label="False Positives"
              value={mockSummary.fp_count}
              delta="Non-lonely → Lonely"
              accentColor="rose"
            />
            <MetricCard
              label="False Negatives"
              value={mockSummary.fn_count}
              delta="Lonely → Non-lonely"
              accentColor="blue"
            />
            <MetricCard
              label="Error Rate"
              value={`${mockSummary.error_rate}%`}
              accentColor="cyan"
            />
          </div>
        </section>

        {/* FP/FN Counts Chart */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">FP/FN Counts by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="model"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="False Positives"
                      fill={LONELY_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="False Negatives"
                      fill={NON_LONELY_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Qualitative Observations */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Qualitative Observations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {mockObservations.map((observation, idx) => (
              <Card key={idx} className="border-muted">
                <CardContent className="flex gap-3 pt-6">
                  <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{observation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Static Plots */}
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Linguistic Feature Comparison
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <PlotImage
              section="models"
              plotName="error_analysis_linguistic_fp_vs_fn.png"
              alt="Linguistic features FP vs FN"
            />
            <PlotImage
              section="models"
              plotName="error_analysis_length_by_error_type.png"
              alt="Text length by error type"
            />
          </div>
        </section>

        {/* Error Examples Browser */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Error Examples
            </h3>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {mockModelKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* False Positives */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[oklch(0.65_0.2_15)]">
                False Positives ({mockErrorExamples.false_positives.length})
              </h4>
              <div className="space-y-3">
                {mockErrorExamples.false_positives.map((example) => (
                  <ErrorExampleCard key={example.unique_id} example={example} type="fp" />
                ))}
              </div>
            </div>

            {/* False Negatives */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[oklch(0.65_0.18_250)]">
                False Negatives ({mockErrorExamples.false_negatives.length})
              </h4>
              <div className="space-y-3">
                {mockErrorExamples.false_negatives.map((example) => (
                  <ErrorExampleCard key={example.unique_id} example={example} type="fn" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
