"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
        <footer className="border-t border-border bg-muted/30 px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            This frontend connects to a Django REST Framework backend API that
            powers dataset access, NLP preprocessing, feature extraction,
            exploratory analysis, model evaluation, and real-time inference.
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
