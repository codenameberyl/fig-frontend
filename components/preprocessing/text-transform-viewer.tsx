"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play } from "lucide-react"

const defaultText = "I've been feeling so lonely lately... Nobody seems to understand what I'm going through. Check out https://example.com for more. I just want someone to talk to. :("

function processText(text: string) {
  const cleaned = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const tokens = cleaned.split(" ").filter(Boolean)

  const features = {
    firstPersonRatio: (tokens.filter((t) => ["i", "me", "my", "myself", "mine"].includes(t)).length / tokens.length * 100).toFixed(1),
    wordCount: tokens.length,
    avgWordLength: (tokens.reduce((acc, t) => acc + t.length, 0) / tokens.length).toFixed(1),
    questionMarks: (text.match(/\?/g) || []).length,
    socialWords: tokens.filter((t) => ["nobody", "someone", "anyone", "everyone", "friend", "friends", "family", "people"].includes(t)).length,
    negativeWords: tokens.filter((t) => ["lonely", "alone", "sad", "depressed", "empty", "isolated"].includes(t)).length,
  }

  const tfidfPreview = tokens.slice(0, 10).map((token, i) => ({
    term: token,
    tfidf: (Math.random() * 0.5 + 0.1).toFixed(3),
  }))

  return { cleaned, tokens, features, tfidfPreview }
}

export function TextTransformViewer() {
  const [inputText, setInputText] = useState(defaultText)
  const [processed, setProcessed] = useState(() => processText(defaultText))

  const handleProcess = () => {
    setProcessed(processText(inputText))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Text Transformation</CardTitle>
        <CardDescription>
          Enter text to see each preprocessing stage applied
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Input Text</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to analyze loneliness signals..."
            className="min-h-[120px] resize-none font-mono text-sm"
          />
          <Button onClick={handleProcess} className="w-full sm:w-auto">
            <Play className="mr-2 size-4" />
            Process Text
          </Button>
        </div>

        <Tabs defaultValue="raw" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="raw">Raw</TabsTrigger>
            <TabsTrigger value="cleaned">Cleaned</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tfidf">TF-IDF</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="font-mono text-sm leading-relaxed text-foreground">{inputText}</p>
            </div>
          </TabsContent>

          <TabsContent value="cleaned" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="font-mono text-sm leading-relaxed text-foreground">{processed.cleaned}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">Lowercased</Badge>
              <Badge variant="outline">URLs Removed</Badge>
              <Badge variant="outline">Punctuation Cleaned</Badge>
              <Badge variant="outline">Whitespace Normalized</Badge>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex flex-wrap gap-2">
                {processed.tokens.map((token, index) => (
                  <Badge key={index} variant="secondary" className="font-mono">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {processed.tokens.length} tokens extracted
            </p>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">First Person Ratio</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.firstPersonRatio}%</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.wordCount}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Avg Word Length</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.avgWordLength}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Question Marks</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.questionMarks}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Social Words</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.socialWords}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Negative Words</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{processed.features.negativeWords}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tfidf" className="mt-4">
            <div className="rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-muted px-4 py-2 text-sm font-medium text-foreground">Term</div>
                <div className="bg-muted px-4 py-2 text-sm font-medium text-foreground">TF-IDF Score</div>
                {processed.tfidfPreview.map((item, index) => (
                  <div key={index}>
                    <div key={`term-${index}`} className="bg-background px-4 py-2 font-mono text-sm">{item.term}</div>
                    <div key={`score-${index}`} className="bg-background px-4 py-2 font-mono text-sm text-primary">{item.tfidf}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Showing top 10 terms by TF-IDF weight (simulated values)
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
