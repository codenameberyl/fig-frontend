'use client'

import { useState, useEffect, Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { PlotImage } from '@/components/shared/plot-image'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'
import { ModelComparisonTable } from '@/components/models/model-comparison-table'
import { RepresentationComparison } from '@/components/models/representation-comparison'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getModelResults, getBestPerRepresentation } from '@/lib/api'
import type { ModelResult } from '@/lib/types'

const representationCards = [
  {
    name: 'Linguistic Only',
    description: '13 handcrafted features, fully interpretable',
    type: 'Sparse',
    method: 'Classical',
  },
  {
    name: 'TF-IDF',
    description: 'Sparse bag-of-words, 15k n-gram features',
    type: 'Sparse',
    method: 'Classical',
  },
  {
    name: 'TF-IDF + Linguistic',
    description: 'Combined sparse + structured features',
    type: 'Sparse',
    method: 'Classical',
  },
  {
    name: 'Word2Vec',
    description: 'Averaged token embeddings, 200-d dense',
    type: 'Dense',
    method: 'Classical',
  },
  {
    name: 'Sentence-BERT',
    description: 'Contextual sentence embeddings, 384-d',
    type: 'Dense',
    method: 'Neural',
  },
  {
    name: 'DistilBERT',
    description: 'Fine-tuned transformer, end-to-end',
    type: 'Dense',
    method: 'Neural',
  },
]

function ModelsContent({ showTestMetrics }: { showTestMetrics: boolean }) {
  const [results, setResults] = useState<ModelResult[] | null>(null)
  const [bestPerRep, setBestPerRep] = useState<ModelResult[] | null>(null)
  const [bestF1, setBestF1] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [modelResults, bestResults] = await Promise.all([
          getModelResults(),
          getBestPerRepresentation(),
        ])
        setResults(modelResults.results)
        setBestPerRep(bestResults)
        setBestF1(modelResults.best_f1)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch model results')
        setResults(null)
        setBestPerRep(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return <ErrorState message={error} />
  }

  if (loading || !results || !bestPerRep || bestF1 === null) {
    return <LoadingState message="Loading model results..." />
  }

  return (
    <>
      {/* Representation Explanation Cards */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Text Representations
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {representationCards.map((rep) => (
            <Card key={rep.name} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{rep.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant="outline"
                      className={
                        rep.type === 'Dense'
                          ? 'border-primary/50 text-primary'
                          : ''
                      }
                    >
                      {rep.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        rep.method === 'Neural'
                          ? 'border-[oklch(0.7_0.15_195)]/50 text-[oklch(0.7_0.15_195)]'
                          : ''
                      }
                    >
                      {rep.method}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{rep.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Results Table */}
      <section>
        <ModelComparisonTable
          results={results}
          bestF1={bestF1}
          showTestMetrics={showTestMetrics}
        />
      </section>

      {/* Best Per Representation Chart */}
      <section>
        <RepresentationComparison data={bestPerRep} />
      </section>

      {/* Static Comparison Plots */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Static Comparison Plots
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <PlotImage
            section="models"
            plotName="eval_representation_comparison.png"
            alt="Representation comparison plot"
          />
          <PlotImage
            section="models"
            plotName="eval_model_comparison.png"
            alt="Model comparison plot"
          />
        </div>
      </section>
    </>
  )
}

export default function ModelsPage() {
  const [showTestMetrics, setShowTestMetrics] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Model Comparison"
        subtitle="RQ2 & RQ3: Predictive performance across representations and classifiers"
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Metrics Toggle */}
        <section>
          <div className="flex gap-2">
            <Button
              variant={!showTestMetrics ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTestMetrics(false)}
            >
              Validation Metrics
            </Button>
            <Button
              variant={showTestMetrics ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTestMetrics(true)}
            >
              Test Metrics
            </Button>
          </div>
        </section>

        <Suspense fallback={<LoadingState message="Loading model results..." />}>
          <ModelsContent showTestMetrics={showTestMetrics} />
        </Suspense>
      </div>
    </div>
  )
}
