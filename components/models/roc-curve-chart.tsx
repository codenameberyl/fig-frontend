"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Generate ROC curve points for each model
const rocData = Array.from({ length: 101 }, (_, i) => {
  const fpr = i / 100
  return {
    fpr,
    logReg: Math.min(1, Math.pow(fpr, 0.65) * 1.2),
    svm: Math.min(1, Math.pow(fpr, 0.6) * 1.25),
    rf: Math.min(1, Math.pow(fpr, 0.55) * 1.3),
    bert: Math.min(1, Math.pow(fpr, 0.5) * 1.35),
    random: fpr,
  }
})

export function ROCCurveChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROC Curves</CardTitle>
        <CardDescription>
          Receiver Operating Characteristic curves for all models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            logReg: { label: "Logistic Regression (AUC: 0.91)", color: "#94a3b8" },
            svm: { label: "SVM (AUC: 0.92)", color: "#a78bfa" },
            rf: { label: "Random Forest (AUC: 0.94)", color: "#22d3ee" },
            bert: { label: "BERT (AUC: 0.96)", color: "#6366f1" },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fpr" 
                label={{ value: "False Positive Rate", position: "bottom", offset: -5 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis 
                label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                domain={[0, 1]}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine 
                stroke="#475569" 
                strokeDasharray="5 5"
                segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
              />
              <Line
                type="monotone"
                dataKey="random"
                name="Random (AUC: 0.50)"
                stroke="#475569"
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="logReg"
                name="Log. Reg. (AUC: 0.91)"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="svm"
                name="SVM (AUC: 0.92)"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rf"
                name="RF (AUC: 0.94)"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="bert"
                name="BERT (AUC: 0.96)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
