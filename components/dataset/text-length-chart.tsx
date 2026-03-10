"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const lengthData = [
  { range: "0-50", count: 1284 },
  { range: "51-100", count: 2847 },
  { range: "101-150", count: 3156 },
  { range: "151-200", count: 2543 },
  { range: "201-250", count: 1678 },
  { range: "251-300", count: 892 },
  { range: "300+", count: 447 },
]

export function TextLengthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Length Distribution</CardTitle>
        <CardDescription>
          Histogram of word counts across all samples
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: { label: "Sample Count", color: "#6366f1" },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lengthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" label={{ value: "Word Count Range", position: "bottom", offset: -5 }} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" name="Samples" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
