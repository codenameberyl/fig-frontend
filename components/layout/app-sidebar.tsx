'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  LayoutDashboard,
  Workflow,
  BarChart3,
  GitCompare,
  Lightbulb,
  AlertTriangle,
  Play,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const mainNavItems = [
  {
    title: 'Overview',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Preprocessing',
    href: '/preprocessing',
    icon: Workflow,
  },
  {
    title: 'Exploratory Analysis',
    href: '/eda',
    icon: BarChart3,
  },
  {
    title: 'Model Comparison',
    href: '/models',
    icon: GitCompare,
  },
  {
    title: 'Interpretability',
    href: '/interpretability',
    icon: Lightbulb,
  },
  {
    title: 'Error Analysis',
    href: '/error-analysis',
    icon: AlertTriangle,
  },
  {
    title: 'Live Demo',
    href: '/demo',
    icon: Play,
  },
]

const secondaryNavItems = [
  {
    title: 'Documentation',
    href: '/docs',
    icon: FileText,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">FIG-Loneliness</span>
            <span className="text-xs text-muted-foreground">NLP Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href))
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'relative transition-all duration-200',
                        isActive && 'bg-primary/10 text-primary border-l-2 border-primary'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'relative transition-all duration-200',
                        isActive && 'bg-primary/10 text-primary border-l-2 border-primary'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
