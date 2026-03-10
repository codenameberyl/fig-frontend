"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ModelComparisonTable } from "@/components/models/model-comparison-table"
import { AccuracyChart } from "@/components/models/accuracy-chart"
import { F1ScoreChart } from "@/components/models/f1-score-chart"
import { ROCCurveChart } from "@/components/models/roc-curve-chart"
import { ConfusionMatrices } from "@/components/models/confusion-matrices"
import { FeatureImportance } from "@/components/models/feature-importance"

export default function ModelsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Model Performance
          </h2>
          <p className="text-muted-foreground">
            Compare classifier performance metrics and visualizations
          </p>
        </div>

        <ModelComparisonTable />

        <div className="grid gap-6 lg:grid-cols-2">
          <AccuracyChart />
          <F1ScoreChart />
        </div>

        <ROCCurveChart />

        <ConfusionMatrices />

        <FeatureImportance />
      </div>
    </DashboardLayout>
  )
}
