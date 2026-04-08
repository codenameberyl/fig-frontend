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
import type { PosDistribution } from '@/lib/types'

interface PosDistributionChartProps {
  data: PosDistribution
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

// POS tags to display
const POS_TAGS = ['NOUN', 'VERB', 'PRON', 'ADP', 'AUX', 'ADJ', 'ADV', 'DET', 'CCONJ', 'PART']

export function PosDistributionChart({ data }: PosDistributionChartProps) {
  // Transform API response to chart data
  const chartData = POS_TAGS
    .filter(tag => tag in data.lonely || tag in data.non_lonely)
    .map((tag) => ({
      pos: tag,
      Lonely: data.lonely[tag] ?? 0,
      'Non-Lonely': data.non_lonely[tag] ?? 0,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POS Tag Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="pos"
                stroke="var(--muted-foreground)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
                formatter={(value: number) => value.toFixed(4)}
              />
              <Legend />
              <Bar
                dataKey="Non-Lonely"
                fill={NON_LONELY_COLOR}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Lonely"
                fill={LONELY_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
