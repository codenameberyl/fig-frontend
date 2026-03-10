"use client"

import { ArrowRight, FileText, Sparkles, SplitSquareHorizontal, BarChart2, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const pipelineSteps = [
  {
    title: "Raw Text",
    description: "Original user posts",
    icon: FileText,
    color: "bg-slate-500",
  },
  {
    title: "Cleaned Text",
    description: "Lowercase, URLs removed",
    icon: Sparkles,
    color: "bg-blue-500",
  },
  {
    title: "Tokenized",
    description: "Split into tokens",
    icon: SplitSquareHorizontal,
    color: "bg-cyan-500",
  },
  {
    title: "Features Extracted",
    description: "Linguistic signals",
    icon: BarChart2,
    color: "bg-indigo-500",
  },
  {
    title: "Model Ready",
    description: "TF-IDF vectors",
    icon: Cpu,
    color: "bg-primary",
  },
]

export function PipelineFlow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
        <CardDescription>
          Text transformation stages from raw input to model-ready features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          {pipelineSteps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-14 items-center justify-center rounded-xl ${step.color} text-white shadow-lg`}
                >
                  <step.icon className="size-6" />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < pipelineSteps.length - 1 && (
                <ArrowRight className="hidden size-6 text-muted-foreground lg:block" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
