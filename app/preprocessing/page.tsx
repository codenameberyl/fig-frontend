'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import type { PreprocessingSamples, PreprocessingSummary, PreprocessedSample } from '@/lib/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://your-space.hf.space/api'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
})

const pipelineSteps = [
  { num: 1, name: 'Unicode normalisation', tool: 'ftfy + NFKC', description: 'Fixes mojibake and normalises unicode characters' },
  { num: 2, name: 'HTML stripping', tool: 'bleach', description: 'Strips HTML tags while keeping text content' },
  { num: 3, name: 'URL / Reddit removal', tool: 'regex + emoji library', description: 'Removes URLs, Reddit mentions, subreddits, and emojis' },
  { num: 4, name: 'Hashtag normalisation', tool: 'regex', description: 'Converts #word to word' },
  { num: 5, name: 'Lowercasing + normalisation', tool: 'Python str methods', description: 'Lowercases text and reduces repeated characters (3+ → 2)' },
  { num: 6, name: 'Tokenisation & POS tagging', tool: 'spaCy en_core_web_sm', description: 'Tokenises, lemmatises, and tags parts of speech' },
  { num: 7, name: 'Stopword removal', tool: 'spaCy + custom', description: 'Removes stopwords while preserving negations (not, never, n\'t)' },
  { num: 8, name: 'Feature extraction', tool: 'Custom Python', description: 'Computes 13 linguistic features per post' },
]

const featureDescriptions = [
  { feature: 'word_count', description: 'Total token count', relevance: 'Post length proxy' },
  { feature: 'char_count', description: 'Character count', relevance: 'Verbosity indicator' },
  { feature: 'sentence_count', description: 'Sentence count (sentencizer)', relevance: 'Structural complexity' },
  { feature: 'avg_sentence_length', description: 'word_count / sentence_count', relevance: 'Prose density' },
  { feature: 'type_token_ratio', description: 'unique_tokens / total_tokens', relevance: 'Lexical diversity' },
  { feature: 'pronoun_ratio', description: 'First-person pronouns / total', relevance: 'Self-focus (I, me, my, mine, myself)' },
  { feature: 'negation_ratio', description: 'Negation words / total', relevance: 'Negative framing' },
  { feature: 'social_word_ratio', description: 'Social vocabulary / total', relevance: 'Relational content' },
  { feature: 'emotion_word_ratio', description: 'Emotion vocabulary / total', relevance: 'Affective content' },
  { feature: 'noun_ratio', description: 'NOUN tokens / total', relevance: 'Referential density' },
  { feature: 'verb_ratio', description: 'VERB tokens / total', relevance: 'Action / state density' },
  { feature: 'adj_ratio', description: 'ADJ tokens / total', relevance: 'Descriptive density' },
  { feature: 'adv_ratio', description: 'ADV tokens / total', relevance: 'Modification density' },
]

function SampleCard({ sample, isLonely }: { sample: PreprocessedSample; isLonely: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const truncatedOriginal = sample.text.length > 300 ? sample.text.slice(0, 300) + '...' : sample.text
  const truncatedCleaned = sample.cleaned.length > 300 ? sample.cleaned.slice(0, 300) + '...' : sample.cleaned

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Original */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-xs">{sample.unique_id}</Badge>
              <Badge className={isLonely ? 'bg-[#f43f5e] text-white' : 'bg-[#4C9BE8] text-white'}>
                {isLonely ? 'LONELY' : 'NOT LONELY'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Original text</p>
              <p className="text-sm text-foreground leading-relaxed">
                {expanded ? sample.text : truncatedOriginal}
              </p>
              {sample.text.length > 300 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          </div>

          {/* Right - Preprocessed */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">After preprocessing</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {expanded ? sample.cleaned : truncatedCleaned}
              </p>
            </div>
            
            {/* Token previews */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tokens (first 15)</p>
                <div className="flex flex-wrap gap-1">
                  {sample.tokens_preview.slice(0, 15).map((token, i) => (
                    <Badge key={i} variant="secondary" className="font-mono text-xs px-1.5 py-0.5">
                      {token}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lemmas (first 15)</p>
                <div className="flex flex-wrap gap-1">
                  {sample.lemmas_preview.slice(0, 15).map((lemma, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs px-1.5 py-0.5">
                      {lemma}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini feature grid */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">words</p>
                <p className="font-mono text-sm">{sample.word_count}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">sentences</p>
                <p className="font-mono text-sm">{sample.sentence_count}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">pronoun</p>
                <p className="font-mono text-sm">{sample.pronoun_ratio.toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">negation</p>
                <p className="font-mono text-sm">{sample.negation_ratio.toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">social</p>
                <p className="font-mono text-sm">{sample.social_word_ratio.toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">emotion</p>
                <p className="font-mono text-sm">{sample.emotion_word_ratio.toFixed(3)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">TTR</p>
                <p className="font-mono text-sm">{(sample.word_count > 0 ? sample.char_count / sample.word_count : 0).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">chars</p>
                <p className="font-mono text-sm">{sample.char_count}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PreprocessingPage() {
  const [split, setSplit] = useState('train')
  const [labelFilter, setLabelFilter] = useState<'both' | 'lonely' | 'non_lonely'>('both')
  const [sampleCount, setSampleCount] = useState(10)
  const [page, setPage] = useState(0)

  const { data: summary, error: summaryError, isLoading: summaryLoading } = useSWR<PreprocessingSummary>(
    `${API}/eda/preprocessing/summary`,
    fetcher
  )

  const { data: samples, error: samplesError, isLoading: samplesLoading } = useSWR<PreprocessingSamples>(
    `${API}/eda/preprocessing/samples?split=${split}&label=${labelFilter}&n=${sampleCount}`,
    fetcher
  )

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [split, labelFilter, sampleCount])

  const allSamples = samples ? [
    ...(labelFilter === 'both' || labelFilter === 'lonely' ? samples.lonely.map(s => ({ ...s, isLonely: true })) : []),
    ...(labelFilter === 'both' || labelFilter === 'non_lonely' ? samples.non_lonely.map(s => ({ ...s, isLonely: false })) : []),
  ] : []

  const pageSize = 10
  const totalPages = Math.ceil(allSamples.length / pageSize)
  const paginatedSamples = allSamples.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Data Preprocessing Pipeline" 
        subtitle="Text normalisation, tokenisation, and linguistic feature extraction"
      />
      
      <div className="flex-1 p-6 space-y-8">
        {/* Pipeline Steps */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Pipeline Steps</h3>
          <div className="grid gap-3">
            {pipelineSteps.map((step) => (
              <Card key={step.num} className="border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-sm font-bold">
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{step.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs">{step.tool}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature Extraction Summary */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Feature Extraction Summary</h3>
          {summaryLoading ? (
            <LoadingState message="Loading summary..." />
          ) : summaryError ? (
            <ErrorState message="Failed to load preprocessing summary" />
          ) : summary ? (
            <Card className="border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant={summary.status === 'done' ? 'default' : 'secondary'} className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {summary.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">{summary.timestamp}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Train size</p>
                    <p className="font-mono text-lg">{summary.train_size.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Val size</p>
                    <p className="font-mono text-lg">{summary.val_size.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Test size</p>
                    <p className="font-mono text-lg">{summary.test_size.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Feature columns</p>
                  <div className="flex flex-wrap gap-1">
                    {summary.feature_columns.map((col) => (
                      <Badge key={col} variant="secondary" className="font-mono text-xs">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </section>

        {/* Linguistic Features Table */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Linguistic Features</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Feature</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Description</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Psycholinguistic Relevance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureDescriptions.map((f, idx) => (
                      <tr key={f.feature} className={idx < featureDescriptions.length - 1 ? 'border-b border-border' : ''}>
                        <td className="px-4 py-3 font-mono text-xs">{f.feature}</td>
                        <td className="px-4 py-3 text-muted-foreground">{f.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">{f.relevance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sample Post Explorer */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Sample Post Explorer</h3>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Split:</span>
              <Select value={split} onValueChange={setSplit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Class:</span>
              <Tabs value={labelFilter} onValueChange={(v) => setLabelFilter(v as typeof labelFilter)}>
                <TabsList>
                  <TabsTrigger value="both">Both</TabsTrigger>
                  <TabsTrigger value="lonely">Lonely</TabsTrigger>
                  <TabsTrigger value="non_lonely">Non-Lonely</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Count:</span>
              <Tabs value={String(sampleCount)} onValueChange={(v) => setSampleCount(Number(v))}>
                <TabsList>
                  <TabsTrigger value="5">5</TabsTrigger>
                  <TabsTrigger value="10">10</TabsTrigger>
                  <TabsTrigger value="20">20</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Sample Cards */}
          {samplesLoading ? (
            <LoadingState message="Loading samples..." />
          ) : samplesError ? (
            <ErrorState message="Failed to load samples" />
          ) : (
            <div className="space-y-4">
              {paginatedSamples.map((sample) => (
                <SampleCard 
                  key={sample.unique_id} 
                  sample={sample} 
                  isLonely={sample.isLonely} 
                />
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
