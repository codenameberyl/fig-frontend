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

const classData = [
  { name: "Lonely", count: 4908, fill: "#f472b6" },
  { name: "Non-Lonely", count: 7939, fill: "#22d3ee" },
]

export function ClassBalanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Distribution</CardTitle>
        <CardDescription>
          Lonely vs Non-Lonely post counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Lonely: { label: "Lonely", color: "#f472b6" },
            "Non-Lonely": { label: "Non-Lonely", color: "#22d3ee" },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={40}>
                {classData.map((entry, index) => (
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
