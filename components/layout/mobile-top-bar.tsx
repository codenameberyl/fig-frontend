"use client"

import { usePathname } from "next/navigation"
import {
  Home, BarChart3, Database, Sliders, AlertTriangle,
  MessageSquare, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/preprocessing", label: "Preprocessing", icon: Database },
  { href: "/eda", label: "Exploratory Analysis", icon: BarChart3 },
  { href: "/models", label: "Model Comparison", icon: Sliders },
  { href: "/interpretability", label: "Interpretability", icon: Sliders },
  { href: "/error-analysis", label: "Error Analysis", icon: AlertTriangle },
  { href: "/demo", label: "Live Demo", icon: MessageSquare },
]

export function MobileTopBar() {
  const pathname = usePathname()
  const current =
    NAV_ITEMS.find(
      (item) =>
        item.href === pathname ||
        (item.href !== "/" && pathname.startsWith(item.href))
    ) ?? { label: "Documentation", icon: BookOpen }
  const Icon = current.icon

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/95 backdrop-blur border-b border-[#1e1e2e]">
      <div className="flex items-center gap-2.5 flex-1">
        <div className="h-7 w-7 rounded-md bg-violet-600/20 border border-violet-600/30 flex items-center justify-center flex-shrink-0">
          <Icon className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <span className="text-sm font-medium text-white truncate">{current.label}</span>
      </div>
      <SidebarTrigger className={cn(
        "h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-200"
      )} />
    </header>
  )
}
