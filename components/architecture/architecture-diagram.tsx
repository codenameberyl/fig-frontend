"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, User, Monitor, Server, Cpu, Database, BarChart2 } from "lucide-react"

const architectureSteps = [
  {
    title: "User",
    description: "Research interface",
    icon: User,
    color: "bg-slate-500",
  },
  {
    title: "Frontend",
    description: "Next.js + React",
    icon: Monitor,
    color: "bg-blue-500",
  },
  {
    title: "Django API",
    description: "REST Framework",
    icon: Server,
    color: "bg-emerald-500",
  },
  {
    title: "ML Pipeline",
    description: "NLP Processing",
    icon: Cpu,
    color: "bg-indigo-500",
  },
  {
    title: "Results",
    description: "Predictions & Insights",
    icon: BarChart2,
    color: "bg-primary",
  },
]

export function ArchitectureDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Architecture</CardTitle>
        <CardDescription>
          End-to-end data flow from user interaction to model inference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
          {architectureSteps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-16 items-center justify-center rounded-2xl ${step.color} text-white shadow-lg transition-transform hover:scale-105`}
                >
                  <step.icon className="size-8" />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < architectureSteps.length - 1 && (
                <ArrowRight className="hidden size-6 text-muted-foreground lg:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 font-semibold text-foreground">Data Flow Overview</h4>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">1. User Input:</span> Text submitted via the React frontend interface
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">2. API Request:</span> REST API call to Django backend with text payload
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">3. Preprocessing:</span> Text cleaning, tokenization, and feature extraction
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">4. Model Inference:</span> BERT transformer or classical ML prediction
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">5. Post-processing:</span> Confidence scores and feature analysis
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">6. Response:</span> JSON response with prediction, metrics, and highlights
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
