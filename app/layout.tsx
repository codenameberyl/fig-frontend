import type { Metadata } from "next"
import "./globals.css"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: {
    default: "FIG-Loneliness | NLP Dashboard",
    template: "FIG-Loneliness | %s",
  },
  description:
    "An empirical evaluation of text representations and classification models for loneliness self-disclosure detection in Reddit posts.",
  openGraph: {
    title: "FIG-Loneliness NLP Dashboard",
    description:
      "Detecting loneliness self-disclosure in Reddit posts using NLP. Exploratory analysis, model comparison, interpretability, and live inference.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-[#e2e8f0] antialiased">
        <AppSidebar />
        <div
          className={[
            "flex flex-col min-h-screen",
            "md:peer-data-[state=expanded]/sidebar-wrapper:ml-[var(--sidebar-width,16rem)]",
            "md:peer-data-[state=collapsed]/sidebar-wrapper:ml-[var(--sidebar-width-icon,3rem)]",
            "transition-[margin] duration-200 ease-linear",
          ].join(" ")}
        >
          <main className="flex-1 px-4 md:px-6 py-6 md:py-8 max-w-[1300px] w-full mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
