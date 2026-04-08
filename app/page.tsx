import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock, BarChart3, GitCompare, Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getStatus, getDatasetSummary, getModelResults } from '@/lib/api'
import { ErrorState } from '@/components/shared/error-state'

const pipelineSteps = [
  { name: 'Load Dataset', key: 'load_dataset' },
  { name: 'Preprocess', key: 'preprocess' },
  { name: 'EDA', key: 'eda' },
  { name: 'Build Features', key: 'build_features' },
  { name: 'Train Models', key: 'train_models' },
  { name: 'Evaluation', key: 'evaluation' },
  { name: 'Error Analysis', key: 'error_analysis' },
  { name: 'Interpretability', key: 'interpretability' },
]

const researchQuestions = [
  {
    id: 'RQ1',
    question: 'What linguistic and structural characteristics differentiate lonely vs non-lonely posts?',
    href: '/eda',
    icon: BarChart3,
  },
  {
    id: 'RQ2',
    question: 'How well can baseline structural text classification models detect loneliness self-disclosure?',
    href: '/models',
    icon: GitCompare,
  },
  {
    id: 'RQ3',
    question: 'How do text representations affect predictive performance?',
    href: '/models',
    icon: GitCompare,
  },
  {
    id: 'RQ4',
    question: 'What trade-offs exist between performance and interpretability?',
    href: '/interpretability',
    icon: Lightbulb,
  },
]

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

export default async function OverviewPage() {
  let status, dataset, modelResults
  let error: string | null = null

  try {
    ;[status, dataset, modelResults] = await Promise.all([
      getStatus(),
      getDatasetSummary(),
      getModelResults(),
    ])
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch data'
  }

  if (error || !status || !dataset || !modelResults) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader 
          title="FIG-Loneliness Dashboard" 
          subtitle="Research dashboard for loneliness detection in Reddit posts"
        />
        <div className="flex-1 p-6">
          <ErrorState message={error || 'Failed to load data'} />
        </div>
      </div>
    )
  }

  const { splits, total_samples } = dataset
  const totalLonely = splits.train.n_lonely + splits.validation.n_lonely + splits.test.n_lonely
  const totalNonLonely = splits.train.n_non_lonely + splits.validation.n_non_lonely + splits.test.n_non_lonely

  // Find the best model by test F1
  const bestResult = modelResults.results.reduce((best, curr) => {
    const currF1 = curr.test_f1 ?? curr.f1 ?? 0
    const bestF1 = best.test_f1 ?? best.f1 ?? 0
    return currF1 > bestF1 ? curr : best
  }, modelResults.results[0])

  const bestF1 = bestResult?.test_f1 ?? bestResult?.f1 ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="FIG-Loneliness Dashboard" 
        subtitle="Research dashboard for loneliness detection in Reddit posts"
      />
      
      <div className="flex-1 p-6 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground text-balance">
              Detecting Loneliness Self-Disclosure in Reddit Posts
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              An empirical evaluation of text representations and classification models using the FIG-Loneliness dataset
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This dashboard provides interactive visualizations of the NLP pipeline, model comparisons, and a live inference demo for detecting loneliness in social media text.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/demo">
                  Try Live Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs">Read Docs</Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </section>

        {/* Pipeline Status */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Pipeline Status</h3>
          <div className="flex flex-wrap gap-2">
            {pipelineSteps.map((step) => {
              const isComplete = status.completed_steps.includes(step.key)
              const stepState = status.pipeline_state[step.key]
              const timestamp = stepState?.timestamp
              
              return (
                <Badge
                  key={step.key}
                  variant={isComplete ? 'default' : 'secondary'}
                  className="gap-1.5 px-3 py-1.5"
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {step.name}
                  {isComplete && timestamp && (
                    <span className="text-xs opacity-70 ml-1">
                      {formatRelativeTime(timestamp)}
                    </span>
                  )}
                </Badge>
              )
            })}
          </div>
        </section>

        {/* Stats Row */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Dataset Overview</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Posts"
              value={total_samples.toLocaleString()}
              accentColor="violet"
            />
            <MetricCard
              label="Lonely Posts"
              value={totalLonely.toLocaleString()}
              delta={`${((totalLonely / total_samples) * 100).toFixed(1)}% of dataset`}
              accentColor="rose"
            />
            <MetricCard
              label="Non-Lonely Posts"
              value={totalNonLonely.toLocaleString()}
              delta={`${((totalNonLonely / total_samples) * 100).toFixed(1)}% of dataset`}
              accentColor="blue"
            />
            <MetricCard
              label="Best Test F1"
              value={bestF1.toFixed(3)}
              delta={`${bestResult?.representation} / ${bestResult?.model}`}
              accentColor="cyan"
            />
          </div>
        </section>

        {/* Research Questions */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Research Questions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {researchQuestions.map((rq) => (
              <Link key={rq.id} href={rq.href}>
                <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <rq.icon className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="font-mono text-xs">
                        {rq.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground text-pretty">{rq.question}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Dataset Summary Table */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Dataset Splits</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Split</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Total</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Lonely</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Non-Lonely</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-3">Lonely %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['train', 'validation', 'test'] as const).map((splitKey, idx, arr) => {
                      const split = splits[splitKey]
                      const lonelyPct = ((split.n_lonely / split.n_samples) * 100).toFixed(2)
                      return (
                        <tr key={splitKey} className={idx < arr.length - 1 ? 'border-b border-border' : ''}>
                          <td className="px-4 py-3 font-medium capitalize">{splitKey}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{split.n_samples.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-[#f43f5e]">{split.n_lonely.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-[#4C9BE8]">{split.n_non_lonely.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{lonelyPct}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
