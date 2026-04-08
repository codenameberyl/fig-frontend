'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ModelResult } from '@/lib/types'

interface ModelComparisonTableProps {
  results: ModelResult[]
  bestF1: number
  showTestMetrics?: boolean
}

type SortKey = 'representation' | 'model' | 'accuracy' | 'precision' | 'recall' | 'f1' | 'roc_auc'
type SortDirection = 'asc' | 'desc'

export function ModelComparisonTable({
  results,
  bestF1,
  showTestMetrics = false,
}: ModelComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('f1')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    let aVal: string | number | undefined
    let bVal: string | number | undefined

    if (showTestMetrics) {
      aVal = sortKey === 'representation' ? a.representation
        : sortKey === 'model' ? a.model
        : sortKey === 'accuracy' ? a.test_accuracy
        : sortKey === 'precision' ? a.test_precision
        : sortKey === 'recall' ? a.test_recall
        : sortKey === 'f1' ? a.test_f1
        : a.test_roc_auc

      bVal = sortKey === 'representation' ? b.representation
        : sortKey === 'model' ? b.model
        : sortKey === 'accuracy' ? b.test_accuracy
        : sortKey === 'precision' ? b.test_precision
        : sortKey === 'recall' ? b.test_recall
        : sortKey === 'f1' ? b.test_f1
        : b.test_roc_auc
    } else {
      aVal = sortKey === 'representation' ? a.representation
        : sortKey === 'model' ? a.model
        : a[sortKey]

      bVal = sortKey === 'representation' ? b.representation
        : sortKey === 'model' ? b.model
        : b[sortKey]
    }

    if (aVal === undefined) return 1
    if (bVal === undefined) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(column)}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  const formatMetric = (value: number | undefined) => {
    if (value === undefined) return '-'
    return value.toFixed(3)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">All Model Results</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-medium px-4 py-3">
                  <SortButton column="representation" label="Representation" />
                </th>
                <th className="text-left font-medium px-4 py-3">
                  <SortButton column="model" label="Model" />
                </th>
                <th className="text-right font-medium px-4 py-3">
                  <SortButton column="accuracy" label="Accuracy" />
                </th>
                <th className="text-right font-medium px-4 py-3">
                  <SortButton column="precision" label="Precision" />
                </th>
                <th className="text-right font-medium px-4 py-3">
                  <SortButton column="recall" label="Recall" />
                </th>
                <th className="text-right font-medium px-4 py-3">
                  <SortButton column="f1" label="F1" />
                </th>
                <th className="text-right font-medium px-4 py-3">
                  <SortButton column="roc_auc" label="ROC-AUC" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => {
                const f1 = showTestMetrics ? result.test_f1 : result.f1
                const isBest = f1 === bestF1
                const modelKey = `${result.representation}_${result.model.toLowerCase().replace(/ /g, '_')}`

                return (
                  <tr
                    key={modelKey}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-muted/50',
                      isBest && 'bg-primary/5 hover:bg-primary/10'
                    )}
                  >
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {result.representation}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/models/${modelKey}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        {isBest && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {result.model}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatMetric(showTestMetrics ? result.test_accuracy : result.accuracy)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatMetric(showTestMetrics ? result.test_precision : result.precision)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatMetric(showTestMetrics ? result.test_recall : result.recall)}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-mono tabular-nums font-semibold',
                      isBest && 'text-primary'
                    )}>
                      {formatMetric(f1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatMetric(showTestMetrics ? result.test_roc_auc : result.roc_auc)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
