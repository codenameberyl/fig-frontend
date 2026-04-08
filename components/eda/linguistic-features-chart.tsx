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
import { Badge } from '@/components/ui/badge'
import type { LinguisticStats } from '@/lib/types'

interface LinguisticFeaturesChartProps {
  data: LinguisticStats
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

export function LinguisticFeaturesChart({ data }: LinguisticFeaturesChartProps) {
  // Transform API response to chart format
  const chartData = Object.entries(data).map(([feature, stats]) => {
    const lonelyMean = stats.lonely.mean
    const nonLonelyMean = stats.non_lonely.mean
    const diff = lonelyMean - nonLonelyMean
    
    return {
      feature: feature
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      featureKey: feature,
      Lonely: lonelyMean,
      'Non-Lonely': nonLonelyMean,
      diff,
      diffLabel: diff > 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3),
      diffDirection: diff > 0 ? 'up' : 'down',
    }
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linguistic Feature Comparison (Mean Values)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={130}
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
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="Lonely"
                  fill={LONELY_COLOR}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Difference Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Lonely vs Non-Lonely Difference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {chartData.map((item) => (
              <Badge 
                key={item.featureKey}
                variant="outline"
                className={`font-mono text-xs ${
                  item.diffDirection === 'up' 
                    ? 'border-[#f43f5e]/50 text-[#f43f5e]' 
                    : 'border-[#4C9BE8]/50 text-[#4C9BE8]'
                }`}
              >
                {item.feature}: {item.diffDirection === 'up' ? '▲' : '▼'} {item.diffLabel}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
