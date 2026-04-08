import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-card/50 backdrop-blur-sm', className)}>
      <div className="flex items-center gap-4 px-6 py-4">
        <SidebarTrigger className="-ml-2" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground text-balance">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </header>
  )
}
