import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: string
  accentColor?: 'violet' | 'rose' | 'blue' | 'cyan' | 'default'
  className?: string
}

const accentColors = {
  violet: 'border-t-primary',
  rose: 'border-t-[oklch(0.65_0.2_15)]',
  blue: 'border-t-[oklch(0.65_0.18_250)]',
  cyan: 'border-t-[oklch(0.7_0.15_195)]',
  default: 'border-t-border',
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  accentColor = 'violet',
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'border-t-2 bg-card transition-all duration-200 hover:glow-violet',
        accentColors[accentColor],
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold font-mono tabular-nums text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
          {delta && (
            <p className="text-xs text-muted-foreground mt-1">{delta}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
