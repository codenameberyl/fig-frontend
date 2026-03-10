"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostLengthChart } from "@/components/eda/post-length-chart"
import { SentenceLengthChart } from "@/components/eda/sentence-length-chart"
import { FrequentWordsChart } from "@/components/eda/frequent-words-chart"
import { LinguisticFeaturesChart } from "@/components/eda/linguistic-features-chart"
import { SentimentDistributionChart } from "@/components/eda/sentiment-distribution-chart"
import { TFIDFInsights } from "@/components/eda/tfidf-insights"

export default function EDAPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Exploratory Data Analysis
          </h2>
          <p className="text-muted-foreground">
            Deep insights into text statistics, word patterns, and feature signals
          </p>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Text Statistics</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <PostLengthChart />
            <SentenceLengthChart />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Word Analysis</h3>
          <FrequentWordsChart />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Feature Signals</h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <LinguisticFeaturesChart />
            <SentimentDistributionChart />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">TF-IDF Insights</h3>
          <TFIDFInsights />
        </section>
      </div>
    </DashboardLayout>
  )
}
