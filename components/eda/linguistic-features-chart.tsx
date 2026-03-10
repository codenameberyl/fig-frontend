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

const featureData = [
  { feature: "First Person Ratio", lonely: 0.42, nonLonely: 0.28 },
  { feature: "Social Word Ratio", lonely: 0.18, nonLonely: 0.35 },
  { feature: "Question Marks", lonely: 0.15, nonLonely: 0.08 },
  { feature: "Avg Sentence Len", lonely: 0.72, nonLonely: 0.58 },
  { feature: "Sentiment Polarity", lonely: -0.32, nonLonely: 0.45 },
]

export function LinguisticFeaturesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linguistic Feature Comparison</CardTitle>
        <CardDescription>
          Normalized feature values by class
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
            <BarChart data={featureData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="feature" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[-0.5, 1]} />
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
