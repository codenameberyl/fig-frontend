"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SentimentGaugeProps {
  sentiment: number // -1 to 1
}

export function SentimentGauge({ sentiment }: SentimentGaugeProps) {
  // Convert sentiment (-1 to 1) to angle (-90 to 90 degrees)
  const angle = sentiment * 90
  // Convert to percentage for positioning (0% = -1, 50% = 0, 100% = 1)
  const percentage = ((sentiment + 1) / 2) * 100

  const getSentimentLabel = () => {
    if (sentiment < -0.5) return "Very Negative"
    if (sentiment < -0.2) return "Negative"
    if (sentiment < 0.2) return "Neutral"
    if (sentiment < 0.5) return "Positive"
    return "Very Positive"
  }

  const getSentimentColor = () => {
    if (sentiment < -0.3) return "#f472b6"
    if (sentiment < 0.3) return "#94a3b8"
    return "#22d3ee"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>Overall sentiment polarity of the text</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-64">
            {/* Gauge background arc */}
            <svg className="h-full w-full" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              {/* Background arc */}
              <path
                d="M 10 90 A 80 80 0 0 1 190 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Progress arc */}
              <path
                d="M 10 90 A 80 80 0 0 1 190 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.51} 251`}
              />
              {/* Needle */}
              <g transform={`rotate(${angle}, 100, 90)`}>
                <line
                  x1="100"
                  y1="90"
                  x2="100"
                  y2="25"
                  stroke={getSentimentColor()}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="90" r="8" fill={getSentimentColor()} />
              </g>
            </svg>
            {/* Labels */}
            <div className="absolute bottom-0 left-0 text-xs text-pink-500">-1</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              0
            </div>
            <div className="absolute bottom-0 right-0 text-xs text-cyan-500">+1</div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-3xl font-bold" style={{ color: getSentimentColor() }}>
              {sentiment > 0 ? "+" : ""}
              {sentiment.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{getSentimentLabel()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
