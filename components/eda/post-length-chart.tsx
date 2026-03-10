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

const postLengthData = [
  { range: "0-50", lonely: 412, nonLonely: 892 },
  { range: "51-100", lonely: 823, nonLonely: 1456 },
  { range: "101-150", lonely: 1156, nonLonely: 1723 },
  { range: "151-200", lonely: 1043, nonLonely: 1312 },
  { range: "201-250", lonely: 756, nonLonely: 834 },
  { range: "251-300", lonely: 432, nonLonely: 523 },
  { range: "300+", lonely: 286, nonLonely: 199 },
]

export function PostLengthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Length by Class</CardTitle>
        <CardDescription>
          Word count distribution for lonely vs non-lonely posts
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
            <BarChart data={postLengthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
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
