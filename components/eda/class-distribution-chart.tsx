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
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClassDistribution } from '@/lib/types'

interface ClassDistributionChartProps {
  data: ClassDistribution
}

const LONELY_COLOR = '#f43f5e'
const NON_LONELY_COLOR = '#4C9BE8'

// Tooltip style per spec
const tooltipStyle = {
  backgroundColor: '#1e1e2e',
  border: '1px solid #2e2e3e',
  borderRadius: '8px',
}
const labelStyle = { color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }
const itemStyle = { color: '#ffffff' }

export function ClassDistributionChart({ data }: ClassDistributionChartProps) {
  const chartData = [
    {
      split: 'Train',
      Lonely: data.train.lonely,
      'Non-Lonely': data.train.non_lonely,
      lonelyPct: data.train.lonely_pct,
    },
    {
      split: 'Validation',
      Lonely: data.validation.lonely,
      'Non-Lonely': data.validation.non_lonely,
      lonelyPct: data.validation.lonely_pct,
    },
    {
      split: 'Test',
      Lonely: data.test.lonely,
      'Non-Lonely': data.test.non_lonely,
      lonelyPct: data.test.lonely_pct,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Class Distribution by Split</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="split"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
                formatter={(value: any, name: any, item: any) => {
                  if (typeof value !== 'number') return value
                  const total = item.payload.Lonely + item.payload['Non-Lonely']
                  const pct = ((value / total) * 100).toFixed(1)
                  return [`${value.toLocaleString()} (${pct}%)`, name]
                }}
              />
              <Legend />
              <Bar 
                dataKey="Non-Lonely" 
                fill={NON_LONELY_COLOR} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey="Non-Lonely" 
                  position="top" 
                  fill="var(--muted-foreground)" 
                  fontSize={11}
                  formatter={(v: number) => v.toLocaleString()}
                />
              </Bar>
              <Bar 
                dataKey="Lonely" 
                fill={LONELY_COLOR} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList 
                  dataKey="Lonely" 
                  position="top" 
                  fill="var(--muted-foreground)" 
                  fontSize={11}
                  formatter={(v: number) => v.toLocaleString()}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
