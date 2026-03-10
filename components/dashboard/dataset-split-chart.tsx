"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const splitData = [
  { name: "Training", value: 8993, percentage: 70 },
  { name: "Validation", value: 1927, percentage: 15 },
  { name: "Test", value: 1927, percentage: 15 },
]

const COLORS = ["#6366f1", "#22d3ee", "#a78bfa"]

export function DatasetSplitChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Split Distribution</CardTitle>
        <CardDescription>
          Train / Validation / Test proportions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Training: { label: "Training", color: COLORS[0] },
            Validation: { label: "Validation", color: COLORS[1] },
            Test: { label: "Test", color: COLORS[2] },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={splitData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {splitData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
