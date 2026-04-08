'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { PlotImage } from '@/components/shared/plot-image'
import { ModelComparisonTable } from '@/components/models/model-comparison-table'
import { RepresentationComparison } from '@/components/models/representation-comparison'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

// Mock data - would come from API
const mockResults = {
  results: [
    { representation: 'linguistic', model: 'Logistic Regression', split: 'validation', accuracy: 0.723, precision: 0.698, recall: 0.712, f1: 0.705, roc_auc: 0.782 },
    { representation: 'linguistic', model: 'Random Forest', split: 'validation', accuracy: 0.715, precision: 0.689, recall: 0.698, f1: 0.693, roc_auc: 0.771 },
    { representation: 'linguistic', model: 'SVM', split: 'validation', accuracy: 0.728, precision: 0.701, recall: 0.718, f1: 0.709, roc_auc: 0.786 },
    { representation: 'tfidf', model: 'Logistic Regression', split: 'validation', accuracy: 0.856, precision: 0.842, recall: 0.858, f1: 0.850, roc_auc: 0.921 },
    { representation: 'tfidf', model: 'Random Forest', split: 'validation', accuracy: 0.834, precision: 0.821, recall: 0.832, f1: 0.826, roc_auc: 0.898 },
    { representation: 'tfidf', model: 'SVM', split: 'validation', accuracy: 0.861, precision: 0.847, recall: 0.863, f1: 0.855, roc_auc: 0.925 },
    { representation: 'tfidf_linguistic', model: 'Logistic Regression', split: 'validation', accuracy: 0.862, precision: 0.848, recall: 0.865, f1: 0.856, roc_auc: 0.928 },
    { representation: 'tfidf_linguistic', model: 'SVM', split: 'validation', accuracy: 0.867, precision: 0.853, recall: 0.871, f1: 0.862, roc_auc: 0.932 },
    { representation: 'word2vec', model: 'Logistic Regression', split: 'validation', accuracy: 0.789, precision: 0.771, recall: 0.792, f1: 0.781, roc_auc: 0.856 },
    { representation: 'word2vec', model: 'SVM', split: 'validation', accuracy: 0.795, precision: 0.778, recall: 0.801, f1: 0.789, roc_auc: 0.862 },
    { representation: 'sbert', model: 'Logistic Regression', split: 'validation', accuracy: 0.878, precision: 0.865, recall: 0.881, f1: 0.873, roc_auc: 0.941 },
    { representation: 'sbert', model: 'SVM', split: 'validation', accuracy: 0.882, precision: 0.869, recall: 0.886, f1: 0.877, roc_auc: 0.945 },
    { representation: 'distilbert', model: 'Fine-tuned', split: 'validation', accuracy: 0.912, precision: 0.901, recall: 0.918, f1: 0.909, roc_auc: 0.967, test_accuracy: 0.918, test_precision: 0.907, test_recall: 0.925, test_f1: 0.916, test_roc_auc: 0.971 },
  ],
  best_representation: 'distilbert',
  best_model: 'Fine-tuned',
  best_f1: 0.909,
}

const mockBestPerRep = {
  representations: [
    { representation: 'linguistic', best_model: 'SVM', f1: 0.709, accuracy: 0.728, roc_auc: 0.786 },
    { representation: 'tfidf', best_model: 'SVM', f1: 0.855, accuracy: 0.861, roc_auc: 0.925 },
    { representation: 'tfidf_linguistic', best_model: 'SVM', f1: 0.862, accuracy: 0.867, roc_auc: 0.932 },
    { representation: 'word2vec', best_model: 'SVM', f1: 0.789, accuracy: 0.795, roc_auc: 0.862 },
    { representation: 'sbert', best_model: 'SVM', f1: 0.877, accuracy: 0.882, roc_auc: 0.945 },
    { representation: 'distilbert', best_model: 'Fine-tuned', f1: 0.909, accuracy: 0.912, roc_auc: 0.967 },
  ],
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

        {/* Results Table */}
        <section>
          <ModelComparisonTable
            results={mockResults.results}
            bestF1={mockResults.best_f1}
            showTestMetrics={showTestMetrics}
          />
        </section>

        {/* Best Per Representation Chart */}
        <section>
          <RepresentationComparison data={mockBestPerRep.representations} />
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
      </div>
    </div>
  )
}
