'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LengthStats, DescStats } from '@/lib/types'

interface LengthStatsPanelProps {
  data: LengthStats
}

interface FeatureStats {
  non_lonely: DescStats
  lonely: DescStats
}

function StatsTable({ 
  title, 
  stats 
}: { 
  title: string
  stats: FeatureStats 
}) {
  const rows = [
    { label: 'Mean', lonely: stats.lonely.mean, nonLonely: stats.non_lonely.mean },
    { label: 'Median', lonely: stats.lonely.median, nonLonely: stats.non_lonely.median },
    { label: 'Std Dev', lonely: stats.lonely.std, nonLonely: stats.non_lonely.std },
    { label: 'Q25–Q75', lonely: `${stats.lonely.q25.toFixed(0)}–${stats.lonely.q75.toFixed(0)}`, nonLonely: `${stats.non_lonely.q25.toFixed(0)}–${stats.non_lonely.q75.toFixed(0)}`, isRange: true },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left font-medium text-muted-foreground px-4 py-2">Stat</th>
              <th className="text-right font-medium px-4 py-2 text-[#4C9BE8]">Non-Lonely</th>
              <th className="text-right font-medium px-4 py-2 text-[#f43f5e]">Lonely</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 text-muted-foreground">{row.label}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {row.isRange ? row.nonLonely : typeof row.nonLonely === 'number' ? row.nonLonely.toFixed(1) : row.nonLonely}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {row.isRange ? row.lonely : typeof row.lonely === 'number' ? row.lonely.toFixed(1) : row.lonely}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export function LengthStatsPanel({ data }: LengthStatsPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsTable title="Word Count" stats={data.word_count} />
      <StatsTable title="Character Count" stats={data.char_count} />
      <StatsTable title="Sentence Count" stats={data.sentence_count} />
    </div>
  )
}
