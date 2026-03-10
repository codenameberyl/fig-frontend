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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const logRegFeatures = [
  { feature: "first_person_ratio", importance: 0.342 },
  { feature: "social_word_count", importance: 0.287 },
  { feature: "sentiment_polarity", importance: 0.256 },
  { feature: "sentence_length", importance: 0.198 },
  { feature: "question_marks", importance: 0.176 },
  { feature: "negative_words", importance: 0.154 },
  { feature: "word_count", importance: 0.132 },
  { feature: "avg_word_length", importance: 0.098 },
]

const rfFeatures = [
  { feature: "sentiment_polarity", importance: 0.312 },
  { feature: "first_person_ratio", importance: 0.289 },
  { feature: "social_word_count", importance: 0.234 },
  { feature: "negative_words", importance: 0.198 },
  { feature: "sentence_length", importance: 0.167 },
  { feature: "word_count", importance: 0.145 },
  { feature: "question_marks", importance: 0.121 },
  { feature: "avg_word_length", importance: 0.089 },
]

function FeatureChart({ data }: { data: typeof logRegFeatures }) {
  return (
    <ChartContainer
      config={{
        importance: { label: "Importance", color: "#6366f1" },
      }}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 0.4]} />
          <YAxis dataKey="feature" type="category" width={140} tick={{ fontSize: 11 }} />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="importance" name="Importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function FeatureImportance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <CardDescription>
          Most important features for classical ML models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="logReg" className="w-full">
          <TabsList>
            <TabsTrigger value="logReg">Logistic Regression</TabsTrigger>
            <TabsTrigger value="rf">Random Forest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logReg" className="mt-4">
            <FeatureChart data={logRegFeatures} />
          </TabsContent>
          
          <TabsContent value="rf" className="mt-4">
            <FeatureChart data={rfFeatures} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
