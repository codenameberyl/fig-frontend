'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NGrams, NGramEntry } from '@/lib/types'

interface NGramChartProps {
  ngramData: NGrams
  ngramType: 'unigrams' | 'bigrams'
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

function SingleNGramChart({
  data,
  title,
  color,
}: {
  data: NGramEntry[]
  title: string
  color: string
}) {
  const chartData = data.slice(0, 20).map((item) => ({
    term: item.term,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium" style={{ color }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="term"
                stroke="var(--muted-foreground)"
                fontSize={11}
                width={70}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
              />
              <Bar
                dataKey="count"
                fill={color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function NGramChart({ ngramData, ngramType }: NGramChartProps) {
  const lonelyData = ngramType === 'unigrams' ? ngramData.lonely_unigrams : ngramData.lonely_bigrams
  const nonLonelyData = ngramType === 'unigrams' ? ngramData.non_lonely_unigrams : ngramData.non_lonely_bigrams
  const title = ngramType === 'unigrams' ? 'Top 20 Unigrams' : 'Top 20 Bigrams'
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SingleNGramChart
          data={nonLonelyData}
          title="Non-Lonely Posts"
          color={NON_LONELY_COLOR}
        />
        <SingleNGramChart
          data={lonelyData}
          title="Lonely Posts"
          color={LONELY_COLOR}
        />
      </div>
    </div>
  )
}
