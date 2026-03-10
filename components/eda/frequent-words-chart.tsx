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

const lonelyWords = [
  { word: "alone", count: 2847 },
  { word: "lonely", count: 2156 },
  { word: "nobody", count: 1823 },
  { word: "feel", count: 1654 },
  { word: "anyone", count: 1432 },
  { word: "sad", count: 1287 },
  { word: "empty", count: 1156 },
  { word: "isolated", count: 987 },
]

const nonLonelyWords = [
  { word: "friends", count: 3214 },
  { word: "great", count: 2876 },
  { word: "love", count: 2543 },
  { word: "happy", count: 2321 },
  { word: "together", count: 1987 },
  { word: "fun", count: 1765 },
  { word: "family", count: 1654 },
  { word: "wonderful", count: 1432 },
]

export function FrequentWordsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Frequent Words by Class</CardTitle>
        <CardDescription>
          Top words appearing in lonely vs non-lonely posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-medium text-pink-500">Lonely Posts</h4>
            <ChartContainer
              config={{
                count: { label: "Count", color: "#f472b6" },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lonelyWords} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="word" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="Count" fill="#f472b6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-medium text-cyan-500">Non-Lonely Posts</h4>
            <ChartContainer
              config={{
                count: { label: "Count", color: "#22d3ee" },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nonLonelyWords} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="word" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="Count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
