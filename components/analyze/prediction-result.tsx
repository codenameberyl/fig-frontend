"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, HeartOff, AlertCircle } from "lucide-react"

interface PredictionResultProps {
  result: {
    prediction: "lonely" | "non-lonely"
    confidence: number
  } | null
  isAnalyzing: boolean
}

export function PredictionResult({ result, isAnalyzing }: PredictionResultProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>Processing your text...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="space-y-4 text-center">
              <Skeleton className="mx-auto h-16 w-16 rounded-full" />
              <Skeleton className="mx-auto h-8 w-32" />
              <Skeleton className="mx-auto h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>Enter text and click analyze to see results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No analysis results yet. Enter some text and click the analyze button.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isLonely = result.prediction === "lonely"

  return (
    <Card className={isLonely ? "border-pink-500/30" : "border-cyan-500/30"}>
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Model prediction and confidence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center py-4 text-center">
          <div
            className={`flex size-20 items-center justify-center rounded-full ${
              isLonely ? "bg-pink-500/10" : "bg-cyan-500/10"
            }`}
          >
            {isLonely ? (
              <Heart className="size-10 text-pink-500" />
            ) : (
              <HeartOff className="size-10 text-cyan-500" />
            )}
          </div>
          <Badge
            className={`mt-4 px-4 py-1 text-lg ${
              isLonely
                ? "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                : "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
            }`}
          >
            {isLonely ? "Lonely" : "Non-Lonely"}
          </Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Classification result based on BERT model
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className="font-mono font-semibold">
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={result.confidence * 100}
            className={`h-3 ${isLonely ? "[&>div]:bg-pink-500" : "[&>div]:bg-cyan-500"}`}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Probability Distribution</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-mono text-lg font-bold text-pink-500">
                {isLonely
                  ? (result.confidence * 100).toFixed(1)
                  : ((1 - result.confidence) * 100).toFixed(1)}
                %
              </p>
              <p className="text-xs text-muted-foreground">Lonely</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-cyan-500">
                {isLonely
                  ? ((1 - result.confidence) * 100).toFixed(1)
                  : (result.confidence * 100).toFixed(1)}
                %
              </p>
              <p className="text-xs text-muted-foreground">Non-Lonely</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
