"use client"

import {
  Database,
  Heart,
  HeartOff,
  Target,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const kpiData = [
  {
    title: "Total Samples",
    value: "12,847",
    description: "Reddit posts analyzed",
    icon: Database,
    trend: null,
  },
  {
    title: "Lonely Posts",
    value: "38.2%",
    description: "4,908 samples",
    icon: Heart,
    trend: null,
  },
  {
    title: "Non-Lonely Posts",
    value: "61.8%",
    description: "7,939 samples",
    icon: HeartOff,
    trend: null,
  },
  {
    title: "Best Model Accuracy",
    value: "89.4%",
    description: "BERT Transformer",
    icon: Target,
    trend: "+2.3%",
  },
  {
    title: "Best Model F1 Score",
    value: "0.872",
    description: "BERT Transformer",
    icon: TrendingUp,
    trend: "+0.04",
  },
]

export function KPICards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpiData.map((kpi) => (
        <Card key={kpi.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
            {kpi.trend && (
              <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {kpi.trend}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
