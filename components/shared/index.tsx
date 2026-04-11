"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, RefreshCw, Brain } from "lucide-react"
import { useState } from "react"

// ─── MetricCard ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  accentColor?: string
  className?: string
  mono?: boolean
}

export function MetricCard({
  label,
  value,
  sub,
  accentColor = "#7c3aed",
  className,
  mono = true,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-1",
        "hover:shadow-[0_0_20px_rgba(124,58,237,0.12)] transition-shadow",
        className
      )}
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p
        className={cn(
          "text-3xl font-bold text-white",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 font-mono">{sub}</p>}
    </div>
  )
}

// ─── MetricCardSkeleton ───────────────────────────────────────────────────────
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 animate-pulse",
        className
      )}
    >
      <div className="h-3 w-20 bg-[#1e1e2e] rounded mb-3" />
      <div className="h-8 w-28 bg-[#1e1e2e] rounded mb-2" />
      <div className="h-3 w-16 bg-[#1e1e2e] rounded" />
    </div>
  )
}

// ─── PlotImage ────────────────────────────────────────────────────────────────
interface PlotImageProps {
  src: string
  alt: string
  className?: string
  caption?: string
}

export function PlotImage({ src, alt, className, caption }: PlotImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div className={cn("flex items-center justify-center bg-[#111118] border border-[#1e1e2e] rounded-xl p-8", className)}>
        <div className="text-center text-slate-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Plot unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl overflow-hidden border border-[#1e1e2e]", className)}>
      {loading && (
        <div className="bg-[#111118] animate-pulse h-48 w-full" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-auto", loading && "hidden")}
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false) }}
      />
      {caption && !loading && !error && (
        <p className="px-4 py-2 text-xs text-slate-600 bg-[#111118] font-mono border-t border-[#1e1e2e]">
          {caption}
        </p>
      )}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center mb-4">
        <Brain className="h-6 w-6 text-violet-500/50" />
      </div>
      <h3 className="text-slate-400 font-medium mb-2">No data available</h3>
      <p className="text-slate-600 text-sm max-w-sm">
        {message ??
          "Run run_pipeline.py on Google Colab, then upload the results/ directory to HuggingFace Spaces."}
      </p>
    </div>
  )
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
      <p className="text-slate-400 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string
  subtitle?: string
  badge?: string
}) {
  return (
    <div className="mb-8 animate-fade-in">
      {badge && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-violet-600/15 text-violet-400 border border-violet-600/20 mb-3">
          {badge}
        </span>
      )}
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-slate-500 mt-1.5 text-sm max-w-2xl">{subtitle}</p>
      )}
    </div>
  )
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "bg-[#111118] border border-[#1e1e2e] rounded-xl p-6",
        className
      )}
    >
      {(title || description) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export function Tag({
  children,
  color = "violet",
}: {
  children: React.ReactNode
  color?: "violet" | "rose" | "blue" | "emerald" | "amber"
}) {
  const colors = {
    violet: "bg-violet-600/10 text-violet-400 border-violet-600/20",
    rose: "bg-rose-600/10 text-rose-400 border-rose-600/20",
    blue: "bg-blue-600/10 text-blue-400 border-blue-600/20",
    emerald: "bg-emerald-600/10 text-emerald-400 border-emerald-600/20",
    amber: "bg-amber-600/10 text-amber-400 border-amber-600/20",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border",
        colors[color]
      )}
    >
      {children}
    </span>
  )
}

// ─── Callout ─────────────────────────────────────────────────────────────────
export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "error" | "success"
  children: React.ReactNode
}) {
  const styles = {
    info: "bg-blue-600/5 border-blue-600/20 text-blue-300",
    warning: "bg-amber-600/5 border-amber-600/20 text-amber-300",
    error: "bg-rose-600/5 border-rose-600/20 text-rose-300",
    success: "bg-emerald-600/5 border-emerald-600/20 text-emerald-300",
  }
  return (
    <div
      className={cn(
        "border rounded-lg px-4 py-3 text-sm",
        styles[type]
      )}
    >
      {children}
    </div>
  )
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 animate-pulse space-y-3">
      <div className="h-4 w-1/3 bg-[#1e1e2e] rounded" />
      <div className="h-3 w-1/2 bg-[#1e1e2e] rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-[#1e1e2e] rounded" style={{ width: `${60 + i * 10}%` }} />
      ))}
    </div>
  )
}

// ─── RepresentationBadge ──────────────────────────────────────────────────────
export function RepresentationBadge({ rep }: { rep: string }) {
  const colours: Record<string, string> = {
    linguistic_only: "#10b981",
    tfidf: "#06b6d4",
    tfidf_ling: "#7c3aed",
    word2vec: "#f59e0b",
    sbert: "#3b82f6",
    distilbert: "#f43f5e",
  }
  const c = colours[rep] ?? "#64748b"
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono border"
      style={{
        backgroundColor: `${c}15`,
        borderColor: `${c}30`,
        color: c,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c }}
      />
      {rep}
    </span>
  )
}
