"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const lonelyTerms = [
  { term: "alone", score: 0.847, normalized: 100 },
  { term: "lonely", score: 0.812, normalized: 96 },
  { term: "nobody", score: 0.756, normalized: 89 },
  { term: "isolated", score: 0.698, normalized: 82 },
  { term: "myself", score: 0.654, normalized: 77 },
  { term: "empty", score: 0.623, normalized: 74 },
  { term: "sad", score: 0.589, normalized: 70 },
  { term: "depressed", score: 0.567, normalized: 67 },
]

const nonLonelyTerms = [
  { term: "friends", score: 0.892, normalized: 100 },
  { term: "together", score: 0.834, normalized: 94 },
  { term: "family", score: 0.789, normalized: 88 },
  { term: "happy", score: 0.756, normalized: 85 },
  { term: "love", score: 0.712, normalized: 80 },
  { term: "great", score: 0.678, normalized: 76 },
  { term: "wonderful", score: 0.645, normalized: 72 },
  { term: "fun", score: 0.612, normalized: 69 },
]

export function TFIDFInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Discriminative TF-IDF Terms</CardTitle>
        <CardDescription>
          Most predictive terms for each class ranked by TF-IDF score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Badge className="bg-pink-500/10 text-pink-500 hover:bg-pink-500/20">
                Lonely Class
              </Badge>
            </div>
            <div className="space-y-4">
              {lonelyTerms.map((item, index) => (
                <div key={item.term} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-sm text-muted-foreground">{index + 1}.</span>
                      <span className="font-mono text-sm font-medium text-foreground">{item.term}</span>
                    </div>
                    <span className="font-mono text-sm text-pink-500">{item.score.toFixed(3)}</span>
                  </div>
                  <Progress value={item.normalized} className="h-2 [&>div]:bg-pink-500" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Badge className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20">
                Non-Lonely Class
              </Badge>
            </div>
            <div className="space-y-4">
              {nonLonelyTerms.map((item, index) => (
                <div key={item.term} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-sm text-muted-foreground">{index + 1}.</span>
                      <span className="font-mono text-sm font-medium text-foreground">{item.term}</span>
                    </div>
                    <span className="font-mono text-sm text-cyan-500">{item.score.toFixed(3)}</span>
                  </div>
                  <Progress value={item.normalized} className="h-2 [&>div]:bg-cyan-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
