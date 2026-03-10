"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { User, Users, HelpCircle, BarChart2 } from "lucide-react"

interface LinguisticBreakdownProps {
  features: {
    firstPerson: number
    socialRefs: number
    questions: number
    complexity: number
  }
}

export function LinguisticBreakdown({ features }: LinguisticBreakdownProps) {
  const featureItems = [
    {
      label: "First-Person Usage",
      value: features.firstPerson,
      description: "Frequency of I, me, my, myself",
      icon: User,
      color: "#f472b6",
    },
    {
      label: "Social References",
      value: features.socialRefs,
      description: "Mentions of people and relationships",
      icon: Users,
      color: "#22d3ee",
    },
    {
      label: "Question Frequency",
      value: features.questions,
      description: "Occurrence of question marks",
      icon: HelpCircle,
      color: "#a78bfa",
    },
    {
      label: "Text Complexity",
      value: features.complexity,
      description: "Based on word count and structure",
      icon: BarChart2,
      color: "#6366f1",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linguistic Feature Breakdown</CardTitle>
        <CardDescription>Key linguistic indicators extracted from the text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {featureItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="size-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="font-mono text-sm" style={{ color: item.color }}>
                    {(item.value * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Progress
              value={item.value * 100}
              className="h-2"
              style={{ ["--progress-color" as string]: item.color }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
