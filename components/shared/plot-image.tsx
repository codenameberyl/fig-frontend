'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { plotUrl } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface PlotImageProps {
  section: 'eda' | 'models'
  plotName: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function PlotImage({
  section,
  plotName,
  alt,
  className,
  width = 800,
  height = 500,
}: PlotImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const url = plotUrl(section, plotName)

  const handleRetry = () => {
    setError(false)
    setLoading(true)
    setRetryKey((k) => k + 1)
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-xl border border-[oklch(0.65_0.2_15)]/30 bg-card p-8',
          className
        )}
        style={{ minHeight: height / 2 }}
      >
        <AlertCircle className="h-8 w-8 text-[oklch(0.65_0.2_15)]" />
        <p className="text-sm text-muted-foreground">Failed to load plot image</p>
        <Button variant="outline" size="sm" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-card', className)}>
      {loading && (
        <Skeleton
          className="absolute inset-0"
          style={{ width, height }}
        />
      )}
      <Image
        key={retryKey}
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'rounded-xl transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        unoptimized
      />
    </div>
  )
}
