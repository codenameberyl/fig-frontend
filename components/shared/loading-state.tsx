import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = 'Fetching results...',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16',
        className
      )}
    >
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
