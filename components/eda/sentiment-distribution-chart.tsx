"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const sentimentData = [
  { sentiment: -1.0, lonely: 120, nonLonely: 15 },
  { sentiment: -0.8, lonely: 280, nonLonely: 45 },
  { sentiment: -0.6, lonely: 520, nonLonely: 95 },
  { sentiment: -0.4, lonely: 890, nonLonely: 210 },
  { sentiment: -0.2, lonely: 1150, nonLonely: 480 },
  { sentiment: 0.0, lonely: 980, nonLonely: 890 },
  { sentiment: 0.2, lonely: 540, nonLonely: 1420 },
  { sentiment: 0.4, lonely: 280, nonLonely: 1890 },
  { sentiment: 0.6, lonely: 110, nonLonely: 1650 },
  { sentiment: 0.8, lonely: 32, nonLonely: 980 },
  { sentiment: 1.0, lonely: 6, nonLonely: 264 },
]

export function SentimentDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>
          Overlapping density curves showing sentiment polarity by class
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
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="sentiment" 
                tick={{ fontSize: 12 }}
                label={{ value: "Sentiment Polarity", position: "bottom", offset: -5 }}
              />
              <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="lonely"
                name="Lonely"
                stroke="#f472b6"
                fill="#f472b6"
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="nonLonely"
                name="Non-Lonely"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
