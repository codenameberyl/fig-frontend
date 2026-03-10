import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable:'--font-inter',
  subsets:['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable:'--font-jetbrains-mono',
  subsets:['latin'],
});

export const metadata: Metadata = {
  title: 'FIG-Loneliness Research Dashboard',
  description: 'Loneliness Self-Disclosure Detection using NLP - An interactive research platform for analyzing and detecting loneliness in text',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
