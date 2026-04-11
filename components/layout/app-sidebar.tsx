"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Brain, BarChart3, Database, FlaskConical, GitBranch,
  Home, Layers, MessageSquare, BookOpen, AlertTriangle,
  Sliders, PanelLeft, ExternalLink as ExternalLinkIcon,
} from "lucide-react"
import { getStatus } from "@/lib/api"
import { PIPELINE_STEP_LABELS, cn } from "@/lib/utils"
import type { StatusResponse } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home, step: "load_dataset" },
  { href: "/preprocessing", label: "Preprocessing", icon: Database, step: "preprocess" },
  { href: "/eda", label: "Exploratory Analysis", icon: BarChart3, step: "eda" },
  { href: "/models", label: "Model Comparison", icon: Layers, step: "train_models" },
  { href: "/interpretability", label: "Interpretability", icon: Sliders, step: "interpretability" },
  { href: "/error-analysis", label: "Error Analysis", icon: AlertTriangle, step: "error_analysis" },
  { href: "/demo", label: "Live Demo", icon: MessageSquare, step: "evaluation" },
]

const EXTERNAL_LINKS = [
  { href: "https://github.com/codenameberyl/fig-loneliness-airdp10", icon: GitBranch, label: "GitHub" },
  { href: "https://huggingface.co/datasets/FIG-Loneliness/FIG-Loneliness", icon: FlaskConical, label: "HuggingFace" },
  { href: "https://codenameberyl-fig-lone.hf.space/docs", icon: BookOpen, label: "API Docs" },
]

// ── Sidebar nav content — shared between desktop & mobile ────────────────────
function SidebarNav({
  status,
  loading,
}: {
  status: StatusResponse | null
  loading: boolean
}) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const completed = new Set(status?.completed_steps ?? [])

  return (
    <TooltipProvider delayDuration={0}>
      {/* Logo */}
      <SidebarHeader
        className={cn(
          "border-b border-[#1e1e2e] px-4 py-4 flex transition-all duration-200 ease-linear",
          isCollapsed
            ? "flex-col items-center gap-2"
            : "flex-row items-center justify-between"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "flex-col gap-2"
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-violet-600/20 border border-violet-600/30 flex items-center justify-center flex-shrink-0">
            <Brain className="h-4 w-4 text-violet-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white leading-none truncate">
                FIG-Loneliness
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">NLP Pipeline</p>
            </div>
          )}
        </div>
        <SidebarTrigger
          className={cn(
            "flex items-center justify-center rounded-lg transition-all",
            "hover:bg-white/5 border border-transparent hover:border-[#1e1e2e]",
            "h-8 w-8 flex-shrink-0"
          )}
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </SidebarTrigger>
      </SidebarHeader>

      {/* Main navigation */}
      <SidebarContent className="py-4 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon, step }) => {
                const active =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href))

                const done = step ? completed.has(step) : true

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "relative transition-all h-9 overflow-hidden",
                        active
                          ? "bg-slate-800/50 text-slate-100"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <Link href={href} className="flex items-center gap-3 w-full px-3">
                        
                        {/* 🔥 ACTIVE LEFT INDICATOR */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                        )}

                        {/* ICON */}
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            active ? "text-cyan-400" : "text-slate-500"
                          )}
                        />

                        {/* TEXT (hidden when collapsed) */}
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate text-sm">{label}</span>

                            {/* STATUS DOT */}
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                done ? "bg-emerald-400" : "bg-slate-700"
                              )}
                            />
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

                return (
                  <SidebarMenuItem key={href}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{menuBtn}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-[#1e1e2e] border-[#2e2e3e] text-slate-200 font-mono text-xs flex items-center gap-2"
                        >
                          <span>{label}</span>
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              done ? "bg-emerald-400" : "bg-slate-700"
                            )}
                          />
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuBtn
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-[#1e1e2e]" />

        {/* Docs */}
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/docs"}
                        className={cn(
                          "transition-all h-9",
                          pathname === "/docs"
                            ? "bg-violet-600/15 text-violet-300"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        )}
                      >
                        <Link href="/docs">
                          <BookOpen className="h-4 w-4" />
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#1e1e2e] border-[#2e2e3e] text-slate-200 font-mono text-xs">
                      Documentation
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/docs"}
                    className={cn(
                      "transition-all h-9",
                      pathname === "/docs"
                        ? "bg-violet-600/15 text-violet-300"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <Link href="/docs" className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">Documentation</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-[#1e1e2e] px-3 py-3 flex-shrink-0">
        {/* External links */}
        {!isCollapsed && (
          <div className="space-y-0.5 mb-2.5">
            {EXTERNAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate flex-1">{label}</span>
                <ExternalLinkIcon className="h-2.5 w-2.5 opacity-40 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {/* Pipeline progress bar */}
        {!isCollapsed && (
          <div className="px-2 py-3 border-t border-[#1e1e2e]">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
              Pipeline
            </p>
            {loading ? (
              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-1.5 w-4 bg-[#1e1e2e]" />
                ))}
              </div>
            ) : status ? (
              <>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(PIPELINE_STEP_LABELS).map(([key, label]) => {
                    const done = completed.has(key)
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-1.5 w-4 rounded-full cursor-default transition-colors",
                              done ? "bg-emerald-500" : "bg-slate-700"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-[#1e1e2e] border-[#2e2e3e] text-[10px] font-mono text-slate-200"
                        >
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
                <p className="text-[10px] text-slate-600 mt-1 font-mono">
                  {completed.size} / {Object.keys(PIPELINE_STEP_LABELS).length} complete
                </p>
              </>
            ) : (
              <p className="text-[10px] text-slate-700 font-mono">No results yet</p>
            )}
          </div>
        )}
      </SidebarFooter>
    </TooltipProvider>
  )
}

// ── Public export ──────────────────────────────────────────────────────────────
export function AppSidebar() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#1e1e2e] bg-[#0a0a0f]"
    >
      <SidebarNav status={status} loading={loading} />
    </Sidebar>
  )
}
