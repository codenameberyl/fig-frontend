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

const f1Data = [
  { model: "Log. Reg.", f1: 0.838, fill: "#94a3b8" },
  { model: "SVM", f1: 0.852, fill: "#94a3b8" },
  { model: "Random Forest", f1: 0.868, fill: "#94a3b8" },
  { model: "BERT", f1: 0.891, fill: "#22d3ee" },
]

export function F1ScoreChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>F1 Score Comparison</CardTitle>
        <CardDescription>
          F1 score on test set by model
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            f1: { label: "F1 Score", color: "#22d3ee" },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={f1Data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} />
              <YAxis domain={[0.8, 1.0]} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="f1" name="F1 Score" radius={[4, 4, 0, 0]}>
                {f1Data.map((entry, index) => (
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
