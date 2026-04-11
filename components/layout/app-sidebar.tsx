"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Brain,
  BarChart3,
  Database,
  FlaskConical,
  GitBranch,
  Home,
  Layers,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Sliders,
} from "lucide-react"
import { getStatus } from "@/lib/api"
import { NAV_STEP_MAP, PIPELINE_STEP_LABELS } from "@/lib/utils"
import type { StatusResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/preprocessing", label: "Preprocessing", icon: Database },
  { href: "/eda", label: "Exploratory Analysis", icon: BarChart3 },
  { href: "/models", label: "Model Comparison", icon: Layers },
  { href: "/interpretability", label: "Interpretability", icon: Sliders },
  { href: "/error-analysis", label: "Error Analysis", icon: AlertTriangle },
  { href: "/demo", label: "Live Demo", icon: MessageSquare },
]

const BOTTOM_ITEMS = [
  { href: "/docs", label: "Documentation", icon: BookOpen },
]

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full flex-shrink-0",
        done ? "bg-emerald-400" : "bg-slate-600"
      )}
    />
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [status, setStatus] = useState<StatusResponse | null>(null)

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch(() => {})
  }, [])

  const completed = new Set(status?.completed_steps ?? [])

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0a0a0f] border-r border-[#1e1e2e] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e1e2e]">
        <div className="h-8 w-8 rounded-lg bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
          <Brain className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">
            FIG-Loneliness
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            NLP Pipeline
          </p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          const stepKey = NAV_STEP_MAP[href]
          const done = stepKey ? completed.has(stepKey) : true

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                active
                  ? "bg-violet-600/15 text-violet-300 border-l-2 border-violet-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="flex-1 truncate">{label}</span>
              <StatusDot done={done} />
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-[#1e1e2e]" />

      {/* Bottom nav */}
      <div className="px-3 py-3 space-y-0.5">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-violet-600/15 text-violet-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}

        {/* External links */}
        <div className="px-3 pt-2 pb-1 space-y-1.5">
          <ExternalLink href="https://github.com/your-username/fig-loneliness" icon={GitBranch} label="GitHub" />
          <ExternalLink href="https://huggingface.co/datasets/FIG-Loneliness/FIG-Loneliness" icon={FlaskConical} label="HuggingFace Dataset" />
          <ExternalLink href="https://your-space.hf.space/docs" icon={BookOpen} label="API Docs" />
        </div>
      </div>

      {/* Pipeline status */}
      {status && (
        <div className="px-4 py-3 border-t border-[#1e1e2e]">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-mono">
            Pipeline
          </p>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(NAV_STEP_MAP)
              .filter(([, v]) => v)
              .map(([, step]) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 w-4 rounded-full",
                    completed.has(step) ? "bg-emerald-500" : "bg-slate-700"
                  )}
                  title={step}
                />
              ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-1 font-mono">
            {status.completed_steps.length}/{Object.keys(PIPELINE_STEP_LABELS).length} complete
          </p>
        </div>
      )}
    </aside>
  )
}

function ExternalLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
    >
      <Icon className="h-3 w-3" />
      <span className="truncate">{label}</span>
    </a>
  )
}
