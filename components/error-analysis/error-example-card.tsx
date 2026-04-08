'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ErrorExample } from '@/lib/types'

interface ErrorExampleCardProps {
  example: ErrorExample
  type: 'fp' | 'fn'
}

export function ErrorExampleCard({ example, type }: ErrorExampleCardProps) {
  const [expanded, setExpanded] = useState(false)

  const isFP = type === 'fp'
  const truncatedText = example.text.slice(0, 300)
  const needsTruncation = example.text.length > 300

  const features = [
    { label: 'Words', value: example.word_count },
    { label: 'Pronoun', value: example.pronoun_ratio },
    { label: 'Emotion', value: example.emotion_word_ratio },
    { label: 'Negation', value: example.negation_ratio },
  ].filter((f) => f.value !== undefined)

  return (
    <Card className={cn(
      'border-l-4',
      isFP ? 'border-l-[oklch(0.65_0.2_15)]' : 'border-l-[oklch(0.65_0.18_250)]'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isFP
                ? 'border-[oklch(0.65_0.2_15)]/50 text-[oklch(0.65_0.2_15)]'
                : 'border-[oklch(0.65_0.18_250)]/50 text-[oklch(0.65_0.18_250)]'
            )}
          >
            {isFP
              ? 'True: Non-Lonely → Predicted: Lonely'
              : 'True: Lonely → Predicted: Non-Lonely'}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {example.unique_id}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground leading-relaxed">
          {expanded ? example.text : truncatedText}
          {!expanded && needsTruncation && '...'}
        </p>

        {needsTruncation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 px-2 text-xs"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}

        {/* Feature Sparklines */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{feature.label}:</span>
                <span className="font-mono">
                  {typeof feature.value === 'number'
                    ? feature.value < 1
                      ? feature.value.toFixed(3)
                      : feature.value
                    : feature.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
