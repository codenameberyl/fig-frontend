'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ComposedChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RocPoint } from '@/lib/types'

interface ROCCurveChartProps {
  points: RocPoint[]
  auc: number
  optimalThreshold?: number
  optimalFpr?: number
  optimalTpr?: number
}

export function ROCCurveChart({
  points,
  auc,
  optimalThreshold,
  optimalFpr,
  optimalTpr,
}: ROCCurveChartProps) {
  const chartData = points.map((p) => ({
    fpr: p.fpr,
    tpr: p.tpr,
    threshold: p.threshold,
  }))

  // Add diagonal reference line data
  const diagonalData = [
    { fpr: 0, tpr: 0 },
    { fpr: 1, tpr: 1 },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ROC Curve</CardTitle>
        <Badge variant="outline" className="font-mono">
          AUC = {auc.toFixed(3)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="fpr"
                domain={[0, 1]}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(1)}
                label={{
                  value: 'False Positive Rate',
                  position: 'insideBottom',
                  offset: -10,
                  style: { fill: 'var(--muted-foreground)', fontSize: 11 },
                }}
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(1)}
                label={{
                  value: 'True Positive Rate',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: 'var(--muted-foreground)', fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any, name: any) => [
                  typeof value === 'number' ? value.toFixed(3) : String(value),
                  name === 'tpr' ? 'TPR' : name === 'fpr' ? 'FPR' : 'Threshold',
                ]}
              />
              {/* Diagonal reference line */}
              <Line
                data={diagonalData}
                type="linear"
                dataKey="tpr"
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              {/* ROC Curve */}
              <Line
                data={chartData}
                type="monotone"
                dataKey="tpr"
                stroke="oklch(0.55 0.25 285)"
                strokeWidth={2}
                dot={false}
              />
              {/* Optimal point */}
              {optimalFpr !== undefined && optimalTpr !== undefined && (
                <Scatter
                  data={[{ fpr: optimalFpr, tpr: optimalTpr }]}
                  fill="oklch(0.65 0.2 15)"
                  shape="circle"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {optimalThreshold !== undefined && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
            <span className="text-sm text-muted-foreground">
              Optimal Threshold:{' '}
              <span className="font-mono font-semibold text-foreground">
                {optimalThreshold.toFixed(3)}
              </span>
              {optimalFpr !== undefined && optimalTpr !== undefined && (
                <span className="text-muted-foreground">
                  {' '}(FPR: {optimalFpr.toFixed(3)}, TPR: {optimalTpr.toFixed(3)})
                </span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
