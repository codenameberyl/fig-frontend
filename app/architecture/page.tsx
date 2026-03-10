"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram"
import { StackOverview } from "@/components/architecture/stack-overview"

export default function ArchitecturePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            System Architecture
          </h2>
          <p className="text-muted-foreground">
            Technical overview of the research platform infrastructure
          </p>
        </div>

        <ArchitectureDiagram />

        <StackOverview />
      </div>
    </DashboardLayout>
  )
}
