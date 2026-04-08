'use client'

import { useState, useEffect } from 'react'
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
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { ErrorExampleCard } from '@/components/error-analysis/error-example-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorSummary, getErrorDetail, getErrorKeys } from '@/lib/api'
import type { ErrorAnalysisSummary, ErrorAnalysisDetail, ErrorAnalysisKeys } from '@/lib/types'

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '8px' },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#ffffff' },
}

const LONELY_COLOR = 'oklch(0.65 0.2 15)'
const NON_LONELY_COLOR = 'oklch(0.65 0.18 250)'

function ErrorAnalysisContent() {
  const [summary, setSummary] = useState<ErrorAnalysisSummary | null>(null)
  const [errorKeys, setErrorKeys] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [errorDetail, setErrorDetail] = useState<ErrorAnalysisDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [summaryData, keysData] = await Promise.all([
          getErrorSummary(),
          getErrorKeys(),
        ])
        setSummary(summaryData)
        setErrorKeys(keysData.keys)
        setSelectedModel(keysData.keys[0] || summaryData.best_model_key)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch error analysis')
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedModel) return

    async function fetchDetail() {
      try {
        setDetailLoading(true)
        const detail = await getErrorDetail(selectedModel)
        setErrorDetail(detail)
      } catch (err) {
        console.error('Failed to fetch error detail:', err)
        setErrorDetail(null)
      } finally {
        setDetailLoading(false)
      }
    }
    fetchDetail()
  }, [selectedModel])

  if (error) {
    return <ErrorState message={error} />
  }

  if (loading || !summary || errorKeys.length === 0) {
    return <LoadingState message="Loading error analysis..." />
  }

  // Find the summary for the best model
  const bestModelSummary = summary.model_summaries.find(
    (m) => `${m.representation}_${m.model}` === summary.best_model_key
  )

  // Prepare chart data
  const chartData = summary.model_summaries.map((item) => ({
    model: `${item.representation} / ${item.model}`,
    'False Positives': item.FP,
    'False Negatives': item.FN,
  }))

  return (
    <>
      {/* Summary Metrics */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Best Model Error Summary
        </h3>
        {bestModelSummary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Test Samples"
              value={bestModelSummary.total_test}
              accentColor="violet"
            />
            <MetricCard
              label="False Positives"
              value={bestModelSummary.FP}
              delta="Non-lonely → Lonely"
              accentColor="rose"
            />
            <MetricCard
              label="False Negatives"
              value={bestModelSummary.FN}
              delta="Lonely → Non-lonely"
              accentColor="blue"
            />
            <MetricCard
              label="Error Rate"
              value={`${(bestModelSummary.error_rate * 100).toFixed(2)}%`}
              accentColor="cyan"
            />
          </div>
        )}
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
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip {...TOOLTIP_STYLE} />
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
          {summary.qualitative_patterns.observations.map((observation, idx) => (
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
      {errorDetail && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Error Examples
            </h3>
            <Select value={selectedModel || ''} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {errorKeys.map((key) => (
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
                False Positives ({errorDetail.false_positives.length})
              </h4>
              {detailLoading ? (
                <LoadingState message="Loading examples..." />
              ) : (
                <div className="space-y-3">
                  {errorDetail.false_positives.slice(0, 3).map((example) => (
                    <ErrorExampleCard key={example.unique_id} example={example} type="fp" />
                  ))}
                </div>
              )}
            </div>

            {/* False Negatives */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[oklch(0.65_0.18_250)]">
                False Negatives ({errorDetail.false_negatives.length})
              </h4>
              {detailLoading ? (
                <LoadingState message="Loading examples..." />
              ) : (
                <div className="space-y-3">
                  {errorDetail.false_negatives.slice(0, 3).map((example) => (
                    <ErrorExampleCard key={example.unique_id} example={example} type="fn" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default function ErrorAnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Error Analysis"
        subtitle="RQ5: Qualitative inspection of model misclassifications"
      />

      <div className="flex-1 p-6 space-y-8">
        <ErrorAnalysisContent />
      </div>
    </div>
  )
}
