'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InterpretabilitySummaryItem } from '@/lib/types'

interface TradeoffScatterProps {
  data: InterpretabilitySummaryItem[]
}

const COLORS = [
  'oklch(0.55 0.25 285)', // violet - linguistic
  'oklch(0.7 0.15 195)',  // cyan - tfidf
  'oklch(0.65 0.2 15)',   // rose - tfidf_linguistic
  'oklch(0.65 0.18 250)', // blue - word2vec
  'oklch(0.75 0.12 85)',  // yellow - sbert
  'oklch(0.6 0.2 330)',   // magenta - distilbert
]

export function TradeoffScatter({ data }: TradeoffScatterProps) {
  const chartData = data.map((item, idx) => ({
    x: item.interpretability_score,
    y: item.best_f1,
    name: item.representation
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    cost: item.computational_cost,
    color: COLORS[idx % COLORS.length],
  }))

  const maxF1 = Math.max(...data.map((d) => d.best_f1))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Interpretability vs Performance Trade-off
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0.5, 5.5]}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(0)}
              >
                <Label
                  value="Interpretability Score"
                  position="insideBottom"
                  offset={-20}
                  style={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                domain={[0.6, 1]}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(2)}
              >
                <Label
                  value="Best F1 Score"
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number, name: string) => [
                  value.toFixed(3),
                  name === 'y' ? 'F1 Score' : 'Interpretability',
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.name || ''
                }
              />
              {/* High interpretability zone */}
              <ReferenceLine
                x={3.5}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                label={{
                  value: 'High Interpretability Zone',
                  position: 'top',
                  style: { fill: 'var(--muted-foreground)', fontSize: 10 },
                }}
              />
              {/* Best F1 reference */}
              <ReferenceLine
                y={maxF1}
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
              />
              <Scatter data={chartData} shape="circle">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    r={8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
