'use client'

import { useState } from 'react'
import useSWR from 'swr'
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
  plotUrl,
} from '@/lib/api'
import type {
  ClassDistribution,
  LengthStats,
  LinguisticStats,
  NGrams,
  PosDistribution,
} from '@/lib/types'

type ViewMode = 'interactive' | 'static'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://your-space.hf.space/api'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
})

export default function EDAPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('interactive')
  const [ngramType, setNgramType] = useState<'unigrams' | 'bigrams'>('unigrams')

  // Fetch real data from API
  const { data: classDistData, error: classDistError, isLoading: classDistLoading } = useSWR<ClassDistribution>(
    `${API}/eda/class_distribution`,
    fetcher
  )
  
  const { data: lengthStats, error: lengthError, isLoading: lengthLoading } = useSWR<LengthStats>(
    `${API}/eda/length_stats`,
    fetcher
  )
  
  const { data: linguisticData, error: linguisticError, isLoading: linguisticLoading } = useSWR<LinguisticStats>(
    `${API}/eda/linguistic_stats`,
    fetcher
  )
  
  const { data: ngramData, error: ngramError, isLoading: ngramLoading } = useSWR<NGrams>(
    `${API}/eda/ngrams`,
    fetcher
  )
  
  const { data: posData, error: posError, isLoading: posLoading } = useSWR<PosDistribution>(
    `${API}/eda/pos_distribution`,
    fetcher
  )

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
            {classDistLoading ? (
              <LoadingState message="Loading class distribution..." />
            ) : classDistError || !classDistData ? (
              <ErrorState message="Failed to load class distribution data" />
            ) : viewMode === 'interactive' ? (
              <ClassDistributionChart data={classDistData} />
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
            {lengthLoading ? (
              <LoadingState message="Loading text length stats..." />
            ) : lengthError || !lengthStats ? (
              <ErrorState message="Failed to load text length data" />
            ) : viewMode === 'interactive' ? (
              <LengthStatsPanel data={lengthStats} />
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
            {linguisticLoading ? (
              <LoadingState message="Loading linguistic features..." />
            ) : linguisticError || !linguisticData ? (
              <ErrorState message="Failed to load linguistic features data" />
            ) : viewMode === 'interactive' ? (
              <LinguisticFeaturesChart data={linguisticData} />
            ) : (
              <PlotImage
                section="eda"
                plotName="eda_linguistic_boxplots.png"
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
            {ngramLoading ? (
              <LoadingState message="Loading n-grams..." />
            ) : ngramError || !ngramData ? (
              <ErrorState message="Failed to load n-gram data" />
            ) : viewMode === 'interactive' ? (
              <NGramChart
                ngramData={ngramData}
                ngramType={ngramType}
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
                  <CardTitle className="text-base text-[#4C9BE8]">Non-Lonely Word Cloud</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlotImage
                    section="eda"
                    plotName="eda_wordcloud_non_lonely.png"
                    alt="Non-lonely word cloud"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-[#f43f5e]">Lonely Word Cloud</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlotImage
                    section="eda"
                    plotName="eda_wordcloud_lonely.png"
                    alt="Lonely word cloud"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* POS Distribution Tab */}
          <TabsContent value="pos" className="space-y-6">
            {posLoading ? (
              <LoadingState message="Loading POS distribution..." />
            ) : posError || !posData ? (
              <ErrorState message="Failed to load POS distribution data" />
            ) : viewMode === 'interactive' ? (
              <PosDistributionChart data={posData} />
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
