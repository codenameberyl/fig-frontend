'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModelResult } from '@/lib/types'

interface RepresentationComparisonProps {
  data: ModelResult[]
}

const COLORS = {
  accuracy: 'oklch(0.55 0.25 285)',
  precision: 'oklch(0.7 0.15 195)',
  recall: 'oklch(0.65 0.2 15)',
  f1: 'oklch(0.65 0.18 250)',
}

export function RepresentationComparison({ data }: RepresentationComparisonProps) {
  const chartData = data.map((item) => ({
    name: item.representation
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    Accuracy: item.accuracy ?? 0,
    F1: item.f1,
    'ROC-AUC': item.roc_auc ?? 0,
    model: item.model,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Best Model per Representation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                domain={[0, 1]}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any, name: any) => [
                  typeof value === 'number' ? value.toFixed(3) : value,
                  name,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload?.[0]?.payload?.model) {
                    return `${label} (${payload[0].payload.model})`
                  }
                  return label
                }}
              />
              <Legend />
              <Bar dataKey="Accuracy" fill={COLORS.accuracy} radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill={COLORS.f1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="ROC-AUC" fill={COLORS.recall} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
