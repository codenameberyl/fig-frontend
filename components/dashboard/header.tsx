"use client"

import { useTheme } from "next-themes"
import { Github, BookOpen, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-foreground flex">
            FIG-Loneliness <span className="hidden sm:block ml-1 mr-1">Research</span> Dashboard
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Loneliness Self-Disclosure Detection using NLP
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
          >
            <Github className="size-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Documentation"
          >
            <BookOpen className="size-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
