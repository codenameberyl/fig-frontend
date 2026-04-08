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

interface CoefficientChartProps {
  lonelyIndicators: { feature: string; coefficient: number }[]
  nonLonelyIndicators: { feature: string; coefficient: number }[]
}

const LONELY_COLOR = 'oklch(0.65 0.2 15)'
const NON_LONELY_COLOR = 'oklch(0.65 0.18 250)'

function SingleCoefficientChart({
  data,
  title,
  color,
}: {
  data: CoefficientEntry[]
  title: string
  color: string
}) {
  const chartData = data.slice(0, 25).map((item) => ({
    feature: item.feature.length > 20 ? item.feature.slice(0, 20) + '...' : item.feature,
    fullFeature: item.feature,
    coefficient: Math.abs(item.coefficient),
    rawCoefficient: item.coefficient,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
                fontSize={10}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number, name: string, props) => [
                  props.payload.rawCoefficient.toFixed(4),
                  'Coefficient',
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullFeature || label
                }
              />
              <Bar
                dataKey="coefficient"
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

export function CoefficientChart({
  lonelyIndicators,
  nonLonelyIndicators,
}: CoefficientChartProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SingleCoefficientChart
        data={nonLonelyIndicators}
        title="Non-Lonely Indicators (Negative Coefficients)"
        color={NON_LONELY_COLOR}
      />
      <SingleCoefficientChart
        data={lonelyIndicators}
        title="Lonely Indicators (Positive Coefficients)"
        color={LONELY_COLOR}
      />
    </div>
  )
}
