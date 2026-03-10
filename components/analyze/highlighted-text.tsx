"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HighlightedTextProps {
  text: string
}

const firstPersonWords = ["i", "me", "my", "myself", "mine", "i'm", "i've", "i'll", "i'd"]
const socialWords = ["friend", "friends", "family", "people", "someone", "anyone", "nobody", "everyone", "together", "alone"]
const emotionalWords = ["lonely", "alone", "sad", "happy", "love", "hate", "feel", "feeling", "empty", "isolated", "depressed", "anxious", "scared", "worried"]

export function HighlightedText({ text }: HighlightedTextProps) {
  const words = text.split(/(\s+)/)

  const getHighlightClass = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^\w']/g, "")
    
    if (firstPersonWords.includes(cleanWord)) {
      return "bg-pink-500/20 text-pink-500 rounded px-1"
    }
    if (socialWords.includes(cleanWord)) {
      return "bg-cyan-500/20 text-cyan-500 rounded px-1"
    }
    if (emotionalWords.includes(cleanWord)) {
      return "bg-amber-500/20 text-amber-500 rounded px-1"
    }
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Highlighted Text View</CardTitle>
            <CardDescription>
              Key linguistic markers highlighted in the original text
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/30">
              First-Person
            </Badge>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30">
              Social Words
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              Emotional Cues
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm leading-relaxed">
            {words.map((word, index) => {
              const highlightClass = getHighlightClass(word)
              return highlightClass ? (
                <span key={index} className={highlightClass}>
                  {word}
                </span>
              ) : (
                <span key={index}>{word}</span>
              )
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
