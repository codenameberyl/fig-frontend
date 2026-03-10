"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const accuracyData = [
  { model: "Log. Reg.", accuracy: 84.2, fill: "#94a3b8" },
  { model: "SVM", accuracy: 85.6, fill: "#94a3b8" },
  { model: "Random Forest", accuracy: 87.1, fill: "#94a3b8" },
  { model: "BERT", accuracy: 89.4, fill: "#6366f1" },
]

export function AccuracyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy Comparison</CardTitle>
        <CardDescription>
          Test set accuracy across models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            accuracy: { label: "Accuracy", color: "#6366f1" },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 95]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]}>
                {accuracyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
