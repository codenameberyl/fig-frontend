'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ConfusionMatrixData } from '@/lib/types'

interface ConfusionMatrixDisplayProps {
  data: ConfusionMatrixData
}

export function ConfusionMatrixDisplay({ data }: ConfusionMatrixDisplayProps) {
  const { tn, fp, fn, tp, sensitivity, specificity } = data

  const total = tn + fp + fn + tp
  const accuracy = ((tp + tn) / total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Confusion Matrix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matrix Grid */}
        <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
          {/* Header Row */}
          <div />
          <div className="text-center text-xs text-muted-foreground font-medium py-2">
            Pred: Non-Lonely
          </div>
          <div className="text-center text-xs text-muted-foreground font-medium py-2">
            Pred: Lonely
          </div>

          {/* TN / FP Row */}
          <div className="text-right text-xs text-muted-foreground font-medium pr-2 flex items-center justify-end">
            Actual: Non-Lonely
          </div>
          <div className="bg-[oklch(0.65_0.18_250)]/20 border border-[oklch(0.65_0.18_250)]/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-[oklch(0.65_0.18_250)]">
              {tn}
            </div>
            <div className="text-xs text-muted-foreground mt-1">TN</div>
          </div>
          <div className="bg-[oklch(0.65_0.2_15)]/20 border border-[oklch(0.65_0.2_15)]/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-[oklch(0.65_0.2_15)]">
              {fp}
            </div>
            <div className="text-xs text-muted-foreground mt-1">FP</div>
          </div>

          {/* FN / TP Row */}
          <div className="text-right text-xs text-muted-foreground font-medium pr-2 flex items-center justify-end">
            Actual: Lonely
          </div>
          <div className="bg-[oklch(0.65_0.2_15)]/20 border border-[oklch(0.65_0.2_15)]/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-[oklch(0.65_0.2_15)]">
              {fn}
            </div>
            <div className="text-xs text-muted-foreground mt-1">FN</div>
          </div>
          <div className="bg-[oklch(0.65_0.18_250)]/20 border border-[oklch(0.65_0.18_250)]/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-[oklch(0.65_0.18_250)]">
              {tp}
            </div>
            <div className="text-xs text-muted-foreground mt-1">TP</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold font-mono tabular-nums">
              {accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold font-mono tabular-nums">
              {(sensitivity * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Sensitivity</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-semibold font-mono tabular-nums">
              {(specificity * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Specificity</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
