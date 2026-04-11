"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { getErrorSummary, getErrorDetail, getErrorKeys, plotUrl } from "@/lib/api"
import type { ErrorAnalysisSummary, ErrorAnalysisDetail, ErrorExample } from "@/lib/types"
import { TOOLTIP_STYLE, LONELY_COLOR, NON_LONELY_COLOR, repLabel, modelLabel, fmt } from "@/lib/utils"
import {
  PageHeader, SectionCard, PlotImage, EmptyState,
  SkeletonCard, MetricCard, MetricCardSkeleton, RepresentationBadge, Callout,
} from "@/components/shared"
import { Lightbulb, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"

function ErrorExampleCard({ ex }: { ex: ErrorExample }) {
  const [expanded, setExpanded] = useState(false)
  const isFP = ex.outcome === "FP"
  const color = isFP ? "rose" : "amber"
  const label = isFP
    ? "True: Non-Lonely → Predicted: Lonely"
    : "True: Lonely → Predicted: Non-Lonely"

  const ratioFeats = [
    { k: "pronoun_ratio", label: "Pronoun" },
    { k: "negation_ratio", label: "Negation" },
    { k: "social_word_ratio", label: "Social" },
    { k: "emotion_word_ratio", label: "Emotion" },
    { k: "type_token_ratio", label: "TTR" },
  ]

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isFP ? "border-rose-600/20" : "border-amber-600/20"
    }`}>
      <div className={`px-4 py-2.5 flex items-center justify-between ${
        isFP ? "bg-rose-600/5" : "bg-amber-600/5"
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isFP
              ? "bg-rose-600/10 border-rose-600/20 text-rose-400"
              : "bg-amber-600/10 border-amber-600/20 text-amber-400"
          }`}>
            {isFP ? "FP" : "FN"}
          </span>
          <span className="text-xs text-slate-500">{label}</span>
          <span className="text-[10px] font-mono text-slate-700">{ex.unique_id}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-600">{ex.word_count} words</span>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-600 hover:text-slate-400">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          {expanded ? ex.original_text : ex.original_text.slice(0, 280) + (ex.original_text.length > 280 ? "…" : "")}
        </p>
        {ex.original_text.length > 280 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors">
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="px-4 pb-4 border-t border-[#1e1e2e] pt-3">
        <div className="flex gap-3 flex-wrap">
          {ratioFeats.map(({ k, label }) => {
            const v = ex.features[k as keyof typeof ex.features] as number
            const pct = Math.min(100, v * 500)
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-600 font-mono w-14">{label}</span>
                <div className="h-1.5 w-20 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFP ? "bg-rose-500" : "bg-amber-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500">{fmt(v, 3)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 5

export default function ErrorAnalysisPage() {
  const [summary, setSummary] = useState<ErrorAnalysisSummary | null>(null)
  const [keys, setKeys] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState("")
  const [detail, setDetail] = useState<ErrorAnalysisDetail | null>(null)
  const [bucket, setBucket] = useState<"fp" | "fn">("fp")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    Promise.allSettled([getErrorSummary(), getErrorKeys()]).then(([s, k]) => {
      if (s.status === "fulfilled") setSummary(s.value)
      if (k.status === "fulfilled") {
        setKeys(k.value.keys)
        if (k.value.keys.length) setSelectedKey(k.value.keys[0])
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedKey) return
    setDetailLoading(true)
    setPage(0)
    getErrorDetail(selectedKey)
      .then(setDetail)
      .finally(() => setDetailLoading(false))
  }, [selectedKey])

  const bestSummary = summary?.model_summaries.find(
    s => `${s.representation}_${s.model}` === summary?.best_model_key
  )

  const barData = summary?.model_summaries.map(s => ({
    name: `${repLabel(s.representation)}/${modelLabel(s.model)}`,
    FP: s.FP,
    FN: s.FN,
    "Error Rate": parseFloat((s.error_rate * 100).toFixed(1)),
  })) ?? []

  const examples: ErrorExample[] = detail
    ? (bucket === "fp" ? detail.false_positives : detail.false_negatives)
    : []
  const pageItems = examples.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(examples.length / ITEMS_PER_PAGE)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Error Analysis"
        subtitle="Qualitative inspection of model misclassifications on the held-out test set"
        badge="Error Analysis"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /></>
        ) : bestSummary ? (
          <>
            <MetricCard label="Total Test Posts" value={bestSummary.total_test.toLocaleString()} accentColor="#7c3aed" />
            <MetricCard label="False Positives" value={bestSummary.FP} sub="Non-lonely predicted as lonely" accentColor="#f43f5e" />
            <MetricCard label="False Negatives" value={bestSummary.FN} sub="Lonely predicted as non-lonely" accentColor="#f59e0b" />
            <MetricCard label="Error Rate" value={`${(bestSummary.error_rate * 100).toFixed(1)}%`} sub={`Best model: ${summary?.best_model_key ?? "—"}`} accentColor="#06b6d4" />
          </>
        ) : null}
      </div>

      {/* FP/FN chart */}
      <SectionCard title="FP and FN Counts per Model" className="mb-6">
        {loading ? <SkeletonCard /> : barData.length === 0 ? <EmptyState /> : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} angle={-30} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 11 }} />
                <Bar dataKey="FP" name="False Positives" fill={LONELY_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="FN" name="False Negatives" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <PlotImage src={plotUrl("models", "error_analysis_fp_fn_counts.png")} alt="FP/FN counts" caption="error_analysis_fp_fn_counts.png" className="mt-4" />
      </SectionCard>

      {/* Qualitative observations */}
      {summary?.qualitative_patterns?.observations?.length > 0 && summary?.qualitative_patterns && (
        <SectionCard title="Qualitative Patterns" description={`Analysed ${summary.qualitative_patterns.n_fp_analysed} FPs and ${summary.qualitative_patterns.n_fn_analysed} FNs`} className="mb-6">
          <div className="space-y-3">
            {summary.qualitative_patterns.observations?.map((obs, i) => (
              <div key={i} className="flex gap-3 p-4 bg-[#0a0a0f] border-l-2 border-violet-600/40 rounded-r-xl">
                <Lightbulb className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">{obs}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Linguistic comparison plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PlotImage src={plotUrl("models", "error_analysis_linguistic_fp_vs_fn.png")} alt="FP vs FN features" caption="error_analysis_linguistic_fp_vs_fn.png" />
        <PlotImage src={plotUrl("models", "error_analysis_length_by_error_type.png")} alt="Length by error type" caption="error_analysis_length_by_error_type.png" />
      </div>

      {/* Confusion overlap */}
      {summary?.confusion_overlap?.top_confused_posts?.length > 0 && summary?.confusion_overlap && (
        <SectionCard title="Most Confused Posts" description="Posts misclassified by the most models — likely the hardest examples" className="mb-6">
          <PlotImage src={plotUrl("models", "error_analysis_confusion_overlap.png")} alt="Confusion overlap" caption="error_analysis_confusion_overlap.png" className="mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Post ID</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Models Wrong</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Which Models</th>
                </tr>
              </thead>
              <tbody>
                {summary.confusion_overlap.top_confused_posts?.slice(0, 10).map(post => (
                  <tr key={post.unique_id} className="border-b border-[#1e1e2e]/50">
                    <td className="py-2 px-3 font-mono text-slate-400">{post.unique_id}</td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold text-rose-400">{post.n_models_wrong}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{post.models.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Example browser */}
      <SectionCard title="FP / FN Example Browser" description="Browse individual misclassified posts with full feature values">
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[#1e1e2e]">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Model</label>
            <select
              value={selectedKey}
              onChange={e => setSelectedKey(e.target.value)}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-600/50"
            >
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Error Type</label>
            <div className="flex gap-1">
              {(["fp", "fn"] as const).map(b => (
                <button
                  key={b}
                  onClick={() => { setBucket(b); setPage(0) }}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    bucket === b
                      ? b === "fp"
                        ? "bg-rose-600/20 border-rose-600/30 text-rose-300"
                        : "bg-amber-600/20 border-amber-600/30 text-amber-300"
                      : "border-[#1e1e2e] text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {b === "fp" ? "False Positives" : "False Negatives"} ({detail ? (b === "fp" ? detail.false_positives.length : detail.false_negatives.length) : "?"})
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto text-xs font-mono text-slate-600">
            {examples.length} examples · page {page + 1}/{totalPages || 1}
          </div>
        </div>

        {detailLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
        ) : examples.length === 0 ? (
          <EmptyState message="No examples available for this model/split combination." />
        ) : (
          <>
            <div className="space-y-3">
              {pageItems.map(ex => <ErrorExampleCard key={ex.unique_id + ex.outcome} ex={ex} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30">
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <span className="text-xs font-mono text-slate-600">{page + 1}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30">
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  )
}
