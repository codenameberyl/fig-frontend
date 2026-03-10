"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DatasetSplitChart } from "@/components/dashboard/dataset-split-chart"
import { ClassBalanceChart } from "@/components/dashboard/class-balance-chart"
import { ProjectSummary } from "@/components/dashboard/project-summary"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            High-level summary of the loneliness detection research project
          </p>
        </div>

        <KPICards />

        <div className="grid gap-6 lg:grid-cols-2">
          <DatasetSplitChart />
          <ClassBalanceChart />
        </div>

        <ProjectSummary />
      </div>
    </DashboardLayout>
  )
}
