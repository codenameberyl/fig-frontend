"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Database,
  Workflow,
  BarChart3,
  Brain,
  FlaskConical,
  Blocks,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Dataset Explorer",
    href: "/dataset",
    icon: Database,
  },
  {
    title: "Preprocessing Pipeline",
    href: "/preprocessing",
    icon: Workflow,
  },
  {
    title: "Exploratory Data Analysis",
    href: "/eda",
    icon: BarChart3,
  },
  {
    title: "Model Performance",
    href: "/models",
    icon: Brain,
  },
  {
    title: "Live Text Analysis",
    href: "/analyze",
    icon: FlaskConical,
  },
  {
    title: "System Architecture",
    href: "/architecture",
    icon: Blocks,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Brain className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">
              FIG-Loneliness
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Research Dashboard
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <p className="text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          NLP Research Platform
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
