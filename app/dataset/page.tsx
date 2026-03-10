"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SplitSummaryTable } from "@/components/dataset/split-summary-table"
import { SampleViewer } from "@/components/dataset/sample-viewer"
import { LabelDistributionChart } from "@/components/dataset/label-distribution-chart"
import { TextLengthChart } from "@/components/dataset/text-length-chart"

export default function DatasetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Dataset Explorer
          </h2>
          <p className="text-muted-foreground">
            Inspect and explore the dataset structure and samples
          </p>
        </div>

        <SplitSummaryTable />

        <SampleViewer />

        <div className="grid gap-6 lg:grid-cols-2">
          <LabelDistributionChart />
          <TextLengthChart />
        </div>
      </div>
    </DashboardLayout>
  )
}
