import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  retry?: () => void
  className?: string
}

export function ErrorState({ message, retry, className }: ErrorStateProps) {
  return (
    <Card
      className={cn(
        'border-[oklch(0.65_0.2_15)]/30 bg-card',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.65_0.2_15)]/10">
          <AlertCircle className="h-6 w-6 text-[oklch(0.65_0.2_15)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Something went wrong
          </p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
