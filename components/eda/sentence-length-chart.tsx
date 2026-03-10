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

const sentenceLengthData = [
  { metric: "Avg Words/Sentence", lonely: 18.4, nonLonely: 15.2 },
  { metric: "Avg Sentences/Post", lonely: 6.8, nonLonely: 5.4 },
  { metric: "Max Sentence Length", lonely: 42.1, nonLonely: 38.7 },
]

export function SentenceLengthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Sentence Length</CardTitle>
        <CardDescription>
          Sentence-level statistics comparison between classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            lonely: { label: "Lonely", color: "#f472b6" },
            nonLonely: { label: "Non-Lonely", color: "#22d3ee" },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentenceLengthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="metric" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="lonely" name="Lonely" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="nonLonely" name="Non-Lonely" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
