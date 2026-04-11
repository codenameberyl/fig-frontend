"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3, Brain, Database, Sliders, AlertTriangle,
  MessageSquare, CheckCircle2, Clock, ArrowRight, Trophy,
  Layers, BookOpen
} from "lucide-react"
import { getStatus, getDatasetSummary, getModelResults } from "@/lib/api"
import type { StatusResponse, DatasetSummary, ModelResultsResponse } from "@/lib/types"
import { PIPELINE_STEP_LABELS, repLabel, modelLabel, fmt, fmtCount, relativeTime } from "@/lib/utils"
import {
  MetricCard, MetricCardSkeleton, PageHeader,
  SectionCard, EmptyState, RepresentationBadge, Callout,
} from "@/components/shared"

const PIPELINE_STEPS = [
  "load_dataset", "preprocess", "eda", "build_features",
  "train_models", "evaluation", "error_analysis", "interpretability"
]

const RQ_CARDS = [
  {
    rq: "RQ1", label: "Linguistic Characteristics",
    desc: "What linguistic and structural characteristics differentiate lonely vs non-lonely Reddit posts?",
    href: "/eda", icon: BarChart3, color: "#06b6d4",
  },
  {
    rq: "RQ2", label: "Baseline Performance",
    desc: "How well can baseline structural text classification models detect loneliness self-disclosure?",
    href: "/models", icon: Layers, color: "#7c3aed",
  },
  {
    rq: "RQ3", label: "Representation Impact",
    desc: "How do different text representations affect predictive performance for loneliness detection?",
    href: "/models", icon: Database, color: "#f59e0b",
  },
  {
    rq: "RQ4", label: "Performance vs Interpretability",
    desc: "What trade-offs exist between predictive performance and interpretability across representations?",
    href: "/interpretability", icon: Sliders, color: "#10b981",
  },
]

export default function OverviewPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [dataset, setDataset] = useState<DatasetSummary | null>(null)
  const [models, setModels] = useState<ModelResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getStatus(),
      getDatasetSummary(),
      getModelResults(),
    ]).then(([s, d, m]) => {
      if (s.status === "fulfilled") setStatus(s.value)
      if (d.status === "fulfilled") setDataset(d.value)
      if (m.status === "fulfilled") setModels(m.value)
      setLoading(false)
    })
  }, [])

  const completed = new Set(status?.completed_steps ?? [])
  const hasData = status?.results_available ?? false

  const totalLonely = dataset
    ? Object.values(dataset.splits).reduce((a, s) => a + s.n_lonely, 0)
    : null
  const totalNonLonely = dataset
    ? Object.values(dataset.splits).reduce((a, s) => a + s.n_non_lonely, 0)
    : null

  const bestTestF1 = models?.results
    ? Math.max(...models.results.map(r => r.test_f1 ?? 0))
    : null
  const bestResult = models?.results?.find(r => (r.test_f1 ?? 0) === bestTestF1)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-violet-400 text-xs font-mono mb-4">
          <Brain className="h-3 w-3" />
          MSc NLP Research Project
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight max-w-3xl leading-tight">
          Detecting Loneliness Self-Disclosure<br />
          <span className="text-violet-400">in Reddit Posts</span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
          An empirical evaluation of text representations and classification models using the
          FIG-Loneliness dataset — 5,633 annotated Reddit posts from r/loneliness, r/lonely,
          r/youngadults, and r/college (2018–2020).
        </p>
        <div className="flex items-center gap-3 mt-5">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Try Live Demo
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#1e1e2e] hover:border-[#2e2e3e] text-slate-300 text-sm font-medium rounded-lg transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Read Docs
          </Link>
        </div>
      </div>

      {/* Pipeline Status */}
      <SectionCard title="Pipeline Status" className="mb-6">
        {loading ? (
          <div className="flex gap-2 flex-wrap">
            {PIPELINE_STEPS.map(s => (
              <div key={s} className="h-8 w-28 bg-[#1e1e2e] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !hasData ? (
          <Callout type="warning">
            Pipeline results not yet available. Run run_pipeline.py on Google Colab, then upload results/ to HuggingFace Spaces.
          </Callout>
        ) : (
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STEPS.map(step => {
              const done = completed.has(step)
              const ts = status?.pipeline_state?.[step]?.timestamp
              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                    done
                      ? "bg-emerald-600/10 border-emerald-600/20 text-emerald-400"
                      : "bg-[#111118] border-[#1e1e2e] text-slate-600"
                  }`}
                >
                  {done
                    ? <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                    : <Clock className="h-3 w-3 flex-shrink-0" />
                  }
                  <span className="font-mono">{PIPELINE_STEP_LABELS[step] ?? step}</span>
                  {done && ts && (
                    <span className="text-emerald-600 hidden sm:inline">{relativeTime(ts)}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Reddit Posts"
              value={dataset ? fmtCount(dataset.total_samples) : "—"}
              sub="FIG-Loneliness dataset"
              accentColor="#7c3aed"
            />
            <MetricCard
              label="Lonely Posts"
              value={totalLonely ? fmtCount(totalLonely) : "—"}
              sub="self-disclosure detected"
              accentColor="#f43f5e"
            />
            <MetricCard
              label="Non-Lonely Posts"
              value={totalNonLonely ? fmtCount(totalNonLonely) : "—"}
              sub="control posts"
              accentColor="#4C9BE8"
            />
            <MetricCard
              label="Best Test F1"
              value={bestTestF1 ? fmt(bestTestF1, 3) : "—"}
              sub={bestResult ? `${repLabel(bestResult.representation)} · ${modelLabel(bestResult.model)}` : "run pipeline"}
              accentColor="#10b981"
            />
          </>
        )}
      </div>

      {/* Research Questions */}
      <SectionCard title="Research Questions" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RQ_CARDS.map(({ rq, label, desc, href, icon: Icon, color }) => (
            <Link
              key={rq}
              href={href}
              className="group flex gap-4 p-4 rounded-xl border border-[#1e1e2e] hover:border-[#2e2e3e] hover:bg-white/2 transition-all"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color }}>{rq}</span>
                  <span className="text-xs font-medium text-white">{label}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* Dataset table */}
      <SectionCard title="Dataset Splits" description="FIG-Loneliness · Reddit · 2018–2020 · CC BY-NC 4.0">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-[#1e1e2e] rounded animate-pulse" />)}
          </div>
        ) : dataset ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  {["Split", "Total", "Lonely", "Non-Lonely", "Lonely %", "Columns"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-slate-500 font-mono font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["train", "validation", "test"] as const).map((split, i) => {
                  const s = dataset.splits[split]
                  const pct = ((s.n_lonely / s.n_samples) * 100).toFixed(1)
                  return (
                    <tr key={split} className={`border-b border-[#1e1e2e] ${i === 2 ? "border-0" : ""}`}>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs px-2 py-0.5 bg-[#1e1e2e] rounded text-violet-400 capitalize">{split}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-sm text-white">{fmtCount(s.n_samples)}</td>
                      <td className="py-3 px-3 font-mono text-sm text-rose-400">{fmtCount(s.n_lonely)}</td>
                      <td className="py-3 px-3 font-mono text-sm text-blue-400">{fmtCount(s.n_non_lonely)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-[#1e1e2e] rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono text-xs text-slate-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">{s.columns.length} cols</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {[
          { href: "/preprocessing", label: "Preprocessing", icon: Database, desc: "Pipeline steps & sample explorer" },
          { href: "/eda", label: "Exploratory Analysis", icon: BarChart3, desc: "N-grams, POS, linguistic features" },
          { href: "/models", label: "Model Comparison", icon: Trophy, desc: "15 experiments across 5 representations" },
          { href: "/interpretability", label: "Interpretability", icon: Sliders, desc: "LR coefficients & attention weights" },
          { href: "/error-analysis", label: "Error Analysis", icon: AlertTriangle, desc: "FP/FN inspection & patterns" },
          { href: "/demo", label: "Live Demo", icon: MessageSquare, desc: "Single & batch inference" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-3 p-4 rounded-xl border border-[#1e1e2e] hover:border-violet-600/30 hover:bg-violet-600/5 transition-all group"
          >
            <Icon className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
