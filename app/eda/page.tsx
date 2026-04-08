'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { PlotImage } from '@/components/shared/plot-image'
import { ClassDistributionChart } from '@/components/eda/class-distribution-chart'
import { LengthStatsPanel } from '@/components/eda/length-stats-panel'
import { LinguisticFeaturesChart } from '@/components/eda/linguistic-features-chart'
import { NGramChart } from '@/components/eda/ngram-chart'
import { PosDistributionChart } from '@/components/eda/pos-distribution-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getClassDistribution,
  getLengthStats,
  getLinguisticStats,
  getNgrams,
  getPosDistribution,
} from '@/lib/api'

type ViewMode = 'interactive' | 'static'

// Mock data for development (will be replaced by API calls)
const mockClassDistribution = {
  distribution: [
    { split: 'train', lonely: 2106, non_lonely: 2400, lonely_pct: 46.7, non_lonely_pct: 53.3 },
    { split: 'validation', lonely: 263, non_lonely: 300, lonely_pct: 46.7, non_lonely_pct: 53.3 },
    { split: 'test', lonely: 264, non_lonely: 300, lonely_pct: 46.8, non_lonely_pct: 53.2 },
  ],
}

const mockLengthStats = {
  word_count: {
    lonely: { mean: 156.3, median: 120, std: 112.5, min: 10, max: 892, q25: 72, q75: 205 },
    non_lonely: { mean: 98.7, median: 78, std: 76.2, min: 8, max: 645, q25: 48, q75: 128 },
  },
  char_count: {
    lonely: { mean: 823.4, median: 632, std: 592.1, min: 52, max: 4721, q25: 378, q75: 1082 },
    non_lonely: { mean: 519.8, median: 411, std: 401.3, min: 42, max: 3412, q25: 253, q75: 673 },
  },
  sentence_count: {
    lonely: { mean: 8.2, median: 6, std: 5.9, min: 1, max: 47, q25: 4, q75: 11 },
    non_lonely: { mean: 5.1, median: 4, std: 3.8, min: 1, max: 32, q25: 2, q75: 7 },
  },
}

const mockLinguisticFeatures = {
  features: [
    { feature: 'pronoun_ratio', lonely_mean: 0.0823, non_lonely_mean: 0.0654, lonely_std: 0.032, non_lonely_std: 0.028 },
    { feature: 'first_person_ratio', lonely_mean: 0.0612, non_lonely_mean: 0.0421, lonely_std: 0.028, non_lonely_std: 0.024 },
    { feature: 'emotion_word_ratio', lonely_mean: 0.0534, non_lonely_mean: 0.0412, lonely_std: 0.022, non_lonely_std: 0.019 },
    { feature: 'negation_ratio', lonely_mean: 0.0298, non_lonely_mean: 0.0187, lonely_std: 0.015, non_lonely_std: 0.012 },
    { feature: 'question_ratio', lonely_mean: 0.0156, non_lonely_mean: 0.0189, lonely_std: 0.012, non_lonely_std: 0.014 },
    { feature: 'exclamation_ratio', lonely_mean: 0.0089, non_lonely_mean: 0.0123, lonely_std: 0.008, non_lonely_std: 0.01 },
    { feature: 'hedge_ratio', lonely_mean: 0.0234, non_lonely_mean: 0.0178, lonely_std: 0.011, non_lonely_std: 0.009 },
    { feature: 'certainty_ratio', lonely_mean: 0.0145, non_lonely_mean: 0.0198, lonely_std: 0.009, non_lonely_std: 0.011 },
    { feature: 'social_word_ratio', lonely_mean: 0.0312, non_lonely_mean: 0.0456, lonely_std: 0.014, non_lonely_std: 0.018 },
  ],
}

const mockNgrams = {
  lonely_unigrams: [
    { term: 'feel', count: 1823 },
    { term: 'alone', count: 1456 },
    { term: 'friends', count: 1234 },
    { term: 'anyone', count: 1089 },
    { term: 'talk', count: 987 },
    { term: 'time', count: 876 },
    { term: 'people', count: 823 },
    { term: 'life', count: 789 },
    { term: 'want', count: 756 },
    { term: 'know', count: 723 },
  ],
  non_lonely_unigrams: [
    { term: 'today', count: 1567 },
    { term: 'great', count: 1345 },
    { term: 'friends', count: 1234 },
    { term: 'love', count: 1123 },
    { term: 'happy', count: 1045 },
    { term: 'work', count: 967 },
    { term: 'good', count: 912 },
    { term: 'time', count: 856 },
    { term: 'life', count: 789 },
    { term: 'new', count: 745 },
  ],
  lonely_bigrams: [
    { term: 'feel like', count: 523 },
    { term: 'anyone to', count: 412 },
    { term: 'talk to', count: 389 },
    { term: 'no one', count: 356 },
    { term: 'so alone', count: 323 },
  ],
  non_lonely_bigrams: [
    { term: 'so happy', count: 456 },
    { term: 'great day', count: 398 },
    { term: 'best friends', count: 367 },
    { term: 'love it', count: 334 },
    { term: 'had fun', count: 312 },
  ],
}

const mockPosDistribution = {
  distribution: [
    { pos: 'NOUN', lonely: 0.182, non_lonely: 0.195 },
    { pos: 'VERB', lonely: 0.156, non_lonely: 0.148 },
    { pos: 'PRON', lonely: 0.089, non_lonely: 0.072 },
    { pos: 'ADJ', lonely: 0.067, non_lonely: 0.078 },
    { pos: 'ADV', lonely: 0.054, non_lonely: 0.048 },
    { pos: 'ADP', lonely: 0.098, non_lonely: 0.102 },
    { pos: 'DET', lonely: 0.078, non_lonely: 0.082 },
    { pos: 'CONJ', lonely: 0.045, non_lonely: 0.042 },
    { pos: 'PUNCT', lonely: 0.112, non_lonely: 0.118 },
  ],
}

export default function EDAPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('interactive')
  const [ngramType, setNgramType] = useState<'unigrams' | 'bigrams'>('unigrams')

  // Use mock data for now - in production these would be SWR calls
  const classDistData = mockClassDistribution
  const lengthStats = mockLengthStats
  const linguisticData = mockLinguisticFeatures
  const ngramData = mockNgrams
  const posData = mockPosDistribution

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Exploratory Data Analysis"
        subtitle="RQ1: Linguistic and structural characteristics of loneliness self-disclosure"
      />

      <div className="flex-1 p-6">
        <Tabs defaultValue="class-distribution" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="class-distribution"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Class Distribution
            </TabsTrigger>
            <TabsTrigger
              value="text-length"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Text Length
            </TabsTrigger>
            <TabsTrigger
              value="linguistic"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Linguistic Features
            </TabsTrigger>
            <TabsTrigger
              value="ngrams"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              N-Grams
            </TabsTrigger>
            <TabsTrigger
              value="wordclouds"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Word Clouds
            </TabsTrigger>
            <TabsTrigger
              value="pos"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              POS Distribution
            </TabsTrigger>
          </TabsList>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'interactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('interactive')}
            >
              Interactive
            </Button>
            <Button
              variant={viewMode === 'static' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('static')}
            >
              Static Plot
            </Button>
          </div>

          {/* Class Distribution Tab */}
          <TabsContent value="class-distribution" className="space-y-6">
            {viewMode === 'interactive' ? (
              <ClassDistributionChart data={classDistData.distribution} />
            ) : (
              <PlotImage
                section="eda"
                plotName="eda_class_distribution.png"
                alt="Class distribution plot"
              />
            )}
          </TabsContent>

          {/* Text Length Tab */}
          <TabsContent value="text-length" className="space-y-6">
            {viewMode === 'interactive' ? (
              <LengthStatsPanel
                wordCount={lengthStats.word_count}
                charCount={lengthStats.char_count}
                sentenceCount={lengthStats.sentence_count}
              />
            ) : (
              <PlotImage
                section="eda"
                plotName="eda_length_distribution.png"
                alt="Text length distribution plot"
              />
            )}
          </TabsContent>

          {/* Linguistic Features Tab */}
          <TabsContent value="linguistic" className="space-y-6">
            {viewMode === 'interactive' ? (
              <LinguisticFeaturesChart data={linguisticData.features} />
            ) : (
              <PlotImage
                section="eda"
                plotName="eda_linguistic_boxplot.png"
                alt="Linguistic features boxplot"
              />
            )}
          </TabsContent>

          {/* N-Grams Tab */}
          <TabsContent value="ngrams" className="space-y-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant={ngramType === 'unigrams' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNgramType('unigrams')}
              >
                Unigrams
              </Button>
              <Button
                variant={ngramType === 'bigrams' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNgramType('bigrams')}
              >
                Bigrams
              </Button>
            </div>
            {viewMode === 'interactive' ? (
              <NGramChart
                lonelyData={ngramType === 'unigrams' ? ngramData.lonely_unigrams : ngramData.lonely_bigrams}
                nonLonelyData={ngramType === 'unigrams' ? ngramData.non_lonely_unigrams : ngramData.non_lonely_bigrams}
                title={ngramType === 'unigrams' ? 'Top 20 Unigrams' : 'Top 20 Bigrams'}
              />
            ) : (
              <PlotImage
                section="eda"
                plotName={`eda_${ngramType}.png`}
                alt={`${ngramType} frequency plot`}
              />
            )}
          </TabsContent>

          {/* Word Clouds Tab */}
          <TabsContent value="wordclouds" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-[oklch(0.65_0.18_250)]">Non-Lonely Word Cloud</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlotImage
                    section="eda"
                    plotName="eda_wordcloud_non_lonely.png"
                    alt="Non-lonely word cloud"
                    height={400}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-[oklch(0.65_0.2_15)]">Lonely Word Cloud</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlotImage
                    section="eda"
                    plotName="eda_wordcloud_lonely.png"
                    alt="Lonely word cloud"
                    height={400}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* POS Distribution Tab */}
          <TabsContent value="pos" className="space-y-6">
            {viewMode === 'interactive' ? (
              <PosDistributionChart data={posData.distribution} />
            ) : (
              <PlotImage
                section="eda"
                plotName="eda_pos_distribution.png"
                alt="POS distribution plot"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
