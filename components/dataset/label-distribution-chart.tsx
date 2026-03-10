"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const labelData = [
  { split: "Train", lonely: 3437, nonLonely: 5556 },
  { split: "Validation", lonely: 736, nonLonely: 1191 },
  { split: "Test", lonely: 735, nonLonely: 1192 },
]

export function LabelDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Label Distribution by Split</CardTitle>
        <CardDescription>
          Class counts across training, validation, and test sets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            lonely: { label: "Lonely", color: "#f472b6" },
            nonLonely: { label: "Non-Lonely", color: "#22d3ee" },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={labelData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="split" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="lonely" name="Lonely" fill="#f472b6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nonLonely" name="Non-Lonely" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
