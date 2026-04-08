'use client'

import { use } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { PlotImage } from '@/components/shared/plot-image'
import { ConfusionMatrixDisplay } from '@/components/models/confusion-matrix-display'
import { ROCCurveChart } from '@/components/models/roc-curve-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data - would come from API
const mockConfusionMatrix = {
  tn: 278,
  fp: 22,
  fn: 28,
  tp: 236,
  sensitivity: 0.894,
  specificity: 0.927,
}

const mockRocCurve = {
  auc: 0.967,
  points: Array.from({ length: 50 }, (_, i) => ({
    fpr: i / 49,
    tpr: Math.min(1, (i / 49) * 1.2 + Math.random() * 0.1),
    threshold: 1 - i / 49,
  })),
  optimal_threshold: 0.847,
  optimal_fpr: 0.073,
  optimal_tpr: 0.894,
}

const mockClassificationReport = [
  { label: 'Non-Lonely', precision: 0.908, recall: 0.927, f1_score: 0.917, support: 300 },
  { label: 'Lonely', precision: 0.915, recall: 0.894, f1_score: 0.904, support: 264 },
  { label: 'Macro Avg', precision: 0.911, recall: 0.910, f1_score: 0.911, support: 564 },
  { label: 'Weighted Avg', precision: 0.911, recall: 0.912, f1_score: 0.911, support: 564 },
]

const mockMetrics = {
  accuracy: 0.912,
  precision: 0.911,
  recall: 0.910,
  f1: 0.909,
}

export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelKey: string }>
}) {
  const { modelKey } = use(params)
  
  // Parse model key into representation and model name
  const parts = modelKey.split('_')
  const representation = parts.slice(0, -2).join('_') || parts[0]
  const model = parts.slice(-2).join(' ').replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={`${representation} / ${model}`}
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
              value={mockMetrics.accuracy.toFixed(3)}
              accentColor="violet"
            />
            <MetricCard
              label="Precision"
              value={mockMetrics.precision.toFixed(3)}
              accentColor="cyan"
            />
            <MetricCard
              label="Recall"
              value={mockMetrics.recall.toFixed(3)}
              accentColor="rose"
            />
            <MetricCard
              label="F1 Score"
              value={mockMetrics.f1.toFixed(3)}
              accentColor="blue"
            />
          </div>
        </section>

        {/* Confusion Matrix & ROC Curve */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <ConfusionMatrixDisplay data={mockConfusionMatrix} />
            <PlotImage
              section="models"
              plotName={`eval_confusion_${modelKey}.png`}
              alt="Confusion matrix plot"
              height={350}
            />
          </div>
          <div className="space-y-4">
            <ROCCurveChart
              points={mockRocCurve.points}
              auc={mockRocCurve.auc}
              optimalThreshold={mockRocCurve.optimal_threshold}
              optimalFpr={mockRocCurve.optimal_fpr}
              optimalTpr={mockRocCurve.optimal_tpr}
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
                    {mockClassificationReport.map((row, idx) => (
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
