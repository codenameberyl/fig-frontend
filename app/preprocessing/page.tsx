"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PipelineFlow } from "@/components/preprocessing/pipeline-flow"
import { TextTransformViewer } from "@/components/preprocessing/text-transform-viewer"

export default function PreprocessingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Preprocessing Pipeline
          </h2>
          <p className="text-muted-foreground">
            Visualize the text transformation stages in the NLP pipeline
          </p>
        </div>

        <PipelineFlow />

        <TextTransformViewer />
      </div>
    </DashboardLayout>
  )
}
