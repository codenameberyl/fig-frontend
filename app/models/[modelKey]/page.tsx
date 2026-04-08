'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { PlotImage } from '@/components/shared/plot-image'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { ConfusionMatrixDisplay } from '@/components/models/confusion-matrix-display'
import { ROCCurveChart } from '@/components/models/roc-curve-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFullReport } from '@/lib/api'
import type { TestReport, RocPoint } from '@/lib/types'

export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelKey: string }>
}) {
  const { modelKey } = use(params)
  const [testReport, setTestReport] = useState<TestReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const report = await getFullReport(modelKey)
        setTestReport(report)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch model details')
        setTestReport(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [modelKey])

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title={modelKey}
          subtitle="Model performance details and diagnostics"
        />
        <div className="flex-1 p-6">
          <ErrorState message={error} />
        </div>
      </div>
    )
  }

  if (loading || !testReport) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title={modelKey}
          subtitle="Model performance details and diagnostics"
        />
        <div className="flex-1 p-6">
          <LoadingState message="Loading model details..." />
        </div>
      </div>
    )
  }

  const { confusion_matrix, classification_report, roc_curve } = testReport

  // Convert ROC data for chart
  const rocPoints: RocPoint[] = roc_curve.fpr.map((fpr, idx) => ({
    fpr,
    tpr: roc_curve.tpr[idx],
    threshold: roc_curve.thresholds[idx],
  }))

  // Build classification report table data
  const classReportRows = [
    {
      label: 'Non-Lonely',
      precision: classification_report['Non-Lonely'].precision,
      recall: classification_report['Non-Lonely'].recall,
      f1_score: classification_report['Non-Lonely']['f1-score'],
      support: classification_report['Non-Lonely'].support,
    },
    {
      label: 'Lonely',
      precision: classification_report['Lonely'].precision,
      recall: classification_report['Lonely'].recall,
      f1_score: classification_report['Lonely']['f1-score'],
      support: classification_report['Lonely'].support,
    },
    {
      label: 'Macro Avg',
      precision: classification_report['macro avg'].precision,
      recall: classification_report['macro avg'].recall,
      f1_score: classification_report['macro avg']['f1-score'],
      support: classification_report['macro avg'].support,
    },
    {
      label: 'Weighted Avg',
      precision: classification_report['weighted avg'].precision,
      recall: classification_report['weighted avg'].recall,
      f1_score: classification_report['weighted avg']['f1-score'],
      support: classification_report['weighted avg'].support,
    },
  ]

  const metrics = {
    accuracy: confusion_matrix.accuracy,
    precision: classification_report['weighted avg'].precision,
    recall: classification_report['weighted avg'].recall,
    f1: classification_report['weighted avg']['f1-score'],
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={`${testReport.representation} / ${testReport.model}`}
        subtitle="Model performance details and diagnostics"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/models" className="hover:text-foreground transition-colors">
            Models
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">{modelKey}</span>
        </nav>

        {/* Metrics Summary */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Performance Metrics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Accuracy"
              value={metrics.accuracy.toFixed(3)}
              accentColor="violet"
            />
            <MetricCard
              label="Precision"
              value={metrics.precision.toFixed(3)}
              accentColor="cyan"
            />
            <MetricCard
              label="Recall"
              value={metrics.recall.toFixed(3)}
              accentColor="rose"
            />
            <MetricCard
              label="F1 Score"
              value={metrics.f1.toFixed(3)}
              accentColor="blue"
            />
          </div>
        </section>

        {/* Confusion Matrix & ROC Curve */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <ConfusionMatrixDisplay data={confusion_matrix} />
            <PlotImage
              section="models"
              plotName={`eval_confusion_${modelKey}.png`}
              alt="Confusion matrix plot"
              height={350}
            />
          </div>
          <div className="space-y-4">
            <ROCCurveChart
              points={rocPoints}
              auc={roc_curve.auc}
              optimalThreshold={roc_curve.optimal_threshold}
              optimalFpr={roc_curve.optimal_fpr}
              optimalTpr={roc_curve.optimal_tpr}
            />
            <PlotImage
              section="models"
              plotName={`eval_roc_${modelKey}.png`}
              alt="ROC curve plot"
              height={350}
            />
          </div>
        </section>

        {/* Classification Report */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classification Report</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Class
                      </th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">
                        Precision
                      </th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">
                        Recall
                      </th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">
                        F1-Score
                      </th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">
                        Support
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classReportRows.map((row, idx) => (
                      <tr
                        key={row.label}
                        className={`border-b border-border last:border-b-0 ${
                          idx >= 2 ? 'bg-muted/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {row.precision.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {row.recall.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {row.f1_score.toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                          {row.support}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
